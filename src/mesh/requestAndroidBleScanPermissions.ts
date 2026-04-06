import { PermissionsAndroid, Platform } from 'react-native';

function androidSdk(): number {
  const v = Platform.Version;
  return typeof v === 'number' ? v : parseInt(String(v), 10);
}

/**
 * Android: request runtime permissions needed before BLE scan (varies by API level).
 * iOS/other: no-op (OS prompts on first Bluetooth use).
 */
export async function requestBleScanRuntimePermissions(): Promise<{
  ok: boolean;
  denied: boolean;
}> {
  if (Platform.OS !== 'android') {
    return { ok: true, denied: false };
  }

  const sdk = androidSdk();

  if (sdk >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    const scanOk =
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
      PermissionsAndroid.RESULTS.GRANTED;
    const connectOk =
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
      PermissionsAndroid.RESULTS.GRANTED;
    const ok = scanOk && connectOk;
    return { ok, denied: !ok };
  }

  if (sdk >= 23) {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location permission for Bluetooth scan',
        message:
          'On this Android version, finding Bluetooth radios requires location permission. EMBER does not use your GPS position.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    const ok = status === PermissionsAndroid.RESULTS.GRANTED;
    return { ok, denied: !ok };
  }

  return { ok: true, denied: false };
}
