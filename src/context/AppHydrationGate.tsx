import React, { useEffect, useState } from 'react';
import { useAppStore } from './AppContext';

/**
 * Children render only after AsyncStorage rehydration completes (Zustand persist).
 */
export const AppHydrationGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(() => useAppStore.persist.hasHydrated());

  useEffect(() => {
    const finish = () => setReady(true);
    if (useAppStore.persist.hasHydrated()) finish();
    return useAppStore.persist.onFinishHydration(finish);
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
};
