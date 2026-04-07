import {
  MESH_INTER_CHUNK_DELAY_CHOICES,
  nextHigherInterChunkPreset,
  nextLowerInterChunkPreset,
} from '../../src/mesh/meshChunkDelayPresets';

describe('nextHigherInterChunkPreset', () => {
  it('returns the next preset after the current value', () => {
    expect(nextHigherInterChunkPreset(100)).toBe(150);
    expect(nextHigherInterChunkPreset(149)).toBe(150);
    expect(nextHigherInterChunkPreset(750)).toBe(1000);
    expect(nextHigherInterChunkPreset(1200)).toBe(null);
  });

  it('clamps out-of-range input before picking next', () => {
    expect(nextHigherInterChunkPreset(2000)).toBe(null);
    expect(nextHigherInterChunkPreset(80)).toBe(100);
  });

  it('choices stay sorted ascending', () => {
    const sorted = [...MESH_INTER_CHUNK_DELAY_CHOICES].sort((a, b) => a - b);
    expect(MESH_INTER_CHUNK_DELAY_CHOICES).toEqual(sorted);
  });
});

describe('nextLowerInterChunkPreset', () => {
  it('returns the next lower preset', () => {
    expect(nextLowerInterChunkPreset(1200)).toBe(1000);
    expect(nextLowerInterChunkPreset(151)).toBe(150);
    expect(nextLowerInterChunkPreset(150)).toBe(100);
    expect(nextLowerInterChunkPreset(100)).toBe(null);
  });
});
