import { describe, expect, it } from '@jest/globals';

import type { HourlyForecast } from '@/features/forecast/domain/hourly-forecast';
import {
  createHomeHourlyForecastPreview,
  HOME_NEAR_TERM_HOUR_COUNT,
} from '@/features/home/model/home-hourly-forecast';

const forecast: HourlyForecast = {
  location: {
    name: 'Thành phố Hồ Chí Minh',
    timeZone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 10.777, longitude: 106.701 },
  },
  entries: Array.from({ length: 8 }, (_, index) => ({
    forecastAt: new Date(Date.UTC(2026, 7, 6, 16 + index)).toISOString(),
    condition: index === 0 ? 'rain' : 'partly_cloudy',
    daylight: { phase: 'night', isDay: false },
    temperatureCelsius: 28 - index,
    precipitation: {
      type: index === 0 ? 'rain' : 'none',
      probability: index === 0 ? 0.75 : 0,
      amountMillimeters: index === 0 ? 1.2 : 0,
    },
  })),
};

describe('Home near-term hourly forecast selection', () => {
  it('selects a presentation-only subset without limiting the domain collection', () => {
    const preview = createHomeHourlyForecastPreview(
      forecast,
      '2026-08-06T16:30:00.000Z',
    );

    expect(forecast.entries).toHaveLength(8);
    expect(preview.items).toHaveLength(HOME_NEAR_TERM_HOUR_COUNT);
    expect(preview.items[0]).toMatchObject({
      timeLabel: 'BÂY GIỜ',
      isCurrent: true,
      precipitationProbability: 0.75,
      isDay: false,
    });
  });

  it('formats later hours in the forecast IANA timezone across midnight', () => {
    const preview = createHomeHourlyForecastPreview(
      forecast,
      '2026-08-06T16:30:00.000Z',
      3,
    );

    expect(preview.items.map((item) => item.timeLabel)).toEqual([
      'BÂY GIỜ',
      '00:00',
      '01:00',
    ]);
  });

  it('does not falsely label the first future-only entry as current', () => {
    const preview = createHomeHourlyForecastPreview(
      forecast,
      '2026-08-06T15:00:00.000Z',
      1,
    );

    expect(preview.items[0].timeLabel).toBe('23:00');
    expect(preview.items[0].isCurrent).toBeUndefined();
  });
});
