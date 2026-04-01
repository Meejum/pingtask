import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db } from '../config/firebase';

/**
 * Export all user data as JSON.
 */
export async function exportUserData(uid: string): Promise<object> {
  // User profile
  const userDoc = await getDoc(doc(db, 'users', uid));
  const profile = userDoc.exists() ? userDoc.data() : null;

  // Settings
  const settingsDoc = await getDoc(doc(db, 'userSettings', uid));
  const settings = settingsDoc.exists() ? settingsDoc.data() : null;

  // Contacts
  const contactsSnap = await getDocs(collection(db, `contacts/${uid}/list`));
  const contacts = contactsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Conversations (metadata only)
  const convosSnap = await getDocs(
    query(collection(db, 'conversations'), where('participantUids', 'array-contains', uid)),
  );
  const conversations = convosSnap.docs.map((d) => ({
    id: d.id,
    type: d.data().type,
    groupName: d.data().groupName,
    participantCount: d.data().participantUids?.length || 0,
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
  }));

  // Tasks
  const tasksSnap = await getDocs(
    query(collection(db, 'tasks'), where('participants', 'array-contains', uid)),
  );
  const tasks = tasksSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return {
    exportedAt: new Date().toISOString(),
    profile,
    settings,
    contacts,
    conversations,
    tasks,
  };
}

/**
 * Download data as JSON file (web).
 */
export function downloadJson(data: object, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Delete user account and all associated data.
 */
export async function deleteAccount(uid: string): Promise<void> {
  // 1. Delete contacts
  const contactsSnap = await getDocs(collection(db, `contacts/${uid}/list`));
  for (const d of contactsSnap.docs) {
    await deleteDoc(d.ref);
  }

  // 2. Delete settings
  try {
    await deleteDoc(doc(db, 'userSettings', uid));
  } catch {}

  // 3. Delete PIN doc
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    const pin = userDoc.data().pin;
    if (pin) {
      try {
        await deleteDoc(doc(db, 'pins', pin));
      } catch {}
    }
  }

  // 4. Delete user doc
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch {}

  // 5. Delete Firebase Auth account
  const currentUser = auth.currentUser;
  if (currentUser) {
    await deleteUser(currentUser);
  }
}
