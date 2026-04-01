import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserSettings {
  // Notifications
  pushMessages: boolean;
  pushTasks: boolean;
  pushContacts: boolean;
  emailDigest: boolean;
  sounds: boolean;
  vibrate: boolean;
  // Privacy
  lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
  profilePhotoVisibility: 'everyone' | 'contacts' | 'nobody';
  statusVisibility: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  typingIndicator: boolean;
  // Security
  biometricLock: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  pushMessages: true,
  pushTasks: true,
  pushContacts: true,
  emailDigest: false,
  sounds: true,
  vibrate: true,
  lastSeenVisibility: 'contacts',
  profilePhotoVisibility: 'everyone',
  statusVisibility: 'contacts',
  readReceipts: true,
  typingIndicator: true,
  biometricLock: false,
};

export async function loadSettings(uid: string): Promise<UserSettings> {
  const d = await getDoc(doc(db, 'userSettings', uid));
  if (d.exists()) {
    return { ...DEFAULT_SETTINGS, ...d.data() } as UserSettings;
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(
  uid: string,
  settings: Partial<UserSettings>,
): Promise<void> {
  await setDoc(
    doc(db, 'userSettings', uid),
    { ...settings, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
