/**
 * E2EE using tweetnacl (NaCl box = Curve25519 + XSalsa20 + Poly1305)
 *
 * Architecture:
 * - Each user has a Curve25519 keypair (public + private)
 * - Private key stored only on device (localStorage for web, expo-secure-store for native)
 * - Public key published to Firestore user doc
 * - Messages stored with TWO encrypted copies:
 *   - encryptedForSender: encrypted with sender's own public key (so sender can re-read)
 *   - encryptedForRecipient: encrypted with recipient's public key
 * - Each user decrypts the copy encrypted for them
 */

import nacl from 'tweetnacl';
import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8,
} from 'tweetnacl-util';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const PRIVATE_KEY_STORAGE_KEY = 'pingtask_private_key';

let cachedKeyPair: nacl.BoxKeyPair | null = null;

// Public key cache to avoid repeated Firestore reads
const publicKeyCache: Record<string, string> = {};

/**
 * Generate a new keypair and store it.
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const keyPair = nacl.box.keyPair();
  cachedKeyPair = keyPair;

  const pub = encodeBase64(keyPair.publicKey);
  const priv = encodeBase64(keyPair.secretKey);

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PRIVATE_KEY_STORAGE_KEY, priv);
    }
  } catch {}

  return { publicKey: pub, privateKey: priv };
}

/**
 * Load existing keypair from storage.
 */
export function loadKeyPair(): nacl.BoxKeyPair | null {
  if (cachedKeyPair) return cachedKeyPair;

  try {
    if (typeof localStorage !== 'undefined') {
      const priv = localStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
      if (priv) {
        const secretKey = decodeBase64(priv);
        const keyPair = nacl.box.keyPair.fromSecretKey(secretKey);
        cachedKeyPair = keyPair;
        return keyPair;
      }
    }
  } catch {}

  return null;
}

/**
 * Get my own public key (base64 encoded).
 */
export function getMyPublicKey(): string | null {
  const kp = loadKeyPair();
  if (!kp) return null;
  return encodeBase64(kp.publicKey);
}

/**
 * Publish user's public key to Firestore.
 */
export async function publishPublicKey(uid: string, publicKey: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { publicKey });
  publicKeyCache[uid] = publicKey;
}

/**
 * Fetch a user's public key (cached).
 */
export async function fetchPublicKey(uid: string): Promise<string | null> {
  if (publicKeyCache[uid]) return publicKeyCache[uid];

  const d = await getDoc(doc(db, 'users', uid));
  if (!d.exists()) return null;
  const pk = d.data().publicKey || null;
  if (pk) publicKeyCache[uid] = pk;
  return pk;
}

/**
 * Encrypt a plaintext message for a specific public key.
 */
export function encryptFor(
  plaintext: string,
  recipientPublicKeyB64: string,
): string {
  const keyPair = loadKeyPair();
  if (!keyPair) throw new Error('No keypair loaded');

  const recipientPub = decodeBase64(recipientPublicKeyB64);
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageBytes = decodeUTF8(plaintext);

  const encrypted = nacl.box(messageBytes, nonce, recipientPub, keyPair.secretKey);
  if (!encrypted) throw new Error('Encryption failed');

  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce);
  combined.set(encrypted, nonce.length);

  return encodeBase64(combined);
}

/**
 * Encrypt a message for BOTH sender and recipient.
 * Returns two ciphertexts so each party can read the message.
 */
export async function encryptMessage(
  plaintext: string,
  senderUid: string,
  recipientUid: string,
): Promise<{ forSender: string; forRecipient: string } | null> {
  const myPubKey = getMyPublicKey();
  const theirPubKey = await fetchPublicKey(recipientUid);

  if (!myPubKey || !theirPubKey) return null;

  return {
    forSender: encryptFor(plaintext, myPubKey),
    forRecipient: encryptFor(plaintext, theirPubKey),
  };
}

/**
 * Decrypt a message that was encrypted for me.
 */
export function decryptMessage(
  encryptedB64: string,
  senderPublicKeyB64: string,
): string | null {
  const keyPair = loadKeyPair();
  if (!keyPair) return null;

  try {
    const combined = decodeBase64(encryptedB64);
    const nonce = combined.slice(0, nacl.box.nonceLength);
    const ciphertext = combined.slice(nacl.box.nonceLength);
    const senderPub = decodeBase64(senderPublicKeyB64);

    const decrypted = nacl.box.open(ciphertext, nonce, senderPub, keyPair.secretKey);
    if (!decrypted) return null;

    return encodeUTF8(decrypted);
  } catch {
    return null;
  }
}
