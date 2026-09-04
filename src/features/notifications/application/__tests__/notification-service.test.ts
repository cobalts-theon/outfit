import { beforeEach, describe, expect, it, jest } from '@jest/globals';

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

import { syncRecommendationNotifications } from '@/features/notifications/application/notification-service';
import type { RecommendationNotificationEvent } from '@/features/notifications/domain/recommendation-notification-plan';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';

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
