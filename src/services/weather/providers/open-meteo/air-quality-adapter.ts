import type {
  AirQualityCategory,
  AirQualityReference,
  PollutantConcentrations,
  UVReference,
} from '@/features/weather/domain/current-weather';
import type { OpenMeteoAirQualityResponseDto } from '@/services/weather/providers/open-meteo/air-quality-dto';
import { OpenMeteoResponseError } from '@/services/weather/providers/open-meteo/errors';

export type OpenMeteoAqiScale = 'european_aqi' | 'us_aqi';

export interface OpenMeteoEnvironmentalSnapshot {
  readonly airQuality?: AirQualityReference;
  readonly uv?: UVReference;
}

const pollutantUnitKeys = [
  'pm2_5',
  'pm10',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'ozone',
] as const;

function assertPollutantUnits(response: OpenMeteoAirQualityResponseDto) {
  for (const key of pollutantUnitKeys) {
    const unit = response.current_units?.[key];
    if (unit !== undefined && unit !== 'μg/m³') {
      throw new OpenMeteoResponseError(
        `Expected μg/m³ but received ${unit}.`,
        `current_units.${key}`,
      );
    }
  }
}

function optionalMeasurement(path: string, value: number | null | undefined) {
  if (value === null || value === undefined) return undefined;
  if (!Number.isFinite(value) || value < 0) {
    throw new OpenMeteoResponseError('Expected a non-negative value.', path);
  }
  return value;
}

function usAqiCategory(index: number): AirQualityCategory {
  if (index <= 50) return 'good';
  if (index <= 100) return 'moderate';
  if (index <= 150) return 'unhealthy_for_sensitive_groups';
  if (index <= 200) return 'unhealthy';
  if (index <= 300) return 'very_unhealthy';
  return 'hazardous';
}

function mapPollutants(
  response: OpenMeteoAirQualityResponseDto,
): PollutantConcentrations | undefined {
  const current = response.current;
  const pollutants: PollutantConcentrations = {
    pm25MicrogramsPerCubicMeter: optionalMeasurement('current.pm2_5', current.pm2_5),
    pm10MicrogramsPerCubicMeter: optionalMeasurement('current.pm10', current.pm10),
    coMicrogramsPerCubicMeter: optionalMeasurement(
      'current.carbon_monoxide',
      current.carbon_monoxide,
    ),
    no2MicrogramsPerCubicMeter: optionalMeasurement(
      'current.nitrogen_dioxide',
      current.nitrogen_dioxide,
    ),
    so2MicrogramsPerCubicMeter: optionalMeasurement(
      'current.sulphur_dioxide',
      current.sulphur_dioxide,
    ),
    o3MicrogramsPerCubicMeter: optionalMeasurement('current.ozone', current.ozone),
  };

  return Object.values(pollutants).every((value) => value === undefined)
    ? undefined
    : pollutants;
}

export function adaptOpenMeteoAirQuality(
  response: OpenMeteoAirQualityResponseDto,
  scale: OpenMeteoAqiScale,
): OpenMeteoEnvironmentalSnapshot {
  assertPollutantUnits(response);
  const rawIndex = response.current[scale];
  const index = optionalMeasurement(`current.${scale}`, rawIndex);
  const pollutants = mapPollutants(response);
  const uvIndex = optionalMeasurement('current.uv_index', response.current.uv_index);

  const airQuality =
    index === undefined
      ? undefined
      : {
          index,
          scale,
          ...(scale === 'us_aqi' ? { category: usAqiCategory(index) } : {}),
          ...(pollutants === undefined ? {} : { pollutants }),
        };
  const uv = uvIndex === undefined ? undefined : { index: uvIndex };

  return {
    ...(airQuality === undefined ? {} : { airQuality }),
    ...(uv === undefined ? {} : { uv }),
  };
}
