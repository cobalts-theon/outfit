import type {
  CurrentWeather,
  Precipitation,
  WeatherLocation,
} from '@/features/weather/domain/current-weather';

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
  sun: {
    sunrise: '2026-08-06T05:42:00+07:00',
    sunset: '2026-08-06T18:16:00+07:00',
  },
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
  sun: {
    sunrise: '2026-08-06T05:29:00+07:00',
    sunset: '2026-08-06T18:18:00+07:00',
  },
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
  precipitation: {
    type: 'rain',
    probability: 0.88,
    amountMillimeters: 4.6,
    intensity: 'moderate',
  },
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
  precipitation: {
    type: 'rain',
    probability: 1,
    amountMillimeters: 28.5,
    intensity: 'heavy',
  },
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
  precipitation: {
    type: 'rain',
    probability: 0.96,
    amountMillimeters: 12.2,
    intensity: 'heavy',
  },
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
  precipitation: {
    type: 'drizzle',
    probability: 0.35,
    amountMillimeters: 0.2,
    intensity: 'light',
  },
  sun: {
    sunrise: '2026-08-06T05:35:00+07:00',
    sunset: '2026-08-06T18:42:00+07:00',
  },
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
  precipitation: {
    type: 'rain',
    probability: 1,
    amountMillimeters: 46,
    intensity: 'extreme',
  },
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
