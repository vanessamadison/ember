import { useEffect, useState, useCallback, useRef } from 'react';

export interface CryptoManager {
  initialize(password: string): Promise<void>;
  encrypt(data: string): Promise<string>;
  decrypt(encrypted: string): Promise<string>;
  encryptObject<T>(obj: T): Promise<string>;
  decryptObject<T>(encrypted: string): Promise<T>;
  destroy(): Promise<void>;
  isInitialized(): boolean;
}

export interface UseCryptoResult {
  isInitialized: boolean;
  initialize: (password: string) => Promise<void>;
  encrypt: (data: string) => Promise<string>;
  decrypt: (encrypted: string) => Promise<string>;
  encryptObject: <T>(obj: T) => Promise<string>;
  decryptObject: <T>(encrypted: string) => Promise<T>;
  destroy: () => Promise<void>;
  loading: boolean;
  error: Error | null;
}

// Mock implementation of CryptoManager for development
class MockCryptoManager implements CryptoManager {
  private initialized: boolean = false;
  private key: string | null = null;

  async initialize(password: string): Promise<void> {
    if (!password) {
      throw new Error('Password is required');
    }
    this.key = password;
    this.initialized = true;
  }

  async encrypt(data: string): Promise<string> {
    if (!this.initialized || !this.key) {
      throw new Error('Crypto not initialized');
    }
    // Mock encryption: base64 encode with key prefix
    const prefixed = `${this.key}:${data}`;
    return Buffer.from(prefixed).toString('base64');
  }

  async decrypt(encrypted: string): Promise<string> {
    if (!this.initialized || !this.key) {
      throw new Error('Crypto not initialized');
    }
    // Mock decryption: base64 decode and validate key
    try {
      const decoded = Buffer.from(encrypted, 'base64').toString('utf-8');
      const [prefix, ...dataParts] = decoded.split(':');
      if (prefix !== this.key) {
        throw new Error('Invalid decryption key');
      }
      return dataParts.join(':');
    } catch (err) {
      throw new Error('Decryption failed');
    }
  }

  async encryptObject<T>(obj: T): Promise<string> {
    const json = JSON.stringify(obj);
    return this.encrypt(json);
  }

  async decryptObject<T>(encrypted: string): Promise<T> {
    const json = await this.decrypt(encrypted);
    return JSON.parse(json) as T;
  }

  async destroy(): Promise<void> {
    this.key = null;
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

let globalCryptoManager: CryptoManager | null = null;

export function useCrypto(): UseCryptoResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const managerRef = useRef<CryptoManager>(
    globalCryptoManager || new MockCryptoManager()
  );

  // Store manager globally so subsequent calls reuse it
  useEffect(() => {
    if (!globalCryptoManager) {
      globalCryptoManager = managerRef.current;
    }
  }, []);

  useEffect(() => {
    setIsInitialized(managerRef.current.isInitialized());
  }, []);

  const initialize = useCallback(async (password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await managerRef.current.initialize(password);
      setIsInitialized(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const encrypt = useCallback(async (data: string): Promise<string> => {
    try {
      if (!managerRef.current.isInitialized()) {
        throw new Error('Crypto not initialized');
      }
      setError(null);
      return await managerRef.current.encrypt(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  const decrypt = useCallback(async (encrypted: string): Promise<string> => {
    try {
      if (!managerRef.current.isInitialized()) {
        throw new Error('Crypto not initialized');
      }
      setError(null);
      return await managerRef.current.decrypt(encrypted);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  const encryptObject = useCallback(
    async <T,>(obj: T): Promise<string> => {
      try {
        if (!managerRef.current.isInitialized()) {
          throw new Error('Crypto not initialized');
        }
        setError(null);
        return await managerRef.current.encryptObject(obj);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    []
  );

  const decryptObject = useCallback(
    async <T,>(encrypted: string): Promise<T> => {
      try {
        if (!managerRef.current.isInitialized()) {
          throw new Error('Crypto not initialized');
        }
        setError(null);
        return await managerRef.current.decryptObject<T>(encrypted);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    []
  );

  const destroy = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await managerRef.current.destroy();
      setIsInitialized(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isInitialized,
    initialize,
    encrypt,
    decrypt,
    encryptObject,
    decryptObject,
    destroy,
    loading,
    error,
  };
}
