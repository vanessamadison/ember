import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ReadinessRingProps {
  value: number;
  size?: number;
  color: string;
  label: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ReadinessRing: React.FC<ReadinessRingProps> = ({
  value,
  size = 62,
  color,
  label,
}) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration: 1200,
      easing: Easing.bezier(0.33, 0.66, 0.66, 1),
    });
  }, [value, animatedValue]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (animatedValue.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  const center = size / 2;

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient
              id="ringGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={color} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            animatedProps={animatedProps}
            rotation={-90}
            originX={center}
            originY={center}
          />
        </Svg>

        {/* Center text */}
        <View style={styles.centerContent}>
          <Text style={[styles.value, { color }]}>
            {Math.round(value)}
          </Text>
        </View>
      </View>

      {/* Label below */}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  ringContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'JetBrains Mono',
  },
  label: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'DM Sans',
    letterSpacing: 0.5,
  },
});

export default ReadinessRing;
