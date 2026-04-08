import { Alert, Linking } from 'react-native';
import type { BlePoweredState } from './meshtasticBleBridge';
import { bleMeshGuidance } from './bleUserStrings';

/**
 * If Bluetooth is not powered on, show an alert with platform-specific guidance
 * (and optional Open settings). Does not invoke `onReady` until the adapter is on —
 * call this only after a fresh {@link MeshtasticBleBridge.getBluetoothState} when possible.
 */
export function runBleScanPreflight(
  bleState: BlePoweredState,
  onReady: () => void
): void {
  if (bleState === 'PoweredOn') {
    onReady();
    return;
  }

  const g = bleMeshGuidance(bleState);
  const buttons: { text: string; style?: 'cancel'; onPress?: () => void }[] =
    [];

  if (g.suggestOpenSettings) {
    buttons.push({
      text: 'Open system settings',
      onPress: () => {
        void Linking.openSettings();
      },
    });
  }
  buttons.push({ text: 'OK', style: 'cancel' });

  Alert.alert('Bluetooth required for scan', g.hint, buttons);
}
