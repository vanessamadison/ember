/**
 * EMBER mesh over Meshtastic: private Portnum range 256–511 per portnums.proto.
 * Value is unregistered; open an upstream issue if you claim a permanent slot.
 */
export const EMBER_MESH_PORTNUM = 270;

/** ASCII magic for wire envelope v1 (`EMB1`). */
export const EMBER_MESH_MAGIC = Uint8Array.from([0x45, 0x4d, 0x42, 0x31]);

export const EMBER_MESH_ENVELOPE_VERSION = 1;

export const EMBER_MESH_FINGERPRINT_LEN = 16;

/** Fixed header: magic(4) + ver(1) + flags(1) + reserved(2) + fingerprint(16) + len(2). */
export const EMBER_MESH_HEADER_LEN = 26;

/** Conservative ciphertext cap for LoRa airtime (v1); raise only after RF testing. */
export const EMBER_MESH_MAX_CIPHERTEXT = 200;
