import { describe, expect, it } from '@jest/globals';
import { partlyCloudyWeather } from '@/constants/demo-weather';
import {
  visibleDailyActions,
  evaluateRecommendations,
  actionContext,
  createDailyActions,
  dailyActionId,
} from '@/utils/recommendations';
import type { RecommendationEvaluation } from '@/types/weather';

const weather = {
  ...partlyCloudyWeather,
  location: { ...partlyCloudyWeather.location, timeZone: 'Asia/Ho_Chi_Minh' },
};

const empty: RecommendationEvaluation = {
  status: 'limited',
  recommendations: [],
  missingDimensions: ['us_aqi'],
};

describe('Do now uses the selected place’s current daypart', () => {
  it.each(['01:00', '05:00', '08:00', '13:00', '18:00'])(
    'does not invent advice solely from time of day (%s UTC)',
    (time) => {
      expect(
        createDailyActions(weather, empty, 'place', Date.parse(`2026-09-10T${time}:00Z`)),
      ).toEqual([]);
    },
  );
  it('keeps laundry completion through the day but resets on the next local date', () => {
    const id = (at: string) => dailyActionId(weather, 'place', 'protect-laundry', Date.parse(at));
    expect(id('2026-09-10T01:00:00Z')).toBe(id('2026-09-10T13:00:00Z'));
    expect(id('2026-09-10T13:00:00Z')).not.toBe(id('2026-09-10T18:00:00Z'));
    expect(actionContext(weather, Date.parse('2026-09-10T18:00:00Z')).date).toBe('2026-09-11');
  });
});

const recommendation = (key: string) => ({
  id: key,
  actionKey: key,
  matchedRuleIds: [],
  group: 'outdoor' as const,
  severity: 'info' as const,
  priority: 0,
  title: key,
  message: 'Gợi ý.',
  reason: 'Dữ liệu hiện có.',
  action: 'Có thể vận động nhẹ.',
  triggers: [],
});

describe('necessary tasks versus ordinary guidance', () => {
  it('keeps household chores after personal daily activities', () => {
    const result = createDailyActions(
      weather,
      {
        ...empty,
        recommendations: [
          recommendation('light-clothing'),
          recommendation('outdoor-activity-window'),
          { ...recommendation('protect-laundry'), severity: 'attention' },
        ],
      },
      'place',
      Date.parse('2026-09-10T01:00:00Z'),
    );
    expect(result[result.length - 1].key).toBe('protect-laundry');
    expect(result.filter((action) => action.actionable).map((action) => action.key)).toEqual([]);
    expect(result.find((action) => action.key === 'outdoor-activity-window')?.title).toContain(
      'buổi sáng',
    );
  });
  it.each(['05:00', '18:00'])(
    'does not recycle walking advice at noon or late night (%s UTC)',
    (time) => {
      const result = createDailyActions(
        weather,
        { ...empty, recommendations: [recommendation('outdoor-activity-window')] },
        'place',
        Date.parse(`2026-09-10T${time}:00Z`),
      );
      expect(result.some((action) => action.key === 'outdoor-activity-window')).toBe(false);
    },
  );
  it('does not invent a walking opportunity when measurements are missing', () => {
    expect(
      createDailyActions(weather, empty, 'place').some(
        (action) => action.key === 'outdoor-activity-window',
      ),
    ).toBe(false);
  });
});

it('turns an established rain rule into an activity adjustment with the same evidence', () => {
  const rain = {
    ...recommendation('rain-protection'),
    severity: 'attention' as const,
    reason: 'Đang mưa.',
  };
  const result = createDailyActions(
    weather,
    { ...empty, recommendations: [rain] },
    'place',
    Date.parse('2026-09-10T01:00:00Z'),
  );
  expect(result.find((action) => action.key === 'outdoor-adjustment')).toMatchObject({
    title: 'Ưu tiên vận động ở chỗ có mái che',
    reason: 'Đang mưa.',
    urgent: false,
  });
});

it.each(['13:00', '18:00'])('does not suggest laundry at evening or night (%s UTC)', (time) => {
  const result = createDailyActions(
    weather,
    {
      ...empty,
      recommendations: [recommendation('dry-laundry'), recommendation('protect-laundry')],
    },
    'place',
    Date.parse(`2026-09-10T${time}:00Z`),
  );
  expect(result).toEqual([]);
});

it('puts health and safe travel before laundry even if laundry has high legacy priority', () => {
  const result = createDailyActions(
    weather,
    {
      ...empty,
      recommendations: [
        { ...recommendation('protect-laundry'), priority: 99 },
        recommendation('rain-protection'),
        recommendation('sun-heat-protection'),
      ],
    },
    'place',
    Date.parse('2026-09-10T01:00:00Z'),
  );
  expect(result[0].key).toBe('sun-heat-protection');
  expect(result[1].key).toBe('rain-protection');
  expect(result[result.length - 1].key).toBe('protect-laundry');
});

it('starts the late-night context at 22:00 in the selected place, not the device timezone', () => {
  expect(actionContext(weather, Date.parse('2026-10-22T14:59:00Z')).period).toBe('evening');
  expect(actionContext(weather, Date.parse('2026-10-22T15:00:00Z')).period).toBe('night');
  expect(actionContext(weather, Date.parse('2026-10-22T22:00:00Z')).period).toBe('morning');
});

it('grounds late-night rest wording in measured conditions and never invents work/school plans', () => {
  const normal = {
    ...recommendation('light-clothing'),
    matchedRuleIds: ['everyday-weather-clothing'],
    reason: 'Nhiệt độ 26°C, cảm nhận 31°C.',
  };
  const result = createDailyActions(
    weather,
    { ...empty, recommendations: [normal] },
    'place',
    Date.parse('2026-10-22T15:00:00Z'),
  );
  expect(result[0].title).toContain('Nghỉ ngơi');
  expect(result[0].title).not.toMatch(/đi học|đi làm/);
  expect(result[0].reason).toContain('22:00');
  expect(result[0].reason).toContain('26°C');
  expect(result[0].reason).toContain('31°C');
  expect(createDailyActions(weather, empty, 'place', Date.parse('2026-10-22T15:00:00Z'))).toEqual(
    [],
  );
});

it('keeps actual environmental warnings ahead of nighttime comfort advice', () => {
  const warning = {
    ...recommendation('weather-shelter'),
    severity: 'danger' as const,
    priority: 100,
    reason: 'Dông đang diễn ra.',
  };
  const comfort = {
    ...recommendation('light-clothing'),
    matchedRuleIds: ['everyday-weather-clothing'],
    reason: '26°C, cảm nhận 31°C.',
  };
  const result = createDailyActions(
    weather,
    { ...empty, recommendations: [comfort, warning] },
    'place',
    Date.parse('2026-10-22T15:00:00Z'),
  );
  expect(result[0].key).toBe('weather-shelter');
  expect(result[0].urgent).toBe(true);
  expect(result.some((item) => item.key === 'outdoor-activity-window')).toBe(false);
});

it('shows useful nighttime comfort actions rather than clothing alone', () => {
  const current = {
    ...weather,
    temperature: { valueCelsius: 25, feelsLikeCelsius: 31 },
    humidityPercent: 82,
  };
  const evaluation = evaluateRecommendations({ currentWeather: current, maxRecommendations: 100 });
  const actions = createDailyActions(
    current,
    evaluation,
    'place',
    Date.parse('2026-10-22T17:00:00Z'),
  );
  expect(actions.slice(0, 3).map((item) => item.key)).toEqual([
    'heat-hydration',
    'indoor-comfort',
    'damp-care',
  ]);
  expect(actions[0].title).toContain('nếu khát');
  expect(actions[1].title).toContain('chỗ ngủ');
  expect(actions[1].reason).toContain('điều hòa');
  expect(actions[2].title).toContain('chỗ ngủ');
  expect(actions.some((item) => /đi học|đi làm|buổi sáng/.test(item.title))).toBe(false);
});

it('previews only three suggestions including optional activities, with all warnings visible', () => {
  const ordinary = [
    'heat-hydration',
    'indoor-comfort',
    'damp-care',
    'light-clothing',
    'dry-laundry',
  ].map((key) => ({ id: key, key, title: key, reason: '', urgent: false }));
  expect(visibleDailyActions(ordinary)).toHaveLength(3);
  expect(visibleDailyActions(ordinary, true)).toHaveLength(5);
  const warning = { id: 'hazard', key: 'weather-shelter', title: 'Dông', reason: '', urgent: true };
  expect(visibleDailyActions([...ordinary, warning])).toContain(warning);
  expect(visibleDailyActions([...ordinary, warning])).toHaveLength(4);
});
