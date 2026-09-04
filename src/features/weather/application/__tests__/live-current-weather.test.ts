import { describe, expect, it, jest } from '@jest/globals';

import type { SelectedAppLocation } from '@/features/locations/domain/location';
import {
  createLiveCurrentWeatherInput,
  LIVE_CURRENT_WEATHER_AQI_SCALE,
  LiveWeatherError,
  loadLiveCurrentWeather,
  shouldRetryLiveWeatherQuery,
  type LiveWeatherProviderDependencies,
} from '@/features/weather/application/live-current-weather';
import { OpenMeteoResponseError } from '@/services/weather/providers/open-meteo/errors';
import type { OpenMeteoAirQualityResponseDto } from '@/services/weather/providers/open-meteo/air-quality-dto';
import type {
  OpenMeteoForecastResponseDto,
  OpenMeteoLiveForecastDto,
} from '@/services/weather/providers/open-meteo/forecast-dto';
import {
  openMeteoAirQualityFixture,
  openMeteoForecastFixture,
} from '@/services/weather/providers/open-meteo/fixtures/open-meteo-fixtures';

const selectedLocation: SelectedAppLocation = {
  coordinates: { latitude: 10.77691, longitude: 106.70094 },
  source: 'device',
  selectedAt: '2026-08-07T02:00:00.000Z',
};

const minimalForecast = {
  ...openMeteoForecastFixture,
  hourly: undefined,
  hourly_units: undefined,
} satisfies OpenMeteoForecastResponseDto;
const liveForecast = { forecast: openMeteoForecastFixture } satisfies OpenMeteoLiveForecastDto;
const minimalLiveForecast = { forecast: minimalForecast } satisfies OpenMeteoLiveForecastDto;

function dependencies(
  forecast: () => Promise<OpenMeteoLiveForecastDto> = async () => liveForecast,
  airQuality: () => Promise<OpenMeteoAirQualityResponseDto> = async () =>
    openMeteoAirQualityFixture,
): LiveWeatherProviderDependencies {
  return {
    fetchForecast: jest.fn(forecast),
    fetchAirQuality: jest.fn(airQuality),
  };
}

describe('live CurrentWeather orchestration', () => {
  it('converts SelectedAppLocation coordinates into normalized provider input', async () => {
    const providers = dependencies();
    const input = createLiveCurrentWeatherInput(selectedLocation);

    expect(input).toMatchObject({
      coordinates: { latitude: 10.777, longitude: 106.701 },
      locationName: 'Vị trí hiện tại',
      locationIdentity: 'device:10.777,106.701',
      aqiScale: LIVE_CURRENT_WEATHER_AQI_SCALE,
    });

    await loadLiveCurrentWeather(input, { dependencies: providers });

    expect(providers.fetchForecast).toHaveBeenCalledWith(input.coordinates, {
      signal: undefined,
    });
    expect(providers.fetchAirQuality).toHaveBeenCalledWith(input.coordinates, {
      signal: undefined,
    });
  });

  it('composes successful Forecast and Air Quality responses into CurrentWeather', async () => {
    const result = await loadLiveCurrentWeather(
      createLiveCurrentWeatherInput(selectedLocation),
      { dependencies: dependencies() },
    );

    expect(result.status).toBe('complete');
    expect(result.issues).toEqual([]);
    expect(result.weather).toMatchObject({
      condition: 'showers',
      temperature: { valueCelsius: 29.6, feelsLikeCelsius: 35.2 },
      airQuality: { index: 118, scale: 'us_aqi' },
      uv: { index: 5.4 },
    });
    expect(result.hourlyForecast?.entries).toHaveLength(2);
    expect(result.dailyForecast?.entries).toHaveLength(1);
  });

  it('keeps valid weather when the optional Air Quality request fails', async () => {
    const result = await loadLiveCurrentWeather(
      createLiveCurrentWeatherInput(selectedLocation),
      {
        dependencies: dependencies(
          async () => liveForecast,
          async () => {
            throw new TypeError('network failed');
          },
        ),
      },
    );

    expect(result.status).toBe('partial');
    expect(result.weather.condition).toBe('showers');
    expect(result.weather.airQuality).toBeUndefined();
    expect(result.weather.uv).toMatchObject({ index: 5.2 });
    expect(result.issues).toMatchObject([{ source: 'air_quality', code: 'network' }]);
  });

  it('fails the complete query when Forecast fails even if Air Quality succeeds', async () => {
    await expect(
      loadLiveCurrentWeather(createLiveCurrentWeatherInput(selectedLocation), {
        dependencies: dependencies(
          async () => {
            throw new TypeError('forecast network failed');
          },
          async () => openMeteoAirQualityFixture,
        ),
      }),
    ).rejects.toMatchObject({
      name: 'LiveWeatherError',
      code: 'network',
      source: 'forecast',
    });
  });

  it('maps a malformed Forecast response to a non-provider application error', async () => {
    await expect(
      loadLiveCurrentWeather(createLiveCurrentWeatherInput(selectedLocation), {
        dependencies: dependencies(async () => {
          throw new OpenMeteoResponseError(
            'Expected a finite number.',
            'current.temperature_2m',
          );
        }),
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'malformed_response',
        source: 'forecast',
      }),
    );
  });

  it('degrades a malformed Air Quality response to explicit partial data', async () => {
    const result = await loadLiveCurrentWeather(
      createLiveCurrentWeatherInput(selectedLocation),
      {
        dependencies: dependencies(
          async () => liveForecast,
          async () => {
            throw new OpenMeteoResponseError('Expected a finite number.', 'current.pm2_5');
          },
        ),
      },
    );

    expect(result.status).toBe('partial');
    expect(result.issues).toMatchObject([
      { source: 'air_quality', code: 'malformed_response' },
    ]);
    expect(result.weather.airQuality).toBeUndefined();
    expect(result.weather.uv).toMatchObject({ index: 5.2 });
  });

  it('keeps current weather when provider parsing marks only hourly data malformed', async () => {
    const result = await loadLiveCurrentWeather(
      createLiveCurrentWeatherInput(selectedLocation),
      {
        dependencies: dependencies(async () => ({
          forecast: minimalForecast,
          hourlyIssue: { code: 'malformed_response' },
        })),
      },
    );

    expect(result.status).toBe('partial');
    expect(result.weather.condition).toBe('showers');
    expect(result.weather.airQuality?.index).toBe(118);
    expect(result.hourlyForecast).toBeUndefined();
    expect(result.issues).toMatchObject([
      { source: 'hourly_forecast', code: 'malformed_response' },
    ]);
  });

  it('keeps current weather when hourly arrays have mismatched lengths', async () => {
    const mismatched = {
      ...openMeteoForecastFixture,
      hourly: {
        ...openMeteoForecastFixture.hourly,
        apparent_temperature: [35.1],
      },
    } satisfies OpenMeteoForecastResponseDto;
    const result = await loadLiveCurrentWeather(
      createLiveCurrentWeatherInput(selectedLocation),
      {
        dependencies: dependencies(async () => ({ forecast: mismatched })),
      },
    );

    expect(result.status).toBe('partial');
    expect(result.weather.temperature.valueCelsius).toBe(29.6);
    expect(result.hourlyForecast).toBeUndefined();
    expect(result.issues).toMatchObject([
      { source: 'hourly_forecast', code: 'malformed_response' },
    ]);
  });

  it('keeps current and hourly data when only the daily slice is malformed', async () => {
    const result = await loadLiveCurrentWeather(
      createLiveCurrentWeatherInput(selectedLocation),
      {
        dependencies: dependencies(async () => ({
          forecast: { ...openMeteoForecastFixture, daily: undefined },
          dailyIssue: { code: 'malformed_response' },
        })),
      },
    );

    expect(result.status).toBe('partial');
    expect(result.weather.temperature.valueCelsius).toBe(29.6);
    expect(result.hourlyForecast?.entries).toHaveLength(2);
    expect(result.dailyForecast).toBeUndefined();
    expect(result.issues).toContainEqual({
      source: 'daily_forecast',
      code: 'malformed_response',
      message: 'Chuỗi dự báo theo ngày nhận được không đúng định dạng mong đợi.',
    });
  });

  it('preserves unavailable optional values and never invents environmental zeroes', async () => {
    const unavailableAirQuality = {
      ...openMeteoAirQualityFixture,
      current: {
        time: openMeteoAirQualityFixture.current.time,
        interval: openMeteoAirQualityFixture.current.interval,
      },
      hourly: undefined,
    } satisfies OpenMeteoAirQualityResponseDto;

    const result = await loadLiveCurrentWeather(
      createLiveCurrentWeatherInput(selectedLocation),
      {
        dependencies: dependencies(
          async () => minimalLiveForecast,
          async () => unavailableAirQuality,
        ),
      },
    );

    expect(result.status).toBe('partial');
    expect(result.weather.airQuality).toBeUndefined();
    expect(result.weather.uv).toBeUndefined();
    expect(result.issues.map((issue) => issue.code)).toEqual([
      'hourly_forecast_unavailable',
      'air_quality_unavailable',
      'uv_unavailable',
    ]);
    expect(JSON.stringify(result.weather)).not.toContain('"index":0');
  });

  it('preserves the explicit application AQI scale through composition', async () => {
    const result = await loadLiveCurrentWeather(
      createLiveCurrentWeatherInput(selectedLocation),
      { dependencies: dependencies() },
    );

    expect(result.weather.airQuality).toMatchObject({
      index: 118,
      scale: LIVE_CURRENT_WEATHER_AQI_SCALE,
    });
  });

  it('retries transient failures but not deterministic malformed responses', () => {
    expect(
      shouldRetryLiveWeatherQuery(
        0,
        new LiveWeatherError('network', 'forecast', 'network'),
      ),
    ).toBe(true);
    expect(
      shouldRetryLiveWeatherQuery(
        0,
        new LiveWeatherError('malformed_response', 'forecast', 'malformed'),
      ),
    ).toBe(false);
    expect(
      shouldRetryLiveWeatherQuery(
        2,
        new LiveWeatherError('provider_unavailable', 'forecast', 'provider'),
      ),
    ).toBe(false);
  });
});
