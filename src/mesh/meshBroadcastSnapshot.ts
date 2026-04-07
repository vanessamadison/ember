import { buildEncryptedMembersCheckInsBundle } from '../sync/snapshot';
import { communityMeshFingerprint16 } from './communityFingerprint';
import {
  EMBER_MESH_INTER_CHUNK_DELAY_MS,
  EMBER_MESH_MAX_CHUNK_PAYLOAD,
  EMBER_MESH_MAX_CIPHERTEXT,
} from './emberMeshConstants';
import {
  bytesToHexPreview,
  encodeEmberMeshDataPacketToRadio,
} from './emberMeshPacket';
import type { MeshtasticSession } from './meshtasticSession';

function spacingMs(interChunkDelayMs: number | undefined): number {
  return interChunkDelayMs ?? EMBER_MESH_INTER_CHUNK_DELAY_MS;
}

export type MeshBroadcastConfirmMulti = (
  chunks: number,
  approxSpacingSec: number
) => Promise<boolean>;

export type MeshBroadcastSnapshotResult =
  | { ok: true; meshPackets: number; bundleUtf8Bytes: number }
  | { ok: false; reason: 'cancelled' };

/**
 * Build Phase B bundle, optional multi-chunk confirmation, then v1/chunked mesh send.
 */
export async function meshBroadcastSnapshotFlow(
  session: MeshtasticSession,
  communityId: string,
  options?: {
    confirmMultiChunk?: MeshBroadcastConfirmMulti;
    onTxPreview?: (preview: string) => void;
    /** Pause between chunked v2 frames (Settings-tunable). */
    interChunkDelayMs?: number;
    /** After each ToRadio chunk write (1-based index, total). */
    onChunkProgress?: (sentOneIndexed: number, totalChunks: number) => void;
  }
): Promise<MeshBroadcastSnapshotResult> {
  const bundleB64 = await buildEncryptedMembersCheckInsBundle(communityId);
  const utf8 = new TextEncoder().encode(bundleB64);
  const chunks =
    utf8.length <= EMBER_MESH_MAX_CIPHERTEXT
      ? 1
      : Math.ceil(utf8.length / EMBER_MESH_MAX_CHUNK_PAYLOAD);

  if (chunks > 1) {
    if (!options?.confirmMultiChunk) {
      throw new Error(
        'meshBroadcastSnapshotFlow: confirmMultiChunk required for multi-chunk send'
      );
    }
    const pause = spacingMs(options?.interChunkDelayMs);
    const sec = Math.ceil(((chunks - 1) * pause) / 1000);
    const ok = await options.confirmMultiChunk(chunks, sec);
    if (!ok) return { ok: false, reason: 'cancelled' };
  }

  const fp = await communityMeshFingerprint16(communityId);
  if (utf8.length <= EMBER_MESH_MAX_CIPHERTEXT) {
    const body = encodeEmberMeshDataPacketToRadio(fp, utf8);
    options?.onTxPreview?.(bytesToHexPreview(body));
  } else {
    options?.onTxPreview?.(
      `(chunked: ${chunks} frames, ${utf8.length} B bundle utf8)`
    );
  }
  await session.sendEmberMeshMessageUtf8(fp, utf8, {
    interChunkDelayMs: options?.interChunkDelayMs,
    onChunkProgress: options?.onChunkProgress,
  });
  return { ok: true, meshPackets: chunks, bundleUtf8Bytes: utf8.length };
}
