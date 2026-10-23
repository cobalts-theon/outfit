/**
 * Mô hình dữ liệu nội bộ cho thời tiết, dự báo và khuyến nghị.
 * Service, bộ quy tắc và UI cùng sử dụng các hợp đồng kiểu dữ liệu này.
 */
// weather

export const WEATHER_CONDITIONS = [
  'clear',
  'mostly_clear',
  'partly_cloudy',
  'mostly_cloudy',
  'cloudy',
  'overcast',
  'drizzle',
  'light_rain',
  'rain',
  'heavy_rain',
  'showers',
  'heavy_showers',
  'freezing_rain',
  'thunderstorm',
  'thunderstorm_rain',
  'severe_thunderstorm',
  'hail',
  'sleet',
  'light_snow',
  'snow',
  'heavy_snow',
  'snow_showers',
  'blizzard',
  'mist',
  'fog',
  'haze',
  'smoke',
  'dust',
  'sandstorm',
  'tropical_storm',
  'hurricane',
  'tornado',
  'unknown',
] as const;

export type WeatherCondition = (typeof WEATHER_CONDITIONS)[number];

const weatherConditionSet: ReadonlySet<string> = new Set(WEATHER_CONDITIONS);

// Kiểm tra tên điều kiện thời tiết hợp lệ.
export function isWeatherCondition(value: unknown): value is WeatherCondition {
  return typeof value === 'string' && weatherConditionSet.has(value);
}

/** ISO 8601 timestamp with a UTC marker or explicit numeric offset. */
export type ZonedDateTimeString = string;

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface WeatherLocation {
  readonly name: string;
  readonly region?: string;
  readonly countryCode?: string;
  readonly timeZone: string;
  readonly coordinates?: Coordinates;
}

export const DAY_PHASES = ['dawn', 'day', 'sunset', 'twilight', 'night'] as const;

export type DayPhase = (typeof DAY_PHASES)[number];

export type DaylightState =
  | { readonly phase: 'day'; readonly isDay: true }
  | { readonly phase: 'night'; readonly isDay: false }
  | { readonly phase: 'dawn' | 'sunset' | 'twilight'; readonly isDay: boolean };

export interface TemperatureData {
  readonly valueCelsius: number;
  readonly feelsLikeCelsius: number;
  readonly minCelsius?: number;
  readonly maxCelsius?: number;
  readonly dewPointCelsius?: number;
}

export const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

export type WindDirection = (typeof WIND_DIRECTIONS)[number];

export interface Wind {
  readonly speedMetersPerSecond: number;
  readonly gustMetersPerSecond?: number;
  readonly directionDegrees?: number;
  readonly direction?: WindDirection;
}

export const PRECIPITATION_TYPES = ['none', 'drizzle', 'rain', 'freezing_rain', 'sleet', 'snow', 'hail'] as const;

export type PrecipitationType = (typeof PRECIPITATION_TYPES)[number];

export const PRECIPITATION_INTENSITIES = ['none', 'light', 'moderate', 'heavy', 'extreme'] as const;

export type PrecipitationIntensity = (typeof PRECIPITATION_INTENSITIES)[number];

export interface Precipitation {
  readonly type: PrecipitationType;
  readonly probability?: number;
  readonly amountMillimeters?: number;
  readonly intensity?: PrecipitationIntensity;
}

export const UV_CATEGORIES = ['low', 'moderate', 'high', 'very_high', 'extreme'] as const;

export type UVCategory = (typeof UV_CATEGORIES)[number];

export interface UVReference {
  readonly index: number;
  readonly category?: UVCategory;
  readonly maxToday?: number;
}

export const AIR_QUALITY_CATEGORIES = ['good', 'moderate', 'unhealthy_for_sensitive_groups', 'unhealthy', 'very_unhealthy', 'hazardous', 'unknown'] as const;

export type AirQualityCategory = (typeof AIR_QUALITY_CATEGORIES)[number];

export interface PollutantConcentrations {
  readonly pm25MicrogramsPerCubicMeter?: number;
  readonly pm10MicrogramsPerCubicMeter?: number;
  readonly o3MicrogramsPerCubicMeter?: number;
  readonly no2MicrogramsPerCubicMeter?: number;
  readonly so2MicrogramsPerCubicMeter?: number;
  readonly coMicrogramsPerCubicMeter?: number;
}

export interface AirQualityReference {
  readonly index: number;
  /** Identifies the reported scale without selecting a project-wide AQI standard. */
  readonly scale?: string;
  readonly category?: AirQualityCategory;
  readonly pollutants?: PollutantConcentrations;
}

export interface SunData {
  readonly sunrise: ZonedDateTimeString;
  readonly sunset: ZonedDateTimeString;
}

export const MOON_PHASES = ['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full', 'waning_gibbous', 'last_quarter', 'waning_crescent'] as const;

export type MoonPhase = (typeof MOON_PHASES)[number];

export interface MoonData {
  readonly phase: MoonPhase;
  readonly illumination?: number;
  readonly moonrise?: ZonedDateTimeString;
  readonly moonset?: ZonedDateTimeString;
}

export const WEATHER_ALERT_SEVERITIES = ['info', 'watch', 'warning', 'severe', 'extreme'] as const;

export type WeatherAlertSeverity = (typeof WEATHER_ALERT_SEVERITIES)[number];

export interface WeatherAlert {
  readonly id: string;
  readonly type: string;
  readonly severity: WeatherAlertSeverity;
  readonly title: string;
  readonly description?: string;
  readonly startsAt?: ZonedDateTimeString;
  readonly endsAt?: ZonedDateTimeString;
  readonly source?: string;
}

export interface CurrentWeather {
  readonly observedAt: ZonedDateTimeString;
  readonly location: WeatherLocation;

  readonly condition: WeatherCondition;
  readonly daylight: DaylightState;

  readonly temperature: TemperatureData;
  readonly humidityPercent: number;
  readonly pressureHectopascals?: number;
  readonly visibilityMeters?: number;
  readonly cloudCoverPercent?: number;

  readonly wind: Wind;
  /** Undefined means unavailable; type `none` means explicitly reported as dry. */
  readonly precipitation?: Precipitation;

  readonly uv?: UVReference;
  readonly airQuality?: AirQualityReference;
  readonly sun?: SunData;
  readonly moon?: MoonData;
  /** Undefined means unavailable; an empty array means explicitly no active alerts. */
  readonly alerts?: readonly WeatherAlert[];
}

/** A provider-independent forecast for one exact hourly timestamp. */
export interface HourlyForecastEntry {
  readonly forecastAt: ZonedDateTimeString;
  readonly condition: WeatherCondition;
  readonly daylight: DaylightState;
  readonly temperatureCelsius: number;
  readonly apparentTemperatureCelsius?: number;
  readonly precipitation?: Precipitation;
  readonly wind?: Wind;
  readonly uv?: UVReference;
}

/**
 * Ordered hourly forecast collection. Timestamps remain absolute ISO instants;
 * `location.timeZone` is the IANA zone used for local presentation.
 */
export interface HourlyForecast {
  readonly location: WeatherLocation;
  readonly entries: readonly HourlyForecastEntry[];
}

/** A provider-independent forecast for one local calendar date. */
export interface DailyForecastEntry {
  readonly forecastDate: string;
  readonly condition: WeatherCondition;
  readonly minimumTemperatureCelsius: number;
  readonly maximumTemperatureCelsius: number;
  readonly precipitation?: Precipitation;
  readonly uv?: UVReference;
  readonly sun?: SunData;
  readonly moon?: MoonData;
}

/** Ordered daily forecast collection in the location's IANA timezone. */
export interface DailyForecast {
  readonly location: WeatherLocation;
  readonly entries: readonly DailyForecastEntry[];
}

// recommendation

export const RECOMMENDATION_GROUPS = ['weather_alert', 'wellness', 'outdoor', 'clothing'] as const;

export type RecommendationGroup = (typeof RECOMMENDATION_GROUPS)[number];

export const RECOMMENDATION_SEVERITIES = ['info', 'attention', 'warning', 'danger'] as const;

export type RecommendationSeverity = (typeof RECOMMENDATION_SEVERITIES)[number];

export const RECOMMENDATION_INPUT_DIMENSIONS = ['current_weather', 'uv', 'us_aqi', 'precipitation', 'hourly_forecast'] as const;

export type RecommendationInputDimension = (typeof RECOMMENDATION_INPUT_DIMENSIONS)[number];

export interface RecommendationTrigger {
  readonly dimension:
    | 'alert'
    | 'condition'
    | 'temperature'
    | 'humidity'
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
