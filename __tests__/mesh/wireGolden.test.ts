import { buildEmberMeshEnvelopeV2Chunk } from '../../src/mesh/emberMeshEnvelope';
import { encodeEmberMeshWireBytesToRadio } from '../../src/mesh/emberMeshPacket';
import {
  encodeDisconnect,
  encodeWantConfigId,
} from '../../src/mesh/meshtasticCodec';
import {
  frameProtobufPayload,
  unframeMeshtasticStream,
} from '../../src/mesh/streamFraming';
import {
  FRAMED_TORADIO_DISCONNECT,
  FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_0_OF_2,
  FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_1_OF_2,
  FRAMED_TORADIO_EMBER_MESH_V2_SINGLE_CHUNK,
  FRAMED_TORADIO_WANT_CONFIG_ID_1,
} from './fixtures/wireGolden';

describe('mesh wire golden fixtures (P4)', () => {
  it('framed want_config id=1 matches committed bytes', () => {
    const got = frameProtobufPayload(encodeWantConfigId(1));
    expect(Array.from(got)).toEqual(Array.from(FRAMED_TORADIO_WANT_CONFIG_ID_1));
  });

  it('framed disconnect matches committed bytes', () => {
    const got = frameProtobufPayload(encodeDisconnect());
    expect(Array.from(got)).toEqual(Array.from(FRAMED_TORADIO_DISCONNECT));
  });

  it('framed EMBER mesh v2 single-chunk ToRadio matches committed bytes', () => {
    const fp = new Uint8Array(16).fill(0xab);
    const wire = buildEmberMeshEnvelopeV2Chunk(
      fp,
      0x1122334455667788n,
      0,
      1,
      new Uint8Array([0x70, 0x71])
    );
    const got = frameProtobufPayload(encodeEmberMeshWireBytesToRadio(wire));
    expect(Array.from(got)).toEqual(
      Array.from(FRAMED_TORADIO_EMBER_MESH_V2_SINGLE_CHUNK)
    );
  });

  it('framed EMBER mesh v2 chunk 0 and 1 of 2 match committed bytes', () => {
    const fp = new Uint8Array(16).fill(0xab);
    const tid = 0x1122334455667788n;
    const w0 = buildEmberMeshEnvelopeV2Chunk(
      fp,
      tid,
      0,
      2,
      new Uint8Array([0x61, 0x62])
    );
    const w1 = buildEmberMeshEnvelopeV2Chunk(
      fp,
      tid,
      1,
      2,
      new Uint8Array([0x63, 0x64])
    );
    expect(
      Array.from(frameProtobufPayload(encodeEmberMeshWireBytesToRadio(w0)))
    ).toEqual(Array.from(FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_0_OF_2));
    expect(
      Array.from(frameProtobufPayload(encodeEmberMeshWireBytesToRadio(w1)))
    ).toEqual(Array.from(FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_1_OF_2));
  });

  it('concatenated v2 chunk 0 and 1 frames unframe to two packets', () => {
    const a = FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_0_OF_2;
    const b = FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_1_OF_2;
    const merged = new Uint8Array(a.length + b.length);
    merged.set(a, 0);
    merged.set(b, a.length);
    const { packets, remainder } = unframeMeshtasticStream(merged);
    expect(remainder.length).toBe(0);
    expect(packets.length).toBe(2);
  });

  it('golden frames parse as single FromRadio-length packets in stream unframe', () => {
    for (const framed of [
      FRAMED_TORADIO_WANT_CONFIG_ID_1,
      FRAMED_TORADIO_DISCONNECT,
      FRAMED_TORADIO_EMBER_MESH_V2_SINGLE_CHUNK,
      FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_0_OF_2,
      FRAMED_TORADIO_EMBER_MESH_V2_CHUNK_1_OF_2,
    ]) {
      const { packets, remainder } = unframeMeshtasticStream(framed);
      expect(remainder.length).toBe(0);
      expect(packets.length).toBe(1);
      expect(packets[0]!.length).toBe(framed.length - 4);
    }
  });
});
