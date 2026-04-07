import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useMeshRadio } from '../context/MeshRadioContext';
import { useApp } from '../context/AppContext';
import { getCryptoSession } from '../crypto/session';
import { useMeshInterChunkDelay } from './useMeshInterChunkDelay';
import { meshBroadcastSnapshotFlow } from '../mesh/meshBroadcastSnapshot';
import { EMBER_MESH_INTER_CHUNK_DELAY_MS } from '../mesh/emberMeshConstants';
import {
  nextHigherInterChunkPreset,
  nextLowerInterChunkPreset,
} from '../mesh/meshChunkDelayPresets';
import {
  loadMeshInterChunkWalkdownActive,
  saveMeshInterChunkWalkdownActive,
} from '../mesh/meshInterChunkWalkdownPreference';
import { useMeshRadioStore } from '../mesh/meshRadioStore';

export function useMeshBroadcastSnapshot(options?: {
  onTxPreview?: (preview: string) => void;
}) {
  const {
    interChunkDelayMs,
    setInterChunkDelayMs,
    interChunkDelayHydrated,
  } = useMeshInterChunkDelay();
  const meshApi = useMeshRadio();
  const { currentCommunityId } = useApp();
  const cryptoReady = Boolean(getCryptoSession()?.isInitialized());
  const meshNativeOk = useMeshRadioStore((s) => s.nativeBleOk);
  const meshConnectedId = useMeshRadioStore((s) => s.connectedDeviceId);
  const meshHandshakeBusy = useMeshRadioStore((s) => s.handshakeBusy);
  const [broadcastBusy, setBroadcastBusy] = useState(false);

  const canBroadcast = Boolean(
    meshApi?.session &&
      meshConnectedId &&
      !meshHandshakeBusy &&
      cryptoReady &&
      meshNativeOk &&
      currentCommunityId &&
      currentCommunityId !== '__none__'
  );

  const broadcastSnapshot = useCallback(async () => {
    const session = meshApi?.session;
    const cid = currentCommunityId;
    if (
      !session ||
      !cid ||
      cid === '__none__' ||
      !cryptoReady ||
      !meshConnectedId
    ) {
      Alert.alert(
        'Cannot broadcast',
        'Connect a Meshtastic radio (Config → Mesh Network) and unlock encryption.'
      );
      return;
    }
    setBroadcastBusy(true);
    useMeshRadioStore.getState().setMeshBroadcastProgress(null);
    try {
      const result = await meshBroadcastSnapshotFlow(session, cid, {
        onTxPreview: options?.onTxPreview,
        interChunkDelayMs,
        onChunkProgress: (current, total) => {
          useMeshRadioStore.getState().setMeshBroadcastProgress({
            current,
            total,
          });
        },
        confirmMultiChunk: (chunks, sec) =>
          new Promise((resolve) => {
            Alert.alert(
              'Broadcast over mesh',
              `Send this encrypted community snapshot as ${chunks} LoRa packets? About ${sec}s total gap (${interChunkDelayMs} ms between packets). Peers with the same community and passphrase can merge it.`,
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => resolve(false),
                },
                { text: 'Send', onPress: () => resolve(true) },
              ]
            );
          }),
      });
      if (result.ok) {
        useMeshRadioStore.getState().setMeshLastBroadcastOutbound({
          at: Date.now(),
          meshPackets: result.meshPackets,
          bundleUtf8Bytes: result.bundleUtf8Bytes,
        });
        const kb =
          result.bundleUtf8Bytes >= 1024
            ? `${(result.bundleUtf8Bytes / 1024).toFixed(1)} KB`
            : `${result.bundleUtf8Bytes} B`;
        let adaptiveNote = '';
        const walk = await loadMeshInterChunkWalkdownActive();
        if (walk) {
          const lower = nextLowerInterChunkPreset(interChunkDelayMs);
          if (lower != null) {
            await setInterChunkDelayMs(lower);
            const stillAboveDefault = lower > EMBER_MESH_INTER_CHUNK_DELAY_MS;
            await saveMeshInterChunkWalkdownActive(stillAboveDefault);
            adaptiveNote = `\n\nAdaptive: stepped spacing down to ${lower} ms after a clean send (saved).`;
          } else {
            await saveMeshInterChunkWalkdownActive(false);
          }
        }
        Alert.alert(
          'Mesh snapshot sent',
          `${result.meshPackets} LoRa packet${
            result.meshPackets === 1 ? '' : 's'
          } written to the radio (${kb} bundle on-air). Reception and merge depend on range and channel; check peers’ Last mesh import.${adaptiveNote}`
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const bumped = nextHigherInterChunkPreset(interChunkDelayMs);
      if (bumped != null) {
        await setInterChunkDelayMs(bumped);
        await saveMeshInterChunkWalkdownActive(true);
        Alert.alert(
          'Mesh broadcast failed',
          `${msg}\n\nAdaptive airtime: chunk spacing is now ${bumped} ms for the next send (saved). Successful sends step spacing back down until default.`
        );
      } else {
        Alert.alert('Mesh broadcast failed', msg);
      }
    } finally {
      useMeshRadioStore.getState().setMeshBroadcastProgress(null);
      setBroadcastBusy(false);
    }
  }, [
    meshApi?.session,
    currentCommunityId,
    cryptoReady,
    meshConnectedId,
    interChunkDelayMs,
    options?.onTxPreview,
    setInterChunkDelayMs,
  ]);

  return {
    broadcastBusy,
    broadcastSnapshot,
    canBroadcast,
    interChunkDelayMs,
    setInterChunkDelayMs,
    interChunkDelayHydrated,
  };
}
