import { create } from 'zustand';
import type { BlePoweredState } from './meshtasticBleBridge';

/** Latest mesh→SQLite merge attempt (for Settings / diagnostics). */
export type MeshInboundLast =
  | {
      at: number;
      ok: true;
      membersInserted: number;
      checkInsInserted: number;
    }
  | {
      at: number;
      ok: false;
      reason: string;
      detail?: string;
    };

/** Last successful mesh snapshot broadcast (Config or Home). */
export type MeshLastBroadcastOutbound = {
  at: number;
  meshPackets: number;
  bundleUtf8Bytes: number;
};

export interface MeshRadioSnapshot {
  nativeBleOk: boolean;
  bleState: BlePoweredState;
  connectedDeviceId: string | null;
  nodeNum: number | null;
  handshakeBusy: boolean;
  meshInboundLast: MeshInboundLast | null;
  /** Non-null while chunked send is writing ToRadio (global so Home + Settings stay in sync). */
  meshBroadcastProgress: { current: number; total: number } | null;
  meshLastBroadcastOutbound: MeshLastBroadcastOutbound | null;
}

type MeshRadioActions = {
  setNativeBleOk: (v: boolean) => void;
  setBleState: (v: BlePoweredState) => void;
  setConnectedDeviceId: (v: string | null) => void;
  setNodeNum: (v: number | null) => void;
  setHandshakeBusy: (v: boolean) => void;
  setMeshInboundLast: (v: MeshInboundLast | null) => void;
  setMeshBroadcastProgress: (
    v: MeshRadioSnapshot['meshBroadcastProgress']
  ) => void;
  setMeshLastBroadcastOutbound: (
    v: MeshLastBroadcastOutbound | null
  ) => void;
  /** Clear session fields; Bluetooth state unchanged. */
  clearSessionFields: () => void;
  /** Provider teardown. */
  resetForProviderUnmount: () => void;
};

export const useMeshRadioStore = create<MeshRadioSnapshot & MeshRadioActions>(
  (set) => ({
    nativeBleOk: false,
    bleState: 'Unknown',
    connectedDeviceId: null,
    nodeNum: null,
    handshakeBusy: false,
    meshInboundLast: null,
    meshBroadcastProgress: null,
    meshLastBroadcastOutbound: null,
    setNativeBleOk: (nativeBleOk) => set({ nativeBleOk }),
    setBleState: (bleState) => set({ bleState }),
    setConnectedDeviceId: (connectedDeviceId) => set({ connectedDeviceId }),
    setNodeNum: (nodeNum) => set({ nodeNum }),
    setHandshakeBusy: (handshakeBusy) => set({ handshakeBusy }),
    setMeshInboundLast: (meshInboundLast) => set({ meshInboundLast }),
    setMeshBroadcastProgress: (meshBroadcastProgress) =>
      set({ meshBroadcastProgress }),
    setMeshLastBroadcastOutbound: (meshLastBroadcastOutbound) =>
      set({ meshLastBroadcastOutbound }),
    clearSessionFields: () =>
      set({
        connectedDeviceId: null,
        nodeNum: null,
        handshakeBusy: false,
        meshBroadcastProgress: null,
      }),
    resetForProviderUnmount: () =>
      set({
        nativeBleOk: false,
        bleState: 'Unknown',
        connectedDeviceId: null,
        nodeNum: null,
        handshakeBusy: false,
        meshInboundLast: null,
        meshBroadcastProgress: null,
        meshLastBroadcastOutbound: null,
      }),
  })
);
