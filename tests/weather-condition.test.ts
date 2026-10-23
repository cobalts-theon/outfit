import { describe, expect, it } from '@jest/globals';
import { WEATHER_CONDITIONS, isWeatherCondition } from '@/types/weather';

describe('WeatherCondition', () => {
  it('contains the documented canonical 33-condition vocabulary', () => {
    expect(WEATHER_CONDITIONS).toHaveLength(33);
    expect(new Set(WEATHER_CONDITIONS).size).toBe(WEATHER_CONDITIONS.length);
    expect(WEATHER_CONDITIONS).toContain('unknown');
  });

  it('accepts every canonical value and rejects combinatorial values', () => {
    for (const condition of WEATHER_CONDITIONS) {
      expect(isWeatherCondition(condition)).toBe(true);
    }

    expect(isWeatherCondition('full_moon_heavy_rain')).toBe(false);
    expect(isWeatherCondition('cloudy_windy_night')).toBe(false);
    expect(isWeatherCondition(501)).toBe(false);
  });
});
