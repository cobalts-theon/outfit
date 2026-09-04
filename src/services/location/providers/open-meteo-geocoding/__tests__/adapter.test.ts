import { describe, expect, it } from '@jest/globals';

import {
  adaptOpenMeteoGeocodingResult,
  adaptOpenMeteoGeocodingResults,
} from '@/services/location/providers/open-meteo-geocoding/adapter';
import { parseOpenMeteoGeocodingResponse } from '@/services/location/providers/open-meteo-geocoding/dto';

describe('Open-Meteo geocoding boundary', () => {
  it('adapts provider data into a normalized manual-location candidate', () => {
    expect(
      adaptOpenMeteoGeocodingResult({
        id: 1584071,
        name: 'Đà Lạt',
        latitude: 11.9404,
        longitude: 108.4583,
        admin1: 'Lâm Đồng',
        country: 'Việt Nam',
        timezone: 'Asia/Ho_Chi_Minh',
      }),
    ).toEqual({
      id: 'open-meteo:1584071',
      label: 'Đà Lạt',
      context: 'Lâm Đồng · Việt Nam',
      coordinates: { latitude: 11.9404, longitude: 108.4583 },
      timezone: 'Asia/Ho_Chi_Minh',
    });
  });

  it('drops malformed results instead of leaking provider DTOs upward', () => {
    expect(
      adaptOpenMeteoGeocodingResults([
        { id: 1, name: 'Valid', latitude: 10, longitude: 106 },
        { id: 2, name: 'Invalid latitude', latitude: 1000, longitude: 106 },
        { id: 3, latitude: 10, longitude: 106 },
      ]),
    ).toHaveLength(1);
  });

  it('treats a missing or malformed result collection as an empty search', () => {
    expect(parseOpenMeteoGeocodingResponse({})).toEqual([]);
    expect(parseOpenMeteoGeocodingResponse({ results: 'invalid' })).toEqual([]);
    expect(parseOpenMeteoGeocodingResponse(null)).toEqual([]);
  });
});
