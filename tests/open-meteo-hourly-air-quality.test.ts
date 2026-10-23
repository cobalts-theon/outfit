import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fetchHourlyAirQuality } from '@/services/weather/client';

const at = 1788678000;

const response = (values: unknown[], times = values.map((_, i) => at + i * 3600)) => ({
  hourly_units: { time: 'unixtime', us_aqi: 'USAQI' },
  hourly: { time: times, us_aqi: values },
});

afterEach(() => { jest.restoreAllMocks(); });

describe('hourly AQI provider boundary', () => {
  it('joins by absolute timestamp and omits null or invalid AQI', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => response([40, null, -1, 80]) } as Response);
    expect(await fetchHourlyAirQuality(21, 105)).toEqual({
      [new Date(at * 1000).toISOString()]: 40,
      [new Date((at + 10800) * 1000).toISOString()]: 80,
    });
  });
  it('rejects duplicate timestamps', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => response([40, 50], [at, at]) } as Response);
    await expect(fetchHourlyAirQuality(21, 105)).rejects.toThrow('Mốc thời gian');
  });
  it('rejects a different AQI scale', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ ...response([40]), hourly_units: { time: 'unixtime', us_aqi: 'EAQI' } }) } as Response);
    await expect(fetchHourlyAirQuality(21, 105)).rejects.toThrow('AQI không hợp lệ');
  });
  it('propagates provider failure', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);
    await expect(fetchHourlyAirQuality(21, 105)).rejects.toThrow('Không tải được');
  });
});
