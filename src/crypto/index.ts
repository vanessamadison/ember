export {
  deriveKey,
  generateSalt,
  generateInviteCode,
  hashPassphrase,
} from './keyDerivation';

export {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  generateNonce,
} from './encryption';

import * as SecureStore from 'expo-secure-store';
import { deriveKey, hashPassphrase } from './keyDerivation';
import {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
} from './encryption';

const SECURE_KEY_STORAGE = 'ember_encryption_key';
const SECURE_SALT_STORAGE = 'ember_key_salt';

/**
 * CryptoManager handles all cryptographic operations for the EMBER app.
 * It maintains the derived key in memory (never persisted unencrypted) and provides
 * convenience methods for encryption/decryption of strings and objects.
 *
 * The key is stored in SecureStore (encrypted by the device) and loaded into memory
 * only when needed.
 */
export class CryptoManager {
  private derivedKey: Uint8Array | null = null;
  private salt: Uint8Array | null = null;
  private isReady: boolean = false;

  /**
   * Initializes the CryptoManager by deriving a key from the provided passphrase.
   * If a salt is provided, it uses that; otherwise generates a new one and stores it.
   *
   * @param passphrase The community passphrase
   * @param salt Optional salt. If not provided, a new one is generated and stored
   * @throws Error if initialization fails
   */
  async initialize(passphrase: string, salt?: Uint8Array): Promise<void> {
    try {
      const { key, salt: generatedSalt } = await deriveKey(passphrase, salt);
      this.derivedKey = key;
      this.salt = generatedSalt;
      this.isReady = true;

      // Store salt in SecureStore for later key derivation
      if (!salt) {
        await SecureStore.setItemAsync(
          SECURE_SALT_STORAGE,
          btoa(String.fromCharCode(...generatedSalt))
        );
      }
    } catch (error) {
      this.destroy();
      throw new Error(`Failed to initialize CryptoManager: ${error}`);
    }
  }

  /**
   * Checks if the CryptoManager has been initialized with a key.
   * @returns true if initialized and ready to use, false otherwise
   */
  isInitialized(): boolean {
    return this.isReady && this.derivedKey !== null;
  }

  /**
   * Encrypts a string using the derived key.
   * @param plaintext The string to encrypt
   * @returns Base64 encoded ciphertext
   * @throws Error if not initialized or encryption fails
   */
  encryptString(plaintext: string): string {
    if (!this.isInitialized() || !this.derivedKey) {
      throw new Error('CryptoManager not initialized');
    }
    return encrypt(plaintext, this.derivedKey);
  }

  /**
   * Decrypts a base64 encoded ciphertext using the derived key.
   * @param ciphertext Base64 encoded ciphertext
   * @returns Decrypted plaintext
   * @throws Error if not initialized or decryption fails
   */
  decryptString(ciphertext: string): string {
    if (!this.isInitialized() || !this.derivedKey) {
      throw new Error('CryptoManager not initialized');
    }
    return decrypt(ciphertext, this.derivedKey);
  }

  /**
   * Encrypts a JavaScript object using the derived key.
   * @param obj The object to encrypt
   * @returns Base64 encoded encrypted JSON
   * @throws Error if not initialized or encryption fails
   */
  encryptObject<T extends object>(obj: T): string {
    if (!this.isInitialized() || !this.derivedKey) {
      throw new Error('CryptoManager not initialized');
    }
    return encryptObject(obj, this.derivedKey);
  }

  /**
   * Decrypts an object that was encrypted with encryptObject.
   * @param ciphertext Base64 encoded encrypted JSON
   * @returns Decrypted and parsed object of type T
   * @throws Error if not initialized or decryption fails
   */
  decryptObject<T extends object>(ciphertext: string): T {
    if (!this.isInitialized() || !this.derivedKey) {
      throw new Error('CryptoManager not initialized');
    }
    return decryptObject<T>(ciphertext, this.derivedKey);
  }

  /**
   * Stores the derived key in SecureStore (encrypted by the device).
   * This allows the key to be recovered without re-deriving from the passphrase.
   * @param key The derived key to store
   * @throws Error if storage fails
   */
  async storeEncryptedKey(key: Uint8Array): Promise<void> {
    try {
      // Encode key as base64 for storage
      const encodedKey = btoa(String.fromCharCode(...key));
      await SecureStore.setItemAsync(SECURE_KEY_STORAGE, encodedKey);
    } catch (error) {
      throw new Error(`Failed to store encrypted key: ${error}`);
    }
  }

  /**
   * Loads the derived key from SecureStore.
   * Requires that the key was previously stored with storeEncryptedKey.
   * @throws Error if key cannot be loaded or is invalid
   */
  async loadKey(): Promise<void> {
    try {
      const encodedKey = await SecureStore.getItemAsync(SECURE_KEY_STORAGE);
      if (!encodedKey) {
        throw new Error('No stored key found');
      }

      const keyArray = new Uint8Array(
        atob(encodedKey)
          .split('')
          .map((c) => c.charCodeAt(0))
      );

      if (keyArray.length !== 32) {
        throw new Error('Invalid stored key: incorrect length');
      }

      this.derivedKey = keyArray;
      this.isReady = true;

      // Load salt if available
      const encodedSalt = await SecureStore.getItemAsync(SECURE_SALT_STORAGE);
      if (encodedSalt) {
        this.salt = new Uint8Array(
          atob(encodedSalt)
            .split('')
            .map((c) => c.charCodeAt(0))
        );
      }
    } catch (error) {
      throw new Error(`Failed to load key: ${error}`);
    }
  }

  /**
   * Securely zeros out the derived key from memory.
   * This should be called when logging out or when the key is no longer needed.
   */
  destroy(): void {
    if (this.derivedKey) {
      // Zero out the key array
      for (let i = 0; i < this.derivedKey.length; i++) {
        this.derivedKey[i] = 0;
      }
    }
    this.derivedKey = null;
    this.salt = null;
    this.isReady = false;
  }

  /**
   * Gets the current salt used for key derivation.
   * @returns The salt, or null if not initialized
   */
  getSalt(): Uint8Array | null {
    return this.salt;
  }
}

export default CryptoManager;
