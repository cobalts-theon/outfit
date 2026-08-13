import type { HourlyForecast } from '@/features/forecast/domain/hourly-forecast';
import type { CurrentWeather } from '@/features/weather/domain/current-weather';

export const RECOMMENDATION_GROUPS = [
  'weather_alert',
  'wellness',
  'outdoor',
  'clothing',
] as const;
export type RecommendationGroup = (typeof RECOMMENDATION_GROUPS)[number];

export const RECOMMENDATION_SEVERITIES = [
  'info',
  'attention',
  'warning',
  'danger',
] as const;
export type RecommendationSeverity = (typeof RECOMMENDATION_SEVERITIES)[number];

export const RECOMMENDATION_INPUT_DIMENSIONS = [
  'current_weather',
  'uv',
  'us_aqi',
  'precipitation',
  'hourly_forecast',
] as const;
export type RecommendationInputDimension =
  (typeof RECOMMENDATION_INPUT_DIMENSIONS)[number];

export interface RecommendationTrigger {
  readonly dimension:
    | 'alert'
    | 'condition'
    | 'temperature'
    | 'precipitation'
    | 'uv'
    | 'us_aqi';
  readonly label: string;
  readonly value?: number | string;
  readonly unit?: string;
}

export interface Recommendation {
  readonly id: string;
  readonly matchedRuleIds: readonly string[];
  readonly actionKey: string;
  readonly group: RecommendationGroup;
  readonly severity: RecommendationSeverity;
  readonly priority: number;
  readonly title: string;
  readonly message: string;
  readonly reason: string;
  readonly action: string;
  readonly triggers: readonly RecommendationTrigger[];
}

export interface RecommendationEvaluation {
  readonly status: 'ready' | 'limited' | 'unavailable';
  readonly recommendations: readonly Recommendation[];
  readonly primary?: Recommendation;
  readonly missingDimensions: readonly RecommendationInputDimension[];
}

export interface RecommendationEngineInput {
  readonly currentWeather?: CurrentWeather;
  readonly hourlyForecast?: HourlyForecast;
  readonly maxRecommendations?: number;
}

