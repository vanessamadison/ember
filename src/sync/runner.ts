import { database } from '../db';
import type Community from '../db/models/Community';
import {
  buildEncryptedMembersCheckInsBundle,
  decryptMembersCheckInsBundleJson,
} from './snapshot';
import { mergeMembersCheckInsPayload } from './merge';
import { relayPullBundle, relayPushBundle } from './httpRelay';

export interface RelaySyncResult {
  pulled: boolean;
  pushed: boolean;
  merge?: {
    membersInserted: number;
    checkInsInserted: number;
  };
}

/**
 * Pull remote ciphertext (if any), merge into the matching local community by invite code,
 * then push a fresh encrypted snapshot. Requires crypto session + relay URL.
 */
export async function syncMembersCheckInsViaRelay(
  watermelondbCommunityId: string
): Promise<RelaySyncResult> {
  const community = await database
    .get<Community>('communities')
    .find(watermelondbCommunityId)
    .catch(() => null);
  if (!community) {
    throw new Error('Community not found.');
  }

  let pulled = false;
  let merge: RelaySyncResult['merge'];

  const remoteCipher = await relayPullBundle(
    community.inviteCode,
    community.passphraseHash
  );
  if (remoteCipher) {
    const payload = decryptMembersCheckInsBundleJson(remoteCipher);
    merge = await mergeMembersCheckInsPayload(payload);
    pulled = true;
  }

  const outCipher = await buildEncryptedMembersCheckInsBundle(
    watermelondbCommunityId
  );
  await relayPushBundle(
    community.inviteCode,
    community.passphraseHash,
    outCipher
  );

  return { pulled, pushed: true, merge };
}
