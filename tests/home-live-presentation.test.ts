import { describe, expect, it } from '@jest/globals';
import { createLiveRecommendationPresentation } from '@/hooks/home';
import type { LiveCurrentWeatherResult } from '@/services/live-weather';
import { partlyCloudyWeather, unhealthyAirQualityWeather } from '@/constants/demo-weather';

const calmWeather = {
  ...partlyCloudyWeather,
  temperature: { valueCelsius: 25, feelsLikeCelsius: 26 },
  precipitation: {
    type: 'none',
    probability: 0,
    amountMillimeters: 0,
    intensity: 'none',
  },
  uv: { index: 2, category: 'low' },
  airQuality: { index: 40, scale: 'us_aqi', category: 'good' },
  alerts: [],
} as const;

const calmHourly = {
  location: calmWeather.location,
  entries: [
    {
      forecastAt: '2026-08-06T10:00:00.000Z',
      condition: 'partly_cloudy',
      daylight: { phase: 'day', isDay: true },
      temperatureCelsius: 25,
      precipitation: { type: 'none', probability: 0 },
    },
    {
      forecastAt: '2026-08-06T11:00:00.000Z',
      condition: 'partly_cloudy',
      daylight: { phase: 'day', isDay: true },
      temperatureCelsius: 26,
      precipitation: { type: 'none', probability: 0.1 },
    },
    {
      forecastAt: '2026-08-06T12:00:00.000Z',
      condition: 'partly_cloudy',
      daylight: { phase: 'day', isDay: true },
      temperatureCelsius: 27,
      precipitation: { type: 'none', probability: 0.1 },
    },
  ],
} as const;

describe('Home live recommendation presentation boundary', () => {
  it('keeps supported heat guidance usable when environmental data is partial', () => {
    const result: LiveCurrentWeatherResult = {
      status: 'partial',
      weather: { ...partlyCloudyWeather, airQuality: undefined, uv: undefined },
      issues: [
        {
          source: 'air_quality',
          code: 'network',
          message: 'Không thể kết nối tới nguồn thời tiết.',
        },
      ],
    };

    const presentation = createLiveRecommendationPresentation(result);

    expect(presentation.evaluation.status).toBe('limited');
    expect(presentation.evaluation.missingDimensions).toEqual(
      expect.arrayContaining(['uv', 'us_aqi', 'hourly_forecast']),
    );
    expect(
      presentation.evaluation.recommendations.some(
        (recommendation) => recommendation.actionKey === 'sun-heat-protection',
      ),
    ).toBe(true);
    expect(presentation.risk.title).toContain('nóng');
    expect(presentation.risk.tone).toBe('attention');
  });

  it('uses the highest-priority U.S. AQI rule for live Risk and Action', () => {
    const result: LiveCurrentWeatherResult = {
      status: 'complete',
      weather: {
        ...unhealthyAirQualityWeather,
        airQuality: {
          ...unhealthyAirQualityWeather.airQuality,
          scale: 'us_aqi',
        },
      },
      issues: [],
    };

    const presentation = createLiveRecommendationPresentation(result);

    expect(presentation.risk.title).toContain('Không khí không lành mạnh');
    expect(presentation.risk.tone).toBe('warning');
    expect(presentation.risk.immediateAction).toContain('ngoài trời');
    expect(presentation.evaluation.primary?.actionKey).toBe('air-quality-exposure');
  });

  it('shows a calm risk and a positive Action when the outdoor window is favorable', () => {
    const result: LiveCurrentWeatherResult = {
      status: 'complete',
      weather: calmWeather,
      hourlyForecast: calmHourly,
      issues: [],
    };

    const presentation = createLiveRecommendationPresentation(result);

    expect(presentation.evaluation.status).toBe('ready');
    expect(presentation.evaluation.primary?.actionKey).toBe('outdoor-activity-window');
    expect(presentation.risk.tone).toBe('calm');
    expect(presentation.risk.title).toContain('Chưa có rủi ro nổi bật');
  });

  it('does not convert an hourly-only partial result into a fabricated weather risk', () => {
    const result: LiveCurrentWeatherResult = {
      status: 'partial',
      weather: calmWeather,
      issues: [
        {
          source: 'hourly_forecast',
          code: 'hourly_forecast_unavailable',
          message: 'Nguồn thời tiết không cung cấp chuỗi dự báo theo giờ.',
        },
      ],
    };

    const presentation = createLiveRecommendationPresentation(result);

    expect(presentation.evaluation.status).toBe('limited');
    expect(presentation.evaluation.missingDimensions).toEqual(['hourly_forecast']);
    expect(presentation.evaluation.recommendations.map((item) => item.actionKey)).toEqual([
      'light-clothing',
    ]);
    expect(presentation.risk.tone).toBe('unavailable');
    expect(presentation.risk.reason).not.toContain('cảnh báo');
  });
});
