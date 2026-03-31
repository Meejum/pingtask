import { Timestamp } from 'firebase/firestore';

export type FirestoreTimestamp = Timestamp;

export interface FirestoreDoc {
  id: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
