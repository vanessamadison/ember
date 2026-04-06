/**
 * EMBER mesh over Meshtastic: private Portnum range 256–511 per portnums.proto.
 * Value is unregistered; open an upstream issue if you claim a permanent slot.
 */
export const EMBER_MESH_PORTNUM = 270;

/** ASCII magic for wire envelope v1 (`EMB1`). */
export const EMBER_MESH_MAGIC = Uint8Array.from([0x45, 0x4d, 0x42, 0x31]);

export const EMBER_MESH_ENVELOPE_VERSION = 1;

/** Multi-frame UTF-8 transfer (chunks of base64 bundle string). */
export const EMBER_MESH_ENVELOPE_VERSION_CHUNKED = 2;

export const EMBER_MESH_FINGERPRINT_LEN = 16;

/** Fixed header: magic(4) + ver(1) + flags(1) + reserved(2) + fingerprint(16) + len(2). */
export const EMBER_MESH_HEADER_LEN = 26;

/**
 * Budget for our blob inside Meshtastic `Data.payload` (conservative; firmware may vary).
 * v1 wire size = {@link EMBER_MESH_HEADER_LEN} + ciphertext.
 */
export const EMBER_MESH_WIRE_PAYLOAD_BUDGET = 237;

/**
 * v2 header: magic(4) + ver(1) + flags(1) + chunk_index(2) + fp(16) + transfer_id(8) + total_chunks(2) + payload_len(2).
 */
export const EMBER_MESH_V2_HEADER_LEN = 36;

export const EMBER_MESH_MAX_CHUNK_PAYLOAD =
  EMBER_MESH_WIRE_PAYLOAD_BUDGET - EMBER_MESH_V2_HEADER_LEN;

/**
 * Max UTF-8 length of sync bundle ciphertext inside envelope v1 (base64 NaCl secretbox string).
 */
export const EMBER_MESH_MAX_CIPHERTEXT =
  EMBER_MESH_WIRE_PAYLOAD_BUDGET - EMBER_MESH_HEADER_LEN;

export const EMBER_MESH_MAX_CHUNKS_PER_TRANSFER = 512;

/** Cap reassembled mesh bundle (UTF-8 bytes of base64) to limit adversarial RAM use. */
export const EMBER_MESH_MAX_ASSEMBLED_BYTES = 512 * 1024;

export const EMBER_MESH_CHUNK_ASSEMBLY_TTL_MS = 120_000;

/** Pause between ToRadio mesh frames so radios can keep up (tune per hardware). */
export const EMBER_MESH_INTER_CHUNK_DELAY_MS = 150;
