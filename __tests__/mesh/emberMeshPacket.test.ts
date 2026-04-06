import { fromBinary } from '@bufbuild/protobuf';
import { tryParseEmberMeshEnvelopeV1 } from '../../src/mesh/emberMeshEnvelope';
import { encodeEmberMeshDataPacketToRadio } from '../../src/mesh/emberMeshPacket';
import { EMBER_MESH_PORTNUM } from '../../src/mesh/emberMeshConstants';
import { Mesh } from '@meshtastic/protobufs';

describe('emberMeshPacket', () => {
  it('encodes ToRadio.packet with EMBER portnum and envelope', () => {
    const fp = new Uint8Array(16);
    fp[0] = 0xab;
    const cipher = new Uint8Array([0x10, 0x20]);
    const body = encodeEmberMeshDataPacketToRadio(fp, cipher);
    const toRadio = fromBinary(Mesh.ToRadioSchema, body);
    expect(toRadio.payloadVariant.case).toBe('packet');
    if (toRadio.payloadVariant.case !== 'packet') return;
    const pkt = toRadio.payloadVariant.value;
    expect(pkt.payloadVariant.case).toBe('decoded');
    if (pkt.payloadVariant.case !== 'decoded') return;
    const data = pkt.payloadVariant.value;
    expect(data.portnum).toBe(EMBER_MESH_PORTNUM);
    const inner = tryParseEmberMeshEnvelopeV1(data.payload);
    expect(inner).not.toBeNull();
    expect(Array.from(inner!.ciphertext)).toEqual([0x10, 0x20]);
    expect(inner!.fingerprint[0]).toBe(0xab);
  });
});
