import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';
import {
  configureWeatherNotificationChannel,
  sendTestWeatherNotification,
  isActionCompleted,
} from '@/services/notifications';
import { getLastNotificationResponse } from 'expo-notifications/build/NotificationsEmitter';
import {
  retireActionReminders,
  cancelRecommendationNotifications,
  remindWeatherAction,
  completeWeatherAction,
  listenForCompletedActions,
  syncRecommendationNotifications,
} from '@/services/notifications';
import type { RecommendationNotificationEvent } from '@/utils/recommendations';
import { getPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';

const mockStorageEntries = new Map<string, string>();

const mockLocalStorage: Storage = {
  get length() {
    return mockStorageEntries.size;
  },
  clear: () => mockStorageEntries.clear(),
  getItem: (key) => mockStorageEntries.get(key) ?? null,
  key: (index) => [...mockStorageEntries.keys()][index] ?? null,
  removeItem: (key) => mockStorageEntries.delete(key),
  setItem: (key, value) => mockStorageEntries.set(key, value),
};

jest.mock('expo-sqlite/localStorage/install', () => ({}));

jest.mock('expo-constants', () => ({
  appOwnership: 'expo',
  easConfig: null,
  expoConfig: null,
}));

jest.mock('expo-device', () => ({ isDevice: true }));

jest.mock('expo-notifications/build/NotificationChannelManager.types', () => ({
  AndroidImportance: { HIGH: 4 },
}));

jest.mock('expo-notifications/build/NotificationPermissions', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

jest.mock('expo-notifications/build/NotificationPermissions.types', () => ({
  IosAuthorizationStatus: {
    AUTHORIZED: 2,
    EPHEMERAL: 4,
    PROVISIONAL: 3,
  },
}));

jest.mock('expo-notifications/build/Notifications.types', () => ({
  AndroidNotificationPriority: { HIGH: 'high' },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
}));

jest.mock('expo-notifications/build/NotificationsHandler', () => ({
  setNotificationHandler: jest.fn(),
}));

jest.mock('expo-notifications/build/cancelScheduledNotificationAsync', () => ({
  cancelScheduledNotificationAsync: jest.fn(),
}));

jest.mock('expo-notifications/build/scheduleNotificationAsync', () => ({
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock('expo-notifications/build/setNotificationChannelAsync', () => ({
  setNotificationChannelAsync: jest.fn(async () => null),
}));

jest.mock('expo-notifications/build/setNotificationCategoryAsync', () => ({
  setNotificationCategoryAsync: jest.fn(async () => ({})),
}));

jest.mock('expo-notifications/build/NotificationsEmitter', () => ({
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponse: jest.fn(() => null),
  clearLastNotificationResponse: jest.fn(),
}));

jest.mock('expo-notifications/build/dismissNotificationAsync', () => ({
  dismissNotificationAsync: jest.fn(async () => undefined),
}));

const mockCancelScheduledNotificationAsync = jest.mocked(cancelScheduledNotificationAsync);

const mockScheduleNotificationAsync = jest.mocked(scheduleNotificationAsync);

const event: RecommendationNotificationEvent = {
  slot: 'action',
  signature: 'action:manual:hanoi:2026-09-02:heat-hydration',
  title: 'Nên làm ngay · Hà Nội',
  body: 'Uống nước đều.',
  triggerAt: Date.now() + 60_000,
  data: {
    type: 'weather_recommendation',
    actionKey: 'heat-hydration',
    locationIdentity: 'manual:hanoi',
    url: 'weather:///',
  },
};

describe('notification scheduling persistence', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: mockLocalStorage,
    });
    mockLocalStorage.clear();
    mockCancelScheduledNotificationAsync.mockReset().mockResolvedValue(undefined);
    mockScheduleNotificationAsync.mockReset();
  });

  it('gives reminders a Done category and cancels them when notifications are disabled', async () => {
    jest
      .mocked(getPermissionsAsync)
      .mockResolvedValue({ status: 'granted', ios: { status: 2 } } as Awaited<
        ReturnType<typeof getPermissionsAsync>
      >);
    mockScheduleNotificationAsync.mockResolvedValue('reminder:task');
    await remindWeatherAction({
      id: 'task',
      key: 'evening-prepare',
      title: 'Soạn đồ',
      reason: 'Cho sáng mai.',
      urgent: false,
    });
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'reminder:task',
        content: expect.objectContaining({
          categoryIdentifier: 'weatherTask',
          data: { taskId: 'task' },
        }),
        trigger: expect.objectContaining({ seconds: 900 }),
      }),
    );
    mockCancelScheduledNotificationAsync.mockClear();
    await cancelRecommendationNotifications();
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('reminder:task');
  });

  it('retires old manual and actionable schedules after removing chore controls', async () => {
    globalThis.localStorage.setItem(
      'weather.action-reminders.v1',
      JSON.stringify(['reminder:old']),
    );
    globalThis.localStorage.setItem(
      'weather.notification-records.v1',
      JSON.stringify({
        rain: {
          signature: 'old',
          identifier: 'old-rain',
          triggerAt: Date.now(),
          taskId: 'laundry',
        },
      }),
    );
    await retireActionReminders();
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('reminder:old');
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('old-rain');
    expect(globalThis.localStorage.getItem('weather.action-reminders.v1')).toBeNull();
  });

  it('upgrades old schedules that did not carry completion actions', async () => {
    mockScheduleNotificationAsync.mockResolvedValue('native');
    await syncRecommendationNotifications([event]);
    await syncRecommendationNotifications([
      { ...event, data: { ...event.data, taskId: 'new-task' } },
    ]);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  it('does not reschedule completed chores when the forecast changes', async () => {
    mockScheduleNotificationAsync.mockResolvedValue('laundry');
    const task = { ...event, data: { ...event.data, taskId: 'laundry-today' } };
    await syncRecommendationNotifications([task]);
    await completeWeatherAction('laundry-today');
    await syncRecommendationNotifications([{ ...task, signature: 'changed' }]);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('laundry');
    expect(isActionCompleted('laundry-today')).toBe(true);
  });

  it('handles Done when a notification launches the app', () => {
    jest.mocked(getLastNotificationResponse).mockReturnValueOnce({
      actionIdentifier: 'DONE',
      notification: { request: { content: { data: { taskId: 'cold-start' } } } },
    } as unknown as NonNullable<ReturnType<typeof getLastNotificationResponse>>);
    const unsubscribe = listenForCompletedActions();
    expect(isActionCompleted('cold-start')).toBe(true);
    unsubscribe();
  });

  it('leaves a failed slot retryable instead of persisting a stale signature', async () => {
    mockScheduleNotificationAsync
      .mockRejectedValueOnce(new Error('native scheduling failed'))
      .mockResolvedValueOnce('native-notification-id');

    await expect(syncRecommendationNotifications([event])).rejects.toThrow(
      'could not be scheduled',
    );
    await expect(syncRecommendationNotifications([event])).resolves.toBeUndefined();

    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(2);
    expect(globalThis.localStorage.getItem('weather.notification-records.v1')).toContain(
      'native-notification-id',
    );
  });

  it('cancels a prior native schedule before replacing its signature', async () => {
    mockScheduleNotificationAsync
      .mockResolvedValueOnce('first-native-id')
      .mockResolvedValueOnce('second-native-id');

    await syncRecommendationNotifications([event]);
    await syncRecommendationNotifications([{ ...event, signature: `${event.signature}:changed` }]);

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('first-native-id');
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });
});

it('presents a test immediately in Expo Go without a project-owned channel', async () => {
  jest
    .mocked(getPermissionsAsync)
    .mockResolvedValue({ status: 'granted', ios: { status: 2 } } as Awaited<
      ReturnType<typeof getPermissionsAsync>
    >);
  const platform = jest.replaceProperty(Platform, 'OS', 'android');
  await expect(configureWeatherNotificationChannel()).resolves.toBe(false);
  await sendTestWeatherNotification();
  expect(scheduleNotificationAsync).toHaveBeenLastCalledWith(
    expect.objectContaining({
      trigger: null,
      content: expect.objectContaining({ sound: 'default' }),
    }),
  );
  platform.restore();
});

it('does not report a sent test when notification permission is denied', async () => {
  jest
    .mocked(getPermissionsAsync)
    .mockResolvedValue({ status: 'denied', ios: { status: 1 } } as Awaited<
      ReturnType<typeof getPermissionsAsync>
    >);
  const calls = jest.mocked(scheduleNotificationAsync).mock.calls.length;
  await expect(sendTestWeatherNotification()).rejects.toThrow('permission');
  expect(scheduleNotificationAsync).toHaveBeenCalledTimes(calls);
});
