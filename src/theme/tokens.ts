import { Platform } from 'react-native';

export type AppColorScheme = 'light' | 'dark';

const lightColors = {
  background: '#F1F2EE',
  surface: '#E4E7E1',
  surfaceRaised: '#FAFBF7',
  text: '#101415',
  textMuted: '#536063',
  border: '#C7CDC7',
  accent: '#2C7252',
  success: '#256B46',
  warning: '#8A5A00',
  danger: '#A3262E',
} as const;

const darkColors = {
  background: '#0A0C0D',
  surface: '#15191B',
  surfaceRaised: '#1D2326',
  text: '#F2F4F0',
  textMuted: '#9AA4A6',
  border: '#30383B',
  accent: '#8CBF9F',
  success: '#78B892',
  warning: '#E4B95F',
  danger: '#E46B68',
} as const;

export const appThemes = {
  light: {
    colorScheme: 'light',
    colors: lightColors,
  },
  dark: {
    colorScheme: 'dark',
    colors: darkColors,
  },
} as const;

export type AppTheme = (typeof appThemes)[AppColorScheme];

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  display: 64,
} as const;

export const radii = {
  subtle: 2,
  control: 4,
  overlay: 8,
} as const;

export const borderWidths = {
  hairline: 1,
  emphasis: 2,
} as const;

export const touchTargets = {
  ios: 44,
  android: 48,
} as const;

export const layout = {
  maxContentWidth: 720,
} as const;

/** Phase 3A Home-specific atmospheric and semantic surfaces on the dark foundation. */
export const homeVisualTokens = {
  field: '#101416',
  fieldRaised: '#171D20',
  fieldDeep: '#07090A',
  grid: '#242C2F',
  technical: '#9BC7AB',
  technicalMuted: '#60736A',
  calm: '#78B892',
  calmSurface: '#102019',
  attention: '#D4C36A',
  attentionSurface: '#211E10',
  warning: '#E4A857',
  warningSurface: '#241A0E',
  danger: '#F07770',
  dangerSurface: '#291313',
  unavailable: '#A4ADB0',
  unavailableSurface: '#191D1F',
} as const;

export const typography = {
  identity: 'JetBrainsMono',
  identitySemibold: 'JetBrainsMonoSemiBold',
  body:
    Platform.select({
      ios: 'System',
      android: 'sans-serif',
      web: 'system-ui',
      default: 'sans-serif',
    }) ?? 'sans-serif',
} as const;
