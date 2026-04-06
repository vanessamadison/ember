import type { BlePoweredState } from './meshtasticBleBridge';

/** Short label for UI chips. */
export function bleStateLabel(state: BlePoweredState): string {
  switch (state) {
    case 'PoweredOn':
      return 'On';
    case 'PoweredOff':
      return 'Off';
    case 'Unauthorized':
      return 'Permission needed';
    case 'Unsupported':
      return 'Not available';
    case 'Resetting':
      return 'Resetting…';
    default:
      return state;
  }
}

export interface BleGuidance {
  /** One paragraph for Settings / banners. */
  hint: string;
  /** Whether opening the OS settings app may help. */
  suggestOpenSettings: boolean;
}

/**
 * User-facing copy when Bluetooth is not ready to scan (P2 production UX).
 */
export function bleMeshGuidance(state: BlePoweredState): BleGuidance {
  switch (state) {
    case 'PoweredOn':
      return {
        hint: 'Bluetooth is on. You can scan for Meshtastic-compatible radios.',
        suggestOpenSettings: false,
      };
    case 'PoweredOff':
      return {
        hint:
          'Turn on Bluetooth in system settings, then return here. Mesh scan needs the adapter powered.',
        suggestOpenSettings: true,
      };
    case 'Unauthorized':
      return {
        hint:
          'EMBER needs Bluetooth access to reach your radio. Tap below to open Settings, enable Bluetooth for EMBER, and try again.',
        suggestOpenSettings: true,
      };
    case 'Unsupported':
      return {
        hint:
          'Bluetooth is not available in this build (e.g. web or missing native module). Use an iOS/Android dev client with react-native-ble-plx.',
        suggestOpenSettings: false,
      };
    case 'Resetting':
      return {
        hint: 'Bluetooth is restarting. Wait a few seconds and try again.',
        suggestOpenSettings: false,
      };
    default:
      return {
        hint: 'Check Bluetooth in system settings and try again.',
        suggestOpenSettings: true,
      };
  }
}
