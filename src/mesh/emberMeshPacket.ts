import { create, toBinary } from '@bufbuild/protobuf';
import { Mesh } from '@meshtastic/protobufs';
import { buildEmberMeshEnvelopeV1 } from './emberMeshEnvelope';
import { EMBER_MESH_PORTNUM } from './emberMeshConstants';

const BROADCAST_NODE = 0xffffffff;

/** First n bytes as lowercase hex (for dev logs). */
export function bytesToHexPreview(bytes: Uint8Array, maxBytes = 96): string {
  const n = Math.min(bytes.length, maxBytes);
  let s = '';
  for (let i = 0; i < n; i++) {
    s += bytes[i]!.toString(16).padStart(2, '0');
  }
  if (bytes.length > maxBytes) {
    s += '…';
  }
  return s;
}

/**
 * Build ToRadio.body bytes: MeshPacket(decoded Data with EMBER portnum + wire envelope bytes).
 */
export function encodeEmberMeshWireBytesToRadio(
  envelopeWireBytes: Uint8Array
): Uint8Array {
  const data = create(Mesh.DataSchema, {
    portnum: EMBER_MESH_PORTNUM,
    payload: envelopeWireBytes,
    wantResponse: false,
    dest: 0,
    source: 0,
    requestId: 0,
    replyId: 0,
    emoji: 0,
  });
  const packet = create(Mesh.MeshPacketSchema, {
    from: 0,
    to: BROADCAST_NODE,
    channel: 0,
    payloadVariant: { case: 'decoded', value: data },
  });
  const toRadio = create(Mesh.ToRadioSchema, {
    payloadVariant: { case: 'packet', value: packet },
  });
  return toBinary(Mesh.ToRadioSchema, toRadio);
}

/**
 * Build ToRadio.body bytes: MeshPacket(decoded Data with EMBER portnum + v1 envelope).
 */
export function encodeEmberMeshDataPacketToRadio(
  fingerprint16: Uint8Array,
  ciphertext: Uint8Array
): Uint8Array {
  const envelope = buildEmberMeshEnvelopeV1(fingerprint16, ciphertext);
  return encodeEmberMeshWireBytesToRadio(envelope);
}
