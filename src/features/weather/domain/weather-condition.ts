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

export function isWeatherCondition(value: unknown): value is WeatherCondition {
  return typeof value === 'string' && weatherConditionSet.has(value);
}
