import type {
  HourlyForecast,
  HourlyForecastEntry,
} from '@/features/forecast/domain/hourly-forecast';
import { OpenMeteoResponseError } from '@/services/weather/providers/open-meteo/errors';
import {
  mapOpenMeteoDaylight,
  mapOpenMeteoPrecipitationValues,
  mapOpenMeteoWind,
  type OpenMeteoLocationContext,
} from '@/services/weather/providers/open-meteo/forecast-adapter';
import type {
  OpenMeteoForecastHourlyDto,
  OpenMeteoForecastResponseDto,
} from '@/services/weather/providers/open-meteo/forecast-dto';
import { mapOpenMeteoWmoCondition } from '@/services/weather/providers/open-meteo/wmo-condition';

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

function assertUnit(
  units: Readonly<Record<string, string>> | undefined,
  key: string,
  expected: string,
) {
  const actual = units?.[key];
  if (actual !== undefined && actual !== expected) {
    throw new OpenMeteoResponseError(
      `Expected ${expected} but received ${actual}.`,
      `hourly_units.${key}`,
    );
  }
}

function assertNormalizedHourlyUnits(response: OpenMeteoForecastResponseDto) {
  assertUnit(response.hourly_units, 'time', 'unixtime');
  assertUnit(response.hourly_units, 'temperature_2m', '°C');
  assertUnit(response.hourly_units, 'apparent_temperature', '°C');
  assertUnit(response.hourly_units, 'precipitation_probability', '%');
  assertUnit(response.hourly_units, 'precipitation', 'mm');
  assertUnit(response.hourly_units, 'rain', 'mm');
  assertUnit(response.hourly_units, 'showers', 'mm');
  assertUnit(response.hourly_units, 'snowfall', 'cm');
  assertUnit(response.hourly_units, 'wind_speed_10m', 'm/s');
  assertUnit(response.hourly_units, 'wind_direction_10m', '°');
  assertUnit(response.hourly_units, 'wind_gusts_10m', 'm/s');
}

function assertValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
  } catch {
    throw new OpenMeteoResponseError('Expected a valid IANA time zone.', 'timezone');
  }
}

function requireValue(
  value: number | null | undefined,
  path: string,
): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    throw new OpenMeteoResponseError('Expected a finite number.', path);
  }

  return value;
}

function optionalFinite(value: number | null | undefined, path: string) {
  if (value === null || value === undefined) return undefined;
  if (!Number.isFinite(value)) {
    throw new OpenMeteoResponseError('Expected a finite number or null.', path);
  }
  return value;
}

function epochSecondsToIso(value: number, path: string) {
  const date = new Date(value * 1000);
  if (!Number.isFinite(value) || !Number.isFinite(date.getTime())) {
    throw new OpenMeteoResponseError('Expected a valid Unix timestamp.', path);
  }
  return date.toISOString();
}

function assertHourlyArrayLengths(hourly: OpenMeteoForecastHourlyDto) {
  const expectedLength = hourly.time.length;
  if (expectedLength === 0) {
    throw new OpenMeteoResponseError('Expected at least one hourly entry.', 'hourly.time');
  }

  for (const key of HOURLY_ARRAY_KEYS) {
    const values = hourly[key];
    if (values !== undefined && values.length !== expectedLength) {
      throw new OpenMeteoResponseError(
        `Expected ${expectedLength} entries but received ${values.length}.`,
        `hourly.${key}`,
      );
    }
  }
}

function adaptEntry(
  hourly: OpenMeteoForecastHourlyDto,
  index: number,
): HourlyForecastEntry {
  const path = `hourly.${index}`;
  const time = requireValue(hourly.time[index], `${path}.time`);
  const temperature = requireValue(
    hourly.temperature_2m[index],
    `${path}.temperature_2m`,
  );
  const weatherCode = requireValue(hourly.weather_code[index], `${path}.weather_code`);
  const daylightValue = requireValue(hourly.is_day[index], `${path}.is_day`);
  const apparentTemperature = optionalFinite(
    hourly.apparent_temperature?.[index],
    `${path}.apparent_temperature`,
  );
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
    forecastAt: epochSecondsToIso(time, `${path}.time`),
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

export function adaptOpenMeteoHourlyForecast(
  response: OpenMeteoForecastResponseDto,
  location: OpenMeteoLocationContext,
): HourlyForecast {
  const hourly = response.hourly;
  if (hourly === undefined) {
    throw new OpenMeteoResponseError('Expected hourly forecast data.', 'hourly');
  }

  assertNormalizedHourlyUnits(response);
  assertValidTimeZone(response.timezone);
  assertHourlyArrayLengths(hourly);

  const entries = hourly.time.map((_, index) => adaptEntry(hourly, index));
  for (let index = 1; index < entries.length; index += 1) {
    if (Date.parse(entries[index].forecastAt) <= Date.parse(entries[index - 1].forecastAt)) {
      throw new OpenMeteoResponseError(
        'Hourly timestamps must be strictly chronological.',
        `hourly.time.${index}`,
      );
    }
  }

  return {
    location: {
      ...location,
      timeZone: response.timezone,
      coordinates: {
        latitude: response.latitude,
        longitude: response.longitude,
      },
    },
    entries,
  };
}
