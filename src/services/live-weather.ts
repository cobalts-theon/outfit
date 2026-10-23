/**
 * Tải thời tiết trực tiếp và tổng hợp dự báo với dữ liệu môi trường.
 * Khai báo truy vấn có cache; cho phép trả dữ liệu một phần khi nguồn phụ bị lỗi.
 */
import type { HourlyForecast, CurrentWeather, DailyForecast } from '@/types/weather';
import type { PlanningHour } from '@/utils/planning';
import type { AppCoordinates, SelectedAppLocation } from '@/utils/validation';
import { adaptOpenMeteoAirQuality, type OpenMeteoAqiScale, type OpenMeteoEnvironmentalSnapshot, fetchOpenMeteoCurrentAirQuality, fetchOpenMeteoLiveWeatherForecast } from '@/services/weather/client';
import type { OpenMeteoAirQualityResponseDto, OpenMeteoLiveForecastDto } from '@/services/weather/responses';
import { OpenMeteoHttpError, OpenMeteoResponseError } from '@/services/weather/request';
import { adaptOpenMeteoCurrentWeather, adaptOpenMeteoHourlyForecast, adaptOpenMeteoDailyForecast } from '@/services/weather/adapters';
import { queryOptions, useQuery } from '@tanstack/react-query';

// planning-forecast

// Đổi dự báo thành dữ liệu đánh giá giờ.
export function createPlanningHours(forecast: HourlyForecast | undefined, aqi: Record<string, number> = {}): PlanningHour[] {
  const nonHazardousConditions = new Set(['clear', 'mostly_clear', 'partly_cloudy', 'mostly_cloudy', 'cloudy', 'overcast', 'drizzle', 'light_rain', 'rain', 'showers']);
  return (forecast?.entries ?? []).map((hour) => ({
    at: hour.forecastAt,
    feelsLike: hour.apparentTemperatureCelsius,
    uv: hour.uv?.index,
    aqi: aqi[hour.forecastAt],
    rainProbability: hour.precipitation?.probability,
    wind: hour.wind?.speedMetersPerSecond,
    gust: hour.wind?.gustMetersPerSecond,
    daylight: hour.daylight.isDay,
    hazardous: !nonHazardousConditions.has(hour.condition),
  }));
}

// live-current-weather

export const LIVE_CURRENT_WEATHER_AQI_SCALE = 'us_aqi' as const satisfies OpenMeteoAqiScale;

export const WEATHER_QUERY_COORDINATE_DECIMALS = 3;

export interface LiveCurrentWeatherInput {
  readonly coordinates: AppCoordinates;
  readonly locationName: string;
  readonly locationIdentity: string;
  readonly aqiScale: OpenMeteoAqiScale;
}

export type LiveWeatherErrorCode =
  | 'invalid_input'
  | 'network'
  | 'rate_limited'
  | 'provider_unavailable'
  | 'malformed_response'
  | 'cancelled'
  | 'unknown';

export type LiveWeatherIssueCode =
  | LiveWeatherErrorCode
  | 'air_quality_unavailable'
  | 'uv_unavailable'
  | 'hourly_forecast_unavailable'
  | 'daily_forecast_unavailable';

export class LiveWeatherError extends Error {
  // Khởi tạo lỗi và thông tin đi kèm.
  constructor(
    readonly code: LiveWeatherErrorCode,
    readonly source:
      | 'forecast'
      | 'hourly_forecast'
      | 'daily_forecast'
      | 'air_quality'
      | 'application',
    message: string,
  ) {
    super(message);
    this.name = 'LiveWeatherError';
  }
}

export interface LiveWeatherDataIssue {
  readonly source: 'air_quality' | 'hourly_forecast' | 'daily_forecast';
  readonly code: LiveWeatherIssueCode;
  readonly message: string;
}

export interface LiveCurrentWeatherResult {
  readonly status: 'complete' | 'partial';
  readonly weather: CurrentWeather;
  readonly hourlyForecast?: HourlyForecast;
  readonly dailyForecast?: DailyForecast;
  readonly issues: readonly LiveWeatherDataIssue[];
}

export interface LiveWeatherProviderDependencies {
  readonly fetchForecast: (
    coordinates: AppCoordinates,
    options: { readonly signal?: AbortSignal },
  ) => Promise<OpenMeteoLiveForecastDto>;
  readonly fetchAirQuality: (
    coordinates: AppCoordinates,
    options: { readonly signal?: AbortSignal },
  ) => Promise<OpenMeteoAirQualityResponseDto>;
}

const defaultDependencies: LiveWeatherProviderDependencies = {
  fetchForecast: fetchOpenMeteoLiveWeatherForecast,
  fetchAirQuality: fetchOpenMeteoCurrentAirQuality,
};

// Làm tròn tọa độ cho truy vấn.
function roundCoordinate(value: number) {
  const factor = 10 ** WEATHER_QUERY_COORDINATE_DECIMALS;
  const rounded = Math.round(value * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

// Kiểm tra và làm tròn tọa độ thời tiết.
export function normalizeWeatherQueryCoordinates(coordinates: AppCoordinates): AppCoordinates {
  if (
    !Number.isFinite(coordinates.latitude) ||
    !Number.isFinite(coordinates.longitude) ||
    coordinates.latitude < -90 ||
    coordinates.latitude > 90 ||
    coordinates.longitude < -180 ||
    coordinates.longitude > 180
  ) {
    throw new LiveWeatherError('invalid_input', 'application', 'Tọa độ thời tiết không hợp lệ.');
  }

  return { latitude: roundCoordinate(coordinates.latitude), longitude: roundCoordinate(coordinates.longitude) };
}

// Chuẩn bị vị trí cho truy vấn thời tiết.
export function createLiveCurrentWeatherInput(selectedLocation: SelectedAppLocation): LiveCurrentWeatherInput {
  const label = selectedLocation.label?.trim();
  const locationName =
    label && label.length > 0
      ? label
      : selectedLocation.source === 'device'
        ? 'Vị trí hiện tại'
        : 'Vị trí đã chọn';

  return {
    coordinates: normalizeWeatherQueryCoordinates(selectedLocation.coordinates),
    locationName,
    locationIdentity: `${selectedLocation.source}:${selectedLocation.coordinates.latitude.toFixed(3)},${selectedLocation.coordinates.longitude.toFixed(3)}`,
    aqiScale: LIVE_CURRENT_WEATHER_AQI_SCALE,
  };
}

// Chuẩn hóa lỗi từ nguồn thời tiết.
function safeError(error: unknown, source: 'forecast' | 'hourly_forecast' | 'daily_forecast' | 'air_quality'): LiveWeatherError {
  if (error instanceof LiveWeatherError) return error;

  if (error instanceof OpenMeteoResponseError) {
    return new LiveWeatherError('malformed_response', source, 'Dữ liệu thời tiết nhận được không đúng định dạng mong đợi.');
  }

  if (error instanceof OpenMeteoHttpError) {
    if (error.status === 429) {
      return new LiveWeatherError('rate_limited', source, 'Nguồn thời tiết đang giới hạn yêu cầu. Vui lòng thử lại sau.');
    }

    return new LiveWeatherError('provider_unavailable', source, 'Nguồn thời tiết tạm thời không khả dụng.');
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return new LiveWeatherError('cancelled', source, 'Yêu cầu thời tiết đã bị hủy.');
  }

  if (error instanceof TypeError) {
    return new LiveWeatherError('network', source, 'Không thể kết nối tới nguồn thời tiết.');
  }

  return new LiveWeatherError('unknown', source, 'Không thể hoàn tất yêu cầu thời tiết.');
}

// Ghi nhận lỗi của một phần dữ liệu.
function issueFromError(error: LiveWeatherError, source: LiveWeatherDataIssue['source']): LiveWeatherDataIssue {
  return { source, code: error.code, message: error.message };
}

// Tải và tổng hợp thời tiết với môi trường.
export async function loadLiveCurrentWeather(
  input: LiveCurrentWeatherInput,
  options: {
    readonly signal?: AbortSignal;
    readonly dependencies?: LiveWeatherProviderDependencies;
  } = {},
): Promise<LiveCurrentWeatherResult> {
  const coordinates = normalizeWeatherQueryCoordinates(input.coordinates);
  const dependencies = options.dependencies ?? defaultDependencies;
  const requestOptions = { signal: options.signal };

  // Gọi song song, nhưng giữ được dự báo nếu riêng nguồn AQI gặp lỗi.
  const [forecastResult, airQualityResult] = await Promise.allSettled([
    dependencies.fetchForecast(coordinates, requestOptions),
    dependencies.fetchAirQuality(coordinates, requestOptions),
  ]);

  if (forecastResult.status === 'rejected') {
    throw safeError(forecastResult.reason, 'forecast');
  }

  const issues: LiveWeatherDataIssue[] = [];
  let environmental: OpenMeteoEnvironmentalSnapshot | undefined;
  let hourlyForecast: HourlyForecast | undefined;
  let dailyForecast: DailyForecast | undefined;
  let dailyUsableForCurrent = true;
  const forecast = forecastResult.value.forecast;

  if (forecastResult.value.hourlyIssue !== undefined) {
    issues.push({
      source: 'hourly_forecast',
      code: 'malformed_response',
      message: 'Chuỗi dự báo theo giờ nhận được không đúng định dạng mong đợi.',
    });
  } else if (forecast.hourly === undefined) {
    issues.push({
      source: 'hourly_forecast',
      code: 'hourly_forecast_unavailable',
      message: 'Nguồn thời tiết không cung cấp chuỗi dự báo theo giờ.',
    });
  } else {
    try {
      hourlyForecast = adaptOpenMeteoHourlyForecast(forecast, { name: input.locationName });
    } catch (error) {
      issues.push(issueFromError(safeError(error, 'hourly_forecast'), 'hourly_forecast'));
    }
  }

  if (forecastResult.value.dailyIssue !== undefined) {
    dailyUsableForCurrent = false;
    issues.push({
      source: 'daily_forecast',
      code: 'malformed_response',
      message: 'Chuỗi dự báo theo ngày nhận được không đúng định dạng mong đợi.',
    });
  } else if (forecast.daily === undefined) {
    dailyUsableForCurrent = false;
    issues.push({
      source: 'daily_forecast',
      code: 'daily_forecast_unavailable',
      message: 'Nguồn thời tiết không cung cấp chuỗi dự báo theo ngày.',
    });
  } else {
    try {
      dailyForecast = adaptOpenMeteoDailyForecast(forecast, { name: input.locationName });
    } catch (error) {
      dailyUsableForCurrent = false;
      issues.push(issueFromError(safeError(error, 'daily_forecast'), 'daily_forecast'));
    }
  }

  if (airQualityResult.status === 'fulfilled') {
    try {
      environmental = adaptOpenMeteoAirQuality(airQualityResult.value, input.aqiScale);
    } catch (error) {
      issues.push(issueFromError(safeError(error, 'air_quality'), 'air_quality'));
    }
  } else {
    issues.push(issueFromError(safeError(airQualityResult.reason, 'air_quality'), 'air_quality'));
  }

  let weather: CurrentWeather;
  try {
    weather = adaptOpenMeteoCurrentWeather(dailyUsableForCurrent ? forecast : { ...forecast, daily: undefined, daily_units: undefined }, { name: input.locationName }, environmental
    );
  } catch (error) {
    throw safeError(error, 'forecast');
  }

  if (!issues.some((issue) => issue.source === 'air_quality')) {
    if (weather.airQuality === undefined) {
      issues.push({
        source: 'air_quality',
        code: 'air_quality_unavailable',
        message: 'Nguồn môi trường không cung cấp AQI hiện tại.',
      });
    }

    if (weather.uv === undefined) {
      issues.push({
        source: 'air_quality',
        code: 'uv_unavailable',
        message: 'Nguồn môi trường và dự báo không cung cấp UV hiện tại.',
      });
    }
  }

  return {
    status: issues.length === 0 ? 'complete' : 'partial',
    weather,
    ...(hourlyForecast === undefined ? {} : { hourlyForecast }),
    ...(dailyForecast === undefined ? {} : { dailyForecast }),
    issues,
  };
}

// Chọn lỗi được phép tải lại.
export function shouldRetryLiveWeatherQuery(failureCount: number, error: unknown) {
  if (!(error instanceof LiveWeatherError) || failureCount >= 2) return false;

  return (
    error.code === 'network' ||
    error.code === 'rate_limited' ||
    error.code === 'provider_unavailable'
  );
}

// live-current-weather-query

export const LIVE_CURRENT_WEATHER_STALE_TIME_MS = 10 * 60 * 1000;

export const liveCurrentWeatherKeys = {
  // v3 reflects the shared result contract containing current, hourly, and daily data.
  all: ['weather', 'current-hourly-daily', 'v3'] as const,
  unavailable: () => [...liveCurrentWeatherKeys.all, 'unavailable'] as const,
  location: (selectedLocation: SelectedAppLocation) => {
    const input = createLiveCurrentWeatherInput(selectedLocation);
    return [
      ...liveCurrentWeatherKeys.all,
      {
        latitude: input.coordinates.latitude,
        longitude: input.coordinates.longitude,
        locationIdentity: input.locationIdentity,
        aqiScale: input.aqiScale,
      },
    ] as const;
  },
};

// Cấu hình cache và tải lại thời tiết.
export function liveCurrentWeatherQueryOptions(selectedLocation: SelectedAppLocation | undefined, dependencies?: LiveWeatherProviderDependencies) {
  const input =
    selectedLocation === undefined ? undefined : createLiveCurrentWeatherInput(selectedLocation);

  return queryOptions({
    queryKey:
      selectedLocation === undefined
        ? liveCurrentWeatherKeys.unavailable()
        : liveCurrentWeatherKeys.location(selectedLocation),
    enabled: input !== undefined,
    queryFn: ({ signal }) => {
      if (input === undefined) {
        throw new LiveWeatherError('invalid_input', 'application', 'Không thể tải thời tiết khi chưa có vị trí được chọn.');
      }

      return loadLiveCurrentWeather(input, { signal, dependencies });
    },
    staleTime: LIVE_CURRENT_WEATHER_STALE_TIME_MS,
    refetchInterval: LIVE_CURRENT_WEATHER_STALE_TIME_MS,
    refetchIntervalInBackground: false,
    retry: shouldRetryLiveWeatherQuery,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}

// Lấy thời tiết cho địa điểm được chọn.
export function useLiveCurrentWeather(selectedLocation?: SelectedAppLocation) {
  return useQuery(liveCurrentWeatherQueryOptions(selectedLocation));
}
