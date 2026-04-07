import { create } from 'zustand';

/**
 * Increments when we want Config → Mesh Network to open/scroll even if the
 * tab is already focused (search params may not update on same-route navigates).
 */
export const useMeshSettingsNavStore = create<{
  focusMeshToken: number;
  bumpMeshFocus: () => void;
}>((set, get) => ({
  focusMeshToken: 0,
  bumpMeshFocus: () =>
    set({ focusMeshToken: get().focusMeshToken + 1 }),
}));
