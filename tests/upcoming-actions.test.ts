import { describe, expect, it } from '@jest/globals';
import { partlyCloudyWeather } from '@/constants/demo-weather';
import { createUpcomingActions } from '@/utils/recommendations';
import type { HourlyForecast } from '@/types/weather';

const now = Date.parse('2026-09-11T03:00:00Z');

const weather = { ...partlyCloudyWeather, condition: 'clear' as const, precipitation: { type: 'none' as const }, location: { ...partlyCloudyWeather.location, timeZone: 'Asia/Ho_Chi_Minh' } };

const forecast: HourlyForecast = { location: weather.location, entries: [{
  forecastAt: '2026-09-11T05:00:00Z', condition: 'rain', daylight: { phase: 'day', isDay: true },
  temperatureCelsius: 28, precipitation: { type: 'rain', probability: 0.8 },
}] };

describe('near-term activity preparation', () => {
  it('explains a future change using destination-local time and forecast evidence', () => {
    expect(createUpcomingActions(weather, forecast, now, now)[0]).toMatchObject({ at: '12:00' });
    expect(createUpcomingActions(weather, forecast, now, now)[0].reason).toContain('80%');
  });
  it('omits absent, stale, elapsed and out-of-range forecasts', () => {
    expect(createUpcomingActions(weather, undefined, now, now)).toEqual([]);
    expect(createUpcomingActions(weather, forecast, now - 31 * 60_000, now)).toEqual([]);
    expect(createUpcomingActions(weather, forecast, now + 3 * 3600_000, now + 3 * 3600_000)).toEqual([]);
    expect(createUpcomingActions(weather, forecast, now - 6 * 3600_000, now - 6 * 3600_000)).toEqual([]);
  });
  it('does not infer rain or a safe activity window from absent probability', () => {
    expect(createUpcomingActions(weather, { ...forecast, entries: forecast.entries.map(e => ({ ...e, precipitation: undefined })) }, now, now)).toEqual([]);
  });
  it('does not describe current drizzle as rain that has not started', () => {
    const result = createUpcomingActions({ ...weather, condition: 'drizzle', precipitation: undefined }, forecast, now, now);
    expect(result[0].title).toBe('Nếu định ra ngoài, chuẩn bị phương án tránh mưa');
  });
});
