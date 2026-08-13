import {
  readNumber,
  readNumberArray,
  readOptionalNumberArray,
  readOptionalNumber,
  readOptionalRecord,
  readRecord,
  readString,
  readUnitMap,
  type JsonRecord,
  type NullableNumber,
} from '@/services/weather/providers/open-meteo/dto-utils';
import { OpenMeteoResponseError } from '@/services/weather/providers/open-meteo/errors';

export interface OpenMeteoForecastCurrentDto {
  readonly time: number;
  readonly interval: number;
  readonly temperature_2m: number;
  readonly relative_humidity_2m: number;
  readonly apparent_temperature: number;
  readonly is_day: number;
  readonly weather_code: number;
  readonly wind_speed_10m: number;
  readonly precipitation?: NullableNumber;
  readonly rain?: NullableNumber;
  readonly showers?: NullableNumber;
  readonly snowfall?: NullableNumber;
  readonly cloud_cover?: NullableNumber;
  readonly visibility?: NullableNumber;
  readonly pressure_msl?: NullableNumber;
  readonly surface_pressure?: NullableNumber;
  readonly wind_direction_10m?: NullableNumber;
  readonly wind_gusts_10m?: NullableNumber;
}

export interface OpenMeteoForecastHourlyDto {
  readonly time: readonly NullableNumber[];
  readonly temperature_2m: readonly NullableNumber[];
  readonly relative_humidity_2m?: readonly NullableNumber[];
  readonly apparent_temperature?: readonly NullableNumber[];
  readonly precipitation_probability?: readonly NullableNumber[];
  readonly precipitation?: readonly NullableNumber[];
  readonly rain?: readonly NullableNumber[];
  readonly showers?: readonly NullableNumber[];
  readonly snowfall?: readonly NullableNumber[];
  readonly weather_code: readonly NullableNumber[];
  readonly cloud_cover?: readonly NullableNumber[];
  readonly visibility?: readonly NullableNumber[];
  readonly wind_speed_10m?: readonly NullableNumber[];
  readonly wind_direction_10m?: readonly NullableNumber[];
  readonly wind_gusts_10m?: readonly NullableNumber[];
  readonly uv_index?: readonly NullableNumber[];
  readonly is_day: readonly NullableNumber[];
}

export interface OpenMeteoForecastDailyDto {
  readonly time: readonly NullableNumber[];
  readonly weather_code?: readonly NullableNumber[];
  readonly temperature_2m_max?: readonly NullableNumber[];
  readonly temperature_2m_min?: readonly NullableNumber[];
  readonly apparent_temperature_max?: readonly NullableNumber[];
  readonly apparent_temperature_min?: readonly NullableNumber[];
  readonly uv_index_max?: readonly NullableNumber[];
  readonly sunrise?: readonly NullableNumber[];
  readonly sunset?: readonly NullableNumber[];
  readonly moonrise?: readonly NullableNumber[];
  readonly moonset?: readonly NullableNumber[];
  readonly moon_phase?: readonly NullableNumber[];
  readonly precipitation_sum?: readonly NullableNumber[];
  readonly precipitation_probability_max?: readonly NullableNumber[];
  readonly wind_speed_10m_max?: readonly NullableNumber[];
  readonly wind_gusts_10m_max?: readonly NullableNumber[];
  readonly wind_direction_10m_dominant?: readonly NullableNumber[];
}

export interface OpenMeteoForecastResponseDto {
  readonly latitude: number;
  readonly longitude: number;
  readonly elevation: number;
  readonly generationtime_ms: number;
  readonly utc_offset_seconds: number;
  readonly timezone: string;
  readonly timezone_abbreviation: string;
  readonly current: OpenMeteoForecastCurrentDto;
  readonly current_units?: Readonly<Record<string, string>>;
  readonly hourly?: OpenMeteoForecastHourlyDto;
  readonly hourly_units?: Readonly<Record<string, string>>;
  readonly daily?: OpenMeteoForecastDailyDto;
  readonly daily_units?: Readonly<Record<string, string>>;
}

export interface OpenMeteoLiveForecastDto {
  readonly forecast: OpenMeteoForecastResponseDto;
  /** Provider-owned parse signal; raw provider errors never cross into React. */
  readonly hourlyIssue?: { readonly code: 'malformed_response' };
  /** Daily parsing degrades independently from required current conditions. */
  readonly dailyIssue?: { readonly code: 'malformed_response' };
}

function parseCurrent(record: JsonRecord): OpenMeteoForecastCurrentDto {
  return {
    time: readNumber(record, 'time', 'current.time'),
    interval: readNumber(record, 'interval', 'current.interval'),
    temperature_2m: readNumber(record, 'temperature_2m', 'current.temperature_2m'),
    relative_humidity_2m: readNumber(
      record,
      'relative_humidity_2m',
      'current.relative_humidity_2m',
    ),
    apparent_temperature: readNumber(
      record,
      'apparent_temperature',
      'current.apparent_temperature',
    ),
    is_day: readNumber(record, 'is_day', 'current.is_day'),
    weather_code: readNumber(record, 'weather_code', 'current.weather_code'),
    wind_speed_10m: readNumber(record, 'wind_speed_10m', 'current.wind_speed_10m'),
    precipitation: readOptionalNumber(record, 'precipitation', 'current.precipitation'),
    rain: readOptionalNumber(record, 'rain', 'current.rain'),
    showers: readOptionalNumber(record, 'showers', 'current.showers'),
    snowfall: readOptionalNumber(record, 'snowfall', 'current.snowfall'),
    cloud_cover: readOptionalNumber(record, 'cloud_cover', 'current.cloud_cover'),
    visibility: readOptionalNumber(record, 'visibility', 'current.visibility'),
    pressure_msl: readOptionalNumber(record, 'pressure_msl', 'current.pressure_msl'),
    surface_pressure: readOptionalNumber(
      record,
      'surface_pressure',
      'current.surface_pressure',
    ),
    wind_direction_10m: readOptionalNumber(
      record,
      'wind_direction_10m',
      'current.wind_direction_10m',
    ),
    wind_gusts_10m: readOptionalNumber(
      record,
      'wind_gusts_10m',
      'current.wind_gusts_10m',
    ),
  };
}

function parseHourly(record: JsonRecord): OpenMeteoForecastHourlyDto {
  return {
    time: readNumberArray(record, 'time', 'hourly.time'),
    temperature_2m: readNumberArray(record, 'temperature_2m', 'hourly.temperature_2m'),
    relative_humidity_2m: readOptionalNumberArray(
      record,
      'relative_humidity_2m',
      'hourly.relative_humidity_2m',
    ),
    apparent_temperature: readOptionalNumberArray(
      record,
      'apparent_temperature',
      'hourly.apparent_temperature',
    ),
    precipitation_probability: readOptionalNumberArray(
      record,
      'precipitation_probability',
      'hourly.precipitation_probability',
    ),
    precipitation: readOptionalNumberArray(record, 'precipitation', 'hourly.precipitation'),
    rain: readOptionalNumberArray(record, 'rain', 'hourly.rain'),
    showers: readOptionalNumberArray(record, 'showers', 'hourly.showers'),
    snowfall: readOptionalNumberArray(record, 'snowfall', 'hourly.snowfall'),
    weather_code: readNumberArray(record, 'weather_code', 'hourly.weather_code'),
    cloud_cover: readOptionalNumberArray(record, 'cloud_cover', 'hourly.cloud_cover'),
    visibility: readOptionalNumberArray(record, 'visibility', 'hourly.visibility'),
    wind_speed_10m: readOptionalNumberArray(
      record,
      'wind_speed_10m',
      'hourly.wind_speed_10m',
    ),
    wind_direction_10m: readOptionalNumberArray(
      record,
      'wind_direction_10m',
      'hourly.wind_direction_10m',
    ),
    wind_gusts_10m: readOptionalNumberArray(
      record,
      'wind_gusts_10m',
      'hourly.wind_gusts_10m',
    ),
    uv_index: readOptionalNumberArray(record, 'uv_index', 'hourly.uv_index'),
    is_day: readNumberArray(record, 'is_day', 'hourly.is_day'),
  };
}

function parseDaily(record: JsonRecord): OpenMeteoForecastDailyDto {
  return {
    time: readNumberArray(record, 'time', 'daily.time'),
    weather_code: readOptionalNumberArray(record, 'weather_code', 'daily.weather_code'),
    temperature_2m_max: readOptionalNumberArray(
      record,
      'temperature_2m_max',
      'daily.temperature_2m_max',
    ),
    temperature_2m_min: readOptionalNumberArray(
      record,
      'temperature_2m_min',
      'daily.temperature_2m_min',
    ),
    apparent_temperature_max: readOptionalNumberArray(
      record,
      'apparent_temperature_max',
      'daily.apparent_temperature_max',
    ),
    apparent_temperature_min: readOptionalNumberArray(
      record,
      'apparent_temperature_min',
      'daily.apparent_temperature_min',
    ),
    uv_index_max: readOptionalNumberArray(record, 'uv_index_max', 'daily.uv_index_max'),
    sunrise: readOptionalNumberArray(record, 'sunrise', 'daily.sunrise'),
    sunset: readOptionalNumberArray(record, 'sunset', 'daily.sunset'),
    moonrise: readOptionalNumberArray(record, 'moonrise', 'daily.moonrise'),
    moonset: readOptionalNumberArray(record, 'moonset', 'daily.moonset'),
    moon_phase: readOptionalNumberArray(record, 'moon_phase', 'daily.moon_phase'),
    precipitation_sum: readOptionalNumberArray(
      record,
      'precipitation_sum',
      'daily.precipitation_sum',
    ),
    precipitation_probability_max: readOptionalNumberArray(
      record,
      'precipitation_probability_max',
      'daily.precipitation_probability_max',
    ),
    wind_speed_10m_max: readOptionalNumberArray(
      record,
      'wind_speed_10m_max',
      'daily.wind_speed_10m_max',
    ),
    wind_gusts_10m_max: readOptionalNumberArray(
      record,
      'wind_gusts_10m_max',
      'daily.wind_gusts_10m_max',
    ),
    wind_direction_10m_dominant: readOptionalNumberArray(
      record,
      'wind_direction_10m_dominant',
      'daily.wind_direction_10m_dominant',
    ),
  };
}

function parseForecastResponseRecord(
  response: JsonRecord,
  hourly: OpenMeteoForecastHourlyDto | undefined,
  hourlyUnits: Readonly<Record<string, string>> | undefined,
  daily: OpenMeteoForecastDailyDto | undefined,
  dailyUnits: Readonly<Record<string, string>> | undefined,
): OpenMeteoForecastResponseDto {
  const current = readRecord(response.current, 'current');

  return {
    latitude: readNumber(response, 'latitude'),
    longitude: readNumber(response, 'longitude'),
    elevation: readNumber(response, 'elevation'),
    generationtime_ms: readNumber(response, 'generationtime_ms'),
    utc_offset_seconds: readNumber(response, 'utc_offset_seconds'),
    timezone: readString(response, 'timezone'),
    timezone_abbreviation: readString(response, 'timezone_abbreviation'),
    current: parseCurrent(current),
    current_units: readUnitMap(response, 'current_units'),
    hourly,
    hourly_units: hourlyUnits,
    daily,
    daily_units: dailyUnits,
  };
}

export function parseOpenMeteoForecastResponse(value: unknown): OpenMeteoForecastResponseDto {
  const response = readRecord(value, 'response');
  const hourly = readOptionalRecord(response, 'hourly');
  const daily = readOptionalRecord(response, 'daily');

  return parseForecastResponseRecord(
    response,
    hourly === undefined ? undefined : parseHourly(hourly),
    readUnitMap(response, 'hourly_units'),
    daily === undefined ? undefined : parseDaily(daily),
    readUnitMap(response, 'daily_units'),
  );
}

/**
 * Parses the required current/daily slice independently from optional hourly data.
 * This lets the application retain truthful current weather if only hourly JSON is malformed.
 */
export function parseOpenMeteoLiveForecastResponse(value: unknown): OpenMeteoLiveForecastDto {
  const response = readRecord(value, 'response');
  let hourly: OpenMeteoForecastHourlyDto | undefined;
  let hourlyUnits: Readonly<Record<string, string>> | undefined;
  let hourlyIssue: OpenMeteoLiveForecastDto['hourlyIssue'];
  let daily: OpenMeteoForecastDailyDto | undefined;
  let dailyUnits: Readonly<Record<string, string>> | undefined;
  let dailyIssue: OpenMeteoLiveForecastDto['dailyIssue'];

  try {
    const hourlyRecord = readOptionalRecord(response, 'hourly');
    hourly = hourlyRecord === undefined ? undefined : parseHourly(hourlyRecord);
    hourlyUnits = readUnitMap(response, 'hourly_units');
  } catch (error) {
    if (!(error instanceof OpenMeteoResponseError)) throw error;
    hourlyIssue = { code: 'malformed_response' };
  }

  try {
    const dailyRecord = readOptionalRecord(response, 'daily');
    daily = dailyRecord === undefined ? undefined : parseDaily(dailyRecord);
    dailyUnits = readUnitMap(response, 'daily_units');
  } catch (error) {
    if (!(error instanceof OpenMeteoResponseError)) throw error;
    dailyIssue = { code: 'malformed_response' };
  }

  return {
    forecast: parseForecastResponseRecord(
      response,
      hourly,
      hourlyUnits,
      daily,
      dailyUnits,
    ),
    ...(hourlyIssue === undefined ? {} : { hourlyIssue }),
    ...(dailyIssue === undefined ? {} : { dailyIssue }),
  };
}
