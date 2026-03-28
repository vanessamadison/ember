import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  type?: 'system' | 'resource' | 'broadcast' | 'social';
}

interface MessageBubbleProps {
  message: Message;
  accent: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  accent,
}) => {
  const getTypeColor = (type: string | undefined) => {
    switch (type) {
      case 'system':
        return '#3B82F6';
      case 'resource':
        return '#FBBF24';
      case 'broadcast':
        return '#EF4444';
      case 'social':
        return '#8B5CF6';
      default:
        return accent;
    }
  };

  const getFormattedTime = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const typeColor = getTypeColor(message.type);
  const formattedTime = getFormattedTime(message.timestamp);

  return (
    <View style={styles.container}>
      {/* Type indicator dot */}
      <View style={[styles.typeDot, { backgroundColor: typeColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.sender}>{message.sender}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
        <Text style={styles.text}>{message.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 6,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  sender: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'DM Sans',
    flex: 1,
  },
  time: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: 'JetBrains Mono',
    flexShrink: 0,
  },
  text: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: 'DM Sans',
    lineHeight: 18,
  },
});

export default MessageBubble;
