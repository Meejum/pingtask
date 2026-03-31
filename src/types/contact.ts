import { FirestoreTimestamp } from './common';

export interface Contact {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  pin: string;
  nickname: string | null;
  addedAt: FirestoreTimestamp;
}
