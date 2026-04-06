import { Q } from '@nozbe/watermelondb';
import { STATUS } from '../constants';
import type { CommunityState, Member, Resource, Drill } from '../domain/community';
import { hashPassphrase, generateSalt } from '../crypto/keyDerivation';
import { unlockCryptoWithPassphrase } from '../crypto/session';
import { database } from './index';
import type Community from './models/Community';
import type MemberModel from './models/Member';
import type ResourceModel from './models/Resource';
import type DrillModel from './models/Drill';
import type CheckInModel from './models/CheckIn';
import { randomUuid } from '../sync/uuid';
import { DEFAULT_INVITE_TTL_MS } from '../constants/identity';
import { notifyCommunityDataChanged } from '../sync/refreshHub';

export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

function mapDifficulty(d: string): Drill['difficulty'] {
  if (d === 'medium') return 'med';
  if (d === 'easy' || d === 'hard' || d === 'med') return d;
  return 'easy';
}

function memberToUi(m: MemberModel): Member {
  const skillsParsed = m.parsedSkills;
  const skillLabels = skillsParsed.map((s) =>
    typeof s === 'object' && s && 'name' in s ? String((s as { name: string }).name) : String(s)
  );
  const resParsed = m.parsedResources;
  const resourceLabels = resParsed.map((r) =>
    typeof r === 'object' && r && 'name' in r ? String((r as { name: string }).name) : String(r)
  );

  return {
    id: m.id,
    name: m.name,
    status: m.status as STATUS,
    lastCheckIn: m.lastCheckIn,
    xp: 0,
    level: 1,
    role: m.role,
    skills: skillLabels.length ? skillLabels : undefined,
    resources: resourceLabels.length ? resourceLabels : undefined,
    bio: m.bio || undefined,
    avatar: m.avatar || undefined,
  };
}

function resourceToUi(r: ResourceModel): Resource {
  return {
    id: r.id,
    category: r.category,
    name: r.name,
    quantity: r.quantity,
    unit: r.unit,
    lastUpdated: r.lastUpdated,
    owner: r.updatedBy || undefined,
    criticalThreshold: r.criticalThreshold,
    maxCapacity: r.maxCapacity,
    icon: r.icon || undefined,
  };
}

function drillToUi(d: DrillModel): Drill {
  const stamps: number[] = [];
  if (d.isCompleted && d.completedAt) {
    stamps.push(d.completedAt);
  }
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    difficulty: mapDifficulty(d.difficulty),
    completedAt: stamps,
    participantCount: d.isCompleted ? 1 : 0,
  };
}

export async function loadCommunityStateFromDb(
  watermelondbCommunityId: string
): Promise<Partial<CommunityState> | null> {
  if (!watermelondbCommunityId || watermelondbCommunityId === '__none__') {
    return null;
  }

  const community = await database
    .get<Community>('communities')
    .find(watermelondbCommunityId)
    .catch(() => null);

  if (!community) {
    return null;
  }

  const [memberRows, resourceRows, drillRows] = await Promise.all([
    database
      .get<MemberModel>('members')
      .query(Q.where('community_id', watermelondbCommunityId))
      .fetch(),
    database
      .get<ResourceModel>('resources')
      .query(Q.where('community_id', watermelondbCommunityId))
      .fetch(),
    database
      .get<DrillModel>('drills')
      .query(Q.where('community_id', watermelondbCommunityId))
      .fetch(),
  ]);

  return {
    communityId: community.id,
    communityName: community.name,
    inviteExpiresAt:
      typeof community.inviteExpiresAt === 'number' && community.inviteExpiresAt > 0
        ? community.inviteExpiresAt
        : null,
    members: memberRows.filter((m) => !m.removedAt).map(memberToUi),
    resources: resourceRows.map(resourceToUi),
    drills: drillRows.map(drillToUi),
    plans: [],
    messages: [],
    achievements: [],
    readinessScore: 0,
    streakDays: 0,
  };
}

export interface CreateCommunityInput {
  communityName: string;
  passphrase: string;
  inviteCode: string;
  displayName: string;
}

export async function createCommunityInDb(
  input: CreateCommunityInput
): Promise<{ communityId: string; memberId: string }> {
  const salt = generateSalt();
  const saltB64 = btoa(String.fromCharCode(...salt));
  const passphraseHash = await hashPassphrase(input.passphrase);
  const invite = normalizeInviteCode(input.inviteCode);

  await unlockCryptoWithPassphrase(input.passphrase, saltB64);

  let communityId = '';
  let memberId = '';

  await database.write(async () => {
    const community = await database.get<Community>('communities').create((c) => {
      c.name = input.communityName.trim();
      c.passphraseHash = passphraseHash;
      c.inviteCode = invite;
      c.derivationSalt = saltB64;
      c.createdAt = Date.now();
      c.memberCount = 1;
      c.isActive = true;
      c.inviteExpiresAt = Date.now() + DEFAULT_INVITE_TTL_MS;
    });
    communityId = community.id;

    const member = await database.get<MemberModel>('members').create((m) => {
      m.communityId = community.id;
      m.publicId = randomUuid();
      m.name = input.displayName.trim();
      m.role = 'coordinator';
      m.avatar = '';
      m.bio = '';
      m.status = 'safe';
      m.lastCheckIn = Date.now();
      m.skillsJson = '[]';
      m.resourcesJson = '[]';
      m.isSelf = true;
    });
    memberId = member.id;
  });

  return { communityId, memberId };
}

export interface JoinCommunityInput {
  inviteCode: string;
  passphrase: string;
  displayName: string;
  skills: string[];
}

export async function joinCommunityInDb(
  input: JoinCommunityInput
): Promise<{ communityId: string; memberId: string }> {
  const invite = normalizeInviteCode(input.inviteCode);
  const rows = await database
    .get<Community>('communities')
    .query(Q.where('invite_code', invite))
    .fetch();

  const community = rows[0];
  if (!community) {
    throw new Error('No community matches this invite code.');
  }
  if (!community.derivationSalt) {
    throw new Error('Community is missing crypto salt (old data).');
  }

  const candidateHash = await hashPassphrase(input.passphrase);
  if (candidateHash !== community.passphraseHash) {
    throw new Error('Incorrect passphrase.');
  }

  const exp = community.inviteExpiresAt;
  if (typeof exp === 'number' && exp > 0 && Date.now() > exp) {
    throw new Error(
      'This community no longer accepts new joins (invite period ended). Ask a coordinator to extend the window in a future release, or use a fresh community.'
    );
  }

  await unlockCryptoWithPassphrase(input.passphrase, community.derivationSalt);

  let memberId = '';

  await database.write(async () => {
    const member = await database.get<MemberModel>('members').create((m) => {
      m.communityId = community.id;
      m.publicId = randomUuid();
      m.name = input.displayName.trim();
      m.role = 'member';
      m.avatar = '';
      m.bio = '';
      m.status = 'safe';
      m.lastCheckIn = Date.now();
      m.skillsJson = JSON.stringify(
        input.skills.map((name) => ({ name, level: 'beginner' }))
      );
      m.resourcesJson = '[]';
      m.isSelf = true;
    });
    memberId = member.id;
    await community.update((c) => {
      c.memberCount = c.memberCount + 1;
    });
  });

  return { communityId: community.id, memberId };
}

export async function persistMemberCheckIn(
  memberId: string,
  status: STATUS
): Promise<void> {
  const statusStr =
    status === STATUS.SAFE ? 'safe' : status === STATUS.HELP ? 'help' : 'unknown';
  await database.write(async () => {
    const m = await database.get<MemberModel>('members').find(memberId);
    if (m.removedAt && m.removedAt > 0) {
      throw new Error('Removed members cannot check in.');
    }
    const ts = Date.now();
    const publicId = m.publicId?.trim() || randomUuid();
    await m.update((rec) => {
      if (!rec.publicId?.trim()) rec.publicId = publicId;
      rec.status = statusStr as MemberModel['status'];
      rec.lastCheckIn = ts;
    });
    await database.get<CheckInModel>('check_ins').create((c) => {
      c.memberId = m.id;
      c.communityId = m.communityId;
      c.status = statusStr as CheckInModel['status'];
      c.timestamp = ts;
      c.locationEncrypted = '';
      c.note = '';
      c.syncId = randomUuid();
    });
  });
  notifyCommunityDataChanged();
}

/**
 * Coordinator-only: soft-remove a member (still in DB for sync tombstones; hidden from UI).
 */
export async function softRemoveMemberFromCommunity(
  actorMemberId: string,
  targetMemberId: string
): Promise<void> {
  await database.write(async () => {
    const actor = await database.get<MemberModel>('members').find(actorMemberId);
    const target = await database.get<MemberModel>('members').find(targetMemberId);
    if (actor.communityId !== target.communityId) {
      throw new Error('Members must belong to the same community.');
    }
    if (actor.role !== 'coordinator') {
      throw new Error('Only coordinators can remove members.');
    }
    if (actor.id === target.id) {
      throw new Error('You cannot remove yourself this way (leave community from settings when available).');
    }
    if (target.removedAt && target.removedAt > 0) {
      return;
    }
    const ts = Date.now();
    await target.update((rec) => {
      rec.removedAt = ts;
    });

    const community = await database
      .get<Community>('communities')
      .find(actor.communityId)
      .catch(() => null);
    if (community) {
      const all = await database
        .get<MemberModel>('members')
        .query(Q.where('community_id', actor.communityId))
        .fetch();
      const activeCount = all.filter((mem) => !mem.removedAt).length;
      await community.update((c) => {
        c.memberCount = activeCount;
      });
    }
  });
  notifyCommunityDataChanged();
}

/**
 * Coordinator-only: extend new-member join window from max(now, current expiry) by
 * DEFAULT_INVITE_TTL_MS. Other devices learn the later expiry when they merge a sync bundle.
 */
export async function renewCommunityInviteWindow(
  watermelondbCommunityId: string,
  actorMemberId: string
): Promise<number> {
  let nextExpiry = 0;
  await database.write(async () => {
    const actor = await database.get<MemberModel>('members').find(actorMemberId);
    if (actor.communityId !== watermelondbCommunityId) {
      throw new Error('Member is not in this community.');
    }
    if (actor.role !== 'coordinator') {
      throw new Error('Only coordinators can extend the join window.');
    }
    const community = await database
      .get<Community>('communities')
      .find(watermelondbCommunityId)
      .catch(() => null);
    if (!community) {
      throw new Error('Community not found.');
    }
    const now = Date.now();
    const cur = community.inviteExpiresAt ?? 0;
    const base = Math.max(now, cur);
    nextExpiry = base + DEFAULT_INVITE_TTL_MS;
    await community.update((c) => {
      c.inviteExpiresAt = nextExpiry;
    });
  });
  notifyCommunityDataChanged();
  return nextExpiry;
}

export async function persistResourceQuantity(
  resourceId: string,
  quantity: number,
  unit?: string
): Promise<void> {
  await database.write(async () => {
    const r = await database.get<ResourceModel>('resources').find(resourceId);
    const pid = r.publicId?.trim() || randomUuid();
    await r.update((rec) => {
      if (!rec.publicId?.trim()) rec.publicId = pid;
      rec.quantity = quantity;
      if (unit !== undefined) {
        rec.unit = unit;
      }
      rec.lastUpdated = Date.now();
    });
  });
  notifyCommunityDataChanged();
}
