/**
 * Bộ chọn giờ đi bộ theo chính sách walking-v1 và các hàm thời gian dùng chung.
 */

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

// Kiểm tra các ngưỡng của chính sách đi bộ.
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
  return Object.fromEntries(['version', ...Object.keys(ranges)].map((k) => [k, p[k]])) as unknown as WalkingPolicy;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

// Tạo bộ định dạng ngày hoặc giờ địa phương.
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

// Lấy ngày tại múi giờ được chọn.
export function localDate(at: string | number, timeZone: string): string {
  const parts = formatter(timeZone, false).formatToParts(new Date(at));
  // Lấy một thành phần thời gian đã định dạng.
  const part = (name: string) => parts.find((p) => p.type === name)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

// Lấy giờ và phần phút tại địa điểm.
export function localHour(at: string, timeZone: string): number {
  const parts = formatter(timeZone, true).formatToParts(new Date(at));
  return (
    Number(parts.find((p) => p.type === 'hour')?.value) +
    Number(parts.find((p) => p.type === 'minute')?.value) / 60
  );
}

// Định dạng giờ hoạt động đã lưu.
export function formatPlanTime(at: string, timeZone: string): string {
  return formatter(timeZone, true).format(new Date(at));
}

// Đổi giờ nhập thành số phút trong ngày.
export function parseClock(value: string): number | undefined {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(value.trim());
  if (!match) return undefined;
  const hour = Number(match[1]),
    minute = Number(match[2]);
  return hour < 24 || (hour === 24 && minute === 0) ? hour + minute / 60 : undefined;
}

// Đổi số phút thành nhãn giờ.
export function clockLabel(hour: number): string {
  const minutes = Math.round(hour * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

// Tìm giờ đi bộ đáp ứng chính sách.
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
  // Tạo kết quả chưa có khung giờ phù hợp.
  const empty = (status: WalkingEvaluation['status'], reason: WalkingEvaluation['reason'], message: string): WalkingEvaluation => ({ status, reason, message, windows: [] });
  if (
    !Number.isFinite(now) ||
    ![30, 60, 90].includes(input.durationMinutes) ||
    !Number.isFinite(input.startHour) ||
    !Number.isFinite(input.endHour) ||
    input.startHour < 0 ||
    input.endHour > 24 ||
    input.startHour >= input.endHour
  ) {
    return empty('unavailable', 'duration', 'Giờ kết thúc cần sau giờ bắt đầu trong cùng ngày. Ví dụ: 17:30–19:00.');
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
    return empty('no_match', 'elapsed', 'Khung giờ này đã qua hoặc không còn đủ thời gian để bắt đầu. Chọn giờ muộn hơn hoặc chuyển sang ngày mai.');
  }
  const ordered = input.hours
    .filter((h) => Number.isFinite(Date.parse(h.at)))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  if (!ordered.length)
    return empty('limited', 'no_forecast', 'Chưa tải được dự báo theo giờ cho địa điểm này. Hãy cập nhật dự báo; các gợi ý có đủ dữ liệu sẽ hiện lại.');
  if (
    !parseWalkingPolicy(p) ||
    !Number.isFinite(input.fetchedAt) ||
    input.fetchedAt <= 0 ||
    input.fetchedAt > now + 60_000 ||
    now - input.fetchedAt > 30 * 60_000
  ) {
    return empty('unavailable', 'stale', 'Dự báo chưa được cập nhật đủ gần thời điểm hiện tại. Cập nhật để tìm giờ mới.');
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
      // Lấy số đo cao nhất trong khoảng xét.
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
    return empty('limited', 'coverage', 'Dự báo hiện có chưa bao phủ giờ bạn chọn. Thử một khung giờ khác trong ngày hoặc cập nhật dự báo.');
  if (missing.size)
    return empty('limited', 'coverage', `Chưa thể so sánh toàn bộ khung giờ vì thiếu ${[...missing].join(', ')}. Các gợi ý sinh hoạt ở trên vẫn dùng những chỉ số đã có.`);
  return empty('no_match', 'conditions', `Chưa có giờ phù hợp để đi bộ vì ${[...blocked].join(', ')}. Bạn vẫn có thể tham khảo gợi ý sinh hoạt và đổi giờ rảnh.`);
}

