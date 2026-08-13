import { describe, expect, it } from '@jest/globals';

import type { HourlyForecast } from '@/features/forecast/domain/hourly-forecast';
import {
  evaluateRecommendations,
  HOME_RECOMMENDATION_LIMIT,
} from '@/features/recommendations/domain/recommendation-engine';
import type {
  AirQualityCategory,
  CurrentWeather,
  UVCategory,
} from '@/features/weather/domain/current-weather';
import { partlyCloudyWeather } from '@/features/weather/fixtures/current-weather-fixtures';

const dry = {
  type: 'none',
  probability: 0,
  amountMillimeters: 0,
  intensity: 'none',
} as const;

const baselineWeather = {
  ...partlyCloudyWeather,
  condition: 'partly_cloudy',
  temperature: { valueCelsius: 25, feelsLikeCelsius: 26 },
  precipitation: dry,
  uv: { index: 2, category: 'low' },
  airQuality: { index: 40, scale: 'us_aqi', category: 'good' },
  alerts: [],
} as const satisfies CurrentWeather;

function weather(overrides: Partial<CurrentWeather> = {}): CurrentWeather {
  return { ...baselineWeather, ...overrides };
}

function hourlyForecast(probabilities: readonly number[] = [0, 0, 0]): HourlyForecast {
  return {
    location: baselineWeather.location,
    entries: probabilities.map((probability, index) => ({
      forecastAt: new Date(Date.UTC(2026, 7, 6, 9 + index)).toISOString(),
      condition: probability >= 0.6 ? 'rain' : 'partly_cloudy',
      daylight: { phase: 'day', isDay: true },
      temperatureCelsius: 25,
      precipitation: {
        type: probability >= 0.6 ? 'rain' : 'none',
        probability,
      },
    })),
  };
}

function evaluate(current: CurrentWeather, hourly = hourlyForecast()) {
  return evaluateRecommendations({ currentWeather: current, hourlyForecast: hourly });
}

function action(result: ReturnType<typeof evaluateRecommendations>, actionKey: string) {
  return result.recommendations.find(
    (recommendation) => recommendation.actionKey === actionKey,
  );
}

describe('deterministic recommendation engine', () => {
  it('returns an unavailable result when normalized current weather is absent', () => {
    const result = evaluateRecommendations({});

    expect(result).toEqual({
      status: 'unavailable',
      recommendations: [],
      missingDimensions: [
        'current_weather',
        'uv',
        'us_aqi',
        'precipitation',
        'hourly_forecast',
      ],
    });
  });

  it('returns a truthful no-recommendation state when all measured conditions are calm', () => {
    const result = evaluate(baselineWeather);

    expect(result.status).toBe('ready');
    expect(result.recommendations).toEqual([]);
    expect(result.primary).toBeUndefined();
  });

  it('activates UV guidance at high, very-high, and extreme category boundaries only', () => {
    const uvResult = (index: number, category: UVCategory, isDay = true) =>
      evaluate(
        weather({
          daylight: isDay
            ? { phase: 'day', isDay: true }
            : { phase: 'night', isDay: false },
          uv: { index, category },
        }),
      );

    expect(action(uvResult(5.9, 'moderate'), 'sun-protection')).toBeUndefined();
    expect(action(uvResult(6, 'high'), 'sun-protection')?.severity).toBe('attention');
    expect(action(uvResult(8, 'very_high'), 'sun-protection')?.severity).toBe('warning');
    expect(action(uvResult(11, 'extreme'), 'sun-protection')?.severity).toBe('danger');
    expect(action(uvResult(8, 'very_high', false), 'sun-protection')).toBeUndefined();
  });

  it('maps only poor U.S. AQI categories into increasingly severe outdoor guidance', () => {
    const aqiResult = (index: number, category: AirQualityCategory) =>
      evaluate(
        weather({ airQuality: { index, scale: 'us_aqi', category } }),
      );

    expect(action(aqiResult(100, 'moderate'), 'air-quality-exposure')).toBeUndefined();
    expect(
      action(aqiResult(101, 'unhealthy_for_sensitive_groups'), 'air-quality-exposure')
        ?.severity,
    ).toBe('attention');
    expect(action(aqiResult(151, 'unhealthy'), 'air-quality-exposure')?.severity).toBe(
      'warning',
    );
    expect(
      action(aqiResult(201, 'very_unhealthy'), 'air-quality-exposure')?.severity,
    ).toBe('danger');
    expect(action(aqiResult(301, 'hazardous'), 'air-quality-exposure')?.severity).toBe(
      'danger',
    );
  });

  it('does not apply U.S. AQI rules to a differently identified scale', () => {
    const result = evaluate(
      weather({
        airQuality: { index: 180, scale: 'european_aqi', category: 'unhealthy' },
      }),
    );

    expect(action(result, 'air-quality-exposure')).toBeUndefined();
    expect(result.status).toBe('limited');
    expect(result.missingDimensions).toContain('us_aqi');
  });

  it('triggers rain protection at the 60% near-term boundary', () => {
    const below = evaluate(baselineWeather, hourlyForecast([0.59, 0.2, 0.1]));
    const atBoundary = evaluate(baselineWeather, hourlyForecast([0.6, 0.2, 0.1]));

    expect(action(below, 'rain-protection')).toBeUndefined();
    expect(action(atBoundary, 'rain-protection')?.reason).toContain('60%');
  });

  it('deduplicates current and near-term rain into one action with both rule reasons', () => {
    const currentRain = weather({
      condition: 'rain',
      precipitation: {
        type: 'rain',
        probability: 0.9,
        amountMillimeters: 3,
        intensity: 'moderate',
      },
    });
    const result = evaluate(currentRain, hourlyForecast([0.9, 0.8, 0.5]));
    const rain = action(result, 'rain-protection');

    expect(
      result.recommendations.filter(
        (recommendation) => recommendation.actionKey === 'rain-protection',
      ),
    ).toHaveLength(1);
    expect(rain?.matchedRuleIds).toEqual([
      'current-rain-protection',
      'near-term-rain-protection',
    ]);
    expect(rain?.reason).toContain('Đang có mưa');
    expect(rain?.reason).toContain('ba giờ đầu');
  });

  it('uses measured and feels-like temperature for heat and clothing boundaries', () => {
    const below = evaluate(
      weather({ temperature: { valueCelsius: 29, feelsLikeCelsius: 34.9 } }),
    );
    const high = evaluate(
      weather({ temperature: { valueCelsius: 31, feelsLikeCelsius: 35 } }),
    );
    const veryHigh = evaluate(
      weather({ temperature: { valueCelsius: 35, feelsLikeCelsius: 40 } }),
    );

    expect(action(below, 'heat-hydration')).toBeUndefined();
    expect(action(high, 'heat-hydration')?.severity).toBe('attention');
    expect(action(high, 'light-clothing')).toBeDefined();
    expect(action(veryHigh, 'heat-hydration')?.severity).toBe('warning');
  });

  it('adds practical warmer-clothing guidance for cool and cold conditions', () => {
    const cool = evaluate(
      weather({ temperature: { valueCelsius: 20, feelsLikeCelsius: 19 } }),
    );
    const cold = evaluate(
      weather({ temperature: { valueCelsius: 12, feelsLikeCelsius: 10 } }),
    );

    expect(action(cool, 'warm-clothing')?.severity).toBe('info');
    expect(action(cold, 'warm-clothing')?.severity).toBe('warning');
  });

  it('prioritizes severe simultaneous conditions and caps the Home list', () => {
    const result = evaluate(
      weather({
        condition: 'severe_thunderstorm',
        temperature: { valueCelsius: 36, feelsLikeCelsius: 41 },
        precipitation: {
          type: 'rain',
          probability: 1,
          intensity: 'heavy',
        },
        uv: { index: 9, category: 'very_high' },
        airQuality: {
          index: 220,
          scale: 'us_aqi',
          category: 'very_unhealthy',
        },
      }),
      hourlyForecast([1, 0.9, 0.8]),
    );

    expect(result.recommendations).toHaveLength(HOME_RECOMMENDATION_LIMIT);
    expect(result.recommendations.map((item) => item.actionKey)).toEqual([
      'weather-shelter',
      'air-quality-exposure',
      'sun-protection',
    ]);
    expect(result.primary?.severity).toBe('danger');
  });

  it('deduplicates an official alert and matching hazardous condition', () => {
    const result = evaluate(
      weather({
        condition: 'thunderstorm',
        alerts: [
          {
            id: 'storm-warning',
            type: 'thunderstorm',
            severity: 'warning',
            title: 'Cảnh báo dông',
            description: 'Dông đang hoạt động trong khu vực.',
            source: 'Cơ quan khí tượng',
          },
        ],
      }),
    );
    const shelter = action(result, 'weather-shelter');

    expect(shelter?.title).toBe('Cảnh báo dông');
    expect(shelter?.matchedRuleIds).toEqual([
      'official-weather-alert',
      'hazardous-weather-condition',
    ]);
    expect(
      result.recommendations.filter((item) => item.actionKey === 'weather-shelter'),
    ).toHaveLength(1);
  });

  it('keeps valid recommendations usable when UV, AQI, rain, and hourly data are missing', () => {
    const result = evaluateRecommendations({
      currentWeather: weather({
        temperature: { valueCelsius: 31, feelsLikeCelsius: 36 },
        uv: undefined,
        airQuality: undefined,
        precipitation: undefined,
      }),
    });

    expect(result.status).toBe('limited');
    expect(result.missingDimensions).toEqual([
      'uv',
      'us_aqi',
      'precipitation',
      'hourly_forecast',
    ]);
    expect(action(result, 'heat-hydration')).toBeDefined();
    expect(action(result, 'rain-protection')).toBeUndefined();
  });
});

