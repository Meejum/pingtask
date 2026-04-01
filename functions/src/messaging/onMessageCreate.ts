import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const onMessageCreate = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const message = snapshot.data();
    const { conversationId } = context.params;

    const convoRef = db.doc(`conversations/${conversationId}`);
    const convoDoc = await convoRef.get();

    if (!convoDoc.exists) {
      functions.logger.error(`Conversation ${conversationId} not found`);
      return;
    }

    const convo = convoDoc.data()!;
    const participantUids: string[] = convo.participantUids || [];
    const senderId: string = message.senderId;

    // Determine preview text based on message type and encryption
    let previewText = '';
    if (message.isPing) {
      previewText = '🔔 Ping!';
    } else if (message.encrypted) {
      previewText = '🔒 Encrypted message';
    } else if (message.type === 'voice') {
      previewText = '🎤 Voice note';
    } else if (message.type === 'image') {
      previewText = '📷 Photo';
    } else if (message.type === 'file') {
      previewText = '📎 File';
    } else {
      previewText = (message.text || '').substring(0, 100);
    }

    // 1. Update lastMessage preview
    const updateData: Record<string, any> = {
      'lastMessage.text': previewText,
      'lastMessage.senderId': senderId,
      'lastMessage.senderName': message.senderName,
      'lastMessage.type': message.type,
      'lastMessage.timestamp': message.createdAt,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 2. Increment unreadCount for non-sender participants
    for (const uid of participantUids) {
      if (uid !== senderId) {
        updateData[`unreadCount.${uid}`] =
          admin.firestore.FieldValue.increment(1);
      }
    }

    await convoRef.update(updateData);

    // 3. Send push notifications to non-sender participants
    const recipientUids = participantUids.filter((uid) => uid !== senderId);
    const recipientDocs = await Promise.all(
      recipientUids.map((uid) => db.doc(`users/${uid}`).get())
    );

    const tokens: string[] = [];
    for (const doc of recipientDocs) {
      if (doc.exists) {
        const userData = doc.data()!;
        if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
          tokens.push(...userData.fcmTokens);
        }
      }
    }

    if (tokens.length > 0) {
      // For encrypted messages, don't leak content in push notification
      const notificationBody = message.encrypted
        ? 'New encrypted message'
        : previewText;

      const payload: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: message.senderName,
          body: notificationBody.substring(0, 100),
        },
        data: {
          type: 'message',
          conversationId,
          messageId: snapshot.id,
        },
      };

      const response = await admin.messaging().sendEachForMulticast(payload);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(tokens[idx]);
          }
        });

        if (invalidTokens.length > 0) {
          for (const doc of recipientDocs) {
            if (doc.exists) {
              const userData = doc.data()!;
              const validTokens = (userData.fcmTokens || []).filter(
                (t: string) => !invalidTokens.includes(t)
              );
              if (validTokens.length !== (userData.fcmTokens || []).length) {
                await doc.ref.update({ fcmTokens: validTokens });
              }
            }
          }
        }
      }
    }

    // 4. Extract @mentions and create tasks (only for non-encrypted messages)
    if (!message.encrypted) {
      const mentions = message.mentions || [];
      if (mentions.length > 0) {
        const batch = db.batch();
        const seenUids = new Set<string>();

        for (const mention of mentions) {
          if (mention.uid === senderId || seenUids.has(mention.uid)) continue;
          seenUids.add(mention.uid);

          const taskRef = db.collection('tasks').doc();
          batch.set(taskRef, {
            id: taskRef.id,
            sourceMessageId: snapshot.id,
            sourceConversationId: conversationId,
            assignedTo: mention.uid,
            assignedToName: mention.displayName,
            assignedBy: senderId,
            assignedByName: message.senderName,
            title: (message.text || '').substring(0, 200),
            description: message.text || null,
            status: 'todo',
            participants: [mention.uid, senderId],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            completedAt: null,
          });
        }

        await batch.commit();
        functions.logger.info(
          `Created ${seenUids.size} tasks from message ${snapshot.id}`
        );
      }
    }
  });

export const onMessageUpdate = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    const beforeStatus = JSON.stringify(before.deliveryStatus || {});
    const afterStatus = JSON.stringify(after.deliveryStatus || {});
    if (beforeStatus === afterStatus) return;

    const deliveryStatus = after.deliveryStatus || {};
    const statuses = Object.values(deliveryStatus) as Array<{
      status: string;
    }>;

    if (statuses.length === 0) return;

    let aggregate: string = 'read';
    for (const entry of statuses) {
      if (entry.status === 'sent') {
        aggregate = 'sent';
        break;
      }
      if (entry.status === 'delivered') {
        aggregate = 'delivered';
      }
    }

    if (aggregate !== after.aggregateStatus) {
      await change.after.ref.update({ aggregateStatus: aggregate });
    }
  });
