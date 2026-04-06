import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { EmberLogo } from '../../src/components';
import { useApp } from '../../src/context/AppContext';
import { useCommunity } from '../../src/context/CommunityContext';
import { getCryptoSession } from '../../src/crypto/session';
import {
  exportMembersCheckInsSneakerBase64,
  importMembersCheckInsSneakerBase64,
  syncMembersCheckInsViaRelay,
  getRelayBaseUrl,
} from '../../src/sync';
import { renewCommunityInviteWindow } from '../../src/db/communityLifecycle';
import {
  MeshtasticBleBridge,
  type BlePoweredState,
  type DiscoveredRadio,
} from '../../src/mesh/meshtasticBleBridge';
import { communityMeshFingerprint16 } from '../../src/mesh/communityFingerprint';
import { dispatchEmberMeshFromFromRadio, setEmberMeshInboundListener } from '../../src/mesh/emberMeshInbound';
import { bytesToHexPreview, encodeEmberMeshDataPacketToRadio } from '../../src/mesh/emberMeshPacket';
import { digestFromRadioMessages } from '../../src/mesh/fromRadioSummary';
import { MeshtasticSession } from '../../src/mesh/meshtasticSession';
import type { FromRadioMessage } from '../../src/mesh/meshtasticCodec';

const MESH_LOG_MAX_LINES = 14;

function trimMeshLog(text: string, maxLines = MESH_LOG_MAX_LINES): string {
  const lines = text.split('\n');
  if (lines.length <= maxLines) return text;
  return lines.slice(-maxLines).join('\n');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d4a574',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: 12,
    color: '#a3a3a3',
    marginBottom: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e5e5',
  },
  sectionToggle: {
    fontSize: 14,
    color: '#d4a574',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contentLabel: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  contentValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: '#d4a574',
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  dangerSection: {
    marginTop: 24,
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dangerTitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ef4444',
  },
  dangerTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
  dangerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dangerButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    borderTopWidth: 1,
    borderTopColor: '#ef4444',
  },
  dangerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerLogo: {
    marginBottom: 12,
  },
  footerText: {
    fontSize: 11,
    color: '#808080',
    marginBottom: 4,
  },
  syncHelp: {
    fontSize: 11,
    color: '#808080',
    lineHeight: 16,
    marginBottom: 8,
  },
  syncInput: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    color: '#e5e5e5',
    fontSize: 11,
    fontFamily: 'Courier New',
    minHeight: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  syncButton: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  syncButtonPrimary: {
    backgroundColor: '#d4a574',
  },
  syncButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e5e5',
  },
  syncButtonTextDark: {
    color: '#000000',
  },
  meshDeviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  meshDeviceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e5e5',
  },
  meshDeviceMeta: {
    fontSize: 11,
    color: '#808080',
    marginTop: 2,
  },
  meshBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#d4a574',
  },
  meshProtoLog: {
    fontSize: 10,
    fontFamily: 'Courier New',
    color: '#a3a3a3',
    lineHeight: 15,
  },
});

export default function SettingsScreen() {
  const { userDisplayName, currentCommunityId, isOnboarded, userId } = useApp();
  const { communityName, members, inviteExpiresAt } = useCommunity();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sync: true,
    mesh: false,
  });
  const [syncBusy, setSyncBusy] = useState(false);
  const [importText, setImportText] = useState('');
  const relayUrl = getRelayBaseUrl();
  const cryptoReady = Boolean(getCryptoSession()?.isInitialized());
  const canVerticalSync =
    isOnboarded &&
    Boolean(currentCommunityId && currentCommunityId !== '__none__') &&
    cryptoReady;

  const meshBridgeRef = useRef<MeshtasticBleBridge | null>(null);
  const meshSessionRef = useRef<MeshtasticSession | null>(null);
  const meshFromNumStopRef = useRef<(() => void) | null>(null);
  const [meshNativeOk, setMeshNativeOk] = useState(false);
  const [meshBleState, setMeshBleState] = useState<BlePoweredState>('Unknown');
  const [meshScanning, setMeshScanning] = useState(false);
  const [meshDevices, setMeshDevices] = useState<DiscoveredRadio[]>([]);
  const [meshConnectedId, setMeshConnectedId] = useState<string | null>(null);
  const [meshError, setMeshError] = useState<string | null>(null);
  const [meshHandshakeBusy, setMeshHandshakeBusy] = useState(false);
  const [meshProtoLog, setMeshProtoLog] = useState('');
  const [meshNodeNum, setMeshNodeNum] = useState<number | null>(null);
  const [meshLastTxHex, setMeshLastTxHex] = useState<string | null>(null);
  const [meshInboundNote, setMeshInboundNote] = useState<string | null>(null);

  const stopMeshRadioSubscription = () => {
    meshFromNumStopRef.current?.();
    meshFromNumStopRef.current = null;
  };

  const applyMeshFromRadioDigest = (
    messages: FromRadioMessage[],
    expectedConfigId?: number
  ) => {
    for (const m of messages) {
      dispatchEmberMeshFromFromRadio(m);
    }
    const { lines, nodeNum } = digestFromRadioMessages(
      messages,
      expectedConfigId
    );
    if (nodeNum != null) {
      setMeshNodeNum(nodeNum);
    }
    const chunk = lines.join('\n');
    if (!chunk) return;
    setMeshProtoLog((prev) =>
      trimMeshLog(prev ? `${prev}\n${chunk}` : chunk)
    );
  };

  const runMeshtasticHandshakeAfterConnect = async () => {
    const session = meshSessionRef.current;
    const bridge = meshBridgeRef.current;
    if (!session || !bridge || !bridge.getConnectedDeviceId()) return;

    stopMeshRadioSubscription();
    session.resetStream();
    setMeshHandshakeBusy(true);
    setMeshError(null);
    try {
      const { configId, fromRadioMessages } =
        await session.requestConfigAndDrainOnce();
      applyMeshFromRadioDigest(fromRadioMessages, configId);
      const stop = await bridge.monitorFromNum(() => {
        void (async () => {
          try {
            const more = await session.drainFromRadioMailbox();
            if (more.length) {
              applyMeshFromRadioDigest(more);
            }
          } catch (err) {
            setMeshError(
              err instanceof Error ? err.message : String(err)
            );
          }
        })();
      });
      meshFromNumStopRef.current = stop;
    } catch (e) {
      setMeshError(e instanceof Error ? e.message : String(e));
    } finally {
      setMeshHandshakeBusy(false);
    }
  };

  useEffect(() => {
    const bridge = new MeshtasticBleBridge();
    meshBridgeRef.current = bridge;
    meshSessionRef.current = new MeshtasticSession(bridge);
    setMeshNativeOk(bridge.isNativeBleAvailable());
    let unsubState = () => {};
    if (bridge.isNativeBleAvailable()) {
      void bridge.getBluetoothState().then(setMeshBleState);
      unsubState = bridge.subscribeState(setMeshBleState);
    } else {
      setMeshBleState('Unsupported');
    }
    return () => {
      meshFromNumStopRef.current?.();
      meshFromNumStopRef.current = null;
      unsubState();
      bridge.destroy();
      meshBridgeRef.current = null;
      meshSessionRef.current = null;
    };
  }, []);

  useEffect(() => {
    setEmberMeshInboundListener((inbound) => {
      setMeshInboundNote(
        `Inbound EMBER v1 envelope: ${inbound.ciphertext.length} B ciphertext`
      );
    });
    return () => setEmberMeshInboundListener(null);
  }, []);

  const profileInitial = (
    userDisplayName?.trim()?.charAt(0) || 'U'
  ).toUpperCase();

  const isCoordinator = useMemo(
    () =>
      Boolean(
        userId &&
          members.some((m) => m.id === userId && m.role === 'coordinator')
      ),
    [members, userId]
  );

  const inviteExpiryLabel =
    inviteExpiresAt && inviteExpiresAt > 0
      ? new Date(inviteExpiresAt).toLocaleString()
      : 'No cutoff (legacy community)';

  const toggles = {
    autoConnect: true,
    relayMode: false,
    checkInReminders: true,
    crisisAlerts: true,
    resourceWarnings: true,
  };

  const handleToggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderToggle = (value: boolean) => (
    <View style={[styles.toggle, value && styles.toggleOn]}>
      <View
        style={[
          styles.toggleDot,
          {
            alignSelf: value ? 'flex-end' : 'flex-start',
          },
        ]}
      />
    </View>
  );

  const renderSection = (
    title: string,
    key: string,
    content: React.ReactNode
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionCard}>
        <Pressable
          style={styles.sectionHeader}
          onPress={() => handleToggleSection(key)}
        >
          <Text style={styles.sectionHeaderText}>{title}</Text>
          <Text style={styles.sectionToggle}>
            {expandedSections[key] ? '−' : '+'}
          </Text>
        </Pressable>
        {expandedSections[key] && (
          <View style={styles.sectionContent}>
            {content}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profileInitial}</Text>
          </View>
          <Text style={styles.profileName}>
            {userDisplayName?.trim() || 'Community member'}
          </Text>
          <Text style={styles.profileDetail}>{communityName}</Text>
          <Text style={styles.profileDetail}>
            {isOnboarded ? 'Onboarded' : 'Not onboarded'}
          </Text>
        </View>

        {renderSection(
          'Community sync (Phase B)',
          'sync',
          <>
            <Text style={styles.syncHelp}>
              Encrypted members + check-ins. Sneaker-net needs no server; relay
              uses EXPO_PUBLIC_EMBER_RELAY_URL. You must already belong to the
              same community (invite + passphrase) on this device.
            </Text>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Relay URL</Text>
              <Text
                style={[styles.contentValue, { flex: 1, textAlign: 'right' }]}
                numberOfLines={2}
              >
                {relayUrl || '(not set)'}
              </Text>
            </View>
            <Pressable
              style={[
                styles.syncButton,
                styles.syncButtonPrimary,
                { opacity: !canVerticalSync || !relayUrl || syncBusy ? 0.45 : 1 },
              ]}
              disabled={!canVerticalSync || !relayUrl || syncBusy}
              onPress={() => {
                if (!currentCommunityId) return;
                void (async () => {
                  setSyncBusy(true);
                  try {
                    const r = await syncMembersCheckInsViaRelay(currentCommunityId);
                    Alert.alert(
                      'Relay sync',
                      r.pulled
                        ? `Merged remote snapshot, then pushed. New members: ${r.merge?.membersInserted ?? 0}, check-ins: ${r.merge?.checkInsInserted ?? 0}`
                        : 'No remote bundle yet; pushed local snapshot.'
                    );
                  } catch (e) {
                    Alert.alert(
                      'Relay sync failed',
                      e instanceof Error ? e.message : 'Unknown error'
                    );
                  } finally {
                    setSyncBusy(false);
                  }
                })();
              }}
            >
              {syncBusy ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={[styles.syncButtonText, styles.syncButtonTextDark]}>
                  Pull, merge & push (relay)
                </Text>
              )}
            </Pressable>
            <Pressable
              style={[
                styles.syncButton,
                { opacity: !canVerticalSync || syncBusy ? 0.45 : 1 },
              ]}
              disabled={!canVerticalSync || syncBusy}
              onPress={() => {
                if (!currentCommunityId) return;
                void (async () => {
                  try {
                    const b64 = await exportMembersCheckInsSneakerBase64(
                      currentCommunityId
                    );
                    await Clipboard.setStringAsync(b64);
                    Alert.alert('Copied', 'Encrypted bundle is on the clipboard.');
                  } catch (e) {
                    Alert.alert(
                      'Copy failed',
                      e instanceof Error ? e.message : 'Unknown error'
                    );
                  }
                })();
              }}
            >
              <Text style={styles.syncButtonText}>Copy encrypted bundle</Text>
            </Pressable>
            <Pressable
              style={styles.syncButton}
              onPress={() => {
                void (async () => {
                  const t = await Clipboard.getStringAsync();
                  setImportText(t ?? '');
                })();
              }}
            >
              <Text style={styles.syncButtonText}>Paste bundle from clipboard</Text>
            </Pressable>
            <TextInput
              style={styles.syncInput}
              placeholder="Paste ciphertext here to import"
              placeholderTextColor="#666666"
              multiline
              value={importText}
              onChangeText={setImportText}
            />
            <Pressable
              style={[
                styles.syncButton,
                styles.syncButtonPrimary,
                { opacity: !canVerticalSync || !importText.trim() ? 0.45 : 1 },
              ]}
              disabled={!canVerticalSync || !importText.trim()}
              onPress={() => {
                void (async () => {
                  try {
                    const r = await importMembersCheckInsSneakerBase64(importText);
                    setImportText('');
                    Alert.alert(
                      'Import complete',
                      `Members +${r.membersInserted}, check-ins +${r.checkInsInserted}`
                    );
                  } catch (e) {
                    Alert.alert(
                      'Import failed',
                      e instanceof Error ? e.message : 'Unknown error'
                    );
                  }
                })();
              }}
            >
              <Text style={[styles.syncButtonText, styles.syncButtonTextDark]}>
                Merge imported bundle
              </Text>
            </Pressable>
          </>
        )}

        {renderSection(
          'Coordinator',
          'coordinator',
          <>
            <Text style={styles.syncHelp}>
              Coordinators can extend how long new members may join. The new date
              is included in encrypted sync bundles so other devices update when
              they pull or import.
            </Text>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Join cutoff</Text>
              <Text
                style={[styles.contentValue, { flex: 1, textAlign: 'right' }]}
                numberOfLines={3}
              >
                {inviteExpiryLabel}
              </Text>
            </View>
            <Pressable
              style={[
                styles.syncButton,
                styles.syncButtonPrimary,
                {
                  opacity:
                    !isCoordinator ||
                    !userId ||
                    !currentCommunityId ||
                    currentCommunityId === '__none__'
                      ? 0.45
                      : 1,
                },
              ]}
              disabled={
                !isCoordinator ||
                !userId ||
                !currentCommunityId ||
                currentCommunityId === '__none__'
              }
              onPress={() => {
                if (!userId || !currentCommunityId) return;
                void (async () => {
                  try {
                    const next = await renewCommunityInviteWindow(
                      currentCommunityId,
                      userId
                    );
                    Alert.alert(
                      'Join window extended',
                      `New members can join until ${new Date(next).toLocaleString()}. Sync or share a bundle so other devices see this.`
                    );
                  } catch (e) {
                    Alert.alert(
                      'Could not extend',
                      e instanceof Error ? e.message : 'Unknown error'
                    );
                  }
                })();
              }}
            >
              <Text style={[styles.syncButtonText, styles.syncButtonTextDark]}>
                Extend join window by 90 days
              </Text>
            </Pressable>
          </>
        )}

        {/* Encryption & Security */}
        {renderSection(
          'Encryption & Security',
          'encryption',
          <>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Algorithm</Text>
              <Text style={styles.contentValue}>AES-256-GCM</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Key Derivation</Text>
              <Text style={styles.contentValue}>Argon2id</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Passphrase Strength</Text>
              <Text style={[styles.contentValue, { color: '#22c55e' }]}>
                Strong
              </Text>
            </View>
          </>
        )}

        {/* Mesh Network */}
        {renderSection(
          'Mesh Network',
          'mesh',
          <>
            <Text style={styles.syncHelp}>
              Meshtastic BLE: scan, connect, MTU 512, then want_config on ToRadio and decode FromRadio (official
              protobufs). FromNum notifications drain new mailbox data. Radio traffic is untrusted for EMBER crypto.
            </Text>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Bluetooth</Text>
              <Text style={styles.contentValue}>{meshBleState}</Text>
            </View>
            {meshHandshakeBusy ? (
              <View style={[styles.contentRow, { justifyContent: 'flex-start', gap: 8 }]}>
                <ActivityIndicator color="#d4a574" size="small" />
                <Text style={styles.contentValue}>Radio handshake…</Text>
              </View>
            ) : null}
            {meshConnectedId ? (
              <View style={styles.contentRow}>
                <Text style={styles.contentLabel}>Connected</Text>
                <Text
                  style={[styles.contentValue, { flex: 1, textAlign: 'right' }]}
                  numberOfLines={2}
                >
                  {meshConnectedId}
                </Text>
              </View>
            ) : null}
            {meshNodeNum != null ? (
              <View style={styles.contentRow}>
                <Text style={styles.contentLabel}>Radio node num</Text>
                <Text style={styles.contentValue}>{meshNodeNum}</Text>
              </View>
            ) : null}
            {meshProtoLog ? (
              <Text style={styles.meshProtoLog}>{meshProtoLog}</Text>
            ) : null}
            {meshError ? (
              <Text style={[styles.syncHelp, { color: '#f59e0b' }]}>{meshError}</Text>
            ) : null}
            {meshLastTxHex ? (
              <Text style={styles.meshProtoLog}>
                Last ToRadio packet (hex preview): {meshLastTxHex}
              </Text>
            ) : null}
            {meshInboundNote ? (
              <Text style={[styles.meshProtoLog, { color: '#93c5fd' }]}>
                {meshInboundNote}
              </Text>
            ) : null}
            <Pressable
              style={[
                styles.syncButton,
                {
                  opacity:
                    meshBleState !== 'PoweredOn' || !meshNativeOk || meshScanning
                      ? 0.45
                      : 1,
                },
              ]}
              disabled={meshBleState !== 'PoweredOn' || !meshNativeOk || meshScanning}
              onPress={() => {
                const b = meshBridgeRef.current;
                if (!b || !meshNativeOk) return;
                setMeshError(null);
                setMeshDevices([]);
                setMeshScanning(true);
                b.startScan(
                  (d) => {
                    setMeshDevices((prev) => {
                      if (prev.some((x) => x.id === d.id)) return prev;
                      return [...prev, d];
                    });
                  },
                  (err) => {
                    setMeshError(err.message);
                    b.stopScan();
                    setMeshScanning(false);
                  }
                );
              }}
            >
              <Text style={styles.syncButtonText}>
                {meshScanning ? 'Scanning…' : 'Scan for Meshtastic radios'}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.syncButton,
                { opacity: meshScanning ? 1 : 0.45 },
              ]}
              disabled={!meshScanning}
              onPress={() => {
                meshBridgeRef.current?.stopScan();
                setMeshScanning(false);
              }}
            >
              <Text style={styles.syncButtonText}>Stop scan</Text>
            </Pressable>
            <Pressable
              style={[
                styles.syncButton,
                styles.syncButtonPrimary,
                { opacity: meshConnectedId ? 1 : 0.45 },
              ]}
              disabled={!meshConnectedId}
              onPress={() => {
                void (async () => {
                  const b = meshBridgeRef.current;
                  const session = meshSessionRef.current;
                  if (!b) return;
                  try {
                    stopMeshRadioSubscription();
                    session?.resetStream();
                    await b.disconnect();
                    setMeshConnectedId(null);
                    setMeshNodeNum(null);
                    setMeshProtoLog('');
                    setMeshLastTxHex(null);
                    setMeshInboundNote(null);
                  } catch (e) {
                    Alert.alert(
                      'Disconnect failed',
                      e instanceof Error ? e.message : 'Unknown error'
                    );
                  }
                })();
              }}
            >
              <Text style={[styles.syncButtonText, styles.syncButtonTextDark]}>
                Disconnect
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.syncButton,
                {
                  opacity:
                    !meshConnectedId || meshHandshakeBusy || !meshNativeOk
                      ? 0.45
                      : 1,
                },
              ]}
              disabled={!meshConnectedId || meshHandshakeBusy || !meshNativeOk}
              onPress={() => {
                void (async () => {
                  const session = meshSessionRef.current;
                  if (!session || !meshConnectedId) return;
                  setMeshHandshakeBusy(true);
                  setMeshError(null);
                  try {
                    const { configId, fromRadioMessages } =
                      await session.requestConfigAndDrainOnce();
                    applyMeshFromRadioDigest(fromRadioMessages, configId);
                  } catch (e) {
                    setMeshError(
                      e instanceof Error ? e.message : String(e)
                    );
                  } finally {
                    setMeshHandshakeBusy(false);
                  }
                })();
              }}
            >
              <Text style={styles.syncButtonText}>
                Re-request config (want_config)
              </Text>
            </Pressable>
            {__DEV__ ? (
              <Pressable
                style={[
                  styles.syncButton,
                  {
                    opacity:
                      !meshConnectedId ||
                      meshHandshakeBusy ||
                      !meshNativeOk ||
                      !currentCommunityId ||
                      currentCommunityId === '__none__'
                        ? 0.45
                        : 1,
                  },
                ]}
                disabled={
                  !meshConnectedId ||
                  meshHandshakeBusy ||
                  !meshNativeOk ||
                  !currentCommunityId ||
                  currentCommunityId === '__none__'
                }
                onPress={() => {
                  void (async () => {
                    const session = meshSessionRef.current;
                    const cid = currentCommunityId;
                    if (!session || !cid || cid === '__none__') return;
                    setMeshError(null);
                    try {
                      const fp = await communityMeshFingerprint16(cid);
                      const cipher = new Uint8Array([0xde, 0x76, 0x01]);
                      const body = encodeEmberMeshDataPacketToRadio(fp, cipher);
                      setMeshLastTxHex(bytesToHexPreview(body));
                      await session.sendEmberMeshCiphertext(fp, cipher);
                    } catch (e) {
                      Alert.alert(
                        'Dev mesh send failed',
                        e instanceof Error ? e.message : String(e)
                      );
                    }
                  })();
                }}
              >
                <Text style={styles.syncButtonText}>
                  [Dev] Send test EMBER mesh payload
                </Text>
              </Pressable>
            ) : null}
            {meshDevices.map((d) => (
              <Pressable
                key={d.id}
                style={styles.meshDeviceRow}
                onPress={() => {
                  void (async () => {
                    const b = meshBridgeRef.current;
                    if (!b || !meshNativeOk) return;
                    try {
                      setMeshError(null);
                      setMeshProtoLog('');
                      setMeshNodeNum(null);
                      setMeshLastTxHex(null);
                      setMeshInboundNote(null);
                      await b.connect(d.id);
                      setMeshConnectedId(b.getConnectedDeviceId());
                      b.stopScan();
                      setMeshScanning(false);
                      await runMeshtasticHandshakeAfterConnect();
                    } catch (e) {
                      Alert.alert(
                        'Connect failed',
                        e instanceof Error ? e.message : 'Unknown error'
                      );
                    }
                  })();
                }}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.meshDeviceTitle}>
                    {d.name ?? 'Unnamed radio'}
                  </Text>
                  <Text style={styles.meshDeviceMeta}>
                    {d.id}
                    {d.rssi != null ? ` · RSSI ${d.rssi}` : ''}
                  </Text>
                </View>
                {meshConnectedId === d.id ? (
                  <Text style={styles.meshBadge}>Active</Text>
                ) : (
                  <Text style={styles.meshBadge}>Connect</Text>
                )}
              </Pressable>
            ))}
          </>
        )}

        {/* Notifications */}
        {renderSection(
          'Notifications',
          'notifications',
          <>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Check-in Reminders</Text>
              {renderToggle(toggles.checkInReminders)}
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Crisis Alerts</Text>
              {renderToggle(toggles.crisisAlerts)}
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Resource Warnings</Text>
              {renderToggle(toggles.resourceWarnings)}
            </View>
          </>
        )}

        {/* Data & Privacy */}
        {renderSection(
          'Data & Privacy',
          'data',
          <>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Storage Used</Text>
              <Text style={styles.contentValue}>12.4 MB</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Sync Status</Text>
              <Text style={[styles.contentValue, { color: '#22c55e' }]}>
                Synced
              </Text>
            </View>
            <Pressable style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, color: '#d4a574', fontWeight: '600' }}>
                Export Data
              </Text>
            </Pressable>
            <Pressable style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, color: '#f59e0b', fontWeight: '600' }}>
                Delete Local Data
              </Text>
            </Pressable>
          </>
        )}

        {/* About EMBER */}
        {renderSection(
          'About EMBER',
          'about',
          <>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Version</Text>
              <Text style={styles.contentValue}>v1.0.0-mvp</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>License</Text>
              <Text style={styles.contentValue}>AGPL v3</Text>
            </View>
            <Pressable style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, color: '#d4a574', fontWeight: '600' }}>
                View Source Code
              </Text>
            </Pressable>
            <Pressable style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, color: '#d4a574', fontWeight: '600' }}>
                View Credits
              </Text>
            </Pressable>
          </>
        )}

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <View style={styles.dangerCard}>
            <View style={styles.dangerTitle}>
              <Text style={styles.dangerTitleText}>Danger Zone</Text>
            </View>
            <View style={styles.dangerContent}>
              <Pressable style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Leave Community</Text>
              </Pressable>
              <Pressable style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Wipe All Data</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <EmberLogo size={32} glow={false} />
          </View>
          <Text style={styles.footerText}>EMBER v1.0.0-mvp</Text>
          <Text style={styles.footerText}>
            ILLAPEX LLC / Lirio Labs
          </Text>
          <Text style={[styles.footerText, { marginTop: 8 }]}>
            Encrypted Mesh Based Emergency Response
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
