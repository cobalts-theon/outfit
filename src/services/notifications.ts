import { requireSupabaseClient } from '@/services/supabase';
import 'expo-sqlite/localStorage/install';
import { useSyncExternalStore } from 'react';
import { setNotificationCategoryAsync } from 'expo-notifications/build/setNotificationCategoryAsync';
import {
  addNotificationResponseReceivedListener,
  getLastNotificationResponse,
  clearLastNotificationResponse,
} from 'expo-notifications/build/NotificationsEmitter';
import { dismissNotificationAsync } from 'expo-notifications/build/dismissNotificationAsync';
import {
  type NotificationResponse,
  AndroidNotificationPriority,
  SchedulableTriggerInputTypes,
} from 'expo-notifications/build/Notifications.types';
import {
  type DailyAction,
  RECOMMENDATION_NOTIFICATION_SLOTS,
  type RecommendationNotificationEvent,
} from '@/utils/recommendations';
import Constants from 'expo-constants';
import { appPalette } from '@/theme';
import * as Device from 'expo-device';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import {
  IosAuthorizationStatus,
  type NotificationPermissionsStatus,
} from 'expo-notifications/build/NotificationPermissions.types';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { Platform } from 'react-native';

// notification-preferences

export async function upsertCloudNotificationPreference(
  userId: string,
  enabled: boolean,
): Promise<void> {
  const { error } = await requireSupabaseClient()
    .from('notification_preferences')
    .upsert({ user_id: userId, notifications_enabled: enabled }, { onConflict: 'user_id' });

  if (error !== null) {
    throw error;
  }
}

// completed-actions

const KEY = 'weather.completed-actions.v1';

const listeners = new Set<() => void>();

let version = 0;

function read(): Record<string, number> {
  try {
    const value: unknown = JSON.parse(globalThis.localStorage.getItem(KEY) ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        ([key, at]) => key.length < 500 && typeof at === 'number' && at > Date.now() - 7 * 86400000,
      ),
    );
  } catch {
    return {};
  }
}

export function isActionCompleted(id: string) {
  return Object.hasOwn(read(), id);
}

export function setActionCompleted(id: string, completed = true) {
  const records = read();
  if (completed) records[id] = Date.now();
  else delete records[id];
  globalThis.localStorage.setItem(KEY, JSON.stringify(records));
  version++;
  listeners.forEach((listener) => listener());
}

export function useCompletedActionsVersion() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => version,
    () => 0,
  );
}

// notification-service

export const WEATHER_NOTIFICATION_CHANNEL_ID = 'weather-actions';

const PREFERENCE_KEY = 'weather.notification-preference.v1';

const REMINDERS_KEY = 'weather.action-reminders.v1';

function readReminderIds(): string[] {
  try {
    const ids: unknown = JSON.parse(globalThis.localStorage.getItem(REMINDERS_KEY) ?? '[]');
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

const RECORDS_KEY = 'weather.notification-records.v1';

interface ScheduledRecord {
  readonly signature: string;
  readonly identifier: string;
  readonly triggerAt: number;
  readonly taskId?: string;
  readonly channel?: string;
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
  if (Constants.appOwnership === 'expo') return false;

  try {
    const channel = await setNotificationChannelAsync(WEATHER_NOTIFICATION_CHANNEL_ID, {
      name: 'Cảnh báo thời tiết và sinh hoạt',
      description: 'Mưa sắp tới và chỉ số môi trường cần hành động.',
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 180, 250],
      lightColor: appPalette.blue,
      sound: 'default',
    });
    return channel !== null;
  } catch {
    // Expo Go can reject project-owned channel creation even though local
    // notifications remain available. A development/release build uses the
    // configured channel; Expo Go falls back to its host default channel.
    return false;
  }
}

export function hasGrantedNotificationPermission(permission: NotificationPermissionsStatus) {
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

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
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
  await configureActionCategory();
  const channel = channelReady ? WEATHER_NOTIFICATION_CHANNEL_ID : 'default';
  const records = readRecords();
  const nextRecords: ScheduledRecords = { ...records };
  const eventBySlot = new Map(events.map((event) => [event.slot, event]));
  let schedulingFailed = false;

  for (const slot of RECOMMENDATION_NOTIFICATION_SLOTS) {
    const candidate = eventBySlot.get(slot);
    const event =
      candidate?.data.taskId && isActionCompleted(candidate.data.taskId) ? undefined : candidate;
    const existing = records[slot];

    if (event === undefined) {
      await cancelRecord(existing);
      delete nextRecords[slot];
      continue;
    }

    if (
      existing?.signature === event.signature &&
      existing.taskId === event.data.taskId &&
      existing.channel === channel
    )
      continue;
    await cancelRecord(existing);
    delete nextRecords[slot];

    try {
      const identifier = await scheduleNotificationAsync({
        content: {
          title: event.title,
          body: event.body,
          data: event.data,
          ...(event.data.taskId ? { categoryIdentifier: 'weatherTask' } : {}),
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

      if (event.data.taskId && isActionCompleted(event.data.taskId)) {
        await cancelScheduledNotificationAsync(identifier);
        continue;
      }
      nextRecords[slot] = {
        signature: event.signature,
        identifier,
        triggerAt: event.triggerAt,
        taskId: event.data.taskId,
        channel,
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
  const reminders = readReminderIds();
  await Promise.all(reminders.map((id) => cancelScheduledNotificationAsync(id)));
  globalThis.localStorage.removeItem(REMINDERS_KEY);
  const records = readRecords();
  await Promise.all(Object.values(records).map((record) => cancelRecord(record)));
  globalThis.localStorage.removeItem(RECORDS_KEY);
}

export async function sendTestWeatherNotification() {
  if (Platform.OS === 'web') throw new Error('Thông báo cần chạy trên điện thoại.');
  if (!(await hasWeatherNotificationPermission())) throw new Error('permission');
  const channelReady = await configureWeatherNotificationChannel();
  await scheduleNotificationAsync({
    content: {
      title: 'Thông báo thời tiết đã bật',
      body: 'Bạn đã nhận được thông báo thử. App sẽ nhắc giờ đã lưu và cảnh báo theo dự báo đã tải.',
      data: { type: 'notification_test', url: 'weather:///' },
      sound: 'default',
      priority: AndroidNotificationPriority.HIGH,
    },
    trigger:
      Platform.OS === 'android' && channelReady
        ? { channelId: WEATHER_NOTIFICATION_CHANNEL_ID }
        : null,
  });
}

async function configureActionCategory() {
  if (Platform.OS === 'web') return;
  await setNotificationCategoryAsync('weatherTask', [
    { identifier: 'DONE', buttonTitle: 'Xong', options: { opensAppToForeground: true } },
  ]);
}

export async function completeWeatherAction(id: string) {
  setActionCompleted(id);
  if (Platform.OS === 'web') return;
  await cancelScheduledNotificationAsync(`reminder:${id}`).catch(() => undefined);
  await dismissNotificationAsync(`reminder:${id}`).catch(() => undefined);
  const records = readRecords();
  for (const record of Object.values(records)) {
    if (record.taskId === id) {
      await cancelRecord(record);
      await dismissNotificationAsync(record.identifier).catch(() => undefined);
    }
  }
}

export function listenForCompletedActions() {
  if (Platform.OS === 'web') return () => {};
  const handle = (response: NotificationResponse | null) => {
    const id = response?.notification.request.content.data?.taskId;
    if (response?.actionIdentifier !== 'DONE' || typeof id !== 'string' || id.length > 500) return;
    void completeWeatherAction(id)
      .then(() => clearLastNotificationResponse())
      .catch(() => undefined);
  };
  const subscription = addNotificationResponseReceivedListener(handle);
  handle(getLastNotificationResponse());
  return () => subscription.remove();
}

export async function remindWeatherAction(action: DailyAction) {
  if (Platform.OS === 'web' || !(await hasWeatherNotificationPermission()))
    throw new Error('permission');
  if (isActionCompleted(action.id)) throw new Error('completed');
  await configureActionCategory();
  const channelReady = await configureWeatherNotificationChannel();
  const identifier = `reminder:${action.id}`;
  await cancelScheduledNotificationAsync(identifier);
  await scheduleNotificationAsync({
    identifier,
    content: {
      title: action.title,
      body: action.reason,
      categoryIdentifier: 'weatherTask',
      data: { taskId: action.id },
      sound: 'default',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 15 * 60,
      ...(Platform.OS === 'android' && channelReady
        ? { channelId: WEATHER_NOTIFICATION_CHANNEL_ID }
        : {}),
    },
  });
  if (isActionCompleted(action.id)) {
    await cancelScheduledNotificationAsync(identifier);
    return;
  }
  const ids = [...new Set([...readReminderIds(), identifier])];
  await Promise.all(ids.slice(0, -100).map((id) => cancelScheduledNotificationAsync(id)));
  globalThis.localStorage.setItem(REMINDERS_KEY, JSON.stringify(ids.slice(-100)));
}

/** Retire manually requested chore reminders after removing their UI. */
export async function retireActionReminders() {
  if (Platform.OS === 'web') return;
  const ids = readReminderIds();
  await Promise.all(ids.map((id) => cancelScheduledNotificationAsync(id)));
  globalThis.localStorage.removeItem(REMINDERS_KEY);
  // Remove already delivered actionable messages; automatic weather alerts
  // are recreated without completion actions by the next weather sync.
  for (const record of Object.values(readRecords())) {
    if (record.taskId) {
      await cancelScheduledNotificationAsync(record.identifier);
      await dismissNotificationAsync(record.identifier).catch(() => undefined);
    }
  }
}
