import { communityMeshFingerprint16 } from '../mesh/communityFingerprint';
import type { EmberMeshEnvelopeV1 } from '../mesh/emberMeshEnvelope';
import { decryptMembersCheckInsBundleJson } from './snapshot';
import { mergeMembersCheckInsPayload } from './merge';

export type MeshInboundMergeResult =
  | {
      ok: true;
      membersInserted: number;
      checkInsInserted: number;
      emergencyPlansInserted: number;
      messagesInserted: number;
      drillsInserted: number;
    }
  | {
      ok: false;
      reason:
        | 'no_community'
        | 'fingerprint_mismatch'
        | 'decrypt_failed'
        | 'merge_failed';
      detail?: string;
    };

function u8equal(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

/**
 * Verify mesh envelope targets this community, decrypt NaCl bundle (base64 in UTF-8), merge into SQLite.
 */
export async function mergeFromEmberMeshEnvelopeForCommunity(
  envelope: EmberMeshEnvelopeV1,
  activeCommunityId: string
): Promise<MeshInboundMergeResult> {
  if (!activeCommunityId || activeCommunityId === '__none__') {
    return { ok: false, reason: 'no_community' };
  }

  const expected = await communityMeshFingerprint16(activeCommunityId);
  if (!u8equal(envelope.fingerprint, expected)) {
    return { ok: false, reason: 'fingerprint_mismatch' };
  }

  let bundleB64: string;
  try {
    bundleB64 = new TextDecoder('utf-8').decode(envelope.ciphertext);
  } catch (e) {
    return {
      ok: false,
      reason: 'decrypt_failed',
      detail: e instanceof Error ? e.message : 'utf8',
    };
  }

  let payload: ReturnType<typeof decryptMembersCheckInsBundleJson>;
  try {
    payload = decryptMembersCheckInsBundleJson(bundleB64);
  } catch (e) {
    return {
      ok: false,
      reason: 'decrypt_failed',
      detail: e instanceof Error ? e.message : String(e),
    };
  }

  try {
    const r = await mergeMembersCheckInsPayload(payload);
    return {
      ok: true,
      membersInserted: r.membersInserted,
      checkInsInserted: r.checkInsInserted,
      emergencyPlansInserted: r.emergencyPlansInserted,
      messagesInserted: r.messagesInserted,
      drillsInserted: r.drillsInserted,
    };
  } catch (e) {
    return {
      ok: false,
      reason: 'merge_failed',
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}
