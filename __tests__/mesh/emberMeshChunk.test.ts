import {
  buildEmberMeshEnvelopeV2Chunk,
  tryParseEmberMeshWirePayload,
} from '../../src/mesh/emberMeshEnvelope';
import {
  clearEmberMeshChunkAssemblyState,
  feedEmberMeshV2Chunk,
} from '../../src/mesh/emberMeshChunkReassembly';
import { EMBER_MESH_MAX_CHUNK_PAYLOAD } from '../../src/mesh/emberMeshConstants';

describe('ember mesh chunking', () => {
  const fp = new Uint8Array(16).fill(3);
  const tid = 0x1122334455667788n;

  beforeEach(() => {
    clearEmberMeshChunkAssemblyState();
  });

  it('v2 round-trips one chunk', () => {
    const chunk = new Uint8Array([9, 8, 7]);
    const wire = buildEmberMeshEnvelopeV2Chunk(fp, tid, 0, 1, chunk);
    const parsed = tryParseEmberMeshWirePayload(wire);
    expect(parsed?.kind).toBe('v2chunk');
    if (parsed?.kind !== 'v2chunk') return;
    expect(parsed.chunkIndex).toBe(0);
    expect(parsed.totalChunks).toBe(1);
    expect(parsed.transferId).toBe(tid);
    expect(Array.from(parsed.chunk)).toEqual([9, 8, 7]);
  });

  it('reassembles chunks out of order', () => {
    const msg = new TextEncoder().encode('hello-mesh-sync');
    const total = 3;
    const a = msg.subarray(0, 6);
    const b = msg.subarray(6, 12);
    const c = msg.subarray(12);

    expect(
      feedEmberMeshV2Chunk(fp, tid, 1, total, b)
    ).toBeNull();
    const done = feedEmberMeshV2Chunk(fp, tid, 2, total, c);
    expect(done).toBeNull();
    const full = feedEmberMeshV2Chunk(fp, tid, 0, total, a);
    expect(full).not.toBeNull();
    expect(new TextDecoder().decode(full!.ciphertext)).toBe('hello-mesh-sync');
  });

  it('rejects oversize chunk payload in wire parse', () => {
    const big = new Uint8Array(EMBER_MESH_MAX_CHUNK_PAYLOAD + 1);
    expect(() =>
      buildEmberMeshEnvelopeV2Chunk(fp, tid, 0, 1, big)
    ).toThrow(/exceeds/);
  });
});
