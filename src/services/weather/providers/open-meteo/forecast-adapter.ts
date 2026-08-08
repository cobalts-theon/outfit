import {
  type CurrentWeather,
  type DaylightState,
  type MoonData,
  type MoonPhase,
  type Precipitation,
  type PrecipitationIntensity,
  type PrecipitationType,
  type SunData,
  type UVReference,
  type Wind,
  type WindDirection,
} from '@/features/weather/domain/current-weather';
import { assertValidCurrentWeather } from '@/features/weather/domain/validate-current-weather';
import type { OpenMeteoEnvironmentalSnapshot } from '@/services/weather/providers/open-meteo/air-quality-adapter';
import { OpenMeteoResponseError } from '@/services/weather/providers/open-meteo/errors';
import type {
  OpenMeteoForecastCurrentDto,
  OpenMeteoForecastDailyDto,
  OpenMeteoForecastResponseDto,
} from '@/services/weather/providers/open-meteo/forecast-dto';
import { mapOpenMeteoWmoCondition } from '@/services/weather/providers/open-meteo/wmo-condition';

export interface OpenMeteoLocationContext {
  readonly name: string;
  readonly region?: string;
  readonly countryCode?: string;
}

const windDirections: readonly WindDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function assertUnit(
  units: Readonly<Record<string, string>> | undefined,
  key: string,
  expected: string,
) {
  const actual = units?.[key];
  if (actual !== undefined && actual !== expected) {
    throw new OpenMeteoResponseError(
      `Expected ${expected} but received ${actual}.`,
      `current_units.${key}`,
    );
  }
}

function assertNormalizedForecastUnits(response: OpenMeteoForecastResponseDto) {
  assertUnit(response.current_units, 'temperature_2m', '°C');
  assertUnit(response.current_units, 'relative_humidity_2m', '%');
  assertUnit(response.current_units, 'apparent_temperature', '°C');
  assertUnit(response.current_units, 'precipitation', 'mm');
  assertUnit(response.current_units, 'rain', 'mm');
  assertUnit(response.current_units, 'showers', 'mm');
  assertUnit(response.current_units, 'snowfall', 'cm');
  assertUnit(response.current_units, 'cloud_cover', '%');
  assertUnit(response.current_units, 'pressure_msl', 'hPa');
  assertUnit(response.current_units, 'surface_pressure', 'hPa');
  assertUnit(response.current_units, 'wind_speed_10m', 'm/s');
  assertUnit(response.current_units, 'wind_direction_10m', '°');
  assertUnit(response.current_units, 'wind_gusts_10m', 'm/s');
}

function requireRange(path: string, value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new OpenMeteoResponseError(
      `Expected a value between ${minimum} and ${maximum}.`,
      path,
    );
  }

  return value;
}

function requireNonNegative(path: string, value: number) {
  if (!Number.isFinite(value) || value < 0) {
    throw new OpenMeteoResponseError('Expected a non-negative value.', path);
  }

  return value;
}

function optionalNonNegative(path: string, value: number | null | undefined) {
  return value === null || value === undefined ? undefined : requireNonNegative(path, value);
}

function epochSecondsToIso(path: string, value: number) {
  if (!Number.isFinite(value)) {
    throw new OpenMeteoResponseError('Expected a Unix timestamp.', path);
  }

  const date = new Date(value * 1000);
  if (!Number.isFinite(date.getTime())) {
    throw new OpenMeteoResponseError('Expected a valid Unix timestamp.', path);
  }

  return date.toISOString();
}

function localDateKey(epochSeconds: number, utcOffsetSeconds: number) {
  return new Date((epochSeconds + utcOffsetSeconds) * 1000).toISOString().slice(0, 10);
}

function findCurrentDailyIndex(
  daily: OpenMeteoForecastDailyDto | undefined,
  currentEpochSeconds: number,
  utcOffsetSeconds: number,
) {
  if (daily === undefined) {
    return undefined;
  }

  const currentDate = localDateKey(currentEpochSeconds, utcOffsetSeconds);
  const index = daily.time.findIndex(
    (time) => time !== null && localDateKey(time, utcOffsetSeconds) === currentDate,
  );

  return index < 0 ? undefined : index;
}

export function mapOpenMeteoDaylight(
  isDay: number,
  path = 'current.is_day',
): DaylightState {
  if (isDay === 1) {
    return { phase: 'day', isDay: true };
  }
  if (isDay === 0) {
    return { phase: 'night', isDay: false };
  }

  throw new OpenMeteoResponseError('Expected 0 or 1.', path);
}

export function mapOpenMeteoWindDirection(degrees: number): WindDirection {
  requireRange('wind.directionDegrees', degrees, 0, 359.999);
  return windDirections[Math.floor((degrees + 22.5) / 45) % windDirections.length];
}

export function mapOpenMeteoWind(
  values: {
    readonly speed: number | null | undefined;
    readonly gust?: number | null;
    readonly directionDegrees?: number | null;
  },
  path: string,
): Wind | undefined {
  if (values.speed === null || values.speed === undefined) return undefined;

  const speed = requireNonNegative(`${path}.wind_speed_10m`, values.speed);
  const gust = optionalNonNegative(`${path}.wind_gusts_10m`, values.gust);
  const degrees =
    values.directionDegrees === null || values.directionDegrees === undefined
      ? undefined
      : requireRange(`${path}.wind_direction_10m`, values.directionDegrees, 0, 359.999);

  if (gust !== undefined && gust < speed) {
    throw new OpenMeteoResponseError(
      'Gust speed must not be lower than sustained wind speed.',
      `${path}.wind_gusts_10m`,
    );
  }

  return {
    speedMetersPerSecond: speed,
    ...(gust === undefined ? {} : { gustMetersPerSecond: gust }),
    ...(degrees === undefined
      ? {}
      : { directionDegrees: degrees, direction: mapOpenMeteoWindDirection(degrees) }),
  };
}

function mapCurrentWind(current: OpenMeteoForecastCurrentDto): Wind {
  return mapOpenMeteoWind(
    {
      speed: current.wind_speed_10m,
      gust: current.wind_gusts_10m,
      directionDegrees: current.wind_direction_10m,
    },
    'current',
  ) as Wind;
}

function precipitationTypeForCode(
  code: number,
  values: {
    readonly precipitation?: number | null;
    readonly rain?: number | null;
    readonly showers?: number | null;
    readonly snowfall?: number | null;
  },
): PrecipitationType {
  if ([51, 53, 55].includes(code)) return 'drizzle';
  if ([56, 57, 66, 67].includes(code)) return 'freezing_rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([96, 99].includes(code)) return 'hail';
  if ([61, 63, 65, 80, 81, 82, 95].includes(code)) return 'rain';
  if ((values.snowfall ?? 0) > 0) return 'snow';
  if ((values.rain ?? 0) > 0 || (values.showers ?? 0) > 0 || (values.precipitation ?? 0) > 0) {
    return 'rain';
  }
  return 'none';
}

function precipitationIntensityForCode(
  code: number,
  type: PrecipitationType,
): PrecipitationIntensity | undefined {
  if (type === 'none') return 'none';
  if ([51, 56, 61, 66, 71, 80, 85].includes(code)) return 'light';
  if ([53, 63, 73, 77, 81, 95, 96].includes(code)) return 'moderate';
  if ([55, 57, 65, 67, 75, 82, 86, 99].includes(code)) return 'heavy';
  return undefined;
}

export function mapOpenMeteoPrecipitation(
  current: OpenMeteoForecastCurrentDto,
): Precipitation | undefined {
  return mapOpenMeteoPrecipitationValues(current, 'current');
}

export function mapOpenMeteoPrecipitationValues(
  values: {
    readonly weather_code: number;
    readonly precipitation?: number | null;
    readonly rain?: number | null;
    readonly showers?: number | null;
    readonly snowfall?: number | null;
    readonly precipitation_probability?: number | null;
  },
  path: string,
): Precipitation | undefined {
  const amount = optionalNonNegative(`${path}.precipitation`, values.precipitation);
  const rain = optionalNonNegative(`${path}.rain`, values.rain);
  const showers = optionalNonNegative(`${path}.showers`, values.showers);
  const snowfall = optionalNonNegative(`${path}.snowfall`, values.snowfall);
  const probabilityPercent =
    values.precipitation_probability === null ||
    values.precipitation_probability === undefined
      ? undefined
      : requireRange(
          `${path}.precipitation_probability`,
          values.precipitation_probability,
          0,
          100,
        );

  if (
    amount === undefined &&
    rain === undefined &&
    showers === undefined &&
    snowfall === undefined &&
    probabilityPercent === undefined
  ) {
    return undefined;
  }

  const type = precipitationTypeForCode(values.weather_code, values);
  return {
    type,
    ...(probabilityPercent === undefined ? {} : { probability: probabilityPercent / 100 }),
    ...(amount === undefined ? {} : { amountMillimeters: amount }),
    intensity: precipitationIntensityForCode(values.weather_code, type),
  };
}

export function mapOpenMeteoMoonPhase(fraction: number): MoonPhase {
  requireRange('daily.moon_phase', fraction, 0, 1);

  if (fraction < 0.0625 || fraction >= 0.9375) return 'new';
  if (fraction < 0.1875) return 'waxing_crescent';
  if (fraction < 0.3125) return 'first_quarter';
  if (fraction < 0.4375) return 'waxing_gibbous';
  if (fraction < 0.5625) return 'full';
  if (fraction < 0.6875) return 'waning_gibbous';
  if (fraction < 0.8125) return 'last_quarter';
  return 'waning_crescent';
}

function mapAstronomy(
  daily: OpenMeteoForecastDailyDto | undefined,
  index: number | undefined,
): { readonly sun?: SunData; readonly moon?: MoonData } {
  if (daily === undefined || index === undefined) {
    return {};
  }

  const sunrise = daily.sunrise?.[index];
  const sunset = daily.sunset?.[index];
  const phase = daily.moon_phase?.[index];
  const moonrise = daily.moonrise?.[index];
  const moonset = daily.moonset?.[index];

  const sun =
    sunrise === null || sunrise === undefined || sunset === null || sunset === undefined
      ? undefined
      : {
          sunrise: epochSecondsToIso('daily.sunrise', sunrise),
          sunset: epochSecondsToIso('daily.sunset', sunset),
        };
  const moon =
    phase === null || phase === undefined
      ? undefined
      : {
          phase: mapOpenMeteoMoonPhase(phase),
          ...(moonrise === null || moonrise === undefined
            ? {}
            : { moonrise: epochSecondsToIso('daily.moonrise', moonrise) }),
          ...(moonset === null || moonset === undefined
            ? {}
            : { moonset: epochSecondsToIso('daily.moonset', moonset) }),
        };

  return {
    ...(sun === undefined ? {} : { sun }),
    ...(moon === undefined ? {} : { moon }),
  };
}

function hourlyUvAtCurrentTime(response: OpenMeteoForecastResponseDto) {
  const hourly = response.hourly;
  if (hourly === undefined) return undefined;

  const currentHour = Math.floor(response.current.time / 3600) * 3600;
  const index = hourly.time.findIndex((time) => time === currentHour);
  const uv = index < 0 ? undefined : hourly.uv_index?.[index];
  return uv === null || uv === undefined ? undefined : requireNonNegative('hourly.uv_index', uv);
}

function mapUv(
  response: OpenMeteoForecastResponseDto,
  dailyIndex: number | undefined,
  environmental: OpenMeteoEnvironmentalSnapshot | undefined,
): UVReference | undefined {
  const index = environmental?.uv?.index ?? hourlyUvAtCurrentTime(response);
  if (index === undefined) return undefined;

  const maxToday =
    dailyIndex === undefined ? undefined : response.daily?.uv_index_max?.[dailyIndex];
  const validMax =
    maxToday === null || maxToday === undefined
      ? undefined
      : requireNonNegative('daily.uv_index_max', maxToday);

  return {
    index,
    ...(validMax === undefined ? {} : { maxToday: Math.max(index, validMax) }),
  };
}

export function adaptOpenMeteoCurrentWeather(
  response: OpenMeteoForecastResponseDto,
  location: OpenMeteoLocationContext,
  environmental?: OpenMeteoEnvironmentalSnapshot,
): CurrentWeather {
  assertNormalizedForecastUnits(response);
  const { current } = response;
  const dailyIndex = findCurrentDailyIndex(
    response.daily,
    current.time,
    response.utc_offset_seconds,
  );
  const astronomy = mapAstronomy(response.daily, dailyIndex);
  const minCelsius =
    dailyIndex === undefined ? undefined : response.daily?.temperature_2m_min?.[dailyIndex];
  const maxCelsius =
    dailyIndex === undefined ? undefined : response.daily?.temperature_2m_max?.[dailyIndex];
  const precipitation = mapOpenMeteoPrecipitation(current);
  const uv = mapUv(response, dailyIndex, environmental);
  const pressure = current.pressure_msl ?? current.surface_pressure ?? undefined;
  const cloudCover = current.cloud_cover ?? undefined;

  const weather: CurrentWeather = {
    observedAt: epochSecondsToIso('current.time', current.time),
    location: {
      ...location,
      timeZone: response.timezone,
      coordinates: { latitude: response.latitude, longitude: response.longitude },
    },
    condition: mapOpenMeteoWmoCondition(current.weather_code),
    daylight: mapOpenMeteoDaylight(current.is_day),
    temperature: {
      valueCelsius: current.temperature_2m,
      feelsLikeCelsius: current.apparent_temperature,
      ...(minCelsius === null || minCelsius === undefined ? {} : { minCelsius }),
      ...(maxCelsius === null || maxCelsius === undefined ? {} : { maxCelsius }),
    },
    humidityPercent: current.relative_humidity_2m,
    ...(pressure === undefined ? {} : { pressureHectopascals: pressure }),
    ...(cloudCover === undefined ? {} : { cloudCoverPercent: cloudCover }),
    wind: mapCurrentWind(current),
    ...(precipitation === undefined ? {} : { precipitation }),
    ...(uv === undefined ? {} : { uv }),
    ...(environmental?.airQuality === undefined
      ? {}
      : { airQuality: environmental.airQuality }),
    ...astronomy,
  };

  assertValidCurrentWeather(weather);
  return weather;
}
