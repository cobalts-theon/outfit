import type { CurrentWeather, Precipitation, WeatherLocation } from '@/types/weather';
import type { HomeRiskPreview, HomeForecastPreview, HomeRecommendationPreview } from '@/hooks/home';

// current-weather-fixtures

const dryConditions = {
  type: 'none',
  probability: 0,
  amountMillimeters: 0,
  intensity: 'none',
} as const satisfies Precipitation;

const hoChiMinhCity = {
  name: 'Thành phố Hồ Chí Minh',
  countryCode: 'VN',
  timeZone: 'Asia/Ho_Chi_Minh',
  coordinates: { latitude: 10.7769, longitude: 106.7009 },
} as const satisfies WeatherLocation;

export const clearDayWeather = {
  observedAt: '2026-08-06T13:30:00+07:00',
  location: hoChiMinhCity,
  condition: 'clear',
  daylight: { phase: 'day', isDay: true },
  temperature: {
    valueCelsius: 33,
    feelsLikeCelsius: 39,
    minCelsius: 27,
    maxCelsius: 34,
    dewPointCelsius: 24,
  },
  humidityPercent: 59,
  pressureHectopascals: 1006,
  visibilityMeters: 10000,
  cloudCoverPercent: 8,
  wind: {
    speedMetersPerSecond: 3.8,
    gustMetersPerSecond: 6.1,
    directionDegrees: 210,
    direction: 'SW',
  },
  precipitation: dryConditions,
  uv: { index: 8.6, category: 'very_high', maxToday: 9.2 },
  airQuality: {
    index: 42,
    scale: 'fixture_reference',
    category: 'good',
    pollutants: { pm25MicrogramsPerCubicMeter: 11.4, pm10MicrogramsPerCubicMeter: 24.1 },
  },
  sun: { sunrise: '2026-08-06T05:42:00+07:00', sunset: '2026-08-06T18:16:00+07:00' },
  moon: {
    phase: 'last_quarter',
    illumination: 0.48,
    moonrise: '2026-08-06T23:37:00+07:00',
    moonset: '2026-08-06T11:54:00+07:00',
  },
  alerts: [],
} as const satisfies CurrentWeather;

export const clearNightWeather = {
  observedAt: '2026-08-06T22:15:00+07:00',
  location: {
    name: 'Hội An',
    region: 'Quảng Nam',
    countryCode: 'VN',
    timeZone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 15.8801, longitude: 108.338 },
  },
  condition: 'clear',
  daylight: { phase: 'night', isDay: false },
  temperature: { valueCelsius: 27, feelsLikeCelsius: 30, dewPointCelsius: 23 },
  humidityPercent: 78,
  pressureHectopascals: 1008,
  visibilityMeters: 10000,
  cloudCoverPercent: 4,
  wind: { speedMetersPerSecond: 2.1, directionDegrees: 170, direction: 'S' },
  precipitation: dryConditions,
  uv: { index: 0, category: 'low', maxToday: 8.1 },
  sun: { sunrise: '2026-08-06T05:29:00+07:00', sunset: '2026-08-06T18:18:00+07:00' },
  moon: { phase: 'last_quarter', illumination: 0.47 },
  alerts: [],
} as const satisfies CurrentWeather;

export const partlyCloudyWeather = {
  observedAt: '2026-08-06T16:20:00+07:00',
  location: {
    name: 'Đà Nẵng',
    countryCode: 'VN',
    timeZone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 16.0544, longitude: 108.2022 },
  },
  condition: 'partly_cloudy',
  daylight: { phase: 'day', isDay: true },
  temperature: { valueCelsius: 31, feelsLikeCelsius: 35, dewPointCelsius: 23 },
  humidityPercent: 64,
  pressureHectopascals: 1005,
  visibilityMeters: 12000,
  cloudCoverPercent: 43,
  wind: {
    speedMetersPerSecond: 4.4,
    gustMetersPerSecond: 6.8,
    directionDegrees: 90,
    direction: 'E',
  },
  precipitation: { type: 'none', probability: 0.12, amountMillimeters: 0, intensity: 'none' },
  uv: { index: 3.1, category: 'moderate', maxToday: 8.7 },
  alerts: [],
} as const satisfies CurrentWeather;

export const rainyNightWeather = {
  observedAt: '2026-08-06T21:40:00+07:00',
  location: {
    name: 'Huế',
    region: 'Thừa Thiên Huế',
    countryCode: 'VN',
    timeZone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 16.4637, longitude: 107.5909 },
  },
  condition: 'rain',
  daylight: { phase: 'night', isDay: false },
  temperature: { valueCelsius: 25, feelsLikeCelsius: 28, dewPointCelsius: 24 },
  humidityPercent: 91,
  pressureHectopascals: 1004,
  visibilityMeters: 6200,
  cloudCoverPercent: 94,
  wind: {
    speedMetersPerSecond: 4.9,
    gustMetersPerSecond: 8.4,
    directionDegrees: 60,
    direction: 'NE',
  },
  precipitation: { type: 'rain', probability: 0.88, amountMillimeters: 4.6, intensity: 'moderate' },
  uv: { index: 0, category: 'low', maxToday: 7.4 },
  moon: { phase: 'waning_crescent', illumination: 0.31 },
  alerts: [],
} as const satisfies CurrentWeather;

export const heavyRainWeather = {
  observedAt: '2026-08-06T15:05:00+07:00',
  location: {
    name: 'Cần Thơ',
    countryCode: 'VN',
    timeZone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 10.0452, longitude: 105.7469 },
  },
  condition: 'heavy_rain',
  daylight: { phase: 'day', isDay: true },
  temperature: { valueCelsius: 26, feelsLikeCelsius: 30, dewPointCelsius: 25 },
  humidityPercent: 95,
  pressureHectopascals: 1001,
  visibilityMeters: 2500,
  cloudCoverPercent: 100,
  wind: {
    speedMetersPerSecond: 7.2,
    gustMetersPerSecond: 12.8,
    directionDegrees: 240,
    direction: 'SW',
  },
  precipitation: { type: 'rain', probability: 1, amountMillimeters: 28.5, intensity: 'heavy' },
  uv: { index: 1.2, category: 'low', maxToday: 7.8 },
  alerts: [
    {
      id: 'fixture-can-tho-heavy-rain',
      type: 'heavy_rain',
      severity: 'warning',
      title: 'Mưa lớn cục bộ',
      description: 'Mưa lớn có thể gây ngập tại khu vực trũng thấp.',
      startsAt: '2026-08-06T14:30:00+07:00',
      endsAt: '2026-08-06T17:30:00+07:00',
      source: 'Fixture Weather Centre',
    },
  ],
} as const satisfies CurrentWeather;

export const thunderstormWeather = {
  observedAt: '2026-08-06T17:45:00+07:00',
  location: {
    name: 'Hà Nội',
    countryCode: 'VN',
    timeZone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 21.0278, longitude: 105.8342 },
  },
  condition: 'thunderstorm',
  daylight: { phase: 'sunset', isDay: false },
  temperature: { valueCelsius: 29, feelsLikeCelsius: 34, dewPointCelsius: 24 },
  humidityPercent: 76,
  pressureHectopascals: 998,
  visibilityMeters: 4800,
  cloudCoverPercent: 100,
  wind: {
    speedMetersPerSecond: 9.1,
    gustMetersPerSecond: 18.6,
    directionDegrees: 320,
    direction: 'NW',
  },
  precipitation: { type: 'rain', probability: 0.96, amountMillimeters: 12.2, intensity: 'heavy' },
  uv: { index: 0.4, category: 'low', maxToday: 8 },
  alerts: [
    {
      id: 'fixture-hanoi-thunderstorm',
      type: 'thunderstorm',
      severity: 'warning',
      title: 'Dông kèm gió giật',
      startsAt: '2026-08-06T17:15:00+07:00',
      endsAt: '2026-08-06T20:00:00+07:00',
      source: 'Fixture Weather Centre',
    },
  ],
} as const satisfies CurrentWeather;

export const fogHazeWeather = {
  observedAt: '2026-08-06T06:10:00+07:00',
  location: {
    name: 'Sa Pa',
    region: 'Lào Cai',
    countryCode: 'VN',
    timeZone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 22.3364, longitude: 103.8438 },
  },
  condition: 'fog',
  daylight: { phase: 'dawn', isDay: true },
  temperature: { valueCelsius: 17, feelsLikeCelsius: 17, dewPointCelsius: 16 },
  humidityPercent: 98,
  pressureHectopascals: 891,
  visibilityMeters: 650,
  cloudCoverPercent: 96,
  wind: { speedMetersPerSecond: 0.8, directionDegrees: 40, direction: 'NE' },
  precipitation: { type: 'drizzle', probability: 0.35, amountMillimeters: 0.2, intensity: 'light' },
  sun: { sunrise: '2026-08-06T05:35:00+07:00', sunset: '2026-08-06T18:42:00+07:00' },
  alerts: [],
} as const satisfies CurrentWeather;

export const highUvWeather = {
  observedAt: '2026-08-06T11:50:00+07:00',
  location: {
    name: 'Nha Trang',
    region: 'Khánh Hòa',
    countryCode: 'VN',
    timeZone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 12.2388, longitude: 109.1967 },
  },
  condition: 'mostly_clear',
  daylight: { phase: 'day', isDay: true },
  temperature: { valueCelsius: 32, feelsLikeCelsius: 37, dewPointCelsius: 24 },
  humidityPercent: 61,
  pressureHectopascals: 1007,
  visibilityMeters: 14000,
  cloudCoverPercent: 18,
  wind: { speedMetersPerSecond: 4.6, directionDegrees: 100, direction: 'E' },
  precipitation: dryConditions,
  uv: { index: 11.2, category: 'extreme', maxToday: 11.6 },
  airQuality: { index: 47, scale: 'fixture_reference', category: 'good' },
  alerts: [],
} as const satisfies CurrentWeather;

export const unhealthyAirQualityWeather = {
  observedAt: '2026-08-06T08:25:00+07:00',
  location: {
    name: 'Hà Nội',
    countryCode: 'VN',
    timeZone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 21.0278, longitude: 105.8342 },
  },
  condition: 'haze',
  daylight: { phase: 'day', isDay: true },
  temperature: { valueCelsius: 30, feelsLikeCelsius: 35, dewPointCelsius: 24 },
  humidityPercent: 70,
  pressureHectopascals: 1003,
  visibilityMeters: 3200,
  cloudCoverPercent: 58,
  wind: { speedMetersPerSecond: 1.1, directionDegrees: 130, direction: 'SE' },
  precipitation: dryConditions,
  uv: { index: 2.8, category: 'moderate', maxToday: 7.5 },
  airQuality: {
    index: 172,
    scale: 'fixture_reference',
    category: 'unhealthy',
    pollutants: {
      pm25MicrogramsPerCubicMeter: 78.4,
      pm10MicrogramsPerCubicMeter: 124.8,
      no2MicrogramsPerCubicMeter: 46.3,
    },
  },
  alerts: [],
} as const satisfies CurrentWeather;

export const severeAlertWeather = {
  observedAt: '2026-08-06T19:10:00+07:00',
  location: {
    name: 'Hạ Long',
    region: 'Quảng Ninh',
    countryCode: 'VN',
    timeZone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 20.9517, longitude: 107.0748 },
  },
  condition: 'tropical_storm',
  daylight: { phase: 'night', isDay: false },
  temperature: { valueCelsius: 26, feelsLikeCelsius: 30, dewPointCelsius: 25 },
  humidityPercent: 93,
  pressureHectopascals: 984,
  visibilityMeters: 1800,
  cloudCoverPercent: 100,
  wind: {
    speedMetersPerSecond: 22,
    gustMetersPerSecond: 31,
    directionDegrees: 70,
    direction: 'NE',
  },
  precipitation: { type: 'rain', probability: 1, amountMillimeters: 46, intensity: 'extreme' },
  moon: { phase: 'last_quarter', illumination: 0.45 },
  alerts: [
    {
      id: 'fixture-quang-ninh-tropical-storm',
      type: 'tropical_storm',
      severity: 'extreme',
      title: 'Cảnh báo bão và gió rất mạnh',
      description: 'Tránh ra ngoài và theo dõi hướng dẫn chính thức của cơ quan chức năng.',
      startsAt: '2026-08-06T18:00:00+07:00',
      endsAt: '2026-08-07T06:00:00+07:00',
      source: 'Fixture National Warning Centre',
    },
  ],
} as const satisfies CurrentWeather;

export const partialCurrentWeather = {
  observedAt: '2026-08-06T09:00:00+07:00',
  location: {
    name: 'Buôn Ma Thuột',
    region: 'Đắk Lắk',
    countryCode: 'VN',
    timeZone: 'Asia/Ho_Chi_Minh',
  },
  condition: 'unknown',
  daylight: { phase: 'day', isDay: true },
  temperature: { valueCelsius: 25, feelsLikeCelsius: 26 },
  humidityPercent: 74,
  wind: { speedMetersPerSecond: 2.4 },
} as const satisfies CurrentWeather;

export const CURRENT_WEATHER_FIXTURES = [
  clearDayWeather,
  clearNightWeather,
  partlyCloudyWeather,
  rainyNightWeather,
  heavyRainWeather,
  thunderstormWeather,
  fogHazeWeather,
  highUvWeather,
  unhealthyAirQualityWeather,
  severeAlertWeather,
  partialCurrentWeather,
] as const satisfies readonly CurrentWeather[];

// home-scenarios

export interface HomeScenario {
  readonly id:
    | 'partly-cloudy'
    | 'clear-night'
    | 'high-uv'
    | 'unhealthy-aqi'
    | 'rainy-night'
    | 'heavy-rain'
    | 'thunderstorm'
    | 'severe-alert'
    | 'partial-data';
  readonly selectorLabel: string;
  readonly weather: CurrentWeather;
  /** Visual fixture copy; live recommendations come from the rule engine. */
  readonly risk: HomeRiskPreview;
  /** Fixed near-term samples for visual review and the disclosed demo fallback. */
  readonly forecast: HomeForecastPreview;
  /** Layout copy only; no rule evaluation happens in these fixtures. */
  readonly recommendation: HomeRecommendationPreview;
}

const calmRisk = {
  tone: 'calm',
  levelLabel: 'ỔN ĐỊNH',
  title: 'Chưa có rủi ro nổi bật',
  reason: 'Dữ liệu mẫu hiện tại không có cảnh báo hoạt động hoặc chỉ số môi trường tăng cao.',
  immediateAction: 'Có thể tiếp tục kế hoạch ngoài trời và kiểm tra lại khi điều kiện đổi.',
} as const satisfies HomeRiskPreview;

export const HOME_SCENARIOS = [
  {
    id: 'partly-cloudy',
    selectorLabel: 'Bình thường',
    weather: partlyCloudyWeather,
    risk: calmRisk,
    forecast: {
      summary: 'Mây tăng nhẹ về chiều, chưa thấy mưa đáng kể trong chuỗi mẫu.',
      items: [
        {
          id: 'pc-16',
          timeLabel: 'BÂY GIỜ',
          condition: 'partly_cloudy',
          temperatureCelsius: 31,
          precipitationProbability: 0.12,
          isDay: true,
          isCurrent: true,
        },
        {
          id: 'pc-17',
          timeLabel: '17:00',
          condition: 'mostly_cloudy',
          temperatureCelsius: 30,
          precipitationProbability: 0.18,
          isDay: true,
        },
        {
          id: 'pc-18',
          timeLabel: '18:00',
          condition: 'cloudy',
          temperatureCelsius: 29,
          precipitationProbability: 0.22,
          isDay: false,
        },
        {
          id: 'pc-19',
          timeLabel: '19:00',
          condition: 'cloudy',
          temperatureCelsius: 28,
          precipitationProbability: 0.2,
          isDay: false,
        },
      ],
    },
    recommendation: {
      what: 'Trang phục thoáng, nhẹ; mang thêm áo khoác mỏng nếu ở ngoài đến tối.',
      why: 'Nhiệt độ cảm nhận cao hơn nhiệt độ đo và sẽ giảm dần sau hoàng hôn.',
      do: 'Uống nước đều và kiểm tra lại thời tiết trước khi di chuyển xa.',
    },
  },
  {
    id: 'clear-night',
    selectorLabel: 'Ban đêm',
    weather: clearNightWeather,
    risk: calmRisk,
    forecast: {
      summary: 'Trời quang ổn định; nhiệt độ giảm chậm trong vài giờ tới.',
      items: [
        {
          id: 'night-now',
          timeLabel: 'BÂY GIỜ',
          condition: 'clear',
          temperatureCelsius: 27,
          precipitationProbability: 0,
          isDay: false,
          isCurrent: true,
        },
        {
          id: 'night-23',
          timeLabel: '23:00',
          condition: 'clear',
          temperatureCelsius: 27,
          precipitationProbability: 0,
          isDay: false,
        },
        {
          id: 'night-00',
          timeLabel: '00:00',
          condition: 'mostly_clear',
          temperatureCelsius: 26,
          precipitationProbability: 0,
          isDay: false,
        },
        {
          id: 'night-01',
          timeLabel: '01:00',
          condition: 'mostly_clear',
          temperatureCelsius: 26,
          precipitationProbability: 0.02,
          isDay: false,
        },
      ],
    },
    recommendation: {
      what: 'Trang phục nhẹ, thoáng; chưa cần lớp chống mưa.',
      why: 'Trời quang, gió nhẹ và không có mưa trong dữ liệu hiện tại.',
      do: 'Ưu tiên tuyến đường đủ sáng nếu đi bộ hoặc vận động ngoài trời ban đêm.',
    },
  },
  {
    id: 'high-uv',
    selectorLabel: 'UV cao',
    weather: highUvWeather,
    risk: {
      tone: 'danger',
      levelLabel: 'UV CỰC ĐẠI',
      title: 'Hạn chế nắng trực tiếp lúc này',
      reason: 'Chỉ số UV mẫu là 11.2 và được dữ liệu chuẩn hóa phân loại ở mức cực đại.',
      immediateAction: 'Tìm bóng râm, che phủ da và rút ngắn thời gian ngoài trời.',
    },
    forecast: {
      summary: 'UV đang ở đỉnh mẫu; nhiệt độ giảm nhưng nắng vẫn mạnh đầu giờ chiều.',
      items: [
        {
          id: 'uv-now',
          timeLabel: 'BÂY GIỜ',
          condition: 'mostly_clear',
          temperatureCelsius: 32,
          precipitationProbability: 0,
          isDay: true,
          isCurrent: true,
        },
        {
          id: 'uv-13',
          timeLabel: '13:00',
          condition: 'mostly_clear',
          temperatureCelsius: 33,
          precipitationProbability: 0.02,
          isDay: true,
        },
        {
          id: 'uv-14',
          timeLabel: '14:00',
          condition: 'partly_cloudy',
          temperatureCelsius: 32,
          precipitationProbability: 0.06,
          isDay: true,
        },
        {
          id: 'uv-15',
          timeLabel: '15:00',
          condition: 'partly_cloudy',
          temperatureCelsius: 31,
          precipitationProbability: 0.1,
          isDay: true,
        },
      ],
    },
    recommendation: {
      what: 'Áo dài tay nhẹ, mũ có vành và kính chống nắng phù hợp.',
      why: 'UV được phân loại cực đại dù bầu trời chỉ có ít mây.',
      do: 'Nếu có thể, lùi hoạt động ngoài trời sang thời điểm UV giảm.',
    },
  },
  {
    id: 'unhealthy-aqi',
    selectorLabel: 'AQI xấu',
    weather: unhealthyAirQualityWeather,
    risk: {
      tone: 'danger',
      levelLabel: 'AQI KHÔNG LÀNH MẠNH',
      title: 'Giảm thời gian tiếp xúc ngoài trời',
      reason: 'AQI mẫu là 172, phân loại không lành mạnh; nồng độ PM2.5 cũng đang được cung cấp.',
      immediateAction: 'Giảm vận động gắng sức ngoài trời và ưu tiên không gian ít khói bụi.',
    },
    forecast: {
      summary: 'Không khí mờ đục và gió yếu; điều kiện khuếch tán chưa cải thiện trong chuỗi mẫu.',
      items: [
        {
          id: 'aq-now',
          timeLabel: 'BÂY GIỜ',
          condition: 'haze',
          temperatureCelsius: 30,
          isDay: true,
          isCurrent: true,
        },
        { id: 'aq-09', timeLabel: '09:00', condition: 'haze', temperatureCelsius: 31, isDay: true },
        { id: 'aq-10', timeLabel: '10:00', condition: 'haze', temperatureCelsius: 32, isDay: true },
        {
          id: 'aq-11',
          timeLabel: '11:00',
          condition: 'mostly_cloudy',
          temperatureCelsius: 33,
          isDay: true,
        },
      ],
    },
    recommendation: {
      what: 'Chọn hoạt động trong nhà hoặc quãng di chuyển ngoài trời ngắn hơn.',
      why: 'AQI mẫu ở mức không lành mạnh và gió hiện tại yếu.',
      do: 'Theo dõi chỉ số mới trước khi tập luyện ngoài trời; người nhạy cảm nên thận trọng hơn.',
    },
  },
  {
    id: 'rainy-night',
    selectorLabel: 'Mưa đêm',
    weather: rainyNightWeather,
    risk: {
      tone: 'attention',
      levelLabel: 'MƯA ĐANG DIỄN RA',
      title: 'Mặt đường có thể trơn và tầm nhìn giảm',
      reason: 'Xác suất mưa mẫu là 88%, cường độ vừa và độ ẩm cao.',
      immediateAction: 'Di chuyển chậm hơn và chuẩn bị lớp chống mưa dễ nhìn thấy.',
    },
    forecast: {
      summary: 'Mưa vừa còn kéo dài, sau đó giảm dần về khuya trong chuỗi mẫu.',
      items: [
        {
          id: 'rn-now',
          timeLabel: 'BÂY GIỜ',
          condition: 'rain',
          temperatureCelsius: 25,
          precipitationProbability: 0.88,
          isDay: false,
          isCurrent: true,
        },
        {
          id: 'rn-22',
          timeLabel: '22:00',
          condition: 'rain',
          temperatureCelsius: 25,
          precipitationProbability: 0.82,
          isDay: false,
        },
        {
          id: 'rn-23',
          timeLabel: '23:00',
          condition: 'light_rain',
          temperatureCelsius: 25,
          precipitationProbability: 0.62,
          isDay: false,
        },
        {
          id: 'rn-00',
          timeLabel: '00:00',
          condition: 'drizzle',
          temperatureCelsius: 24,
          precipitationProbability: 0.42,
          isDay: false,
        },
      ],
    },
    recommendation: {
      what: 'Áo mưa gọn, giày bám tốt và lớp áo nhanh khô.',
      why: 'Mưa vừa, độ ẩm cao và tầm nhìn thấp hơn bình thường.',
      do: 'Dành thêm thời gian di chuyển và tránh các đoạn đường ngập hoặc thiếu sáng.',
    },
  },
  {
    id: 'heavy-rain',
    selectorLabel: 'Mưa lớn',
    weather: heavyRainWeather,
    risk: {
      tone: 'warning',
      levelLabel: 'CẢNH BÁO MƯA LỚN',
      title: 'Có thể ngập ở khu vực trũng thấp',
      reason: heavyRainWeather.alerts[0].description,
      immediateAction: 'Hoãn lộ trình qua điểm trũng và theo dõi thông tin chính thức.',
    },
    forecast: {
      summary: 'Mưa lớn đạt đỉnh trong giờ hiện tại, giảm chậm về cuối chiều.',
      items: [
        {
          id: 'hr-now',
          timeLabel: 'BÂY GIỜ',
          condition: 'heavy_rain',
          temperatureCelsius: 26,
          precipitationProbability: 1,
          isDay: true,
          isCurrent: true,
        },
        {
          id: 'hr-16',
          timeLabel: '16:00',
          condition: 'heavy_rain',
          temperatureCelsius: 26,
          precipitationProbability: 0.96,
          isDay: true,
        },
        {
          id: 'hr-17',
          timeLabel: '17:00',
          condition: 'rain',
          temperatureCelsius: 26,
          precipitationProbability: 0.82,
          isDay: true,
        },
        {
          id: 'hr-18',
          timeLabel: '18:00',
          condition: 'light_rain',
          temperatureCelsius: 25,
          precipitationProbability: 0.58,
          isDay: false,
        },
      ],
    },
    recommendation: {
      what: 'Hoãn hoạt động ngoài trời không thiết yếu.',
      why: 'Dữ liệu mẫu có mưa lớn và cảnh báo ngập cục bộ.',
      do: 'Ở nơi cao ráo, tránh dòng nước chảy xiết và làm theo hướng dẫn chính thức.',
    },
  },
  {
    id: 'thunderstorm',
    selectorLabel: 'Dông',
    weather: thunderstormWeather,
    risk: {
      tone: 'warning',
      levelLabel: 'CẢNH BÁO DÔNG',
      title: 'Dông kèm gió giật đang hoạt động',
      reason: 'Cảnh báo mẫu ở mức warning; gió giật đạt 18.6 m/s.',
      immediateAction: 'Vào nơi trú chắc chắn, tránh cây cao và khoảng trống.',
    },
    forecast: {
      summary: 'Dông mạnh nhất trong giờ hiện tại, mưa còn tiếp tục sau hoàng hôn.',
      items: [
        {
          id: 'ts-now',
          timeLabel: 'BÂY GIỜ',
          condition: 'thunderstorm',
          temperatureCelsius: 29,
          precipitationProbability: 0.96,
          isDay: false,
          isCurrent: true,
        },
        {
          id: 'ts-19',
          timeLabel: '19:00',
          condition: 'thunderstorm_rain',
          temperatureCelsius: 28,
          precipitationProbability: 0.9,
          isDay: false,
        },
        {
          id: 'ts-20',
          timeLabel: '20:00',
          condition: 'heavy_rain',
          temperatureCelsius: 27,
          precipitationProbability: 0.76,
          isDay: false,
        },
        {
          id: 'ts-21',
          timeLabel: '21:00',
          condition: 'rain',
          temperatureCelsius: 27,
          precipitationProbability: 0.58,
          isDay: false,
        },
      ],
    },
    recommendation: {
      what: 'Tạm dừng hoạt động ngoài trời và rời khỏi khu vực trống trải.',
      why: 'Cảnh báo dông đi kèm gió giật mạnh và mưa lớn.',
      do: 'Trú trong công trình chắc chắn; tiếp tục theo dõi thông tin chính thức.',
    },
  },
  {
    id: 'severe-alert',
    selectorLabel: 'Nguy hiểm',
    weather: severeAlertWeather,
    risk: {
      tone: 'danger',
      levelLabel: 'CẢNH BÁO CỰC ĐỘ',
      title: severeAlertWeather.alerts[0].title,
      reason: severeAlertWeather.alerts[0].description,
      immediateAction: 'Tránh ra ngoài và làm theo hướng dẫn của cơ quan chức năng.',
    },
    forecast: {
      summary: 'Điều kiện nguy hiểm tiếp diễn trong toàn bộ chuỗi xem trước.',
      items: [
        {
          id: 'sa-now',
          timeLabel: 'BÂY GIỜ',
          condition: 'tropical_storm',
          temperatureCelsius: 26,
          precipitationProbability: 1,
          isDay: false,
          isCurrent: true,
        },
        {
          id: 'sa-20',
          timeLabel: '20:00',
          condition: 'tropical_storm',
          temperatureCelsius: 26,
          precipitationProbability: 1,
          isDay: false,
        },
        {
          id: 'sa-21',
          timeLabel: '21:00',
          condition: 'tropical_storm',
          temperatureCelsius: 25,
          precipitationProbability: 1,
          isDay: false,
        },
        {
          id: 'sa-22',
          timeLabel: '22:00',
          condition: 'heavy_rain',
          temperatureCelsius: 25,
          precipitationProbability: 0.98,
          isDay: false,
        },
      ],
    },
    recommendation: {
      what: 'Ở trong công trình chắc chắn; không thực hiện chuyến đi không thiết yếu.',
      why: 'Fixture có cảnh báo cực độ, gió rất mạnh và mưa cực lớn.',
      do: 'Theo dõi hướng dẫn chính thức và chuẩn bị phương án an toàn tại chỗ.',
    },
  },
  {
    id: 'partial-data',
    selectorLabel: 'Thiếu dữ liệu',
    weather: partialCurrentWeather,
    risk: {
      tone: 'unavailable',
      levelLabel: 'CHƯA ĐỦ DỮ LIỆU',
      title: 'Chưa thể xác định rủi ro chính',
      reason: 'AQI, UV, mưa và cảnh báo hiện không có trong fixture một phần.',
      immediateAction: 'Dùng các số đo đang có và kiểm tra nguồn cập nhật trước khi ra ngoài.',
    },
    forecast: { summary: 'Chưa có chuỗi dự báo mẫu cho vị trí này.', items: [] },
    recommendation: {
      what: 'Chuẩn bị trang phục linh hoạt theo nhiệt độ hiện có.',
      why: 'Dữ liệu môi trường và mưa chưa đủ để đưa ra gợi ý cụ thể hơn.',
      do: 'Kiểm tra lại khi có bản quan sát đầy đủ; không suy diễn từ trường dữ liệu trống.',
    },
  },
] as const satisfies readonly HomeScenario[];
