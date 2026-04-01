import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import { generateKeyPair, loadKeyPair, publishPublicKey } from './cryptoService';

const PIN_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const PIN_LENGTH = 8;

function generatePinClient(): string {
  let pin = '';
  for (let i = 0; i < PIN_LENGTH; i++) {
    pin += PIN_CHARSET[Math.floor(Math.random() * PIN_CHARSET.length)];
  }
  return pin;
}

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
      // Ensure keypair exists for E2EE
      if (!loadKeyPair()) {
        const { publicKey } = generateKeyPair();
        if (!userData.publicKey) {
          await publishPublicKey(firebaseUser.uid, publicKey);
        }
      }
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
  let resolved = false;

  const unsubscribe = onSnapshot(doc(db, 'users', uid), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.pin) {
        resolved = true;
        onData(data.pin);
      }
    }
  });

  // Fallback: if Cloud Function hasn't created the doc after 5s, create it client-side
  const timeout = setTimeout(async () => {
    if (resolved) return;
    const userRef = doc(db, 'users', uid);
    const existing = await getDoc(userRef);
    if (!existing.exists() || !existing.data().pin) {
      const pin = generatePinClient();
      const email = auth.currentUser?.email ?? null;
      // Generate E2EE keypair for this user
      const { publicKey } = generateKeyPair();

      await setDoc(userRef, {
        uid,
        pin,
        pinLowercase: pin.toLowerCase(),
        displayName: '',
        email,
        phoneNumber: null,
        avatarUrl: null,
        status: 'available',
        statusMessage: '',
        publicKey,
        fcmTokens: [],
        isOnline: true,
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  }, 5000);

  return () => {
    clearTimeout(timeout);
    unsubscribe();
  };
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
