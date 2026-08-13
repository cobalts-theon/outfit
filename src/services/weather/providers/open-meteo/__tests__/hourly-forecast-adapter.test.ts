import { describe, expect, it } from '@jest/globals';

import type {
  OpenMeteoForecastHourlyDto,
  OpenMeteoForecastResponseDto,
} from '@/services/weather/providers/open-meteo/forecast-dto';
import { openMeteoForecastFixture } from '@/services/weather/providers/open-meteo/fixtures/open-meteo-fixtures';
import { adaptOpenMeteoHourlyForecast } from '@/services/weather/providers/open-meteo/hourly-forecast-adapter';

const location = { name: 'Thành phố Hồ Chí Minh', countryCode: 'VN' } as const;

function responseWith(hourly: OpenMeteoForecastHourlyDto): OpenMeteoForecastResponseDto {
  return { ...openMeteoForecastFixture, hourly };
}

function minimalHourly(
  overrides: Partial<OpenMeteoForecastHourlyDto> = {},
): OpenMeteoForecastHourlyDto {
  return {
    time: [1785996000, 1785999600],
    temperature_2m: [29.5, 29.1],
    weather_code: [80, 0],
    is_day: [1, 0],
    ...overrides,
  };
}

describe('Open-Meteo hourly forecast adapter', () => {
  it('adapts ordered provider arrays into the normalized HourlyForecast contract', () => {
    const forecast = adaptOpenMeteoHourlyForecast(openMeteoForecastFixture, location);

    expect(forecast.location).toEqual({
      ...location,
      timeZone: 'Asia/Ho_Chi_Minh',
      coordinates: { latitude: 10.790861, longitude: 106.71088 },
    });
    expect(forecast.entries[0]).toEqual({
      forecastAt: '2026-08-06T06:00:00.000Z',
      condition: 'showers',
      daylight: { phase: 'day', isDay: true },
      temperatureCelsius: 29.5,
      apparentTemperatureCelsius: 35.1,
      precipitation: {
        type: 'rain',
        probability: 0.82,
        amountMillimeters: 2.1,
        intensity: 'light',
      },
      wind: {
        speedMetersPerSecond: 4.1,
        gustMetersPerSecond: 8.5,
        directionDegrees: 224,
        direction: 'SW',
      },
      uv: { index: 5.2 },
    });
  });

  it('keeps day/night independent from the centralized WMO condition mapping', () => {
    const forecast = adaptOpenMeteoHourlyForecast(
      responseWith(minimalHourly({ weather_code: [0, 0], is_day: [0, 1] })),
      location,
    );

    expect(forecast.entries.map(({ condition, daylight }) => ({ condition, daylight }))).toEqual([
      { condition: 'clear', daylight: { phase: 'night', isDay: false } },
      { condition: 'clear', daylight: { phase: 'day', isDay: true } },
    ]);
  });

  it('maps precipitation probability and rain, showers, and snowfall without merging condition', () => {
    const forecast = adaptOpenMeteoHourlyForecast(
      responseWith(
        minimalHourly({
          time: [1785996000, 1785999600, 1786003200],
          temperature_2m: [1, 24, 25],
          weather_code: [75, 80, 61],
          is_day: [0, 1, 1],
          precipitation_probability: [90, 70, 50],
          precipitation: [4, 2, 1],
          rain: [0, 0, 1],
          showers: [0, 2, 0],
          snowfall: [2, 0, 0],
        }),
      ),
      location,
    );

    expect(forecast.entries.map((entry) => entry.precipitation)).toEqual([
      { type: 'snow', probability: 0.9, amountMillimeters: 4, intensity: 'heavy' },
      { type: 'rain', probability: 0.7, amountMillimeters: 2, intensity: 'light' },
      { type: 'rain', probability: 0.5, amountMillimeters: 1, intensity: 'light' },
    ]);
    expect(forecast.entries.map((entry) => entry.condition)).toEqual([
      'heavy_snow',
      'showers',
      'light_rain',
    ]);
  });

  it('maps sustained wind, direction, and gust through existing normalized Wind', () => {
    const forecast = adaptOpenMeteoHourlyForecast(
      responseWith(
        minimalHourly({
          wind_speed_10m: [3, null],
          wind_direction_10m: [90, null],
          wind_gusts_10m: [7, null],
        }),
      ),
      location,
    );

    expect(forecast.entries[0].wind).toEqual({
      speedMetersPerSecond: 3,
      gustMetersPerSecond: 7,
      directionDegrees: 90,
      direction: 'E',
    });
    expect(forecast.entries[1].wind).toBeUndefined();
  });

  it('normalizes the provider north-boundary value of 360 degrees to domain zero', () => {
    const forecast = adaptOpenMeteoHourlyForecast(
      responseWith(
        minimalHourly({
          wind_speed_10m: [3, null],
          wind_direction_10m: [360, null],
          wind_gusts_10m: [7, null],
        }),
      ),
      location,
    );

    expect(forecast.entries[0].wind).toEqual({
      speedMetersPerSecond: 3,
      gustMetersPerSecond: 7,
      directionDegrees: 0,
      direction: 'N',
    });
  });

  it('preserves missing optional values as unavailable', () => {
    const forecast = adaptOpenMeteoHourlyForecast(
      responseWith(minimalHourly()),
      location,
    );

    expect(forecast.entries[0]).toEqual({
      forecastAt: '2026-08-06T06:00:00.000Z',
      condition: 'showers',
      daylight: { phase: 'day', isDay: true },
      temperatureCelsius: 29.5,
    });
    expect(forecast.entries[0].apparentTemperatureCelsius).toBeUndefined();
    expect(forecast.entries[0].precipitation).toBeUndefined();
    expect(forecast.entries[0].wind).toBeUndefined();
    expect(forecast.entries[0].uv).toBeUndefined();
  });

  it('uses the existing safe fallback for unknown future WMO codes', () => {
    const forecast = adaptOpenMeteoHourlyForecast(
      responseWith(minimalHourly({ weather_code: [200, 0] })),
      location,
    );

    expect(forecast.entries[0].condition).toBe('unknown');
  });

  it('rejects non-chronological timestamps and mismatched array lengths', () => {
    expect(() =>
      adaptOpenMeteoHourlyForecast(
        responseWith(minimalHourly({ time: [1785999600, 1785996000] })),
        location,
      ),
    ).toThrow('hourly.time.1');

    expect(() =>
      adaptOpenMeteoHourlyForecast(
        responseWith(minimalHourly({ apparent_temperature: [35.1] })),
        location,
      ),
    ).toThrow('hourly.apparent_temperature');
  });

  it('normalizes Unix instants while preserving the IANA timezone across a local day boundary', () => {
    const forecast = adaptOpenMeteoHourlyForecast(
      responseWith(
        minimalHourly({
          time: [1786032000, 1786035600],
        }),
      ),
      location,
    );

    expect(forecast.location.timeZone).toBe('Asia/Ho_Chi_Minh');
    expect(forecast.entries.map((entry) => entry.forecastAt)).toEqual([
      '2026-08-06T16:00:00.000Z',
      '2026-08-06T17:00:00.000Z',
    ]);
    const localDates = forecast.entries.map((entry) =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone: forecast.location.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(entry.forecastAt)),
    );
    expect(localDates).toEqual(['06/08/2026', '07/08/2026']);
  });

  it('preserves a truthful chronological gap instead of fabricating a missing hour', () => {
    const forecast = adaptOpenMeteoHourlyForecast(
      responseWith(
        minimalHourly({
          time: [1785996000, 1786003200],
        }),
      ),
      location,
    );

    expect(forecast.entries.map((entry) => entry.forecastAt)).toEqual([
      '2026-08-06T06:00:00.000Z',
      '2026-08-06T08:00:00.000Z',
    ]);
  });
});
