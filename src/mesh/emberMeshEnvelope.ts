import {
  EMBER_MESH_ENVELOPE_VERSION,
  EMBER_MESH_ENVELOPE_VERSION_CHUNKED,
  EMBER_MESH_FINGERPRINT_LEN,
  EMBER_MESH_HEADER_LEN,
  EMBER_MESH_MAGIC,
  EMBER_MESH_MAX_CHUNK_PAYLOAD,
  EMBER_MESH_MAX_CHUNKS_PER_TRANSFER,
  EMBER_MESH_MAX_CIPHERTEXT,
  EMBER_MESH_V2_HEADER_LEN,
} from './emberMeshConstants';

export interface EmberMeshEnvelopeV1 {
  fingerprint: Uint8Array;
  ciphertext: Uint8Array;
}

export type EmberMeshWireParsed =
  | { kind: 'v1'; envelope: EmberMeshEnvelopeV1 }
  | {
      kind: 'v2chunk';
      fingerprint: Uint8Array;
      transferId: bigint;
      chunkIndex: number;
      totalChunks: number;
      chunk: Uint8Array;
    };

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

/** One frame of a multi-part UTF-8 transfer (same semantics as v1 `ciphertext` when concatenated). */
export function buildEmberMeshEnvelopeV2Chunk(
  fingerprint16: Uint8Array,
  transferId: bigint,
  chunkIndex: number,
  totalChunks: number,
  chunkPayload: Uint8Array
): Uint8Array {
  if (fingerprint16.length !== EMBER_MESH_FINGERPRINT_LEN) {
    throw new Error('EMBER mesh v2: bad fingerprint length');
  }
  if (
    totalChunks < 1 ||
    totalChunks > EMBER_MESH_MAX_CHUNKS_PER_TRANSFER ||
    chunkIndex < 0 ||
    chunkIndex >= totalChunks
  ) {
    throw new Error('EMBER mesh v2: invalid chunk indices');
  }
  if (chunkPayload.length > EMBER_MESH_MAX_CHUNK_PAYLOAD) {
    throw new Error(
      `EMBER mesh v2: chunk exceeds ${EMBER_MESH_MAX_CHUNK_PAYLOAD} bytes`
    );
  }
  const out = new Uint8Array(EMBER_MESH_V2_HEADER_LEN + chunkPayload.length);
  out.set(EMBER_MESH_MAGIC, 0);
  out[4] = EMBER_MESH_ENVELOPE_VERSION_CHUNKED;
  out[5] = 0;
  new DataView(out.buffer, out.byteOffset, out.byteLength).setUint16(
    6,
    chunkIndex,
    false
  );
  out.set(fingerprint16, 8);
  new DataView(out.buffer, out.byteOffset, out.byteLength).setBigUint64(
    24,
    transferId,
    false
  );
  new DataView(out.buffer, out.byteOffset, out.byteLength).setUint16(
    32,
    totalChunks,
    false
  );
  new DataView(out.buffer, out.byteOffset, out.byteLength).setUint16(
    34,
    chunkPayload.length,
    false
  );
  out.set(chunkPayload, 36);
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

export function tryParseEmberMeshWirePayload(
  payload: Uint8Array
): EmberMeshWireParsed | null {
  if (payload.length < EMBER_MESH_HEADER_LEN) return null;
  for (let i = 0; i < EMBER_MESH_MAGIC.length; i++) {
    if (payload[i] !== EMBER_MESH_MAGIC[i]) return null;
  }
  const ver = payload[4];
  if (ver === EMBER_MESH_ENVELOPE_VERSION) {
    const env = tryParseEmberMeshEnvelopeV1(payload);
    return env ? { kind: 'v1', envelope: env } : null;
  }
  if (ver !== EMBER_MESH_ENVELOPE_VERSION_CHUNKED) return null;
  if (payload.length < EMBER_MESH_V2_HEADER_LEN) return null;

  const chunkIndex = new DataView(
    payload.buffer,
    payload.byteOffset,
    payload.byteLength
  ).getUint16(6, false);
  const fingerprint = payload.subarray(8, 24);
  const transferId = new DataView(
    payload.buffer,
    payload.byteOffset,
    payload.byteLength
  ).getBigUint64(24, false);
  const totalChunks = new DataView(
    payload.buffer,
    payload.byteOffset,
    payload.byteLength
  ).getUint16(32, false);
  const payloadLen = new DataView(
    payload.buffer,
    payload.byteOffset,
    payload.byteLength
  ).getUint16(34, false);

  if (payloadLen > EMBER_MESH_MAX_CHUNK_PAYLOAD) return null;
  if (payload.length < EMBER_MESH_V2_HEADER_LEN + payloadLen) return null;
  if (
    totalChunks < 1 ||
    totalChunks > EMBER_MESH_MAX_CHUNKS_PER_TRANSFER ||
    chunkIndex >= totalChunks
  ) {
    return null;
  }

  return {
    kind: 'v2chunk',
    fingerprint,
    transferId,
    chunkIndex,
    totalChunks,
    chunk: payload.subarray(36, 36 + payloadLen),
  };
}
