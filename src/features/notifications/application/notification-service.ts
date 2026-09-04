import 'expo-sqlite/localStorage/install';

import Constants from 'expo-constants';
import * as Device from 'expo-device';
// Expo SDK 57's package root eagerly loads remote-push auto-registration and
// throws in Expo Go on Android. Import the public local-notification functions
// from their versioned entry modules so local scheduling keeps working there.
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import {
  IosAuthorizationStatus,
  type NotificationPermissionsStatus,
} from 'expo-notifications/build/NotificationPermissions.types';
import {
  AndroidNotificationPriority,
  SchedulableTriggerInputTypes,
} from 'expo-notifications/build/Notifications.types';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { Platform } from 'react-native';

import {
  RECOMMENDATION_NOTIFICATION_SLOTS,
  type RecommendationNotificationEvent,
} from '@/features/notifications/domain/recommendation-notification-plan';

export const WEATHER_NOTIFICATION_CHANNEL_ID = 'weather-actions';
const PREFERENCE_KEY = 'weather.notification-preference.v1';
const RECORDS_KEY = 'weather.notification-records.v1';

interface ScheduledRecord {
  readonly signature: string;
  readonly identifier: string;
  readonly triggerAt: number;
}

type ScheduledRecords = Partial<Record<RecommendationNotificationEvent['slot'], ScheduledRecord>>;

if (Platform.OS !== 'web') {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: AndroidNotificationPriority.HIGH,
    }),
  });
}

function readRecords(): ScheduledRecords {
  const raw = globalThis.localStorage.getItem(RECORDS_KEY);
  if (raw === null) return {};

  try {
    const parsed = JSON.parse(raw) as ScheduledRecords;
    return parsed !== null && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeRecords(records: ScheduledRecords) {
  globalThis.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

async function cancelRecord(record: ScheduledRecord | undefined) {
  if (record === undefined) return;
  await cancelScheduledNotificationAsync(record.identifier).catch(() => undefined);
}

export function readNotificationPreference() {
  return globalThis.localStorage.getItem(PREFERENCE_KEY) === 'enabled';
}

export function writeNotificationPreference(enabled: boolean) {
  globalThis.localStorage.setItem(PREFERENCE_KEY, enabled ? 'enabled' : 'disabled');
}

export async function configureWeatherNotificationChannel() {
  if (Platform.OS !== 'android') return true;

  try {
    await setNotificationChannelAsync(WEATHER_NOTIFICATION_CHANNEL_ID, {
      name: 'Cảnh báo thời tiết và sinh hoạt',
      description: 'Mưa sắp tới và chỉ số môi trường cần hành động.',
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 180, 250],
      lightColor: '#0057B8',
      sound: 'default',
    });
    return true;
  } catch {
    // Expo Go can reject project-owned channel creation even though local
    // notifications remain available. A development/release build uses the
    // configured channel; Expo Go falls back to its host default channel.
    return false;
  }
}

export function hasGrantedNotificationPermission(
  permission: NotificationPermissionsStatus,
) {
  if (Platform.OS !== 'ios') return permission.status === 'granted';
  const iosStatus = permission.ios?.status;
  return (
    iosStatus === IosAuthorizationStatus.AUTHORIZED ||
    iosStatus === IosAuthorizationStatus.PROVISIONAL ||
    iosStatus === IosAuthorizationStatus.EPHEMERAL
  );
}

export async function requestWeatherNotificationPermission() {
  if (Platform.OS === 'web') return false;
  await configureWeatherNotificationChannel();
  const existing = await getPermissionsAsync();
  if (hasGrantedNotificationPermission(existing)) return true;
  const requested = await requestPermissionsAsync();
  return hasGrantedNotificationPermission(requested);
}

export async function hasWeatherNotificationPermission() {
  if (Platform.OS === 'web') return false;
  const permission = await getPermissionsAsync();
  return hasGrantedNotificationPermission(permission);
}

export type RemotePushCapability = 'ready' | 'local_only';

export async function resolveRemotePushCapability(): Promise<RemotePushCapability> {
  if (!Device.isDevice) return 'local_only';
  if (Constants.appOwnership === 'expo') return 'local_only';

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (typeof projectId !== 'string' || projectId.length === 0) return 'local_only';

  try {
    const { getExpoPushTokenAsync } = await import(
      'expo-notifications/build/getExpoPushTokenAsync'
    );
    await getExpoPushTokenAsync({ projectId });
    return 'ready';
  } catch {
    return 'local_only';
  }
}

export async function syncRecommendationNotifications(
  events: readonly RecommendationNotificationEvent[],
) {
  if (Platform.OS === 'web') return;
  const channelReady = await configureWeatherNotificationChannel();
  const records = readRecords();
  const nextRecords: ScheduledRecords = { ...records };
  const eventBySlot = new Map(events.map((event) => [event.slot, event]));
  let schedulingFailed = false;

  for (const slot of RECOMMENDATION_NOTIFICATION_SLOTS) {
    const event = eventBySlot.get(slot);
    const existing = records[slot];

    if (event === undefined) {
      await cancelRecord(existing);
      delete nextRecords[slot];
      continue;
    }

    if (existing?.signature === event.signature) continue;
    await cancelRecord(existing);
    delete nextRecords[slot];

    try {
      const identifier = await scheduleNotificationAsync({
        content: {
          title: event.title,
          body: event.body,
          data: event.data,
          sound: 'default',
          priority: AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(2, Math.round((event.triggerAt - Date.now()) / 1000)),
          ...(Platform.OS === 'android' && channelReady
            ? { channelId: WEATHER_NOTIFICATION_CHANNEL_ID }
            : {}),
        },
      });

      nextRecords[slot] = {
        signature: event.signature,
        identifier,
        triggerAt: event.triggerAt,
      };
    } catch {
      // The previous native schedule is already gone. Keep this slot empty so
      // the next weather refresh can retry instead of trusting a stale record.
      schedulingFailed = true;
    }
  }

  writeRecords(nextRecords);
  if (schedulingFailed) {
    throw new Error('One or more recommendation notifications could not be scheduled.');
  }
}

export async function cancelRecommendationNotifications() {
  const records = readRecords();
  await Promise.all(Object.values(records).map((record) => cancelRecord(record)));
  globalThis.localStorage.removeItem(RECORDS_KEY);
}

export async function sendTestWeatherNotification() {
  if (Platform.OS === 'web') return;
  const channelReady = await configureWeatherNotificationChannel();
  await scheduleNotificationAsync({
    content: {
      title: 'Cảnh báo thời tiết đã sẵn sàng',
      body: 'Ứng dụng sẽ ưu tiên mưa sắp tới và các chỉ số môi trường cần hành động.',
      data: { type: 'notification_test', url: 'weather:///' },
      sound: 'default',
      priority: AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      ...(Platform.OS === 'android' && channelReady
        ? { channelId: WEATHER_NOTIFICATION_CHANNEL_ID }
        : {}),
    },
  });
}
