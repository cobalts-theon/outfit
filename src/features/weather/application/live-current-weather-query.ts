import { queryOptions, useQuery } from '@tanstack/react-query';

import type { SelectedAppLocation } from '@/features/locations/domain/location';
import {
  createLiveCurrentWeatherInput,
  LiveWeatherError,
  loadLiveCurrentWeather,
  shouldRetryLiveWeatherQuery,
  type LiveWeatherProviderDependencies,
} from '@/features/weather/application/live-current-weather';

export const LIVE_CURRENT_WEATHER_STALE_TIME_MS = 10 * 60 * 1000;

export const liveCurrentWeatherKeys = {
  // v3 reflects the shared result contract containing current, hourly, and daily data.
  all: ['weather', 'current-hourly-daily', 'v3'] as const,
  unavailable: () => [...liveCurrentWeatherKeys.all, 'unavailable'] as const,
  location: (selectedLocation: SelectedAppLocation) => {
    const input = createLiveCurrentWeatherInput(selectedLocation);
    return [
      ...liveCurrentWeatherKeys.all,
      {
        latitude: input.coordinates.latitude,
        longitude: input.coordinates.longitude,
        locationIdentity: input.locationIdentity,
        aqiScale: input.aqiScale,
      },
    ] as const;
  },
};

export function liveCurrentWeatherQueryOptions(
  selectedLocation: SelectedAppLocation | undefined,
  dependencies?: LiveWeatherProviderDependencies,
) {
  const input =
    selectedLocation === undefined
      ? undefined
      : createLiveCurrentWeatherInput(selectedLocation);

  return queryOptions({
    queryKey:
      selectedLocation === undefined
        ? liveCurrentWeatherKeys.unavailable()
        : liveCurrentWeatherKeys.location(selectedLocation),
    enabled: input !== undefined,
    queryFn: ({ signal }) => {
      if (input === undefined) {
        throw new LiveWeatherError(
          'invalid_input',
          'application',
          'Không thể tải thời tiết khi chưa có vị trí được chọn.',
        );
      }

      return loadLiveCurrentWeather(input, { signal, dependencies });
    },
    staleTime: LIVE_CURRENT_WEATHER_STALE_TIME_MS,
    retry: shouldRetryLiveWeatherQuery,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}

export function useLiveCurrentWeather(selectedLocation?: SelectedAppLocation) {
  return useQuery(liveCurrentWeatherQueryOptions(selectedLocation));
}
