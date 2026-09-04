import type { WeatherCondition } from '@/features/weather/domain/weather-condition';

export type WeatherIconKey =
  | 'sunny'
  | 'night'
  | 'partly_cloudy_day'
  | 'partly_cloudy_night'
  | 'cloudy'
  | 'rain_light'
  | 'rain'
  | 'rain_heavy'
  | 'thunder'
  | 'snow_light'
  | 'snow'
  | 'snow_heavy';

export function getWeatherIconKey(
  condition: WeatherCondition,
  isDay: boolean,
): WeatherIconKey {
  switch (condition) {
    case 'clear':
      return isDay ? 'sunny' : 'night';
    case 'mostly_clear':
    case 'partly_cloudy':
      return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
    case 'mostly_cloudy':
    case 'cloudy':
    case 'overcast':
    case 'mist':
    case 'fog':
    case 'haze':
    case 'smoke':
    case 'dust':
      return 'cloudy';
    case 'drizzle':
    case 'light_rain':
      return 'rain_light';
    case 'rain':
    case 'showers':
    case 'freezing_rain':
      return 'rain';
    case 'heavy_rain':
    case 'heavy_showers':
      return 'rain_heavy';
    case 'thunderstorm':
    case 'thunderstorm_rain':
    case 'severe_thunderstorm':
    case 'hail':
    case 'sandstorm':
    case 'tropical_storm':
    case 'hurricane':
    case 'tornado':
      return 'thunder';
    case 'sleet':
    case 'light_snow':
      return 'snow_light';
    case 'snow':
    case 'snow_showers':
      return 'snow';
    case 'heavy_snow':
    case 'blizzard':
      return 'snow_heavy';
    case 'unknown':
      return 'cloudy';
  }
}
