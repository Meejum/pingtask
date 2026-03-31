import * as admin from 'firebase-admin';

admin.initializeApp();

export { onUserCreate } from './auth/onUserCreate';
export { onMessageCreate, onMessageUpdate } from './messaging/onMessageCreate';
