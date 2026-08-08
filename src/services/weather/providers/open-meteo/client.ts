import { parseOpenMeteoAirQualityResponse } from '@/services/weather/providers/open-meteo/air-quality-dto';
import {
  OpenMeteoHttpError,
  OpenMeteoResponseError,
} from '@/services/weather/providers/open-meteo/errors';
import {
  parseOpenMeteoForecastResponse,
  parseOpenMeteoLiveForecastResponse,
} from '@/services/weather/providers/open-meteo/forecast-dto';
import {
  buildOpenMeteoAirQualityUrl,
  buildOpenMeteoCurrentAirQualityUrl,
  buildOpenMeteoCurrentWeatherForecastUrl,
  buildOpenMeteoForecastUrl,
  buildOpenMeteoLiveWeatherForecastUrl,
  type OpenMeteoRequestCoordinates,
} from '@/services/weather/providers/open-meteo/request';

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
  options: {
    readonly signal?: AbortSignal;
    readonly fetchImplementation?: OpenMeteoFetch;
  } = {},
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
  options: {
    readonly signal?: AbortSignal;
    readonly fetchImplementation?: OpenMeteoFetch;
  } = {},
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
  options: {
    readonly signal?: AbortSignal;
    readonly fetchImplementation?: OpenMeteoFetch;
  } = {},
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
  options: {
    readonly signal?: AbortSignal;
    readonly fetchImplementation?: OpenMeteoFetch;
  } = {},
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
  options: {
    readonly signal?: AbortSignal;
    readonly fetchImplementation?: OpenMeteoFetch;
  } = {},
) {
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const payload = await fetchJson(
    buildOpenMeteoCurrentAirQualityUrl(coordinates),
    options.signal,
    fetchImplementation,
  );

  return parseOpenMeteoAirQualityResponse(payload);
}
