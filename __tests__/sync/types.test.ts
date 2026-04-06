import {
  isMembersCheckInsPayloadV1,
  MEMBERS_CHECK_INS_BUNDLE_VERSION,
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
  });

  it('rejects wrong version', () => {
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
