import React, { createContext, useContext, useEffect, useState } from 'react';
import { MeshtasticBleBridge } from '../mesh/meshtasticBleBridge';
import { MeshtasticSession } from '../mesh/meshtasticSession';
import { useMeshRadioStore } from '../mesh/meshRadioStore';

export type MeshRadioApi = {
  bridge: MeshtasticBleBridge;
  session: MeshtasticSession;
};

const MeshRadioContext = createContext<MeshRadioApi | null>(null);

export function MeshRadioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [api, setApi] = useState<MeshRadioApi | null>(null);

  useEffect(() => {
    const bridge = new MeshtasticBleBridge();
    const session = new MeshtasticSession(bridge);
    const store = useMeshRadioStore.getState();
    store.setNativeBleOk(bridge.isNativeBleAvailable());

    let unsubState = () => {};
    if (bridge.isNativeBleAvailable()) {
      void bridge.getBluetoothState().then(store.setBleState);
      unsubState = bridge.subscribeState(store.setBleState);
    } else {
      store.setBleState('Unsupported');
    }
    // Bridge/session must be created and torn down with this effect so dev Strict Mode
    // remount gets a fresh native adapter; deferring setState reorders vs. cleanup.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tied to effect lifecycle
    setApi({ bridge, session });

    return () => {
      unsubState();
      bridge.destroy();
      store.resetForProviderUnmount();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirror mount path
      setApi(null);
    };
  }, []);

  return (
    <MeshRadioContext.Provider value={api}>
      {children}
    </MeshRadioContext.Provider>
  );
}

export function useMeshRadio(): MeshRadioApi | null {
  return useContext(MeshRadioContext);
}
