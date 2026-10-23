/**
 * Đọc/ghi kế hoạch và đặt hoặc hủy nhắc lịch trên thiết bị.
 * Có nhánh lưu cục bộ cho khách; giao diện hiện tại yêu cầu đăng nhập khi lưu giờ.
 */
import 'expo-sqlite/localStorage/install';
import { requireSupabaseClient } from '@/services/supabase';
import type { Tables, TablesInsert } from '@/types/database';
import { type ActivityAssessment, rescheduledEvidence, validActivityDuration, activityLabel, formatPlanTime } from '@/utils/planning';
import { Platform } from 'react-native';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { AndroidNotificationPriority, SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { configureWeatherNotificationChannel, WEATHER_NOTIFICATION_CHANNEL_ID } from '@/services/notifications';

// activity-plans

export type ActivityPlan = Tables<'activity_plans'>;

export type PlanInput = Omit<
  TablesInsert<'activity_plans'>,
  'id' | 'user_id' | 'created_at' | 'status' | 'feedback'
>;

export type PlanChange = {
  reminder_enabled?: boolean;
  checked_items?: string[];
  status?: 'cancelled' | 'completed';
};

const GUEST_KEY = 'weather.guest-walking-plans.v1';

// Đọc các kế hoạch cục bộ của khách.
function guestPlans(): ActivityPlan[] {
  const raw = localStorage.getItem(GUEST_KEY);
  if (!raw) return [];
  const rows: unknown = JSON.parse(raw);
  if (
    !Array.isArray(rows) ||
    !rows.every(
      (p) =>
        p &&
        typeof p.id === 'string' &&
        p.user_id === 'guest' &&
        typeof p.location_label === 'string' &&
        typeof p.time_zone === 'string' &&
        Number.isFinite(Date.parse(p.starts_at)) &&
        Number.isFinite(Date.parse(p.ends_at)) &&
        Array.isArray(p.reasons) &&
        p.reasons.every((v: unknown) => typeof v === 'string') &&
        typeof p.preparation === 'string' &&
        ['planned', 'cancelled', 'completed'].includes(p.status),
    )
  ) {
    throw new Error('Không đọc được kế hoạch đã lưu trên thiết bị.');
  }
  return rows.map((row) => ({
    ...row,
    reminder_enabled: row.reminder_enabled ?? false,
    checked_items: row.checked_items ?? [],
    baseline_risks: row.baseline_risks ?? [],
    baseline_status: row.baseline_status ?? 'unknown',
  }));
}

// Lấy danh sách hoạt động đã lưu.
export async function listActivityPlans(owner?: string): Promise<ActivityPlan[]> {
  if (!owner) return guestPlans().sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  const { data, error } = await requireSupabaseClient()
    .from('activity_plans')
    .select('*')
    .eq('user_id', owner)
    .order('starts_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}

// Lấy hoạt động sắp diễn ra gần nhất.
export async function nextActivityPlan(owner: string): Promise<ActivityPlan | null> {
  const { data, error } = await requireSupabaseClient()
    .from('activity_plans')
    .select('*')
    .eq('user_id', owner)
    .eq('status', 'planned')
    .gt('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Lấy hoạt động theo mã và chủ sở hữu.
export async function getActivityPlan(id: string, owner: string): Promise<ActivityPlan | null> {
  const { data, error } = await requireSupabaseClient()
    .from('activity_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', owner)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Đổi giờ của hoạt động đã lưu.
export async function rescheduleActivityPlan(plan: ActivityPlan, assessment: ActivityAssessment, owner: string): Promise<ActivityPlan> {
  if (
    plan.user_id !== owner ||
    plan.status !== 'planned' ||
    Date.parse(plan.starts_at) <= Date.now()
  ) {
    throw new Error('Kế hoạch đã thay đổi hoặc đã qua giờ. Hãy tải lại.');
  }
  const update = rescheduledEvidence(assessment, plan.checked_items);
  if (
    Date.parse(update.ends_at) - Date.parse(update.starts_at) !==
    Date.parse(plan.ends_at) - Date.parse(plan.starts_at)
  ) {
    throw new Error('Cần giữ nguyên thời lượng khi đổi giờ.');
  }
  const { data, error } = await requireSupabaseClient()
    .from('activity_plans')
    .update(update)
    .eq('id', plan.id)
    .eq('user_id', owner)
    .eq('status', 'planned')
    .eq('starts_at', plan.starts_at)
    .eq('ends_at', plan.ends_at)
    .filter('checked_items', 'eq', `{${plan.checked_items.map((id) => JSON.stringify(id)).join(',')}}`)
    .select('*')
    .maybeSingle();
  if (error?.code === '23505') throw new Error('Bạn đã có hoạt động này tại giờ và địa điểm đó.');
  if (error) throw new Error('Chưa đổi được giờ. Kiểm tra mạng và thử lại.');
  if (!data) throw new Error('Kế hoạch vừa thay đổi. Hãy tải lại trước khi đổi giờ.');
  return data;
}

// Kiểm tra và lưu hoạt động mới.
export async function saveActivityPlan(input: PlanInput, owner?: string): Promise<ActivityPlan> {
  const minutes = (Date.parse(input.ends_at) - Date.parse(input.starts_at)) / 60_000;
  if (!validActivityDuration(minutes)) throw new Error('Thời lượng phải từ 1 đến 1440 phút.');
  if (Date.parse(input.starts_at) <= Date.now())
    throw new Error('Giờ này đã qua. Hãy tìm giờ mới.');
  if (owner) {
    const { data, error } = await requireSupabaseClient()
      .from('activity_plans')
      .insert({ ...input, user_id: owner })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
  const rows = guestPlans();
  if (
    rows.some(
      (p) =>
        p.activity === (input.activity ?? 'walking') &&
        p.starts_at === input.starts_at &&
        p.latitude === input.latitude &&
        p.longitude === input.longitude,
    )
  ) {
    throw new Error('Bạn đã lưu kế hoạch cho giờ và địa điểm này.');
  }
  if (rows.length >= 100)
    throw new Error('Thiết bị đã lưu 100 kế hoạch. Hãy xóa kế hoạch cũ trước.');
  const plan: ActivityPlan = {
    ...input,
    reminder_enabled: input.reminder_enabled ?? false,
    checked_items: input.checked_items ?? [],
    baseline_risks: input.baseline_risks ?? [],
    baseline_status: input.baseline_status ?? 'unknown',
    activity: input.activity ?? 'walking',
    id: `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    user_id: 'guest',
    status: 'planned',
    feedback: null,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(GUEST_KEY, JSON.stringify([plan, ...rows]));
  return plan;
}

// Cập nhật hoặc xóa hoạt động đã lưu.
export async function changeActivityPlan(id: string, change: PlanChange | 'delete', owner?: string): Promise<void> {
  if (!owner) {
    const rows = guestPlans();
    if (!rows.some((p) => p.id === id)) throw new Error('Không tìm thấy kế hoạch.');
    localStorage.setItem(
      GUEST_KEY,
      JSON.stringify(
        change === 'delete'
          ? rows.filter((p) => p.id !== id)
          : rows.map((p) => (p.id === id ? { ...p, ...change } : p)),
      ),
    );
    return;
  }
  const table = requireSupabaseClient().from('activity_plans');
  const request = change === 'delete' ? table.delete() : table.update(change);
  const { data, error } = await request.eq('id', id).eq('user_id', owner).select('id').single();
  if (error || !data) throw error ?? new Error('Không tìm thấy kế hoạch.');
}

// plan-notifications

const KEY = 'weather.activity-plan-notifications.v1';

type RecordValue = {
  owner: string;
  reminder?: string;
  reminderTime?: number;
  channel?: string;
  changeSignature?: string;
  changedAt?: number;
};

// Đọc thông tin nhắc lịch đã lưu.
function read(): Record<string, RecordValue> {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return Object.fromEntries(
      Object.entries(data).filter(
        ([, r]) =>
          r &&
          typeof r === 'object' &&
          typeof r.owner === 'string' &&
          (r.reminder === undefined || typeof r.reminder === 'string'),
      ),
    );
  } catch {
    return {};
  }
}

let queue = Promise.resolve();

// Xếp các thao tác lưu lịch chạy lần lượt.
function serialize(work: () => Promise<void>) {
  const next = queue.catch(() => undefined).then(work);
  queue = next;
  return next;
}

// Hủy nhắc lịch không còn sử dụng.
export function clearPlanNotifications(keepIds: readonly string[], owner?: string) {
  return serialize(async () => {
    const records = read();
    for (const [id, record] of Object.entries(records)) {
      if (record.owner === owner && keepIds.includes(id)) continue;
      if (record.reminder && Platform.OS !== 'web')
        await cancelScheduledNotificationAsync(record.reminder);
      delete records[id];
    }
    localStorage.setItem(KEY, JSON.stringify(records));
  });
}

// Kiểm tra dự báo có thêm rủi ro.
export function changedPlan(plan: Pick<ActivityPlan, 'baseline_risks' | 'baseline_status'>, assessment: ActivityAssessment) {
  return (
    plan.baseline_status !== 'unknown' &&
    assessment.status !== 'unknown' &&
    ((assessment.status === 'avoid' && plan.baseline_status !== 'avoid') ||
      assessment.risks.some((risk) => !plan.baseline_risks.includes(risk)))
  );
}

// Đồng bộ nhắc lịch của hoạt động.
export function syncPlanNotification(plan: ActivityPlan, assessment?: ActivityAssessment, alternative?: ActivityAssessment) {
  return serialize(async () => {
    if (
      Platform.OS === 'web' ||
      !plan.reminder_enabled ||
      plan.status !== 'planned' ||
      Date.parse(plan.starts_at) <= Date.now()
    )
      return;
    const channelReady = await configureWeatherNotificationChannel();
    const channel = channelReady ? WEATHER_NOTIFICATION_CHANNEL_ID : 'default';
    const records = read(),
      record = records[plan.id] ?? { owner: plan.user_id };
    const triggerAt = Date.parse(plan.starts_at) - 15 * 60_000;
    if (record.reminderTime !== triggerAt || record.channel !== channel) {
      if (record.reminder) await cancelScheduledNotificationAsync(record.reminder);
      delete record.reminder;
      record.reminderTime = triggerAt;
      record.channel = channel;
      delete record.changeSignature;
      delete record.changedAt;
      records[plan.id] = record;
      localStorage.setItem(KEY, JSON.stringify(records));
    }
    if (!record.reminder) {
      record.reminder = await scheduleNotificationAsync({
        content: {
          title: `Sắp đến giờ ${activityLabel(plan.activity).toLowerCase()}`,
          body: `${formatPlanTime(plan.starts_at, plan.time_zone)} · ${plan.location_label}. Xem lại dự báo và đồ cần chuẩn bị.`,
          data: { type: 'activity_plan', planId: plan.id },
          sound: 'default',
          priority: AndroidNotificationPriority.HIGH,
        },
        trigger:
          triggerAt > Date.now()
            ? {
                type: SchedulableTriggerInputTypes.DATE,
                date: new Date(triggerAt),
                ...(Platform.OS === 'android' && channelReady
                  ? { channelId: WEATHER_NOTIFICATION_CHANNEL_ID }
                  : {}),
              }
            : Platform.OS === 'android' && channelReady
              ? { channelId: WEATHER_NOTIFICATION_CHANNEL_ID }
              : null,
      });
      record.reminderTime = triggerAt;
      records[plan.id] = record;
      localStorage.setItem(KEY, JSON.stringify(records));
    }
    const signature = assessment
      ? `${assessment.status}:${[...assessment.risks].sort().join('|')}`
      : '';
    if (
      assessment &&
      changedPlan(plan, assessment) &&
      signature !== record.changeSignature &&
      (!record.changedAt || Date.now() - record.changedAt > 60 * 60_000)
    ) {
      await scheduleNotificationAsync({
        content: {
          title: 'Kế hoạch cần xem lại',
          body: `${activityLabel(plan.activity)} lúc ${formatPlanTime(plan.starts_at, plan.time_zone)}: ${assessment.summary}${alternative ? ` Có thể cân nhắc ${formatPlanTime(alternative.start, plan.time_zone)}.` : ''}`,
          data: { type: 'activity_plan', planId: plan.id },
          sound: 'default',
          priority: AndroidNotificationPriority.HIGH,
        },
        trigger:
          Platform.OS === 'android' && channelReady
            ? { channelId: WEATHER_NOTIFICATION_CHANNEL_ID }
            : null,
      });
      record.changeSignature = signature;
      record.changedAt = Date.now();
    }
    records[plan.id] = record;
    localStorage.setItem(KEY, JSON.stringify(records));
  });
}
