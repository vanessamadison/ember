import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import * as Crypto from 'expo-crypto';

/**
 * Generates a 24-byte nonce for nacl.secretbox operations.
 * Each nonce must be unique for a given key to maintain security.
 * @returns 24 bytes of random data
 */
export function generateNonce(): Uint8Array {
  return new Uint8Array(nacl.randomBytes(24));
}

/**
 * Encrypts a plaintext string using symmetric encryption (nacl.secretbox).
 * Uses a random nonce, combines it with the ciphertext, and returns base64 encoding.
 * @param plaintext The string to encrypt
 * @param key The 32-byte symmetric key for encryption
 * @returns Base64 encoded string containing nonce + ciphertext
 * @throws Error if key is not 32 bytes
 */
export function encrypt(plaintext: string, key: Uint8Array): string {
  if (key.length !== 32) {
    throw new Error('Encryption key must be 32 bytes');
  }

  const nonce = generateNonce();
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const ciphertext = nacl.secretbox(plaintextBytes, nonce, key);

  if (!ciphertext) {
    throw new Error('Encryption failed');
  }

  // Combine nonce and ciphertext: nonce (24 bytes) + ciphertext (variable)
  const combined = new Uint8Array(nonce.length + ciphertext.length);
  combined.set(nonce);
  combined.set(ciphertext, nonce.length);

  return encodeBase64(combined);
}

/**
 * Decrypts a base64-encoded ciphertext encrypted with nacl.secretbox.
 * Expects the input to be nonce (first 24 bytes) + ciphertext.
 * @param ciphertext Base64 encoded string containing nonce + ciphertext
 * @param key The 32-byte symmetric key for decryption
 * @returns Decrypted plaintext string
 * @throws Error if decryption fails or key is invalid
 */
export function decrypt(ciphertext: string, key: Uint8Array): string {
  if (key.length !== 32) {
    throw new Error('Decryption key must be 32 bytes');
  }

  const combined = decodeBase64(ciphertext);

  if (combined.length < 24) {
    throw new Error('Invalid ciphertext: too short');
  }

  const nonce = combined.slice(0, 24);
  const encryptedData = combined.slice(24);

  const plaintext = nacl.secretbox.open(encryptedData, nonce, key);

  if (!plaintext) {
    throw new Error('Decryption failed: invalid key or corrupted data');
  }

  return new TextDecoder().decode(plaintext);
}

/**
 * Encrypts a JavaScript object by serializing to JSON and then encrypting.
 * @param obj The object to encrypt
 * @param key The 32-byte symmetric key for encryption
 * @returns Base64 encoded encrypted JSON
 * @throws Error if serialization or encryption fails
 */
export function encryptObject<T extends object>(
  obj: T,
  key: Uint8Array
): string {
  const json = JSON.stringify(obj);
  return encrypt(json, key);
}

/**
 * Decrypts an object that was encrypted with encryptObject.
 * Decrypts the base64 ciphertext and parses the resulting JSON.
 * @param ciphertext Base64 encoded encrypted JSON
 * @param key The 32-byte symmetric key for decryption
 * @returns Decrypted and parsed object of type T
 * @throws Error if decryption or JSON parsing fails
 */
export function decryptObject<T extends object>(
  ciphertext: string,
  key: Uint8Array
): T {
  const json = decrypt(ciphertext, key);
  return JSON.parse(json) as T;
}
