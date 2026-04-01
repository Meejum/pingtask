import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export function subscribeToAuth(
  onUser: (user: User | null) => void,
  onNeedsProfile: (uid: string) => void,
  onLoading: (loading: boolean) => void,
) {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      onUser(null);
      return;
    }

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      if (userData.displayName) {
        onUser(userData);
        return;
      }
    }
    // User exists in Auth but profile not set up yet
    onNeedsProfile(firebaseUser.uid);
    onLoading(false);
  });
}

export async function signUp(email: string, password: string): Promise<string> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user.uid;
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeToUserDoc(
  uid: string,
  onData: (pin: string) => void,
) {
  return onSnapshot(doc(db, 'users', uid), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.pin) {
        onData(data.pin);
      }
    }
  });
}

export async function setDisplayName(uid: string, displayName: string): Promise<User> {
  await updateDoc(doc(db, 'users', uid), {
    displayName,
    updatedAt: serverTimestamp(),
  });

  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.data() as User;
}

export function getCurrentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}
