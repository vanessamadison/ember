import { Platform } from 'react-native';
import {
  MESHTASTIC_FROM_NUM_UUID,
  MESHTASTIC_FROM_RADIO_UUID,
  MESHTASTIC_MESH_SERVICE_UUID,
  MESHTASTIC_RECOMMENDED_MTU,
  MESHTASTIC_TO_RADIO_UUID,
} from './constants';
import { frameProtobufPayload } from './streamFraming';

export type BlePoweredState =
  | 'Unknown'
  | 'Resetting'
  | 'Unsupported'
  | 'Unauthorized'
  | 'PoweredOff'
  | 'PoweredOn';

export interface DiscoveredRadio {
  id: string;
  name: string | null;
  rssi: number | null;
}

type Device = import('react-native-ble-plx').Device;
type BleManager = import('react-native-ble-plx').BleManager;
type Subscription = import('react-native-ble-plx').Subscription;
type BleManagerCtor = new () => BleManager;

let BleManagerClass: BleManagerCtor | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  BleManagerClass = require('react-native-ble-plx').BleManager as BleManagerCtor;
} catch {
  BleManagerClass = null;
}

/**
 * Minimal Meshtastic BLE client: scan, connect, MTU, write framed ToRadio bytes.
 * Parsing protobufs (FromRadio / ToRadio) is a separate step (Meshtastic-protobufs).
 */
export class MeshtasticBleBridge {
  private manager: BleManager | null = null;
  private stateSub: Subscription | null = null;
  private connected: Device | null = null;

  isNativeBleAvailable(): boolean {
    return (
      Platform.OS !== 'web' &&
      BleManagerClass !== null &&
      typeof BleManagerClass === 'function'
    );
  }

  private ensureManager(): BleManager {
    const Ctor = BleManagerClass;
    if (!this.isNativeBleAvailable() || !Ctor) {
      throw new Error('BLE not available on this platform or build.');
    }
    if (!this.manager) {
      this.manager = new Ctor();
    }
    return this.manager;
  }

  async getBluetoothState(): Promise<BlePoweredState> {
    if (!this.isNativeBleAvailable() || !BleManagerClass) {
      return 'Unsupported';
    }
    const mgr = this.ensureManager();
    const s = await mgr.state();
    return s as BlePoweredState;
  }

  /**
   * Subscribe to adapter on/off (for UI).
   */
  subscribeState(onState: (s: BlePoweredState) => void): () => void {
    if (!this.isNativeBleAvailable() || !BleManagerClass) {
      onState('Unsupported');
      return () => {};
    }
    const mgr = this.ensureManager();
    this.stateSub?.remove();
    const sub = mgr.onStateChange((state) => {
      onState(state as BlePoweredState);
    }, true);
    this.stateSub = sub;
    return () => {
      sub.remove();
      this.stateSub = null;
    };
  }

  /**
   * Scan for devices advertising Meshtastic mesh service.
   */
  startScan(onDevice: (d: DiscoveredRadio) => void, onError?: (e: Error) => void): void {
    if (!this.isNativeBleAvailable() || !BleManagerClass) {
      onError?.(new Error('BLE not available on this platform or build.'));
      return;
    }
    try {
      const mgr = this.ensureManager();
      mgr.startDeviceScan(
        [MESHTASTIC_MESH_SERVICE_UUID],
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            onError?.(error instanceof Error ? error : new Error(String(error)));
            return;
          }
          if (!device) return;
          onDevice({
            id: device.id,
            name: device.name ?? device.localName ?? null,
            rssi: device.rssi ?? null,
          });
        }
      );
    } catch (e) {
      onError?.(e instanceof Error ? e : new Error(String(e)));
    }
  }

  stopScan(): void {
    this.manager?.stopDeviceScan();
  }

  async connect(deviceId: string): Promise<void> {
    if (!this.isNativeBleAvailable() || !BleManagerClass) {
      throw new Error('BLE not available.');
    }
    const mgr = this.ensureManager();
    await this.disconnect();
    const device = await mgr.connectToDevice(deviceId);
    await device.discoverAllServicesAndCharacteristics();
    try {
      await device.requestMTU(MESHTASTIC_RECOMMENDED_MTU);
    } catch {
      /* Some stacks ignore or cap MTU */
    }
    this.connected = device;
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      try {
        await this.connected.cancelConnection();
      } catch {
        /* ignore */
      }
      this.connected = null;
    }
  }

  getConnectedDeviceId(): string | null {
    return this.connected?.id ?? null;
  }

  /**
   * Write framed protobuf bytes to ToRadio (you must supply valid ToRadio protobuf body).
   */
  async writeToRadioProtobuf(protobufBody: Uint8Array): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to a radio.');
    }
    const framed = frameProtobufPayload(protobufBody);
    const b64 = fromByteArray(framed);
    await this.connected.writeCharacteristicWithResponseForService(
      MESHTASTIC_MESH_SERVICE_UUID,
      MESHTASTIC_TO_RADIO_UUID,
      b64
    );
  }

  /**
   * Read one FromRadio mailbox chunk (often one protobuf); repeat until empty.
   */
  async readFromRadio(): Promise<Uint8Array | null> {
    if (!this.connected) {
      throw new Error('Not connected to a radio.');
    }
    const char = await this.connected.readCharacteristicForService(
      MESHTASTIC_MESH_SERVICE_UUID,
      MESHTASTIC_FROM_RADIO_UUID
    );
    if (!char.value) return null;
    return toByteArray(char.value);
  }

  /**
   * Subscribe to FromNum notifies — when fired, drain FromRadio.
   */
  async monitorFromNum(onNotify: () => void): Promise<() => void> {
    if (!this.connected) {
      throw new Error('Not connected to a radio.');
    }
    const sub = this.connected.monitorCharacteristicForService(
      MESHTASTIC_MESH_SERVICE_UUID,
      MESHTASTIC_FROM_NUM_UUID,
      (error) => {
        if (!error) onNotify();
      }
    );
    return () => sub.remove();
  }

  destroy(): void {
    this.stopScan();
    void this.disconnect();
    this.stateSub?.remove();
    this.stateSub = null;
    const mgr = this.manager;
    this.manager = null;
    if (mgr) void mgr.destroy().catch(() => {});
  }
}

function fromByteArray(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function toByteArray(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}
