import {
  EMBER_MESH_ENVELOPE_VERSION,
  EMBER_MESH_FINGERPRINT_LEN,
  EMBER_MESH_HEADER_LEN,
  EMBER_MESH_MAGIC,
  EMBER_MESH_MAX_CIPHERTEXT,
} from './emberMeshConstants';

export interface EmberMeshEnvelopeV1 {
  fingerprint: Uint8Array;
  ciphertext: Uint8Array;
}

export function buildEmberMeshEnvelopeV1(
  fingerprint16: Uint8Array,
  ciphertext: Uint8Array
): Uint8Array {
  if (fingerprint16.length !== EMBER_MESH_FINGERPRINT_LEN) {
    throw new Error(
      `EMBER mesh envelope: fingerprint must be ${EMBER_MESH_FINGERPRINT_LEN} bytes`
    );
  }
  if (ciphertext.length > EMBER_MESH_MAX_CIPHERTEXT) {
    throw new Error(
      `EMBER mesh envelope: ciphertext exceeds ${EMBER_MESH_MAX_CIPHERTEXT} bytes`
    );
  }
  const out = new Uint8Array(EMBER_MESH_HEADER_LEN + ciphertext.length);
  out.set(EMBER_MESH_MAGIC, 0);
  out[4] = EMBER_MESH_ENVELOPE_VERSION;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out.set(fingerprint16, 8);
  new DataView(out.buffer, out.byteOffset, out.byteLength).setUint16(
    24,
    ciphertext.length,
    false
  );
  out.set(ciphertext, 26);
  return out;
}

export function tryParseEmberMeshEnvelopeV1(
  payload: Uint8Array
): EmberMeshEnvelopeV1 | null {
  if (payload.length < EMBER_MESH_HEADER_LEN) return null;
  for (let i = 0; i < EMBER_MESH_MAGIC.length; i++) {
    if (payload[i] !== EMBER_MESH_MAGIC[i]) return null;
  }
  if (payload[4] !== EMBER_MESH_ENVELOPE_VERSION) return null;
  const len = new DataView(
    payload.buffer,
    payload.byteOffset,
    payload.byteLength
  ).getUint16(24, false);
  if (len > EMBER_MESH_MAX_CIPHERTEXT) return null;
  if (payload.length < EMBER_MESH_HEADER_LEN + len) return null;
  return {
    fingerprint: payload.subarray(8, 24),
    ciphertext: payload.subarray(26, 26 + len),
  };
}
