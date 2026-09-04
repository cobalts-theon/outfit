export type AppColorScheme = 'light';

const lightColors = {
  background: '#FFFDF5',
  surface: '#FFFFFF',
  surfaceRaised: '#FFF4C7',
  text: '#101010',
  textMuted: '#424242',
  border: '#101010',
  accent: '#1769FF',
  success: '#137A4B',
  warning: '#9A5100',
  danger: '#C62222',
} as const;

export const appThemes = {
  light: {
    colorScheme: 'light',
    colors: lightColors,
  },
} as const;

export type AppTheme = (typeof appThemes)['light'];

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
  subtle: 0,
  control: 0,
  overlay: 0,
} as const;

export const borderWidths = {
  hairline: 1,
  emphasis: 3,
  heavy: 4,
} as const;

export const neoShadows = {
  control: '4px 4px 0px #101010',
  controlPressed: '1px 1px 0px #101010',
  panel: '6px 6px 0px #101010',
} as const;

export const touchTargets = {
  ios: 44,
  android: 48,
} as const;

export const layout = {
  maxContentWidth: 720,
} as const;

/** Light-only Weather Public Bulletin surfaces and semantic signals. */
export const homeVisualTokens = {
  ink: '#101010',
  paper: '#FFFDF5',
  field: '#FFFFFF',
  paleBlueField: '#D6E5FF',
  fieldRaised: '#FFF0A3',
  fieldDeep: '#C7F6D8',
  grid: '#10101024',
  technical: '#1769FF',
  technicalMuted: '#234F8F',
  calm: '#137A4B',
  calmSurface: '#C7F6D8',
  attention: '#F5C400',
  attentionSurface: '#FFF0A3',
  warning: '#E86D00',
  warningSurface: '#FFD1A8',
  danger: '#D92D27',
  dangerSurface: '#FFC5BC',
  unavailable: '#626262',
  unavailableSurface: '#E6E6DF',
  cobalt: '#1769FF',
  sunflower: '#FFD21C',
  coral: '#FF6B5A',
  mint: '#BDF4CF',
} as const;

export const typography = {
  brand: 'SyneExtraBold',
  brandRegular: 'Syne',
  display: 'ArchivoBlack',
  temperature: 'BebasNeue',
  heading: 'ArchivoBlack',
  headingSemibold: 'JetBrainsMonoBold',
  identity: 'JetBrainsMono',
  identitySemibold: 'JetBrainsMonoBold',
  body: 'JetBrainsMono',
} as const;
