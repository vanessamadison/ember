import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ember_mesh_inter_chunk_walkdown_active';

/** True after adaptive bump on send failure; cleared after manual chip change or walk-down completes. */
export async function loadMeshInterChunkWalkdownActive(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw === '1';
  } catch {
    return false;
  }
}

export async function saveMeshInterChunkWalkdownActive(
  active: boolean
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, active ? '1' : '0');
}
