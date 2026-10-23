import { describe, expect, it } from '@jest/globals';
import {
  assessActivity,
  assessDeparture,
  parsePlanningDate,
  validActivityDuration,
  activityCandidates,
  startAtClock,
  ACTIVITIES,
  activityLabel,
  activityPolicyVersion,
  activityPolicyContext,
} from '@/utils/planning';
import type { PlanningHour } from '@/utils/planning';

const now = Date.parse('2026-09-15T00:00:00Z');

const hours: PlanningHour[] = Array.from({ length: 8 }, (_, index) => ({
  at: new Date(now + (index + 1) * 3_600_000).toISOString(),
  feelsLike: 25,
  uv: 2,
  aqi: 40,
  rainProbability: 0.1,
  wind: 2,
  gust: 3,
  daylight: true,
  hazardous: false,
}));

const input = {
  activity: 'walking' as const,
  start: hours[0].at,
  duration: 30,
  hours,
  fetchedAt: now,
  now,
};

describe('activity planning evidence', () => {
  it('evaluates conditions and suggests a relevant walking kit', () => {
    const a = assessActivity(input);
    expect(a.status).toBe('suitable');
    expect(a.checklist).toEqual([]);
    expect(a.reasons.join(' ')).toContain('40');
  });
  it('rejects elapsed times and stale forecasts', () => {
    expect(assessActivity({ ...input, now: Date.parse(input.start) }).status).toBe('unknown');
    expect(assessActivity({ ...input, fetchedAt: now - 31 * 60_000 }).summary).toContain(
      'Cập nhật',
    );
  });
  it('never fills gaps in a 90-minute forecast or substitutes missing AQI', () => {
    expect(assessActivity({ ...input, duration: 90, hours: [hours[0], hours[2]] }).status).toBe(
      'unknown',
    );
    expect(
      assessActivity({ ...input, hours: hours.map((h) => ({ ...h, aqi: undefined })) }).status,
    ).toBe('unknown');
    expect(
      assessActivity({
        ...input,
        activity: 'commute',
        hours: hours.map((h) => ({ ...h, aqi: undefined })),
      }).status,
    ).toBe('caution');
  });
  it('evaluates the entire interval, including rain in the second hour', () => {
    const a = assessActivity({
      ...input,
      duration: 90,
      hours: hours.map((h, i) => ({ ...h, rainProbability: i === 1 ? 0.8 : 0.1 })),
    });
    expect(a.status).toBe('avoid');
    expect(a.checklist.some((i) => i.id === 'umbrella')).toBe(true);
  });
  it('does not mark a thunderstorm or official warning as suitable', () => {
    expect(
      assessActivity({
        ...input,
        activity: 'shopping',
        hours: hours.map((h) => ({ ...h, hazardous: true })),
      }).status,
    ).toBe('avoid');
    expect(
      assessActivity({
        ...input,
        alerts: [{ id: 'a', type: 'storm', title: 'Warning', severity: 'warning' }],
      }).status,
    ).toBe('avoid');
    expect(
      assessActivity({
        ...input,
        alerts: [
          {
            id: 'a',
            type: 'storm',
            title: 'Old warning',
            severity: 'warning',
            endsAt: new Date(now).toISOString(),
          },
        ],
      }).status,
    ).toBe('suitable');
  });
  it('uses more conservative heat guidance for running', () => {
    const warm = hours.map((h) => ({ ...h, feelsLike: 32 }));
    expect(assessActivity({ ...input, hours: warm }).status).toBe('suitable');
    expect(assessActivity({ ...input, activity: 'running', hours: warm }).status).toBe('caution');
  });
  it('adds visibility at night without suppressing daytime sun preparation', () => {
    const mix = hours.map((h, i) => ({ ...h, daylight: i === 0, uv: i === 0 ? 4 : 0 }));
    const a = assessActivity({ ...input, hours: mix, duration: 90 });
    expect(a.checklist.map((i) => i.id)).toEqual(expect.arrayContaining(['sun', 'visibility']));
  });
  it('ranks non-overlapping windows only within the chosen local availability', () => {
    const a = activityCandidates({
      ...input,
      date: '2026-09-15',
      timeZone: 'Asia/Ho_Chi_Minh',
      from: 8 * 60,
      to: 11 * 60,
      blockedMinutes: [8 * 60],
    });
    expect(a.length).toBeGreaterThan(0);
    expect(a.every((r) => r.start > hours[0].at && r.end <= '2026-09-15T04:00:00.000Z')).toBe(true);
    expect(startAtClock(hours, '2026-09-15', 8 * 60 + 30, 'Asia/Ho_Chi_Minh')).toBe(
      '2026-09-15T01:30:00.000Z',
    );
    expect(startAtClock(hours, '2026-09-16', 8 * 60, 'Asia/Ho_Chi_Minh')).toBeUndefined();
  });
});

it('excludes the original time before ranking replacement windows', () => {
  const choices = activityCandidates({
    ...input,
    date: '2026-09-15',
    timeZone: 'Asia/Ho_Chi_Minh',
    from: 480,
    to: 660,
    excludedStarts: [input.start.replace('.000Z', '+00:00')],
  });
  expect(choices).toHaveLength(3);
  expect(choices.every((choice) => Date.parse(choice.start) !== Date.parse(input.start))).toBe(
    true,
  );
});

it('offers work/school separately from general outings and keeps old labels readable', () => {
  expect(ACTIVITIES.map((item) => item.id)).toEqual(['walking', 'running', 'commute', 'outing']);
  expect(activityLabel('commute')).toBe('Đi làm / đi học');
  expect(activityLabel('outing')).toBe('Ra ngoài');
  expect(activityLabel('shopping')).toBe('Ra ngoài');
});

it('distinguishes running exposure from walking without a health score claim', () => {
  const warm = hours.map((hour) => ({ ...hour, feelsLike: 31 }));
  expect(assessActivity({ ...input, hours: warm }).status).toBe('suitable');
  expect(assessActivity({ ...input, activity: 'running', hours: warm }).status).toBe('caution');
});

it('distinguishes outdoor travel from covered transport without treating missing data as good', () => {
  const missing = hours.map((hour) => ({ ...hour, aqi: undefined }));
  expect(
    assessActivity({ ...input, activity: 'commute', transport: 'bike', hours: missing }).status,
  ).toBe('unknown');
  const covered = assessActivity({
    ...input,
    activity: 'commute',
    transport: 'covered',
    hours: missing,
  });
  expect(covered.status).toBe('caution');
  expect(covered.reasons.join(' ')).toContain('Thiếu một phần AQI/UV');
  const poorAir = hours.map((hour) => ({ ...hour, aqi: 160 }));
  expect(
    assessActivity({ ...input, activity: 'commute', transport: 'walk', hours: poorAir }).status,
  ).toBe('avoid');
  expect(
    assessActivity({ ...input, activity: 'commute', transport: 'covered', hours: poorAir }).status,
  ).toBe('caution');
});

it('ties preparation to environmental evidence and transport rather than generic shopping supplies', () => {
  const rainy = hours.map((hour) => ({ ...hour, rainProbability: 0.4, feelsLike: 29, uv: 4 }));
  const result = assessActivity({
    ...input,
    activity: 'commute',
    transport: 'motorbike',
    hours: rainy,
  });
  expect(result.checklist.map((item) => item.id)).toEqual(['water', 'umbrella', 'sun']);
  expect(result.checklist.find((item) => item.id === 'umbrella')?.label).toBe('Áo mưa');
  const covered = assessActivity({
    ...input,
    activity: 'commute',
    transport: 'covered',
    hours: rainy,
  });
  expect(covered.checklist.find((item) => item.id === 'umbrella')?.label).toContain('đoạn đi bộ');
  expect(assessActivity({ ...input, activity: 'shopping' }).checklist).toEqual([]);
});

it('retains the saved transport/exposure policy without depending on later profile changes', () => {
  expect(activityPolicyContext(activityPolicyVersion('covered', 'long'))).toEqual({
    transport: 'covered',
    exposure: 'long',
  });
  expect(activityPolicyContext('activity-v1')).toEqual({});
  expect(activityPolicyContext('activity-v2:invalid:long')).toEqual({});
});

it('keeps work/school risk advice conditional on changing departure and explains the route limit', () => {
  const bad = hours.map((hour) => ({ ...hour, gust: 15 }));
  const result = assessActivity({ ...input, activity: 'commute', hours: bad });
  expect(result.status).toBe('avoid');
  expect(result.summary).toContain('nếu có thể');
  expect(result.reasons.join(' ')).toContain('chưa tính toàn bộ tuyến đường');
});

it('accepts custom durations and checks evidence through their actual end', () => {
  expect(assessActivity({ ...input, duration: 45 }).status).toBe('suitable');
  expect(assessActivity({ ...input, duration: 75 }).status).toBe('suitable');
  expect(assessActivity({ ...input, duration: 75, hours: [hours[0]] }).status).toBe('unknown');
  for (const duration of [0, -1, 1.5, 1441, NaN]) {
    expect(validActivityDuration(duration)).toBe(false);
    expect(assessActivity({ ...input, duration }).status).toBe('unknown');
  }
  expect(validActivityDuration(1440)).toBe(true);
});

it('parses calendar dates without rolling invalid days into another month', () => {
  expect(parsePlanningDate('29/02/2028')).toBe('2028-02-29');
  expect(parsePlanningDate('2026-10-22')).toBe('2026-10-22');
  expect(parsePlanningDate('30/02/2026')).toBeUndefined();
  expect(parsePlanningDate('22/13/2026')).toBeUndefined();
});

it('keeps custom durations inside availability and does not replace an unavailable date', () => {
  const chosen = { ...input, duration: 45, timeZone: 'Asia/Ho_Chi_Minh', from: 480, to: 540 };
  const results = activityCandidates({ ...chosen, date: '2026-09-15' });
  expect(results).toHaveLength(1);
  expect(Date.parse(results[0].end) - Date.parse(results[0].start)).toBe(45 * 60000);
  expect(activityCandidates({ ...chosen, date: '2026-10-22' })).toEqual([]);
});

it('can explain bad weather without recommending or saving that window', () => {
  const bad = {
    ...input,
    hours: hours.map((hour) => ({ ...hour, rainProbability: 0.9 })),
    date: '2026-09-15',
    timeZone: 'Asia/Ho_Chi_Minh',
    from: 480,
    to: 540,
  };
  expect(activityCandidates(bad)).toEqual([]);
  const result = activityCandidates({ ...bad, includeAvoid: true })[0];
  expect(result.status).toBe('avoid');
  expect(result.reasons.join(' ')).toContain('90%');
});

it('assesses the exact commute departure instead of selecting a nicer time', () => {
  const trip = assessDeparture({
    ...input,
    departure: 8 * 60 + 30,
    date: '2026-09-15',
    timeZone: 'Asia/Ho_Chi_Minh',
    duration: 45,
    transport: 'motorbike',
    hours: hours.map((hour, index) => ({ ...hour, rainProbability: index < 2 ? 0.8 : 0 })),
  });
  expect(trip?.start).toBe('2026-09-15T01:30:00.000Z');
  expect(trip?.end).toBe('2026-09-15T02:15:00.000Z');
  expect(trip?.reasons.join(' ')).toContain('80%');
  expect(trip?.checklist.some((item) => item.label === 'Áo mưa')).toBe(true);
});

it('keeps commute hazards visible and evaluates only the chosen travel duration', () => {
  const trip = {
    ...input,
    date: '2026-09-15',
    timeZone: 'Asia/Ho_Chi_Minh',
    departure: 480,
    transport: 'walk' as const,
    hours: hours.map((hour, index) => ({ ...hour, rainProbability: index === 1 ? 0.9 : 0 })),
  };
  expect(assessDeparture({ ...trip, duration: 30 })?.status).toBe('suitable');
  expect(assessDeparture({ ...trip, duration: 75 })?.status).toBe('avoid');
  expect(assessDeparture({ ...trip, duration: 75 })?.start).toBe(input.start);
});

it('requires an explicit commute departure and real forecast coverage', () => {
  const trip = { ...input, date: '2026-09-15', timeZone: 'Asia/Ho_Chi_Minh' };
  expect(assessDeparture(trip)).toBeUndefined();
  expect(assessDeparture({ ...trip, departure: 1440 })).toBeUndefined();
  expect(assessDeparture({ ...trip, departure: 480, date: '2027-09-15' })).toBeUndefined();
  expect(
    assessDeparture({ ...trip, departure: 480, duration: 75, hours: [hours[0]] })?.status,
  ).toBe('unknown');
  expect(assessDeparture({ ...trip, departure: 480, now: Date.parse(input.start) })?.status).toBe(
    'unknown',
  );
});

it('starts work/school departures at 06:00 instead of offering midnight', () => {
  const trip = { ...input, date: '2026-09-15', timeZone: 'UTC' };
  expect(assessDeparture({ ...trip, departure: 0 })).toBeUndefined();
  expect(assessDeparture({ ...trip, departure: 330 })).toBeUndefined();
  expect(assessDeparture({ ...trip, departure: 360 })?.start).toBe('2026-09-15T06:00:00.000Z');
  expect(assessDeparture({ ...trip, departure: 420 })?.start).toBe('2026-09-15T07:00:00.000Z');
});
