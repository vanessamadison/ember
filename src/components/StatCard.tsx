import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  color,
  subtitle,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: `${color}15` }]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={[styles.value, { color }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'DM Sans',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'JetBrains Mono',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'DM Sans',
  },
});

export default StatCard;
