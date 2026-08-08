import type {
  DaylightState,
  Precipitation,
  UVReference,
  WeatherLocation,
  Wind,
  ZonedDateTimeString,
} from '@/features/weather/domain/current-weather';
import type { WeatherCondition } from '@/features/weather/domain/weather-condition';

/** A provider-independent forecast for one exact hourly timestamp. */
export interface HourlyForecastEntry {
  readonly forecastAt: ZonedDateTimeString;
  readonly condition: WeatherCondition;
  readonly daylight: DaylightState;
  readonly temperatureCelsius: number;
  readonly apparentTemperatureCelsius?: number;
  readonly precipitation?: Precipitation;
  readonly wind?: Wind;
  readonly uv?: UVReference;
}

/**
 * Ordered hourly forecast collection. Timestamps remain absolute ISO instants;
 * `location.timeZone` is the IANA zone used for local presentation.
 */
export interface HourlyForecast {
  readonly location: WeatherLocation;
  readonly entries: readonly HourlyForecastEntry[];
}
