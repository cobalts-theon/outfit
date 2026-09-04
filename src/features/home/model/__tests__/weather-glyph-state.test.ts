import { describe, expect, it } from '@jest/globals';

import { getWeatherIconKey } from '@/features/home/model/weather-glyph-state';

describe('Home weather icon mapping', () => {
  it('uses separate day and night icons for clear conditions', () => {
    expect(getWeatherIconKey('clear', true)).toBe('sunny');
    expect(getWeatherIconKey('clear', false)).toBe('night');
  });

  it('maps normalized rain intensity without provider codes', () => {
    expect(getWeatherIconKey('light_rain', true)).toBe('rain_light');
    expect(getWeatherIconKey('rain', true)).toBe('rain');
    expect(getWeatherIconKey('heavy_rain', true)).toBe('rain_heavy');
  });

  it('provides a safe fallback for unknown conditions', () => {
    expect(getWeatherIconKey('unknown', true)).toBe('cloudy');
  });
});
