import { Q } from '@nozbe/watermelondb';
import { database } from '../db';
import { normalizeInviteCode } from '../db/communityLifecycle';
import type Community from '../db/models/Community';
import type Member from '../db/models/Member';
import type CheckIn from '../db/models/CheckIn';
import ResourceModel from '../db/models/Resource';
import type EmergencyPlan from '../db/models/EmergencyPlan';
import type Message from '../db/models/Message';
import type DrillModel from '../db/models/Drill';
import type { PhaseBSyncPayload } from './types';
import { PHASE_B_BUNDLE_VERSION } from './types';
import {
  ensureCheckInSyncIdsForCommunity,
  ensureMemberPublicIdsForCommunity,
  ensureResourcePublicIdsForCommunity,
  ensureEmergencyPlanPublicIdsForCommunity,
  ensureMessagePublicIdsForCommunity,
  ensureDrillPublicIdsForCommunity,
  ensureDrillLastUpdatedForCommunity,
} from './ensureIds';
import { notifyCommunityDataChanged } from './refreshHub';

export type MergePhaseBResult = {
  localCommunityId: string;
  membersInserted: number;
  checkInsInserted: number;
  emergencyPlansInserted: number;
  messagesInserted: number;
  drillsInserted: number;
};

/**
 * LWW merge for members by publicId (lastCheckIn wins; ties break by greater timestamp for other fields).
 * Check-ins merged by syncId (insert-only).
 * Resources LWW by publicId + lastUpdated.
 * Emergency plans LWW by publicId + lastUpdated.
 * Messages insert-only by publicId (dedupe).
 */
export async function mergeMembersCheckInsPayload(
  payload: PhaseBSyncPayload
): Promise<MergePhaseBResult> {
  const invite = normalizeInviteCode(payload.inviteCode);
  const communities = await database
    .get<Community>('communities')
    .query(Q.where('invite_code', invite))
    .fetch();

  const community = communities[0];
  if (!community) {
    throw new Error(
      'No local community matches this invite. Join the community on this device first, then import or sync.'
    );
  }

  const localCommunityId = community.id;
  await ensureMemberPublicIdsForCommunity(localCommunityId);
  await ensureCheckInSyncIdsForCommunity(localCommunityId);
  await ensureResourcePublicIdsForCommunity(localCommunityId);
  await ensureEmergencyPlanPublicIdsForCommunity(localCommunityId);
  await ensureMessagePublicIdsForCommunity(localCommunityId);
  await ensureDrillPublicIdsForCommunity(localCommunityId);
  await ensureDrillLastUpdatedForCommunity(localCommunityId);

  let membersInserted = 0;
  let checkInsInserted = 0;
  let emergencyPlansInserted = 0;
  let messagesInserted = 0;
  let drillsInserted = 0;

  const mergeEmergencyPlans =
    payload.v === PHASE_B_BUNDLE_VERSION &&
    payload.emergencyPlans &&
    payload.emergencyPlans.length > 0;
  const mergeMessages =
    payload.v === PHASE_B_BUNDLE_VERSION &&
    payload.messages &&
    payload.messages.length > 0;

  const mergeDrills =
    payload.v === PHASE_B_BUNDLE_VERSION &&
    payload.drills &&
    payload.drills.length > 0;

  await database.write(async () => {
    if (
      typeof payload.communityInviteExpiresAt === 'number' &&
      payload.communityInviteExpiresAt > 0
    ) {
      await community.update((c) => {
        const cur = c.inviteExpiresAt ?? 0;
        c.inviteExpiresAt = Math.max(cur, payload.communityInviteExpiresAt!);
      });
    }

    for (const dto of payload.members) {
      const removedTs =
        dto.removedAt !== undefined && dto.removedAt > 0 ? dto.removedAt : 0;

      const existing = await database
        .get<Member>('members')
        .query(
          Q.where('community_id', localCommunityId),
          Q.where('public_id', dto.publicId)
        )
        .fetch();

      const row = existing[0];
      if (!row) {
        await database.get<Member>('members').create((m) => {
          m.communityId = localCommunityId;
          m.publicId = dto.publicId;
          m.name = dto.name;
          m.role = dto.role;
          m.avatar = dto.avatar;
          m.bio = dto.bio;
          m.status = dto.status;
          m.lastCheckIn = dto.lastCheckIn;
          m.skillsJson = dto.skillsJson;
          m.resourcesJson = dto.resourcesJson;
          m.isSelf = false;
          if (removedTs) {
            m.removedAt = removedTs;
          }
        });
        membersInserted += 1;
        continue;
      }

      if (removedTs > 0) {
        const next = Math.max(row.removedAt ?? 0, removedTs);
        if (next !== (row.removedAt ?? 0)) {
          await row.update((m) => {
            m.removedAt = next;
          });
        }
        continue;
      }

      if (row.removedAt && row.removedAt > 0) {
        continue;
      }

      const useRemote = dto.lastCheckIn >= row.lastCheckIn;
      if (useRemote) {
        await row.update((m) => {
          m.name = dto.name;
          m.role = dto.role;
          m.avatar = dto.avatar;
          m.bio = dto.bio;
          m.status = dto.status;
          m.lastCheckIn = dto.lastCheckIn;
          m.skillsJson = dto.skillsJson;
          m.resourcesJson = dto.resourcesJson;
        });
      }
    }

    const memberByPublic = new Map<string, string>();
    const allMembers = await database
      .get<Member>('members')
      .query(Q.where('community_id', localCommunityId))
      .fetch();
    for (const m of allMembers) {
      if (m.publicId?.trim()) {
        memberByPublic.set(m.publicId.trim(), m.id);
      }
    }

    const existingSyncIds = new Set<string>();
    const localChecks = await database
      .get<CheckIn>('check_ins')
      .query(Q.where('community_id', localCommunityId))
      .fetch();
    for (const c of localChecks) {
      if (c.syncId?.trim()) existingSyncIds.add(c.syncId.trim());
    }

    for (const dto of payload.checkIns) {
      if (!dto.syncId?.trim() || existingSyncIds.has(dto.syncId.trim())) {
        continue;
      }
      const memberWmId = memberByPublic.get(dto.memberPublicId.trim());
      if (!memberWmId) {
        continue;
      }
      await database.get<CheckIn>('check_ins').create((c) => {
        c.memberId = memberWmId;
        c.communityId = localCommunityId;
        c.status = dto.status;
        c.timestamp = dto.timestamp;
        c.locationEncrypted = dto.locationEncrypted;
        c.note = dto.note;
        c.syncId = dto.syncId.trim();
      });
      existingSyncIds.add(dto.syncId.trim());
      checkInsInserted += 1;
    }

    if (payload.resources && payload.resources.length > 0) {
      const fallbackUpdater =
        allMembers.find((m) => !m.removedAt)?.id ?? localCommunityId;
      for (const dto of payload.resources) {
        if (!dto.publicId?.trim()) continue;
        const resExisting = await database
          .get<ResourceModel>('resources')
          .query(
            Q.where('community_id', localCommunityId),
            Q.where('public_id', dto.publicId.trim())
          )
          .fetch();
        const resRow = resExisting[0];
        const updaterWm = dto.updatedByMemberPublicId?.trim()
          ? memberByPublic.get(dto.updatedByMemberPublicId.trim()) ??
            fallbackUpdater
          : fallbackUpdater;

        if (!resRow) {
          await database.get<ResourceModel>('resources').create((r) => {
            r.communityId = localCommunityId;
            r.publicId = dto.publicId.trim();
            r.category = dto.category as ResourceModel['category'];
            r.name = dto.name;
            r.quantity = dto.quantity;
            r.unit = dto.unit;
            r.criticalThreshold = dto.criticalThreshold;
            r.maxCapacity = dto.maxCapacity;
            r.icon = dto.icon;
            r.lastUpdated = dto.lastUpdated;
            r.updatedBy = updaterWm;
          });
        } else if (dto.lastUpdated >= resRow.lastUpdated) {
          await resRow.update((r) => {
            r.category = dto.category as ResourceModel['category'];
            r.name = dto.name;
            r.quantity = dto.quantity;
            r.unit = dto.unit;
            r.criticalThreshold = dto.criticalThreshold;
            r.maxCapacity = dto.maxCapacity;
            r.icon = dto.icon;
            r.lastUpdated = dto.lastUpdated;
            r.updatedBy = updaterWm;
          });
        }
      }
    }

    if (mergeEmergencyPlans) {
      for (const dto of payload.emergencyPlans!) {
        if (!dto.publicId?.trim()) continue;
        const existingPlan = await database
          .get<EmergencyPlan>('emergency_plans')
          .query(
            Q.where('community_id', localCommunityId),
            Q.where('public_id', dto.publicId.trim())
          )
          .fetch();
        const row = existingPlan[0];
        if (!row) {
          await database.get<EmergencyPlan>('emergency_plans').create((p) => {
            p.communityId = localCommunityId;
            p.publicId = dto.publicId.trim();
            p.name = dto.name;
            p.planType = dto.planType;
            p.contentEncrypted = dto.contentEncrypted;
            p.sizeBytes = dto.sizeBytes;
            p.status = dto.status;
            p.lastUpdated = dto.lastUpdated;
          });
          emergencyPlansInserted += 1;
        } else if (dto.lastUpdated >= row.lastUpdated) {
          await row.update((p) => {
            p.name = dto.name;
            p.planType = dto.planType;
            p.contentEncrypted = dto.contentEncrypted;
            p.sizeBytes = dto.sizeBytes;
            p.status = dto.status;
            p.lastUpdated = dto.lastUpdated;
          });
        }
      }
    }

    if (mergeMessages) {
      const existingMsgIds = new Set<string>();
      const localMsgs = await database
        .get<Message>('messages')
        .query(Q.where('community_id', localCommunityId))
        .fetch();
      for (const m of localMsgs) {
        if (m.publicId?.trim()) existingMsgIds.add(m.publicId.trim());
      }

      for (const dto of payload.messages!) {
        if (!dto.publicId?.trim() || existingMsgIds.has(dto.publicId.trim())) {
          continue;
        }
        const senderWm = memberByPublic.get(dto.senderMemberPublicId.trim());
        if (!senderWm) continue;

        await database.get<Message>('messages').create((msg) => {
          msg.communityId = localCommunityId;
          msg.publicId = dto.publicId.trim();
          msg.senderId = senderWm;
          msg.senderName = dto.senderName;
          msg.textEncrypted = dto.textEncrypted;
          msg.messageType = dto.messageType;
          msg.timestamp = dto.timestamp;
          msg.isMesh = dto.isMesh;
          msg.delivered = dto.delivered;
        });
        existingMsgIds.add(dto.publicId.trim());
        messagesInserted += 1;
      }
    }

    if (mergeDrills) {
      for (const dto of payload.drills!) {
        if (!dto.publicId?.trim()) continue;
        const existingDrill = await database
          .get<DrillModel>('drills')
          .query(
            Q.where('community_id', localCommunityId),
            Q.where('public_id', dto.publicId.trim())
          )
          .fetch();
        const row = existingDrill[0];
        const localLu = row ? (row.lastUpdated ?? 0) : 0;
        if (!row) {
          await database.get<DrillModel>('drills').create((d) => {
            d.communityId = localCommunityId;
            d.publicId = dto.publicId.trim();
            d.name = dto.name;
            d.description = dto.description;
            d.difficulty = dto.difficulty;
            d.estimatedTime = dto.estimatedTime;
            d.icon = dto.icon;
            d.xpReward = dto.xpReward;
            d.isCompleted = dto.isCompleted;
            d.score = dto.score;
            d.completedAt = dto.completedAt;
            d.lastUpdated = dto.lastUpdated;
          });
          drillsInserted += 1;
        } else if (dto.lastUpdated >= localLu) {
          await row.update((d) => {
            d.name = dto.name;
            d.description = dto.description;
            d.difficulty = dto.difficulty;
            d.estimatedTime = dto.estimatedTime;
            d.icon = dto.icon;
            d.xpReward = dto.xpReward;
            d.isCompleted = dto.isCompleted;
            d.score = dto.score;
            d.completedAt = dto.completedAt;
            d.lastUpdated = dto.lastUpdated;
          });
        }
      }
    }

    const membersAll = await database
      .get<Member>('members')
      .query(Q.where('community_id', localCommunityId))
      .fetch();
    const activeCount = membersAll.filter((mem) => !mem.removedAt).length;
    await community.update((c) => {
      c.memberCount = activeCount;
    });
  });

  notifyCommunityDataChanged();
  return {
    localCommunityId,
    membersInserted,
    checkInsInserted,
    emergencyPlansInserted,
    messagesInserted,
    drillsInserted,
  };
}
