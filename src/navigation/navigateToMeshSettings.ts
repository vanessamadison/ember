import { router } from 'expo-router';
import { useMeshSettingsNavStore } from '../mesh/meshSettingsNavStore';

/** Opens Config with Mesh Network expanded (URL param + focus bump for same-tab navigates). */
export function navigateToMeshSettings(): void {
  useMeshSettingsNavStore.getState().bumpMeshFocus();
  router.navigate('/(tabs)/settings?section=mesh');
}
