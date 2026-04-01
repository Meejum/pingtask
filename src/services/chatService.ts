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
import { encryptMessage, decryptMessage, fetchPublicKey, isEncrypted } from './cryptoService';

// Cache public keys in memory
const publicKeyCache: Record<string, string> = {};

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
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  mentions: any[] = [],
  recipientUid?: string,
): Promise<string> {
  let messageText = text;
  let encrypted = false;

  // Encrypt for direct chats if we have the recipient's public key
  if (recipientUid) {
    try {
      let pubKey = publicKeyCache[recipientUid];
      if (!pubKey) {
        const fetched = await fetchPublicKey(recipientUid);
        if (fetched) {
          pubKey = fetched;
          publicKeyCache[recipientUid] = pubKey;
        }
      }
      if (pubKey) {
        messageText = encryptMessage(text, pubKey);
        encrypted = true;
      }
    } catch {
      // Fall back to plaintext if encryption fails
    }
  }

  const msgRef = await addDoc(
    collection(db, `conversations/${conversationId}/messages`),
    {
      senderId,
      senderName,
      type: 'text',
      text: messageText,
      encrypted,
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
    },
  );

  return msgRef.id;
}

// Decrypt messages from a sender
export async function decryptMessages(
  messages: Message[],
  currentUid: string,
): Promise<Message[]> {
  const decrypted: Message[] = [];

  for (const msg of messages) {
    if ((msg as any).encrypted && msg.text && msg.senderId !== currentUid) {
      try {
        let pubKey = publicKeyCache[msg.senderId];
        if (!pubKey) {
          const fetched = await fetchPublicKey(msg.senderId);
          if (fetched) {
            pubKey = fetched;
            publicKeyCache[msg.senderId] = pubKey;
          }
        }
        if (pubKey) {
          const plaintext = decryptMessage(msg.text, pubKey);
          decrypted.push({ ...msg, text: plaintext || '[Decryption failed]' });
          continue;
        }
      } catch {}
    }
    decrypted.push(msg);
  }

  return decrypted;
}

// Mark messages as read / reset unread
export async function markConversationRead(
  conversationId: string,
  uid: string,
): Promise<void> {
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`unreadCount.${uid}`]: 0,
  });
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
