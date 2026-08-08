import type { ErrorBoundaryProps } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppBootstrap } from '@/application/bootstrap/use-app-bootstrap';
import { AppProviders } from '@/application/providers/app-providers';
import { AppErrorFallback } from '@/components/ui/app-error-fallback';
import { RootNavigator } from '@/navigation/root-navigator';

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
