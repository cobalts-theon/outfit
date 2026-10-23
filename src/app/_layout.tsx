import type { ErrorBoundaryProps } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppBootstrap, AppProviders, RootNavigator } from '@/context/app';
import { AppErrorFallback } from '@/components/app-shell';

// _layout

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <AppErrorFallback error={error} onRetry={retry} />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const { isReady } = useAppBootstrap();

  if (!isReady) {
    return null;
  }

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
