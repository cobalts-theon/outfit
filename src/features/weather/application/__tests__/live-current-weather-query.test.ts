import { describe, expect, it } from '@jest/globals';

import type { SelectedAppLocation } from '@/features/locations/domain/location';
import {
  LIVE_CURRENT_WEATHER_STALE_TIME_MS,
  liveCurrentWeatherKeys,
  liveCurrentWeatherQueryOptions,
} from '@/features/weather/application/live-current-weather-query';

function location(
  latitude: number,
  longitude: number,
  overrides: Partial<SelectedAppLocation> = {},
): SelectedAppLocation {
  return {
    coordinates: { latitude, longitude },
    source: 'device',
    selectedAt: '2026-08-07T02:00:00.000Z',
    ...overrides,
  };
}

describe('live CurrentWeather query identity', () => {
  it('disables the query when no SelectedAppLocation exists', () => {
    const options = liveCurrentWeatherQueryOptions(undefined);

    expect(options.enabled).toBe(false);
    expect(options.queryKey).toEqual([
      'weather',
      'current-hourly-daily',
      'v3',
      'unavailable',
    ]);
    expect(options.staleTime).toBe(LIVE_CURRENT_WEATHER_STALE_TIME_MS);
    expect(options.refetchOnReconnect).toBe(true);
    expect(options.refetchOnWindowFocus).toBe(true);
  });

  it('keeps the key stable across insignificant GPS jitter and selection timestamps', () => {
    const first = location(10.77691, 106.70091);
    const jittered = location(10.77694, 106.70094, {
      selectedAt: '2026-08-07T02:05:00.000Z',
    });

    expect(liveCurrentWeatherKeys.location(first)).toEqual(
      liveCurrentWeatherKeys.location(jittered),
    );
  });

  it('creates a new query identity when the normalized location changes', () => {
    const first = location(10.7769, 106.7009);
    const moved = location(10.7791, 106.7041);

    expect(liveCurrentWeatherKeys.location(first)).not.toEqual(
      liveCurrentWeatherKeys.location(moved),
    );
  });

  it('includes coordinate/source identity and AQI scale inputs in the key', () => {
    const device = location(10.7769, 106.7009);
    const manual = location(10.7769, 106.7009, {
      source: 'manual',
      label: 'Quận 1',
    });
    const key = liveCurrentWeatherKeys.location(manual);

    expect(key).not.toEqual(liveCurrentWeatherKeys.location(device));
    expect(key[3]).toMatchObject({
      locationIdentity: 'manual:10.777,106.701',
      aqiScale: 'us_aqi',
    });
  });

  it('does not refetch weather when reverse geocoding only improves the label', () => {
    const unnamed = location(10.7769, 106.7009);
    const named = location(10.7769, 106.7009, {
      label: 'Quận 1 · Thành phố Hồ Chí Minh',
    });

    expect(liveCurrentWeatherKeys.location(named)).toEqual(
      liveCurrentWeatherKeys.location(unnamed),
    );
  });
});
