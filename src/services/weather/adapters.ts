/**
 * Chuyển dữ liệu dự báo Open-Meteo sang các kiểu thời tiết nội bộ.
 * Tập trung chuyển mã, đơn vị và thời gian để UI không phụ thuộc JSON của nhà cung cấp.
 */
import type { HourlyForecast, HourlyForecastEntry, DailyForecast, DailyForecastEntry } from '@/types/weather';

import { uvIndexCategory } from '@/services/weather/client';
import { OpenMeteoResponseError, mapOpenMeteoWmoCondition } from '@/services/weather/request';
import type { OpenMeteoForecastDailyDto, OpenMeteoForecastResponseDto, OpenMeteoForecastHourlyDto } from '@/services/weather/responses';

import { OpenMeteoLocationContext, mapOpenMeteoDaylight, mapOpenMeteoWind, mapOpenMeteoPrecipitationValues, mapOpenMeteoMoonPhase } from '@/services/weather/current-adapter';
export * from '@/services/weather/current-adapter';

// hourly-forecast-adapter

const HOURLY_ARRAY_KEYS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'rain',
  'showers',
  'snowfall',
  'weather_code',
  'cloud_cover',
  'visibility',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'uv_index',
  'is_day',
] as const satisfies readonly (keyof OpenMeteoForecastHourlyDto)[];

// Kiểm tra đơn vị dữ liệu dự báo giờ.
function hourlyForecastAdapterAssertUnit(units: Readonly<Record<string, string>> | undefined, key: string, expected: string) {
  const actual = units?.[key];
  if (actual !== undefined && actual !== expected) {
    throw new OpenMeteoResponseError(`Expected ${expected} but received ${actual}.`, `hourly_units.${key}`);
  }
}

// Kiểm tra các đơn vị dự báo theo giờ.
function assertNormalizedHourlyUnits(response: OpenMeteoForecastResponseDto) {
  hourlyForecastAdapterAssertUnit(response.hourly_units, 'time', 'unixtime');
  hourlyForecastAdapterAssertUnit(response.hourly_units, 'temperature_2m', '°C');
  hourlyForecastAdapterAssertUnit(response.hourly_units, 'apparent_temperature', '°C');
  hourlyForecastAdapterAssertUnit(response.hourly_units, 'precipitation_probability', '%');
  hourlyForecastAdapterAssertUnit(response.hourly_units, 'precipitation', 'mm');
  hourlyForecastAdapterAssertUnit(response.hourly_units, 'rain', 'mm');
  hourlyForecastAdapterAssertUnit(response.hourly_units, 'showers', 'mm');
  hourlyForecastAdapterAssertUnit(response.hourly_units, 'snowfall', 'cm');
  hourlyForecastAdapterAssertUnit(response.hourly_units, 'wind_speed_10m', 'm/s');
  hourlyForecastAdapterAssertUnit(response.hourly_units, 'wind_direction_10m', '°');
  hourlyForecastAdapterAssertUnit(response.hourly_units, 'wind_gusts_10m', 'm/s');
}

// Kiểm tra múi giờ của dự báo giờ.
function hourlyForecastAdapterAssertValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
  } catch {
    throw new OpenMeteoResponseError('Expected a valid IANA time zone.', 'timezone');
  }
}

// Đọc số bắt buộc trong dự báo giờ.
function hourlyForecastAdapterRequireValue(value: number | null | undefined, path: string): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    throw new OpenMeteoResponseError('Expected a finite number.', path);
  }

  return value;
}

// Đọc số tùy chọn nếu hữu hạn.
function optionalFinite(value: number | null | undefined, path: string) {
  if (value === null || value === undefined) return undefined;
  if (!Number.isFinite(value)) {
    throw new OpenMeteoResponseError('Expected a finite number or null.', path);
  }
  return value;
}

// Đổi thời gian Unix dự báo giờ sang ISO.
function hourlyForecastAdapterEpochSecondsToIso(value: number, path: string) {
  const date = new Date(value * 1000);
  if (!Number.isFinite(value) || !Number.isFinite(date.getTime())) {
    throw new OpenMeteoResponseError('Expected a valid Unix timestamp.', path);
  }
  return date.toISOString();
}

// Kiểm tra các chuỗi dự báo giờ cùng độ dài.
function assertHourlyArrayLengths(hourly: OpenMeteoForecastHourlyDto) {
  const expectedLength = hourly.time.length;
  if (expectedLength === 0) {
    throw new OpenMeteoResponseError('Expected at least one hourly entry.', 'hourly.time');
  }

  for (const key of HOURLY_ARRAY_KEYS) {
    const values = hourly[key];
    if (values !== undefined && values.length !== expectedLength) {
      throw new OpenMeteoResponseError(`Expected ${expectedLength} entries but received ${values.length}.`, `hourly.${key}`);
    }
  }
}

// Chuẩn hóa dữ liệu của một giờ dự báo.
function hourlyForecastAdapterAdaptEntry(hourly: OpenMeteoForecastHourlyDto, index: number): HourlyForecastEntry {
  const path = `hourly.${index}`;
  const time = hourlyForecastAdapterRequireValue(hourly.time[index], `${path}.time`);
  const temperature = hourlyForecastAdapterRequireValue(hourly.temperature_2m[index], `${path}.temperature_2m`);
  const weatherCode = hourlyForecastAdapterRequireValue(hourly.weather_code[index], `${path}.weather_code`);
  const daylightValue = hourlyForecastAdapterRequireValue(hourly.is_day[index], `${path}.is_day`);
  const apparentTemperature = optionalFinite(hourly.apparent_temperature?.[index], `${path}.apparent_temperature`);
  const wind = mapOpenMeteoWind(
    {
      speed: hourly.wind_speed_10m?.[index],
      gust: hourly.wind_gusts_10m?.[index],
      directionDegrees: hourly.wind_direction_10m?.[index],
    },
    path,
  );
  const precipitation = mapOpenMeteoPrecipitationValues(
    {
      weather_code: weatherCode,
      precipitation_probability: hourly.precipitation_probability?.[index],
      precipitation: hourly.precipitation?.[index],
      rain: hourly.rain?.[index],
      showers: hourly.showers?.[index],
      snowfall: hourly.snowfall?.[index],
    },
    path,
  );
  const uvIndex = optionalFinite(hourly.uv_index?.[index], `${path}.uv_index`);
  if (uvIndex !== undefined && uvIndex < 0) {
    throw new OpenMeteoResponseError('Expected a non-negative value.', `${path}.uv_index`);
  }

  return {
    forecastAt: hourlyForecastAdapterEpochSecondsToIso(time, `${path}.time`),
    condition: mapOpenMeteoWmoCondition(weatherCode),
    daylight: mapOpenMeteoDaylight(daylightValue, `${path}.is_day`),
    temperatureCelsius: temperature,
    ...(apparentTemperature === undefined
      ? {}
      : { apparentTemperatureCelsius: apparentTemperature }),
    ...(precipitation === undefined ? {} : { precipitation }),
    ...(wind === undefined ? {} : { wind }),
    ...(uvIndex === undefined ? {} : { uv: { index: uvIndex } }),
  };
}

// Chuẩn hóa toàn bộ dự báo theo giờ.
export function adaptOpenMeteoHourlyForecast(response: OpenMeteoForecastResponseDto, location: OpenMeteoLocationContext): HourlyForecast {
  const hourly = response.hourly;
  if (hourly === undefined) {
    throw new OpenMeteoResponseError('Expected hourly forecast data.', 'hourly');
  }

  assertNormalizedHourlyUnits(response);
  hourlyForecastAdapterAssertValidTimeZone(response.timezone);
  assertHourlyArrayLengths(hourly);

  const entries = hourly.time.map((_, index) => hourlyForecastAdapterAdaptEntry(hourly, index));
  for (let index = 1; index < entries.length; index += 1) {
    if (Date.parse(entries[index].forecastAt) <= Date.parse(entries[index - 1].forecastAt)) {
      throw new OpenMeteoResponseError('Hourly timestamps must be strictly chronological.', `hourly.time.${index}`);
    }
  }

  return {
    location: {
      ...location,
      timeZone: response.timezone,
      coordinates: { latitude: response.latitude, longitude: response.longitude },
    },
    entries,
  };
}

// daily-forecast-adapter

const DAILY_ARRAY_KEYS = [
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
] as const satisfies readonly (keyof OpenMeteoForecastDailyDto)[];

// Kiểm tra đơn vị dữ liệu dự báo ngày.
function dailyForecastAdapterAssertUnit(units: Readonly<Record<string, string>> | undefined, key: string, expected: string) {
  const actual = units?.[key];
  if (actual !== undefined && actual !== expected) {
    throw new OpenMeteoResponseError(`Expected ${expected} but received ${actual}.`, `daily_units.${key}`);
  }
}

// Kiểm tra các đơn vị dự báo theo ngày.
function assertNormalizedDailyUnits(response: OpenMeteoForecastResponseDto) {
  dailyForecastAdapterAssertUnit(response.daily_units, 'time', 'unixtime');
  dailyForecastAdapterAssertUnit(response.daily_units, 'temperature_2m_max', '°C');
  dailyForecastAdapterAssertUnit(response.daily_units, 'temperature_2m_min', '°C');
  dailyForecastAdapterAssertUnit(response.daily_units, 'precipitation_sum', 'mm');
  dailyForecastAdapterAssertUnit(response.daily_units, 'precipitation_probability_max', '%');
  dailyForecastAdapterAssertUnit(response.daily_units, 'sunrise', 'unixtime');
  dailyForecastAdapterAssertUnit(response.daily_units, 'sunset', 'unixtime');
  dailyForecastAdapterAssertUnit(response.daily_units, 'moonrise', 'unixtime');
  dailyForecastAdapterAssertUnit(response.daily_units, 'moonset', 'unixtime');
  dailyForecastAdapterAssertUnit(response.daily_units, 'moon_phase', 'fraction');
}

// Kiểm tra múi giờ của dự báo ngày.
function dailyForecastAdapterAssertValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
  } catch {
    throw new OpenMeteoResponseError('Expected a valid IANA time zone.', 'timezone');
  }
}

// Đọc số bắt buộc trong dự báo ngày.
function dailyForecastAdapterRequireValue(value: number | null | undefined, path: string) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    throw new OpenMeteoResponseError('Expected a finite number.', path);
  }
  return value;
}

// Đọc số không âm nếu được cung cấp.
function dailyForecastAdapterOptionalNonNegative(value: number | null | undefined, path: string) {
  if (value === null || value === undefined) return undefined;
  if (!Number.isFinite(value) || value < 0) {
    throw new OpenMeteoResponseError('Expected a non-negative number or null.', path);
  }
  return value;
}

// Đổi thời gian Unix dự báo ngày sang ISO.
function dailyForecastAdapterEpochSecondsToIso(value: number, path: string) {
  const date = new Date(value * 1000);
  if (!Number.isFinite(value) || !Number.isFinite(date.getTime())) {
    throw new OpenMeteoResponseError('Expected a valid Unix timestamp.', path);
  }
  return date.toISOString();
}

// Lấy ngày địa phương từ thời gian Unix.
function dailyForecastAdapterLocalDateKey(epochSeconds: number, utcOffsetSeconds: number) {
  return new Date((epochSeconds + utcOffsetSeconds) * 1000).toISOString().slice(0, 10);
}

// Kiểm tra các chuỗi dự báo ngày cùng độ dài.
function assertDailyArrayLengths(daily: OpenMeteoForecastDailyDto) {
  const expectedLength = daily.time.length;
  if (expectedLength === 0) {
    throw new OpenMeteoResponseError('Expected at least one daily entry.', 'daily.time');
  }

  for (const key of DAILY_ARRAY_KEYS) {
    const values = daily[key];
    if (values !== undefined && values.length !== expectedLength) {
      throw new OpenMeteoResponseError(`Expected ${expectedLength} entries but received ${values.length}.`, `daily.${key}`);
    }
  }
}

// Chuẩn hóa dữ liệu của một ngày dự báo.
function dailyForecastAdapterAdaptEntry(daily: OpenMeteoForecastDailyDto, index: number, utcOffsetSeconds: number): DailyForecastEntry {
  const path = `daily.${index}`;
  const time = dailyForecastAdapterRequireValue(daily.time[index], `${path}.time`);
  const weatherCode = dailyForecastAdapterRequireValue(daily.weather_code?.[index], `${path}.weather_code`);
  const minimum = dailyForecastAdapterRequireValue(daily.temperature_2m_min?.[index], `${path}.temperature_2m_min`);
  const maximum = dailyForecastAdapterRequireValue(daily.temperature_2m_max?.[index], `${path}.temperature_2m_max`);
  if (minimum > maximum) {
    throw new OpenMeteoResponseError('Minimum temperature must not exceed maximum temperature.', `${path}.temperature_2m_min`);
  }

  const precipitation = mapOpenMeteoPrecipitationValues(
    {
      weather_code: weatherCode,
      precipitation: daily.precipitation_sum?.[index],
      precipitation_probability: daily.precipitation_probability_max?.[index],
    },
    path,
  );
  const uvIndex = dailyForecastAdapterOptionalNonNegative(daily.uv_index_max?.[index], `${path}.uv_index_max`);
  const sunrise = daily.sunrise?.[index];
  const sunset = daily.sunset?.[index];
  const moonPhase = daily.moon_phase?.[index];
  const moonrise = daily.moonrise?.[index];
  const moonset = daily.moonset?.[index];
  const sun =
    sunrise === null || sunrise === undefined || sunset === null || sunset === undefined
      ? undefined
      : {
          sunrise: dailyForecastAdapterEpochSecondsToIso(sunrise, `${path}.sunrise`),
          sunset: dailyForecastAdapterEpochSecondsToIso(sunset, `${path}.sunset`),
        };
  const moon =
    moonPhase === null || moonPhase === undefined
      ? undefined
      : {
          phase: mapOpenMeteoMoonPhase(moonPhase),
          ...(moonrise === null || moonrise === undefined
            ? {}
            : { moonrise: dailyForecastAdapterEpochSecondsToIso(moonrise, `${path}.moonrise`) }),
          ...(moonset === null || moonset === undefined
            ? {}
            : { moonset: dailyForecastAdapterEpochSecondsToIso(moonset, `${path}.moonset`) }),
        };

  return {
    forecastDate: dailyForecastAdapterLocalDateKey(time, utcOffsetSeconds),
    condition: mapOpenMeteoWmoCondition(weatherCode),
    minimumTemperatureCelsius: minimum,
    maximumTemperatureCelsius: maximum,
    ...(precipitation === undefined ? {} : { precipitation }),
    ...(uvIndex === undefined
      ? {}
      : { uv: { index: uvIndex, category: uvIndexCategory(uvIndex) } }),
    ...(sun === undefined ? {} : { sun }),
    ...(moon === undefined ? {} : { moon }),
  };
}

// Chuẩn hóa toàn bộ dự báo theo ngày.
export function adaptOpenMeteoDailyForecast(response: OpenMeteoForecastResponseDto, location: OpenMeteoLocationContext): DailyForecast {
  const daily = response.daily;
  if (daily === undefined) {
    throw new OpenMeteoResponseError('Expected daily forecast data.', 'daily');
  }

  assertNormalizedDailyUnits(response);
  dailyForecastAdapterAssertValidTimeZone(response.timezone);
  assertDailyArrayLengths(daily);

  const entries = daily.time.map((_, index) =>
    dailyForecastAdapterAdaptEntry(daily, index, response.utc_offset_seconds),
  );
  for (let index = 1; index < entries.length; index += 1) {
    if (entries[index].forecastDate <= entries[index - 1].forecastDate) {
      throw new OpenMeteoResponseError('Daily dates must be strictly chronological.', `daily.time.${index}`);
    }
  }

  return {
    location: {
      ...location,
      timeZone: response.timezone,
      coordinates: { latitude: response.latitude, longitude: response.longitude },
    },
    entries,
  };
}
