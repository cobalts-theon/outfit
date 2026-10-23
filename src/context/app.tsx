import NetInfo from '@react-native-community/netinfo';
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { AppState, Platform, ActivityIndicator, StatusBar, Text, View } from 'react-native';
import { createContext, type PropsWithChildren, use, useEffect } from 'react';
import { appThemes, type AppTheme, typography } from '@/theme';
import { useAuth, AuthProvider } from '@/context/auth';
import { NeoBackButton, useReducedMotion } from '@/components/controls';
import { DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import {
  addNotificationResponseReceivedListener,
  clearLastNotificationResponse,
  getLastNotificationResponse,
} from 'expo-notifications/build/NotificationsEmitter';
import type { NotificationResponse } from 'expo-notifications/build/Notifications.types';
import { Archivo_900Black } from '@expo-google-fonts/archivo/900Black';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue/400Regular';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';
import { Syne_400Regular } from '@expo-google-fonts/syne/400Regular';
import { Syne_800ExtraBold } from '@expo-google-fonts/syne/800ExtraBold';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { PlanMonitor } from '@/hooks/plans';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { GlobalErrorBoundary } from '@/components/app-shell';
import { LocationCapabilityProvider } from '@/context/location';
import { NotificationProvider } from '@/context/notifications';

// query-client

let isConfigured = false;

export function configureQueryRuntime() {
  if (isConfigured) {
    return;
  }

  isConfigured = true;

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(state.isConnected === true && state.isInternetReachable !== false);
    }),
  );

  if (Platform.OS !== 'web') {
    focusManager.setEventListener((setFocused) => {
      const subscription = AppState.addEventListener('change', (status) => {
        setFocused(status === 'active');
      });

      return () => subscription.remove();
    });
  }
}

configureQueryRuntime();

export const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: 0 },
  },
});

// app-theme-provider

interface AppThemeContextValue {
  colorScheme: 'light';
  theme: AppTheme;
}

const lightThemeContext: AppThemeContextValue = { colorScheme: 'light', theme: appThemes.light };

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  return <AppThemeContext.Provider value={lightThemeContext}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const value = use(AppThemeContext);

  if (value === null) {
    throw new Error('useAppTheme must be used inside AppThemeProvider.');
  }

  return value;
}

// root-navigator

const navigationTheme = {
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
} as const;

export function RootNavigator() {
  const { state } = useAuth();
  const signedIn = state.status === 'signed_in';
  const reducedMotion = useReducedMotion();
  const { theme } = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const openNotificationDestination = (response: NotificationResponse) => {
      const type = response.notification.request.content.data?.type;
      if (
        type !== 'weather_recommendation' &&
        type !== 'notification_test' &&
        type !== 'activity_plan'
      )
        return;

      const planId = response.notification.request.content.data?.planId;
      router.replace(
        type === 'activity_plan'
          ? typeof planId === 'string'
            ? { pathname: '/plans', params: { planId } }
            : '/plans'
          : '/',
      );
      clearLastNotificationResponse();
    };

    const lastResponse = getLastNotificationResponse();
    if (lastResponse !== null) {
      openNotificationDestination(lastResponse);
    }

    const subscription = addNotificationResponseReceivedListener(openNotificationDestination);
    return () => subscription.remove();
  }, [router, signedIn]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="dark-content"
        translucent={false}
      />
      {state.status === 'loading' ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
            backgroundColor: theme.colors.background,
          }}
        >
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={{ fontFamily: typography.body, color: theme.colors.text }}>
            Đang kiểm tra phiên đăng nhập…
          </Text>
        </View>
      ) : (
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
            animation: reducedMotion ? 'none' : 'slide_from_right',
            headerBackVisible: false,
            headerLeft: () => (
              <NeoBackButton
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              />
            ),
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="auth" />
          </Stack.Protected>
          <Stack.Protected guard={signedIn}>
            <Stack.Screen name="before-start" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Screen name="index" />
          <Stack.Screen name="plans" options={{ headerShown: false }} />
          <Stack.Screen
            name="forecast"
            options={{
              headerShown: true,
              title: 'Dự báo',
              headerBackTitle: 'Home',
              headerStyle: { backgroundColor: theme.colors.surface },
              headerTintColor: theme.colors.text,
              headerTitleStyle: { fontFamily: typography.heading, fontSize: 18 },
              headerShadowVisible: false,
            }}
          />
        </Stack>
      )}
    </ThemeProvider>
  );
}

// app-providers

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export interface AppBootstrapState {
  isReady: boolean;
  fontError: Error | null;
}

export function useAppBootstrap(): AppBootstrapState {
  const [fontsLoaded, fontError] = useFonts({
    ArchivoBlack: Archivo_900Black,
    BebasNeue: BebasNeue_400Regular,
    JetBrainsMono: JetBrainsMono_400Regular,
    JetBrainsMonoBold: JetBrainsMono_700Bold,
    Syne: Syne_400Regular,
    SyneExtraBold: Syne_800ExtraBold,
  });
  const isReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isReady]);

  return { isReady, fontError };
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GlobalErrorBoundary>
        <QueryClientProvider client={appQueryClient}>
          <AppThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <PlanMonitor />
                <LocationCapabilityProvider>{children}</LocationCapabilityProvider>
              </NotificationProvider>
            </AuthProvider>
          </AppThemeProvider>
        </QueryClientProvider>
      </GlobalErrorBoundary>
    </SafeAreaProvider>
  );
}
