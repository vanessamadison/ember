import React, { useEffect } from 'react';
import { clearCryptoSession, restoreCryptoFromSecureStore } from '../crypto/session';
import { useApp } from './AppContext';

/**
 * Restores NaCl key material after app restart when the user is onboarded.
 */
export const CryptoBootstrap: React.FC = () => {
  const { isOnboarded } = useApp();

  useEffect(() => {
    if (!isOnboarded) {
      clearCryptoSession();
      return;
    }
    void restoreCryptoFromSecureStore().catch(() => {
      /* User may need to re-enter passphrase in a future build */
    });
  }, [isOnboarded]);

  return null;
};
