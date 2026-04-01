import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Conversation, Message } from '../types';
import { encryptMessage, decryptMessage } from './cryptoService';

// Subscribe to user's conversations
export function subscribeToConversations(
  uid: string,
  onUpdate: (convos: Conversation[]) => void,
) {
  const q = query(
    collection(db, 'conversations'),
    where('participantUids', 'array-contains', uid),
    orderBy('updatedAt', 'desc'),
  );

  return onSnapshot(q, (snapshot) => {
    const convos: Conversation[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Conversation[];
    onUpdate(convos);
  });
}

// Subscribe to messages in a conversation
export function subscribeToMessages(
  conversationId: string,
  onUpdate: (messages: Message[]) => void,
  messageLimit = 50,
) {
  const q = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy('createdAt', 'desc'),
    limit(messageLimit),
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((d) => ({
      id: d.id,
      conversationId,
      ...d.data(),
    })) as Message[];
    onUpdate(messages.reverse());
  });
}

// Find or create a direct conversation
export async function getOrCreateDirectConversation(
  currentUid: string,
  currentName: string,
  currentAvatar: string | null,
  targetUid: string,
  targetName: string,
  targetAvatar: string | null,
): Promise<string> {
  // Check if conversation already exists
  const sortedUids = [currentUid, targetUid].sort();
  const q = query(
    collection(db, 'conversations'),
    where('type', '==', 'direct'),
    where('participantUids', '==', sortedUids),
  );

  const existing = await getDocs(q);
  if (!existing.empty) {
    return existing.docs[0].id;
  }

  // Create new conversation
  const convoRef = doc(collection(db, 'conversations'));
  await setDoc(convoRef, {
    type: 'direct',
    participantUids: sortedUids,
    participants: {
      [currentUid]: {
        displayName: currentName,
        avatarUrl: currentAvatar,
        role: 'member',
        joinedAt: serverTimestamp(),
      },
      [targetUid]: {
        displayName: targetName,
        avatarUrl: targetAvatar,
        role: 'member',
        joinedAt: serverTimestamp(),
      },
    },
    groupName: null,
    groupAvatarUrl: null,
    createdBy: currentUid,
    lastMessage: null,
    unreadCount: { [currentUid]: 0, [targetUid]: 0 },
    typing: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return convoRef.id;
}

// Create a group conversation
export async function createGroupConversation(
  creatorUid: string,
  creatorName: string,
  creatorAvatar: string | null,
  members: { uid: string; displayName: string; avatarUrl: string | null }[],
  groupName: string,
): Promise<string> {
  const allUids = [creatorUid, ...members.map((m) => m.uid)].sort();

  const participants: Record<string, any> = {
    [creatorUid]: {
      displayName: creatorName,
      avatarUrl: creatorAvatar,
      role: 'admin',
      joinedAt: serverTimestamp(),
    },
  };
  const unreadCount: Record<string, number> = { [creatorUid]: 0 };

  for (const m of members) {
    participants[m.uid] = {
      displayName: m.displayName,
      avatarUrl: m.avatarUrl,
      role: 'member',
      joinedAt: serverTimestamp(),
    };
    unreadCount[m.uid] = 0;
  }

  const convoRef = doc(collection(db, 'conversations'));
  await setDoc(convoRef, {
    type: 'group',
    participantUids: allUids,
    participants,
    groupName,
    groupAvatarUrl: null,
    createdBy: creatorUid,
    lastMessage: null,
    unreadCount,
    typing: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return convoRef.id;
}

// Send a message (encrypted for direct chats)
// Uses shared secret: both sender and recipient derive the same key via DH
// Single ciphertext — both parties can decrypt
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  mentions: any[] = [],
  recipientUid?: string,
): Promise<string> {
  const msgData: Record<string, any> = {
    senderId,
    senderName,
    type: 'text',
    text,
    encrypted: false,
    ciphertext: null,
    otherUid: recipientUid || null, // stored so either party knows who to derive shared secret with
    mediaUrl: null,
    mediaType: null,
    fileName: null,
    fileSize: null,
    thumbnailUrl: null,
    mentions,
    deliveryStatus: {},
    aggregateStatus: 'sent',
    createdAt: serverTimestamp(),
    editedAt: null,
    isDeleted: false,
  };

  // Encrypt for direct chats
  if (recipientUid) {
    try {
      const encrypted = await encryptMessage(text, recipientUid);
      if (encrypted) {
        msgData.encrypted = true;
        msgData.ciphertext = encrypted;
        msgData.text = null; // Server never stores plaintext
      }
    } catch {
      // Fall back to plaintext
    }
  }

  const msgRef = await addDoc(
    collection(db, `conversations/${conversationId}/messages`),
    msgData,
  );

  return msgRef.id;
}

// Decrypt messages using shared secret
// Both sender and recipient derive the same shared secret via DH
export async function decryptMessages(
  messages: Message[],
  currentUid: string,
): Promise<Message[]> {
  const result: Message[] = [];

  for (const msg of messages) {
    const raw = msg as any;

    if (raw.encrypted && raw.ciphertext) {
      // Figure out who the "other" person is for DH
      const otherUid = raw.senderId === currentUid ? raw.otherUid : raw.senderId;

      if (otherUid) {
        try {
          const plaintext = await decryptMessage(raw.ciphertext, otherUid);
          if (plaintext) {
            result.push({ ...msg, text: plaintext });
            continue;
          }
        } catch {}
      }

      result.push({ ...msg, text: '[Decryption failed]' });
      continue;
    }

    result.push(msg);
  }

  return result;
}

// Mark messages as read / reset unread + update delivery statuses
export async function markConversationRead(
  conversationId: string,
  uid: string,
): Promise<void> {
  // Reset unread counter
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`unreadCount.${uid}`]: 0,
  });

  // Mark unread messages as "read" in delivery status
  const msgsQuery = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy('createdAt', 'desc'),
    limit(30),
  );
  const snap = await getDocs(msgsQuery);

  for (const msgDoc of snap.docs) {
    const data = msgDoc.data();
    // Only mark other people's messages
    if (data.senderId === uid) continue;

    const currentStatus = data.deliveryStatus?.[uid]?.status;
    if (currentStatus !== 'read') {
      await updateDoc(msgDoc.ref, {
        [`deliveryStatus.${uid}`]: {
          status: 'read',
          deliveredAt: data.deliveryStatus?.[uid]?.deliveredAt || serverTimestamp(),
          readAt: serverTimestamp(),
        },
      });
    }
  }
}

// Mark messages as delivered (called when chat list loads)
export async function markMessagesDelivered(
  conversationId: string,
  uid: string,
): Promise<void> {
  const msgsQuery = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy('createdAt', 'desc'),
    limit(30),
  );
  const snap = await getDocs(msgsQuery);

  for (const msgDoc of snap.docs) {
    const data = msgDoc.data();
    if (data.senderId === uid) continue;

    const currentStatus = data.deliveryStatus?.[uid]?.status;
    if (!currentStatus || currentStatus === 'sent') {
      await updateDoc(msgDoc.ref, {
        [`deliveryStatus.${uid}`]: {
          status: 'delivered',
          deliveredAt: serverTimestamp(),
          readAt: null,
        },
      });
    }
  }
}

// Send a BBM-style "Ping!" to a conversation
export async function sendPing(
  conversationId: string,
  senderId: string,
  senderName: string,
): Promise<void> {
  await addDoc(
    collection(db, `conversations/${conversationId}/messages`),
    {
      senderId,
      senderName,
      type: 'system',
      text: `${senderName} sent a Ping! 🔔`,
      encrypted: false,
      mediaUrl: null,
      mediaType: null,
      fileName: null,
      fileSize: null,
      thumbnailUrl: null,
      mentions: [],
      deliveryStatus: {},
      aggregateStatus: 'sent',
      isPing: true,
      createdAt: serverTimestamp(),
      editedAt: null,
      isDeleted: false,
    },
  );
}

// Send a voice note message
export async function sendVoiceMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  mediaUrl: string,
  durationMs: number,
): Promise<void> {
  await addDoc(
    collection(db, `conversations/${conversationId}/messages`),
    {
      senderId,
      senderName,
      type: 'voice',
      text: null,
      encrypted: false,
      mediaUrl,
      mediaType: 'audio/m4a',
      fileName: null,
      fileSize: null,
      thumbnailUrl: null,
      durationMs,
      mentions: [],
      deliveryStatus: {},
      aggregateStatus: 'sent',
      createdAt: serverTimestamp(),
      editedAt: null,
      isDeleted: false,
    },
  );
}

// Delete a message (mark as deleted)
export async function deleteMessage(
  conversationId: string,
  messageId: string,
): Promise<void> {
  await updateDoc(
    doc(db, `conversations/${conversationId}/messages`, messageId),
    {
      isDeleted: true,
      text: null,
      mediaUrl: null,
    },
  );
}

// React to a message
export async function toggleReaction(
  conversationId: string,
  messageId: string,
  uid: string,
  emoji: string,
): Promise<void> {
  const msgRef = doc(db, `conversations/${conversationId}/messages`, messageId);
  const msgDoc = await getDoc(msgRef);
  if (!msgDoc.exists()) return;

  const reactions: Record<string, string[]> = msgDoc.data().reactions || {};
  const uids = reactions[emoji] || [];

  if (uids.includes(uid)) {
    // Remove reaction
    reactions[emoji] = uids.filter((u) => u !== uid);
    if (reactions[emoji].length === 0) delete reactions[emoji];
  } else {
    // Add reaction
    reactions[emoji] = [...uids, uid];
  }

  await updateDoc(msgRef, { reactions });
}

// Disappearing messages — set timer for a conversation
export async function setDisappearingTimer(
  conversationId: string,
  seconds: number | null,
): Promise<void> {
  await updateDoc(doc(db, 'conversations', conversationId), {
    disappearingSeconds: seconds,
  });
}

// Clean up expired disappearing messages
export async function cleanupDisappearingMessages(
  conversationId: string,
): Promise<number> {
  const convoDoc = await getDoc(doc(db, 'conversations', conversationId));
  if (!convoDoc.exists()) return 0;

  const disappearingSeconds = convoDoc.data().disappearingSeconds;
  if (!disappearingSeconds) return 0;

  const cutoff = new Date(Date.now() - disappearingSeconds * 1000);
  const msgsQuery = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy('createdAt', 'asc'),
  );
  const snap = await getDocs(msgsQuery);
  let deleted = 0;

  for (const msgDoc of snap.docs) {
    const data = msgDoc.data();
    if (data.createdAt?.toDate && data.createdAt.toDate() < cutoff && !data.isDeleted) {
      await updateDoc(msgDoc.ref, { isDeleted: true, text: null, ciphertext: null, mediaUrl: null });
      deleted++;
    }
  }

  return deleted;
}

// Clear all messages in a conversation
export async function clearChatHistory(
  conversationId: string,
): Promise<void> {
  const msgsQuery = query(collection(db, `conversations/${conversationId}/messages`));
  const snap = await getDocs(msgsQuery);

  const batch: Promise<void>[] = [];
  snap.docs.forEach((msgDoc) => {
    batch.push(
      updateDoc(msgDoc.ref, { isDeleted: true, text: null, ciphertext: null, mediaUrl: null })
    );
  });
  await Promise.all(batch);

  // Reset last message
  await updateDoc(doc(db, 'conversations', conversationId), {
    'lastMessage.text': 'Chat cleared',
    'lastMessage.type': 'system',
    updatedAt: serverTimestamp(),
  });
}

// Typing indicator
export async function setTyping(
  conversationId: string,
  uid: string,
  isTyping: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`typing.${uid}`]: isTyping,
  });
}
