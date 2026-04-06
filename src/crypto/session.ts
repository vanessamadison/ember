import CryptoManager from './index';

let activeSession: CryptoManager | null = null;

export function getCryptoSession(): CryptoManager | null {
  return activeSession;
}

export function clearCryptoSession(): void {
  if (activeSession) {
    activeSession.destroy();
    activeSession = null;
  }
}

export function setCryptoSession(mgr: CryptoManager): void {
  if (activeSession && activeSession !== mgr) {
    activeSession.destroy();
  }
  activeSession = mgr;
}

/**
 * Unlock crypto with passphrase + KDF salt stored on the community record.
 */
export async function unlockCryptoWithPassphrase(
  passphrase: string,
  saltB64: string
): Promise<CryptoManager> {
  const saltBytes = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const mgr = new CryptoManager();
  await mgr.initialize(passphrase, saltBytes);
  await mgr.persistDerivedKeyToSecureStore();
  setCryptoSession(mgr);
  return mgr;
}

/**
 * Restore session material from SecureStore (no passphrase) after app restart.
 */
export async function restoreCryptoFromSecureStore(): Promise<boolean> {
  const mgr = new CryptoManager();
  try {
    await mgr.loadKey();
  } catch {
    return false;
  }
  setCryptoSession(mgr);
  return true;
}
