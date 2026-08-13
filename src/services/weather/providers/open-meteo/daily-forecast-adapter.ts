import type {
  DailyForecast,
  DailyForecastEntry,
} from '@/features/forecast/domain/daily-forecast';
import { uvIndexCategory } from '@/services/weather/providers/open-meteo/air-quality-adapter';
import { OpenMeteoResponseError } from '@/services/weather/providers/open-meteo/errors';
import {
  mapOpenMeteoMoonPhase,
  mapOpenMeteoPrecipitationValues,
  type OpenMeteoLocationContext,
} from '@/services/weather/providers/open-meteo/forecast-adapter';
import type {
  OpenMeteoForecastDailyDto,
  OpenMeteoForecastResponseDto,
} from '@/services/weather/providers/open-meteo/forecast-dto';
import { mapOpenMeteoWmoCondition } from '@/services/weather/providers/open-meteo/wmo-condition';

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

function assertUnit(
  units: Readonly<Record<string, string>> | undefined,
  key: string,
  expected: string,
) {
  const actual = units?.[key];
  if (actual !== undefined && actual !== expected) {
    throw new OpenMeteoResponseError(
      `Expected ${expected} but received ${actual}.`,
      `daily_units.${key}`,
    );
  }
}

function assertNormalizedDailyUnits(response: OpenMeteoForecastResponseDto) {
  assertUnit(response.daily_units, 'time', 'unixtime');
  assertUnit(response.daily_units, 'temperature_2m_max', '°C');
  assertUnit(response.daily_units, 'temperature_2m_min', '°C');
  assertUnit(response.daily_units, 'precipitation_sum', 'mm');
  assertUnit(response.daily_units, 'precipitation_probability_max', '%');
  assertUnit(response.daily_units, 'sunrise', 'unixtime');
  assertUnit(response.daily_units, 'sunset', 'unixtime');
  assertUnit(response.daily_units, 'moonrise', 'unixtime');
  assertUnit(response.daily_units, 'moonset', 'unixtime');
  assertUnit(response.daily_units, 'moon_phase', 'fraction');
}

function assertValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
  } catch {
    throw new OpenMeteoResponseError('Expected a valid IANA time zone.', 'timezone');
  }
}

function requireValue(value: number | null | undefined, path: string) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    throw new OpenMeteoResponseError('Expected a finite number.', path);
  }
  return value;
}

function optionalNonNegative(value: number | null | undefined, path: string) {
  if (value === null || value === undefined) return undefined;
  if (!Number.isFinite(value) || value < 0) {
    throw new OpenMeteoResponseError('Expected a non-negative number or null.', path);
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

function localDateKey(epochSeconds: number, utcOffsetSeconds: number) {
  return new Date((epochSeconds + utcOffsetSeconds) * 1000).toISOString().slice(0, 10);
}

function assertDailyArrayLengths(daily: OpenMeteoForecastDailyDto) {
  const expectedLength = daily.time.length;
  if (expectedLength === 0) {
    throw new OpenMeteoResponseError('Expected at least one daily entry.', 'daily.time');
  }

  for (const key of DAILY_ARRAY_KEYS) {
    const values = daily[key];
    if (values !== undefined && values.length !== expectedLength) {
      throw new OpenMeteoResponseError(
        `Expected ${expectedLength} entries but received ${values.length}.`,
        `daily.${key}`,
      );
    }
  }
}

function adaptEntry(
  daily: OpenMeteoForecastDailyDto,
  index: number,
  utcOffsetSeconds: number,
): DailyForecastEntry {
  const path = `daily.${index}`;
  const time = requireValue(daily.time[index], `${path}.time`);
  const weatherCode = requireValue(daily.weather_code?.[index], `${path}.weather_code`);
  const minimum = requireValue(
    daily.temperature_2m_min?.[index],
    `${path}.temperature_2m_min`,
  );
  const maximum = requireValue(
    daily.temperature_2m_max?.[index],
    `${path}.temperature_2m_max`,
  );
  if (minimum > maximum) {
    throw new OpenMeteoResponseError(
      'Minimum temperature must not exceed maximum temperature.',
      `${path}.temperature_2m_min`,
    );
  }

  const precipitation = mapOpenMeteoPrecipitationValues(
    {
      weather_code: weatherCode,
      precipitation: daily.precipitation_sum?.[index],
      precipitation_probability: daily.precipitation_probability_max?.[index],
    },
    path,
  );
  const uvIndex = optionalNonNegative(daily.uv_index_max?.[index], `${path}.uv_index_max`);
  const sunrise = daily.sunrise?.[index];
  const sunset = daily.sunset?.[index];
  const moonPhase = daily.moon_phase?.[index];
  const moonrise = daily.moonrise?.[index];
  const moonset = daily.moonset?.[index];
  const sun =
    sunrise === null || sunrise === undefined || sunset === null || sunset === undefined
      ? undefined
      : {
          sunrise: epochSecondsToIso(sunrise, `${path}.sunrise`),
          sunset: epochSecondsToIso(sunset, `${path}.sunset`),
        };
  const moon =
    moonPhase === null || moonPhase === undefined
      ? undefined
      : {
          phase: mapOpenMeteoMoonPhase(moonPhase),
          ...(moonrise === null || moonrise === undefined
            ? {}
            : { moonrise: epochSecondsToIso(moonrise, `${path}.moonrise`) }),
          ...(moonset === null || moonset === undefined
            ? {}
            : { moonset: epochSecondsToIso(moonset, `${path}.moonset`) }),
        };

  return {
    forecastDate: localDateKey(time, utcOffsetSeconds),
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

export function adaptOpenMeteoDailyForecast(
  response: OpenMeteoForecastResponseDto,
  location: OpenMeteoLocationContext,
): DailyForecast {
  const daily = response.daily;
  if (daily === undefined) {
    throw new OpenMeteoResponseError('Expected daily forecast data.', 'daily');
  }

  assertNormalizedDailyUnits(response);
  assertValidTimeZone(response.timezone);
  assertDailyArrayLengths(daily);

  const entries = daily.time.map((_, index) =>
    adaptEntry(daily, index, response.utc_offset_seconds),
  );
  for (let index = 1; index < entries.length; index += 1) {
    if (entries[index].forecastDate <= entries[index - 1].forecastDate) {
      throw new OpenMeteoResponseError(
        'Daily dates must be strictly chronological.',
        `daily.time.${index}`,
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
