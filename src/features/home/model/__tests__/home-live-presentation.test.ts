import { describe, expect, it } from '@jest/globals';

import { createLiveObservationRisk } from '@/features/home/model/home-live-presentation';
import type { LiveCurrentWeatherResult } from '@/features/weather/application/live-current-weather';
import { partlyCloudyWeather } from '@/features/weather/fixtures/current-weather-fixtures';

describe('Home live observation boundary', () => {
  it('does not turn partial environmental data into a false safe state', () => {
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

    const risk = createLiveObservationRisk(result);

    expect(risk.tone).toBe('unavailable');
    expect(risk.title).toContain('Chưa đủ dữ liệu');
    expect(risk.immediateAction).toContain('không xem AQI hoặc UV bị trống');
  });

  it('labels complete live measurements as observations rather than rule output', () => {
    const result: LiveCurrentWeatherResult = {
      status: 'complete',
      weather: partlyCloudyWeather,
      issues: [],
    };

    const risk = createLiveObservationRisk(result);

    expect(risk.title).toContain('Chưa bật đánh giá rủi ro tự động');
    expect(risk.reason).toContain('chưa phải kết luận từ rule engine');
  });

  it('does not mislabel an hourly-only partial result as missing environmental data', () => {
    const result: LiveCurrentWeatherResult = {
      status: 'partial',
      weather: partlyCloudyWeather,
      issues: [
        {
          source: 'hourly_forecast',
          code: 'hourly_forecast_unavailable',
          message: 'Nguồn thời tiết không cung cấp chuỗi dự báo theo giờ.',
        },
      ],
    };

    const risk = createLiveObservationRisk(result);

    expect(risk.title).toContain('Chưa bật đánh giá rủi ro tự động');
    expect(risk.reason).not.toContain('không cung cấp chuỗi dự báo');
  });
});
