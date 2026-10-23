import type {
  AirQualityCategory,
  AirQualityReference,
  PollutantConcentrations,
  UVCategory,
  UVReference,
} from '@/types/weather';
import {
  type OpenMeteoAirQualityResponseDto,
  parseOpenMeteoAirQualityResponse,
  parseOpenMeteoForecastResponse,
  parseOpenMeteoLiveForecastResponse,
} from '@/services/weather/responses';
import {
  OpenMeteoResponseError,
  OpenMeteoHttpError,
  buildOpenMeteoAirQualityUrl,
  buildOpenMeteoCurrentAirQualityUrl,
  buildOpenMeteoCurrentWeatherForecastUrl,
  buildOpenMeteoForecastUrl,
  buildOpenMeteoLiveWeatherForecastUrl,
  type OpenMeteoRequestCoordinates,
} from '@/services/weather/request';

// air-quality-adapter

export type OpenMeteoAqiScale = 'european_aqi' | 'us_aqi';

export interface OpenMeteoEnvironmentalSnapshot {
  readonly airQuality?: AirQualityReference;
  readonly uv?: UVReference;
}

const pollutantUnitKeys = [
  'pm2_5',
  'pm10',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'ozone',
] as const;

function assertPollutantUnits(response: OpenMeteoAirQualityResponseDto) {
  for (const key of pollutantUnitKeys) {
    const unit = response.current_units?.[key];
    if (unit !== undefined && unit !== 'μg/m³') {
      throw new OpenMeteoResponseError(
        `Expected μg/m³ but received ${unit}.`,
        `current_units.${key}`,
      );
    }
  }
}

function optionalMeasurement(path: string, value: number | null | undefined) {
  if (value === null || value === undefined) return undefined;
  if (!Number.isFinite(value) || value < 0) {
    throw new OpenMeteoResponseError('Expected a non-negative value.', path);
  }
  return value;
}

function usAqiCategory(index: number): AirQualityCategory {
  if (index <= 50) return 'good';
  if (index <= 100) return 'moderate';
  if (index <= 150) return 'unhealthy_for_sensitive_groups';
  if (index <= 200) return 'unhealthy';
  if (index <= 300) return 'very_unhealthy';
  return 'hazardous';
}

export function uvIndexCategory(index: number): UVCategory {
  if (index < 3) return 'low';
  if (index < 6) return 'moderate';
  if (index < 8) return 'high';
  if (index < 11) return 'very_high';
  return 'extreme';
}

function mapPollutants(
  response: OpenMeteoAirQualityResponseDto,
): PollutantConcentrations | undefined {
  const current = response.current;
  const pollutants: PollutantConcentrations = {
    pm25MicrogramsPerCubicMeter: optionalMeasurement('current.pm2_5', current.pm2_5),
    pm10MicrogramsPerCubicMeter: optionalMeasurement('current.pm10', current.pm10),
    coMicrogramsPerCubicMeter: optionalMeasurement(
      'current.carbon_monoxide',
      current.carbon_monoxide,
    ),
    no2MicrogramsPerCubicMeter: optionalMeasurement(
      'current.nitrogen_dioxide',
      current.nitrogen_dioxide,
    ),
    so2MicrogramsPerCubicMeter: optionalMeasurement(
      'current.sulphur_dioxide',
      current.sulphur_dioxide,
    ),
    o3MicrogramsPerCubicMeter: optionalMeasurement('current.ozone', current.ozone),
  };

  return Object.values(pollutants).every((value) => value === undefined) ? undefined : pollutants;
}

export function adaptOpenMeteoAirQuality(
  response: OpenMeteoAirQualityResponseDto,
  scale: OpenMeteoAqiScale,
): OpenMeteoEnvironmentalSnapshot {
  assertPollutantUnits(response);
  const rawIndex = response.current[scale];
  const index = optionalMeasurement(`current.${scale}`, rawIndex);
  const pollutants = mapPollutants(response);
  const uvIndex = optionalMeasurement('current.uv_index', response.current.uv_index);

  const airQuality =
    index === undefined
      ? undefined
      : {
          index,
          scale,
          ...(scale === 'us_aqi' ? { category: usAqiCategory(index) } : {}),
          ...(pollutants === undefined ? {} : { pollutants }),
        };
  const uv =
    uvIndex === undefined ? undefined : { index: uvIndex, category: uvIndexCategory(uvIndex) };

  return {
    ...(airQuality === undefined ? {} : { airQuality }),
    ...(uv === undefined ? {} : { uv }),
  };
}

// client

export interface OpenMeteoFetchResponse {
  readonly ok: boolean;
  readonly status: number;
  json(): Promise<unknown>;
}

export type OpenMeteoFetch = (
  input: string,
  init?: { readonly signal?: AbortSignal },
) => Promise<OpenMeteoFetchResponse>;

async function fetchJson(
  url: string,
  signal: AbortSignal | undefined,
  fetchImplementation: OpenMeteoFetch,
) {
  const response = await fetchImplementation(url, { signal });

  if (!response.ok) {
    throw new OpenMeteoHttpError(response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new OpenMeteoResponseError('Expected a valid JSON response.');
  }
}

export async function fetchOpenMeteoForecast(
  coordinates: OpenMeteoRequestCoordinates,
  options: { readonly signal?: AbortSignal; readonly fetchImplementation?: OpenMeteoFetch } = {},
) {
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const payload = await fetchJson(
    buildOpenMeteoForecastUrl(coordinates),
    options.signal,
    fetchImplementation,
  );

  return parseOpenMeteoForecastResponse(payload);
}

export async function fetchOpenMeteoAirQuality(
  coordinates: OpenMeteoRequestCoordinates,
  options: { readonly signal?: AbortSignal; readonly fetchImplementation?: OpenMeteoFetch } = {},
) {
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const payload = await fetchJson(
    buildOpenMeteoAirQualityUrl(coordinates),
    options.signal,
    fetchImplementation,
  );

  return parseOpenMeteoAirQualityResponse(payload);
}

export async function fetchOpenMeteoCurrentWeatherForecast(
  coordinates: OpenMeteoRequestCoordinates,
  options: { readonly signal?: AbortSignal; readonly fetchImplementation?: OpenMeteoFetch } = {},
) {
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const payload = await fetchJson(
    buildOpenMeteoCurrentWeatherForecastUrl(coordinates),
    options.signal,
    fetchImplementation,
  );

  return parseOpenMeteoForecastResponse(payload);
}

export async function fetchOpenMeteoLiveWeatherForecast(
  coordinates: OpenMeteoRequestCoordinates,
  options: { readonly signal?: AbortSignal; readonly fetchImplementation?: OpenMeteoFetch } = {},
) {
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const payload = await fetchJson(
    buildOpenMeteoLiveWeatherForecastUrl(coordinates),
    options.signal,
    fetchImplementation,
  );

  return parseOpenMeteoLiveForecastResponse(payload);
}

export async function fetchOpenMeteoCurrentAirQuality(
  coordinates: OpenMeteoRequestCoordinates,
  options: { readonly signal?: AbortSignal; readonly fetchImplementation?: OpenMeteoFetch } = {},
) {
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const payload = await fetchJson(
    buildOpenMeteoCurrentAirQualityUrl(coordinates),
    options.signal,
    fetchImplementation,
  );

  return parseOpenMeteoAirQualityResponse(payload);
}

// hourly-air-quality

export async function fetchHourlyAirQuality(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<Record<string, number>> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 15_000);
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=us_aqi&timeformat=unixtime&timezone=auto&forecast_days=3`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error('Không tải được dự báo chất lượng không khí.');
    const json = await response.json();
    const times: unknown = json?.hourly?.time;
    const values: unknown = json?.hourly?.us_aqi;
    if (
      !Array.isArray(times) ||
      !Array.isArray(values) ||
      times.length !== values.length ||
      json?.hourly_units?.time !== 'unixtime' ||
      json?.hourly_units?.us_aqi !== 'USAQI'
    )
      throw new Error('Dự báo AQI không hợp lệ.');
    const result: Record<string, number> = {};
    let previous = -Infinity;
    times.forEach((time, i) => {
      if (
        typeof time !== 'number' ||
        !Number.isFinite(time) ||
        time <= previous ||
        !Number.isFinite(new Date(time * 1000).getTime())
      )
        throw new Error('Mốc thời gian AQI không hợp lệ.');
      previous = time;
      const value = values[i];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0)
        result[new Date(time * 1000).toISOString()] = value;
    });
    return result;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
