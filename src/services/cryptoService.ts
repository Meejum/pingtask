/**
 * E2EE using tweetnacl (NaCl box = Curve25519 + XSalsa20 + Poly1305)
 *
 * Flow:
 * 1. On signup: generate keypair, store private key locally, publish public key to Firestore
 * 2. On contact add: fetch their public key
 * 3. On send: encrypt(message, sharedSecret(myPrivate, theirPublic))
 * 4. On receive: decrypt(ciphertext, sharedSecret(myPrivate, theirPublic))
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

// In-memory cache (in production, use expo-secure-store)
let cachedKeyPair: nacl.BoxKeyPair | null = null;

/**
 * Generate a new keypair and store it.
 * Returns base64-encoded public key.
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const keyPair = nacl.box.keyPair();
  cachedKeyPair = keyPair;

  const pub = encodeBase64(keyPair.publicKey);
  const priv = encodeBase64(keyPair.secretKey);

  // Store private key (in production, use expo-secure-store)
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
 * Publish user's public key to Firestore.
 */
export async function publishPublicKey(uid: string, publicKey: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { publicKey });
}

/**
 * Fetch another user's public key.
 */
export async function fetchPublicKey(uid: string): Promise<string | null> {
  const d = await getDoc(doc(db, 'users', uid));
  if (!d.exists()) return null;
  return d.data().publicKey || null;
}

/**
 * Encrypt a message for a recipient.
 * Returns base64-encoded { nonce + ciphertext }.
 */
export function encryptMessage(
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

  // Combine nonce + ciphertext
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce);
  combined.set(encrypted, nonce.length);

  return encodeBase64(combined);
}

/**
 * Decrypt a message from a sender.
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

/**
 * Check if a message string is encrypted (base64 with sufficient length).
 */
export function isEncrypted(text: string): boolean {
  try {
    const bytes = decodeBase64(text);
    return bytes.length > nacl.box.nonceLength + nacl.box.macLength;
  } catch {
    return false;
  }
}
