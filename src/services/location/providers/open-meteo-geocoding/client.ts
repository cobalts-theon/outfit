import type { ManualLocationCandidate } from '@/features/locations/domain/manual-location';

import { adaptOpenMeteoGeocodingResults } from './adapter';
import { parseOpenMeteoGeocodingResponse } from './dto';

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
export const LOCATION_SEARCH_TIMEOUT_MS = 20_000;

export type LocationSearchErrorCode =
  | 'network'
  | 'timeout'
  | 'rate_limit'
  | 'provider'
  | 'invalid_response';

export class LocationSearchError extends Error {
  readonly code: LocationSearchErrorCode;
  readonly status?: number;

  constructor(code: LocationSearchErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'LocationSearchError';
    this.code = code;
    this.status = status;
  }
}

interface GeocodingFetchResponse {
  readonly ok: boolean;
  readonly status: number;
  json(): Promise<unknown>;
}

type GeocodingFetch = (
  input: string,
  init: { readonly signal: AbortSignal },
) => Promise<GeocodingFetchResponse>;

interface LocationSearchDependencies {
  readonly fetchImplementation?: GeocodingFetch;
  readonly timeoutMs?: number;
}

export async function searchOpenMeteoLocations(
  query: string,
  signal?: AbortSignal,
  dependencies: LocationSearchDependencies = {},
): Promise<readonly ManualLocationCandidate[]> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) {
    return [];
  }

  const fetchImplementation = dependencies.fetchImplementation ?? fetch;
  const timeoutMs = dependencies.timeoutMs ?? LOCATION_SEARCH_TIMEOUT_MS;
  const timeoutController = new AbortController();
  let abortedByCaller = signal?.aborted ?? false;
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);
  const abortFromCaller = () => timeoutController.abort();
  const markCallerAbort = () => {
    abortedByCaller = true;
    abortFromCaller();
  };
  signal?.addEventListener('abort', markCallerAbort, { once: true });
  if (abortedByCaller) {
    timeoutController.abort();
  }

  try {
    const response = await fetchImplementation(
      `${GEOCODING_ENDPOINT}?name=${encodeURIComponent(normalizedQuery)}&count=8&language=vi&format=json`,
      { signal: timeoutController.signal },
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new LocationSearchError(
          'rate_limit',
          'Dịch vụ tìm kiếm đang nhận quá nhiều yêu cầu.',
          response.status,
        );
      }

      throw new LocationSearchError(
        'provider',
        `Dịch vụ tìm kiếm phản hồi HTTP ${response.status}.`,
        response.status,
      );
    }

    try {
      return adaptOpenMeteoGeocodingResults(
        parseOpenMeteoGeocodingResponse(await response.json()),
      );
    } catch {
      throw new LocationSearchError(
        'invalid_response',
        'Dịch vụ tìm kiếm trả về dữ liệu không hợp lệ.',
      );
    }
  } catch (error) {
    if (error instanceof LocationSearchError) {
      throw error;
    }

    if (timeoutController.signal.aborted) {
      if (abortedByCaller) {
        throw error;
      }

      throw new LocationSearchError(
        'timeout',
        'Tìm địa điểm quá thời gian. Hãy thử lại.',
      );
    }

    throw new LocationSearchError(
      'network',
      'Không thể kết nối tới dịch vụ tìm địa điểm.',
    );
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', markCallerAbort);
  }
}
