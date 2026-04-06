import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { Mesh } from '@meshtastic/protobufs';
import {
  encodeDisconnect,
  encodeWantConfigId,
  parseFromRadioStream,
} from '../../src/mesh/meshtasticCodec';
import { frameProtobufPayload } from '../../src/mesh/streamFraming';

describe('meshtasticCodec', () => {
  it('encodeWantConfigId produces decodable ToRadio wire', () => {
    const bytes = encodeWantConfigId(0x42);
    const decoded = fromBinary(Mesh.ToRadioSchema, bytes);
    expect(decoded.payloadVariant.case).toBe('wantConfigId');
    if (decoded.payloadVariant.case === 'wantConfigId') {
      expect(decoded.payloadVariant.value).toBe(0x42);
    }
  });

  it('encodeWantConfigId rejects out-of-range id', () => {
    expect(() => encodeWantConfigId(-1)).toThrow();
    expect(() => encodeWantConfigId(1.5)).toThrow();
  });

  it('parseFromRadioStream decodes framed FromRadio', () => {
    const inner = create(Mesh.FromRadioSchema, {
      id: 7,
      payloadVariant: { case: 'rebooted', value: true },
    });
    const raw = toBinary(Mesh.FromRadioSchema, inner);
    const framed = frameProtobufPayload(raw);
    const { messages, remainder } = parseFromRadioStream(framed);
    expect(remainder.length).toBe(0);
    expect(messages.length).toBe(1);
    expect(messages[0]!.id).toBe(7);
    expect(messages[0]!.payloadVariant.case).toBe('rebooted');
  });

  it('encodeDisconnect sets disconnect variant', () => {
    const bytes = encodeDisconnect();
    const decoded = fromBinary(Mesh.ToRadioSchema, bytes);
    expect(decoded.payloadVariant.case).toBe('disconnect');
  });
});
