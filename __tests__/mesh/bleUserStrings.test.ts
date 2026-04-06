import { bleMeshGuidance, bleStateLabel } from '../../src/mesh/bleUserStrings';

describe('bleUserStrings', () => {
  it('bleStateLabel maps states for UI', () => {
    expect(bleStateLabel('PoweredOn')).toBe('On');
    expect(bleStateLabel('Unauthorized')).toBe('Permission needed');
  });

  it('bleMeshGuidance suggests settings when unauthorized or powered off', () => {
    expect(bleMeshGuidance('Unauthorized').suggestOpenSettings).toBe(true);
    expect(bleMeshGuidance('PoweredOff').suggestOpenSettings).toBe(true);
    expect(bleMeshGuidance('PoweredOn').suggestOpenSettings).toBe(false);
    expect(bleMeshGuidance('Unsupported').hint).toMatch(/web/);
  });
});
