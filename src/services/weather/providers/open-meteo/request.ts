export const OPEN_METEO_FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
export const OPEN_METEO_AIR_QUALITY_ENDPOINT =
  'https://air-quality-api.open-meteo.com/v1/air-quality';

export const OPEN_METEO_CURRENT_VARIABLES = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'rain',
  'showers',
  'snowfall',
  'weather_code',
  'cloud_cover',
  'visibility',
  'pressure_msl',
  'surface_pressure',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
] as const;

export const OPEN_METEO_HOURLY_VARIABLES = [
  'temperature_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'rain',
  'showers',
  'snowfall',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'uv_index',
  'is_day',
] as const;

export const OPEN_METEO_DAILY_VARIABLES = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'uv_index_max',
  'sunrise',
  'sunset',
  'moonrise',
  'moonset',
  'moon_phase',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'wind_direction_10m_dominant',
] as const;

/** Minimal daily enrichment required by the live CurrentWeather slice. */
export const OPEN_METEO_CURRENT_WEATHER_DAILY_VARIABLES = [
  'sunrise',
  'sunset',
  'moonrise',
  'moonset',
  'moon_phase',
] as const;

export const OPEN_METEO_AIR_QUALITY_VARIABLES = [
  'pm2_5',
  'pm10',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'ozone',
  'european_aqi',
  'us_aqi',
  'uv_index',
] as const;

export interface OpenMeteoRequestCoordinates {
  readonly latitude: number;
  readonly longitude: number;
}

function assertCoordinates(coordinates: OpenMeteoRequestCoordinates) {
  if (
    !Number.isFinite(coordinates.latitude) ||
    coordinates.latitude < -90 ||
    coordinates.latitude > 90 ||
    !Number.isFinite(coordinates.longitude) ||
    coordinates.longitude < -180 ||
    coordinates.longitude > 180
  ) {
    throw new RangeError('Open-Meteo coordinates must be valid WGS84 values.');
  }
}

function buildUrl(endpoint: string, parameters: Readonly<Record<string, string | number>>) {
  const query = Object.entries(parameters)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `${endpoint}?${query}`;
}

export function buildOpenMeteoForecastUrl(coordinates: OpenMeteoRequestCoordinates) {
  assertCoordinates(coordinates);

  return buildUrl(OPEN_METEO_FORECAST_ENDPOINT, {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    current: OPEN_METEO_CURRENT_VARIABLES.join(','),
    hourly: OPEN_METEO_HOURLY_VARIABLES.join(','),
    daily: OPEN_METEO_DAILY_VARIABLES.join(','),
    timezone: 'auto',
    timeformat: 'unixtime',
    temperature_unit: 'celsius',
    wind_speed_unit: 'ms',
    precipitation_unit: 'mm',
  });
}

export function buildOpenMeteoCurrentWeatherForecastUrl(
  coordinates: OpenMeteoRequestCoordinates,
) {
  assertCoordinates(coordinates);

  return buildUrl(OPEN_METEO_FORECAST_ENDPOINT, {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    current: OPEN_METEO_CURRENT_VARIABLES.join(','),
    daily: OPEN_METEO_CURRENT_WEATHER_DAILY_VARIABLES.join(','),
    timezone: 'auto',
    timeformat: 'unixtime',
    temperature_unit: 'celsius',
    wind_speed_unit: 'ms',
    precipitation_unit: 'mm',
  });
}

/** One Forecast API request for live current, hourly, and daily forecast slices. */
export function buildOpenMeteoLiveWeatherForecastUrl(
  coordinates: OpenMeteoRequestCoordinates,
) {
  assertCoordinates(coordinates);

  return buildUrl(OPEN_METEO_FORECAST_ENDPOINT, {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    current: OPEN_METEO_CURRENT_VARIABLES.join(','),
    hourly: OPEN_METEO_HOURLY_VARIABLES.join(','),
    daily: OPEN_METEO_DAILY_VARIABLES.join(','),
    timezone: 'auto',
    timeformat: 'unixtime',
    temperature_unit: 'celsius',
    wind_speed_unit: 'ms',
    precipitation_unit: 'mm',
  });
}

export function buildOpenMeteoAirQualityUrl(coordinates: OpenMeteoRequestCoordinates) {
  assertCoordinates(coordinates);

  return buildUrl(OPEN_METEO_AIR_QUALITY_ENDPOINT, {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    current: OPEN_METEO_AIR_QUALITY_VARIABLES.join(','),
    hourly: OPEN_METEO_AIR_QUALITY_VARIABLES.join(','),
    timezone: 'auto',
    timeformat: 'unixtime',
  });
}

export function buildOpenMeteoCurrentAirQualityUrl(
  coordinates: OpenMeteoRequestCoordinates,
) {
  assertCoordinates(coordinates);

  return buildUrl(OPEN_METEO_AIR_QUALITY_ENDPOINT, {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    current: OPEN_METEO_AIR_QUALITY_VARIABLES.join(','),
    timezone: 'auto',
    timeformat: 'unixtime',
  });
}
