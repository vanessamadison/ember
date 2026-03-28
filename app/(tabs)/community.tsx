import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MemberCard, Pill } from '../../src/components';
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
});

export default function CommunityScreen() {
  const { mode } = useApp();
  const { members, resources, safeCount } = useCommunity();
  const theme = getTheme(mode);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

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
                <Pressable onPress={() => handleToggleMember(member.id)}>
                  <MemberCard
                    member={member}
                    isExpanded={expandedMemberId === member.id}
                    theme={theme}
                  />
                </Pressable>
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
