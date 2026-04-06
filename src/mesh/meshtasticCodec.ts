/**
 * Meshtastic protobuf encode/decode using official schemas.
 * Dependency: @meshtastic/protobufs (GPL-3.0) — keep version pinned in package.json.
 *
 * Security:
 * - Cap decode sizes; never trust radio payloads for auth (EMBER credentials stay in app crypto).
 * - Parse failures are dropped, not propagated as crashy assumptions.
 */
import {
  create,
  fromBinary,
  toBinary,
  type MessageShape,
} from '@bufbuild/protobuf';
import { Mesh } from '@meshtastic/protobufs';
import { unframeMeshtasticStream } from './streamFraming';

/** Per Meshtastic client API / framing, single FromRadio chunk is capped at 512 B payload. */
export const MESHTASTIC_MAX_FRAMED_PAYLOAD = 512;

/** Reject assembling more than this from repeated reads before flushing to caller (DoS guard). */
export const MESHTASTIC_MAX_STREAM_BUFFER = 65536;

export type FromRadioMessage = MessageShape<typeof Mesh.FromRadioSchema>;

export function encodeWantConfigId(configId: number): Uint8Array {
  if (!Number.isInteger(configId) || configId < 0 || configId > 0xffff_ffff) {
    throw new Error('Meshtastic: want_config_id out of uint32 range');
  }
  const toRadio = create(Mesh.ToRadioSchema, {
    payloadVariant: { case: 'wantConfigId', value: configId },
  });
  return toBinary(Mesh.ToRadioSchema, toRadio);
}

export function encodeDisconnect(): Uint8Array {
  const toRadio = create(Mesh.ToRadioSchema, {
    payloadVariant: { case: 'disconnect', value: true },
  });
  return toBinary(Mesh.ToRadioSchema, toRadio);
}

/**
 * Decode protobuf bodies from a stream buffer (after unwrap of BLE read chunks).
 */
export function parseFromRadioStream(buffer: Uint8Array): {
  messages: FromRadioMessage[];
  remainder: Uint8Array;
} {
  if (buffer.length > MESHTASTIC_MAX_STREAM_BUFFER) {
    throw new Error('Meshtastic: FromRadio stream exceeds safe accumulation limit');
  }
  const { packets, remainder } = unframeMeshtasticStream(buffer);
  const messages: FromRadioMessage[] = [];
  for (const body of packets) {
    if (body.length > MESHTASTIC_MAX_FRAMED_PAYLOAD) {
      continue;
    }
    try {
      messages.push(fromBinary(Mesh.FromRadioSchema, body));
    } catch {
      /* malformed or version skew */
    }
  }
  return { messages, remainder };
}
