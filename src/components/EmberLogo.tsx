import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Path, Circle } from 'react-native-svg';

interface EmberLogoProps {
  size?: number;
  glow?: boolean;
  mode?: 'peace' | 'crisis' | 'recovery';
}

const EmberLogo: React.FC<EmberLogoProps> = ({
  size = 56,
  glow = false,
  mode = 'peace'
}) => {
  const getModeColors = () => {
    switch (mode) {
      case 'crisis':
        return {
          primary: '#EF4444',
          secondary: '#DC2626',
          glow: 'rgba(239, 68, 68, 0.3)',
        };
      case 'recovery':
        return {
          primary: '#22C55E',
          secondary: '#16A34A',
          glow: 'rgba(34, 197, 94, 0.3)',
        };
      case 'peace':
      default:
        return {
          primary: '#FBBF24',
          secondary: '#F59E0B',
          glow: 'rgba(251, 191, 36, 0.3)',
        };
    }
  };

  const colors = getModeColors();
  const padding = glow ? size * 0.3 : 0;
  const viewSize = size + padding * 2;

  return (
    <View style={{ width: viewSize, height: viewSize, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={viewSize} height={viewSize} viewBox={`0 0 ${viewSize} ${viewSize}`}>
        <Defs>
          <RadialGradient
            id="flameGradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="30%"
          >
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0.8" />
          </RadialGradient>

          {glow && (
            <RadialGradient
              id="glowGradient"
              cx="50%"
              cy="50%"
              r="60%"
            >
              <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
            </RadialGradient>
          )}
        </Defs>

        {glow && (
          <Circle
            cx={viewSize / 2}
            cy={viewSize / 2}
            r={size * 0.6}
            fill="url(#glowGradient)"
          />
        )}

        {/* Main flame shape */}
        <Path
          d={`M ${viewSize / 2} ${padding + size * 0.15}
             C ${viewSize / 2 - size * 0.25} ${padding + size * 0.35}
               ${viewSize / 2 - size * 0.3} ${padding + size * 0.6}
               ${viewSize / 2 - size * 0.15} ${padding + size * 0.8}
             C ${viewSize / 2} ${padding + size * 0.95}
               ${viewSize / 2 + size * 0.15} ${padding + size * 0.8}
               ${viewSize / 2 + size * 0.3} ${padding + size * 0.6}
             C ${viewSize / 2 + size * 0.25} ${padding + size * 0.35}
               ${viewSize / 2} ${padding + size * 0.15}
               ${viewSize / 2} ${padding + size * 0.15} Z`}
          fill="url(#flameGradient)"
        />

        {/* Inner highlight for depth */}
        <Path
          d={`M ${viewSize / 2 - size * 0.08} ${padding + size * 0.25}
             C ${viewSize / 2 - size * 0.12} ${padding + size * 0.45}
               ${viewSize / 2 - size * 0.1} ${padding + size * 0.65}
               ${viewSize / 2} ${padding + size * 0.75}
             C ${viewSize / 2 + size * 0.1} ${padding + size * 0.65}
               ${viewSize / 2 + size * 0.12} ${padding + size * 0.45}
               ${viewSize / 2 + size * 0.08} ${padding + size * 0.25}`}
          fill="none"
          stroke={colors.primary}
          strokeWidth={size * 0.04}
          strokeOpacity="0.5"
        />
      </Svg>
    </View>
  );
};

export default EmberLogo;
