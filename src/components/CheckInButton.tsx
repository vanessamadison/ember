import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface CheckInButtonProps {
  onCheckIn: () => void;
  streak?: number;
  isPulsing?: boolean;
  accent: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CheckInButton: React.FC<CheckInButtonProps> = ({
  onCheckIn,
  streak = 0,
  isPulsing = false,
  accent,
}) => {
  const pulseScale = useSharedValue(1);
  const pressScale = useSharedValue(1);
  const bgOpacity = useSharedValue(1);

  /* eslint-disable react-hooks/exhaustive-deps -- Reanimated shared values are stable refs; do not list as deps (see react-hooks/immutability with pressScale). */
  useEffect(() => {
    if (isPulsing) {
      pulseScale.value = withRepeat(
        withTiming(1.05, {
          duration: 1000,
          easing: Easing.bezier(0.33, 0.66, 0.66, 1),
        }),
        -1,
        true
      );

      bgOpacity.value = withRepeat(
        withTiming(0.7, {
          duration: 1000,
          easing: Easing.bezier(0.33, 0.66, 0.66, 1),
        }),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
      bgOpacity.value = 1;
    }
  }, [isPulsing]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value * pressScale.value }],
    };
  });

  const handlePress = () => {
    pressScale.value = withTiming(0.95, { duration: 100 }, () => {
      pressScale.value = withTiming(1.1, { duration: 200 }, () => {
        runOnJS(onCheckIn)();
      });
    });
  };

  return (
    <View style={styles.container}>
      <AnimatedPressable
        style={[
          styles.button,
          animatedStyle,
          { backgroundColor: accent },
        ]}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>Check In Now</Text>
      </AnimatedPressable>

      {streak > 0 && (
        <View style={styles.streakContainer}>
          <Text style={styles.streakLabel}>Streak</Text>
          <Text style={[styles.streakValue, { color: accent }]}>
            {streak}
          </Text>
          <Text style={styles.streakDays}>day{streak !== 1 ? 's' : ''}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.8)',
    fontFamily: 'DM Sans',
    letterSpacing: 0.5,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'DM Sans',
    fontWeight: '500',
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'JetBrains Mono',
  },
  streakDays: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'DM Sans',
  },
});

export default CheckInButton;
