import { describe, expect, it } from '@jest/globals';

import { WEATHER_CONDITIONS } from '@/features/weather/domain/weather-condition';
import {
  clearNightWeather,
  highUvWeather,
  partialCurrentWeather,
  severeAlertWeather,
  unhealthyAirQualityWeather,
} from '@/features/weather/fixtures/current-weather-fixtures';
import {
  formatWind,
  getConditionLabel,
  HOME_PROTOTYPE_SCENARIOS,
} from '@/features/home/model/home-prototype';

describe('Home prototype presentation model', () => {
  it('keeps canonical conditions at the UI boundary', () => {
    for (const condition of WEATHER_CONDITIONS) {
      expect(getConditionLabel(condition).length).toBeGreaterThan(0);
    }

    const serialized = JSON.stringify(HOME_PROTOTYPE_SCENARIOS);
    expect(serialized).not.toContain('weather_code');
    expect(serialized).not.toContain('temperature_2m');
  });

  it('covers the required visual-validation fixture states', () => {
    expect(HOME_PROTOTYPE_SCENARIOS.some((scenario) => scenario.weather === clearNightWeather)).toBe(
      true,
    );
    expect(HOME_PROTOTYPE_SCENARIOS.some((scenario) => scenario.weather === highUvWeather)).toBe(
      true,
    );
    expect(
      HOME_PROTOTYPE_SCENARIOS.some((scenario) => scenario.weather === unhealthyAirQualityWeather),
    ).toBe(true);
    expect(
      HOME_PROTOTYPE_SCENARIOS.some((scenario) => scenario.weather === severeAlertWeather),
    ).toBe(true);
    expect(
      HOME_PROTOTYPE_SCENARIOS.some((scenario) => scenario.weather === partialCurrentWeather),
    ).toBe(true);
  });

  it('keeps forecast previews explicitly separate and canonical', () => {
    for (const scenario of HOME_PROTOTYPE_SCENARIOS) {
      for (const item of scenario.forecast.items) {
        expect(WEATHER_CONDITIONS).toContain(item.condition);
        expect(item.id).toBeTruthy();
        expect(Number.isFinite(item.temperatureCelsius)).toBe(true);
      }
    }
  });

  it('degrades gracefully when optional environmental data is missing', () => {
    const partial = HOME_PROTOTYPE_SCENARIOS.find((scenario) => scenario.id === 'partial-data');

    expect(partial?.weather).toBe(partialCurrentWeather);
    expect(partial?.risk.tone).toBe('unavailable');
    expect(partial?.forecast.items).toHaveLength(0);
    expect(formatWind(partialCurrentWeather)).toBe('9 km/h');
  });

  it('does not inflate fixture alert severity', () => {
    const severe = HOME_PROTOTYPE_SCENARIOS.find((scenario) => scenario.id === 'severe-alert');

    expect(severeAlertWeather.alerts[0].severity).toBe('extreme');
    expect(severe?.risk.levelLabel).toBe('CẢNH BÁO CỰC ĐỘ');
    expect(severe?.risk.reason).toBe(severeAlertWeather.alerts[0].description);
  });
});

