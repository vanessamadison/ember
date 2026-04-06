import type { FromRadioMessage } from './meshtasticCodec';
import { EMBER_MESH_PORTNUM } from './emberMeshConstants';
import {
  tryParseEmberMeshEnvelopeV1,
  type EmberMeshEnvelopeV1,
} from './emberMeshEnvelope';

export type EmberMeshInboundListener = (msg: EmberMeshEnvelopeV1) => void;

let listener: EmberMeshInboundListener | null = null;

/** Optional hook for ciphertext merge/decrypt pipeline (Phase A). */
export function setEmberMeshInboundListener(cb: EmberMeshInboundListener | null): void {
  listener = cb;
}

export function tryExtractEmberMeshFromFromRadio(
  m: FromRadioMessage
): EmberMeshEnvelopeV1 | null {
  if (m.payloadVariant.case !== 'packet') return null;
  const p = m.payloadVariant.value;
  if (p.payloadVariant.case !== 'decoded') return null;
  const d = p.payloadVariant.value;
  if (d.portnum !== EMBER_MESH_PORTNUM) return null;
  return tryParseEmberMeshEnvelopeV1(d.payload);
}

/** Notify listener when a FromRadio message carries a valid EMBER v1 envelope. */
export function dispatchEmberMeshFromFromRadio(m: FromRadioMessage): boolean {
  const parsed = tryExtractEmberMeshFromFromRadio(m);
  if (!parsed) return false;
  listener?.(parsed);
  return true;
}
