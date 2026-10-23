// tokens

export const appPalette = {
  red: '#E63946',
  cream: '#F1FAEE',
  yellow: '#F1C40F',
  mist: '#D8E2DC',
  cyan: '#A8DADC',
  blue: '#457B9D',
  navy: '#1D3557',
  gold: '#F9C74F',
  orange: '#F3722C',
  teal: '#2A9D8F',
} as const;

// Deeper navy keeps small text legible even on the palette's red/teal fills.
const readableInk = '#07111E';

export type AppColorScheme = 'light';

const lightColors = {
  background: appPalette.cream,
  surface: appPalette.cream,
  surfaceRaised: appPalette.gold,
  text: readableInk,
  textMuted: readableInk,
  border: appPalette.navy,
  accent: appPalette.blue,
  primary: appPalette.red,
  onPrimary: readableInk,
  secondary: appPalette.cyan,
  onSecondary: readableInk,
  success: appPalette.teal,
  warning: appPalette.orange,
  danger: appPalette.red,
} as const;

export const appThemes = { light: { colorScheme: 'light', colors: lightColors } } as const;

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

export const radii = { subtle: 12, control: 12, overlay: 12 } as const;

export const borderWidths = { hairline: 1, emphasis: 3, heavy: 4 } as const;

export const neoShadows = {
  control: '4px 4px 0px #1D3557',
  controlPressed: '1px 1px 0px #1D3557',
  panel: '6px 6px 0px #1D3557',
} as const;

export const touchTargets = { ios: 44, android: 48 } as const;

export const layout = { maxContentWidth: 720 } as const;

/** Light-only Weather Public Bulletin surfaces and semantic signals. */
export const homeVisualTokens = {
  ink: readableInk,
  paper: appPalette.cream,
  field: appPalette.cream,
  paleBlueField: appPalette.cyan,
  fieldRaised: appPalette.gold,
  fieldDeep: appPalette.mist,
  grid: appPalette.mist,
  technical: appPalette.blue,
  technicalMuted: appPalette.navy,
  calm: appPalette.teal,
  calmSurface: appPalette.teal,
  attention: appPalette.yellow,
  attentionSurface: appPalette.gold,
  warning: appPalette.orange,
  warningSurface: appPalette.gold,
  danger: appPalette.red,
  dangerSurface: appPalette.red,
  unavailable: appPalette.blue,
  unavailableSurface: appPalette.mist,
  infoSurface: appPalette.cyan,
  selectionSurface: appPalette.yellow,
  cobalt: appPalette.blue,
  sunflower: appPalette.gold,
  coral: appPalette.red,
  mint: appPalette.teal,
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
