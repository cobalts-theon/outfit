import { describe, expect, it } from '@jest/globals';
import type { CurrentWeather } from '@/types/weather';
import { assertValidCurrentWeather, validateCurrentWeather } from '@/utils/validation';
import { CURRENT_WEATHER_FIXTURES, clearDayWeather, clearNightWeather, partialCurrentWeather, rainyNightWeather, severeAlertWeather } from '@/constants/demo-weather';

function issuePaths(weather: CurrentWeather) {
  return validateCurrentWeather(weather).issues.map((issue) => issue.path);
}

describe('CurrentWeather domain', () => {
  it('keeps every typed fixture inside the normalized invariants', () => {
    expect(CURRENT_WEATHER_FIXTURES).toHaveLength(11);

    for (const fixture of CURRENT_WEATHER_FIXTURES) {
      expect(validateCurrentWeather(fixture)).toEqual({ valid: true, issues: [] });
      expect(() => assertValidCurrentWeather(fixture)).not.toThrow();
    }
  });

  it('accepts partial data when required current-condition fields remain available', () => {
    expect(partialCurrentWeather.condition).toBe('unknown');
    expect('gustMetersPerSecond' in partialCurrentWeather.wind).toBe(false);
    expect('pressureHectopascals' in partialCurrentWeather).toBe(false);
    expect('precipitation' in partialCurrentWeather).toBe(false);
    expect('uv' in partialCurrentWeather).toBe(false);
    expect('airQuality' in partialCurrentWeather).toBe(false);
    expect('sun' in partialCurrentWeather).toBe(false);
    expect('moon' in partialCurrentWeather).toBe(false);
    expect('alerts' in partialCurrentWeather).toBe(false);
    expect(validateCurrentWeather(partialCurrentWeather).valid).toBe(true);
  });

  it('keeps day and night independent from the canonical condition', () => {
    expect(clearDayWeather.condition).toBe('clear');
    expect(clearNightWeather.condition).toBe('clear');
    expect(clearDayWeather.daylight).toEqual({ phase: 'day', isDay: true });
    expect(clearNightWeather.daylight).toEqual({ phase: 'night', isDay: false });
    expect(rainyNightWeather.condition).toBe('rain');
    expect(rainyNightWeather.daylight.isDay).toBe(false);
  });

  it('keeps moon data independent from condition, precipitation, and daylight', () => {
    const rainyFullMoon = {
      ...rainyNightWeather,
      moon: { phase: 'full', illumination: 1 },
    } as const satisfies CurrentWeather;

    expect(rainyFullMoon.condition).toBe('rain');
    expect(rainyFullMoon.precipitation.type).toBe('rain');
    expect(rainyFullMoon.daylight.phase).toBe('night');
    expect(rainyFullMoon.moon.phase).toBe('full');
    expect(validateCurrentWeather(rainyFullMoon).valid).toBe(true);
  });

  it('rejects non-canonical condition values at the adapter boundary', () => {
    const weather = {
      ...clearDayWeather,
      condition: 'cloudy_windy_night',
    } as unknown as CurrentWeather;

    expect(issuePaths(weather)).toContain('condition');
  });

  it('rejects invalid universal measurement ranges', () => {
    const invalidHumidity = {
      ...clearDayWeather,
      humidityPercent: 101,
    } as CurrentWeather;
    const invalidCoordinates = {
      ...clearDayWeather,
      location: { ...clearDayWeather.location, coordinates: { latitude: 91, longitude: 181 } },
    } as CurrentWeather;
    const invalidMoon = {
      ...clearNightWeather,
      moon: { phase: 'full', illumination: 1.2 },
    } as CurrentWeather;

    expect(issuePaths(invalidHumidity)).toContain('humidityPercent');
    expect(issuePaths(invalidCoordinates)).toEqual(
      expect.arrayContaining([
        'location.coordinates.latitude',
        'location.coordinates.longitude',
      ]),
    );
    expect(issuePaths(invalidMoon)).toContain('moon.illumination');
  });

  it('rejects invalid wind, precipitation, UV, and AQI values independently', () => {
    const invalidWind = {
      ...clearDayWeather,
      wind: { speedMetersPerSecond: 8, gustMetersPerSecond: 4 },
    } as CurrentWeather;
    const invalidPrecipitation = {
      ...clearDayWeather,
      precipitation: { type: 'none', amountMillimeters: 2, intensity: 'heavy' },
    } as CurrentWeather;
    const invalidUv = {
      ...clearDayWeather,
      uv: { index: 8, maxToday: 7 },
    } as CurrentWeather;
    const invalidAqi = {
      ...clearDayWeather,
      airQuality: { index: -1 },
    } as CurrentWeather;

    expect(issuePaths(invalidWind)).toContain('wind.gustMetersPerSecond');
    expect(issuePaths(invalidPrecipitation)).toContain('precipitation');
    expect(issuePaths(invalidUv)).toContain('uv.maxToday');
    expect(issuePaths(invalidAqi)).toContain('airQuality.index');
  });

  it('requires timezone-aware observation and environmental timestamps', () => {
    const weather = {
      ...clearDayWeather,
      observedAt: '2026-08-06T13:30:00',
      sun: {
        sunrise: '2026-08-06T05:42:00',
        sunset: '2026-08-06T18:16:00+07:00',
      },
    } as CurrentWeather;

    expect(issuePaths(weather)).toEqual(expect.arrayContaining(['observedAt', 'sun.sunrise']));
  });

  it('rejects contradictory literal day and night states', () => {
    const weather = {
      ...clearNightWeather,
      daylight: { phase: 'night', isDay: true },
    } as unknown as CurrentWeather;

    expect(issuePaths(weather)).toContain('daylight');
  });

  it('rejects duplicate alerts and alert windows that end before they start', () => {
    const sourceAlert = severeAlertWeather.alerts[0];
    const weather = {
      ...severeAlertWeather,
      alerts: [
        sourceAlert,
        {
          ...sourceAlert,
          startsAt: '2026-08-07T08:00:00+07:00',
          endsAt: '2026-08-07T07:00:00+07:00',
        },
      ],
    } as const satisfies CurrentWeather;
    const result = validateCurrentWeather(weather);

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'alerts.1.id', code: 'duplicate_id' }),
        expect.objectContaining({ path: 'alerts.1', code: 'inconsistent_value' }),
      ]),
    );
    expect(() => assertValidCurrentWeather(weather)).toThrow('Invalid CurrentWeather');
  });

  it('rejects non-finite required values', () => {
    const weather = {
      ...clearDayWeather,
      temperature: { ...clearDayWeather.temperature, valueCelsius: Number.NaN },
    } as CurrentWeather;

    expect(validateCurrentWeather(weather).issues).toContainEqual(
      expect.objectContaining({
        path: 'temperature.valueCelsius',
        code: 'invalid_number',
      }),
    );
  });
});
