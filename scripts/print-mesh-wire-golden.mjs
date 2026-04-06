/**
 * Regenerate constants in __tests__/mesh/fixtures/wireGolden.ts after protobuf upgrades.
 */
import { create, toBinary } from '@bufbuild/protobuf';
import { Mesh } from '@meshtastic/protobufs';

const STREAM_START1 = 0x94;
const STREAM_START2 = 0xc3;

function frameProtobufPayload(protobufBytes) {
  const n = protobufBytes.length;
  const out = new Uint8Array(4 + n);
  out[0] = STREAM_START1;
  out[1] = STREAM_START2;
  out[2] = (n >> 8) & 0xff;
  out[3] = n & 0xff;
  out.set(protobufBytes, 4);
  return out;
}

const want1 = create(Mesh.ToRadioSchema, {
  payloadVariant: { case: 'wantConfigId', value: 1 },
});
const wantBody = toBinary(Mesh.ToRadioSchema, want1);
console.log(
  'FRAMED_TORADIO_WANT_CONFIG_ID_1',
  JSON.stringify(Array.from(frameProtobufPayload(wantBody)))
);

const disc = create(Mesh.ToRadioSchema, {
  payloadVariant: { case: 'disconnect', value: true },
});
const discBody = toBinary(Mesh.ToRadioSchema, disc);
console.log(
  'FRAMED_TORADIO_DISCONNECT',
  JSON.stringify(Array.from(frameProtobufPayload(discBody)))
);

/** EMBER portnum 270 + envelope v2 (one chunk, deterministic fingerprint + transfer id). */
const EMBER_MESH_PORTNUM = 270;
const BROADCAST_NODE = 0xffffffff;

function buildEmberMeshEnvelopeV2Chunk(
  fingerprint16,
  transferId,
  chunkIndex,
  totalChunks,
  chunkPayload
) {
  const n = chunkPayload.length;
  const out = new Uint8Array(36 + n);
  out.set([0x45, 0x4d, 0x42, 0x31], 0);
  out[4] = 2;
  out[5] = 0;
  const dv = new DataView(out.buffer, out.byteOffset, out.byteLength);
  dv.setUint16(6, chunkIndex, false);
  out.set(fingerprint16, 8);
  dv.setBigUint64(24, transferId, false);
  dv.setUint16(32, totalChunks, false);
  dv.setUint16(34, n, false);
  out.set(chunkPayload, 36);
  return out;
}

const goldenFp = new Uint8Array(16).fill(0xab);
const goldenTid = 0x1122334455667788n;
const emberPayload = buildEmberMeshEnvelopeV2Chunk(
  goldenFp,
  goldenTid,
  0,
  1,
  new Uint8Array([0x70, 0x71])
);
const meshData = create(Mesh.DataSchema, {
  portnum: EMBER_MESH_PORTNUM,
  payload: emberPayload,
  wantResponse: false,
  dest: 0,
  source: 0,
  requestId: 0,
  replyId: 0,
  emoji: 0,
});
const meshPacket = create(Mesh.MeshPacketSchema, {
  from: 0,
  to: BROADCAST_NODE,
  channel: 0,
  payloadVariant: { case: 'decoded', value: meshData },
});
const meshToRadio = create(Mesh.ToRadioSchema, {
  payloadVariant: { case: 'packet', value: meshPacket },
});
const meshBody = toBinary(Mesh.ToRadioSchema, meshToRadio);
console.log(
  'FRAMED_TORADIO_EMBER_MESH_V2_SINGLE_CHUNK',
  JSON.stringify(Array.from(frameProtobufPayload(meshBody)))
);

const emberPayload0of2 = buildEmberMeshEnvelopeV2Chunk(
  goldenFp,
  goldenTid,
  0,
  2,
  new Uint8Array([0x61, 0x62])
);
const meshData0 = create(Mesh.DataSchema, {
  portnum: EMBER_MESH_PORTNUM,
  payload: emberPayload0of2,
  wantResponse: false,
  dest: 0,
  source: 0,
  requestId: 0,
  replyId: 0,
  emoji: 0,
});
const meshPacket0 = create(Mesh.MeshPacketSchema, {
  from: 0,
  to: BROADCAST_NODE,
  channel: 0,
  payloadVariant: { case: 'decoded', value: meshData0 },
});
const meshToRadio0 = create(Mesh.ToRadioSchema, {
  payloadVariant: { case: 'packet', value: meshPacket0 },
});
const meshBody0 = toBinary(Mesh.ToRadioSchema, meshToRadio0);
console.log(
  'FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_0_OF_2',
  JSON.stringify(Array.from(frameProtobufPayload(meshBody0)))
);

const emberPayload1of2 = buildEmberMeshEnvelopeV2Chunk(
  goldenFp,
  goldenTid,
  1,
  2,
  new Uint8Array([0x63, 0x64])
);
const meshData1 = create(Mesh.DataSchema, {
  portnum: EMBER_MESH_PORTNUM,
  payload: emberPayload1of2,
  wantResponse: false,
  dest: 0,
  source: 0,
  requestId: 0,
  replyId: 0,
  emoji: 0,
});
const meshPacket1 = create(Mesh.MeshPacketSchema, {
  from: 0,
  to: BROADCAST_NODE,
  channel: 0,
  payloadVariant: { case: 'decoded', value: meshData1 },
});
const meshToRadio1 = create(Mesh.ToRadioSchema, {
  payloadVariant: { case: 'packet', value: meshPacket1 },
});
const meshBody1 = toBinary(Mesh.ToRadioSchema, meshToRadio1);
console.log(
  'FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_1_OF_2',
  JSON.stringify(Array.from(frameProtobufPayload(meshBody1)))
);
