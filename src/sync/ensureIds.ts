import { Q } from '@nozbe/watermelondb';
import { database } from '../db';
import type Member from '../db/models/Member';
import type CheckIn from '../db/models/CheckIn';
import type Resource from '../db/models/Resource';
import type EmergencyPlan from '../db/models/EmergencyPlan';
import type Message from '../db/models/Message';
import type Drill from '../db/models/Drill';
import { randomUuid } from './uuid';

export async function ensureMemberPublicIdsForCommunity(
  communityId: string
): Promise<void> {
  const members = await database
    .get<Member>('members')
    .query(Q.where('community_id', communityId))
    .fetch();

  const needIds = members.filter((m) => !m.publicId?.trim());
  if (needIds.length === 0) return;

  await database.write(async () => {
    for (const m of needIds) {
      await m.update((rec) => {
        rec.publicId = randomUuid();
      });
    }
  });
}

export async function ensureResourcePublicIdsForCommunity(
  communityId: string
): Promise<void> {
  const rows = await database
    .get<Resource>('resources')
    .query(Q.where('community_id', communityId))
    .fetch();

  const need = rows.filter((r) => !r.publicId?.trim());
  if (need.length === 0) return;

  await database.write(async () => {
    for (const r of need) {
      await r.update((rec) => {
        rec.publicId = randomUuid();
      });
    }
  });
}

export async function ensureEmergencyPlanPublicIdsForCommunity(
  communityId: string
): Promise<void> {
  const rows = await database
    .get<EmergencyPlan>('emergency_plans')
    .query(Q.where('community_id', communityId))
    .fetch();

  const need = rows.filter((r) => !r.publicId?.trim());
  if (need.length === 0) return;

  await database.write(async () => {
    for (const r of need) {
      await r.update((rec) => {
        rec.publicId = randomUuid();
      });
    }
  });
}

export async function ensureMessagePublicIdsForCommunity(
  communityId: string
): Promise<void> {
  const rows = await database
    .get<Message>('messages')
    .query(Q.where('community_id', communityId))
    .fetch();

  const need = rows.filter((r) => !r.publicId?.trim());
  if (need.length === 0) return;

  await database.write(async () => {
    for (const r of need) {
      await r.update((rec) => {
        rec.publicId = randomUuid();
      });
    }
  });
}

export async function ensureDrillPublicIdsForCommunity(
  communityId: string
): Promise<void> {
  const rows = await database
    .get<Drill>('drills')
    .query(Q.where('community_id', communityId))
    .fetch();

  const need = rows.filter((r) => !r.publicId?.trim());
  if (need.length === 0) return;

  const now = Date.now();
  await database.write(async () => {
    for (const r of need) {
      await r.update((rec) => {
        rec.publicId = randomUuid();
        if (!(rec.lastUpdated && rec.lastUpdated > 0)) {
          rec.lastUpdated = Math.max(rec.completedAt ?? 0, now);
        }
      });
    }
  });
}

/** Ensures every drill has last_updated for LWW sync (migration / legacy rows). */
export async function ensureDrillLastUpdatedForCommunity(
  communityId: string
): Promise<void> {
  const rows = await database
    .get<Drill>('drills')
    .query(Q.where('community_id', communityId))
    .fetch();

  const need = rows.filter(
    (r) => !(typeof r.lastUpdated === 'number' && r.lastUpdated > 0)
  );
  if (need.length === 0) return;

  const now = Date.now();
  await database.write(async () => {
    for (const r of need) {
      await r.update((rec) => {
        rec.lastUpdated = Math.max(rec.completedAt ?? 0, now);
      });
    }
  });
}

export async function ensureCheckInSyncIdsForCommunity(
  communityId: string
): Promise<void> {
  const rows = await database
    .get<CheckIn>('check_ins')
    .query(Q.where('community_id', communityId))
    .fetch();

  const need = rows.filter((c) => !c.syncId?.trim());
  if (need.length === 0) return;

  await database.write(async () => {
    for (const c of need) {
      await c.update((rec) => {
        rec.syncId = randomUuid();
      });
    }
  });
}
