import { Q } from '@nozbe/watermelondb';
import { getCryptoSession } from '../crypto/session';
import { database } from '../db';
import { normalizeInviteCode } from '../db/communityLifecycle';
import type Community from '../db/models/Community';
import type Member from '../db/models/Member';
import type CheckIn from '../db/models/CheckIn';
import type Resource from '../db/models/Resource';
import type EmergencyPlan from '../db/models/EmergencyPlan';
import type Message from '../db/models/Message';
import type Drill from '../db/models/Drill';
import {
  PHASE_B_BUNDLE_VERSION,
  type PhaseBSyncPayloadV2,
  isPhaseBSyncPayload,
  type PhaseBSyncPayload,
} from './types';
import {
  ensureCheckInSyncIdsForCommunity,
  ensureMemberPublicIdsForCommunity,
  ensureResourcePublicIdsForCommunity,
  ensureEmergencyPlanPublicIdsForCommunity,
  ensureMessagePublicIdsForCommunity,
  ensureDrillPublicIdsForCommunity,
  ensureDrillLastUpdatedForCommunity,
} from './ensureIds';
import { EMBER_MESH_MAX_CIPHERTEXT } from '../mesh/emberMeshConstants';

const MAX_CHECK_INS_PER_BUNDLE = 500;
const MAX_MESSAGES_PER_BUNDLE = 500;

export type BuildPhaseBSyncOptions = {
  checkInsLimit: number;
  includeResources: boolean;
  includeEmergencyPlans: boolean;
  includeMessages: boolean;
  messagesLimit: number;
  includeDrills: boolean;
};

function assertPayloadIds(payload: PhaseBSyncPayloadV2): void {
  const badMember = payload.members.find((m) => !m.publicId);
  if (badMember) {
    throw new Error('Member missing public_id after ensure; database may be corrupted.');
  }
  const badRes = payload.resources?.find((r) => !r.publicId);
  if (badRes) {
    throw new Error('Resource missing public_id after ensure; database may be corrupted.');
  }
  const badPlan = payload.emergencyPlans?.find((p) => !p.publicId);
  if (badPlan) {
    throw new Error('Emergency plan missing public_id after ensure; database may be corrupted.');
  }
  const badMsg = payload.messages?.find((m) => !m.publicId);
  if (badMsg) {
    throw new Error('Message missing public_id after ensure; database may be corrupted.');
  }
  const badDrill = payload.drills?.find((d) => !d.publicId);
  if (badDrill) {
    throw new Error('Drill missing public_id after ensure; database may be corrupted.');
  }
}

async function buildPhaseBSyncPayloadV2(
  communityId: string,
  options: BuildPhaseBSyncOptions
): Promise<PhaseBSyncPayloadV2> {
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

  const planRows = await database
    .get<EmergencyPlan>('emergency_plans')
    .query(Q.where('community_id', communityId))
    .fetch();

  const messageRows = await database
    .get<Message>('messages')
    .query(Q.where('community_id', communityId))
    .fetch();

  const drillRows = await database
    .get<Drill>('drills')
    .query(Q.where('community_id', communityId))
    .fetch();

  const checkRows = await database
    .get<CheckIn>('check_ins')
    .query(Q.where('community_id', communityId))
    .fetch();
  const checkIns = [...checkRows]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, options.checkInsLimit);

  const messagesSorted = [...messageRows].sort((a, b) => b.timestamp - a.timestamp);
  const messagesSlice = options.includeMessages
    ? messagesSorted.slice(
        0,
        Math.min(options.messagesLimit, MAX_MESSAGES_PER_BUNDLE)
      )
    : [];

  const inviteCode = normalizeInviteCode(community.inviteCode);

  const payload: PhaseBSyncPayloadV2 = {
    v: PHASE_B_BUNDLE_VERSION,
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
        const member = members.find((mm) => mm.id === c.memberId);
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
    ...(options.includeResources
      ? {
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
        }
      : {}),
    ...(options.includeEmergencyPlans
      ? {
          emergencyPlans: planRows.map((p) => ({
            publicId: p.publicId?.trim() || '',
            name: p.name,
            planType: p.planType,
            contentEncrypted: p.contentEncrypted,
            sizeBytes: p.sizeBytes,
            status: p.status as 'current' | 'needs_review',
            lastUpdated: p.lastUpdated,
          })),
        }
      : {}),
    ...(options.includeMessages && messagesSlice.length > 0
      ? {
          messages: messagesSlice.map((msg) => {
            const sender = members.find((m) => m.id === msg.senderId);
            return {
              publicId: msg.publicId?.trim() || '',
              senderMemberPublicId: sender?.publicId?.trim() || '',
              senderName: msg.senderName,
              textEncrypted: msg.textEncrypted,
              messageType: msg.messageType,
              timestamp: msg.timestamp,
              isMesh: msg.isMesh,
              delivered: msg.delivered,
            };
          }).filter((m) => m.publicId && m.senderMemberPublicId),
        }
      : {}),
    ...(options.includeDrills
      ? {
          drills: drillRows.map((d) => ({
            publicId: d.publicId?.trim() || '',
            name: d.name,
            description: d.description,
            difficulty: d.difficulty,
            estimatedTime: d.estimatedTime,
            icon: d.icon,
            xpReward: d.xpReward,
            isCompleted: d.isCompleted,
            score: d.score,
            completedAt: d.completedAt,
            lastUpdated: d.lastUpdated ?? Math.max(d.completedAt, 0),
          })),
        }
      : {}),
    ...(typeof community.inviteExpiresAt === 'number' &&
    community.inviteExpiresAt > 0
      ? { communityInviteExpiresAt: community.inviteExpiresAt }
      : {}),
  };

  return payload;
}

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
  await ensureEmergencyPlanPublicIdsForCommunity(communityId);
  await ensureMessagePublicIdsForCommunity(communityId);
  await ensureDrillPublicIdsForCommunity(communityId);
  await ensureDrillLastUpdatedForCommunity(communityId);

  const payload = await buildPhaseBSyncPayloadV2(communityId, {
    checkInsLimit: MAX_CHECK_INS_PER_BUNDLE,
    includeResources: true,
    includeEmergencyPlans: true,
    includeMessages: true,
    messagesLimit: MAX_MESSAGES_PER_BUNDLE,
    includeDrills: true,
  });
  assertPayloadIds(payload);

  return mgr.encryptString(JSON.stringify(payload));
}

/**
 * Same encryption as relay/sneaker bundles, trimmed until UTF-8 ciphertext fits
 * {@link EMBER_MESH_MAX_CIPHERTEXT} (one Meshtastic frame). Drops messages/plans/drills/resources/check-ins in order.
 */
export async function buildEncryptedMembersCheckInsBundleForMesh(
  communityId: string
): Promise<string> {
  const mgr = getCryptoSession();
  if (!mgr?.isInitialized()) {
    throw new Error('Unlock encryption before syncing (open the community on this device).');
  }

  await ensureMemberPublicIdsForCommunity(communityId);
  await ensureCheckInSyncIdsForCommunity(communityId);
  await ensureResourcePublicIdsForCommunity(communityId);
  await ensureEmergencyPlanPublicIdsForCommunity(communityId);
  await ensureMessagePublicIdsForCommunity(communityId);
  await ensureDrillPublicIdsForCommunity(communityId);
  await ensureDrillLastUpdatedForCommunity(communityId);

  const checkRows = await database
    .get<CheckIn>('check_ins')
    .query(Q.where('community_id', communityId))
    .fetch();
  const maxChecks = Math.min(checkRows.length, MAX_CHECK_INS_PER_BUNDLE);

  let useResources = true;
  let usePlans = true;
  let useDrills = true;
  let useMessages = true;
  let msgLimit = MAX_MESSAGES_PER_BUNDLE;
  let n = maxChecks;

  for (let attempt = 0; attempt < 2000; attempt++) {
    const payload = await buildPhaseBSyncPayloadV2(communityId, {
      checkInsLimit: n,
      includeResources: useResources,
      includeEmergencyPlans: usePlans,
      includeMessages: useMessages,
      messagesLimit: msgLimit,
      includeDrills: useDrills,
    });
    assertPayloadIds(payload);
    const b64 = mgr.encryptString(JSON.stringify(payload));
    if (new TextEncoder().encode(b64).length <= EMBER_MESH_MAX_CIPHERTEXT) {
      return b64;
    }
    if (msgLimit > 0) {
      msgLimit -= 1;
      continue;
    }
    if (useMessages) {
      useMessages = false;
      msgLimit = MAX_MESSAGES_PER_BUNDLE;
      continue;
    }
    if (usePlans) {
      usePlans = false;
      continue;
    }
    if (useDrills) {
      useDrills = false;
      continue;
    }
    if (useResources) {
      useResources = false;
      continue;
    }
    if (n > 0) {
      n -= 1;
      continue;
    }
    break;
  }

  throw new Error(
    'Encrypted snapshot cannot fit one mesh frame. Trim check-ins, use relay/sneaker-net sync, or shorten member text fields.'
  );
}

export function decryptMembersCheckInsBundleJson(
  ciphertextBase64: string
): PhaseBSyncPayload {
  const mgr = getCryptoSession();
  if (!mgr?.isInitialized()) {
    throw new Error('Unlock encryption before importing a bundle.');
  }
  const json = mgr.decryptString(ciphertextBase64);
  const data: unknown = JSON.parse(json);
  if (!isPhaseBSyncPayload(data)) {
    throw new Error('Invalid or unsupported bundle payload.');
  }
  if (data.inviteCode !== normalizeInviteCode(data.inviteCode)) {
    throw new Error('Bundle invite code normalization mismatch.');
  }
  return data;
}
