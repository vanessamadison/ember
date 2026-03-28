import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SectionHeaderProps {
  children: string;
  accent: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  children,
  accent,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={styles.text}>{children.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'DM Sans',
    letterSpacing: 1,
  },
});

export default SectionHeader;
