import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ReadinessRing,
  StatCard,
  MessageBubble,
} from '../../src/components';
import { useApp } from '../../src/context/AppContext';
import { useCommunity } from '../../src/context/CommunityContext';
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
});

export default function HomeScreen() {
  const { mode } = useApp();
  const {
    members,
    resources,
    drills,
    safeCount,
    helpCount,
    unknownCount,
    criticalResources,
    drillAverage,
    totalXP,
    readinessScore,
    streakDays,
    messages,
    achievements,
  } = useCommunity();

  const theme = getTheme(mode);

  const recentMessages = useMemo(() => messages.slice(0, 3), [messages]);

  const supplyHealth = useMemo(() => {
    const totalResources = resources.length;
    if (totalResources === 0) return 100;
    const healthyCount = resources.filter((r) => r.stock >= r.target).length;
    return Math.round((healthyCount / totalResources) * 100);
  }, [resources]);

  const drillsCompleted = useMemo(() => {
    return drills.filter((d) => d.completed).length;
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
            {mode === 'crisis' ? `${members.length} members connected` : `${members.length} members online`}
          </Text>
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
                        backgroundColor: member.isSafe
                          ? '#22c55e'
                          : member.needsHelp
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
                  <Text style={{ fontSize: 18 }}>{achievement.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: 2,
                      }}
                    >
                      {achievement.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#808080',
                      }}
                    >
                      {achievement.description}
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
                  message={msg.text}
                  sender={msg.sender}
                  timestamp={msg.timestamp}
                  isSelf={msg.isSelf}
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
