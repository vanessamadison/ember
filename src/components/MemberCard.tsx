import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Member {
  id: string;
  name: string;
  role: string;
  status: 'safe' | 'help' | 'unknown';
  lastCheckIn: number; // timestamp
  bio?: string;
  skills?: string[];
  resources?: string[];
  avatar?: string;
}

interface MemberCardProps {
  member: Member;
  accent: string;
  expanded?: boolean;
  onPress?: () => void;
  onCheckIn?: (memberId: string, status: 'safe' | 'help') => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  accent,
  expanded = false,
  onPress,
  onCheckIn,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return '#22C55E';
      case 'help':
        return '#EF4444';
      default:
        return 'rgba(255, 255, 255, 0.3)';
    }
  };

  const getTimeSinceCheckIn = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return 'Never';
  };

  const statusColor = getStatusColor(member.status);

  return (
    <Pressable
      style={[styles.container, expanded && styles.containerExpanded]}
      onPress={onPress}
    >
      {/* Header with avatar and basic info */}
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: statusColor, borderColor: accent },
            ]}
          >
            <Text style={styles.avatarText}>
              {member.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.nameSection}>
            <Text style={styles.name}>{member.name}</Text>
            <Text style={styles.role}>{member.role}</Text>
            <Text style={styles.lastCheckIn}>
              Checked in {getTimeSinceCheckIn(member.lastCheckIn)}
            </Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View
            style={[styles.statusDot, { backgroundColor: statusColor }]}
          />
          <Text style={styles.statusText}>
            {member.status === 'unknown' ? 'Unknown' : member.status}
          </Text>
        </View>
      </View>

      {/* Expanded content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {member.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Bio</Text>
              <Text style={styles.bio}>{member.bio}</Text>
            </View>
          )}

          {member.skills && member.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Skills</Text>
              <View style={styles.tagRow}>
                {member.skills.map((skill, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {member.resources && member.resources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Resources</Text>
              <View style={styles.tagRow}>
                {member.resources.map((resource, idx) => (
                  <View key={idx} style={[styles.tag, styles.resourceTag]}>
                    <Text style={styles.tagText}>{resource}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Member ID</Text>
            <Text style={styles.memberId}>{member.id}</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, styles.safeButton]}
              onPress={() => onCheckIn?.(member.id, 'safe')}
            >
              <Text style={styles.actionButtonText}>Safe</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.helpButton]}
              onPress={() => onCheckIn?.(member.id, 'help')}
            >
              <Text style={styles.actionButtonText}>Help</Text>
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
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.8)',
    fontFamily: 'DM Sans',
  },
  nameSection: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'DM Sans',
  },
  role: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'DM Sans',
  },
  lastCheckIn: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'JetBrains Mono',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'DM Sans',
    textTransform: 'capitalize',
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
  bio: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'DM Sans',
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  resourceTag: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  tagText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'DM Sans',
  },
  memberId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'JetBrains Mono',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  safeButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  helpButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'DM Sans',
  },
});

export default MemberCard;
