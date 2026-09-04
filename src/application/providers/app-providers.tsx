import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { GlobalErrorBoundary } from '@/components/ui/global-error-boundary';
import { AuthProvider } from '@/features/auth/application/auth-provider';
import { LocationCapabilityProvider } from '@/features/locations/application/location-capability-provider';
import { NotificationProvider } from '@/features/notifications/application/notification-provider';
import { appQueryClient } from '@/services/query/query-client';
import { AppThemeProvider } from '@/theme/app-theme-provider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GlobalErrorBoundary>
        <QueryClientProvider client={appQueryClient}>
          <AppThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <LocationCapabilityProvider>{children}</LocationCapabilityProvider>
              </NotificationProvider>
            </AuthProvider>
          </AppThemeProvider>
        </QueryClientProvider>
      </GlobalErrorBoundary>
    </SafeAreaProvider>
  );
}
