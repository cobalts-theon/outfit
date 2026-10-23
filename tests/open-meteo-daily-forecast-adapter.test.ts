import { describe, expect, it } from '@jest/globals';
import type { OpenMeteoForecastDailyDto, OpenMeteoForecastResponseDto } from '@/services/weather/responses';
import { adaptOpenMeteoDailyForecast } from '@/services/weather/adapters';
import { openMeteoForecastFixture } from './fixtures/open-meteo-fixtures';

const location = { name: 'Thành phố Hồ Chí Minh', countryCode: 'VN' } as const;

function responseWith(daily: OpenMeteoForecastDailyDto): OpenMeteoForecastResponseDto {
  return { ...openMeteoForecastFixture, daily };
}

function minimalDaily(
  overrides: Partial<OpenMeteoForecastDailyDto> = {},
): OpenMeteoForecastDailyDto {
  return {
    time: [1785949200, 1786035600],
    weather_code: [80, 1],
    temperature_2m_max: [31.2, 32.4],
    temperature_2m_min: [25.8, 26.1],
    ...overrides,
  };
}

describe('Open-Meteo daily forecast adapter', () => {
  it('normalizes local dates, temperature range, condition, and precipitation', () => {
    const forecast = adaptOpenMeteoDailyForecast(
      responseWith(
        minimalDaily({
          precipitation_sum: [13.4, 0],
          precipitation_probability_max: [100, 15],
        }),
      ),
      location,
    );

    expect(forecast.location).toEqual({
      ...location,
      timeZone: 'Asia/Ho_Chi_Minh',
      coordinates: { latitude: 10.790861, longitude: 106.71088 },
    });
    expect(forecast.entries[0]).toMatchObject({
      forecastDate: '2026-08-06',
      condition: 'showers',
      minimumTemperatureCelsius: 25.8,
      maximumTemperatureCelsius: 31.2,
      precipitation: {
        type: 'rain',
        probability: 1,
        amountMillimeters: 13.4,
      },
    });
    expect(forecast.entries[1].forecastDate).toBe('2026-08-07');
  });

  it('normalizes sunrise, sunset, and provider moon phase without inventing illumination', () => {
    const forecast = adaptOpenMeteoDailyForecast(
      responseWith(
        minimalDaily({
          sunrise: [1785969720, 1786056120],
          sunset: [1786014900, 1786101300],
          moonrise: [1786034760, null],
          moonset: [1785992100, null],
          moon_phase: [0.754, 0.5],
        }),
      ),
      location,
    );

    expect(forecast.entries[0].sun).toEqual({
      sunrise: '2026-08-05T22:42:00.000Z',
      sunset: '2026-08-06T11:15:00.000Z',
    });
    expect(forecast.entries[0].moon).toMatchObject({
      phase: 'last_quarter',
      moonrise: '2026-08-06T16:46:00.000Z',
      moonset: '2026-08-06T04:55:00.000Z',
    });
    expect(forecast.entries[0].moon).not.toHaveProperty('illumination');
    expect(forecast.entries[1].moon).toEqual({ phase: 'full' });
  });

  it('preserves missing optional daily values as unavailable', () => {
    const forecast = adaptOpenMeteoDailyForecast(
      responseWith(minimalDaily()),
      location,
    );

    expect(forecast.entries[0]).toEqual({
      forecastDate: '2026-08-06',
      condition: 'showers',
      minimumTemperatureCelsius: 25.8,
      maximumTemperatureCelsius: 31.2,
    });
  });

  it('normalizes daily UV maximum with the existing UV category mapping', () => {
    const forecast = adaptOpenMeteoDailyForecast(
      responseWith(minimalDaily({ uv_index_max: [5.9, 8] })),
      location,
    );

    expect(forecast.entries.map((entry) => entry.uv)).toEqual([
      { index: 5.9, category: 'moderate' },
      { index: 8, category: 'very_high' },
    ]);
  });

  it('rejects malformed required values, temperature inversions, and array mismatches', () => {
    expect(() =>
      adaptOpenMeteoDailyForecast(
        responseWith(minimalDaily({ weather_code: [80, null] })),
        location,
      ),
    ).toThrow('daily.1.weather_code');

    expect(() =>
      adaptOpenMeteoDailyForecast(
        responseWith(
          minimalDaily({
            temperature_2m_min: [32, 26],
            temperature_2m_max: [31, 33],
          }),
        ),
        location,
      ),
    ).toThrow('daily.0.temperature_2m_min');

    expect(() =>
      adaptOpenMeteoDailyForecast(
        responseWith(minimalDaily({ precipitation_sum: [2] })),
        location,
      ),
    ).toThrow('daily.precipitation_sum');
  });

  it('rejects non-chronological local dates and invalid units', () => {
    expect(() =>
      adaptOpenMeteoDailyForecast(
        responseWith(minimalDaily({ time: [1786035600, 1785949200] })),
        location,
      ),
    ).toThrow('daily.time.1');

    expect(() =>
      adaptOpenMeteoDailyForecast(
        {
          ...responseWith(minimalDaily()),
          daily_units: {
            ...openMeteoForecastFixture.daily_units,
            temperature_2m_max: '°F',
          },
        },
        location,
      ),
    ).toThrow('daily_units.temperature_2m_max');
  });
});
