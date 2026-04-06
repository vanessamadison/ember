import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useMeshRadio } from '../context/MeshRadioContext';
import { useApp } from '../context/AppContext';
import { getCryptoSession } from '../crypto/session';
import { useMeshInterChunkDelay } from './useMeshInterChunkDelay';
import { meshBroadcastSnapshotFlow } from '../mesh/meshBroadcastSnapshot';
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
    try {
      const result = await meshBroadcastSnapshotFlow(session, cid, {
        onTxPreview: options?.onTxPreview,
        interChunkDelayMs,
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
        const kb =
          result.bundleUtf8Bytes >= 1024
            ? `${(result.bundleUtf8Bytes / 1024).toFixed(1)} KB`
            : `${result.bundleUtf8Bytes} B`;
        Alert.alert(
          'Mesh snapshot sent',
          `${result.meshPackets} LoRa packet${
            result.meshPackets === 1 ? '' : 's'
          } written to the radio (${kb} bundle on-air). Reception and merge depend on range and channel; check peers’ Last mesh import.`
        );
      }
    } catch (e) {
      Alert.alert(
        'Mesh broadcast failed',
        e instanceof Error ? e.message : String(e)
      );
    } finally {
      setBroadcastBusy(false);
    }
  }, [
    meshApi?.session,
    currentCommunityId,
    cryptoReady,
    meshConnectedId,
    interChunkDelayMs,
    options?.onTxPreview,
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
