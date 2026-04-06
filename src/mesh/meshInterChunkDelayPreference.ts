import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMBER_MESH_INTER_CHUNK_DELAY_MS } from './emberMeshConstants';

const STORAGE_KEY = 'ember_mesh_inter_chunk_delay_ms';

/** Presets shown in Settings; field tests can tune here without a rebuild. */
export const MESH_INTER_CHUNK_DELAY_CHOICES = [
  100, 150, 300, 500, 750,
] as const;

export type MeshInterChunkDelayChoice =
  (typeof MESH_INTER_CHUNK_DELAY_CHOICES)[number];

function clampDelay(ms: number): number {
  if (!Number.isFinite(ms)) return EMBER_MESH_INTER_CHUNK_DELAY_MS;
  return Math.min(3000, Math.max(50, Math.round(ms)));
}

export async function loadMeshInterChunkDelayMs(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) return EMBER_MESH_INTER_CHUNK_DELAY_MS;
    return clampDelay(parseInt(raw, 10));
  } catch {
    return EMBER_MESH_INTER_CHUNK_DELAY_MS;
  }
}

export async function saveMeshInterChunkDelayMs(ms: number): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, String(clampDelay(ms)));
}
