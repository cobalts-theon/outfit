import { createContext, type PropsWithChildren, use } from 'react';
import { useColorScheme } from 'react-native';

import { appThemes, type AppColorScheme, type AppTheme } from '@/theme/tokens';

interface AppThemeContextValue {
  colorScheme: AppColorScheme;
  theme: AppTheme;
}

const contextValues: Record<AppColorScheme, AppThemeContextValue> = {
  light: { colorScheme: 'light', theme: appThemes.light },
  dark: { colorScheme: 'dark', theme: appThemes.dark },
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const detectedScheme = useColorScheme();
  const colorScheme: AppColorScheme = detectedScheme === 'light' ? 'light' : 'dark';

  return (
    <AppThemeContext.Provider value={contextValues[colorScheme]}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const value = use(AppThemeContext);

  if (value === null) {
    throw new Error('useAppTheme must be used inside AppThemeProvider.');
  }

  return value;
}
