import { create } from '@bufbuild/protobuf';
import { Mesh } from '@meshtastic/protobufs';
import {
  dispatchEmberMeshFromFromRadio,
  subscribeEmberMeshInbound,
  setEmberMeshInboundListener,
} from '../../src/mesh/emberMeshInbound';
import { buildEmberMeshEnvelopeV1 } from '../../src/mesh/emberMeshEnvelope';
import { EMBER_MESH_PORTNUM } from '../../src/mesh/emberMeshConstants';
import type { FromRadioMessage } from '../../src/mesh/meshtasticCodec';

function fakeFromRadioWithEmberPayload(
  ciphertext: Uint8Array
): FromRadioMessage {
  const fp = new Uint8Array(16).fill(7);
  const innerEnv = buildEmberMeshEnvelopeV1(fp, ciphertext);
  const data = create(Mesh.DataSchema, {
    portnum: EMBER_MESH_PORTNUM,
    payload: innerEnv,
    wantResponse: false,
    dest: 0,
    source: 0,
    requestId: 0,
    replyId: 0,
    emoji: 0,
  });
  const packet = create(Mesh.MeshPacketSchema, {
    from: 0,
    to: 0xffffffff,
    channel: 0,
    payloadVariant: { case: 'decoded', value: data },
  });
  return create(Mesh.FromRadioSchema, {
    id: 1,
    payloadVariant: { case: 'packet', value: packet },
  }) as unknown as FromRadioMessage;
}

describe('emberMeshInbound', () => {
  it('subscribeEmberMeshInbound notifies all subscribers', () => {
    const hits: number[] = [];
    const u1 = subscribeEmberMeshInbound(() => {
      hits.push(1);
    });
    const u2 = subscribeEmberMeshInbound(() => {
      hits.push(2);
    });

    const msg = fakeFromRadioWithEmberPayload(new Uint8Array([9]));
    dispatchEmberMeshFromFromRadio(msg);
    expect(hits.sort()).toEqual([1, 2]);

    u1();
    u2();
  });

  it('setEmberMeshInboundListener replaces subscribers', () => {
    const hits: string[] = [];
    subscribeEmberMeshInbound(() => {
      hits.push('a');
    });
    setEmberMeshInboundListener(() => {
      hits.push('b');
    });

    dispatchEmberMeshFromFromRadio(
      fakeFromRadioWithEmberPayload(new Uint8Array([1]))
    );
    expect(hits).toEqual(['b']);

    setEmberMeshInboundListener(null);
    dispatchEmberMeshFromFromRadio(
      fakeFromRadioWithEmberPayload(new Uint8Array([2]))
    );
    expect(hits).toEqual(['b']);
  });
});
