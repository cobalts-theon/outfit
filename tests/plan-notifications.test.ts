import { beforeEach, expect, it, jest } from '@jest/globals';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { clearPlanNotifications, syncPlanNotification, changedPlan } from '@/services/plans';
import type { ActivityPlan } from '@/services/plans';
import type { ActivityAssessment } from '@/utils/planning';

jest.mock('expo-sqlite/localStorage/install', () => ({}));

jest.mock('@/services/notifications', () => ({
  WEATHER_NOTIFICATION_CHANNEL_ID: 'weather-actions',
  configureWeatherNotificationChannel: jest.fn(async () => false),
}));

jest.mock('expo-notifications/build/scheduleNotificationAsync', () => ({
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock('expo-notifications/build/cancelScheduledNotificationAsync', () => ({
  cancelScheduledNotificationAsync: jest.fn(),
}));

jest.mock('expo-notifications/build/Notifications.types', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidNotificationPriority: { HIGH: 'high' },
}));

const plan: ActivityPlan = {
  id: 'plan',
  user_id: 'owner',
  activity: 'walking',
  created_at: '2026-09-15T00:00:00Z',
  starts_at: '2099-09-15T02:00:00Z',
  ends_at: '2099-09-15T02:30:00Z',
  latitude: 21,
  longitude: 105,
  location_label: 'Hà Nội',
  time_zone: 'Asia/Ho_Chi_Minh',
  policy_version: 'activity-v1',
  reasons: ['Clear'],
  preparation: 'Water',
  status: 'planned',
  feedback: null,
  reminder_enabled: true,
  checked_items: [],
  baseline_risks: [],
  baseline_status: 'suitable',
};

const assessment: ActivityAssessment = {
  start: plan.starts_at,
  end: plan.ends_at,
  status: 'avoid',
  score: 100,
  summary: 'Mưa',
  reasons: [],
  risks: ['Mưa'],
  checklist: [],
};

beforeEach(() => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
    },
  });
  jest.mocked(scheduleNotificationAsync).mockReset().mockResolvedValue('scheduled-id');
  jest.mocked(cancelScheduledNotificationAsync).mockReset().mockResolvedValue(undefined);
});

it('schedules once and deduplicates the same changed forecast', async () => {
  await syncPlanNotification(plan, assessment);
  await syncPlanNotification(plan, assessment);
  expect(scheduleNotificationAsync).toHaveBeenCalledTimes(2); // one pre-plan reminder + one change
  expect(jest.mocked(scheduleNotificationAsync).mock.calls[0][0].trigger).toMatchObject({
    date: new Date(Date.parse(plan.starts_at) - 15 * 60_000),
  });
});

it('does not send when a plan is cancelled or reminders are off', async () => {
  await syncPlanNotification({ ...plan, status: 'cancelled' }, assessment);
  await syncPlanNotification({ ...plan, reminder_enabled: false }, assessment);
  expect(scheduleNotificationAsync).not.toHaveBeenCalled();
});

it('cancels reminders when plans are removed or account changes', async () => {
  await syncPlanNotification(plan);
  await clearPlanNotifications([plan.id], 'another-owner');
  expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('scheduled-id');
});

it('does not label missing or unchanged evidence as deterioration', () => {
  expect(changedPlan(plan, { ...assessment, status: 'unknown' })).toBe(false);
  expect(
    changedPlan({ ...plan, baseline_status: 'avoid', baseline_risks: ['Mưa'] }, assessment),
  ).toBe(false);
});

it('moves the existing reminder without duplicating the new schedule', async () => {
  await syncPlanNotification(plan);
  const moved = { ...plan, starts_at: '2099-09-15T04:00:00Z', ends_at: '2099-09-15T04:30:00Z' };
  await syncPlanNotification(moved);
  await syncPlanNotification(moved);
  expect(cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
  expect(scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  expect(jest.mocked(scheduleNotificationAsync).mock.calls[1][0].trigger).toMatchObject({
    date: new Date('2099-09-15T03:45:00Z'),
  });
});

it('replaces an old reminder with one immediate reminder when departure is under 15 minutes away', async () => {
  await syncPlanNotification(plan);
  const start = Date.now() + 10 * 60_000;
  await syncPlanNotification({
    ...plan,
    starts_at: new Date(start).toISOString(),
    ends_at: new Date(start + 30 * 60_000).toISOString(),
  });
  expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('scheduled-id');
  expect(scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  expect(jest.mocked(scheduleNotificationAsync).mock.calls[1][0].trigger).toBeNull();
});

it('retries scheduling after cancellation succeeded but the replacement failed', async () => {
  await syncPlanNotification(plan);
  const moved = { ...plan, starts_at: '2099-09-15T05:00:00Z', ends_at: '2099-09-15T05:30:00Z' };
  jest.mocked(scheduleNotificationAsync).mockRejectedValueOnce(new Error('OS error'));
  await expect(syncPlanNotification(moved)).rejects.toThrow('OS error');
  await syncPlanNotification(moved);
  expect(cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
  expect(scheduleNotificationAsync).toHaveBeenCalledTimes(3);
});

it('deduplicates change alerts even when the reminder time has already passed', async () => {
  const start = Date.now() + 10 * 60_000;
  const soon = {
    ...plan,
    starts_at: new Date(start).toISOString(),
    ends_at: new Date(start + 30 * 60_000).toISOString(),
  };
  await syncPlanNotification(soon, assessment);
  await syncPlanNotification(soon, assessment);
  expect(scheduleNotificationAsync).toHaveBeenCalledTimes(2);
});

it('uses the Expo Go default channel for saved-hour reminders', async () => {
  await syncPlanNotification(plan);
  expect(jest.mocked(scheduleNotificationAsync).mock.calls[0][0].trigger).not.toHaveProperty(
    'channelId',
  );
  expect(jest.mocked(scheduleNotificationAsync).mock.calls[0][0].content).toMatchObject({
    sound: 'default',
    priority: 'high',
  });
});

it('repairs old reminders assigned to an unavailable custom channel', async () => {
  localStorage.setItem(
    'weather.activity-plan-notifications.v1',
    JSON.stringify({
      [plan.id]: {
        owner: plan.user_id,
        reminder: 'old-broken',
        reminderTime: Date.parse(plan.starts_at) - 15 * 60000,
      },
    }),
  );
  await syncPlanNotification(plan);
  expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-broken');
  expect(scheduleNotificationAsync).toHaveBeenCalledTimes(1);
});
