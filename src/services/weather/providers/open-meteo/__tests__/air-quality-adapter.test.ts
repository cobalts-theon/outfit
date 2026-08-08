import { describe, expect, it } from '@jest/globals';

import { adaptOpenMeteoAirQuality } from '@/services/weather/providers/open-meteo/air-quality-adapter';
import type { OpenMeteoAirQualityResponseDto } from '@/services/weather/providers/open-meteo/air-quality-dto';
import { openMeteoAirQualityFixture } from '@/services/weather/providers/open-meteo/fixtures/open-meteo-fixtures';

describe('Open-Meteo air-quality adapter', () => {
  it('preserves European AQI as an explicitly scaled value', () => {
    const snapshot = adaptOpenMeteoAirQuality(openMeteoAirQualityFixture, 'european_aqi');

    expect(snapshot.airQuality).toMatchObject({
      index: 67,
      scale: 'european_aqi',
    });
    expect(snapshot.airQuality?.category).toBeUndefined();
  });

  it('preserves U.S. AQI and maps only its directly compatible categories', () => {
    const snapshot = adaptOpenMeteoAirQuality(openMeteoAirQualityFixture, 'us_aqi');

    expect(snapshot.airQuality).toMatchObject({
      index: 118,
      scale: 'us_aqi',
      category: 'unhealthy_for_sensitive_groups',
    });
  });

  it('maps all requested pollutant concentrations in micrograms per cubic meter', () => {
    const pollutants = adaptOpenMeteoAirQuality(
      openMeteoAirQualityFixture,
      'us_aqi',
    ).airQuality?.pollutants;

    expect(pollutants).toEqual({
      pm25MicrogramsPerCubicMeter: 28.4,
      pm10MicrogramsPerCubicMeter: 46.2,
      coMicrogramsPerCubicMeter: 312,
      no2MicrogramsPerCubicMeter: 22.5,
      so2MicrogramsPerCubicMeter: 7.8,
      o3MicrogramsPerCubicMeter: 61.3,
    });
  });

  it('keeps UV separate from AQI', () => {
    const snapshot = adaptOpenMeteoAirQuality(openMeteoAirQualityFixture, 'us_aqi');

    expect(snapshot.uv).toEqual({ index: 5.4 });
    expect(snapshot.airQuality).not.toHaveProperty('uv');
  });

  it('omits missing optional AQI, pollutant, and UV data', () => {
    const response = {
      ...openMeteoAirQualityFixture,
      current: {
        time: openMeteoAirQualityFixture.current.time,
        interval: 3600,
      },
      hourly: undefined,
    } satisfies OpenMeteoAirQualityResponseDto;

    expect(adaptOpenMeteoAirQuality(response, 'us_aqi')).toEqual({});
  });

  it('rejects malformed negative environmental values', () => {
    const response = {
      ...openMeteoAirQualityFixture,
      current: { ...openMeteoAirQualityFixture.current, pm2_5: -0.1 },
    } satisfies OpenMeteoAirQualityResponseDto;

    expect(() => adaptOpenMeteoAirQuality(response, 'european_aqi')).toThrow(
      'current.pm2_5',
    );

    const invalidUnits = {
      ...openMeteoAirQualityFixture,
      current_units: { ...openMeteoAirQualityFixture.current_units, pm2_5: 'mg/m³' },
    } satisfies OpenMeteoAirQualityResponseDto;

    expect(() => adaptOpenMeteoAirQuality(invalidUnits, 'us_aqi')).toThrow(
      'current_units.pm2_5',
    );
  });
});
