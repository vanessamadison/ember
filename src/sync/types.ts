/** Phase B vertical: members + historical check-ins (sync_id-deduped). */
export const MEMBERS_CHECK_INS_BUNDLE_VERSION = 1 as const;

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
