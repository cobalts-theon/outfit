/**
 * Tổng hợp gợi ý: kiểm tra đầu vào, gộp hành động trùng và xếp ưu tiên.
 * Chuyển kết quả thành hành động theo ngữ cảnh thời gian và sở thích.
 */
import type { Recommendation, RecommendationEvaluation, CurrentWeather, HourlyForecast, WeatherCondition } from '@/types/weather';

export * from '@/utils/recommendation-engine';

// daily-actions

export interface DailyAction {
  id: string;
  key: string;
  title: string;
  reason: string;
  detail?: string;
  urgent: boolean;
  actionable?: boolean;
  recommendation?: Recommendation;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

// Xác định ngày, giờ và buổi tại địa điểm.
export function actionContext(weather: CurrentWeather, now = Date.now()) {
  const zone = weather.location.timeZone;
  let formatter = formatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    if (formatters.size > 16) formatters.clear();
    formatters.set(zone, formatter);
  }
  const parts = formatter.formatToParts(now);
  // Lấy một thành phần thời gian đã định dạng.
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  const hour = Number(part('hour'));
  const period: 'night' | 'morning' | 'noon' | 'afternoon' | 'evening' =
    hour < 5 || hour >= 22
      ? 'night'
      : hour < 11
        ? 'morning'
        : hour < 14
          ? 'noon'
          : hour < 18
            ? 'afternoon'
            : 'evening';
  return {
    clock: `${part('hour')}:${part('minute')}`,
    date: `${part('year')}-${part('month')}-${part('day')}`,
    period,
    label: {
      night: 'ĐÊM',
      morning: 'BUỔI SÁNG',
      noon: 'BUỔI TRƯA',
      afternoon: 'BUỔI CHIỀU',
      evening: 'BUỔI TỐI',
    }[period],
  };
}

// Tạo mã hành động theo vị trí và thời gian.
export function dailyActionId(weather: CurrentWeather, location: string, key: string, now = Date.now()) {
  const { date, period } = actionContext(weather, now);
  return `${location}|${date}|${key === 'protect-laundry' ? 'day' : period}|${key}`;
}

const titles: Record<string, string> = {
  'protect-laundry': 'Thu đồ nếu bạn đang phơi',
  'rain-protection': 'Mang ô nếu sắp ra ngoài',
  'heat-hydration': 'Để nước uống gần chỗ ngồi',
  'sun-protection': 'Chuẩn bị mũ và đồ chống nắng',
  'sun-heat-protection': 'Tránh nắng, mang theo nước',
  'light-clothing': 'Chọn đồ nhẹ, thoáng',
  'warm-clothing': 'Khoác thêm áo ấm',
};

// Tạo hành động phù hợp ngữ cảnh hiện tại.
export function createDailyActions(weather: CurrentWeather, evaluation: RecommendationEvaluation, location: string, now = Date.now()): DailyAction[] {
  const { period, clock } = actionContext(weather, now);
  const daytime = weather.daylight.isDay && !['evening', 'night'].includes(period);
  const actions = evaluation.recommendations
    .filter((r) => !['protect-laundry', 'dry-laundry'].includes(r.actionKey) || daytime)
    .filter((r) => !(r.actionKey === 'outdoor-activity-window' && ['noon', 'night'].includes(period)))
    .map((r) => ({
      id: dailyActionId(weather, location, r.actionKey, now),
      key: r.actionKey,
      actionable: r.actionKey === 'rain-protection' && r.severity !== 'danger',
      recommendation: r,
      title:
        r.actionKey === 'outdoor-activity-window'
          ? {
              morning: 'Đi bộ nhẹ buổi sáng nếu bạn rảnh',
              afternoon: 'Có thể đi bộ nhẹ chiều nay',
              evening: 'Đi dạo ở nơi đủ sáng nếu bạn muốn',
              noon: '',
              night: '',
            }[period]
          : r.actionKey === 'heat-hydration' && period === 'night'
            ? 'Uống nước nếu khát, rồi tiếp tục nghỉ ngơi'
            : r.actionKey === 'indoor-comfort' && period === 'night'
              ? Math.max(weather.temperature.valueCelsius, weather.temperature.feelsLikeCelsius) >=
                28
                ? 'Nếu phòng bí nóng, làm mát chỗ ngủ'
                : 'Nếu phòng lạnh, giữ chỗ ngủ kín gió'
              : r.actionKey === 'damp-care' && period === 'night'
                ? 'Tránh để đồ ẩm trong chỗ ngủ'
                : ['indoor-comfort', 'damp-care', 'dry-air-care'].includes(r.actionKey)
                  ? r.title
                  : r.matchedRuleIds.includes('everyday-weather-clothing')
                    ? period === 'night'
                      ? 'Nghỉ ngơi với đồ thoáng, dễ chịu'
                      : 'Chọn đồ thoáng, dễ thêm hoặc bớt lớp'
                    : r.actionKey === 'warm-clothing' && period === 'night'
                      ? 'Giữ ấm cơ thể trong đêm'
                      : r.actionKey === 'sun-heat-protection' &&
                          ['evening', 'night'].includes(period)
                        ? 'Uống nước, nghỉ ở chỗ mát'
                        : (titles[r.actionKey] ?? r.action),
      reason: ['heat-hydration', 'indoor-comfort', 'damp-care', 'dry-air-care'].includes(r.actionKey)
        ? `${r.action} ${r.reason}`
        : period === 'night' && r.matchedRuleIds.includes('everyday-weather-clothing')
          ? `Đã ${clock} tại địa điểm đang xem. ${r.reason} Chọn đồ nghỉ thoáng, thêm hoặc bớt lớp theo cảm giác thực tế.`
          : r.reason.split(/(?<=[.!?])\s/)[0],
      detail: r.reason,
      urgent:
        r.severity === 'danger' ||
        (r.severity === 'warning' && !['protect-laundry', 'rain-protection'].includes(r.actionKey)),
    }));
  // Reuse an established environmental rule as evidence for the activity
  // decision; do not manufacture a favorable outdoor window from missing data.
  const constraint = evaluation.recommendations.find((r) =>
    ['weather-shelter', 'air-quality-exposure', 'sun-heat-protection', 'rain-protection'].includes(r.actionKey),
  );
  if (
    constraint &&
    period !== 'night' &&
    !actions.some((a) => a.key === 'outdoor-activity-window')
  ) {
    const title =
      constraint.actionKey === 'rain-protection'
        ? 'Ưu tiên vận động ở chỗ có mái che'
        : 'Tạm chuyển việc vận động vào trong nhà';
    actions.push({
      id: dailyActionId(weather, location, 'outdoor-adjustment', now),
      key: 'outdoor-adjustment',
      actionable: false,
      urgent: false,
      title,
      reason: constraint.reason,
      detail: constraint.reason,
      recommendation: { ...constraint, actionKey: 'outdoor-adjustment', title, action: title, group: 'outdoor' },
    });
  }
  return actions.sort(compareDailyActions);
}

/** Safety and personal wellbeing precede optional household chores. */
/** Keep a compact preview while never collapsing an environmental warning. */
// Chọn dòng xem trước, giữ mọi cảnh báo.
export function visibleDailyActions(actions: readonly DailyAction[], expanded = false) {
  // Nhận diện hành động tùy chọn.
  const optional = (action: DailyAction) =>
    !action.urgent &&
    !['warning', 'danger'].includes(action.recommendation?.severity ?? '') &&
    (action.key.startsWith('outdoor-') || action.key.includes('laundry'));
  const ordered = [...actions.filter((action) => !optional(action)), ...actions.filter(optional)];
  return expanded
    ? ordered
    : ordered.filter(
        (action, index) =>
          index < 3 ||
          action.urgent ||
          ['warning', 'danger'].includes(action.recommendation?.severity ?? ''),
      );
}

// Tính thứ tự ưu tiên của hành động.
export function dailyActionRank(action: DailyAction): number {
  if (action.urgent) return 1000 + (action.recommendation?.priority ?? 0);
  if (action.key.includes('laundry')) return 0;
  if (
    ['air-quality-exposure', 'sun-heat-protection', 'sun-protection', 'heat-hydration', 'indoor-comfort', 'damp-care', 'dry-air-care', 'weather-shelter'].includes(action.key)
  )
    return 300;
  if (action.key === 'rain-protection') return 250;
  return 100;
}

// So sánh thứ tự hai hành động.
export function compareDailyActions(a: DailyAction, b: DailyAction): number {
  return dailyActionRank(b) - dailyActionRank(a);
}

export interface UpcomingAction {
  at: string;
  title: string;
  reason: string;
}

/** Only changes supported by fresh, upcoming forecast samples; never infer a safe window. */
// Tạo lời nhắc theo thay đổi dự báo sắp tới.
export function createUpcomingActions(weather: CurrentWeather, forecast: HourlyForecast | undefined, fetchedAt: number, now = Date.now()): UpcomingAction[] {
  if (!forecast || now - fetchedAt > 30 * 60_000) return [];
  const entries = forecast.entries
    .filter((entry) => {
      const at = Date.parse(entry.forecastAt);
      return at > now && at <= now + 6 * 60 * 60_000;
    })
    .sort((a, b) => Date.parse(a.forecastAt) - Date.parse(b.forecastAt));
  const rain = entries.find((entry) => (entry.precipitation?.probability ?? 0) >= 0.6);
  if (!rain) return [];
  const rainingNow =
    ['drizzle', 'light_rain', 'rain', 'heavy_rain', 'showers', 'heavy_showers', 'thunderstorm_rain'].includes(weather.condition) ||
    (weather.precipitation !== undefined &&
      ['rain', 'drizzle'].includes(weather.precipitation.type));
  return [
    {
      at: actionContext(weather, Date.parse(rain.forecastAt)).clock,
      title: rainingNow
        ? 'Nếu định ra ngoài, chuẩn bị phương án tránh mưa'
        : 'Sắp xếp việc di chuyển trước cơn mưa',
      reason: `Dự báo mưa ${Math.round(rain.precipitation!.probability! * 100)}% lúc ${actionContext(weather, Date.parse(rain.forecastAt)).clock}. ${rainingNow ? 'Mang ô hoặc áo mưa; cân nhắc dời việc ngoài trời không gấp.' : 'Mang theo áo mưa; cân nhắc lùi việc ngoài trời không gấp.'}`,
    },
  ];
}

// lifestyle-preferences

export const activityOptions = [
  { key: 'wellness', label: 'Sức khỏe & nghỉ ngơi' },
  { key: 'commute', label: 'Đi làm / đi học' },
  { key: 'exercise', label: 'Đi bộ / tập ngoài trời' },
  { key: 'clothing', label: 'Trang phục hằng ngày' },
  { key: 'laundry', label: 'Giặt phơi · tùy nhu cầu' },
] as const;

export const periodOptions = [
  { key: 'morning', label: 'Sáng · 05–11h' },
  { key: 'noon', label: 'Trưa · 11–14h' },
  { key: 'afternoon', label: 'Chiều · 14–18h' },
  { key: 'evening', label: 'Tối · 18–24h' },
] as const;

export type Activity = (typeof activityOptions)[number]['key'];

export type Period = (typeof periodOptions)[number]['key'];

export interface LifestylePreferences {
  version: 1;
  activities: Activity[];
  periods: Period[];
  availability?: { start: number; end: number };
  transport?: 'walk' | 'bike' | 'motorbike' | 'covered' | 'none';
  exposure?: 'short' | 'long';
}

// User-editable preferences are never authorization claims.
// Kiểm tra và đọc sở thích sinh hoạt.
export function parseLifestylePreferences(value: unknown): LifestylePreferences | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const p = value as Partial<LifestylePreferences>;
  if (
    p.version !== 1 ||
    !Array.isArray(p.activities) ||
    !Array.isArray(p.periods) ||
    !p.activities.length ||
    !p.periods.length ||
    !p.activities.every((k) => activityOptions.some((o) => o.key === k)) ||
    !p.periods.every((k) => periodOptions.some((o) => o.key === k))
  )
    return undefined;
  if (
    p.availability !== undefined &&
    (!p.availability ||
      !Number.isInteger(p.availability.start) ||
      !Number.isInteger(p.availability.end) ||
      p.availability.start < 0 ||
      p.availability.start >= 1440 ||
      p.availability.end < 0 ||
      p.availability.end >= 1440 ||
      p.availability.start === p.availability.end)
  )
    return undefined;
  if (
    p.transport !== undefined &&
    !['walk', 'bike', 'motorbike', 'covered', 'none'].includes(p.transport)
  )
    return undefined;
  if (p.exposure !== undefined && !['short', 'long'].includes(p.exposure)) return undefined;
  return {
    ...(p.availability ? { availability: p.availability } : {}),
    ...(p.transport ? { transport: p.transport } : {}),
    ...(p.exposure ? { exposure: p.exposure } : {}),
    version: 1,
    activities: [...new Set(p.activities)],
    periods: [...new Set(p.periods)],
  };
}

// Điều chỉnh hành động theo sở thích đã lưu.
export function personalizeDailyActions(actions: DailyAction[], preferences: LifestylePreferences | undefined, period: string, clock?: string): DailyAction[] {
  if (!preferences) return actions;
  const minute =
    clock === undefined ? undefined : Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3));
  const activePeriod =
    preferences.availability && minute !== undefined
      ? isInAvailability(minute, preferences.availability)
      : preferences.periods.some((p) => p === period);
  // Xác định nhóm sinh hoạt của hành động.
  const activityFor = (key: string): Activity | undefined => {
    if (key.includes('laundry')) return 'laundry';
    if (
      ['sun-heat-protection', 'sun-protection', 'heat-hydration', 'indoor-comfort', 'damp-care', 'dry-air-care', 'air-quality-exposure'].includes(key)
    )
      return 'wellness';
    if (key.startsWith('outdoor-')) return 'exercise';
    if (key.includes('clothing')) return 'clothing';
    if (key === 'rain-protection') return 'commute';
    return undefined;
  };
  // Kiểm tra hành động hợp sở thích đã chọn.
  const relevant = (a: DailyAction) => {
    const activity = activityFor(a.key);
    return activity !== undefined && preferences.activities.includes(activity);
  };
  return actions
    .filter((a) => {
      if (a.key.includes('laundry')) return relevant(a) && !['evening', 'night'].includes(period);
      if (
        a.urgent ||
        a.recommendation?.severity === 'danger' ||
        a.recommendation?.severity === 'warning'
      )
        return true;
      if (a.key.startsWith('outdoor-')) return relevant(a) && activePeriod;
      return true;
    })
    .map((a) => {
      if (a.urgent) return a;
      if (
        a.key === 'rain-protection' &&
        preferences.transport &&
        preferences.transport !== 'none'
      ) {
        const title = {
          walk: 'Mang ô, chọn đường đi ít ngập',
          bike: 'Mang áo mưa, đi chậm khi đường trơn',
          motorbike: 'Chuẩn bị áo mưa, tránh đường ngập',
          covered: 'Mang ô cho đoạn đi bộ từ xe đến nơi',
        }[preferences.transport];
        return { ...a, title: period === 'night' ? `Nếu còn phải ra ngoài: ${title.toLowerCase()}` : title };
      }
      if (
        preferences.exposure === 'long' &&
        ['sun-heat-protection', 'heat-hydration'].includes(a.key)
      ) {
        return {
          ...a,
          title:
            period === 'night'
              ? 'Nghỉ ở nơi mát, tránh để cơ thể quá nóng'
              : 'Chia thời gian ngoài trời, nghỉ ở chỗ mát',
        };
      }
      return a;
    })
    .sort(
      (a, b) =>
        dailyActionRank(b) - dailyActionRank(a) ||
        (activePeriod ? Number(relevant(b)) - Number(relevant(a)) : 0),
    );
}

// Kiểm tra thời điểm nằm trong giờ rảnh.
export function isInAvailability(minute: number, range: { start: number; end: number }): boolean {
  return range.start < range.end
    ? minute >= range.start && minute < range.end
    : minute >= range.start || minute < range.end;
}

// recommendation-notification-plan

const RAIN_PROBABILITY_THRESHOLD = 0.6;

const RAIN_WARNING_LEAD_MS = 30 * 60 * 1000;

const IMMEDIATE_DELAY_MS = 2 * 1000;

export const RECOMMENDATION_NOTIFICATION_SLOTS = ['rain', 'risk', 'action'] as const;

export type RecommendationNotificationSlot = (typeof RECOMMENDATION_NOTIFICATION_SLOTS)[number];

const rainConditions = new Set<WeatherCondition>(['drizzle', 'light_rain', 'rain', 'heavy_rain', 'showers', 'heavy_showers', 'thunderstorm_rain']);

export interface RecommendationNotificationEvent {
  readonly slot: RecommendationNotificationSlot;
  readonly signature: string;
  readonly title: string;
  readonly body: string;
  readonly triggerAt: number;
  readonly data: Readonly<Record<string, string>>;
}

interface RecommendationNotificationPlanInput {
  readonly currentWeather: CurrentWeather;
  readonly evaluation: RecommendationEvaluation;
  readonly hourlyForecast?: HourlyForecast;
  readonly locationIdentity: string;
  readonly locationLabel: string;
  readonly now?: number;
}

// Kiểm tra mưa hiện tại để lập thông báo.
function isActiveRain(current: CurrentWeather) {
  return (
    rainConditions.has(current.condition) ||
    current.precipitation?.type === 'rain' ||
    current.precipitation?.type === 'drizzle'
  );
}

// Tìm mốc sắp mưa đầu tiên.
function selectFirstNearTermRain(current: CurrentWeather, hourly: HourlyForecast | undefined, now: number) {
  if (hourly === undefined) return undefined;
  const observedAt = Date.parse(current.observedAt);

  return hourly.entries
    .filter((entry) => Date.parse(entry.forecastAt) >= observedAt)
    .slice(0, 3)
    .find(
      (entry) =>
        Date.parse(entry.forecastAt) > now &&
        (entry.precipitation?.probability ?? 0) >= RAIN_PROBABILITY_THRESHOLD,
    );
}

// Rút ngắn tên địa điểm cho thông báo.
function compactLocationLabel(value: string) {
  const label = value.trim();
  return label.length > 32 ? `${label.slice(0, 31).trimEnd()}…` : label;
}

// Tạo lịch thông báo từ dự báo và lời khuyên.
export function createRecommendationNotificationPlan({
  currentWeather, evaluation, hourlyForecast, locationIdentity, locationLabel, now = Date.now(),
}: RecommendationNotificationPlanInput): readonly RecommendationNotificationEvent[] {
  const events: RecommendationNotificationEvent[] = [];
  const label = compactLocationLabel(locationLabel);
  const activeRain = isActiveRain(currentWeather);
  const nearTermRain = selectFirstNearTermRain(currentWeather, hourlyForecast, now);

  if (activeRain) {
    const observationBucket = Math.floor(Date.parse(currentWeather.observedAt) / (3 * 60 * 60 * 1000));
    events.push({
      slot: 'rain',
      signature: `rain-now-v2:${locationIdentity}:${observationBucket}`,
      title: `Mưa tại ${label}`,
      body: 'Mang ô hoặc áo mưa nếu sắp ra ngoài; chọn đường đi tránh ngập.',
      triggerAt: now + IMMEDIATE_DELAY_MS,
      data: {
        type: 'weather_recommendation',
        actionKey: 'rain-protection',
        locationIdentity,
        url: 'weather:///',
      },
    });
  } else if (nearTermRain !== undefined) {
    const forecastAt = Date.parse(nearTermRain.forecastAt);
    const probability = Math.round((nearTermRain.precipitation?.probability ?? 0) * 100);
    events.push({
      slot: 'rain',
      signature: `rain-next-v2:${locationIdentity}:${nearTermRain.forecastAt}:${probability}`,
      title: `Mưa có thể đến gần ${label}`,
      body: `Dự báo mưa lúc ${actionContext(currentWeather, forecastAt).clock} (${probability}%). Chuẩn bị áo mưa và sắp xếp lại việc ngoài trời nếu cần.`,
      triggerAt: Math.max(now + IMMEDIATE_DELAY_MS, forecastAt - RAIN_WARNING_LEAD_MS),
      data: {
        type: 'weather_recommendation',
        actionKey: 'rain-protection',
        locationIdentity,
        url: 'weather:///',
      },
    });
  }

  const risk = evaluation.recommendations.find(
    (recommendation) =>
      (recommendation.severity === 'warning' || recommendation.severity === 'danger') &&
      recommendation.actionKey !== 'rain-protection' &&
      recommendation.actionKey !== 'protect-laundry',
  );

  if (risk !== undefined) {
    const observationDay = currentWeather.observedAt.slice(0, 10);
    events.push({
      slot: 'risk',
      signature: `risk:${locationIdentity}:${observationDay}:${risk.actionKey}:${risk.severity}:${risk.title}`,
      title: `${risk.title} · ${label}`,
      body: risk.action,
      triggerAt: now + IMMEDIATE_DELAY_MS,
      data: {
        type: 'weather_recommendation',
        actionKey: risk.actionKey,
        locationIdentity,
        url: 'weather:///',
      },
    });
  }

  const primary = evaluation.primary;
  const rainAlreadyCovered =
    primary?.actionKey === 'rain-protection' || primary?.actionKey === 'protect-laundry';
  if (primary?.severity === 'attention' && !rainAlreadyCovered) {
    const observationDay = currentWeather.observedAt.slice(0, 10);
    events.push({
      slot: 'action',
      signature: `action:${locationIdentity}:${observationDay}:${primary.actionKey}:${primary.title}`,
      title: `Nên làm ngay · ${label}`,
      body: primary.action,
      triggerAt: now + IMMEDIATE_DELAY_MS,
      data: {
        type: 'weather_recommendation',
        actionKey: primary.actionKey,
        locationIdentity,
        url: 'weather:///',
      },
    });
  }

  return events;
}
