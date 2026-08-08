import { describe, expect, it, jest } from '@jest/globals';

import { parseOpenMeteoAirQualityResponse } from '@/services/weather/providers/open-meteo/air-quality-dto';
import {
  fetchOpenMeteoForecast,
  fetchOpenMeteoLiveWeatherForecast,
  type OpenMeteoFetch,
} from '@/services/weather/providers/open-meteo/client';
import {
  parseOpenMeteoForecastResponse,
  parseOpenMeteoLiveForecastResponse,
} from '@/services/weather/providers/open-meteo/forecast-dto';
import {
  openMeteoAirQualityFixture,
  openMeteoForecastFixture,
} from '@/services/weather/providers/open-meteo/fixtures/open-meteo-fixtures';
import {
  OPEN_METEO_AIR_QUALITY_VARIABLES,
  OPEN_METEO_CURRENT_VARIABLES,
  OPEN_METEO_DAILY_VARIABLES,
  OPEN_METEO_HOURLY_VARIABLES,
  OPEN_METEO_CURRENT_WEATHER_DAILY_VARIABLES,
  buildOpenMeteoAirQualityUrl,
  buildOpenMeteoCurrentAirQualityUrl,
  buildOpenMeteoCurrentWeatherForecastUrl,
  buildOpenMeteoForecastUrl,
  buildOpenMeteoLiveWeatherForecastUrl,
} from '@/services/weather/providers/open-meteo/request';

const coordinates = { latitude: 10.7769, longitude: 106.7009 } as const;

describe('Open-Meteo request boundary', () => {
  it('centralizes the exact Forecast API variables and normalized units', () => {
    const url = new URL(buildOpenMeteoForecastUrl(coordinates));

    expect(url.searchParams.get('current')?.split(',')).toEqual(OPEN_METEO_CURRENT_VARIABLES);
    expect(url.searchParams.get('hourly')?.split(',')).toEqual(OPEN_METEO_HOURLY_VARIABLES);
    expect(url.searchParams.get('daily')?.split(',')).toEqual(OPEN_METEO_DAILY_VARIABLES);
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('timeformat')).toBe('unixtime');
    expect(url.searchParams.get('temperature_unit')).toBe('celsius');
    expect(url.searchParams.get('wind_speed_unit')).toBe('ms');
    expect(url.searchParams.get('precipitation_unit')).toBe('mm');
    expect(OPEN_METEO_HOURLY_VARIABLES).toEqual([
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
      'is_day',
    ]);
  });

  it('requests both AQI standards without selecting one globally', () => {
    const url = new URL(buildOpenMeteoAirQualityUrl(coordinates));

    expect(url.searchParams.get('current')?.split(',')).toEqual(
      OPEN_METEO_AIR_QUALITY_VARIABLES,
    );
    expect(url.searchParams.get('hourly')?.split(',')).toEqual(
      OPEN_METEO_AIR_QUALITY_VARIABLES,
    );
    expect(url.searchParams.get('current')).toContain('european_aqi');
    expect(url.searchParams.get('current')).toContain('us_aqi');
    expect(url.searchParams.get('timezone')).toBe('auto');
  });

  it('builds minimal current-slice requests without hourly arrays', () => {
    const forecastUrl = new URL(buildOpenMeteoCurrentWeatherForecastUrl(coordinates));
    const airQualityUrl = new URL(buildOpenMeteoCurrentAirQualityUrl(coordinates));

    expect(forecastUrl.searchParams.get('current')?.split(',')).toEqual(
      OPEN_METEO_CURRENT_VARIABLES,
    );
    expect(forecastUrl.searchParams.get('daily')?.split(',')).toEqual(
      OPEN_METEO_CURRENT_WEATHER_DAILY_VARIABLES,
    );
    expect(forecastUrl.searchParams.has('hourly')).toBe(false);
    expect(airQualityUrl.searchParams.get('current')?.split(',')).toEqual(
      OPEN_METEO_AIR_QUALITY_VARIABLES,
    );
    expect(airQualityUrl.searchParams.has('hourly')).toBe(false);
  });

  it('builds one live Forecast request for current, hourly, and current-day astronomy', () => {
    const url = new URL(buildOpenMeteoLiveWeatherForecastUrl(coordinates));

    expect(url.searchParams.get('current')?.split(',')).toEqual(
      OPEN_METEO_CURRENT_VARIABLES,
    );
    expect(url.searchParams.get('hourly')?.split(',')).toEqual(
      OPEN_METEO_HOURLY_VARIABLES,
    );
    expect(url.searchParams.get('daily')?.split(',')).toEqual(
      OPEN_METEO_CURRENT_WEATHER_DAILY_VARIABLES,
    );
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('timeformat')).toBe('unixtime');
  });

  it('rejects invalid request coordinates before any fetch', () => {
    expect(() => buildOpenMeteoForecastUrl({ latitude: 91, longitude: 0 })).toThrow(
      RangeError,
    );
    expect(() => buildOpenMeteoAirQualityUrl({ latitude: 0, longitude: -181 })).toThrow(
      RangeError,
    );
  });

  it('parses the static official-shape DTO fixture', () => {
    expect(parseOpenMeteoForecastResponse(openMeteoForecastFixture)).toEqual(
      openMeteoForecastFixture,
    );
    expect(parseOpenMeteoAirQualityResponse(openMeteoAirQualityFixture)).toEqual(
      openMeteoAirQualityFixture,
    );
  });

  it('rejects malformed JSON DTO values before adaptation', () => {
    const malformed = {
      ...openMeteoForecastFixture,
      current: { ...openMeteoForecastFixture.current, temperature_2m: '29.6' },
    };

    expect(() => parseOpenMeteoForecastResponse(malformed)).toThrow(
      'current.temperature_2m',
    );

    const malformedAirQuality = {
      ...openMeteoAirQualityFixture,
      current: { ...openMeteoAirQualityFixture.current, pm2_5: '28.4' },
    };

    expect(() => parseOpenMeteoAirQualityResponse(malformedAirQuality)).toThrow(
      'current.pm2_5',
    );
  });

  it('isolates malformed hourly JSON while retaining a valid current DTO', () => {
    const malformedHourly = {
      ...openMeteoForecastFixture,
      hourly: {
        ...openMeteoForecastFixture.hourly,
        temperature_2m: ['29.5', 29.1],
      },
    };

    const parsed = parseOpenMeteoLiveForecastResponse(malformedHourly);

    expect(parsed.forecast.current.temperature_2m).toBe(29.6);
    expect(parsed.forecast.hourly).toBeUndefined();
    expect(parsed.hourlyIssue).toEqual({ code: 'malformed_response' });
  });

  it('uses an injected Fetch-compatible transport and never needs the network in tests', async () => {
    let requestedUrl: string | undefined;
    const fetchImplementation = jest.fn<OpenMeteoFetch>(async (input) => {
      requestedUrl = input;
      return {
        ok: true,
        status: 200,
        json: async () => openMeteoForecastFixture,
      };
    });

    const result = await fetchOpenMeteoForecast(coordinates, { fetchImplementation });

    expect(result.current.temperature_2m).toBe(29.6);
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
    expect(requestedUrl).toContain('https://api.open-meteo.com/v1/forecast?');
  });

  it('fetches the combined live payload once through the tolerant provider parser', async () => {
    const fetchImplementation = jest.fn<OpenMeteoFetch>(async () => ({
      ok: true,
      status: 200,
      json: async () => openMeteoForecastFixture,
    }));

    const result = await fetchOpenMeteoLiveWeatherForecast(coordinates, {
      fetchImplementation,
    });

    expect(fetchImplementation).toHaveBeenCalledTimes(1);
    expect(result.forecast.hourly?.time).toHaveLength(2);
    expect(result.hourlyIssue).toBeUndefined();
  });

  it('rejects non-success HTTP responses before parsing', async () => {
    const fetchImplementation = jest.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    }));

    await expect(
      fetchOpenMeteoForecast(coordinates, { fetchImplementation }),
    ).rejects.toThrow('HTTP 503');
  });

  it('maps invalid response JSON into the provider response error boundary', async () => {
    const fetchImplementation = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('invalid JSON');
      },
    }));

    await expect(
      fetchOpenMeteoForecast(coordinates, { fetchImplementation }),
    ).rejects.toThrow('valid JSON response');
  });
});
