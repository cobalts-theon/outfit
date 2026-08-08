import { describe, expect, it } from '@jest/globals';

import type { CurrentWeather } from '@/features/weather/domain/current-weather';
import {
  clearDayWeather,
  clearNightWeather,
  partialCurrentWeather,
  unhealthyAirQualityWeather,
} from '@/features/weather/fixtures/current-weather-fixtures';
import { getWeatherGlyphState } from '@/features/home/model/weather-glyph-state';

describe('Home weather glyph composition', () => {
  it('keeps moon visibility independent from the canonical condition', () => {
    const clearNight = getWeatherGlyphState(clearNightWeather);
    const sameConditionWithoutMoon = getWeatherGlyphState({
      ...clearNightWeather,
      moon: undefined,
    } satisfies CurrentWeather);

    expect(clearNight.hasVisibleMoon).toBe(true);
    expect(sameConditionWithoutMoon.hasVisibleMoon).toBe(false);
    expect(clearNight.hasCloud).toBe(sameConditionWithoutMoon.hasCloud);
  });

  it('changes particulate density from normalized AQI without changing weather condition', () => {
    const clearAir = getWeatherGlyphState(clearDayWeather);
    const unhealthyClearAir = getWeatherGlyphState({
      ...clearDayWeather,
      airQuality: unhealthyAirQualityWeather.airQuality,
    } satisfies CurrentWeather);

    expect(unhealthyClearAir.particleCount).toBeGreaterThan(clearAir.particleCount);
    expect(unhealthyClearAir.hasElevatedAqi).toBe(true);
    expect(unhealthyClearAir.hasCloud).toBe(clearAir.hasCloud);
  });

  it('preserves wind and partial-data fallbacks independently', () => {
    const partial = getWeatherGlyphState(partialCurrentWeather);

    expect(partial.windRotation).toBe('0deg');
    expect(partial.windOpacity).toBeGreaterThan(0);
    expect(partial.particleCount).toBe(0);
    expect(partial.hasVisibleMoon).toBe(false);
  });
});

