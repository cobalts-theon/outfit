import { DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import {
  addNotificationResponseReceivedListener,
  clearLastNotificationResponse,
  getLastNotificationResponse,
} from 'expo-notifications/build/NotificationsEmitter';
import type { NotificationResponse } from 'expo-notifications/build/Notifications.types';
import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';

import { appThemes, typography } from '@/theme/tokens';
import { useAppTheme } from '@/theme/app-theme-provider';

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
  const { theme } = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const openNotificationDestination = (response: NotificationResponse) => {
      const type = response.notification.request.content.data?.type;
      if (type !== 'weather_recommendation' && type !== 'notification_test') return;

      router.replace('/');
      clearLastNotificationResponse();
    };

    const lastResponse = getLastNotificationResponse();
    if (lastResponse !== null) {
      openNotificationDestination(lastResponse);
    }

    const subscription = addNotificationResponseReceivedListener(
      openNotificationDestination,
    );
    return () => subscription.remove();
  }, [router]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="dark-content"
        translucent={false}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="forecast"
          options={{
            headerShown: true,
            title: 'Dự báo',
            headerBackTitle: 'Home',
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.accent,
            headerTitleStyle: { fontFamily: typography.heading, fontSize: 18 },
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
