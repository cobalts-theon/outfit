/**
 * Các hàm đánh giá thời tiết trong toàn bộ thời gian một hoạt động.
 * Kiểm tra dữ liệu, tính rủi ro/điểm và chọn các khung giờ để người dùng cân nhắc.
 */
import type { WeatherAlert } from '@/types/weather';

import { PlanningHour, localDate, localHour, parseClock, clockLabel } from '@/utils/walking-planner';
export * from '@/utils/walking-planner';

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

// Lấy tên hiển thị của hoạt động.
export const activityLabel = (id: string) =>
  ACTIVITIES.find((a) => a.id === id)?.label ?? (id === 'shopping' ? 'Ra ngoài' : 'Hoạt động');

// Policy variants retain the exposure used when saving an hour, without changing old rows.
// Ghi phương tiện và mức tiếp xúc vào mã.
export function activityPolicyVersion(transport = 'none', exposure = 'short') {
  return `activity-v2:${transport}:${exposure}`;
}

// Đọc ngữ cảnh từ mã chính sách đã lưu.
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

// Kiểm tra giá trị là số hữu hạn.
const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

// Kiểm tra thời lượng từ 1 đến 1440 phút.
export function validActivityDuration(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 1440;
}

// Kiểm tra và chuẩn hóa ngày nhập.
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

// Đổi ngày ISO sang ngày/tháng/năm.
export function displayPlanningDate(iso: string) {
  return iso.split('-').reverse().join('/');
}

// Đánh giá thời tiết suốt thời gian hoạt động.
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
  const now = input.now ?? Date.now();
  const start = Date.parse(input.start);
  const end = start + input.duration * 60_000;
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
  // Bước 1: chỉ đánh giá giờ tương lai, thời lượng hợp lệ và dự báo còn mới.
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
  // Bước 2: lấy đủ từng giờ dự báo phủ toàn hoạt động; thiếu một giờ thì dừng.
  const ordered = [...input.hours].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const first = ordered.findIndex((h) => Date.parse(h.at) <= start && Date.parse(h.at) + 3_600_000 > start);
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
  // Bước 3: mức tiếp xúc ngoài trời quyết định việc có bắt buộc đủ AQI/UV hay không.
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
  // Lấy số đo cao nhất trong khoảng xét.
  const max = (key: 'feelsLike' | 'rainProbability' | 'wind' | 'gust' | 'uv' | 'aqi') =>
    Math.max(...samples.map((h) => (finite(h[key]) ? h[key]! : 0)));
  // Xét giá trị bất lợi nhất trong khoảng hoạt động, không chỉ giờ bắt đầu.
  const heat = max('feelsLike');
  const rain = max('rainProbability');
  const wind = max('wind');
  const gust = max('gust');
  const uv = max('uv');
  const aqi = max('aqi');
  const cold = Math.min(...samples.map((hour) => hour.feelsLike!));
  const night = samples.some((hour) => !hour.daylight);
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
  // Bước 4: kết luận trước, sau đó tính điểm để so sánh các giờ (điểm thấp tốt hơn).
  const shouldAvoid = severe || (exposed && (rain >= 0.6 || heat > 35 || aqi > 150));
  if (shouldAvoid) {
    result.status = 'avoid';
  } else if (result.risks.length > 0 || missing) {
    result.status = 'caution';
  } else {
    result.status = 'suitable';
  }
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
  if (result.status === 'avoid') {
    result.summary = input.activity === 'commute'
      ? 'Dự báo tại địa điểm đã chọn có điều kiện bất lợi. Điều chỉnh giờ nếu có thể và cân nhắc phương tiện có che chắn.'
      : 'Nên đổi giờ hoặc chuyển sang hoạt động trong nhà.';
  } else if (result.risks.length > 0) {
    result.summary = result.risks.join(' · ');
  } else if (missing) {
    result.summary = 'Có thể cân nhắc, nhưng chưa đủ chỉ số môi trường.';
  } else {
    result.summary = 'Điều kiện tương đối dễ chịu theo dự báo hiện có.';
  }
  // Thêm vật dụng cần chuẩn bị.
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

// Chọn tối đa ba khung giờ không trùng nhau.
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
  // Thử các giờ bắt đầu cách nhau 30 phút trong khoảng rảnh của người dùng.
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
  // Chọn tối đa ba kết quả không chồng thời gian để dễ so sánh trên giao diện.
  for (const candidate of candidates) {
    if (result.every((r) => candidate.end <= r.start || candidate.start >= r.end))
      result.push(candidate);
    if (result.length === 3) break;
  }
  return result;
}

// Commuting evaluates the chosen departure, never a ranked replacement time.
// Đánh giá đúng giờ khởi hành đã chọn.
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

// Tìm thời điểm theo ngày và giờ địa phương.
export function startAtClock(hours: readonly PlanningHour[], date: string, minute: number, timeZone: string): string | undefined {
  const h = hours.find(
    (h) =>
      localDate(h.at, timeZone) === date &&
      Math.floor(localHour(h.at, timeZone)) === Math.floor(minute / 60),
  );
  return h ? new Date(Date.parse(h.at) + (minute % 60) * 60_000).toISOString() : undefined;
}

// plan-helpers

// Chuẩn hóa cách nhập giờ và phút.
export function normalizeClockInput(value: string): string {
  const text = value.trim();
  if (/^\d{1,2}$/.test(text)) return `${text.padStart(2, '0')}:00`;
  if (/^\d{3,4}$/.test(text)) return `${text.slice(0, -2).padStart(2, '0')}:${text.slice(-2)}`;
  if (parseClock(text) !== undefined) return clockLabel(parseClock(text)!);
  return text;
}

// Đề xuất khoảng giờ mặc định để chọn.
export function defaultAvailability(date: string, now: number, timeZone: string) {
  const start =
    date === localDate(now, timeZone)
      ? Math.min(23.75, Math.ceil((localHour(new Date(now).toISOString(), timeZone) + 0.01) * 4) / 4)
      : 7;
  return { start: clockLabel(start), end: date === localDate(now, timeZone) ? '24:00' : '22:00' };
}

// Lấy ngày kế tiếp theo lịch.
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

// Đọc các vật dụng từ dữ liệu chuẩn bị.
export function preparationItems(preparation: string) {
  return Object.entries(PREPARATION_ITEMS).filter(([, label]) => preparation.includes(label));
}

// Chuẩn bị bằng chứng khi đổi giờ hoạt động.
export function rescheduledEvidence(assessment: ActivityAssessment, checked: readonly string[], now = Date.now()) {
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
