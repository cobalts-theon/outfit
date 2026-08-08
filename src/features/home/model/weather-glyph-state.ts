import type {
  CurrentWeather,
  MoonPhase,
} from '@/features/weather/domain/current-weather';
import type { WeatherCondition } from '@/features/weather/domain/weather-condition';

const cloudyConditions: ReadonlySet<WeatherCondition> = new Set([
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
  'tropical_storm',
  'hurricane',
  'tornado',
]);

const lowVisibilityConditions: ReadonlySet<WeatherCondition> = new Set([
  'mist',
  'fog',
  'haze',
  'smoke',
  'dust',
  'sandstorm',
]);

const stormConditions: ReadonlySet<WeatherCondition> = new Set([
  'thunderstorm',
  'thunderstorm_rain',
  'severe_thunderstorm',
  'tropical_storm',
  'hurricane',
  'tornado',
]);

const airQualityParticleCounts: Record<
  NonNullable<NonNullable<CurrentWeather['airQuality']>['category']>,
  number
> = {
  good: 2,
  moderate: 5,
  unhealthy_for_sensitive_groups: 8,
  unhealthy: 12,
  very_unhealthy: 16,
  hazardous: 18,
  unknown: 4,
};

export interface WeatherGlyphState {
  readonly hasCloud: boolean;
  readonly hasAtmosphere: boolean;
  readonly hasStorm: boolean;
  readonly hasPrecipitation: boolean;
  readonly moonPhase: MoonPhase | undefined;
  readonly hasVisibleMoon: boolean;
  readonly moonIsFull: boolean;
  readonly moonIsNew: boolean;
  readonly moonIsQuarter: boolean;
  readonly moonIsWaxing: boolean;
  readonly particleCount: number;
  readonly hasElevatedAqi: boolean;
  readonly windRotation: string;
  readonly windOpacity: number;
}

export function getWeatherGlyphState(weather: CurrentWeather): WeatherGlyphState {
  const moonPhase = weather.moon?.phase;
  const aqiCategory = weather.airQuality?.category;

  return {
    hasCloud: cloudyConditions.has(weather.condition),
    hasAtmosphere: lowVisibilityConditions.has(weather.condition),
    hasStorm: stormConditions.has(weather.condition),
    hasPrecipitation:
      weather.precipitation !== undefined && weather.precipitation.type !== 'none',
    moonPhase,
    hasVisibleMoon: !weather.daylight.isDay && moonPhase !== undefined,
    moonIsFull: moonPhase === 'full',
    moonIsNew: moonPhase === 'new',
    moonIsQuarter: moonPhase === 'first_quarter' || moonPhase === 'last_quarter',
    moonIsWaxing:
      moonPhase === 'waxing_crescent' ||
      moonPhase === 'first_quarter' ||
      moonPhase === 'waxing_gibbous',
    particleCount:
      aqiCategory === undefined ? 0 : (airQualityParticleCounts[aqiCategory] ?? 4),
    hasElevatedAqi:
      aqiCategory !== undefined && !['good', 'moderate', 'unknown'].includes(aqiCategory),
    windRotation: `${weather.wind.directionDegrees ?? 0}deg`,
    windOpacity: Math.min(0.88, 0.28 + weather.wind.speedMetersPerSecond / 30),
  };
}
