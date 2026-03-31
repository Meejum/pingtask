import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { generatePin } from '../utils/pinGenerator';

const db = admin.firestore();
const MAX_RETRIES = 5;

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  let pin = '';
  let attempts = 0;

  // Generate unique PIN with collision handling
  while (attempts < MAX_RETRIES) {
    pin = generatePin();
    const pinRef = db.doc(`pins/${pin}`);

    try {
      await db.runTransaction(async (transaction) => {
        const pinDoc = await transaction.get(pinRef);
        if (pinDoc.exists) {
          throw new Error('PIN_COLLISION');
        }
        transaction.set(pinRef, {
          uid: user.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      break; // Success
    } catch (error: any) {
      if (error.message === 'PIN_COLLISION') {
        attempts++;
        continue;
      }
      throw error;
    }
  }

  if (attempts >= MAX_RETRIES) {
    throw new Error('Failed to generate unique PIN after max retries');
  }

  // Create user document
  await db.doc(`users/${user.uid}`).set({
    uid: user.uid,
    pin,
    pinLowercase: pin.toLowerCase(),
    displayName: user.displayName || '',
    email: user.email || null,
    phoneNumber: user.phoneNumber || null,
    avatarUrl: user.photoURL || null,
    status: 'available',
    statusMessage: '',
    fcmTokens: [],
    isOnline: false,
    lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.info(`Created user ${user.uid} with PIN ${pin}`);
});
