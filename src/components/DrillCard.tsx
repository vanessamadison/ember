import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Drill {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'med';
  timeMinutes: number;
  xpReward: number;
  completed?: boolean;
  score?: number;
  icon?: React.ReactNode;
}

interface DrillCardProps {
  drill: Drill;
  accent: string;
  onStart?: (drillId: string) => void;
}

const DrillCard: React.FC<DrillCardProps> = ({
  drill,
  accent,
  onStart,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#22C55E';
      case 'medium':
      case 'med':
        return '#FBBF24';
      case 'hard':
        return '#EF4444';
      default:
        return accent;
    }
  };

  const difficultyColor = getDifficultyColor(drill.difficulty);

  return (
    <View style={[styles.container, drill.completed && styles.containerCompleted]}>
      {drill.completed && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>DONE</Text>
        </View>
      )}

      <View style={styles.header}>
        {drill.icon && (
          <View style={styles.icon}>{drill.icon}</View>
        )}
        <View style={styles.titleSection}>
          <Text style={styles.name}>{drill.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {drill.description}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        {/* Difficulty pill */}
        <View style={[styles.pill, { backgroundColor: `${difficultyColor}20` }]}>
          <View
            style={[styles.pillDot, { backgroundColor: difficultyColor }]}
          />
          <Text style={[styles.pillText, { color: difficultyColor }]}>
            {drill.difficulty}
          </Text>
        </View>

        {/* Time pill */}
        <View style={[styles.pill, { backgroundColor: `${accent}20` }]}>
          <Text style={[styles.pillText, { color: accent }]}>
            {drill.timeMinutes}m
          </Text>
        </View>

        {/* XP reward */}
        <View style={[styles.pill, { backgroundColor: `${accent}20` }]}>
          <Text style={[styles.pillText, { color: accent }]}>
            +{drill.xpReward} XP
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {drill.completed && drill.score !== undefined ? (
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{drill.score}</Text>
            <Text style={styles.scoreLabel}>pts</Text>
          </View>
        ) : null}

        {!drill.completed && (
          <Pressable
            style={[styles.startButton, { backgroundColor: accent }]}
            onPress={() => onStart?.(drill.id)}
          >
            <Text style={styles.startButtonText}>Start Drill</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginVertical: 8,
    gap: 12,
  },
  containerCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.8)',
    fontFamily: 'DM Sans',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 80,
  },
  icon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
  },
  titleSection: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'DM Sans',
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'DM Sans',
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'DM Sans',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22C55E',
    fontFamily: 'JetBrains Mono',
  },
  scoreLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'DM Sans',
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.8)',
    fontFamily: 'DM Sans',
  },
});

export default DrillCard;
