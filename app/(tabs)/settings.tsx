import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
  type LayoutChangeEvent,
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
import { useMeshRadio } from '../../src/context/MeshRadioContext';
import type { DiscoveredRadio } from '../../src/mesh/meshtasticBleBridge';
import { useMeshRadioStore } from '../../src/mesh/meshRadioStore';
import {
  dispatchEmberMeshFromFromRadio,
  subscribeEmberMeshInbound,
} from '../../src/mesh/emberMeshInbound';
import { useMeshBroadcastSnapshot } from '../../src/hooks/useMeshBroadcastSnapshot';
import { MESH_INTER_CHUNK_DELAY_CHOICES } from '../../src/mesh/meshInterChunkDelayPreference';
import { digestFromRadioMessages } from '../../src/mesh/fromRadioSummary';
import type { FromRadioMessage } from '../../src/mesh/meshtasticCodec';
import { bleMeshGuidance, bleStateLabel } from '../../src/mesh/bleUserStrings';
import { requestBleScanRuntimePermissions } from '../../src/mesh/requestAndroidBleScanPermissions';
import { saveMeshInterChunkWalkdownActive } from '../../src/mesh/meshInterChunkWalkdownPreference';
import { useMeshSettingsNavStore } from '../../src/mesh/meshSettingsNavStore';
import {
  buildMeshDiagnosticText,
  type MeshDiagnosticInput,
} from '../../src/mesh/meshDiagnosticExport';
import { shareMeshDiagnosticText } from '../../src/mesh/shareMeshDiagnostic';

const MESH_LOG_MAX_LINES = 14;
const MESH_DIAG_EXPORT_MAX_LINES = 400;

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
  const router = useRouter();
  const params = useLocalSearchParams<{ section?: string }>();
  const meshFocus = params.section === 'mesh';
  const focusMeshToken = useMeshSettingsNavStore((s) => s.focusMeshToken);
  const prevFocusMeshToken = useRef(0);
  const { userDisplayName, currentCommunityId, isOnboarded, userId } = useApp();
  const { communityName, members, inviteExpiresAt } = useCommunity();
  const scrollRef = useRef<ScrollView | null>(null);
  const meshDiagLinesRef = useRef<string[]>([]);
  const [pendingMeshScroll, setPendingMeshScroll] = useState(meshFocus);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sync: !meshFocus,
    mesh: meshFocus,
  });
  const [syncBusy, setSyncBusy] = useState(false);
  const [importText, setImportText] = useState('');
  const relayUrl = getRelayBaseUrl();
  const cryptoReady = Boolean(getCryptoSession()?.isInitialized());
  const canVerticalSync =
    isOnboarded &&
    Boolean(currentCommunityId && currentCommunityId !== '__none__') &&
    cryptoReady;

  const meshApi = useMeshRadio();
  const meshNativeOk = useMeshRadioStore((s) => s.nativeBleOk);
  const meshBleState = useMeshRadioStore((s) => s.bleState);
  const meshConnectedId = useMeshRadioStore((s) => s.connectedDeviceId);
  const meshHandshakeBusy = useMeshRadioStore((s) => s.handshakeBusy);
  const meshNodeNum = useMeshRadioStore((s) => s.nodeNum);
  const meshInboundLast = useMeshRadioStore((s) => s.meshInboundLast);
  const meshBroadcastProgress = useMeshRadioStore((s) => s.meshBroadcastProgress);
  const meshLastBroadcastOutbound = useMeshRadioStore(
    (s) => s.meshLastBroadcastOutbound
  );
  const meshFromNumStopRef = useRef<(() => void) | null>(null);
  const [meshScanning, setMeshScanning] = useState(false);
  const [meshDevices, setMeshDevices] = useState<DiscoveredRadio[]>([]);
  const [meshError, setMeshError] = useState<string | null>(null);
  const [meshProtoLog, setMeshProtoLog] = useState('');
  const [meshLastTxHex, setMeshLastTxHex] = useState<string | null>(null);
  const [meshInboundNote, setMeshInboundNote] = useState<string | null>(null);
  const {
    broadcastBusy: meshBroadcastBusy,
    broadcastSnapshot: meshBroadcastSnapshot,
    canBroadcast: meshBroadcastAllowed,
    interChunkDelayMs,
    setInterChunkDelayMs,
  } = useMeshBroadcastSnapshot({
    onTxPreview: (p) => setMeshLastTxHex(p),
  });

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
      useMeshRadioStore.getState().setNodeNum(nodeNum);
    }
    const chunk = lines.join('\n');
    if (!chunk) return;
    const asLines = chunk.split('\n').filter((l) => l.length > 0);
    meshDiagLinesRef.current = [...meshDiagLinesRef.current, ...asLines].slice(
      -MESH_DIAG_EXPORT_MAX_LINES
    );
    setMeshProtoLog((prev) =>
      trimMeshLog(prev ? `${prev}\n${chunk}` : chunk)
    );
  };

  const runMeshtasticHandshakeAfterConnect = async () => {
    const session = meshApi?.session;
    const bridge = meshApi?.bridge;
    if (!session || !bridge || !bridge.getConnectedDeviceId()) return;

    stopMeshRadioSubscription();
    session.resetStream();
    useMeshRadioStore.getState().setHandshakeBusy(true);
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
      useMeshRadioStore.getState().setHandshakeBusy(false);
    }
  };

  useEffect(() => {
    return subscribeEmberMeshInbound((inbound) => {
      setMeshInboundNote(
        `Inbound EMBER v1 envelope: ${inbound.ciphertext.length} B ciphertext (${inbound.fingerprint.length} B fp)`
      );
    });
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

  const meshBleGuidance = useMemo(
    () => bleMeshGuidance(meshBleState),
    [meshBleState]
  );

  useEffect(() => {
    if (params.section === 'mesh') {
      setExpandedSections((prev) => ({
        ...prev,
        mesh: true,
        sync: false,
      }));
      setPendingMeshScroll(true);
      requestAnimationFrame(() => {
        try {
          router.setParams({ section: '' });
        } catch {
          /* ignore */
        }
      });
    }
  }, [params.section, router]);

  useEffect(() => {
    if (focusMeshToken === prevFocusMeshToken.current) return;
    prevFocusMeshToken.current = focusMeshToken;
    if (focusMeshToken === 0) return;
    setExpandedSections((prev) => ({
      ...prev,
      mesh: true,
      sync: false,
    }));
    setPendingMeshScroll(true);
  }, [focusMeshToken]);

  const clearMeshDigestUi = () => {
    meshDiagLinesRef.current = [];
    setMeshProtoLog('');
  };

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

  const onMeshSectionLayout = (e: LayoutChangeEvent) => {
    if (!pendingMeshScroll) return;
    const y = e.nativeEvent.layout.y;
    setPendingMeshScroll(false);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true });
    });
  };

  const meshDiagnosticInput = (): MeshDiagnosticInput => ({
    digestLines: meshDiagLinesRef.current,
    uiLogLineCap: MESH_LOG_MAX_LINES,
    meshBleStateLabel: bleStateLabel(meshBleState),
    platform: Platform.OS,
    connectedDeviceId: meshConnectedId,
    nodeNum: meshNodeNum,
    interChunkDelayMs,
    meshInboundLast,
    meshLastBroadcastOutbound,
    meshError,
    meshLastTxHex,
    meshInboundNote,
  });

  const copyMeshDiagnosticExport = async () => {
    try {
      const text = buildMeshDiagnosticText(meshDiagnosticInput());
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', 'Mesh diagnostic text is on the clipboard (attach to issues / field logs).');
    } catch (err) {
      Alert.alert(
        'Copy failed',
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  };

  const shareMeshDiagnosticExport = async () => {
    try {
      const text = buildMeshDiagnosticText(meshDiagnosticInput());
      await shareMeshDiagnosticText(text);
    } catch (err) {
      Alert.alert(
        'Share failed',
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
      >
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

        {/* Mesh Network — deep link: /(tabs)/settings?section=mesh */}
        <View onLayout={onMeshSectionLayout} collapsable={false}>
        {renderSection(
          'Mesh Network',
          'mesh',
          <>
            <Text style={styles.syncHelp}>
              Meshtastic BLE: scan, connect, MTU 512, then want_config on ToRadio and decode FromRadio (official
              protobufs). FromNum notifications drain new mailbox data. Radio traffic is untrusted for EMBER crypto.
            </Text>
            {meshNativeOk && meshBleState === 'PoweredOn' && meshApi ? (
              <Text style={[styles.syncHelp, { marginTop: 8 }]}>
                First-time pairing: tap Scan below and stay on this screen.{' '}
                {Platform.OS === 'android'
                  ? 'Accept Nearby devices / Bluetooth when Android asks — if you denied before, fix permissions in system App info for EMBER, then tap Refresh Bluetooth state.'
                  : 'Allow Bluetooth for EMBER when iOS prompts; use Open system settings if Bluetooth stays unavailable.'}{' '}
                Put the radio in phone/API connectable mode if the list stays empty. Pilot log template: repo doc
                MESH-FIELD-TEST.md.
              </Text>
            ) : null}
            {!meshApi ? (
              <Text style={styles.syncHelp}>Initializing Bluetooth stack…</Text>
            ) : null}
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Bluetooth</Text>
              <Text style={[styles.contentValue, { flex: 1, textAlign: 'right' }]}>
                {bleStateLabel(meshBleState)}
              </Text>
            </View>
            {meshNativeOk && meshApi ? (
              <Pressable
                style={[styles.syncButton, { marginTop: 8 }]}
                onPress={() => {
                  void (async () => {
                    const b = meshApi.bridge;
                    try {
                      const s = await b.getBluetoothState();
                      useMeshRadioStore.getState().setBleState(s);
                      setMeshError(null);
                    } catch (e) {
                      setMeshError(
                        e instanceof Error ? e.message : String(e)
                      );
                    }
                  })();
                }}
              >
                <Text style={styles.syncButtonText}>Refresh Bluetooth state</Text>
              </Pressable>
            ) : null}
            {!meshNativeOk ? (
              <Text style={styles.syncHelp}>
                Mesh Bluetooth needs a native development build with react-native-ble-plx (Expo Go and web
                are not supported for this prototype).
              </Text>
            ) : meshBleState !== 'PoweredOn' ? (
              <>
                <Text style={styles.syncHelp}>{meshBleGuidance.hint}</Text>
                {meshBleGuidance.suggestOpenSettings ? (
                  <Pressable
                    style={styles.syncButton}
                    onPress={() => {
                      void Linking.openSettings();
                    }}
                  >
                    <Text style={styles.syncButtonText}>Open system settings</Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
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
            {meshInboundLast ? (
              <Text
                style={[
                  styles.meshProtoLog,
                  { color: meshInboundLast.ok ? '#86efac' : '#f87171' },
                ]}
              >
                {meshInboundLast.ok
                  ? `Mesh import ${new Date(meshInboundLast.at).toLocaleString()}: +${meshInboundLast.membersInserted} members, +${meshInboundLast.checkInsInserted} check-ins`
                  : `Mesh import ${new Date(meshInboundLast.at).toLocaleString()}: ${meshInboundLast.reason}${meshInboundLast.detail ? ` — ${meshInboundLast.detail}` : ''}`}
              </Text>
            ) : null}
            <Pressable style={styles.syncButton} onPress={() => void copyMeshDiagnosticExport()}>
              <Text style={styles.syncButtonText}>Copy mesh diagnostic report</Text>
            </Pressable>
            <Pressable
              style={[styles.syncButton, styles.syncButtonPrimary]}
              onPress={() => void shareMeshDiagnosticExport()}
            >
              <Text style={[styles.syncButtonText, styles.syncButtonTextDark]}>
                Share mesh diagnostic…
              </Text>
            </Pressable>
            <Text style={styles.syncHelp}>
              Same plaintext as copy: Bluetooth, node id, chunk spacing, last import/errors, and up to{' '}
              {MESH_DIAG_EXPORT_MAX_LINES} digest lines. Share saves a .txt and opens the system sheet (Mail,
              Files, Drive); web falls back to the OS share dialog with message text.
            </Text>
            <Pressable
              style={[
                styles.syncButton,
                {
                  opacity:
                    !meshApi ||
                    meshBleState !== 'PoweredOn' ||
                    !meshNativeOk ||
                    meshScanning
                      ? 0.45
                      : 1,
                },
              ]}
              disabled={
                !meshApi ||
                meshBleState !== 'PoweredOn' ||
                !meshNativeOk ||
                meshScanning
              }
              onPress={() => {
                void (async () => {
                  const b = meshApi?.bridge;
                  if (!b || !meshNativeOk) return;
                  setMeshError(null);
                  if (Platform.OS === 'android') {
                    const perm = await requestBleScanRuntimePermissions();
                    if (!perm.ok) {
                      setMeshError(
                        perm.denied
                          ? 'Bluetooth permission denied. Allow Nearby devices / Bluetooth for EMBER in system settings, then tap Refresh Bluetooth state.'
                          : 'Could not obtain Bluetooth permission for scan.'
                      );
                      return;
                    }
                    try {
                      const s = await b.getBluetoothState();
                      useMeshRadioStore.getState().setBleState(s);
                    } catch {
                      /* ignore refresh errors; scan may still work */
                    }
                  }
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
                })();
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
                meshApi?.bridge?.stopScan();
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
                  const b = meshApi?.bridge;
                  const session = meshApi?.session;
                  if (!b) return;
                  try {
                    stopMeshRadioSubscription();
                    session?.resetStream();
                    await b.disconnect();
                    useMeshRadioStore.getState().clearSessionFields();
                    clearMeshDigestUi();
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
                    !meshConnectedId ||
                    meshHandshakeBusy ||
                    meshBroadcastBusy ||
                    !meshNativeOk
                      ? 0.45
                      : 1,
                },
              ]}
              disabled={
                !meshConnectedId ||
                meshHandshakeBusy ||
                meshBroadcastBusy ||
                !meshNativeOk
              }
              onPress={() => {
                void (async () => {
                  const session = meshApi?.session;
                  if (!session || !meshConnectedId) return;
                  useMeshRadioStore.getState().setHandshakeBusy(true);
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
                    useMeshRadioStore.getState().setHandshakeBusy(false);
                  }
                })();
              }}
            >
              <Text style={styles.syncButtonText}>
                Re-request config (want_config)
              </Text>
            </Pressable>
            <Text style={styles.syncHelp}>
              Chunked mesh sends pause between packets. Increase if your radio drops multi-part
              snapshots (saved on device).
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 8,
                marginBottom: 12,
              }}
            >
              {MESH_INTER_CHUNK_DELAY_CHOICES.map((ms) => (
                <Pressable
                  key={ms}
                  onPress={() => {
                    void (async () => {
                      await setInterChunkDelayMs(ms);
                      await saveMeshInterChunkWalkdownActive(false);
                    })();
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor:
                      interChunkDelayMs === ms ? '#d4a574' : '#333333',
                    backgroundColor:
                      interChunkDelayMs === ms
                        ? 'rgba(212, 165, 116, 0.15)'
                        : '#1a1a1a',
                  }}
                >
                  <Text style={{ color: '#e5e5e5', fontSize: 12 }}>{ms} ms</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[
                styles.syncButton,
                {
                  opacity:
                    !meshBroadcastAllowed || meshBroadcastBusy ? 0.45 : 1,
                },
              ]}
              disabled={!meshBroadcastAllowed || meshBroadcastBusy}
              onPress={() => {
                setMeshError(null);
                void meshBroadcastSnapshot();
              }}
            >
              <Text style={styles.syncButtonText}>
                {meshBroadcastBusy
                  ? meshBroadcastProgress
                    ? `Broadcasting ${meshBroadcastProgress.current}/${meshBroadcastProgress.total}…`
                    : 'Broadcasting snapshot…'
                  : 'Broadcast encrypted snapshot over mesh'}
              </Text>
            </Pressable>
            {meshBroadcastProgress ? (
              <Text style={styles.syncHelp}>
                LoRa frames written: {meshBroadcastProgress.current} /{' '}
                {meshBroadcastProgress.total}
                {meshBroadcastProgress.total > 1
                  ? ' (pauses between frames use your chunk spacing)'
                  : ''}
              </Text>
            ) : null}
            {meshLastBroadcastOutbound ? (
              <Text style={[styles.syncHelp, { color: '#a3a3a3' }]}>
                Last mesh send:{' '}
                {new Date(meshLastBroadcastOutbound.at).toLocaleString()} ·{' '}
                {meshLastBroadcastOutbound.meshPackets} packet
                {meshLastBroadcastOutbound.meshPackets === 1 ? '' : 's'} on-air
              </Text>
            ) : null}
            {meshDevices.map((d) => (
              <Pressable
                key={d.id}
                style={styles.meshDeviceRow}
                onPress={() => {
                  void (async () => {
                    const b = meshApi?.bridge;
                    if (!b || !meshNativeOk) return;
                    try {
                      setMeshError(null);
                      clearMeshDigestUi();
                      useMeshRadioStore.getState().setNodeNum(null);
                      useMeshRadioStore.getState().setConnectedDeviceId(null);
                      setMeshLastTxHex(null);
                      setMeshInboundNote(null);
                      await b.connect(d.id);
                      useMeshRadioStore
                        .getState()
                        .setConnectedDeviceId(b.getConnectedDeviceId());
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
        </View>

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
