import React, { useMemo } from 'react';
import { navigateToMeshSettings } from '../../src/navigation/navigateToMeshSettings';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ReadinessRing,
  StatCard,
  MessageBubble,
} from '../../src/components';
import { STATUS } from '../../src/constants';
import { useApp } from '../../src/context/AppContext';
import { useCommunity } from '../../src/context/CommunityContext';
import { getCryptoSession } from '../../src/crypto/session';
import { useMeshBroadcastSnapshot } from '../../src/hooks/useMeshBroadcastSnapshot';
import { bleStateLabel } from '../../src/mesh/bleUserStrings';
import { useMeshRadioStore } from '../../src/mesh/meshRadioStore';
import { getTheme } from '../../src/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  meshViz: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  meshContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meshLabel: {
    fontSize: 13,
    color: '#a3a3a3',
    marginTop: 8,
  },
  ringsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  ringItem: {
    width: '48%',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
  },
  xpSection: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 4,
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a3a3a3',
    marginBottom: 8,
  },
  xpBarContainer: {
    backgroundColor: '#0f0f0f',
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 12,
    color: '#808080',
  },
  levelBadge: {
    backgroundColor: '#d4a574',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 12,
    color: '#e5e5e5',
  },
  warningSection: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 12,
    color: '#fca5a5',
    lineHeight: 18,
  },
  achievementsContainer: {
    gap: 8,
  },
  activityContainer: {
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#808080',
    textAlign: 'center',
    paddingVertical: 16,
  },
  meshImportLine: {
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
    fontFamily: 'Courier New',
  },
  meshCrisisActions: {
    marginTop: 14,
    gap: 10,
  },
  meshCrisisButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  meshCrisisButtonDisabled: {
    opacity: 0.45,
  },
  meshCrisisButtonText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  meshConfigLink: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  meshConfigLinkText: {
    color: '#d4a574',
    fontSize: 13,
  },
});

export default function HomeScreen() {
  const { mode, isOnboarded, currentCommunityId } = useApp();
  const cryptoReady = Boolean(getCryptoSession()?.isInitialized());
  const meshNativeOk = useMeshRadioStore((s) => s.nativeBleOk);
  const meshBleState = useMeshRadioStore((s) => s.bleState);
  const meshConnectedId = useMeshRadioStore((s) => s.connectedDeviceId);
  const meshNodeNum = useMeshRadioStore((s) => s.nodeNum);
  const meshInboundLast = useMeshRadioStore((s) => s.meshInboundLast);
  const meshBroadcastProgress = useMeshRadioStore((s) => s.meshBroadcastProgress);
  const meshLastBroadcastOutbound = useMeshRadioStore(
    (s) => s.meshLastBroadcastOutbound
  );
  const {
    broadcastBusy: meshBroadcastBusy,
    broadcastSnapshot: meshBroadcastSnapshot,
    canBroadcast: meshBroadcastAllowed,
  } = useMeshBroadcastSnapshot();
  const {
    members,
    resources,
    drills,
    safeCount,
    helpCount,
    unknownCount,
    criticalResources,
    totalXP,
    readinessScore,
    messages,
    achievements,
  } = useCommunity();

  const theme = getTheme(mode);

  const recentMessages = useMemo(() => messages.slice(0, 3), [messages]);

  const supplyHealth = useMemo(() => {
    const totalResources = resources.length;
    if (totalResources === 0) return 100;
    const healthyCount = resources.filter((r) => r.quantity >= 5).length;
    return Math.round((healthyCount / totalResources) * 100);
  }, [resources]);

  const drillsCompleted = useMemo(() => {
    return drills.filter((d) => d.completedAt.length > 0).length;
  }, [drills]);

  const level = Math.floor(totalXP / 1000) + 1;
  const xpInLevel = totalXP % 1000;
  const xpProgress = xpInLevel / 1000;

  const meshColor = mode === 'crisis' ? '#ef4444' : mode === 'recovery' ? '#22c55e' : '#d4a574';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Mesh Network Visualization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {mode === 'crisis' ? 'Crisis Status' : 'Mesh Network'}
          </Text>
          <View style={[styles.meshViz, { backgroundColor: meshColor + '20' }]}>
            <View style={styles.meshContent}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: meshColor + '40',
                  borderWidth: 2,
                  borderColor: meshColor,
                }}
              />
            </View>
          </View>
          <Text style={styles.meshLabel}>
            Community data: {members.length} member
            {members.length !== 1 ? 's' : ''} (synced/offline roster — not the same as LoRa link
            quality or range).
          </Text>
          <Text
            style={[
              styles.meshLabel,
              mode === 'crisis' && { color: '#fca5a5' },
            ]}
          >
            {!meshNativeOk
              ? 'Mesh radio: requires a native build with BLE (see Settings → Mesh Network).'
              : meshConnectedId
                ? `LoRa bridge: connected${
                    meshNodeNum != null ? ` (node ${meshNodeNum})` : ''
                  }. This does not replace cellular or internet.`
                : `LoRa bridge: not connected. Bluetooth: ${bleStateLabel(
                    meshBleState,
                  )}. Pair a radio in Settings → Mesh Network.`}
          </Text>
          {meshNativeOk &&
          !meshConnectedId &&
          (meshBleState === 'Unauthorized' || meshBleState === 'PoweredOff') ? (
            <Pressable
              onPress={() => {
                void Linking.openSettings();
              }}
              style={{ marginTop: 10, alignSelf: 'flex-start' }}
            >
              <Text style={{ color: '#d4a574', fontSize: 13 }}>
                Open system settings (Bluetooth / app permissions)
              </Text>
            </Pressable>
          ) : null}
          {meshInboundLast ? (
            <Text
              style={[
                styles.meshImportLine,
                { color: meshInboundLast.ok ? '#86efac' : '#f87171' },
              ]}
            >
              {meshInboundLast.ok
                ? `Last mesh import ${new Date(meshInboundLast.at).toLocaleString()}: +${meshInboundLast.membersInserted} members, +${meshInboundLast.checkInsInserted} check-ins`
                : `Last mesh import ${new Date(meshInboundLast.at).toLocaleString()}: ${meshInboundLast.reason}${meshInboundLast.detail ? ` — ${meshInboundLast.detail}` : ''}`}
            </Text>
          ) : null}
          {meshBroadcastProgress ? (
            <Text style={[styles.meshLabel, { marginTop: 6, color: '#fbbf24' }]}>
              Sending LoRa frames: {meshBroadcastProgress.current} /{' '}
              {meshBroadcastProgress.total}
              {meshBroadcastProgress.total > 1 ? ' (chunked snapshot)' : ''}
            </Text>
          ) : null}
          {meshLastBroadcastOutbound ? (
            <Text style={[styles.meshLabel, { marginTop: 4 }]}>
              Last mesh send:{' '}
              {new Date(meshLastBroadcastOutbound.at).toLocaleString()} ·{' '}
              {meshLastBroadcastOutbound.meshPackets} packet
              {meshLastBroadcastOutbound.meshPackets === 1 ? '' : 's'} (
              {meshLastBroadcastOutbound.bundleUtf8Bytes >= 1024
                ? `${(meshLastBroadcastOutbound.bundleUtf8Bytes / 1024).toFixed(1)} KB`
                : `${meshLastBroadcastOutbound.bundleUtf8Bytes} B`}{' '}
              bundle on-air)
            </Text>
          ) : null}
          {mode === 'crisis' &&
          isOnboarded &&
          currentCommunityId &&
          currentCommunityId !== '__none__' ? (
            <View style={styles.meshCrisisActions}>
              <Text style={[styles.meshLabel, { color: '#fca5a5' }]}>
                Same LoRa channel + EMBER passphrase as peers. This is not cell service. Use
                broadcast when the radio is connected (Config if you need to pair).
              </Text>
              {!cryptoReady ? (
                <Text style={[styles.meshLabel, { color: '#fbbf24' }]}>
                  Unlock encryption to broadcast or merge mesh snapshots.
                </Text>
              ) : null}
              <Pressable
                style={[
                  styles.meshCrisisButton,
                  (!meshBroadcastAllowed || meshBroadcastBusy) &&
                    styles.meshCrisisButtonDisabled,
                ]}
                disabled={!meshBroadcastAllowed || meshBroadcastBusy}
                onPress={() => {
                  void meshBroadcastSnapshot();
                }}
              >
                <Text style={styles.meshCrisisButtonText}>
                  {meshBroadcastBusy
                    ? meshBroadcastProgress
                      ? `Broadcasting ${meshBroadcastProgress.current}/${meshBroadcastProgress.total}…`
                      : 'Broadcasting snapshot…'
                    : 'Broadcast encrypted snapshot over mesh'}
                </Text>
              </Pressable>
            </View>
          ) : null}
          <Pressable
            style={styles.meshConfigLink}
            onPress={() => {
              navigateToMeshSettings();
            }}
          >
            <Text style={styles.meshConfigLinkText}>
              {mode === 'crisis'
                ? 'Pair radio & mesh tools → Config'
                : 'Mesh & Bluetooth → Config'}
            </Text>
          </Pressable>
        </View>

        {/* Readiness Rings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Health</Text>
          <View style={styles.ringsContainer}>
            <View style={styles.ringItem}>
              <ReadinessRing
                label="Readiness"
                value={readinessScore}
                color={theme.accent}
              />
            </View>
            <View style={styles.ringItem}>
              <ReadinessRing
                label="Supply"
                value={supplyHealth}
                color={theme.accent}
              />
            </View>
            <View style={styles.ringItem}>
              <ReadinessRing
                label="Drills"
                value={Math.round((drillsCompleted / Math.max(drills.length, 1)) * 100)}
                color={theme.accent}
              />
            </View>
            <View style={styles.ringItem}>
              <ReadinessRing
                label="Safe %"
                value={Math.round((safeCount / Math.max(members.length, 1)) * 100)}
                color={theme.accent}
              />
            </View>
          </View>
        </View>

        {/* Status Cards */}
        <View style={styles.section}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <StatCard label="Safe" value={safeCount} color="#22c55e" />
            </View>
            <View style={styles.statItem}>
              <StatCard label="Need Help" value={helpCount} color="#ef4444" />
            </View>
            <View style={styles.statItem}>
              <StatCard
                label="Unknown"
                value={unknownCount}
                color="#f59e0b"
              />
            </View>
          </View>
        </View>

        {/* XP Progress (Peace Mode Only) */}
        {mode !== 'crisis' && (
          <View style={styles.section}>
            <View style={styles.xpSection}>
              <Text style={styles.xpLabel}>Level Progress</Text>
              <View style={styles.xpBarContainer}>
                <View
                  style={[
                    styles.xpBarFill,
                    {
                      width: `${xpProgress * 100}%`,
                      backgroundColor: theme.accent,
                    },
                  ]}
                />
              </View>
              <View style={styles.xpInfo}>
                <Text style={styles.xpText}>
                  {xpInLevel} / 1000 XP
                </Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>LEVEL {level}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Community Status Chips */}
        {members.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Status</Text>
            <View style={styles.chipsContainer}>
              {members.slice(0, 6).map((member) => (
                <View key={member.id} style={styles.chip}>
                  <View
                    style={[
                      styles.chipDot,
                      {
                        backgroundColor:
                          member.status === STATUS.SAFE
                            ? '#22c55e'
                            : member.status === STATUS.HELP
                              ? '#ef4444'
                              : '#f59e0b',
                      },
                    ]}
                  />
                  <Text style={styles.chipText}>{member.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Critical Resources Warning */}
        {criticalResources.length > 0 && (
          <View style={styles.section}>
            <View style={styles.warningSection}>
              <Text style={styles.warningTitle}>
                ⚠ Critical Resources
              </Text>
              <Text style={styles.warningText}>
                {criticalResources.length} resource(s) below target level.
                Check supply dashboard for details.
              </Text>
            </View>
          </View>
        )}

        {/* Achievements (Peace Mode Only) */}
        {mode !== 'crisis' && achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <View style={styles.achievementsContainer}>
              {achievements.slice(0, 3).map((achievement) => (
                <View
                  key={achievement.id}
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderWidth: 1,
                    borderColor: '#333333',
                    borderRadius: 8,
                    padding: 12,
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{achievement.icon ?? '🏅'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: 2,
                      }}
                    >
                      {achievement.title ?? 'Achievement'}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#808080',
                      }}
                    >
                      {achievement.description ?? ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        {recentMessages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityContainer}>
              {recentMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={{
                    id: msg.id,
                    sender: msg.senderName,
                    text: msg.content,
                    timestamp: msg.timestamp,
                    type: msg.type,
                  }}
                  accent={theme.accent}
                />
              ))}
            </View>
          </View>
        )}

        {recentMessages.length === 0 && messages.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.emptyText}>No activity yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
