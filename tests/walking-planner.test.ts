import { describe, expect, it } from '@jest/globals';
import { DEFAULT_WALKING_POLICY, evaluateWalkingWindows, localDate, parseWalkingPolicy, type PlanningHour } from '@/utils/planning';

const now = Date.parse('2026-09-06T06:00:00Z');

const hours: PlanningHour[] = [7, 8, 9, 10, 11].map(h => ({
  at: `2026-09-06T${String(h).padStart(2, '0')}:00:00.000Z`, feelsLike: 26,
  uv: 2, aqi: 40, rainProbability: 0.1, wind: 2, gust: 4, daylight: true, hazardous: false,
}));

const input = { hours, now, fetchedAt: now, date: '2026-09-06', startHour: 14, endHour: 18, durationMinutes: 30, timeZone: 'Asia/Ho_Chi_Minh' };

describe('walking planner', () => {
  it('evaluates destination timezone and sorts alternatives deterministically', () => {
    const result = evaluateWalkingWindows(input);
    expect(result.status).toBe('ready');
    expect(result.windows[0].start).toBe(hours[0].at);
    expect(result.windows[0].end).toBe('2026-09-06T07:30:00.000Z');
  });
  it('never lets comfortable temperature compensate for unhealthy AQI', () => {
    expect(evaluateWalkingWindows({ ...input, hours: hours.map(h => ({ ...h, aqi: 180 })) }).status).toBe('no_match');
  });
  it('does not substitute current AQI for missing hourly AQI', () => {
    expect(evaluateWalkingWindows({ ...input, hours: hours.map(h => ({ ...h, aqi: undefined })) }).status).toBe('limited');
  });
  it('rejects old data', () => {
    expect(evaluateWalkingWindows({ ...input, fetchedAt: now - 31 * 60_000 }).status).toBe('unavailable');
  });
  it('checks the end of an activity and forecast gaps', () => {
    const short = hours.slice(0, 2);
    expect(evaluateWalkingWindows({ ...input, durationMinutes: 90, hours: short }).windows).toEqual([]);
    expect(evaluateWalkingWindows({ ...input, hours: [hours[0], hours[2]] }).windows).toEqual([]);
    expect(evaluateWalkingWindows({ ...input, hours: [hours[0], { ...hours[1], uv: 9 }] }).windows).toEqual([]);
  });
  it('excludes hazardous weather', () => {
    expect(evaluateWalkingWindows({ ...input, hours: hours.map(h => ({ ...h, hazardous: true })) }).windows).toEqual([]);
  });
  it('allows evening windows with explicit route-lighting preparation', () => {
    const result = evaluateWalkingWindows({ ...input, hours: hours.map(h => ({ ...h, daylight: false, uv: 0 })) });
    expect(result.windows.length).toBeGreaterThan(0);
    expect(result.windows[0].preparation).toContain('đường đủ sáng');
  });
  it('does not permit unsafe policy updates from cloud', () => {
    expect(parseWalkingPolicy({ ...DEFAULT_WALKING_POLICY, maxAqi: 200 })).toBeUndefined();
    expect(parseWalkingPolicy(DEFAULT_WALKING_POLICY)).toEqual(DEFAULT_WALKING_POLICY);
  });
  it('uses destination date across UTC midnight', () => {
    expect(localDate('2026-09-06T18:00:00Z', 'Asia/Ho_Chi_Minh')).toBe('2026-09-07');
  });
  it('keeps the full activity inside availability in fractional-offset timezones', () => {
    const result = evaluateWalkingWindows({ ...input, timeZone: 'Asia/Kolkata', startHour: 12, endHour: 13, durationMinutes: 60 });
    expect(result.windows).toEqual([]);
  });
  it('does not recommend malformed negative readings', () => {
    for (const change of [{ aqi: -1 }, { uv: -1 }, { wind: -1 }, { rainProbability: -0.1 }]) {
      expect(evaluateWalkingWindows({ ...input, hours: hours.map(h => ({ ...h, ...change })) }).windows).toEqual([]);
    }
  });
  it('handles invalid timestamps and timezones without crashing', () => {
    expect(evaluateWalkingWindows({ ...input, hours: [{ ...hours[0], at: 'invalid' }] }).windows).toEqual([]);
    expect(evaluateWalkingWindows({ ...input, timeZone: 'invalid' }).status).toBe('unavailable');
  });
  it('distinguishes an elapsed window from missing forecast data', () => {
    const result = evaluateWalkingWindows({ ...input, now: Date.parse('2026-09-06T13:00:00Z'), fetchedAt: Date.parse('2026-09-06T13:00:00Z') });
    expect(result.reason).toBe('elapsed');
    expect(result.message).toContain('ngày mai');
  });
  it('names missing AQI rather than claiming all forecast is unavailable', () => {
    const result = evaluateWalkingWindows({ ...input, hours: hours.map(h => ({ ...h, aqi: undefined })) });
    expect(result.reason).toBe('coverage');
    expect(result.message).toContain('AQI');
  });
  it('honors exact user times between hourly samples', () => {
    const result = evaluateWalkingWindows({ ...input, startHour: 14 + 10 / 60, endHour: 14 + 40 / 60 });
    expect(result.windows[0].start).toBe('2026-09-06T07:10:00.000Z');
    expect(result.windows[0].end).toBe('2026-09-06T07:40:00.000Z');
  });
  it('checks every surrounding forecast sample for a partial-hour activity', () => {
    const result = evaluateWalkingWindows({ ...input, startHour: 14.5, endHour: 15.5, durationMinutes: 60,
      hours: [hours[0], hours[1], { ...hours[2], aqi: 200 }] });
    expect(result.windows).toEqual([]);
    expect(result.reason).toBe('conditions');
  });
  it('explains insufficient available duration', () => {
    const result = evaluateWalkingWindows({ ...input, startHour: 14, endHour: 14.5, durationMinutes: 90 });
    expect(result.reason).toBe('duration');
    expect(result.message).toContain('30 phút rảnh');
  });
  it('offers distinct non-overlapping alternatives', () => {
    const result = evaluateWalkingWindows({ ...input, durationMinutes: 60 });
    expect(result.windows.length).toBeGreaterThan(1);
    for (let i = 0; i < result.windows.length; i++) for (let j = i + 1; j < result.windows.length; j++) {
      const a = result.windows[i], b = result.windows[j];
      expect(a.end <= b.start || b.end <= a.start).toBe(true);
    }
  });

});
