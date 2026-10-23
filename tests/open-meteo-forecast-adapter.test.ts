import { describe, expect, it } from '@jest/globals';
import { validateCurrentWeather } from '@/utils/validation';
import { adaptOpenMeteoAirQuality } from '@/services/weather/client';
import { adaptOpenMeteoCurrentWeather, mapOpenMeteoDaylight, mapOpenMeteoMoonPhase, mapOpenMeteoPrecipitation, mapOpenMeteoWindDirection } from '@/services/weather/adapters';
import type { OpenMeteoForecastResponseDto } from '@/services/weather/responses';
import { openMeteoAirQualityFixture, openMeteoForecastFixture } from './fixtures/open-meteo-fixtures';

const location = {
  name: 'Thành phố Hồ Chí Minh',
  countryCode: 'VN',
} as const;

describe('Open-Meteo current forecast adapter', () => {
  it('adapts provider JSON into the existing CurrentWeather contract', () => {
    const environmental = adaptOpenMeteoAirQuality(openMeteoAirQualityFixture, 'us_aqi');
    const weather = adaptOpenMeteoCurrentWeather(
      openMeteoForecastFixture,
      location,
      environmental,
    );

    expect(weather).toMatchObject({
      observedAt: '2026-08-06T06:30:00.000Z',
      location: {
        name: 'Thành phố Hồ Chí Minh',
        countryCode: 'VN',
        timeZone: 'Asia/Ho_Chi_Minh',
        coordinates: { latitude: 10.790861, longitude: 106.71088 },
      },
      condition: 'showers',
      daylight: { phase: 'day', isDay: true },
      temperature: {
        valueCelsius: 29.6,
        feelsLikeCelsius: 35.2,
        minCelsius: 25.8,
        maxCelsius: 31.2,
      },
      humidityPercent: 78,
      pressureHectopascals: 1004.2,
      visibilityMeters: 7200,
      cloudCoverPercent: 86,
      wind: {
        speedMetersPerSecond: 4.2,
        gustMetersPerSecond: 8.7,
        directionDegrees: 225,
        direction: 'SW',
      },
      precipitation: {
        type: 'rain',
        amountMillimeters: 2.4,
        intensity: 'light',
      },
      uv: { index: 5.4, category: 'moderate', maxToday: 8.1 },
      airQuality: {
        index: 118,
        scale: 'us_aqi',
        category: 'unhealthy_for_sensitive_groups',
      },
      sun: {
        sunrise: '2026-08-05T22:42:00.000Z',
        sunset: '2026-08-06T11:15:00.000Z',
      },
      moon: {
        phase: 'last_quarter',
        moonrise: '2026-08-06T16:46:00.000Z',
        moonset: '2026-08-06T04:55:00.000Z',
      },
    });
    expect(weather.alerts).toBeUndefined();
    expect(weather.moon?.illumination).toBeUndefined();
    expect(validateCurrentWeather(weather)).toEqual({ valid: true, issues: [] });
  });

  it('maps day and night only from is_day, independently of condition', () => {
    expect(mapOpenMeteoDaylight(1)).toEqual({ phase: 'day', isDay: true });
    expect(mapOpenMeteoDaylight(0)).toEqual({ phase: 'night', isDay: false });

    const nightResponse = {
      ...openMeteoForecastFixture,
      current: { ...openMeteoForecastFixture.current, is_day: 0, weather_code: 0 },
    } satisfies OpenMeteoForecastResponseDto;
    const weather = adaptOpenMeteoCurrentWeather(nightResponse, location);

    expect(weather.condition).toBe('clear');
    expect(weather.daylight).toEqual({ phase: 'night', isDay: false });
  });

  it('maps precipitation from WMO semantics and provider amounts', () => {
    expect(
      mapOpenMeteoPrecipitation({
        ...openMeteoForecastFixture.current,
        weather_code: 75,
        precipitation: 7,
        rain: 0,
        showers: 0,
        snowfall: 4.9,
      }),
    ).toEqual({ type: 'snow', amountMillimeters: 7, intensity: 'heavy' });
    expect(
      mapOpenMeteoPrecipitation({
        ...openMeteoForecastFixture.current,
        weather_code: 0,
        precipitation: 0,
        rain: 0,
        showers: 0,
        snowfall: 0,
      }),
    ).toEqual({ type: 'none', amountMillimeters: 0, intensity: 'none' });
  });

  it('maps wind degrees into the existing eight directions', () => {
    expect(mapOpenMeteoWindDirection(0)).toBe('N');
    expect(mapOpenMeteoWindDirection(22.4)).toBe('N');
    expect(mapOpenMeteoWindDirection(22.5)).toBe('NE');
    expect(mapOpenMeteoWindDirection(180)).toBe('S');
    expect(mapOpenMeteoWindDirection(359)).toBe('N');
    expect(mapOpenMeteoWindDirection(360)).toBe('N');
  });

  it('maps the documented moon-cycle fraction without inventing illumination', () => {
    expect(mapOpenMeteoMoonPhase(0)).toBe('new');
    expect(mapOpenMeteoMoonPhase(0.125)).toBe('waxing_crescent');
    expect(mapOpenMeteoMoonPhase(0.25)).toBe('first_quarter');
    expect(mapOpenMeteoMoonPhase(0.375)).toBe('waxing_gibbous');
    expect(mapOpenMeteoMoonPhase(0.5)).toBe('full');
    expect(mapOpenMeteoMoonPhase(0.625)).toBe('waning_gibbous');
    expect(mapOpenMeteoMoonPhase(0.75)).toBe('last_quarter');
    expect(mapOpenMeteoMoonPhase(0.875)).toBe('waning_crescent');
    expect(mapOpenMeteoMoonPhase(1)).toBe('new');
  });

  it('omits unavailable optional current, forecast, and astronomy fields', () => {
    const partialResponse = {
      ...openMeteoForecastFixture,
      current: {
        time: openMeteoForecastFixture.current.time,
        interval: 900,
        temperature_2m: 29.6,
        relative_humidity_2m: 78,
        apparent_temperature: 35.2,
        is_day: 1,
        weather_code: 2,
        wind_speed_10m: 2.5,
      },
      hourly: undefined,
      daily: undefined,
    } satisfies OpenMeteoForecastResponseDto;
    const weather = adaptOpenMeteoCurrentWeather(partialResponse, location);

    expect(weather.condition).toBe('partly_cloudy');
    expect(weather.precipitation).toBeUndefined();
    expect(weather.pressureHectopascals).toBeUndefined();
    expect(weather.visibilityMeters).toBeUndefined();
    expect(weather.cloudCoverPercent).toBeUndefined();
    expect(weather.uv).toBeUndefined();
    expect(weather.sun).toBeUndefined();
    expect(weather.moon).toBeUndefined();
    expect(weather.airQuality).toBeUndefined();
    expect(weather.alerts).toBeUndefined();
    expect(validateCurrentWeather(weather).valid).toBe(true);
  });

  it('degrades an unknown future WMO code without rejecting the observation', () => {
    const response = {
      ...openMeteoForecastFixture,
      current: { ...openMeteoForecastFixture.current, weather_code: 200 },
    } satisfies OpenMeteoForecastResponseDto;

    expect(adaptOpenMeteoCurrentWeather(response, location).condition).toBe('unknown');
  });

  it('rejects malformed provider values at the adapter boundary', () => {
    const invalidDaylight = {
      ...openMeteoForecastFixture,
      current: { ...openMeteoForecastFixture.current, is_day: 2 },
    } satisfies OpenMeteoForecastResponseDto;
    const invalidWind = {
      ...openMeteoForecastFixture,
      current: { ...openMeteoForecastFixture.current, wind_speed_10m: -1 },
    } satisfies OpenMeteoForecastResponseDto;
    const invalidUnits = {
      ...openMeteoForecastFixture,
      current_units: { ...openMeteoForecastFixture.current_units, wind_speed_10m: 'km/h' },
    } satisfies OpenMeteoForecastResponseDto;

    expect(() => adaptOpenMeteoCurrentWeather(invalidDaylight, location)).toThrow(
      'current.is_day',
    );
    expect(() => adaptOpenMeteoCurrentWeather(invalidWind, location)).toThrow(
      'current.wind_speed_10m',
    );
    expect(() => adaptOpenMeteoCurrentWeather(invalidUnits, location)).toThrow(
      'current_units.wind_speed_10m',
    );
    expect(() => mapOpenMeteoMoonPhase(1.1)).toThrow('daily.moon_phase');
  });
});
