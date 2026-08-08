import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { appThemes } from '@/theme/tokens';
import { useAppTheme } from '@/theme/app-theme-provider';

const navigationThemes = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: appThemes.light.colors.accent,
      background: appThemes.light.colors.background,
      card: appThemes.light.colors.surface,
      text: appThemes.light.colors.text,
      border: appThemes.light.colors.border,
      notification: appThemes.light.colors.warning,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: appThemes.dark.colors.accent,
      background: appThemes.dark.colors.background,
      card: appThemes.dark.colors.surface,
      text: appThemes.dark.colors.text,
      border: appThemes.dark.colors.border,
      notification: appThemes.dark.colors.warning,
    },
  },
} as const;

export function RootNavigator() {
  const { colorScheme, theme } = useAppTheme();

  return (
    <ThemeProvider value={navigationThemes[colorScheme]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </ThemeProvider>
  );
}
