import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ember_mesh_security_checklist_v1';

export type MeshSecurityChecklistState = {
  /** Meshtastic firmware ≥ 2.5.0 on every node (verified in Meshtastic app / flasher). */
  firmwareVerified: boolean;
  /** Private channel PSK is not the default; all nodes share the same channel settings. */
  privatePskConfigured: boolean;
  /** Understand risk of private keys on unattended / public infrastructure nodes. */
  unattendedRiskAck: boolean;
  /** Plan to rotate keys if a node is lost or stolen. */
  rotationPlanAck: boolean;
};

const DEFAULT_STATE: MeshSecurityChecklistState = {
  firmwareVerified: false,
  privatePskConfigured: false,
  unattendedRiskAck: false,
  rotationPlanAck: false,
};

function parseState(raw: string | null): MeshSecurityChecklistState {
  if (!raw) return { ...DEFAULT_STATE };
  try {
    const o = JSON.parse(raw) as Partial<MeshSecurityChecklistState>;
    return {
      firmwareVerified: Boolean(o.firmwareVerified),
      privatePskConfigured: Boolean(o.privatePskConfigured),
      unattendedRiskAck: Boolean(o.unattendedRiskAck),
      rotationPlanAck: Boolean(o.rotationPlanAck),
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export async function loadMeshSecurityChecklist(): Promise<MeshSecurityChecklistState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseState(raw);
}

export async function saveMeshSecurityChecklist(
  state: MeshSecurityChecklistState
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
