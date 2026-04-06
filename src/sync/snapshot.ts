import { Q } from '@nozbe/watermelondb';
import { getCryptoSession } from '../crypto/session';
import { database } from '../db';
import { normalizeInviteCode } from '../db/communityLifecycle';
import type Community from '../db/models/Community';
import type Member from '../db/models/Member';
import type CheckIn from '../db/models/CheckIn';
import type Resource from '../db/models/Resource';
import {
  MEMBERS_CHECK_INS_BUNDLE_VERSION,
  type MembersCheckInsPayloadV1,
  isMembersCheckInsPayloadV1,
} from './types';
import {
  ensureCheckInSyncIdsForCommunity,
  ensureMemberPublicIdsForCommunity,
  ensureResourcePublicIdsForCommunity,
} from './ensureIds';

const MAX_CHECK_INS_PER_BUNDLE = 500;

/** Plaintext JSON payload -> encrypted base64 (NaCl secretbox via CryptoManager). */
export async function buildEncryptedMembersCheckInsBundle(
  communityId: string
): Promise<string> {
  const mgr = getCryptoSession();
  if (!mgr?.isInitialized()) {
    throw new Error('Unlock encryption before syncing (open the community on this device).');
  }

  await ensureMemberPublicIdsForCommunity(communityId);
  await ensureCheckInSyncIdsForCommunity(communityId);
  await ensureResourcePublicIdsForCommunity(communityId);

  const community = await database
    .get<Community>('communities')
    .find(communityId)
    .catch(() => null);
  if (!community) {
    throw new Error('Community not found.');
  }

  const members = await database
    .get<Member>('members')
    .query(Q.where('community_id', communityId))
    .fetch();

  const resourceRows = await database
    .get<Resource>('resources')
    .query(Q.where('community_id', communityId))
    .fetch();

  const checkRows = await database
    .get<CheckIn>('check_ins')
    .query(Q.where('community_id', communityId))
    .fetch();
  const checkIns = [...checkRows]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_CHECK_INS_PER_BUNDLE);

  const inviteCode = normalizeInviteCode(community.inviteCode);

  const payload: MembersCheckInsPayloadV1 = {
    v: MEMBERS_CHECK_INS_BUNDLE_VERSION,
    inviteCode,
    issuedAt: Date.now(),
    members: members.map((m) => ({
      publicId: m.publicId?.trim() || '',
      name: m.name,
      role: m.role,
      avatar: m.avatar,
      bio: m.bio,
      status: m.status,
      lastCheckIn: m.lastCheckIn,
      skillsJson: m.skillsJson,
      resourcesJson: m.resourcesJson,
      ...(m.removedAt && m.removedAt > 0 ? { removedAt: m.removedAt } : {}),
    })),
    checkIns: checkIns
      .map((c) => {
        const member = members.find((m) => m.id === c.memberId);
        const memberPublicId = member?.publicId?.trim() || '';
        return {
          syncId: c.syncId?.trim() || '',
          memberPublicId,
          status: c.status,
          timestamp: c.timestamp,
          locationEncrypted: c.locationEncrypted,
          note: c.note,
        };
      })
      .filter((c) => c.syncId && c.memberPublicId),
    resources: resourceRows.map((res) => {
      const updater = members.find((m) => m.id === res.updatedBy);
      return {
        publicId: res.publicId?.trim() || '',
        category: res.category,
        name: res.name,
        quantity: res.quantity,
        unit: res.unit,
        criticalThreshold: res.criticalThreshold,
        maxCapacity: res.maxCapacity,
        icon: res.icon,
        lastUpdated: res.lastUpdated,
        updatedByMemberPublicId: updater?.publicId?.trim() || '',
      };
    }),
    ...(typeof community.inviteExpiresAt === 'number' &&
    community.inviteExpiresAt > 0
      ? { communityInviteExpiresAt: community.inviteExpiresAt }
      : {}),
  };

  const badMember = payload.members.find((m) => !m.publicId);
  if (badMember) {
    throw new Error('Member missing public_id after ensure; database may be corrupted.');
  }
  const badRes = payload.resources?.find((r) => !r.publicId);
  if (badRes) {
    throw new Error('Resource missing public_id after ensure; database may be corrupted.');
  }

  return mgr.encryptString(JSON.stringify(payload));
}

export function decryptMembersCheckInsBundleJson(
  ciphertextBase64: string
): MembersCheckInsPayloadV1 {
  const mgr = getCryptoSession();
  if (!mgr?.isInitialized()) {
    throw new Error('Unlock encryption before importing a bundle.');
  }
  const json = mgr.decryptString(ciphertextBase64);
  const data: unknown = JSON.parse(json);
  if (!isMembersCheckInsPayloadV1(data)) {
    throw new Error('Invalid or unsupported bundle payload.');
  }
  if (data.inviteCode !== normalizeInviteCode(data.inviteCode)) {
    throw new Error('Bundle invite code normalization mismatch.');
  }
  return data;
}
