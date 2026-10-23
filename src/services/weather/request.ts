/**
 * Khai báo tham số, URL, ánh xạ mã thời tiết và các loại lỗi Open-Meteo.
 * Đây là nơi xem ứng dụng yêu cầu những trường dữ liệu nào từ API.
 */
import type { WeatherCondition } from '@/types/weather';

// request

export class OpenMeteoResponseError extends Error {
  // Khởi tạo lỗi và thông tin đi kèm.
  constructor(message: string, readonly path?: string) {
    super(path === undefined ? message : `${path}: ${message}`);
    this.name = 'OpenMeteoResponseError';
  }
}

export class OpenMeteoHttpError extends Error {
  // Khởi tạo lỗi và thông tin đi kèm.
  constructor(readonly status: number) {
    super(`Open-Meteo request failed with HTTP ${status}.`);
    this.name = 'OpenMeteoHttpError';
  }
}

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
export const OPEN_METEO_CURRENT_WEATHER_DAILY_VARIABLES = ['sunrise', 'sunset', 'moonrise', 'moonset', 'moon_phase'] as const;

export const OPEN_METEO_AIR_QUALITY_VARIABLES = ['pm2_5', 'pm10', 'carbon_monoxide', 'nitrogen_dioxide', 'sulphur_dioxide', 'ozone', 'european_aqi', 'us_aqi', 'uv_index'] as const;

export interface OpenMeteoRequestCoordinates {
  readonly latitude: number;
  readonly longitude: number;
}

// Kiểm tra giới hạn vĩ độ và kinh độ.
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

// Ghép URL với các tham số truy vấn.
function buildUrl(endpoint: string, parameters: Readonly<Record<string, string | number>>) {
  const query = Object.entries(parameters)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `${endpoint}?${query}`;
}

// Tạo URL lấy dữ liệu dự báo.
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

// Tạo URL lấy thời tiết hiện tại.
export function buildOpenMeteoCurrentWeatherForecastUrl(coordinates: OpenMeteoRequestCoordinates) {
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
// Tạo URL lấy thời tiết và dự báo đầy đủ.
export function buildOpenMeteoLiveWeatherForecastUrl(coordinates: OpenMeteoRequestCoordinates) {
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

// Tạo URL lấy dữ liệu môi trường.
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

// Tạo URL lấy môi trường hiện tại.
export function buildOpenMeteoCurrentAirQualityUrl(coordinates: OpenMeteoRequestCoordinates) {
  assertCoordinates(coordinates);

  return buildUrl(OPEN_METEO_AIR_QUALITY_ENDPOINT, {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    current: OPEN_METEO_AIR_QUALITY_VARIABLES.join(','),
    timezone: 'auto',
    timeformat: 'unixtime',
  });
}

// dto-utils

export type JsonRecord = Record<string, unknown>;

export type NullableNumber = number | null;

// Đọc đối tượng JSON bắt buộc.
export function readRecord(value: unknown, path: string): JsonRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new OpenMeteoResponseError('Expected an object.', path);
  }

  return value as JsonRecord;
}

// Đọc chuỗi bắt buộc từ phản hồi.
export function readString(record: JsonRecord, key: string, path = key): string {
  const value = record[key];

  if (typeof value !== 'string' || value.length === 0) {
    throw new OpenMeteoResponseError('Expected a non-empty string.', path);
  }

  return value;
}

// Đọc số hữu hạn từ phản hồi.
export function readNumber(record: JsonRecord, key: string, path = key): number {
  const value = record[key];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new OpenMeteoResponseError('Expected a finite number.', path);
  }

  return value;
}

// Đọc số tùy chọn từ phản hồi.
export function readOptionalNumber(record: JsonRecord, key: string, path = key): NullableNumber | undefined {
  const value = record[key];

  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new OpenMeteoResponseError('Expected a finite number or null.', path);
  }

  return value;
}

// Đọc mảng số và kiểm tra từng phần tử.
export function readNumberArray(record: JsonRecord, key: string, path = key): readonly NullableNumber[] {
  const value = record[key];

  if (!Array.isArray(value)) {
    throw new OpenMeteoResponseError('Expected an array.', path);
  }

  return value.map((entry, index) => {
    if (entry === null) {
      return entry;
    }

    if (typeof entry !== 'number' || !Number.isFinite(entry)) {
      throw new OpenMeteoResponseError('Expected a finite number or null.', `${path}.${index}`);
    }

    return entry;
  });
}

// Đọc mảng số tùy chọn.
export function readOptionalNumberArray(record: JsonRecord, key: string, path = key): readonly NullableNumber[] | undefined {
  return record[key] === undefined ? undefined : readNumberArray(record, key, path);
}

// Đọc đối tượng tùy chọn từ phản hồi.
export function readOptionalRecord(record: JsonRecord, key: string, path = key): JsonRecord | undefined {
  const value = record[key];
  return value === undefined ? undefined : readRecord(value, path);
}

// Đọc bảng đơn vị của các chỉ số.
export function readUnitMap(record: JsonRecord, key: string): Readonly<Record<string, string>> | undefined {
  const unitRecord = readOptionalRecord(record, key);

  if (unitRecord === undefined) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(unitRecord).map(([unitKey, value]) => {
      if (typeof value !== 'string') {
        throw new OpenMeteoResponseError('Expected a string unit.', `${key}.${unitKey}`);
      }

      return [unitKey, value];
    }),
  );
}

// wmo-condition

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

// Đổi mã WMO thành điều kiện thời tiết.
export function mapOpenMeteoWmoCondition(code: number): WeatherCondition {
  if (!Number.isInteger(code)) {
    return 'unknown';
  }

  return WMO_CONDITION_BY_CODE[code] ?? 'unknown';
}
