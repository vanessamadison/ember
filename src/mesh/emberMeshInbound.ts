import type { FromRadioMessage } from './meshtasticCodec';
import { EMBER_MESH_PORTNUM } from './emberMeshConstants';
import { feedEmberMeshV2Chunk } from './emberMeshChunkReassembly';
import {
  tryParseEmberMeshWirePayload,
  type EmberMeshEnvelopeV1,
} from './emberMeshEnvelope';

export type EmberMeshInboundListener = (msg: EmberMeshEnvelopeV1) => void;

const listeners = new Set<EmberMeshInboundListener>();

/** Register for EMBER v1 mesh envelopes after {@link dispatchEmberMeshFromFromRadio}. */
export function subscribeEmberMeshInbound(
  cb: EmberMeshInboundListener
): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * @deprecated Use {@link subscribeEmberMeshInbound}. Replaces all subscribers (legacy single-slot).
 */
export function setEmberMeshInboundListener(
  cb: EmberMeshInboundListener | null
): void {
  listeners.clear();
  if (cb) listeners.add(cb);
}

export function tryExtractEmberMeshFromFromRadio(
  m: FromRadioMessage
): EmberMeshEnvelopeV1 | null {
  if (m.payloadVariant.case !== 'packet') return null;
  const p = m.payloadVariant.value;
  if (p.payloadVariant.case !== 'decoded') return null;
  const d = p.payloadVariant.value;
  if (d.portnum !== EMBER_MESH_PORTNUM) return null;
  const wire = tryParseEmberMeshWirePayload(d.payload);
  if (!wire) return null;
  if (wire.kind === 'v1') return wire.envelope;
  return feedEmberMeshV2Chunk(
    wire.fingerprint,
    wire.transferId,
    wire.chunkIndex,
    wire.totalChunks,
    wire.chunk
  );
}

/** Notify subscribers when a FromRadio message carries a valid EMBER v1 envelope. */
export function dispatchEmberMeshFromFromRadio(m: FromRadioMessage): boolean {
  const parsed = tryExtractEmberMeshFromFromRadio(m);
  if (!parsed) return false;
  for (const l of listeners) {
    try {
      l(parsed);
    } catch {
      /* subscriber must not break dispatch */
    }
  }
  return true;
}
