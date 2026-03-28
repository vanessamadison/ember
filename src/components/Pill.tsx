import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface PillProps {
  label: string;
  active: boolean;
  color: string;
  onPress?: () => void;
}

const Pill: React.FC<PillProps> = ({
  label,
  active,
  color,
  onPress,
}) => {
  return (
    <Pressable
      style={[
        styles.container,
        active
          ? [styles.containerActive, { backgroundColor: `${color}25` }]
          : styles.containerInactive,
        { borderColor: active ? color : 'rgba(255, 255, 255, 0.2)' },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          {
            color: active ? color : 'rgba(255, 255, 255, 0.6)',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerActive: {
    borderColor: 'currentColor',
  },
  containerInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DM Sans',
    textTransform: 'capitalize',
  },
});

export default Pill;
