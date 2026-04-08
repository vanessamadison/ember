import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrillCard } from '../../src/components';
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
  progressSection: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    marginBottom: 8,
  },
  progressBarContainer: {
    backgroundColor: '#0f0f0f',
    borderRadius: 4,
    height: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#808080',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#a3a3a3',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  drillsList: {
    gap: 12,
  },
  drillItem: {
    marginBottom: 0,
  },
  emptyText: {
    fontSize: 13,
    color: '#808080',
    textAlign: 'center',
    paddingVertical: 32,
  },
});

export default function DrillsScreen() {
  const { mode } = useApp();
  const { drills, drillAverage, totalXP, completeDrill } = useCommunity();
  const theme = getTheme(mode);

  const completedCount = useMemo(() => {
    return drills.filter((d) => d.completedAt.length > 0).length;
  }, [drills]);

  const progress =
    drills.length > 0 ? Math.round((completedCount / drills.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Drills & Training</Text>
        </View>

        {/* Progress Section */}
        {drills.length > 0 && (
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Progress</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: theme.accent,
                  },
                ]}
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {completedCount} of {drills.length} completed
              </Text>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Avg Score</Text>
                <Text style={styles.statValue}>{drillAverage || 0}%</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total XP</Text>
                <Text style={[styles.statValue, { color: theme.accent }]}>
                  {totalXP}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Drills List */}
        {drills.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={drills}
            keyExtractor={(item) => item.id}
            renderItem={({ item: drill }) => (
              <View style={styles.drillItem}>
                <DrillCard
                  drill={{
                    id: drill.id,
                    name: drill.name,
                    description: drill.description,
                    difficulty: drill.difficulty,
                    timeMinutes: drill.durationMinutes,
                    xpReward: drill.xpReward,
                    completed: drill.completedAt.length > 0,
                    score: drill.score,
                  }}
                  accent={theme.accent}
                  onStart={completeDrill}
                />
              </View>
            )}
            contentContainerStyle={styles.drillsList}
            ItemSeparatorComponent={() => null}
          />
        ) : (
          <Text style={styles.emptyText}>No drills available</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
