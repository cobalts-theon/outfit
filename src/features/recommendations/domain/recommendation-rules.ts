import type { HourlyForecast } from '@/features/forecast/domain/hourly-forecast';
import type {
  CurrentWeather,
  WeatherAlertSeverity,
} from '@/features/weather/domain/current-weather';
import type { WeatherCondition } from '@/features/weather/domain/weather-condition';
import type {
  RecommendationGroup,
  RecommendationSeverity,
  RecommendationTrigger,
} from '@/features/recommendations/domain/recommendation';

export const HIGH_PRECIPITATION_PROBABILITY = 0.6;
export const HIGH_HEAT_CELSIUS = 35;
export const VERY_HIGH_HEAT_CELSIUS = 40;
export const COOL_CELSIUS = 20;
export const COLD_CELSIUS = 12;

export interface RecommendationCandidate {
  readonly ruleId: string;
  readonly actionKey: string;
  readonly group: RecommendationGroup;
  readonly severity: RecommendationSeverity;
  readonly priority: number;
  readonly title: string;
  readonly message: string;
  readonly reasonParts: readonly string[];
  readonly action: string;
  readonly triggers: readonly RecommendationTrigger[];
}

interface RuleContext {
  readonly current: CurrentWeather;
  readonly hourly?: HourlyForecast;
}

type RecommendationRule = (context: RuleContext) => readonly RecommendationCandidate[];

const alertSeverity: Record<WeatherAlertSeverity, RecommendationSeverity> = {
  info: 'info',
  watch: 'attention',
  warning: 'warning',
  severe: 'danger',
  extreme: 'danger',
};

const severityRank: Record<RecommendationSeverity, number> = {
  info: 1,
  attention: 2,
  warning: 3,
  danger: 4,
};

const dangerousConditions = new Map<
  WeatherCondition,
  { readonly label: string; readonly severity: RecommendationSeverity }
>([
  ['thunderstorm', { label: 'dông', severity: 'warning' }],
  ['thunderstorm_rain', { label: 'dông kèm mưa', severity: 'warning' }],
  ['severe_thunderstorm', { label: 'dông mạnh', severity: 'danger' }],
  ['hail', { label: 'mưa đá', severity: 'warning' }],
  ['freezing_rain', { label: 'mưa đóng băng', severity: 'warning' }],
  ['blizzard', { label: 'bão tuyết', severity: 'danger' }],
  ['sandstorm', { label: 'bão cát', severity: 'danger' }],
  ['tropical_storm', { label: 'bão nhiệt đới', severity: 'danger' }],
  ['hurricane', { label: 'bão mạnh', severity: 'danger' }],
  ['tornado', { label: 'lốc xoáy', severity: 'danger' }],
]);

const rainConditions = new Set<WeatherCondition>([
  'drizzle',
  'light_rain',
  'rain',
  'heavy_rain',
  'showers',
  'heavy_showers',
  'thunderstorm_rain',
]);

function chooseHighestAlert(current: CurrentWeather) {
  return current.alerts?.reduce<(typeof current.alerts)[number] | undefined>(
    (highest, alert) => {
      if (highest === undefined) return alert;
      return severityRank[alertSeverity[alert.severity]] >
        severityRank[alertSeverity[highest.severity]]
        ? alert
        : highest;
    },
    undefined,
  );
}

const officialAlertRule: RecommendationRule = ({ current }) => {
  const alert = chooseHighestAlert(current);
  if (alert === undefined) return [];

  const severity = alertSeverity[alert.severity];
  const reason =
    alert.description ??
    `Cảnh báo ${alert.type} đang hoạt động ở mức ${alert.severity}.`;

  return [
    {
      ruleId: 'official-weather-alert',
      actionKey: 'weather-shelter',
      group: 'weather_alert',
      severity,
      priority: 100,
      title: alert.title,
      message: 'Ưu tiên thông tin cảnh báo đang hoạt động trước các điều kiện khác.',
      reasonParts: [reason],
      action:
        severity === 'danger'
          ? 'Ưu tiên ở nơi an toàn và làm theo hướng dẫn của cơ quan chức năng.'
          : 'Theo dõi nguồn cảnh báo chính thức và điều chỉnh lịch trình nếu cần.',
      triggers: [
        {
          dimension: 'alert',
          label: alert.source === undefined ? alert.type : `${alert.type} · ${alert.source}`,
          value: alert.severity,
        },
      ],
    },
  ];
};

const hazardousConditionRule: RecommendationRule = ({ current }) => {
  const condition = dangerousConditions.get(current.condition);
  if (condition === undefined) return [];

  return [
    {
      ruleId: 'hazardous-weather-condition',
      actionKey: 'weather-shelter',
      group: 'weather_alert',
      severity: condition.severity,
      priority: 95,
      title: 'Điều kiện thời tiết nguy hiểm',
      message: 'Tạm hoãn hoạt động ngoài trời cho đến khi điều kiện ổn định hơn.',
      reasonParts: [`Điều kiện hiện tại được chuẩn hóa là ${condition.label}.`],
      action: 'Vào nơi trú chắc chắn, tránh khu vực trống trải và kiểm tra cảnh báo chính thức.',
      triggers: [
        { dimension: 'condition', label: condition.label, value: current.condition },
      ],
    },
  ];
};

const uvRule: RecommendationRule = ({ current }) => {
  const uv = current.uv;
  if (uv?.category === undefined || !current.daylight.isDay) return [];
  if (uv.category === 'low' || uv.category === 'moderate') return [];

  const presentation = {
    high: { severity: 'attention', title: 'UV cao' },
    very_high: { severity: 'warning', title: 'UV rất cao' },
    extreme: { severity: 'danger', title: 'UV cực đại' },
  } as const satisfies Record<
    'high' | 'very_high' | 'extreme',
    { readonly severity: RecommendationSeverity; readonly title: string }
  >;
  const state = presentation[uv.category];

  return [
    {
      ruleId: 'high-uv-protection',
      actionKey: 'sun-protection',
      group: 'wellness',
      severity: state.severity,
      priority: 85,
      title: state.title,
      message: 'Cần chủ động chống nắng khi ở ngoài trời.',
      reasonParts: [`UV hiện tại là ${uv.index.toFixed(1)} (${state.title.toLocaleLowerCase('vi-VN')}).`],
      action:
        uv.category === 'high'
          ? 'Tìm bóng râm, che phủ da và dùng biện pháp chống nắng phù hợp.'
          : 'Rút ngắn thời gian nắng trực tiếp, tìm bóng râm và che phủ da.',
      triggers: [{ dimension: 'uv', label: uv.category, value: uv.index, unit: 'UVI' }],
    },
  ];
};

const usAqiRule: RecommendationRule = ({ current }) => {
  const airQuality = current.airQuality;
  if (
    airQuality?.scale !== 'us_aqi' ||
    airQuality.category === undefined ||
    airQuality.category === 'unknown' ||
    airQuality.category === 'good' ||
    airQuality.category === 'moderate'
  ) {
    return [];
  }

  const presentation = {
    unhealthy_for_sensitive_groups: {
      severity: 'attention',
      title: 'Không khí kém cho nhóm nhạy cảm',
      action: 'Nếu bạn thuộc nhóm nhạy cảm, giảm thời gian hoặc cường độ vận động ngoài trời.',
    },
    unhealthy: {
      severity: 'warning',
      title: 'Không khí không lành mạnh',
      action: 'Giảm vận động kéo dài hoặc gắng sức ngoài trời; chọn hoạt động nhẹ hơn.',
    },
    very_unhealthy: {
      severity: 'danger',
      title: 'Không khí rất không lành mạnh',
      action: 'Hạn chế thời gian ngoài trời và tránh vận động gắng sức nếu không cần thiết.',
    },
    hazardous: {
      severity: 'danger',
      title: 'Không khí nguy hại',
      action: 'Tránh hoạt động ngoài trời không thiết yếu và theo dõi thông tin chất lượng không khí.',
    },
  } as const;
  const state = presentation[airQuality.category];

  return [
    {
      ruleId: 'poor-us-aqi-activity',
      actionKey: 'air-quality-exposure',
      group: 'outdoor',
      severity: state.severity,
      priority: 90,
      title: state.title,
      message: 'Điều chỉnh thời lượng và cường độ hoạt động ngoài trời.',
      reasonParts: [`US AQI hiện tại là ${Math.round(airQuality.index)}.`],
      action: state.action,
      triggers: [
        {
          dimension: 'us_aqi',
          label: airQuality.category,
          value: airQuality.index,
          unit: 'US AQI',
        },
      ],
    },
  ];
};

function currentRainRule({ current }: RuleContext): readonly RecommendationCandidate[] {
  const precipitation = current.precipitation;
  const activeRain =
    rainConditions.has(current.condition) ||
    precipitation?.type === 'rain' ||
    precipitation?.type === 'drizzle';
  const highProbability =
    precipitation?.probability !== undefined &&
    precipitation.probability >= HIGH_PRECIPITATION_PROBABILITY;
  if (!activeRain && !highProbability) return [];

  const heavyRain =
    current.condition === 'heavy_rain' ||
    current.condition === 'heavy_showers' ||
    precipitation?.intensity === 'heavy' ||
    precipitation?.intensity === 'extreme';
  const probability = precipitation?.probability;
  const reason = activeRain
    ? `Đang có ${precipitation?.type === 'drizzle' || current.condition === 'drizzle' ? 'mưa phùn' : 'mưa'}${
        probability === undefined ? '' : ` với xác suất ${Math.round(probability * 100)}%`
      }.`
    : `Xác suất mưa hiện tại là ${Math.round((probability ?? 0) * 100)}%.`;

  return [
    {
      ruleId: 'current-rain-protection',
      actionKey: 'rain-protection',
      group: 'clothing',
      severity: heavyRain ? 'warning' : 'attention',
      priority: 75,
      title: heavyRain ? 'Mưa lớn đang diễn ra' : 'Chuẩn bị chống mưa',
      message: 'Cần lớp chống mưa phù hợp cho lần di chuyển sắp tới.',
      reasonParts: [reason],
      action: 'Mang ô hoặc áo mưa gọn và ưu tiên giày có độ bám tốt.',
      triggers: [
        {
          dimension: 'precipitation',
          label: activeRain ? 'mưa hiện tại' : 'xác suất mưa cao',
          ...(probability === undefined ? {} : { value: probability, unit: 'ratio' }),
        },
      ],
    },
  ];
}

function nearTermRainRule({ hourly }: RuleContext): readonly RecommendationCandidate[] {
  if (hourly === undefined) return [];
  const probabilities = hourly.entries
    .slice(0, 3)
    .map((entry) => entry.precipitation?.probability)
    .filter((value): value is number => value !== undefined);
  const maximum = probabilities.length === 0 ? undefined : Math.max(...probabilities);
  if (maximum === undefined || maximum < HIGH_PRECIPITATION_PROBABILITY) return [];

  return [
    {
      ruleId: 'near-term-rain-protection',
      actionKey: 'rain-protection',
      group: 'clothing',
      severity: 'attention',
      priority: 70,
      title: 'Mưa có khả năng cao trong vài giờ tới',
      message: 'Chuẩn bị lớp chống mưa trước khi rời đi.',
      reasonParts: [`Xác suất mưa cao nhất trong ba giờ đầu là ${Math.round(maximum * 100)}%.`],
      action: 'Mang ô hoặc áo mưa gọn và kiểm tra lại diễn biến trước khi đi xa.',
      triggers: [
        {
          dimension: 'precipitation',
          label: 'xác suất mưa vài giờ tới',
          value: maximum,
          unit: 'ratio',
        },
      ],
    },
  ];
}

const heatRule: RecommendationRule = ({ current }) => {
  const heat = Math.max(
    current.temperature.valueCelsius,
    current.temperature.feelsLikeCelsius,
  );
  if (heat < HIGH_HEAT_CELSIUS) return [];

  return [
    {
      ruleId: 'high-temperature-wellness',
      actionKey: 'heat-hydration',
      group: 'wellness',
      severity: heat >= VERY_HIGH_HEAT_CELSIUS ? 'warning' : 'attention',
      priority: 65,
      title: heat >= VERY_HIGH_HEAT_CELSIUS ? 'Cảm giác nóng rất cao' : 'Điều kiện nóng',
      message: 'Giữ cơ thể mát và điều chỉnh cường độ hoạt động.',
      reasonParts: [
        `Nhiệt độ là ${Math.round(current.temperature.valueCelsius)}°C, cảm nhận ${Math.round(
          current.temperature.feelsLikeCelsius,
        )}°C.`,
      ],
      action: 'Uống nước đều, nghỉ ở nơi mát và tránh vận động gắng sức kéo dài.',
      triggers: [
        {
          dimension: 'temperature',
          label: 'nhiệt độ cao nhất giữa đo và cảm nhận',
          value: heat,
          unit: '°C',
        },
      ],
    },
  ];
};

const lightClothingRule: RecommendationRule = ({ current }) => {
  if (
    current.temperature.valueCelsius < 30 &&
    current.temperature.feelsLikeCelsius < 33
  ) {
    return [];
  }

  return [
    {
      ruleId: 'warm-weather-clothing',
      actionKey: 'light-clothing',
      group: 'clothing',
      severity: 'info',
      priority: 30,
      title: 'Ưu tiên trang phục nhẹ',
      message: 'Trang phục thoáng giúp phù hợp hơn với điều kiện nóng hiện tại.',
      reasonParts: [
        `Nhiệt độ là ${Math.round(current.temperature.valueCelsius)}°C, cảm nhận ${Math.round(
          current.temperature.feelsLikeCelsius,
        )}°C.`,
      ],
      action: 'Chọn quần áo nhẹ, thoáng và dễ điều chỉnh khi di chuyển.',
      triggers: [
        {
          dimension: 'temperature',
          label: 'điều kiện nóng cho trang phục',
          value: current.temperature.valueCelsius,
          unit: '°C',
        },
      ],
    },
  ];
};

const warmClothingRule: RecommendationRule = ({ current }) => {
  const cool = Math.min(
    current.temperature.valueCelsius,
    current.temperature.feelsLikeCelsius,
  );
  if (cool > COOL_CELSIUS) return [];

  return [
    {
      ruleId: 'cool-weather-clothing',
      actionKey: 'warm-clothing',
      group: 'clothing',
      severity: cool <= COLD_CELSIUS ? 'warning' : cool <= 16 ? 'attention' : 'info',
      priority: 55,
      title: cool <= COLD_CELSIUS ? 'Điều kiện lạnh' : 'Trời mát',
      message: 'Cần thêm lớp giữ ấm phù hợp với nhiệt độ hiện tại.',
      reasonParts: [
        `Nhiệt độ là ${Math.round(current.temperature.valueCelsius)}°C, cảm nhận ${Math.round(
          current.temperature.feelsLikeCelsius,
        )}°C.`,
      ],
      action:
        cool <= COLD_CELSIUS
          ? 'Mặc nhiều lớp, ưu tiên lớp giữ ấm và che chắn khi ở ngoài lâu.'
          : 'Mang áo khoác mỏng hoặc một lớp áo dễ cởi khi nhiệt độ thay đổi.',
      triggers: [
        {
          dimension: 'temperature',
          label: 'nhiệt độ thấp nhất giữa đo và cảm nhận',
          value: cool,
          unit: '°C',
        },
      ],
    },
  ];
};

const initialRules: readonly RecommendationRule[] = [
  officialAlertRule,
  hazardousConditionRule,
  usAqiRule,
  uvRule,
  currentRainRule,
  nearTermRainRule,
  heatRule,
  warmClothingRule,
  lightClothingRule,
];

export function evaluateInitialRecommendationRules(
  current: CurrentWeather,
  hourly?: HourlyForecast,
): readonly RecommendationCandidate[] {
  const context: RuleContext = { current, ...(hourly === undefined ? {} : { hourly }) };
  return initialRules.flatMap((rule) => rule(context));
}

