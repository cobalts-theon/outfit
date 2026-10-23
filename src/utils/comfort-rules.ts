/**
 * Quy tắc nhiệt độ, độ ẩm và trang phục; mỗi quy tắc chỉ tạo gợi ý khi đủ bằng chứng.
 */
import type { RecommendationRule } from '@/utils/recommendation-rules';

export const HIGH_HEAT_CELSIUS = 35;

export const VERY_HIGH_HEAT_CELSIUS = 40;

export const COOL_CELSIUS = 20;

export const COLD_CELSIUS = 12;

// Gợi ý tránh nóng khi nhiệt độ cao.
export const heatRule: RecommendationRule = ({ current }) => {
  const heat = Math.max(current.temperature.valueCelsius, current.temperature.feelsLikeCelsius);
  if (heat < HIGH_HEAT_CELSIUS) return [];

  return [
    {
      ruleId: 'high-temperature-wellness',
      actionKey: 'sun-heat-protection',
      group: 'wellness',
      severity: heat >= VERY_HIGH_HEAT_CELSIUS ? 'warning' : 'attention',
      priority: 65,
      title: heat >= VERY_HIGH_HEAT_CELSIUS ? 'Cảm giác nóng rất cao' : 'Điều kiện nóng',
      message: 'Giữ cơ thể mát và điều chỉnh cường độ hoạt động.',
      reasonParts: [`Nhiệt độ là ${Math.round(current.temperature.valueCelsius)}°C, cảm nhận ${Math.round(current.temperature.feelsLikeCelsius)}°C.`],
      action: 'Uống nước đều, nghỉ ở nơi mát và tránh vận động gắng sức kéo dài.',
      triggers: [{ dimension: 'temperature', label: 'nhiệt độ cao nhất giữa đo và cảm nhận', value: heat, unit: '°C' }],
    },
  ];
};

// Everyday comfort guidance also covers warmth below the severe heat threshold.
// Gợi ý uống nước khi thời tiết ấm nóng.
export const everydayHydrationRule: RecommendationRule = ({ current }) => {
  const heat = Math.max(current.temperature.valueCelsius, current.temperature.feelsLikeCelsius);
  if (!Number.isFinite(heat) || heat < 28 || heat >= HIGH_HEAT_CELSIUS) return [];
  return [
    {
      ruleId: 'everyday-warm-hydration',
      actionKey: 'heat-hydration',
      group: 'wellness',
      severity: 'info',
      priority: 25,
      title: 'Chuẩn bị nước khi thấy nóng',
      message: 'Để nước uống dễ lấy, uống khi khát hoặc sau khi vận động.',
      reasonParts: [`Ngoài trời ${Math.round(current.temperature.valueCelsius)}°C, cảm nhận ${Math.round(current.temperature.feelsLikeCelsius)}°C.`],
      action: 'Để nước uống gần chỗ ngồi; uống khi khát, nhất là sau khi di chuyển.',
      triggers: [{ dimension: 'temperature', label: 'nhiệt độ cảm nhận và đo', value: heat, unit: '°C' }],
    },
  ];
};

// Gợi ý điều chỉnh chỗ nghỉ theo thời tiết.
export const indoorComfortRule: RecommendationRule = ({ current }) => {
  const low = Math.min(current.temperature.valueCelsius, current.temperature.feelsLikeCelsius);
  const high = Math.max(current.temperature.valueCelsius, current.temperature.feelsLikeCelsius);
  if (!Number.isFinite(low) || !Number.isFinite(high) || (high < 28 && low > 20)) return [];
  const warm = high >= 28;
  return [
    {
      ruleId: 'indoor-temperature-comfort',
      actionKey: 'indoor-comfort',
      group: 'wellness',
      severity: 'info',
      priority: 20,
      title: warm ? 'Nếu trong nhà bí nóng, chọn chỗ nghỉ mát' : 'Nếu chỗ ngồi lạnh, tránh gió lùa',
      message: warm
        ? 'Điều chỉnh quạt hoặc điều hòa nếu bạn thấy nóng.'
        : 'Chọn chỗ ngồi kín gió, thêm lớp giữ ấm khi cần.',
      reasonParts: [
        `Ngoài trời ${Math.round(current.temperature.valueCelsius)}°C, cảm nhận ${Math.round(current.temperature.feelsLikeCelsius)}°C; app không đo nhiệt độ trong phòng.`,
      ],
      action: warm
        ? 'Nếu phòng cũng bí nóng, dùng quạt hoặc điều chỉnh điều hòa để dễ chịu hơn.'
        : 'Nếu phòng lạnh, tránh gió lùa và chuẩn bị một lớp giữ ấm dễ lấy.',
      triggers: [{ dimension: 'temperature', label: 'nhiệt độ ngoài trời', value: warm ? high : low, unit: '°C' }],
    },
  ];
};

// Gợi ý khi độ ẩm ngoài trời quá cao/thấp.
export const humidityComfortRule: RecommendationRule = ({ current }) => {
  const humidity = current.humidityPercent;
  if (
    !Number.isFinite(humidity) ||
    humidity < 0 ||
    humidity > 100 ||
    (humidity > 35 && humidity < 80)
  )
    return [];
  const damp = humidity >= 80;
  return [
    {
      ruleId: damp ? 'humid-weather-comfort' : 'dry-weather-comfort',
      actionKey: damp ? 'damp-care' : 'dry-air-care',
      group: 'wellness',
      severity: 'info',
      priority: 15,
      title: damp
        ? 'Tách đồ ướt khỏi chỗ ngồi, chỗ nghỉ'
        : 'Tránh luồng gió khô thổi thẳng vào người',
      message: damp
        ? 'Nếu trong nhà cũng ẩm, giữ chỗ nghỉ và đồ dùng khô ráo.'
        : 'Nếu thấy khô khó chịu, đổi vị trí ngồi và điều chỉnh quạt/điều hòa.',
      reasonParts: [`Độ ẩm ngoài trời ${Math.round(humidity)}%; độ ẩm trong phòng có thể khác.`],
      action: damp
        ? 'Để ô, áo mưa hoặc đồ ướt tách khỏi chỗ nghỉ; lau chỗ ẩm khi thuận tiện.'
        : 'Nếu thấy khô, tránh ngồi sát luồng gió quạt/điều hòa và để nước uống dễ lấy.',
      triggers: [{ dimension: 'humidity', label: 'độ ẩm ngoài trời', value: humidity, unit: '%' }],
    },
  ];
};

// Gợi ý đồ thoáng theo nhiệt độ hiện có.
export const lightClothingRule: RecommendationRule = ({ current }) => {
  const temperature = current.temperature.valueCelsius;
  const feelsLike = current.temperature.feelsLikeCelsius;
  if (!Number.isFinite(temperature) || !Number.isFinite(feelsLike)) return [];
  const warm = temperature >= 30 || feelsLike >= 33;
  // Fill the everyday-temperature gap without inventing a safe outdoor window.
  if (!warm && Math.min(temperature, feelsLike) <= COOL_CELSIUS) return [];

  return [
    {
      ruleId: warm ? 'warm-weather-clothing' : 'everyday-weather-clothing',
      actionKey: 'light-clothing',
      group: 'clothing',
      severity: 'info',
      priority: warm ? 30 : 5,
      title: warm ? 'Ưu tiên trang phục nhẹ' : 'Chọn trang phục dễ điều chỉnh',
      message: warm
        ? 'Trang phục thoáng giúp phù hợp hơn với điều kiện nóng hiện tại.'
        : 'Chọn trang phục theo nhiệt độ cảm nhận tại nơi bạn đang xem.',
      reasonParts: [`Nhiệt độ là ${Math.round(current.temperature.valueCelsius)}°C, cảm nhận ${Math.round(current.temperature.feelsLikeCelsius)}°C.`],
      action: warm
        ? 'Chọn quần áo nhẹ, thoáng và dễ điều chỉnh khi di chuyển.'
        : 'Ưu tiên đồ thoáng, dễ thêm hoặc bớt lớp khi di chuyển giữa trong nhà và ngoài trời.',
      triggers: [
        {
          dimension: 'temperature',
          label: warm ? 'điều kiện nóng cho trang phục' : 'nhiệt độ hiện tại cho trang phục',
          value: current.temperature.valueCelsius,
          unit: '°C',
        },
      ],
    },
  ];
};

// Gợi ý giữ ấm khi trời mát hoặc lạnh.
export const warmClothingRule: RecommendationRule = ({ current }) => {
  const cool = Math.min(current.temperature.valueCelsius, current.temperature.feelsLikeCelsius);
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
      reasonParts: [`Nhiệt độ là ${Math.round(current.temperature.valueCelsius)}°C, cảm nhận ${Math.round(current.temperature.feelsLikeCelsius)}°C.`],
      action:
        cool <= COLD_CELSIUS
          ? 'Mặc nhiều lớp, ưu tiên lớp giữ ấm và che chắn khi ở ngoài lâu.'
          : 'Mang áo khoác mỏng hoặc một lớp áo dễ cởi khi nhiệt độ thay đổi.',
      triggers: [{ dimension: 'temperature', label: 'nhiệt độ thấp nhất giữa đo và cảm nhận', value: cool, unit: '°C' }],
    },
  ];
};

