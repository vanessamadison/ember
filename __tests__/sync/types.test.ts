import {
  isMembersCheckInsPayloadV1,
  isPhaseBSyncPayload,
  isPhaseBSyncPayloadV2,
  MEMBERS_CHECK_INS_BUNDLE_VERSION,
  PHASE_B_BUNDLE_VERSION,
} from '../../src/sync/types';

describe('sync payload types', () => {
  it('accepts v1 shape', () => {
    const payload = {
      v: MEMBERS_CHECK_INS_BUNDLE_VERSION,
      inviteCode: 'EMBR-ABCD-1234',
      issuedAt: Date.now(),
      members: [],
      checkIns: [],
    };
    expect(isMembersCheckInsPayloadV1(payload)).toBe(true);
    expect(isPhaseBSyncPayload(payload)).toBe(true);
    expect(isPhaseBSyncPayloadV2(payload)).toBe(false);
  });

  it('accepts v2 shape with plans and messages', () => {
    const payload = {
      v: PHASE_B_BUNDLE_VERSION,
      inviteCode: 'EMBR-ABCD-1234',
      issuedAt: Date.now(),
      members: [],
      checkIns: [],
      emergencyPlans: [],
      messages: [],
      drills: [],
    };
    expect(isPhaseBSyncPayloadV2(payload)).toBe(true);
    expect(isPhaseBSyncPayload(payload)).toBe(true);
    expect(isMembersCheckInsPayloadV1(payload)).toBe(false);
  });

  it('rejects wrong version for v1 guard', () => {
    expect(
      isMembersCheckInsPayloadV1({
        v: 2,
        inviteCode: 'X',
        issuedAt: 1,
        members: [],
        checkIns: [],
      })
    ).toBe(false);
  });
});
