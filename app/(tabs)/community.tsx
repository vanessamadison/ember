import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MemberCard, Pill } from '../../src/components';
import { useApp } from '../../src/context/AppContext';
import { useCommunity } from '../../src/context/CommunityContext';
import { getTheme } from '../../src/theme';
import { softRemoveMemberFromCommunity } from '../../src/db/communityLifecycle';

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
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBadge: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#a3a3a3',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  skillsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 10,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  membersSection: {
    flex: 1,
  },
  membersList: {
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#808080',
    textAlign: 'center',
    paddingVertical: 32,
  },
  inviteBanner: {
    backgroundColor: 'rgba(212, 165, 116, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.35)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  inviteBannerText: {
    fontSize: 12,
    color: '#d4a574',
    lineHeight: 18,
  },
  removeMemberBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  removeMemberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  memberRow: {
    marginBottom: 12,
  },
  crisisMeshNote: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  crisisMeshNoteText: {
    fontSize: 12,
    color: '#fca5a5',
    lineHeight: 18,
  },
});

export default function CommunityScreen() {
  const { mode, userId } = useApp();
  const { members, safeCount, inviteExpiresAt } = useCommunity();
  const theme = getTheme(mode);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  const isCoordinator = useMemo(
    () =>
      Boolean(
        userId &&
          members.some((m) => m.id === userId && m.role === 'coordinator')
      ),
    [members, userId]
  );

  const inviteBannerText = useMemo(() => {
    if (!inviteExpiresAt || inviteExpiresAt <= 0) {
      return null;
    }
    return `New members can join until ${new Date(inviteExpiresAt).toLocaleString()}. After that, only existing members remain (extend policy TBD).`;
  }, [inviteExpiresAt]);

  const confirmRemoveMember = (memberId: string, memberName: string) => {
    if (!userId) return;
    Alert.alert(
      'Remove member',
      `Remove ${memberName} from this community? They will no longer appear in the directory. Other devices learn this on the next sync.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await softRemoveMemberFromCommunity(userId, memberId);
              } catch (e) {
                Alert.alert(
                  'Could not remove',
                  e instanceof Error ? e.message : 'Unknown error'
                );
              }
            })();
          },
        },
      ]
    );
  };

  const allSkills = useMemo(() => {
    const skillSet = new Set<string>();
    members.forEach((member) => {
      member.skills?.forEach((skill) => skillSet.add(skill));
    });
    return Array.from(skillSet).sort();
  }, [members]);

  const handleToggleMember = (memberId: string) => {
    setExpandedMemberId(
      expandedMemberId === memberId ? null : memberId
    );
  };

  const skillCount = allSkills.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          {mode === 'crisis' ? (
            <View style={styles.crisisMeshNote}>
              <Text style={styles.crisisMeshNoteText}>
                In crisis mode this tab is the member roster (safe / help / skills). LoRa mesh
                pairing, snapshot broadcast, and full diagnostics are on the Status tab and under
                Config — not here — so the bottom tab still says People like peacetime.
              </Text>
            </View>
          ) : null}
          {inviteBannerText ? (
            <View style={styles.inviteBanner}>
              <Text style={styles.inviteBannerText}>{inviteBannerText}</Text>
            </View>
          ) : null}
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>Members</Text>
              <Text style={styles.statValue}>{members.length}</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>Safe</Text>
              <Text style={[styles.statValue, { color: '#22c55e' }]}>
                {safeCount}
              </Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>Skills</Text>
              <Text style={[styles.statValue, { color: theme.accent }]}>
                {skillCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Skills Grid */}
        {allSkills.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Community Skills</Text>
            <View style={styles.skillsGrid}>
              {allSkills.map((skill) => {
                const memberCount = members.filter((m) =>
                  m.skills?.includes(skill)
                ).length;
                return (
                  <Pill
                    key={skill}
                    label={`${skill} (${memberCount})`}
                    color={theme.accent}
                    active={false}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* Members List */}
        <View style={styles.membersSection}>
          {members.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={({ item: member }) => (
                <View style={styles.memberRow}>
                  <Pressable onPress={() => handleToggleMember(member.id)}>
                    <MemberCard
                      member={{
                        id: member.id,
                        name: member.name,
                        role: member.role ?? 'member',
                        status: member.status,
                        lastCheckIn: member.lastCheckIn,
                        bio: member.bio,
                        skills: member.skills,
                        resources: member.resources,
                        avatar: member.avatar,
                      }}
                      expanded={expandedMemberId === member.id}
                      accent={theme.accent}
                    />
                  </Pressable>
                  {expandedMemberId === member.id &&
                  isCoordinator &&
                  userId &&
                  member.id !== userId &&
                  member.role !== 'coordinator' ? (
                    <Pressable
                      style={styles.removeMemberBtn}
                      onPress={() =>
                        confirmRemoveMember(member.id, member.name)
                      }
                    >
                      <Text style={styles.removeMemberText}>
                        Remove from community…
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
              contentContainerStyle={styles.membersList}
              ItemSeparatorComponent={() => null}
            />
          ) : (
            <Text style={styles.emptyText}>No members in community yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
