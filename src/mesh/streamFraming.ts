/**
 * Meshtastic streaming transport framing (Serial/TCP/BLE wire format).
 * @see https://meshtastic.org/docs/development/device/client-api/
 */

export const STREAM_START1 = 0x94;
export const STREAM_START2 = 0xc3;

/** Prefix protobuf payload with 4-byte Meshtastic header. */
export function frameProtobufPayload(protobufBytes: Uint8Array): Uint8Array {
  const n = protobufBytes.length;
  if (n > 65535) {
    throw new Error('Meshtastic frame: protobuf length exceeds 16-bit field');
  }
  const out = new Uint8Array(4 + n);
  out[0] = STREAM_START1;
  out[1] = STREAM_START2;
  out[2] = (n >> 8) & 0xff;
  out[3] = n & 0xff;
  out.set(protobufBytes, 4);
  return out;
}

export interface UnframeResult {
  packets: Uint8Array[];
  remainder: Uint8Array;
}

/**
 * Split a byte buffer into len-prefixed protobuf bodies after START1/START2.
 * Invalid length (>512 per spec) resets scan to next START1.
 */
export function unframeMeshtasticStream(buffer: Uint8Array): UnframeResult {
  const packets: Uint8Array[] = [];
  let i = 0;

  while (i + 4 <= buffer.length) {
    if (buffer[i] !== STREAM_START1 || buffer[i + 1] !== STREAM_START2) {
      i += 1;
      continue;
    }
    const len = (buffer[i + 2]! << 8) | buffer[i + 3]!;
    if (len > 512) {
      i += 1;
      continue;
    }
    if (i + 4 + len > buffer.length) {
      break;
    }
    packets.push(buffer.subarray(i + 4, i + 4 + len));
    i += 4 + len;
  }

  const remainder = buffer.subarray(i);
  return { packets, remainder };
}
