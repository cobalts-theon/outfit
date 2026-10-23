import { expect, it } from '@jest/globals';
import {
  parseLifestylePreferences,
  personalizeDailyActions,
  isInAvailability,
  type LifestylePreferences,
} from '@/utils/recommendations';
import type { DailyAction } from '@/utils/recommendations';

const preferences: LifestylePreferences = {
  version: 1,
  activities: ['exercise'],
  periods: ['morning'],
};

const action = (key: string, urgent = false): DailyAction => ({
  id: key,
  key,
  title: key,
  reason: 'Weather evidence',
  urgent,
});

it('validates persisted metadata and removes duplicates', () => {
  expect(
    parseLifestylePreferences({ ...preferences, activities: ['exercise', 'exercise'] }),
  ).toEqual(preferences);
  for (const value of [
    null,
    {},
    { ...preferences, version: 2 },
    { ...preferences, activities: ['invalid'] },
    { ...preferences, periods: [] },
  ]) {
    expect(parseLifestylePreferences(value)).toBeUndefined();
  }
});

it('keeps guest advice unchanged and never manufactures weather evidence', () => {
  const actions = [action('protect-laundry')];
  expect(personalizeDailyActions(actions, undefined, 'morning')).toBe(actions);
  expect(personalizeDailyActions([], preferences, 'morning')).toEqual([]);
});

it('uses selected activities and current daypart for outdoor opportunities', () => {
  const actions = [action('protect-laundry'), action('outdoor-activity-window')];
  expect(personalizeDailyActions(actions, preferences, 'morning').map((a) => a.key)).toEqual([
    'outdoor-activity-window',
  ]);
  expect(personalizeDailyActions(actions, preferences, 'evening')).toEqual([]);
});

it('preserves and prioritizes urgent hazards regardless of interests or time', () => {
  const danger = action('weather-shelter', true);
  expect(
    personalizeDailyActions([action('outdoor-activity-window'), danger], preferences, 'morning')[0],
  ).toBe(danger);
  expect(personalizeDailyActions([danger], preferences, 'night')).toEqual([danger]);
});

it('keeps health protection before selected clothing', () => {
  const result = personalizeDailyActions(
    [action('sun-protection'), action('light-clothing')],
    { ...preferences, activities: ['clothing'] },
    'morning',
  );
  expect(result.map((a) => a.key)).toEqual(['sun-protection', 'light-clothing']);
});

it('does not promote selected laundry above health or travel', () => {
  const result = personalizeDailyActions(
    [action('protect-laundry'), action('rain-protection'), action('sun-heat-protection')],
    { ...preferences, activities: ['laundry'] },
    'morning',
  );
  expect(result.map((a) => a.key)).toEqual([
    'sun-heat-protection',
    'rain-protection',
    'protect-laundry',
  ]);
});

it('preserves expanded answers and rejects invalid time ranges', () => {
  const expanded = {
    ...preferences,
    transport: 'motorbike',
    exposure: 'long',
    availability: { start: 420, end: 510 },
  };
  expect(parseLifestylePreferences(expanded)).toEqual(expanded);
  expect(
    parseLifestylePreferences({ ...expanded, availability: { start: 420, end: 420 } }),
  ).toBeUndefined();
  expect(
    parseLifestylePreferences({ ...expanded, availability: { start: -1, end: 500 } }),
  ).toBeUndefined();
  expect(parseLifestylePreferences({ ...expanded, transport: 'invalid' })).toBeUndefined();
});

it('uses exact hours rather than the entire selected daypart', () => {
  const p = { ...preferences, availability: { start: 420, end: 510 } };
  expect(
    personalizeDailyActions([action('outdoor-activity-window')], p, 'morning', '07:30'),
  ).toHaveLength(1);
  expect(
    personalizeDailyActions([action('outdoor-activity-window')], p, 'morning', '09:00'),
  ).toEqual([]);
});

it('handles time windows across midnight with an exclusive end', () => {
  const range = { start: 1380, end: 60 };
  expect(isInAvailability(1410, range)).toBe(true);
  expect(isInAvailability(30, range)).toBe(true);
  expect(isInAvailability(60, range)).toBe(false);
  expect(isInAvailability(1200, range)).toBe(false);
});

it('adjusts rain preparation to the chosen mode of travel', () => {
  const result = personalizeDailyActions(
    [action('rain-protection')],
    { ...preferences, transport: 'motorbike' },
    'morning',
  );
  expect(result[0].title).toContain('áo mưa');
  expect(result[0].reason).toBe('Weather evidence');
});

it('uses prolonged exposure for heat advice without replacing urgent warnings', () => {
  const p = { ...preferences, exposure: 'long' as const };
  expect(personalizeDailyActions([action('sun-heat-protection')], p, 'morning')[0].title).toContain(
    'nghỉ ở chỗ mát',
  );
  const urgent = action('sun-heat-protection', true);
  expect(personalizeDailyActions([urgent], p, 'morning')[0]).toBe(urgent);
});

it('does not infer work or school departure from interests at 22:00', () => {
  const clothing: DailyAction = {
    ...action('light-clothing'),
    recommendation: {
      id: 'everyday-weather-clothing',
      matchedRuleIds: ['everyday-weather-clothing'],
      actionKey: 'light-clothing',
      group: 'clothing',
      severity: 'info',
      priority: 5,
      title: 'Trang phục',
      message: 'Trang phục',
      action: 'Điều chỉnh lớp áo',
      reason: 'Nhiệt độ 26°C, cảm nhận 31°C.',
      triggers: [],
    },
  };
  const selected = {
    ...preferences,
    activities: ['commute'] as LifestylePreferences['activities'],
  };
  const result = personalizeDailyActions(
    [clothing, action('outdoor-activity-window')],
    selected,
    'night',
    '22:00',
  );
  expect(result).toHaveLength(1);
  expect(result[0].title).not.toMatch(/đi làm|đi học/);
  expect(result[0].reason).toBe(clothing.reason);
  expect(result[0].urgent).toBe(false);
});
