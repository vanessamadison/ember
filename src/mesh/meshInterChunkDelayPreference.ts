import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMBER_MESH_INTER_CHUNK_DELAY_MS } from './emberMeshConstants';
import { clampMeshInterChunkDelayMs } from './meshChunkDelayPresets';

const STORAGE_KEY = 'ember_mesh_inter_chunk_delay_ms';

export {
  MESH_INTER_CHUNK_DELAY_CHOICES,
  nextHigherInterChunkPreset,
  type MeshInterChunkDelayChoice,
} from './meshChunkDelayPresets';

export async function loadMeshInterChunkDelayMs(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) return EMBER_MESH_INTER_CHUNK_DELAY_MS;
    return clampMeshInterChunkDelayMs(parseInt(raw, 10));
  } catch {
    return EMBER_MESH_INTER_CHUNK_DELAY_MS;
  }
}

export async function saveMeshInterChunkDelayMs(ms: number): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, String(clampMeshInterChunkDelayMs(ms)));
}
