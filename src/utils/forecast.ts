import type {
  DailyForecast,
  HourlyForecast,
  CurrentWeather,
  ZonedDateTimeString,
  WeatherCondition,
} from '@/types/weather';

// forecast-presentation

export const DETAILED_HOURLY_LIMIT = 24;

const conditionLabels: Record<WeatherCondition, string> = {
  clear: 'Trời quang',
  mostly_clear: 'Hầu như quang',
  partly_cloudy: 'Mây từng phần',
  mostly_cloudy: 'Nhiều mây',
  cloudy: 'Có mây',
  overcast: 'Âm u',
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
  snow_showers: 'Mưa tuyết rào',
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

export function getForecastConditionLabel(condition: WeatherCondition) {
  return conditionLabels[condition];
}

const hourFormatterCache = new Map<string, Intl.DateTimeFormat>();

const dayFormatterCache = new Map<string, Intl.DateTimeFormat>();

function hourFormatter(timeZone: string) {
  const cached = hourFormatterCache.get(timeZone);
  if (cached !== undefined) return cached;
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  hourFormatterCache.set(timeZone, formatter);
  return formatter;
}

function dayFormatter(timeZone: string) {
  const cached = dayFormatterCache.get(timeZone);
  if (cached !== undefined) return cached;
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
  dayFormatterCache.set(timeZone, formatter);
  return formatter;
}

function localDateKey(timestamp: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
}

function firstRelevantHourlyIndex(forecast: HourlyForecast, observedAt: ZonedDateTimeString) {
  const observed = Date.parse(observedAt);
  const currentHour = Math.floor(observed / 3_600_000) * 3_600_000;
  const exactOrFuture = forecast.entries.findIndex(
    (entry) => Date.parse(entry.forecastAt) >= currentHour,
  );
  return exactOrFuture < 0 ? forecast.entries.length : exactOrFuture;
}

export interface DetailedHourlyItem {
  readonly id: string;
  readonly timeLabel: string;
  readonly dayLabel?: string;
  readonly conditionLabel: string;
  readonly condition: WeatherCondition;
  readonly temperatureLabel: string;
  readonly precipitationLabel: string;
  readonly precipitationAmountLabel?: string;
  readonly isDay: boolean;
  readonly isCurrent: boolean;
}

export function createDetailedHourlyItems(
  forecast: HourlyForecast,
  observedAt: ZonedDateTimeString,
  limit = DETAILED_HOURLY_LIMIT,
): readonly DetailedHourlyItem[] {
  const start = firstRelevantHourlyIndex(forecast, observedAt);
  const observed = Date.parse(observedAt);
  let previousDate: string | undefined;

  return forecast.entries.slice(start, start + Math.max(0, limit)).map((entry) => {
    const date = localDateKey(entry.forecastAt, forecast.location.timeZone);
    const isCurrent =
      observed >= Date.parse(entry.forecastAt) &&
      observed < Date.parse(entry.forecastAt) + 3_600_000;
    const item: DetailedHourlyItem = {
      id: entry.forecastAt,
      timeLabel: isCurrent
        ? 'BÂY GIỜ'
        : hourFormatter(forecast.location.timeZone).format(new Date(entry.forecastAt)),
      ...(date === previousDate
        ? {}
        : {
            dayLabel: dayFormatter(forecast.location.timeZone)
              .format(new Date(entry.forecastAt))
              .toLocaleUpperCase('vi-VN'),
          }),
      conditionLabel: conditionLabels[entry.condition],
      condition: entry.condition,
      temperatureLabel: `${Math.round(entry.temperatureCelsius)}°`,
      precipitationLabel:
        entry.precipitation?.probability === undefined
          ? 'Mưa —'
          : `Mưa ${Math.round(entry.precipitation.probability * 100)}%`,
      ...(entry.precipitation?.amountMillimeters === undefined
        ? {}
        : { precipitationAmountLabel: `${entry.precipitation.amountMillimeters.toFixed(1)} mm` }),
      isDay: entry.daylight.isDay,
      isCurrent,
    };
    previousDate = date;
    return item;
  });
}

export interface DailyForecastItem {
  readonly id: string;
  readonly dateLabel: string;
  readonly conditionLabel: string;
  readonly condition: WeatherCondition;
  readonly temperatureRangeLabel: string;
  readonly precipitationLabel: string;
  readonly amountLabel?: string;
}

export function createDailyForecastItems(forecast: DailyForecast): readonly DailyForecastItem[] {
  return forecast.entries.map((entry, index) => ({
    id: entry.forecastDate,
    dateLabel:
      index === 0
        ? 'HÔM NAY'
        : new Intl.DateTimeFormat('vi-VN', {
            timeZone: 'UTC',
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
          })
            .format(new Date(`${entry.forecastDate}T12:00:00.000Z`))
            .toLocaleUpperCase('vi-VN'),
    conditionLabel: conditionLabels[entry.condition],
    condition: entry.condition,
    temperatureRangeLabel: `${Math.round(entry.minimumTemperatureCelsius)}° / ${Math.round(
      entry.maximumTemperatureCelsius,
    )}°`,
    precipitationLabel:
      entry.precipitation?.probability === undefined
        ? 'Mưa —'
        : `Mưa ${Math.round(entry.precipitation.probability * 100)}%`,
    ...(entry.precipitation?.amountMillimeters === undefined
      ? {}
      : { amountLabel: `${entry.precipitation.amountMillimeters.toFixed(1)} mm` }),
  }));
}

export interface ForecastDetailItem {
  readonly label: string;
  readonly value: string;
  readonly note: string;
}

export function createForecastDetails(
  weather: CurrentWeather,
  daily: DailyForecast | undefined,
): readonly ForecastDetailItem[] {
  const today = daily?.entries[0];
  const details: ForecastDetailItem[] = [];
  const sun = today?.sun ?? weather.sun;

  if (sun !== undefined) {
    details.push({
      label: 'MẶT TRỜI',
      value: `${formatTime(sun.sunrise, weather.location.timeZone)} → ${formatTime(
        sun.sunset,
        weather.location.timeZone,
      )}`,
      note: 'Bình minh / hoàng hôn',
    });
  }
  if (weather.visibilityMeters !== undefined) {
    details.push({
      label: 'TẦM NHÌN',
      value:
        weather.visibilityMeters >= 1000
          ? `${(weather.visibilityMeters / 1000).toFixed(1)} km`
          : `${Math.round(weather.visibilityMeters)} m`,
      note: 'Quan sát hiện tại',
    });
  }

  return details;
}

export function formatTime(timestamp: string, timeZone: string) {
  return hourFormatter(timeZone).format(new Date(timestamp));
}
