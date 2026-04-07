import type { MeshInboundLast, MeshLastBroadcastOutbound } from './meshRadioStore';

export type MeshDiagnosticInput = {
  digestLines: readonly string[];
  /** Shown in header so readers know UI truncates to this many lines. */
  uiLogLineCap: number;
  meshBleStateLabel: string;
  platform: string;
  connectedDeviceId: string | null;
  nodeNum: number | null;
  interChunkDelayMs: number;
  meshInboundLast: MeshInboundLast | null;
  meshLastBroadcastOutbound: MeshLastBroadcastOutbound | null;
  meshError: string | null;
  meshLastTxHex: string | null;
  meshInboundNote: string | null;
};

/** Plaintext blob for clipboard, share sheet, or field logs. */
export function buildMeshDiagnosticText(input: MeshDiagnosticInput): string {
  const {
    digestLines,
    uiLogLineCap,
    meshBleStateLabel,
    platform,
    connectedDeviceId,
    nodeNum,
    interChunkDelayMs,
    meshInboundLast,
    meshLastBroadcastOutbound,
    meshError,
    meshLastTxHex,
    meshInboundNote,
  } = input;

  const parts = [
    'EMBER mesh diagnostic export',
    `Time (ISO): ${new Date().toISOString()}`,
    `Platform: ${platform}`,
    `Bluetooth: ${meshBleStateLabel}`,
    `Connected device: ${connectedDeviceId ?? '(none)'}`,
    `Radio node num: ${nodeNum != null ? String(nodeNum) : '(none)'}`,
    `Chunk spacing (ms): ${interChunkDelayMs}`,
    meshInboundLast
      ? `Last mesh import: ${meshInboundLast.ok ? 'ok' : 'fail'} at ${new Date(meshInboundLast.at).toISOString()}${meshInboundLast.ok ? ` +${meshInboundLast.membersInserted} members, +${meshInboundLast.checkInsInserted} check-ins` : ` ${meshInboundLast.reason}${meshInboundLast.detail ? ` — ${meshInboundLast.detail}` : ''}`}`
      : 'Last mesh import: (none)',
    meshLastBroadcastOutbound
      ? `Last mesh send (outbound): ${new Date(meshLastBroadcastOutbound.at).toISOString()} · ${meshLastBroadcastOutbound.meshPackets} packets · ${meshLastBroadcastOutbound.bundleUtf8Bytes} B bundle utf8`
      : 'Last mesh send (outbound): (none)',
    meshError ? `Mesh UI error: ${meshError}` : null,
    meshLastTxHex ? `Last ToRadio preview: ${meshLastTxHex}` : null,
    meshInboundNote ? `Inbound note: ${meshInboundNote}` : null,
    '--- FromRadio digest lines (export buffer; UI shows last ' +
      String(uiLogLineCap) +
      ' lines only) ---',
    ...digestLines,
  ].filter((x): x is string => x != null && x !== '');
  return parts.join('\n');
}
