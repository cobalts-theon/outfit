import type { HourlyForecast } from '@/features/forecast/domain/hourly-forecast';
import type { HomeForecastPreview } from '@/features/home/model/home-prototype';
import type { ZonedDateTimeString } from '@/features/weather/domain/current-weather';

export const HOME_NEAR_TERM_HOUR_COUNT = 6;

function findNearTermStart(
  forecast: HourlyForecast,
  observedAt: ZonedDateTimeString,
) {
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

  return {
    index: entries.findIndex((entry) => Date.parse(entry.forecastAt) > observedTime),
    hasCurrentHour: false,
  };
}

function formatHour(timestamp: string, timeZone: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(timestamp));
}

export function createHomeHourlyForecastPreview(
  forecast: HourlyForecast,
  observedAt: ZonedDateTimeString,
  limit = HOME_NEAR_TERM_HOUR_COUNT,
): HomeForecastPreview {
  const start = findNearTermStart(forecast, observedAt);
  if (start.index < 0 || limit <= 0) {
    return createUnavailableHomeForecastPreview();
  }

  const items = forecast.entries
    .slice(start.index, start.index + limit)
    .map((entry, index) => ({
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

  return {
    summary: `Dự báo trực tiếp theo giờ tại múi giờ ${forecast.location.timeZone}.`,
    items,
  };
}

export function createUnavailableHomeForecastPreview(): HomeForecastPreview {
  return {
    summary: 'Chuỗi dự báo theo giờ chưa khả dụng cho lần cập nhật trực tiếp này.',
    items: [],
  };
}
