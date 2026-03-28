import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

interface ResourceBarProps {
  name: string;
  quantity: number;
  max: number;
  criticalThreshold: number;
  accent: string;
  icon?: React.ReactNode;
  onPress?: () => void;
}

const ResourceBar: React.FC<ResourceBarProps> = ({
  name,
  quantity,
  max,
  criticalThreshold,
  accent,
  icon,
  onPress,
}) => {
  const percentage = Math.min((quantity / max) * 100, 100);
  const isCritical = quantity <= criticalThreshold;

  const getBarColor = () => {
    if (isCritical) {
      return {
        start: '#FBBF24',
        end: '#EF4444',
      };
    }
    return {
      start: accent,
      end: accent,
    };
  };

  const barColor = getBarColor();
  const barHeight = 8;
  const barWidth = 200;

  return (
    <Pressable
      style={[styles.container, onPress && styles.pressable]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.labelRow}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={styles.name}>{name}</Text>
        </View>
        <Text style={[styles.quantity, isCritical && styles.quantityCritical]}>
          {quantity}/{max}
        </Text>
      </View>

      <View style={styles.barContainer}>
        <Svg
          width={barWidth}
          height={barHeight}
          viewBox={`0 0 ${barWidth} ${barHeight}`}
          style={styles.barSvg}
        >
          <Defs>
            <LinearGradient
              id="resourceGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <Stop offset="0%" stopColor={barColor.start} stopOpacity="1" />
              <Stop offset="100%" stopColor={barColor.end} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Background */}
          <Rect
            x="0"
            y="0"
            width={barWidth}
            height={barHeight}
            rx="4"
            fill="rgba(255, 255, 255, 0.08)"
          />

          {/* Progress fill */}
          <Rect
            x="0"
            y="0"
            width={(percentage / 100) * barWidth}
            height={barHeight}
            rx="4"
            fill="url(#resourceGradient)"
          />
        </Svg>
      </View>

      {isCritical && (
        <Text style={styles.warning}>Low stock - critical threshold reached</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  pressable: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'DM Sans',
  },
  quantity: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'JetBrains Mono',
  },
  quantityCritical: {
    color: '#EF4444',
    fontWeight: '600',
  },
  barContainer: {
    width: 200,
  },
  barSvg: {
    width: '100%',
    height: 'auto',
  },
  warning: {
    fontSize: 11,
    color: '#FBBF24',
    fontFamily: 'DM Sans',
    marginTop: 4,
  },
});

export default ResourceBar;
