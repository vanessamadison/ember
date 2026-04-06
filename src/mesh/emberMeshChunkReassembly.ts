import type { EmberMeshEnvelopeV1 } from './emberMeshEnvelope';
import {
  EMBER_MESH_CHUNK_ASSEMBLY_TTL_MS,
  EMBER_MESH_MAX_ASSEMBLED_BYTES,
  EMBER_MESH_MAX_CHUNKS_PER_TRANSFER,
} from './emberMeshConstants';

function fpKey(fp: Uint8Array): string {
  let s = '';
  for (let i = 0; i < fp.length; i++) {
    s += fp[i]!.toString(16).padStart(2, '0');
  }
  return s;
}

function transferKey(fingerprint: Uint8Array, transferId: bigint): string {
  return `${fpKey(fingerprint)}:${transferId.toString(10)}`;
}

type Pending = {
  fingerprint: Uint8Array;
  transferId: bigint;
  totalChunks: number;
  parts: Map<number, Uint8Array>;
  lastTouch: number;
  totalBytes: number;
};

const pending = new Map<string, Pending>();
const MAX_PENDING_TRANSFERS = 32;

function pruneExpired(now: number): void {
  for (const [k, p] of pending) {
    if (now - p.lastTouch > EMBER_MESH_CHUNK_ASSEMBLY_TTL_MS) {
      pending.delete(k);
    }
  }
}

function enforcePendingCap(now: number): void {
  if (pending.size <= MAX_PENDING_TRANSFERS) return;
  const entries = [...pending.entries()].sort(
    (a, b) => a[1].lastTouch - b[1].lastTouch
  );
  const drop = entries.slice(0, pending.size - MAX_PENDING_TRANSFERS + 1);
  for (const [k] of drop) pending.delete(k);
  void now;
}

/**
 * Feed one v2 chunk. Returns a complete logical envelope (v1-shaped) when all chunks arrived.
 */
export function feedEmberMeshV2Chunk(
  fingerprint: Uint8Array,
  transferId: bigint,
  chunkIndex: number,
  totalChunks: number,
  chunk: Uint8Array
): EmberMeshEnvelopeV1 | null {
  const now = Date.now();
  pruneExpired(now);

  if (
    totalChunks < 1 ||
    totalChunks > EMBER_MESH_MAX_CHUNKS_PER_TRANSFER ||
    chunkIndex < 0 ||
    chunkIndex >= totalChunks
  ) {
    return null;
  }

  const k = transferKey(fingerprint, transferId);
  let slot = pending.get(k);
  if (!slot) {
    enforcePendingCap(now);
    slot = {
      fingerprint: fingerprint.slice(),
      transferId,
      totalChunks,
      parts: new Map(),
      lastTouch: now,
      totalBytes: 0,
    };
    pending.set(k, slot);
  } else if (slot.totalChunks !== totalChunks) {
    pending.delete(k);
    return null;
  }

  slot.lastTouch = now;

  const prev = slot.parts.get(chunkIndex);
  const prevLen = prev?.byteLength ?? 0;
  slot.totalBytes -= prevLen;
  slot.parts.set(chunkIndex, chunk);
  slot.totalBytes += chunk.byteLength;

  if (slot.totalBytes > EMBER_MESH_MAX_ASSEMBLED_BYTES) {
    pending.delete(k);
    return null;
  }

  if (slot.parts.size < totalChunks) {
    return null;
  }

  const merged = new Uint8Array(slot.totalBytes);
  let o = 0;
  for (let i = 0; i < totalChunks; i++) {
    const part = slot.parts.get(i);
    if (!part) {
      return null;
    }
    merged.set(part, o);
    o += part.byteLength;
  }

  pending.delete(k);

  return {
    fingerprint: slot.fingerprint.slice(),
    ciphertext: merged,
  };
}

/** Test helper / teardown */
export function clearEmberMeshChunkAssemblyState(): void {
  pending.clear();
}
