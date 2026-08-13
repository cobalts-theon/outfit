import type {
  MoonData,
  Precipitation,
  SunData,
  UVReference,
  WeatherLocation,
} from '@/features/weather/domain/current-weather';
import type { WeatherCondition } from '@/features/weather/domain/weather-condition';

/** A provider-independent forecast for one local calendar date. */
export interface DailyForecastEntry {
  readonly forecastDate: string;
  readonly condition: WeatherCondition;
  readonly minimumTemperatureCelsius: number;
  readonly maximumTemperatureCelsius: number;
  readonly precipitation?: Precipitation;
  readonly uv?: UVReference;
  readonly sun?: SunData;
  readonly moon?: MoonData;
}

/** Ordered daily forecast collection in the location's IANA timezone. */
export interface DailyForecast {
  readonly location: WeatherLocation;
  readonly entries: readonly DailyForecastEntry[];
}
