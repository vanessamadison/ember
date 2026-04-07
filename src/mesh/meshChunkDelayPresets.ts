import { EMBER_MESH_INTER_CHUNK_DELAY_MS } from './emberMeshConstants';

/** Presets shown in Settings; field tests can tune here without a rebuild. */
export const MESH_INTER_CHUNK_DELAY_CHOICES = [
  100, 150, 300, 500, 750, 1000, 1200,
] as const;

export type MeshInterChunkDelayChoice =
  (typeof MESH_INTER_CHUNK_DELAY_CHOICES)[number];

export function clampMeshInterChunkDelayMs(ms: number): number {
  if (!Number.isFinite(ms)) return EMBER_MESH_INTER_CHUNK_DELAY_MS;
  return Math.min(3000, Math.max(50, Math.round(ms)));
}

/** Next preset strictly greater than `currentMs`, or null if already at max. */
export function nextHigherInterChunkPreset(
  currentMs: number
): MeshInterChunkDelayChoice | null {
  const ms = clampMeshInterChunkDelayMs(currentMs);
  for (const c of MESH_INTER_CHUNK_DELAY_CHOICES) {
    if (c > ms) return c;
  }
  return null;
}

/** Largest preset strictly less than `currentMs`, or null if already at min. */
export function nextLowerInterChunkPreset(
  currentMs: number
): MeshInterChunkDelayChoice | null {
  const ms = clampMeshInterChunkDelayMs(currentMs);
  for (let i = MESH_INTER_CHUNK_DELAY_CHOICES.length - 1; i >= 0; i--) {
    const c = MESH_INTER_CHUNK_DELAY_CHOICES[i]!;
    if (c < ms) return c;
  }
  return null;
}
