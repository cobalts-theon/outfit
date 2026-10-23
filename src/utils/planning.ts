import type { WeatherAlert } from '@/types/weather';

// walking-planner

/** Pure, platform-independent policy evaluation; reusable by server workers. */
export interface WalkingPolicy {
  version: string;
  maxAqi: number;
  maxUv: number;
  maxRainProbability: number;
  maxWind: number;
  maxGust: number;
  minFeelsLike: number;
  maxFeelsLike: number;
}

// Conservative product preferences for light walking, not medical safety limits.
export const DEFAULT_WALKING_POLICY: WalkingPolicy = {
  version: 'walking-v1',
  maxAqi: 100,
  maxUv: 6,
  maxRainProbability: 0.4,
  maxWind: 8,
  maxGust: 12,
  minFeelsLike: 15,
  maxFeelsLike: 33,
};

export interface PlanningHour {
  at: string;
  feelsLike?: number;
  uv?: number;
  aqi?: number;
  rainProbability?: number;
  wind?: number;
  gust?: number;
  daylight: boolean;
  hazardous: boolean;
}

export interface WalkingWindow {
  start: string;
  end: string;
  score: number;
  reasons: string[];
  preparation: string;
  policyVersion: string;
}

export interface WalkingEvaluation {
  status: 'ready' | 'limited' | 'unavailable' | 'no_match';
  windows: WalkingWindow[];
  message: string;
  reason?: 'elapsed' | 'duration' | 'no_forecast' | 'coverage' | 'conditions' | 'stale';
}

export function parseWalkingPolicy(value: unknown): WalkingPolicy | undefined {
  if (value === null || typeof value !== 'object') return undefined;
  const p = value as Record<string, unknown>;
  if (typeof p.version !== 'string' || !/^[a-zA-Z0-9._-]{1,64}$/.test(p.version)) return undefined;
  const ranges: Record<string, [number, number]> = {
    maxAqi: [1, 100],
    maxUv: [1, 6],
    maxRainProbability: [0, 0.4],
    maxWind: [1, 8],
    maxGust: [1, 12],
    minFeelsLike: [15, 25],
    maxFeelsLike: [25, 33],
  };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const n = p[key];
    if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) return undefined;
  }
  if ((p.minFeelsLike as number) >= (p.maxFeelsLike as number)) return undefined;
  return Object.fromEntries(
    ['version', ...Object.keys(ranges)].map((k) => [k, p[k]]),
  ) as unknown as WalkingPolicy;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string, clock: boolean) {
  const key = `${timeZone}:${clock}`;
  let value = formatters.get(key);
  if (!value) {
    value = new Intl.DateTimeFormat(
      clock ? 'en-GB' : 'en-CA',
      clock
        ? { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
        : { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' },
    );
    if (formatters.size >= 16) formatters.clear();
    formatters.set(key, value);
  }
  return value;
}

export function localDate(at: string | number, timeZone: string): string {
  const parts = formatter(timeZone, false).formatToParts(new Date(at));
  const part = (name: string) => parts.find((p) => p.type === name)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function localHour(at: string, timeZone: string): number {
  const parts = formatter(timeZone, true).formatToParts(new Date(at));
  return (
    Number(parts.find((p) => p.type === 'hour')?.value) +
    Number(parts.find((p) => p.type === 'minute')?.value) / 60
  );
}

export function formatPlanTime(at: string, timeZone: string): string {
  return formatter(timeZone, true).format(new Date(at));
}

export function parseClock(value: string): number | undefined {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(value.trim());
  if (!match) return undefined;
  const hour = Number(match[1]),
    minute = Number(match[2]);
  return hour < 24 || (hour === 24 && minute === 0) ? hour + minute / 60 : undefined;
}

export function clockLabel(hour: number): string {
  const minutes = Math.round(hour * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function evaluateWalkingWindows(input: {
  hours: readonly PlanningHour[];
  date: string;
  startHour: number;
  endHour: number;
  durationMinutes: number;
  timeZone: string;
  fetchedAt: number;
  now?: number;
  policy?: WalkingPolicy;
}): WalkingEvaluation {
  const now = input.now ?? Date.now();
  const p = input.policy ?? DEFAULT_WALKING_POLICY;
  const empty = (
    status: WalkingEvaluation['status'],
    reason: WalkingEvaluation['reason'],
    message: string,
  ): WalkingEvaluation => ({ status, reason, message, windows: [] });
  if (
    !Number.isFinite(now) ||
    ![30, 60, 90].includes(input.durationMinutes) ||
    !Number.isFinite(input.startHour) ||
    !Number.isFinite(input.endHour) ||
    input.startHour < 0 ||
    input.endHour > 24 ||
    input.startHour >= input.endHour
  ) {
    return empty(
      'unavailable',
      'duration',
      'Giờ kết thúc cần sau giờ bắt đầu trong cùng ngày. Ví dụ: 17:30–19:00.',
    );
  }
  if ((input.endHour - input.startHour) * 60 < input.durationMinutes - 0.001) {
    return empty(
      'no_match',
      'duration',
      `Bạn có ${Math.round((input.endHour - input.startHour) * 60)} phút rảnh nhưng đã chọn đi bộ ${input.durationMinutes} phút. Hãy giảm thời lượng hoặc nới giờ kết thúc.`,
    );
  }
  let today: string;
  try {
    today = localDate(now, input.timeZone);
  } catch {
    return empty('unavailable', 'no_forecast', 'Múi giờ chưa hợp lệ. Hãy chọn lại địa điểm.');
  }
  if (
    input.date < today ||
    (input.date === today &&
      localHour(new Date(now).toISOString(), input.timeZone) + input.durationMinutes / 60 >=
        input.endHour)
  ) {
    return empty(
      'no_match',
      'elapsed',
      'Khung giờ này đã qua hoặc không còn đủ thời gian để bắt đầu. Chọn giờ muộn hơn hoặc chuyển sang ngày mai.',
    );
  }
  const ordered = input.hours
    .filter((h) => Number.isFinite(Date.parse(h.at)))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  if (!ordered.length)
    return empty(
      'limited',
      'no_forecast',
      'Chưa tải được dự báo theo giờ cho địa điểm này. Hãy cập nhật dự báo; các gợi ý có đủ dữ liệu sẽ hiện lại.',
    );
  if (
    !parseWalkingPolicy(p) ||
    !Number.isFinite(input.fetchedAt) ||
    input.fetchedAt <= 0 ||
    input.fetchedAt > now + 60_000 ||
    now - input.fetchedAt > 30 * 60_000
  ) {
    return empty(
      'unavailable',
      'stale',
      'Dự báo chưa được cập nhật đủ gần thời điểm hiện tại. Cập nhật để tìm giờ mới.',
    );
  }
  const windows: WalkingWindow[] = [];
  const missing = new Set<string>();
  const blocked = new Set<string>();
  let considered = 0;
  const fields = {
    feelsLike: 'nhiệt độ cảm nhận',
    uv: 'UV',
    aqi: 'AQI',
    rainProbability: 'khả năng mưa',
    wind: 'gió',
    gust: 'gió giật',
  } as const;
  for (const [index, first] of ordered.entries()) {
    const base = Date.parse(first.at);
    // Test quarter-hour starts against hourly evidence; do not invent interpolated readings.
    // Include the exact user start as well (e.g. 17:10), even off the quarter-hour grid.
    const offsets = new Set([0, 15, 30, 45]);
    const localBase = localHour(first.at, input.timeZone);
    const userOffset = Math.round((input.startHour - localBase) * 60);
    if (userOffset >= 0 && userOffset < 60) offsets.add(userOffset);
    for (const minutes of offsets) {
      const start = base + minutes * 60_000;
      const startIso = new Date(start).toISOString();
      const hour = localHour(startIso, input.timeZone);
      if (
        start <= now ||
        localDate(startIso, input.timeZone) !== input.date ||
        hour + 0.00001 < input.startHour ||
        hour + input.durationMinutes / 60 > input.endHour + 0.00001
      )
        continue;
      considered++;
      const end = start + input.durationMinutes * 60_000;
      const count = Math.ceil((end - base) / 3_600_000) + 1;
      const slice = ordered.slice(index, index + count);
      if (
        slice.length !== count ||
        slice.some((h, i) => Date.parse(h.at) !== base + i * 3_600_000)
      ) {
        missing.add('các mốc dự báo liên tục đến cuối hoạt động');
        continue;
      }
      let complete = true;
      for (const h of slice)
        for (const [key, label] of Object.entries(fields)) {
          const n = h[key as keyof typeof fields];
          if (
            typeof n !== 'number' ||
            !Number.isFinite(n) ||
            (key !== 'feelsLike' && n < 0) ||
            (key === 'rainProbability' && n > 1)
          ) {
            missing.add(label);
            complete = false;
          }
        }
      if (!complete) continue;
      const reasons = new Set<string>();
      for (const h of slice) {
        if (h.hazardous) reasons.add('thời tiết bất lợi');
        if (h.aqi! > p.maxAqi) reasons.add('không khí kém');
        if (h.uv! >= p.maxUv) reasons.add('UV cao');
        if (h.rainProbability! >= p.maxRainProbability) reasons.add('khả năng mưa cao');
        if (h.wind! >= p.maxWind || h.gust! >= p.maxGust) reasons.add('gió mạnh');
        if (h.feelsLike! < p.minFeelsLike || h.feelsLike! > p.maxFeelsLike)
          reasons.add('nhiệt độ cảm nhận chưa phù hợp');
      }
      if (reasons.size) {
        reasons.forEach((r) => blocked.add(r));
        continue;
      }
      const max = (key: keyof typeof fields) => Math.max(...slice.map((h) => h[key]!));
      const feels = max('feelsLike');
      const night = slice.some((h) => !h.daylight);
      windows.push({
        start: startIso,
        end: new Date(end).toISOString(),
        score:
          max('aqi') / p.maxAqi +
          max('uv') / p.maxUv +
          max('rainProbability') +
          max('wind') / p.maxWind +
          Math.abs(feels - 24) / 10,
        reasons: [
          `Cảm nhận cao nhất ${Math.round(feels)}°C`,
          `US AQI tối đa ${Math.round(max('aqi'))}`,
          `UV tối đa ${max('uv').toFixed(1)}`,
          `Khả năng mưa tối đa ${Math.round(max('rainProbability') * 100)}%`,
        ],
        preparation: night
          ? 'Có thời gian sau khi trời tối: chỉ đi nếu đường đủ sáng, dễ quan sát và phù hợp; mang nước, kiểm tra lại trước khi đi.'
          : max('uv') >= 3
            ? 'Ưu tiên bóng râm, che nắng và mang nước; kiểm tra lại trước khi đi.'
            : 'Mang nước, chọn đường đi phù hợp và kiểm tra lại trước khi đi.',
        policyVersion: p.version,
      });
    }
  }
  windows.sort((a, b) => a.score - b.score || a.start.localeCompare(b.start));
  const alternatives: WalkingWindow[] = [];
  for (const w of windows) {
    if (alternatives.every((a) => w.end <= a.start || w.start >= a.end)) alternatives.push(w);
    if (alternatives.length === 3) break;
  }
  if (alternatives.length)
    return {
      status: missing.size ? 'limited' : 'ready',
      windows: alternatives,
      message:
        'Những khoảng sau đáp ứng điều kiện dự báo cho đi bộ nhẹ trong giờ bạn rảnh. Kiểm tra lại trước khi đi.',
    };
  if (!considered)
    return empty(
      'limited',
      'coverage',
      'Dự báo hiện có chưa bao phủ giờ bạn chọn. Thử một khung giờ khác trong ngày hoặc cập nhật dự báo.',
    );
  if (missing.size)
    return empty(
      'limited',
      'coverage',
      `Chưa thể so sánh toàn bộ khung giờ vì thiếu ${[...missing].join(', ')}. Các gợi ý sinh hoạt ở trên vẫn dùng những chỉ số đã có.`,
    );
  return empty(
    'no_match',
    'conditions',
    `Chưa có giờ phù hợp để đi bộ vì ${[...blocked].join(', ')}. Bạn vẫn có thể tham khảo gợi ý sinh hoạt và đổi giờ rảnh.`,
  );
}

// activity-advisor

export const ACTIVITIES = [
  { id: 'walking', label: 'Đi bộ', icon: 'outdoor-activity-window' },
  { id: 'running', label: 'Chạy bộ', icon: 'outdoor-activity-window' },
  { id: 'commute', label: 'Đi làm / đi học', icon: 'rain-protection' },
  { id: 'outing', label: 'Ra ngoài', icon: 'sun-protection' },
] as const;

export type Activity = (typeof ACTIVITIES)[number]['id'] | 'shopping';

export type KitItem = { id: string; label: string; icon: string };

export type ActivityAssessment = {
  start: string;
  end: string;
  status: 'suitable' | 'caution' | 'avoid' | 'unknown';
  score: number;
  summary: string;
  reasons: string[];
  risks: string[];
  checklist: KitItem[];
};

export const activityLabel = (id: string) =>
  ACTIVITIES.find((a) => a.id === id)?.label ?? (id === 'shopping' ? 'Ra ngoài' : 'Hoạt động');

// Policy variants retain the exposure used when saving an hour, without changing old rows.
export function activityPolicyVersion(transport = 'none', exposure = 'short') {
  return `activity-v2:${transport}:${exposure}`;
}

export function activityPolicyContext(version: string): {
  transport?: 'walk' | 'bike' | 'motorbike' | 'covered' | 'none';
  exposure?: 'short' | 'long';
} {
  const match = /^activity-v2:(walk|bike|motorbike|covered|none):(short|long)$/.exec(version);
  return match
    ? {
        transport: match[1] as 'walk' | 'bike' | 'motorbike' | 'covered' | 'none',
        exposure: match[2] as 'short' | 'long',
      }
    : {};
}

const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export function validActivityDuration(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 1440;
}

export function parsePlanningDate(value: string): string | undefined {
  const text = value.trim();
  const parts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  const iso = parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : text;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const time = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === iso
    ? iso
    : undefined;
}

export function displayPlanningDate(iso: string) {
  return iso.split('-').reverse().join('/');
}

export function assessActivity(input: {
  activity: Activity;
  transport?: 'walk' | 'bike' | 'motorbike' | 'covered' | 'none';
  exposure?: 'short' | 'long';
  start: string;
  duration: number;
  hours: readonly PlanningHour[];
  alerts?: readonly WeatherAlert[];
  fetchedAt: number;
  now?: number;
}): ActivityAssessment {
  const now = input.now ?? Date.now(),
    start = Date.parse(input.start),
    end = start + input.duration * 60_000;
  const result: ActivityAssessment = {
    start: input.start,
    end: Number.isFinite(end) ? new Date(end).toISOString() : input.start,
    status: 'unknown',
    score: Infinity,
    summary: 'Chưa đủ dự báo cho toàn bộ hoạt động.',
    reasons: [],
    risks: [],
    checklist: [],
  };
  if (!finite(start) || start <= now || !validActivityDuration(input.duration)) {
    result.summary = 'Giờ này đã qua hoặc thời lượng chưa hợp lệ.';
    return result;
  }
  if (
    !finite(input.fetchedAt) ||
    input.fetchedAt <= 0 ||
    input.fetchedAt > now + 60_000 ||
    now - input.fetchedAt > 30 * 60_000
  ) {
    result.summary = 'Cập nhật dự báo trước khi so sánh giờ.';
    return result;
  }
  const ordered = [...input.hours].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const first = ordered.findIndex(
    (h) => Date.parse(h.at) <= start && Date.parse(h.at) + 3_600_000 > start,
  );
  if (first < 0) return result;
  const samples: PlanningHour[] = [];
  for (
    let cursor = Date.parse(ordered[first].at), index = first;
    cursor < end;
    cursor += 3_600_000, index++
  ) {
    const h = ordered[index];
    if (!h || Date.parse(h.at) !== cursor) return result;
    samples.push(h);
  }
  if (
    samples.some(
      (h) =>
        !finite(h.feelsLike) ||
        !finite(h.rainProbability) ||
        h.rainProbability < 0 ||
        h.rainProbability > 1 ||
        !finite(h.wind) ||
        h.wind < 0 ||
        !finite(h.gust) ||
        h.gust < 0,
    )
  )
    return result;
  const exercise = ['running', 'walking'].includes(input.activity);
  const transport = exercise ? 'walk' : input.transport;
  const exposed =
    exercise ||
    ['walk', 'bike'].includes(transport ?? '') ||
    (transport !== 'covered' && input.exposure === 'long');
  const missing = samples.some((h) => !finite(h.aqi) || h.aqi < 0 || !finite(h.uv) || h.uv < 0);
  if (exposed && missing) {
    result.summary = 'Chưa có đủ AQI/UV để đánh giá thời gian ngoài trời.';
    return result;
  }
  const max = (key: 'feelsLike' | 'rainProbability' | 'wind' | 'gust' | 'uv' | 'aqi') =>
    Math.max(...samples.map((h) => (finite(h[key]) ? h[key]! : 0)));
  const heat = max('feelsLike'),
    rain = max('rainProbability'),
    wind = max('wind'),
    gust = max('gust'),
    uv = max('uv'),
    aqi = max('aqi');
  const cold = Math.min(...samples.map((h) => h.feelsLike!)),
    night = samples.some((h) => !h.daylight);
  const alert = input.alerts?.some(
    (a) =>
      ['warning', 'severe', 'extreme'].includes(a.severity) &&
      (!a.startsAt || Date.parse(a.startsAt) < end) &&
      (!a.endsAt || Date.parse(a.endsAt) > start),
  );
  const severe = alert || samples.some((h) => h.hazardous) || wind >= 8 || gust >= 12;
  if (severe) result.risks.push('Thời tiết bất lợi hoặc gió mạnh');
  if (rain >= 0.4) result.risks.push('Khả năng mưa tăng');
  if (heat > (input.activity === 'running' ? 30 : 33)) result.risks.push('Nhiệt độ cảm nhận cao');
  if (cold < 15) result.risks.push('Trời lạnh');
  if (aqi > 100) result.risks.push('Chất lượng không khí kém');
  if (uv >= 6) result.risks.push('UV cao');
  if (night && exercise) result.risks.push('Cần tuyến đường đủ sáng');
  result.status =
    severe || (exposed && (rain >= 0.6 || heat > 35 || aqi > 150))
      ? 'avoid'
      : result.risks.length || missing
        ? 'caution'
        : 'suitable';
  result.score =
    (result.status === 'avoid' ? 100 : result.status === 'caution' ? 20 : 0) +
    rain * 10 +
    Math.abs(heat - 24) / 3 +
    wind +
    uv / 3 +
    aqi / 50;
  result.reasons = [
    ...(input.activity === 'commute'
      ? ['Đánh giá tại địa điểm đã chọn; chưa tính toàn bộ tuyến đường đi làm/đi học.']
      : []),
    ...(!exercise && transport === 'covered'
      ? ['Di chuyển có che chắn; vẫn kiểm tra các đoạn ở ngoài trời.']
      : []),
    `Cảm nhận ${Math.round(cold)}–${Math.round(heat)}°C`,
    `Mưa tối đa ${Math.round(rain * 100)}%`,
    `Gió tối đa ${wind.toFixed(1)} m/s`,
    ...(missing
      ? ['Thiếu một phần AQI/UV']
      : [`UV tối đa ${uv.toFixed(1)}`, `US AQI tối đa ${Math.round(aqi)}`]),
  ];
  result.summary =
    result.status === 'avoid'
      ? input.activity === 'commute'
        ? 'Dự báo tại địa điểm đã chọn có điều kiện bất lợi. Điều chỉnh giờ nếu có thể và cân nhắc phương tiện có che chắn.'
        : 'Nên đổi giờ hoặc chuyển sang hoạt động trong nhà.'
      : result.risks.length
        ? result.risks.join(' · ')
        : missing
          ? 'Có thể cân nhắc, nhưng chưa đủ chỉ số môi trường.'
          : 'Điều kiện tương đối dễ chịu theo dự báo hiện có.';
  const add = (id: string, label: string, icon: string) =>
    result.checklist.push({ id, label, icon });
  if (heat >= 28) add('water', 'Nước uống, nghỉ ở chỗ mát', 'heat-hydration');
  if (rain >= 0.25)
    add(
      'umbrella',
      transport === 'covered'
        ? 'Ô cho đoạn đi bộ ngoài trời'
        : ['bike', 'motorbike'].includes(transport ?? '')
          ? 'Áo mưa'
          : 'Ô hoặc áo mưa',
      'rain-protection',
    );
  if (samples.some((h) => h.daylight && finite(h.uv) && h.uv >= 3))
    add('sun', 'Mũ / đồ che nắng', 'sun-protection');
  if (cold < 22) add('jacket', 'Áo khoác', 'warm-clothing');
  if (night) add('visibility', 'Đồ dễ nhận diện khi tối', 'light-clothing');
  return result;
}

export function activityCandidates(
  input: Omit<Parameters<typeof assessActivity>[0], 'start'> & {
    date: string;
    timeZone: string;
    from: number;
    to: number;
    includeAvoid?: boolean;
    blockedMinutes?: readonly number[];
    excludedStarts?: readonly string[];
  },
) {
  if (input.from >= input.to) return [];
  const candidates = input.hours
    .flatMap((h) =>
      [0, 30].map((offset) => new Date(Date.parse(h.at) + offset * 60_000).toISOString()),
    )
    .filter(
      (at) =>
        localDate(at, input.timeZone) === input.date &&
        localHour(at, input.timeZone) * 60 >= input.from &&
        localHour(at, input.timeZone) * 60 + input.duration <= input.to,
    )
    .filter(
      (at) =>
        !(input.excludedStarts ?? []).some((excluded) => Date.parse(excluded) === Date.parse(at)),
    )
    .filter((at) => !(input.blockedMinutes ?? []).includes(localHour(at, input.timeZone) * 60))
    .map((start) => assessActivity({ ...input, start }))
    .filter((a) => a.status !== 'unknown' && (input.includeAvoid || a.status !== 'avoid'))
    .sort((a, b) => a.score - b.score || a.start.localeCompare(b.start));
  const result: ActivityAssessment[] = [];
  for (const candidate of candidates) {
    if (result.every((r) => candidate.end <= r.start || candidate.start >= r.end))
      result.push(candidate);
    if (result.length === 3) break;
  }
  return result;
}

// Commuting evaluates the chosen departure, never a ranked replacement time.
export function assessDeparture(
  input: Omit<Parameters<typeof assessActivity>[0], 'start' | 'activity'> & {
    date: string;
    timeZone: string;
    departure?: number;
  },
): ActivityAssessment | undefined {
  if (
    input.departure === undefined ||
    !Number.isInteger(input.departure) ||
    input.departure < 360 ||
    input.departure >= 1440 ||
    !parsePlanningDate(input.date)
  )
    return undefined;
  const start = startAtClock(input.hours, input.date, input.departure, input.timeZone);
  return start ? assessActivity({ ...input, activity: 'commute', start }) : undefined;
}

export function startAtClock(
  hours: readonly PlanningHour[],
  date: string,
  minute: number,
  timeZone: string,
): string | undefined {
  const h = hours.find(
    (h) =>
      localDate(h.at, timeZone) === date &&
      Math.floor(localHour(h.at, timeZone)) === Math.floor(minute / 60),
  );
  return h ? new Date(Date.parse(h.at) + (minute % 60) * 60_000).toISOString() : undefined;
}

// plan-helpers

export function normalizeClockInput(value: string): string {
  const text = value.trim();
  if (/^\d{1,2}$/.test(text)) return `${text.padStart(2, '0')}:00`;
  if (/^\d{3,4}$/.test(text)) return `${text.slice(0, -2).padStart(2, '0')}:${text.slice(-2)}`;
  if (parseClock(text) !== undefined) return clockLabel(parseClock(text)!);
  return text;
}

export function defaultAvailability(date: string, now: number, timeZone: string) {
  const start =
    date === localDate(now, timeZone)
      ? Math.min(
          23.75,
          Math.ceil((localHour(new Date(now).toISOString(), timeZone) + 0.01) * 4) / 4,
        )
      : 7;
  return { start: clockLabel(start), end: date === localDate(now, timeZone) ? '24:00' : '22:00' };
}

export function nextLocalDate(date: string): string {
  const day = new Date(`${date}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString().slice(0, 10);
}

export const PREPARATION_ITEMS = {
  water: 'Nước uống',
  umbrella: 'Ô hoặc áo mưa',
  sun: 'Mũ / đồ che nắng',
  jacket: 'Áo khoác',
  shoes: 'Giày vận động',
  visibility: 'Đồ dễ nhận diện khi tối',
  bag: 'Túi đựng đồ',
};

export function preparationItems(preparation: string) {
  return Object.entries(PREPARATION_ITEMS).filter(([, label]) => preparation.includes(label));
}

export function rescheduledEvidence(
  assessment: ActivityAssessment,
  checked: readonly string[],
  now = Date.now(),
) {
  if (Date.parse(assessment.start) <= now || !['suitable', 'caution'].includes(assessment.status)) {
    throw new Error('Giờ này chưa phù hợp. Hãy cập nhật dự báo và chọn lại.');
  }
  return {
    starts_at: assessment.start,
    ends_at: assessment.end,
    policy_version: 'activity-v1',
    reasons: assessment.reasons,
    baseline_risks: assessment.risks,
    baseline_status: assessment.status,
    preparation:
      assessment.checklist.map((item) => item.label).join(' · ') ||
      'Kiểm tra điều kiện thực tế trước khi đi.',
    checked_items: checked.filter((id) => assessment.checklist.some((item) => item.id === id)),
  };
}
