import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SelectedAppLocation } from '@/utils/validation';
import { fetchHourlyAirQuality } from '@/services/weather/client';
import { useAuth } from '@/context/auth';
import { useLocationCapability } from '@/context/location';
import {
  useLiveCurrentWeather,
  createPlanningHours,
  liveCurrentWeatherQueryOptions,
} from '@/services/live-weather';
import {
  changeActivityPlan,
  listActivityPlans,
  saveActivityPlan,
  type PlanChange,
  type PlanInput,
  type ActivityPlan,
  getActivityPlan,
  clearPlanNotifications,
  syncPlanNotification,
} from '@/services/plans';
import {
  assessActivity,
  assessDeparture,
  validActivityDuration,
  parsePlanningDate,
  displayPlanningDate,
  activityPolicyVersion,
  activityPolicyContext,
  type Activity,
  activityCandidates,
  type ActivityAssessment,
  localDate,
  nextLocalDate,
} from '@/utils/planning';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useNotifications } from '@/context/notifications';
import {
  hasWeatherNotificationPermission,
  readNotificationPreference,
} from '@/services/notifications';
import { parseLifestylePreferences } from '@/utils/recommendations';
import { AppState } from 'react-native';

// use-activity-planner

export function usePlanningAirQuality(selectedLocation?: SelectedAppLocation) {
  const coordinates = selectedLocation?.coordinates;
  return useQuery({
    queryKey: ['planning-hourly-aqi', coordinates?.latitude, coordinates?.longitude],
    enabled: coordinates !== undefined,
    queryFn: ({ signal }) => {
      if (!coordinates) throw new Error('Chọn địa điểm trước.');
      return fetchHourlyAirQuality(coordinates.latitude, coordinates.longitude, signal);
    },
    staleTime: 10 * 60_000,
    retry: 1,
  });
}

export function useActivityPlanner() {
  const { state: auth } = useAuth();
  const { state: location } = useLocationCapability();
  const owner = auth.status === 'signed_in' ? auth.user.id : undefined;
  const selectedLocation = location.status === 'ready' ? location.selectedLocation : undefined;
  const weather = useLiveCurrentWeather(selectedLocation);
  const aqi = usePlanningAirQuality(selectedLocation);
  const client = useQueryClient();
  const key = ['activity-plans', owner ?? 'guest'] as const;
  const plans = useQuery({
    queryKey: key,
    queryFn: () => listActivityPlans(owner),
    enabled: Boolean(owner),
  });
  const save = useMutation({
    mutationFn: (input: PlanInput) => {
      if (!owner) throw new Error('Đăng nhập để lưu giờ phù hợp.');
      return saveActivityPlan(input, owner);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const change = useMutation({
    mutationFn: ({ id, change: update }: { id: string; change: PlanChange | 'delete' }) =>
      changeActivityPlan(id, update, owner),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  return {
    auth,
    owner,
    selectedLocation,
    weather,
    aqi,
    plans,
    save,
    change,
    hours: createPlanningHours(
      weather.data?.hourlyForecast,
      Date.now() - aqi.dataUpdatedAt <= 30 * 60_000 ? aqi.data : undefined,
    ),
    fetchedAt: weather.dataUpdatedAt,
    refresh: () => Promise.all([weather.refetch(), aqi.refetch()]),
  };
}

export function useSavedPlanForecast(plan: ActivityPlan, now: number) {
  const location = {
    source: 'manual' as const,
    selectedAt: plan.created_at,
    label: plan.location_label,
    coordinates: { latitude: plan.latitude, longitude: plan.longitude },
  };
  const weather = useLiveCurrentWeather(location),
    aqi = usePlanningAirQuality(location);
  const input = {
    activity: plan.activity as Activity,
    ...activityPolicyContext(plan.policy_version),
    duration: (Date.parse(plan.ends_at) - Date.parse(plan.starts_at)) / 60_000,
    hours: createPlanningHours(
      weather.data?.hourlyForecast,
      now - aqi.dataUpdatedAt <= 30 * 60_000 ? aqi.data : undefined,
    ),
    alerts: weather.data?.weather.alerts,
    fetchedAt: weather.dataUpdatedAt,
    now,
  };
  return {
    input,
    assessment: assessActivity({ ...input, start: plan.starts_at }),
    loading: weather.isFetching || aqi.isFetching,
    error: weather.isError || aqi.isError,
  };
}

// use-plans-screen

export function usePlansScreen() {
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const model = useActivityPlanner();
  const notifications = useNotifications();
  const focused = useQuery({
    queryKey: ['activity-plans', model.owner, 'detail', planId],
    enabled: Boolean(model.owner && planId),
    queryFn: () => getActivityPlan(planId!, model.owner!),
  });
  const preferences = parseLifestylePreferences(
    model.auth.status === 'signed_in'
      ? model.auth.user.user_metadata.lifestyle_preferences
      : undefined,
  );
  const [chosenActivity, setActivity] = useState<Activity>();
  const activity = chosenActivity ?? 'walking';
  const commute = chosenActivity === 'commute';
  const [departure, setDeparture] = useState<number>();
  const [durationText, setDurationText] = useState('30');
  const [dateText, setDateText] = useState<string>();
  const duration = /^\d+$/.test(durationText) ? Number(durationText) : NaN;
  const [from, setFrom] = useState<number | undefined>(preferences?.availability?.start);
  const [to, setTo] = useState<number | undefined>(preferences?.availability?.end);
  const [transport, setTransport] = useState<'walk' | 'bike' | 'motorbike' | 'covered' | 'none'>(
    preferences?.transport === 'none' ? 'walk' : (preferences?.transport ?? 'walk'),
  );
  const [accountOpen, setAccountOpen] = useState(false);
  const initialized = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!model.owner || initialized.current === model.owner) return;
    initialized.current = model.owner;
    setFrom((value) => value ?? preferences?.availability?.start);
    setTo((value) => value ?? preferences?.availability?.end);
    if (preferences?.transport && preferences.transport !== 'none')
      setTransport(preferences.transport);
  }, [
    model.owner,
    preferences?.availability?.start,
    preferences?.availability?.end,
    preferences?.transport,
  ]);
  const [remind, setRemind] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const zone = model.weather.data?.weather.location.timeZone ?? 'Asia/Ho_Chi_Minh';
  const today = localDate(now, zone);
  const tomorrow = nextLocalDate(today);
  const dateValue = dateText ?? displayPlanningDate(today);
  const day = parsePlanningDate(dateValue) ?? '';
  const dates = [...new Set(model.hours.map((hour) => localDate(hour.at, zone)))];
  const selectionError = !day
    ? 'Nhập ngày hợp lệ theo dạng DD/MM/YYYY.'
    : day < today
      ? 'Chọn hôm nay hoặc một ngày sắp tới.'
      : !validActivityDuration(duration)
        ? 'Nhập thời lượng từ 1 đến 1440 phút.'
        : '';
  const selected = model.selectedLocation;
  const busy = model.save.isPending || model.change.isPending;
  const loading = model.weather.isFetching || model.aqi.isFetching;
  const input = {
    activity,
    duration,
    transport,
    exposure: preferences?.exposure,
    hours: model.hours,
    alerts: model.weather.data?.weather.alerts,
    fetchedAt: model.fetchedAt,
    now,
  };
  const validRange = from !== undefined && to !== undefined && from < to;
  const candidates =
    chosenActivity && !commute && validRange && !selectionError
      ? activityCandidates({ ...input, date: day, timeZone: zone, from, to })
      : [];
  const assessment = commute
    ? !selectionError
      ? assessDeparture({ ...input, date: day, timeZone: zone, departure })
      : undefined
    : (candidates[0] ??
      (chosenActivity && validRange && !selectionError
        ? activityCandidates({
            ...input,
            date: day,
            timeZone: zone,
            from,
            to,
            includeAvoid: true,
          })[0]
        : undefined));
  const enableReminder = async () => {
    await notifications.enable();
    return readNotificationPreference() && (await hasWeatherNotificationPermission());
  };
  const save = async (assessment: ActivityAssessment) => {
    if (!model.owner) {
      setAccountOpen(true);
      return;
    }
    if (!selected || busy || loading) return;
    const latest = assessActivity({ ...input, now: Date.now(), start: assessment.start });
    if (['avoid', 'unknown'].includes(latest.status)) {
      setNotice('Giờ hoặc dự báo đã thay đổi. Cập nhật trước khi lưu.');
      return;
    }
    try {
      await model.save.mutateAsync({
        activity,
        latitude: selected.coordinates.latitude,
        longitude: selected.coordinates.longitude,
        location_label: (
          selected.label ??
          model.weather.data?.weather.location.name ??
          'Địa điểm đã chọn'
        ).slice(0, 100),
        time_zone: zone,
        starts_at: latest.start,
        ends_at: latest.end,
        policy_version: activityPolicyVersion(transport, preferences?.exposure),
        reasons: latest.reasons,
        preparation:
          latest.checklist.map((item) => item.label).join(' · ') ||
          'Kiểm tra điều kiện thực tế trước khi đi.',
        checked_items: [],
        reminder_enabled: remind,
        baseline_risks: latest.risks,
        baseline_status: latest.status,
      });
      setNotice(
        remind
          ? 'Đã lưu giờ phù hợp và bật nhắc trước 15 phút.'
          : 'Đã lưu giờ phù hợp. Có thể bật nhắc bên dưới.',
      );
    } catch (e) {
      setNotice(
        e && typeof e === 'object' && 'code' in e && e.code === '23505'
          ? 'Bạn đã lưu hoạt động tại giờ và địa điểm này.'
          : 'Chưa lưu được kế hoạch. Kiểm tra mạng và thử lại.',
      );
    }
  };
  const changeSaved: (id: string, change: PlanChange | 'delete') => Promise<void> = async (
    id,
    change,
  ) => {
    try {
      if (change !== 'delete' && change.reminder_enabled && !(await enableReminder())) {
        setNotice('Chưa có quyền gửi thông báo.');
        return;
      }
      await model.change.mutateAsync({ id, change });
      setNotice('Đã cập nhật giờ đã lưu.');
    } catch {
      setNotice('Chưa lưu được thay đổi. Thử lại khi có mạng.');
    }
  };
  return {
    planId,
    model,
    focused,
    chosenActivity,
    commute,
    departure,
    setDeparture,
    setActivity,
    activity,
    duration,
    durationText,
    setDurationText,
    dateValue,
    setDateText,
    selectionError,
    from,
    setFrom,
    to,
    setTo,
    transport,
    setTransport,
    accountOpen,
    setAccountOpen,
    remind,
    setRemind,
    locationOpen,
    setLocationOpen,
    notice,
    setNotice,
    now,
    zone,
    today,
    tomorrow,
    dates,
    day,
    selected,
    busy,
    loading,
    validRange,
    candidates,
    assessment,
    enableReminder,
    save,
    changeSaved,
  };
}

// plan-monitor

export function PlanMonitor() {
  const { state } = useAuth(),
    notifications = useNotifications(),
    client = useQueryClient();
  const owner = state.status === 'signed_in' ? state.user.id : undefined;
  const plans = useQuery({
    queryKey: ['activity-plans', owner ?? 'guest'],
    enabled: Boolean(owner),
    queryFn: () => listActivityPlans(owner),
  });
  const enabled = Boolean(owner) && notifications.state.status === 'enabled';
  useEffect(() => {
    if (state.status === 'loading' || notifications.state.status === 'loading') return;
    if (!enabled) {
      void clearPlanNotifications([]).catch(() => undefined);
      return;
    }
    if (!plans.data) return;
    let cancelled = false,
      busy = false;
    const run = async () => {
      if (busy || AppState.currentState !== 'active') return;
      busy = true;
      try {
        const upcoming = plans.data!.filter(
          (p) =>
            p.status === 'planned' && p.reminder_enabled && Date.parse(p.starts_at) > Date.now(),
        );
        await clearPlanNotifications(
          upcoming.map((p) => p.id),
          owner,
        );
        // Check the saved coordinates, not whichever location the user is viewing.
        for (const plan of upcoming) {
          if (cancelled) break;
          await syncPlanNotification(plan);
          if (Date.parse(plan.starts_at) - Date.now() > 48 * 60 * 60_000) continue;
          try {
            const location = {
              source: 'manual' as const,
              selectedAt: plan.created_at,
              label: plan.location_label,
              coordinates: { latitude: plan.latitude, longitude: plan.longitude },
            };
            const options = liveCurrentWeatherQueryOptions(location);
            const weather = await client.fetchQuery(options);
            const aqi = await client
              .fetchQuery({
                queryKey: ['planning-hourly-aqi', plan.latitude, plan.longitude],
                queryFn: ({ signal }) =>
                  fetchHourlyAirQuality(plan.latitude, plan.longitude, signal),
                staleTime: 10 * 60_000,
              })
              .catch(() => undefined);
            if (cancelled) break;
            const hours = createPlanningHours(weather.hourlyForecast, aqi);
            const fetchedAt = client.getQueryState(options.queryKey)?.dataUpdatedAt ?? 0;
            const input = {
              activity: plan.activity as Activity,
              ...activityPolicyContext(plan.policy_version),
              start: plan.starts_at,
              duration: Math.round(
                (Date.parse(plan.ends_at) - Date.parse(plan.starts_at)) / 60_000,
              ),
              hours,
              alerts: weather.weather.alerts,
              fetchedAt,
            };
            const assessment = assessActivity(input);
            const alternatives =
              plan.activity === 'commute'
                ? []
                : activityCandidates({
                    ...input,
                    date: localDate(plan.starts_at, plan.time_zone),
                    timeZone: plan.time_zone,
                    from: 6 * 60,
                    to: 22 * 60,
                  });
            await syncPlanNotification(
              plan,
              assessment,
              alternatives.find((a) => a.start !== plan.starts_at && a.status === 'suitable'),
            );
          } catch {
            /* Keep last schedule, never treat a failed forecast as favorable. */
          }
        }
      } catch {
        /* Retry on next foreground refresh. */
      } finally {
        busy = false;
      }
    };
    void run();
    const timer = setInterval(() => void run(), 5 * 60_000);
    const subscription = AppState.addEventListener('change', (value) => {
      if (value === 'active') void run();
    });
    return () => {
      cancelled = true;
      clearInterval(timer);
      subscription.remove();
    };
  }, [client, enabled, owner, plans.data, state.status, notifications.state.status]);
  return null;
}
