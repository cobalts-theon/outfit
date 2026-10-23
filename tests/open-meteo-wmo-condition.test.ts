import { describe, expect, it } from '@jest/globals';
import type { WeatherCondition } from '@/types/weather';
import { mapOpenMeteoWmoCondition } from '@/services/weather/request';

const documentedMappings: [number, WeatherCondition][] = [
  [0, 'clear'],
  [1, 'mostly_clear'],
  [2, 'partly_cloudy'],
  [3, 'overcast'],
  [45, 'fog'],
  [48, 'fog'],
  [51, 'drizzle'],
  [53, 'drizzle'],
  [55, 'drizzle'],
  [56, 'freezing_rain'],
  [57, 'freezing_rain'],
  [61, 'light_rain'],
  [63, 'rain'],
  [65, 'heavy_rain'],
  [66, 'freezing_rain'],
  [67, 'freezing_rain'],
  [71, 'light_snow'],
  [73, 'snow'],
  [75, 'heavy_snow'],
  [77, 'light_snow'],
  [80, 'showers'],
  [81, 'showers'],
  [82, 'heavy_showers'],
  [85, 'snow_showers'],
  [86, 'snow_showers'],
  [95, 'thunderstorm'],
  [96, 'thunderstorm'],
  [99, 'severe_thunderstorm'],
];

describe('Open-Meteo WMO condition mapping', () => {
  it.each(documentedMappings)('maps documented WMO code %i to %s', (code, condition) => {
    expect(mapOpenMeteoWmoCondition(code)).toBe(condition);
  });

  it.each([-1, 4, 47, 100, 999, 1.5, Number.NaN])(
    'degrades unsupported WMO code %s to unknown',
    (code) => {
      expect(mapOpenMeteoWmoCondition(code)).toBe('unknown');
    },
  );
});
