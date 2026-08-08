import type { WeatherCondition } from '@/features/weather/domain/weather-condition';

const WMO_CONDITION_BY_CODE: Readonly<Record<number, WeatherCondition>> = {
  0: 'clear',
  1: 'mostly_clear',
  2: 'partly_cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  56: 'freezing_rain',
  57: 'freezing_rain',
  61: 'light_rain',
  63: 'rain',
  65: 'heavy_rain',
  66: 'freezing_rain',
  67: 'freezing_rain',
  71: 'light_snow',
  73: 'snow',
  75: 'heavy_snow',
  77: 'light_snow',
  80: 'showers',
  81: 'showers',
  82: 'heavy_showers',
  85: 'snow_showers',
  86: 'snow_showers',
  95: 'thunderstorm',
  96: 'thunderstorm',
  99: 'severe_thunderstorm',
};

export function mapOpenMeteoWmoCondition(code: number): WeatherCondition {
  if (!Number.isInteger(code)) {
    return 'unknown';
  }

  return WMO_CONDITION_BY_CODE[code] ?? 'unknown';
}
