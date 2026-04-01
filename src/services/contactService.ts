import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Contact, User } from '../types';

export function subscribeToContacts(
  uid: string,
  onUpdate: (contacts: Contact[]) => void,
) {
  const q = query(
    collection(db, `contacts/${uid}/list`),
    orderBy('displayName'),
  );

  return onSnapshot(q, (snapshot) => {
    const contacts: Contact[] = snapshot.docs.map((d) => ({
      ...d.data(),
      uid: d.id,
    })) as Contact[];
    onUpdate(contacts);
  });
}

export async function searchByPin(pin: string): Promise<User | null> {
  const pinDoc = await getDoc(doc(db, 'pins', pin.trim().toUpperCase()));
  if (!pinDoc.exists()) return null;

  const { uid } = pinDoc.data();
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;

  return userDoc.data() as User;
}

export async function addContact(
  currentUid: string,
  targetUser: User,
): Promise<void> {
  await setDoc(doc(db, `contacts/${currentUid}/list`, targetUser.uid), {
    uid: targetUser.uid,
    displayName: targetUser.displayName,
    avatarUrl: targetUser.avatarUrl || null,
    pin: targetUser.pin,
    nickname: null,
    addedAt: serverTimestamp(),
  });

  // Add reverse contact so target can see us too
  const currentDoc = await getDoc(doc(db, 'users', currentUid));
  if (currentDoc.exists()) {
    const current = currentDoc.data() as User;
    await setDoc(doc(db, `contacts/${targetUser.uid}/list`, currentUid), {
      uid: currentUid,
      displayName: current.displayName,
      avatarUrl: current.avatarUrl || null,
      pin: current.pin,
      nickname: null,
      addedAt: serverTimestamp(),
    });
  }
}

export async function removeContact(
  currentUid: string,
  targetUid: string,
): Promise<void> {
  await deleteDoc(doc(db, `contacts/${currentUid}/list`, targetUid));
}

export async function getContact(
  currentUid: string,
  targetUid: string,
): Promise<Contact | null> {
  const d = await getDoc(doc(db, `contacts/${currentUid}/list`, targetUid));
  if (!d.exists()) return null;
  return { ...d.data(), uid: d.id } as Contact;
}
