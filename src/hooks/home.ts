/**
 * Chuẩn bị dữ liệu cho Home: vị trí → thời tiết → gợi ý → thông báo.
 * useHomeModel gom logic để màn hình chủ yếu tập trung vào bố cục.
 */
import type { AirQualityCategory, CurrentWeather, UVCategory, WeatherCondition, HourlyForecast, ZonedDateTimeString, RecommendationEvaluation, RecommendationSeverity } from '@/types/weather';
import { evaluateRecommendations, createRecommendationNotificationPlan, actionContext, createDailyActions, parseLifestylePreferences, personalizeDailyActions } from '@/utils/recommendations';
import { type LiveCurrentWeatherResult, useLiveCurrentWeather } from '@/services/live-weather';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@/context/auth';
import { useLocationCapability } from '@/context/location';
import { useNotifications } from '@/context/notifications';
import { HOME_SCENARIOS } from '@/constants/demo-weather';

// home-presentation

export type HomeRiskTone = 'calm' | 'attention' | 'warning' | 'danger' | 'unavailable';

export interface HomeRiskPreview {
  readonly tone: HomeRiskTone;
  readonly levelLabel: string;
  readonly title: string;
  readonly reason: string;
  readonly immediateAction: string;
}

export interface HomeForecastPreviewItem {
  readonly id: string;
  readonly timeLabel: string;
  readonly condition: WeatherCondition;
  readonly temperatureCelsius: number;
  readonly precipitationProbability?: number;
  readonly isDay: boolean;
  readonly isCurrent?: boolean;
}

export interface HomeForecastPreview {
  readonly summary: string;
  readonly items: readonly HomeForecastPreviewItem[];
}

export interface HomeRecommendationPreview {
  readonly what: string;
  readonly why: string;
  readonly do: string;
}

const conditionLabels: Record<WeatherCondition, string> = {
  clear: 'Trời quang',
  mostly_clear: 'Ít mây',
  partly_cloudy: 'Mây từng phần',
  mostly_cloudy: 'Nhiều mây',
  cloudy: 'Có mây',
  overcast: 'U ám',
  drizzle: 'Mưa phùn',
  light_rain: 'Mưa nhẹ',
  rain: 'Mưa',
  heavy_rain: 'Mưa lớn',
  showers: 'Mưa rào',
  heavy_showers: 'Mưa rào lớn',
  freezing_rain: 'Mưa đóng băng',
  thunderstorm: 'Dông',
  thunderstorm_rain: 'Dông kèm mưa',
  severe_thunderstorm: 'Dông mạnh',
  hail: 'Mưa đá',
  sleet: 'Mưa tuyết',
  light_snow: 'Tuyết nhẹ',
  snow: 'Tuyết',
  heavy_snow: 'Tuyết dày',
  snow_showers: 'Tuyết rào',
  blizzard: 'Bão tuyết',
  mist: 'Sương mỏng',
  fog: 'Sương mù',
  haze: 'Mù khô',
  smoke: 'Khói',
  dust: 'Bụi',
  sandstorm: 'Bão cát',
  tropical_storm: 'Bão nhiệt đới',
  hurricane: 'Bão mạnh',
  tornado: 'Lốc xoáy',
  unknown: 'Chưa xác định',
};

const daylightLabels: Record<CurrentWeather['daylight']['phase'], string> = {
  dawn: 'Bình minh',
  day: 'Ban ngày',
  sunset: 'Hoàng hôn',
  twilight: 'Chạng vạng',
  night: 'Ban đêm',
};

const uvLabels: Record<UVCategory, string> = {
  low: 'Thấp',
  moderate: 'Trung bình',
  high: 'Cao',
  very_high: 'Rất cao',
  extreme: 'Cực đại',
};

const airQualityLabels: Record<AirQualityCategory, string> = {
  good: 'Tốt',
  moderate: 'Trung bình',
  unhealthy_for_sensitive_groups: 'Kém cho nhóm nhạy cảm',
  unhealthy: 'Không lành mạnh',
  very_unhealthy: 'Rất không lành mạnh',
  hazardous: 'Nguy hại',
  unknown: 'Chưa xác định',
};

// Lấy tên tiếng Việt của thời tiết.
export function getConditionLabel(condition: WeatherCondition) {
  return conditionLabels[condition];
}

// Lấy nhãn ban ngày hoặc ban đêm.
export function getDaylightLabel(daylight: CurrentWeather['daylight']) {
  return daylightLabels[daylight.phase];
}

// Lấy nhãn mức tia UV.
export function getUvLabel(category?: UVCategory) {
  return category === undefined ? 'Chưa phân loại' : uvLabels[category];
}

// Lấy nhãn chất lượng không khí.
export function getAirQualityLabel(category?: AirQualityCategory) {
  return category === undefined ? 'Chưa phân loại' : airQualityLabels[category];
}

// Định dạng giờ số liệu theo địa điểm.
export function formatObservedTime(weather: CurrentWeather) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: weather.location.timeZone,
    }).format(new Date(weather.observedAt));
  } catch {
    return weather.observedAt.slice(11, 16);
  }
}

// Đổi tốc độ gió sang km/h để hiển thị.
export function formatWind(weather: CurrentWeather) {
  const kilometersPerHour = Math.round(weather.wind.speedMetersPerSecond * 3.6);
  const direction = weather.wind.direction === undefined ? '' : ` ${weather.wind.direction}`;
  return `${kilometersPerHour} km/h${direction}`;
}

const riskTone: Record<RecommendationSeverity, HomeRiskTone> = {
  info: 'calm',
  attention: 'attention',
  warning: 'warning',
  danger: 'danger',
};

const riskLevel: Record<RecommendationSeverity, string> = {
  info: 'THÔNG TIN',
  attention: 'LƯU Ý',
  warning: 'CẢNH BÁO',
  danger: 'NGUY HIỂM',
};

export interface HomeLiveRecommendationPresentation {
  readonly evaluation: RecommendationEvaluation;
  readonly risk: HomeRiskPreview;
}

// Chọn rủi ro chính từ các lời khuyên.
export function createRecommendationRisk(evaluation: RecommendationEvaluation): HomeRiskPreview {
  const primaryRisk = evaluation.recommendations.find((recommendation) => recommendation.severity !== 'info');

  if (primaryRisk !== undefined) {
    return {
      tone: riskTone[primaryRisk.severity],
      levelLabel: riskLevel[primaryRisk.severity],
      title: primaryRisk.title,
      reason: primaryRisk.reason,
      immediateAction: primaryRisk.action,
    };
  }

  if (evaluation.status !== 'ready') {
    return {
      tone: 'unavailable',
      levelLabel: 'DỮ LIỆU MỘT PHẦN',
      title: 'Chưa thể loại trừ rủi ro môi trường',
      reason:
        'Một số đầu vào của Rule Engine chưa khả dụng; dữ liệu trống không được xem là trạng thái an toàn.',
      immediateAction:
        'Dùng các gợi ý được hỗ trợ bởi số đo hiện có và kiểm tra lại khi dữ liệu đầy đủ hơn.',
    };
  }

  return {
    tone: 'calm',
    levelLabel: 'ỔN ĐỊNH',
    title: 'Chưa có rủi ro nổi bật',
    reason: 'Các quy tắc ban đầu không phát hiện điều kiện cần ưu tiên từ dữ liệu hiện có.',
    immediateAction:
      'Có thể tiếp tục kế hoạch và kiểm tra lại khi thời tiết hoặc chỉ số môi trường thay đổi.',
  };
}

// Đánh giá dữ liệu thật để hiển thị gợi ý.
export function createLiveRecommendationPresentation(result: LiveCurrentWeatherResult): HomeLiveRecommendationPresentation {
  const evaluation = evaluateRecommendations({
    currentWeather: result.weather,
    hourlyForecast: result.hourlyForecast,
    maxRecommendations: 100,
  });

  return { evaluation, risk: createRecommendationRisk(evaluation) };
}

export const HOME_NEAR_TERM_HOUR_COUNT = 6;

// Tìm mốc dự báo gần thời điểm số liệu.
function findNearTermStart(forecast: HourlyForecast, observedAt: ZonedDateTimeString) {
  const observedTime = Date.parse(observedAt);
  const entries = forecast.entries;

  for (let index = 0; index < entries.length; index += 1) {
    const start = Date.parse(entries[index].forecastAt);
    const next = entries[index + 1];
    const end = next === undefined ? start + 60 * 60 * 1000 : Date.parse(next.forecastAt);
    if (observedTime >= start && observedTime < end) {
      return { index, hasCurrentHour: true };
    }
  }

  return { index: entries.findIndex((entry) => Date.parse(entry.forecastAt) > observedTime), hasCurrentHour: false };
}

// Định dạng giờ theo múi giờ địa điểm.
function formatHour(timestamp: string, timeZone: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(timestamp));
}

// Tạo dự báo giờ tóm tắt cho Home.
export function createHomeHourlyForecastPreview(forecast: HourlyForecast, observedAt: ZonedDateTimeString, limit = HOME_NEAR_TERM_HOUR_COUNT): HomeForecastPreview {
  const start = findNearTermStart(forecast, observedAt);
  if (start.index < 0 || limit <= 0) {
    return createUnavailableHomeForecastPreview();
  }

  const items = forecast.entries.slice(start.index, start.index + limit).map((entry, index) => ({
    id: entry.forecastAt,
    timeLabel:
      index === 0 && start.hasCurrentHour
        ? 'BÂY GIỜ'
        : formatHour(entry.forecastAt, forecast.location.timeZone),
    condition: entry.condition,
    temperatureCelsius: entry.temperatureCelsius,
    ...(entry.precipitation?.probability === undefined
      ? {}
      : { precipitationProbability: entry.precipitation.probability }),
    isDay: entry.daylight.isDay,
    ...(index === 0 && start.hasCurrentHour ? { isCurrent: true } : {}),
  }));

  return { summary: 'Diễn biến vài giờ tới theo giờ địa phương.', items };
}

// Tạo nội dung khi thiếu dự báo giờ.
export function createUnavailableHomeForecastPreview(): HomeForecastPreview {
  return { summary: 'Chuỗi dự báo theo giờ chưa khả dụng cho lần cập nhật trực tiếp này.', items: [] };
}

// weather-glyph-state

export type WeatherIconKey =
  | 'sunny'
  | 'night'
  | 'partly_cloudy_day'
  | 'partly_cloudy_night'
  | 'cloudy'
  | 'rain_light'
  | 'rain'
  | 'rain_heavy'
  | 'thunder'
  | 'snow_light'
  | 'snow'
  | 'snow_heavy';

// Chọn mã icon theo thời tiết và ngày đêm.
export function getWeatherIconKey(condition: WeatherCondition, isDay: boolean): WeatherIconKey {
  switch (condition) {
    case 'clear':
      return isDay ? 'sunny' : 'night';
    case 'mostly_clear':
    case 'partly_cloudy':
      return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
    case 'mostly_cloudy':
    case 'cloudy':
    case 'overcast':
    case 'mist':
    case 'fog':
    case 'haze':
    case 'smoke':
    case 'dust':
      return 'cloudy';
    case 'drizzle':
    case 'light_rain':
      return 'rain_light';
    case 'rain':
    case 'showers':
    case 'freezing_rain':
      return 'rain';
    case 'heavy_rain':
    case 'heavy_showers':
      return 'rain_heavy';
    case 'thunderstorm':
    case 'thunderstorm_rain':
    case 'severe_thunderstorm':
    case 'hail':
    case 'sandstorm':
    case 'tropical_storm':
    case 'hurricane':
    case 'tornado':
      return 'thunder';
    case 'sleet':
    case 'light_snow':
      return 'snow_light';
    case 'snow':
    case 'snow_showers':
      return 'snow';
    case 'heavy_snow':
    case 'blizzard':
      return 'snow_heavy';
    case 'unknown':
      return 'cloudy';
  }
}

// use-home-model

// Chuẩn bị thời tiết và lời khuyên cho Home.
export function useHomeModel() {
  // Bước 1: lấy tài khoản/sở thích và đồng hồ để xác định ngữ cảnh hiện tại.
  const { state: authState } = useAuth();
  const user = authState.status === 'signed_in' ? authState.user : undefined;
  const preferences = parseLifestylePreferences(user?.user_metadata.lifestyle_preferences);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    // Cập nhật thời điểm hiện tại.
    const update = () => setNow(Date.now());
    const timer = setInterval(update, 30_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') update();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  const { sync: syncNotifications } = useNotifications();
  // Bước 2: lấy vị trí được chọn rồi truy vấn thời tiết tương ứng.
  const { state: locationState } = useLocationCapability();
  const selectedLocation =
    locationState.status === 'ready' ? locationState.selectedLocation : undefined;
  const liveWeatherQuery = useLiveCurrentWeather(selectedLocation);
  const scenario = HOME_SCENARIOS[0];
  const liveResult = liveWeatherQuery.data;
  const isLive = liveResult !== undefined;
  const fixturePresentation = scenario;
  const weather: CurrentWeather = liveResult?.weather ?? scenario.weather;
  const liveRecommendationPresentation =
    liveResult === undefined ? undefined : createLiveRecommendationPresentation(liveResult);
  const forecast =
    liveResult === undefined
      ? fixturePresentation.forecast
      : liveResult.hourlyForecast === undefined
        ? createUnavailableHomeForecastPreview()
        : createHomeHourlyForecastPreview(liveResult.hourlyForecast, liveResult.weather.observedAt);
  const forecastSource: 'fixture' | 'unavailable' | 'live' =
    liveResult === undefined
      ? 'fixture'
      : liveResult.hourlyForecast === undefined
        ? 'unavailable'
        : 'live';
  const observedTime = formatObservedTime(weather);
  const location =
    selectedLocation?.label ??
    (selectedLocation === undefined
      ? [weather.location.name, weather.location.region].filter(Boolean).join(' // ')
      : 'VỊ TRÍ HIỆN TẠI');
  const locationIdentity = selectedLocation
    ? `${selectedLocation.source}:${selectedLocation.coordinates.latitude.toFixed(3)},${selectedLocation.coordinates.longitude.toFixed(3)}`
    : '';
  const context = actionContext(weather, now);
  // Bước 3: chỉ tạo hành động từ dữ liệu trực tiếp, không quá 30 phút kể từ lần tải.
  const isStale = now - liveWeatherQuery.dataUpdatedAt > 30 * 60_000;
  const evaluation = isStale
    ? { status: 'unavailable' as const, recommendations: [], missingDimensions: [] }
    : liveRecommendationPresentation?.evaluation;
  const baseActions = evaluation
    ? createDailyActions(weather, evaluation, locationIdentity, now)
    : [];
  const actions = personalizeDailyActions(baseActions, preferences, context.period, context.clock);
  useEffect(() => {
    // Bước 4: đồng bộ thông báo; hủy gợi ý thông báo nếu dữ liệu thiếu hoặc đã cũ.
    if (liveResult === undefined || selectedLocation === undefined) {
      void syncNotifications([]);
      return;
    }
    if (isStale) {
      void syncNotifications([]);
      return;
    }
    const notificationPresentation = createLiveRecommendationPresentation(liveResult);
    const events = createRecommendationNotificationPlan({
      currentWeather: liveResult.weather,
      evaluation: notificationPresentation.evaluation,
      hourlyForecast: liveResult.hourlyForecast,
      locationIdentity: `${selectedLocation.source}:${selectedLocation.coordinates.latitude.toFixed(3)},${selectedLocation.coordinates.longitude.toFixed(3)}`,
      locationLabel: location,
      now,
    });
    void syncNotifications(events);
  }, [liveResult, location, selectedLocation, syncNotifications, now, isStale]);
  return {
    user,
    now,
    selectedLocation,
    liveWeatherQuery,
    liveResult,
    isLive,
    fixturePresentation,
    weather,
    liveRecommendationPresentation,
    forecast,
    forecastSource,
    observedTime,
    location,
    context,
    actions,
    isStale,
  };
}
