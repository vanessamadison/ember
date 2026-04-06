import { useCallback, useEffect, useState } from 'react';
import { EMBER_MESH_INTER_CHUNK_DELAY_MS } from '../mesh/emberMeshConstants';
import {
  loadMeshInterChunkDelayMs,
  saveMeshInterChunkDelayMs,
} from '../mesh/meshInterChunkDelayPreference';

export function useMeshInterChunkDelay() {
  const [interChunkDelayMs, setInterChunkDelayMsState] = useState(
    EMBER_MESH_INTER_CHUNK_DELAY_MS
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void loadMeshInterChunkDelayMs().then((v) => {
      setInterChunkDelayMsState(v);
      setHydrated(true);
    });
  }, []);

  const setInterChunkDelayMs = useCallback(async (ms: number) => {
    setInterChunkDelayMsState(ms);
    await saveMeshInterChunkDelayMs(ms);
  }, []);

  return {
    interChunkDelayMs,
    setInterChunkDelayMs,
    interChunkDelayHydrated: hydrated,
  };
}
