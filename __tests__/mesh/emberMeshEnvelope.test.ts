import {
  buildEmberMeshEnvelopeV1,
  tryParseEmberMeshEnvelopeV1,
} from '../../src/mesh/emberMeshEnvelope';
import { EMBER_MESH_MAX_CIPHERTEXT } from '../../src/mesh/emberMeshConstants';

describe('emberMeshEnvelope', () => {
  const fp = new Uint8Array(16).fill(7);

  it('round-trips v1 envelope', () => {
    const cipher = new Uint8Array([1, 2, 3, 0xff]);
    const env = buildEmberMeshEnvelopeV1(fp, cipher);
    const back = tryParseEmberMeshEnvelopeV1(env);
    expect(back).not.toBeNull();
    expect(Array.from(back!.fingerprint)).toEqual(Array.from(fp));
    expect(Array.from(back!.ciphertext)).toEqual(Array.from(cipher));
  });

  it('rejects wrong magic', () => {
    const env = buildEmberMeshEnvelopeV1(fp, new Uint8Array([1]));
    env[0] = 0;
    expect(tryParseEmberMeshEnvelopeV1(env)).toBeNull();
  });

  it('builder rejects oversize ciphertext', () => {
    const big = new Uint8Array(EMBER_MESH_MAX_CIPHERTEXT + 1);
    expect(() => buildEmberMeshEnvelopeV1(fp, big)).toThrow(/exceeds/);
  });

  it('parser rejects declared length over cap', () => {
    const env = buildEmberMeshEnvelopeV1(fp, new Uint8Array([1]));
    const dv = new DataView(env.buffer, env.byteOffset, env.byteLength);
    dv.setUint16(24, EMBER_MESH_MAX_CIPHERTEXT + 1, false);
    expect(tryParseEmberMeshEnvelopeV1(env)).toBeNull();
  });
});
