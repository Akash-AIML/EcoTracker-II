// Global Design System Tokens mapping exactly to Tailwind Config in designs

export const COLORS = {
  background: '#0b1326',
  surface: '#0b1326',
  surfaceDim: '#0b1326',
  surfaceContainerLowest: '#060e20',
  surfaceContainerLow: '#131b2e',
  surfaceContainer: '#171f33',
  surfaceContainerHigh: '#222a3d',
  surfaceContainerHighest: '#2d3449',
  surfaceBright: '#31394d',
  surfaceVariant: '#2d3449',

  primary: '#4edea3',
  primaryFixed: '#6ffbbe',
  primaryFixedDim: '#4edea3',
  primaryContainer: '#10b981',
  onPrimary: '#003824',
  onPrimaryContainer: '#00422b',

  secondary: '#89ceff',
  secondaryFixed: '#c9e6ff',
  secondaryFixedDim: '#89ceff',
  secondaryContainer: '#00a2e6',
  onSecondary: '#00344d',
  onSecondaryContainer: '#00344e',

  tertiary: '#ffb95f',
  tertiaryFixed: '#ffddb8',
  tertiaryFixedDim: '#ffb95f',
  tertiaryContainer: '#e29100',
  onTertiary: '#472a00',
  onTertiaryContainer: '#523200',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  onBackground: '#dae2fd',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#bbcabf',
  outline: '#86948a',
  outlineVariant: '#3c4a42',

  // Custom visual elements
  glassBg: 'rgba(30, 41, 59, 0.5)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassInnerGlow: 'rgba(255, 255, 255, 0.05)',
  emeraldGlow: 'rgba(78, 222, 163, 0.3)',
};

export const SPACING = {
  unit: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64,
  margin: 32,
  gutter: 24,
};

export const TYPOGRAPHY = {
  fontFamily: 'System', // Fallback to System font on RN, can load Geist on web
  sizes: {
    displayLg: {
      fontSize: 48,
      lineHeight: 52,
      letterSpacing: -0.96,
      fontWeight: '700',
    },
    displayLgMobile: {
      fontSize: 32,
      lineHeight: 38,
      letterSpacing: -0.64,
      fontWeight: '700',
    },
    headlineMd: {
      fontSize: 24,
      lineHeight: 31,
      fontWeight: '600',
    },
    titleSm: {
      fontSize: 18,
      lineHeight: 25,
      fontWeight: '600',
    },
    bodyMd: {
      fontSize: 16,
      lineHeight: 26,
      fontWeight: '400',
    },
    labelMd: {
      fontSize: 14,
      lineHeight: 17,
      letterSpacing: 0.14,
      fontWeight: '500',
    },
    caption: {
      fontSize: 12,
      lineHeight: 14,
      fontWeight: '400',
    },
  },
};
