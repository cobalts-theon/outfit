import {
  readNumber,
  readNumberArray,
  readOptionalNumber,
  readOptionalRecord,
  readRecord,
  readString,
  readUnitMap,
  type JsonRecord,
  type NullableNumber,
} from '@/services/weather/providers/open-meteo/dto-utils';

export interface OpenMeteoAirQualityValuesDto {
  readonly pm2_5?: NullableNumber;
  readonly pm10?: NullableNumber;
  readonly carbon_monoxide?: NullableNumber;
  readonly nitrogen_dioxide?: NullableNumber;
  readonly sulphur_dioxide?: NullableNumber;
  readonly ozone?: NullableNumber;
  readonly european_aqi?: NullableNumber;
  readonly us_aqi?: NullableNumber;
  readonly uv_index?: NullableNumber;
}

export interface OpenMeteoAirQualityCurrentDto extends OpenMeteoAirQualityValuesDto {
  readonly time: number;
  readonly interval: number;
}

export interface OpenMeteoAirQualityHourlyDto {
  readonly time: readonly NullableNumber[];
  readonly pm2_5: readonly NullableNumber[];
  readonly pm10: readonly NullableNumber[];
  readonly carbon_monoxide: readonly NullableNumber[];
  readonly nitrogen_dioxide: readonly NullableNumber[];
  readonly sulphur_dioxide: readonly NullableNumber[];
  readonly ozone: readonly NullableNumber[];
  readonly european_aqi: readonly NullableNumber[];
  readonly us_aqi: readonly NullableNumber[];
  readonly uv_index: readonly NullableNumber[];
}

export interface OpenMeteoAirQualityResponseDto {
  readonly latitude: number;
  readonly longitude: number;
  readonly elevation: number;
  readonly generationtime_ms: number;
  readonly utc_offset_seconds: number;
  readonly timezone: string;
  readonly timezone_abbreviation: string;
  readonly current: OpenMeteoAirQualityCurrentDto;
  readonly current_units?: Readonly<Record<string, string>>;
  readonly hourly?: OpenMeteoAirQualityHourlyDto;
  readonly hourly_units?: Readonly<Record<string, string>>;
}

const airQualityValueKeys = [
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

function parseCurrent(record: JsonRecord): OpenMeteoAirQualityCurrentDto {
  return {
    time: readNumber(record, 'time', 'current.time'),
    interval: readNumber(record, 'interval', 'current.interval'),
    ...Object.fromEntries(
      airQualityValueKeys.map((key) => [
        key,
        readOptionalNumber(record, key, `current.${key}`),
      ]),
    ),
  };
}

function parseHourly(record: JsonRecord): OpenMeteoAirQualityHourlyDto {
  return {
    time: readNumberArray(record, 'time', 'hourly.time'),
    pm2_5: readNumberArray(record, 'pm2_5', 'hourly.pm2_5'),
    pm10: readNumberArray(record, 'pm10', 'hourly.pm10'),
    carbon_monoxide: readNumberArray(
      record,
      'carbon_monoxide',
      'hourly.carbon_monoxide',
    ),
    nitrogen_dioxide: readNumberArray(
      record,
      'nitrogen_dioxide',
      'hourly.nitrogen_dioxide',
    ),
    sulphur_dioxide: readNumberArray(
      record,
      'sulphur_dioxide',
      'hourly.sulphur_dioxide',
    ),
    ozone: readNumberArray(record, 'ozone', 'hourly.ozone'),
    european_aqi: readNumberArray(record, 'european_aqi', 'hourly.european_aqi'),
    us_aqi: readNumberArray(record, 'us_aqi', 'hourly.us_aqi'),
    uv_index: readNumberArray(record, 'uv_index', 'hourly.uv_index'),
  };
}

export function parseOpenMeteoAirQualityResponse(
  value: unknown,
): OpenMeteoAirQualityResponseDto {
  const response = readRecord(value, 'response');
  const current = readRecord(response.current, 'current');
  const hourly = readOptionalRecord(response, 'hourly');

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
    hourly: hourly === undefined ? undefined : parseHourly(hourly),
    hourly_units: readUnitMap(response, 'hourly_units'),
  };
}
