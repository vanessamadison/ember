import { create, toBinary } from '@bufbuild/protobuf';
import { Mesh } from '@meshtastic/protobufs';
import { digestFromRadioMessages } from '../../src/mesh/fromRadioSummary';
import { parseFromRadioStream } from '../../src/mesh/meshtasticCodec';
import { frameProtobufPayload } from '../../src/mesh/streamFraming';

describe('digestFromRadioMessages', () => {
  it('summarizes myInfo and configCompleteId', () => {
    const inner = create(Mesh.FromRadioSchema, {
      id: 1,
      payloadVariant: {
        case: 'myInfo',
        value: create(Mesh.MyNodeInfoSchema, {
          myNodeNum: 123,
          nodedbCount: 4,
          pioEnv: 'rak4631',
          rebootCount: 0,
          minAppVersion: 0,
          deviceId: new Uint8Array(),
          firmwareEdition: 0,
        }),
      },
    });
    const inner2 = create(Mesh.FromRadioSchema, {
      id: 2,
      payloadVariant: { case: 'configCompleteId', value: 7 },
    });
    const bytes = new Uint8Array(
      frameProtobufPayload(toBinary(Mesh.FromRadioSchema, inner)).length +
        frameProtobufPayload(toBinary(Mesh.FromRadioSchema, inner2)).length
    );
    let o = 0;
    for (const msg of [inner, inner2]) {
      const fr = frameProtobufPayload(toBinary(Mesh.FromRadioSchema, msg));
      bytes.set(fr, o);
      o += fr.length;
    }
    const { messages } = parseFromRadioStream(bytes);
    const d = digestFromRadioMessages(messages, 7);
    expect(d.nodeNum).toBe(123);
    expect(d.lines.some((l) => l.includes('num=123'))).toBe(true);
    expect(d.lines.some((l) => l.includes('ConfigComplete') && l.includes('matches'))).toBe(
      true
    );
  });
});
