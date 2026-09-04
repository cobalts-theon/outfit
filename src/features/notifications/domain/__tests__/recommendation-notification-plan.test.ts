import { describe, expect, it } from '@jest/globals';

import type { HourlyForecast } from '@/features/forecast/domain/hourly-forecast';
import { createRecommendationNotificationPlan } from '@/features/notifications/domain/recommendation-notification-plan';
import { evaluateRecommendations } from '@/features/recommendations/domain/recommendation-engine';
import type { CurrentWeather } from '@/features/weather/domain/current-weather';
import { partlyCloudyWeather } from '@/features/weather/fixtures/current-weather-fixtures';

const now = Date.parse('2026-08-06T10:10:00.000Z');
const dry = { type: 'none', probability: 0, intensity: 'none' } as const;
const baseline = {
  ...partlyCloudyWeather,
  observedAt: '2026-08-06T10:00:00.000Z',
  condition: 'partly_cloudy',
  precipitation: dry,
  temperature: { valueCelsius: 25, feelsLikeCelsius: 26 },
  uv: { index: 2, category: 'low' },
  airQuality: { index: 40, scale: 'us_aqi', category: 'good' },
  alerts: [],
} as const satisfies CurrentWeather;

function forecast(probabilities: readonly number[]): HourlyForecast {
  return {
    location: baseline.location,
    entries: probabilities.map((probability, index) => ({
      forecastAt: new Date(Date.parse('2026-08-06T11:00:00.000Z') + index * 60 * 60 * 1000).toISOString(),
      condition: probability >= 0.6 ? ('rain' as const) : ('partly_cloudy' as const),
      daylight: { phase: 'day' as const, isDay: true as const },
      temperatureCelsius: 25,
      precipitation: {
        type: probability >= 0.6 ? ('rain' as const) : ('none' as const),
        probability,
      },
    })),
  };
}

function plan(currentWeather: CurrentWeather, hourlyForecast = forecast([0, 0, 0])) {
  const evaluation = evaluateRecommendations({ currentWeather, hourlyForecast });
  return createRecommendationNotificationPlan({
    currentWeather,
    evaluation,
    hourlyForecast,
    locationIdentity: 'manual:hanoi',
    locationLabel: 'Hà Nội',
    now,
  });
}

describe('recommendation notification plan', () => {
  it('schedules near-term rain 30 minutes before the first high-probability hour', () => {
    const events = plan(baseline, forecast([0.1, 0.7, 0.8]));
    const rain = events.find((event) => event.slot === 'rain');

    expect(rain?.triggerAt).toBe(Date.parse('2026-08-06T11:30:00.000Z'));
    expect(rain?.body).toContain('Thu đồ đang phơi');
    expect(rain?.signature).toContain('2026-08-06T12:00:00.000Z');
  });

  it('creates one immediate combined rain and laundry alert while it is raining', () => {
    const rainy = {
      ...baseline,
      condition: 'rain',
      precipitation: { type: 'rain', probability: 0.9, intensity: 'moderate' },
    } as const satisfies CurrentWeather;
    const events = plan(rainy, forecast([0.9, 0.8, 0.2]));

    expect(events.filter((event) => event.slot === 'rain')).toHaveLength(1);
    expect(events[0]?.title).toBe('Mưa tại Hà Nội');
    expect(events[0]?.triggerAt).toBe(now + 2_000);
  });

  it('does not notify for a calm positive outdoor recommendation', () => {
    expect(plan(baseline)).toEqual([]);
  });

  it('adds only the highest warning-or-danger environmental risk', () => {
    const hazardous = {
      ...baseline,
      temperature: { valueCelsius: 36, feelsLikeCelsius: 41 },
      uv: { index: 9, category: 'very_high' },
      airQuality: { index: 220, scale: 'us_aqi', category: 'very_unhealthy' },
    } as const satisfies CurrentWeather;
    const events = plan(hazardous);
    const risks = events.filter((event) => event.slot === 'risk');

    expect(risks).toHaveLength(1);
    expect(risks[0]?.data.actionKey).toBe('air-quality-exposure');
  });

  it('notifies once for the primary attention-level action when rain is not involved', () => {
    const highUv = {
      ...baseline,
      uv: { index: 7, category: 'high' },
    } as const satisfies CurrentWeather;
    const events = plan(highUv);
    const action = events.find((event) => event.slot === 'action');

    expect(action?.title).toBe('Nên làm ngay · Hà Nội');
    expect(action?.data.actionKey).toBe('sun-heat-protection');
    expect(action?.data.url).toBe('weather:///');
  });

  it('does not duplicate a rain recommendation into the action slot', () => {
    const rainy = {
      ...baseline,
      condition: 'rain',
      precipitation: { type: 'rain', probability: 0.9, intensity: 'moderate' },
    } as const satisfies CurrentWeather;
    const events = plan(rainy, forecast([0.9, 0.8, 0.2]));

    expect(events.some((event) => event.slot === 'rain')).toBe(true);
    expect(events.some((event) => event.slot === 'action')).toBe(false);
  });
});
