/**
 * Golden Meshtastic stream frames (0x94 0xc3 len_hi len_lo + ToRadio protobuf).
 * Regenerate if Meshtastic protobuf encoding changes:
 *   node scripts/print-mesh-wire-golden.mjs
 */
export const FRAMED_TORADIO_WANT_CONFIG_ID_1 = Uint8Array.from([
  148, 195, 0, 2, 24, 1,
]);

export const FRAMED_TORADIO_DISCONNECT = Uint8Array.from([
  148, 195, 0, 2, 32, 1,
]);

/** Portnum 270 + EMBER envelope v2 (one chunk, fp=0xab×16, transfer_id fixed, payload `pq`). */
export const FRAMED_TORADIO_EMBER_MESH_V2_SINGLE_CHUNK = Uint8Array.from([
  148, 195, 0, 52, 10, 50, 21, 255, 255, 255, 255, 34, 43, 8, 142, 2, 18, 38,
  69, 77, 66, 49, 2, 0, 0, 0, 171, 171, 171, 171, 171, 171, 171, 171, 171,
  171, 171, 171, 171, 171, 171, 171, 17, 34, 51, 68, 85, 102, 119, 136, 0, 1,
  0, 2, 112, 113,
]);

export const FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_0_OF_2 = Uint8Array.from([
  148, 195, 0, 52, 10, 50, 21, 255, 255, 255, 255, 34, 43, 8, 142, 2, 18, 38,
  69, 77, 66, 49, 2, 0, 0, 0, 171, 171, 171, 171, 171, 171, 171, 171, 171,
  171, 171, 171, 171, 171, 171, 171, 17, 34, 51, 68, 85, 102, 119, 136, 0, 2,
  0, 2, 97, 98,
]);

export const FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_1_OF_2 = Uint8Array.from([
  148, 195, 0, 52, 10, 50, 21, 255, 255, 255, 255, 34, 43, 8, 142, 2, 18, 38,
  69, 77, 66, 49, 2, 0, 0, 1, 171, 171, 171, 171, 171, 171, 171, 171, 171,
  171, 171, 171, 171, 171, 171, 171, 17, 34, 51, 68, 85, 102, 119, 136, 0, 2,
  0, 2, 99, 100,
]);
