export type AppMode = 'peace' | 'crisis' | 'recovery';

export interface ColorSet {
  accent: string;
  accentBg: string;
  accentBorder: string;
  background: {
    start: string;
    end: string;
  };
  surface: string;
  surfaceBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
  safe: string;
  help: string;
  unknown: string;
}

export interface TypographyStyle {
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700;
  lineHeight: number;
  letterSpacing?: number;
}

export interface Typography {
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  body: TypographyStyle;
  caption: TypographyStyle;
  micro: TypographyStyle;
  mono: TypographyStyle;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface BorderRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Theme {
  colors: ColorSet;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  /** Convenience alias for `colors.accent` (common in UI code). */
  accent: string;
}

// Peace mode theme
const peaceModeColors: ColorSet = {
  accent: '#d4a574',
  accentBg: '#f5ede3',
  accentBorder: '#e8d5c4',
  background: {
    start: '#2a2620',
    end: '#3d3530',
  },
  surface: '#36302b',
  surfaceBorder: '#4a4540',
  text: '#f5f5f5',
  textSecondary: '#d4d4d8',
  textMuted: '#a1a1a6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  safe: '#22c55e',
  help: '#f59e0b',
  unknown: '#a1a1a6',
};

// Crisis mode theme
const crisisModeColors: ColorSet = {
  accent: '#ef4444',
  accentBg: '#fef2f2',
  accentBorder: '#fee2e2',
  background: {
    start: '#3d1a1a',
    end: '#4a2525',
  },
  surface: '#441d1d',
  surfaceBorder: '#5a3333',
  text: '#f5f5f5',
  textSecondary: '#fecaca',
  textMuted: '#fca5a5',
  success: '#22c55e',
  warning: '#fbbf24',
  danger: '#dc2626',
  safe: '#22c55e',
  help: '#fbbf24',
  unknown: '#f87171',
};

// Recovery mode theme
const recoveryModeColors: ColorSet = {
  accent: '#22c55e',
  accentBg: '#f0fdf4',
  accentBorder: '#dbeafe',
  background: {
    start: '#1b352a',
    end: '#244035',
  },
  surface: '#1f3a2f',
  surfaceBorder: '#2d5245',
  text: '#f5f5f5',
  textSecondary: '#bbf7d0',
  textMuted: '#86efac',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  safe: '#10b981',
  help: '#eab308',
  unknown: '#6ee7b7',
};

const typography: Typography = {
  h1: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 18,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 10,
    fontWeight: 400,
    lineHeight: 14,
    letterSpacing: 0,
  },
  micro: {
    fontSize: 8,
    fontWeight: 500,
    lineHeight: 10,
    letterSpacing: 0.5,
  },
  mono: {
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 16,
    letterSpacing: 0,
  },
};

const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

const borderRadius: BorderRadius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
};

export function getTheme(mode: AppMode): Theme {
  let colors: ColorSet;

  switch (mode) {
    case 'crisis':
      colors = crisisModeColors;
      break;
    case 'recovery':
      colors = recoveryModeColors;
      break;
    case 'peace':
    default:
      colors = peaceModeColors;
      break;
  }

  return {
    colors,
    typography,
    spacing,
    borderRadius,
    accent: colors.accent,
  };
}

export const TYPOGRAPHY = typography;
export const SPACING = spacing;
export const BORDER_RADIUS = borderRadius;
