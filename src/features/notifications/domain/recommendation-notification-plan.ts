import type { HourlyForecast } from '@/features/forecast/domain/hourly-forecast';
import type { RecommendationEvaluation } from '@/features/recommendations/domain/recommendation';
import type { CurrentWeather } from '@/features/weather/domain/current-weather';
import type { WeatherCondition } from '@/features/weather/domain/weather-condition';

const RAIN_PROBABILITY_THRESHOLD = 0.6;
const RAIN_WARNING_LEAD_MS = 30 * 60 * 1000;
const IMMEDIATE_DELAY_MS = 2 * 1000;

export const RECOMMENDATION_NOTIFICATION_SLOTS = ['rain', 'risk', 'action'] as const;
export type RecommendationNotificationSlot =
  (typeof RECOMMENDATION_NOTIFICATION_SLOTS)[number];

const rainConditions = new Set<WeatherCondition>([
  'drizzle',
  'light_rain',
  'rain',
  'heavy_rain',
  'showers',
  'heavy_showers',
  'thunderstorm_rain',
]);

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

function isActiveRain(current: CurrentWeather) {
  return (
    rainConditions.has(current.condition) ||
    current.precipitation?.type === 'rain' ||
    current.precipitation?.type === 'drizzle'
  );
}

function selectFirstNearTermRain(
  current: CurrentWeather,
  hourly: HourlyForecast | undefined,
  now: number,
) {
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

function compactLocationLabel(value: string) {
  const label = value.trim();
  return label.length > 32 ? `${label.slice(0, 31).trimEnd()}…` : label;
}

export function createRecommendationNotificationPlan({
  currentWeather,
  evaluation,
  hourlyForecast,
  locationIdentity,
  locationLabel,
  now = Date.now(),
}: RecommendationNotificationPlanInput): readonly RecommendationNotificationEvent[] {
  const events: RecommendationNotificationEvent[] = [];
  const label = compactLocationLabel(locationLabel);
  const activeRain = isActiveRain(currentWeather);
  const nearTermRain = selectFirstNearTermRain(currentWeather, hourlyForecast, now);

  if (activeRain) {
    const observationBucket = Math.floor(Date.parse(currentWeather.observedAt) / (3 * 60 * 60 * 1000));
    events.push({
      slot: 'rain',
      signature: `rain-now:${locationIdentity}:${observationBucket}`,
      title: `Mưa tại ${label}`,
      body: 'Thu đồ đang phơi vào chỗ có mái che; mang ô hoặc áo mưa nếu sắp ra ngoài.',
      triggerAt: now + IMMEDIATE_DELAY_MS,
      data: {
        type: 'weather_recommendation',
        actionKey: 'protect-laundry',
        locationIdentity,
        url: 'weather:///',
      },
    });
  } else if (nearTermRain !== undefined) {
    const forecastAt = Date.parse(nearTermRain.forecastAt);
    const probability = Math.round((nearTermRain.precipitation?.probability ?? 0) * 100);
    events.push({
      slot: 'rain',
      signature: `rain-next:${locationIdentity}:${nearTermRain.forecastAt}:${probability}`,
      title: `Mưa có thể đến gần ${label}`,
      body: `Khả năng mưa ${probability}%. Thu đồ đang phơi sớm và chuẩn bị ô hoặc áo mưa.`,
      triggerAt: Math.max(now + IMMEDIATE_DELAY_MS, forecastAt - RAIN_WARNING_LEAD_MS),
      data: {
        type: 'weather_recommendation',
        actionKey: 'protect-laundry',
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
