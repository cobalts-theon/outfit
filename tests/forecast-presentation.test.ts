import { describe, expect, it } from '@jest/globals';
import type { DailyForecast, HourlyForecast } from '@/types/weather';
import {
  createDailyForecastItems,
  createDetailedHourlyItems,
  createForecastDetails,
} from '@/utils/forecast';
import { openMeteoForecastFixture } from './fixtures/open-meteo-fixtures';
import { adaptOpenMeteoCurrentWeather } from '@/services/weather/adapters';

const hourly: HourlyForecast = {
  location: {
    name: 'Vị trí hiện tại',
    timeZone: 'Asia/Ho_Chi_Minh',
  },
  entries: [
    {
      forecastAt: '2026-08-06T16:00:00.000Z',
      condition: 'rain',
      daylight: { phase: 'night', isDay: false },
      temperatureCelsius: 28.4,
      precipitation: { type: 'rain', probability: 0.75, amountMillimeters: 1.2 },
    },
    {
      forecastAt: '2026-08-06T18:00:00.000Z',
      condition: 'partly_cloudy',
      daylight: { phase: 'night', isDay: false },
      temperatureCelsius: 27.2,
    },
  ],
};

const daily: DailyForecast = {
  location: hourly.location,
  entries: [
    {
      forecastDate: '2026-08-06',
      condition: 'rain',
      minimumTemperatureCelsius: 25.8,
      maximumTemperatureCelsius: 31.2,
      precipitation: { type: 'rain', probability: 0.9, amountMillimeters: 8.4 },
      sun: {
        sunrise: '2026-08-05T22:42:00.000Z',
        sunset: '2026-08-06T11:15:00.000Z',
      },
      moon: { phase: 'last_quarter' },
    },
    {
      forecastDate: '2026-08-07',
      condition: 'clear',
      minimumTemperatureCelsius: 26,
      maximumTemperatureCelsius: 33,
    },
  ],
};

describe('forecast presentation', () => {
  it('keeps real hourly gaps visible and labels the current local hour', () => {
    const items = createDetailedHourlyItems(hourly, '2026-08-06T16:30:00.000Z');

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      timeLabel: 'BÂY GIỜ',
      dayLabel: 'THỨ 5, 06/08',
      conditionLabel: 'Mưa',
      temperatureLabel: '28°',
      precipitationLabel: 'Mưa 75%',
      precipitationAmountLabel: '1.2 mm',
    });
    expect(items[1].timeLabel).toBe('01:00');
  });

  it('formats daily temperature and precipitation without filling missing values', () => {
    const items = createDailyForecastItems(daily);

    expect(items[0]).toEqual({
      id: '2026-08-06',
      dateLabel: 'HÔM NAY',
      conditionLabel: 'Mưa',
      condition: 'rain',
      temperatureRangeLabel: '26° / 31°',
      precipitationLabel: 'Mưa 90%',
      amountLabel: '8.4 mm',
    });
    expect(items[1].precipitationLabel).toBe('Mưa —');
    expect(items[1].amountLabel).toBeUndefined();
  });

  it('shows daylight and visibility evidence without unrelated moon or pressure details', () => {
    const weather = adaptOpenMeteoCurrentWeather(openMeteoForecastFixture, {
      name: 'Vị trí hiện tại',
    });
    const details = createForecastDetails(weather, daily);

    expect(details).toEqual([
      { label: 'MẶT TRỜI', value: '05:42 → 18:15', note: 'Bình minh / hoàng hôn' },
      { label: 'TẦM NHÌN', value: '7.2 km', note: 'Quan sát hiện tại' },
    ]);
  });
});
