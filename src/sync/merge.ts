import { Q } from '@nozbe/watermelondb';
import { database } from '../db';
import { normalizeInviteCode } from '../db/communityLifecycle';
import type Community from '../db/models/Community';
import type Member from '../db/models/Member';
import type CheckIn from '../db/models/CheckIn';
import ResourceModel from '../db/models/Resource';
import type { MembersCheckInsPayloadV1 } from './types';
import {
  ensureCheckInSyncIdsForCommunity,
  ensureMemberPublicIdsForCommunity,
  ensureResourcePublicIdsForCommunity,
} from './ensureIds';
import { notifyCommunityDataChanged } from './refreshHub';

/**
 * LWW merge for members by publicId (lastCheckIn wins; ties break by greater timestamp for other fields).
 * Check-ins merged by syncId (insert-only).
 */
export async function mergeMembersCheckInsPayload(
  payload: MembersCheckInsPayloadV1
): Promise<{ localCommunityId: string; membersInserted: number; checkInsInserted: number }> {
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

  let membersInserted = 0;
  let checkInsInserted = 0;

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
  return { localCommunityId, membersInserted, checkInsInserted };
}
