/** Legacy Phase B bundle (members + check-ins + optional resources). */
export const MEMBERS_CHECK_INS_BUNDLE_VERSION = 1 as const;

/** Current Phase B bundle: adds emergency plans + messages. */
export const PHASE_B_BUNDLE_VERSION = 2 as const;

export interface MemberSyncDTO {
  publicId: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  status: 'safe' | 'help' | 'unknown';
  lastCheckIn: number;
  skillsJson: string;
  resourcesJson: string;
  /** Soft-removal tombstone timestamp; omitted if still active. */
  removedAt?: number;
}

export interface CheckInSyncDTO {
  syncId: string;
  memberPublicId: string;
  status: 'safe' | 'help' | 'unknown';
  timestamp: number;
  locationEncrypted: string;
  note: string;
}

export interface ResourceSyncDTO {
  publicId: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  criticalThreshold: number;
  maxCapacity: number;
  icon: string;
  lastUpdated: number;
  /** Member who last updated; correlate via members.public_id in same bundle. */
  updatedByMemberPublicId: string;
}

export interface EmergencyPlanSyncDTO {
  publicId: string;
  name: string;
  planType: string;
  contentEncrypted: string;
  sizeBytes: number;
  status: 'current' | 'needs_review';
  lastUpdated: number;
}

export interface MessageSyncDTO {
  publicId: string;
  /** Member `public_id` of sender; used to resolve local `sender_id` on import. */
  senderMemberPublicId: string;
  senderName: string;
  textEncrypted: string;
  messageType: 'system' | 'resource' | 'broadcast' | 'social';
  timestamp: number;
  isMesh: boolean;
  delivered: boolean;
}

export interface DrillSyncDTO {
  publicId: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  icon: string;
  xpReward: number;
  isCompleted: boolean;
  score: number;
  completedAt: number;
  /** LWW merge timestamp (ms). */
  lastUpdated: number;
}

export interface MembersCheckInsPayloadV1 {
  v: typeof MEMBERS_CHECK_INS_BUNDLE_VERSION;
  inviteCode: string;
  issuedAt: number;
  members: MemberSyncDTO[];
  checkIns: CheckInSyncDTO[];
  /** Join cutoff propagated across devices (max-merge on import). Optional for legacy bundles. */
  communityInviteExpiresAt?: number;
  /** Supply rows; optional for legacy bundles. */
  resources?: ResourceSyncDTO[];
}

export interface PhaseBSyncPayloadV2 {
  v: typeof PHASE_B_BUNDLE_VERSION;
  inviteCode: string;
  issuedAt: number;
  members: MemberSyncDTO[];
  checkIns: CheckInSyncDTO[];
  communityInviteExpiresAt?: number;
  resources?: ResourceSyncDTO[];
  emergencyPlans?: EmergencyPlanSyncDTO[];
  messages?: MessageSyncDTO[];
  drills?: DrillSyncDTO[];
}

/** Any supported encrypted Phase B JSON payload. */
export type PhaseBSyncPayload = MembersCheckInsPayloadV1 | PhaseBSyncPayloadV2;

export function isMembersCheckInsPayloadV1(x: unknown): x is MembersCheckInsPayloadV1 {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  if (o.resources !== undefined && !Array.isArray(o.resources)) {
    return false;
  }
  return (
    o.v === 1 &&
    typeof o.inviteCode === 'string' &&
    typeof o.issuedAt === 'number' &&
    Array.isArray(o.members) &&
    Array.isArray(o.checkIns)
  );
}

export function isPhaseBSyncPayloadV2(x: unknown): x is PhaseBSyncPayloadV2 {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  if (o.resources !== undefined && !Array.isArray(o.resources)) return false;
  if (o.emergencyPlans !== undefined && !Array.isArray(o.emergencyPlans)) {
    return false;
  }
  if (o.messages !== undefined && !Array.isArray(o.messages)) return false;
  if (o.drills !== undefined && !Array.isArray(o.drills)) return false;
  return (
    o.v === 2 &&
    typeof o.inviteCode === 'string' &&
    typeof o.issuedAt === 'number' &&
    Array.isArray(o.members) &&
    Array.isArray(o.checkIns)
  );
}

export function isPhaseBSyncPayload(x: unknown): x is PhaseBSyncPayload {
  return isMembersCheckInsPayloadV1(x) || isPhaseBSyncPayloadV2(x);
}
