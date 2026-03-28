import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Plan {
  id: string;
  name: string;
  type: 'evacuation' | 'shelter' | 'communication' | 'resource' | 'medical';
  size: string;
  status: 'current' | 'needs_review' | 'archived';
  description?: string;
}

interface PlanCardProps {
  plan: Plan;
  accent: string;
  expanded?: boolean;
  onPress?: () => void;
  onView?: (planId: string) => void;
  onEdit?: (planId: string) => void;
  onShare?: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  accent,
  expanded = false,
  onPress,
  onView,
  onEdit,
  onShare,
}) => {
  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case 'evacuation':
        return '#EF4444';
      case 'shelter':
        return '#3B82F6';
      case 'communication':
        return '#8B5CF6';
      case 'resource':
        return '#FBBF24';
      case 'medical':
        return '#10B981';
      default:
        return accent;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return '#22C55E';
      case 'needs_review':
        return '#FBBF24';
      case 'archived':
        return 'rgba(255, 255, 255, 0.3)';
      default:
        return accent;
    }
  };

  const typeColor = getPlanTypeColor(plan.type);
  const statusColor = getStatusColor(plan.status);

  return (
    <Pressable
      style={[styles.container, expanded && styles.containerExpanded]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.name}>{plan.name}</Text>

          <View style={styles.pills}>
            {/* Type pill */}
            <View style={[styles.pill, { backgroundColor: `${typeColor}20` }]}>
              <View style={[styles.pillDot, { backgroundColor: typeColor }]} />
              <Text style={[styles.pillText, { color: typeColor }]}>
                {plan.type}
              </Text>
            </View>

            {/* Size pill */}
            <View style={[styles.pill, { backgroundColor: `${accent}20` }]}>
              <Text style={[styles.pillText, { color: accent }]}>
                {plan.size}
              </Text>
            </View>
          </View>
        </View>

        {/* Status badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${statusColor}25` },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {plan.status === 'current'
              ? 'Current'
              : plan.status === 'needs_review'
              ? 'Review'
              : 'Archived'}
          </Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.expandedContent}>
          {plan.description && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.description}>{plan.description}</Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => onView?.(plan.id)}
            >
              <Text style={styles.actionButtonText}>View</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => onEdit?.(plan.id)}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => onShare?.(plan.id)}
            >
              <Text style={styles.actionButtonText}>Share Mesh</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
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
  },
  containerExpanded: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleSection: {
    flex: 1,
    gap: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'DM Sans',
  },
  pills: {
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
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'DM Sans',
  },
  expandedContent: {
    marginTop: 16,
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'DM Sans',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'DM Sans',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'DM Sans',
  },
});

export default PlanCard;
