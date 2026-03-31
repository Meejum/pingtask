import { FirestoreTimestamp } from './common';

export type UserStatus = 'available' | 'busy' | 'away' | 'offline';

export interface User {
  uid: string;
  pin: string;
  pinLowercase: string;
  displayName: string;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  statusMessage: string;
  fcmTokens: string[];
  isOnline: boolean;
  lastSeen: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  pin: string;
  status: UserStatus;
  statusMessage: string;
}
