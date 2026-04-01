/**
 * E2EE using tweetnacl — shared secret approach
 *
 * How it works:
 * - Each user has a Curve25519 keypair (public + private)
 * - For a direct chat between Alice and Bob:
 *   - Alice computes: sharedSecret = DH(Bob's public, Alice's private)
 *   - Bob computes:   sharedSecret = DH(Alice's public, Bob's private)
 *   - Both get the SAME shared secret (Diffie-Hellman property)
 * - Message encrypted with nacl.secretbox using that shared secret
 * - Single ciphertext stored — both parties can decrypt
 * - Server sees only ciphertext — cannot derive the shared secret
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
const publicKeyCache: Record<string, string> = {};
const sharedSecretCache: Record<string, Uint8Array> = {};

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
 * Compute shared secret with another user (cached).
 * DH(theirPublic, myPrivate) — both sides get the same result.
 */
function getSharedSecret(theirPublicKeyB64: string): Uint8Array | null {
  if (sharedSecretCache[theirPublicKeyB64]) {
    return sharedSecretCache[theirPublicKeyB64];
  }

  const keyPair = loadKeyPair();
  if (!keyPair) return null;

  const theirPub = decodeBase64(theirPublicKeyB64);
  const shared = nacl.box.before(theirPub, keyPair.secretKey);
  sharedSecretCache[theirPublicKeyB64] = shared;
  return shared;
}

/**
 * Encrypt a message using the shared secret with another user.
 * Returns base64(nonce + ciphertext).
 */
export async function encryptMessage(
  plaintext: string,
  otherUid: string,
): Promise<string | null> {
  const theirPubKey = await fetchPublicKey(otherUid);
  if (!theirPubKey) return null;

  const shared = getSharedSecret(theirPubKey);
  if (!shared) return null;

  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const messageBytes = decodeUTF8(plaintext);
  const encrypted = nacl.secretbox(messageBytes, nonce, shared);

  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce);
  combined.set(encrypted, nonce.length);

  return encodeBase64(combined);
}

/**
 * Decrypt a message using the shared secret with the other user.
 * If decryption fails, retry with a fresh public key from Firestore
 * (in case the other user regenerated their keypair).
 */
export async function decryptMessage(
  encryptedB64: string,
  otherUid: string,
): Promise<string | null> {
  // Try with cached key first
  const result = await tryDecrypt(encryptedB64, otherUid);
  if (result) return result;

  // Cache might be stale — clear and retry with fresh key from Firestore
  delete publicKeyCache[otherUid];
  // Also clear shared secret cache for this user's key
  for (const key of Object.keys(sharedSecretCache)) {
    delete sharedSecretCache[key];
  }

  return tryDecrypt(encryptedB64, otherUid);
}

async function tryDecrypt(
  encryptedB64: string,
  otherUid: string,
): Promise<string | null> {
  const theirPubKey = await fetchPublicKey(otherUid);
  if (!theirPubKey) return null;

  const shared = getSharedSecret(theirPubKey);
  if (!shared) return null;

  try {
    const combined = decodeBase64(encryptedB64);
    const nonce = combined.slice(0, nacl.secretbox.nonceLength);
    const ciphertext = combined.slice(nacl.secretbox.nonceLength);

    const decrypted = nacl.secretbox.open(ciphertext, nonce, shared);
    if (!decrypted) return null;

    return encodeUTF8(decrypted);
  } catch {
    return null;
  }
}
