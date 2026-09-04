import { createContext, type PropsWithChildren, use } from 'react';

import { appThemes, type AppTheme } from '@/theme/tokens';

interface AppThemeContextValue {
  colorScheme: 'light';
  theme: AppTheme;
}

const lightThemeContext: AppThemeContextValue = {
  colorScheme: 'light',
  theme: appThemes.light,
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  return (
    <AppThemeContext.Provider value={lightThemeContext}>{children}</AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const value = use(AppThemeContext);

  if (value === null) {
    throw new Error('useAppTheme must be used inside AppThemeProvider.');
  }

  return value;
}
