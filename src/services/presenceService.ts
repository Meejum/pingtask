import { doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppState, AppStateStatus } from 'react-native';

let presenceUnsub: (() => void) | null = null;

/**
 * Start tracking user presence (online/offline).
 * Sets isOnline=true when app is active, false on background/close.
 */
export function startPresenceTracking(uid: string) {
  if (presenceUnsub) return;

  const userRef = doc(db, 'users', uid);

  // Set online immediately
  updateDoc(userRef, { isOnline: true, lastSeen: serverTimestamp() });

  // Listen for app state changes
  const handleAppState = (state: AppStateStatus) => {
    if (state === 'active') {
      updateDoc(userRef, { isOnline: true, lastSeen: serverTimestamp() });
    } else {
      updateDoc(userRef, { isOnline: false, lastSeen: serverTimestamp() });
    }
  };

  const subscription = AppState.addEventListener('change', handleAppState);

  // Periodic heartbeat every 60s to keep presence alive
  const heartbeat = setInterval(() => {
    if (AppState.currentState === 'active') {
      updateDoc(userRef, { lastSeen: serverTimestamp() });
    }
  }, 60000);

  presenceUnsub = () => {
    subscription.remove();
    clearInterval(heartbeat);
    updateDoc(userRef, { isOnline: false, lastSeen: serverTimestamp() });
  };
}

/**
 * Stop presence tracking and set user offline.
 */
export function stopPresenceTracking() {
  if (presenceUnsub) {
    presenceUnsub();
    presenceUnsub = null;
  }
}
