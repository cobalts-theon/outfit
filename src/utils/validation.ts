import {
  isWeatherCondition,
  AIR_QUALITY_CATEGORIES,
  DAY_PHASES,
  MOON_PHASES,
  PRECIPITATION_INTENSITIES,
  PRECIPITATION_TYPES,
  UV_CATEGORIES,
  WEATHER_ALERT_SEVERITIES,
  WIND_DIRECTIONS,
  type CurrentWeather,
  type ZonedDateTimeString,
} from '@/types/weather';

// location

export interface AppCoordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export type DevicePositionSource = 'current' | 'last_known';

export interface DevicePosition {
  readonly coordinates: AppCoordinates;
  readonly observedAt: string;
  readonly accuracyMeters?: number;
  readonly placeName?: string;
  readonly source: DevicePositionSource;
  readonly isMocked?: boolean;
}

/**
 * Stable input for future weather queries. Manual selection will produce this
 * same contract without exposing Expo Location types to the application.
 */
export interface SelectedAppLocation {
  readonly coordinates: AppCoordinates;
  readonly source: 'device' | 'manual';
  readonly selectedAt: string;
  readonly label?: string;
  readonly accuracyMeters?: number;
}

export type LocationPermissionAccuracy = 'precise' | 'approximate' | 'unknown';

export type LocationPermission =
  | { readonly status: 'unknown' }
  | { readonly status: 'prompt'; readonly canAskAgain: true }
  | { readonly status: 'granted'; readonly accuracy: LocationPermissionAccuracy }
  | { readonly status: 'denied'; readonly canAskAgain: boolean };

export type LocationFallbackReason =
  | 'services_unavailable'
  | 'current_timeout'
  | 'current_error'
  | 'current_invalid';

export type LocationAcquisitionErrorCode =
  | 'timeout'
  | 'position_unavailable'
  | 'invalid_position'
  | 'unexpected';

export type LocationCapabilityState =
  | { readonly status: 'idle' }
  | { readonly status: 'checking_permission' }
  | { readonly status: 'permission_required' }
  | { readonly status: 'requesting_permission' }
  | { readonly status: 'acquiring_position' }
  | {
      readonly status: 'ready';
      readonly position?: DevicePosition;
      readonly selectedLocation: SelectedAppLocation;
      readonly fallbackReason?: LocationFallbackReason;
    }
  | { readonly status: 'permission_denied'; readonly canAskAgain: boolean }
  | { readonly status: 'permission_unavailable'; readonly message: string }
  | { readonly status: 'services_unavailable' }
  | {
      readonly status: 'acquisition_error';
      readonly code: LocationAcquisitionErrorCode;
      readonly message: string;
    };

export function normalizeCoordinates(latitude: number, longitude: number): AppCoordinates | null {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

export function selectDevicePosition(position: DevicePosition): SelectedAppLocation {
  return {
    coordinates: position.coordinates,
    source: 'device',
    selectedAt: new Date().toISOString(),
    ...(position.placeName === undefined ? {} : { label: position.placeName }),
    accuracyMeters: position.accuracyMeters,
  };
}

export function stateFromLocationPermission(
  permission: LocationPermission,
): LocationCapabilityState {
  switch (permission.status) {
    case 'prompt':
      return { status: 'permission_required' };
    case 'granted':
      return { status: 'acquiring_position' };
    case 'denied':
      return { status: 'permission_denied', canAskAgain: permission.canAskAgain };
    case 'unknown':
      return {
        status: 'permission_unavailable',
        message: 'Không thể xác định trạng thái quyền vị trí.',
      };
  }
}

export interface ManualLocationCandidate {
  readonly id: string;
  readonly label: string;
  readonly context: string;
  readonly selectionLabel?: string;
  readonly coordinates: AppCoordinates;
  readonly timezone?: string;
}

export interface ManualLocationSelection {
  readonly label: string;
  readonly coordinates: AppCoordinates;
}

export function createManualSelectedLocation(
  selection: ManualLocationSelection,
): SelectedAppLocation {
  const label = selection.label.trim();
  const coordinates = normalizeCoordinates(
    selection.coordinates.latitude,
    selection.coordinates.longitude,
  );

  if (label.length === 0 || coordinates === null) {
    throw new Error('Địa điểm thủ công không hợp lệ.');
  }

  return { coordinates, label, selectedAt: new Date().toISOString(), source: 'manual' };
}

// validate-current-weather

export const CURRENT_WEATHER_VALIDATION_CODES = [
  'empty_value',
  'invalid_value',
  'invalid_number',
  'out_of_range',
  'invalid_timestamp',
  'invalid_timezone',
  'inconsistent_value',
  'duplicate_id',
] as const;

export type CurrentWeatherValidationCode = (typeof CURRENT_WEATHER_VALIDATION_CODES)[number];

export interface CurrentWeatherValidationIssue {
  readonly path: string;
  readonly code: CurrentWeatherValidationCode;
  readonly message: string;
}

export type CurrentWeatherValidationResult =
  | { readonly valid: true; readonly issues: readonly [] }
  | { readonly valid: false; readonly issues: readonly CurrentWeatherValidationIssue[] };

const zonedTimestampPattern = /(?:Z|[+-]\d{2}:\d{2})$/;

const dayPhaseSet: ReadonlySet<string> = new Set(DAY_PHASES);

const windDirectionSet: ReadonlySet<string> = new Set(WIND_DIRECTIONS);

const precipitationTypeSet: ReadonlySet<string> = new Set(PRECIPITATION_TYPES);

const precipitationIntensitySet: ReadonlySet<string> = new Set(PRECIPITATION_INTENSITIES);

const uvCategorySet: ReadonlySet<string> = new Set(UV_CATEGORIES);

const airQualityCategorySet: ReadonlySet<string> = new Set(AIR_QUALITY_CATEGORIES);

const moonPhaseSet: ReadonlySet<string> = new Set(MOON_PHASES);

const alertSeveritySet: ReadonlySet<string> = new Set(WEATHER_ALERT_SEVERITIES);

function addIssue(
  issues: CurrentWeatherValidationIssue[],
  path: string,
  code: CurrentWeatherValidationCode,
  message: string,
) {
  issues.push({ path, code, message });
}

function validateFiniteNumber(
  issues: CurrentWeatherValidationIssue[],
  path: string,
  value: number,
) {
  if (!Number.isFinite(value)) {
    addIssue(issues, path, 'invalid_number', 'Value must be a finite number.');
    return false;
  }

  return true;
}

function validateRange(
  issues: CurrentWeatherValidationIssue[],
  path: string,
  value: number,
  minimum: number,
  maximum: number,
) {
  if (!validateFiniteNumber(issues, path, value)) {
    return;
  }

  if (value < minimum || value > maximum) {
    addIssue(issues, path, 'out_of_range', `Value must be between ${minimum} and ${maximum}.`);
  }
}

function validateNonNegative(issues: CurrentWeatherValidationIssue[], path: string, value: number) {
  if (!validateFiniteNumber(issues, path, value)) {
    return;
  }

  if (value < 0) {
    addIssue(issues, path, 'out_of_range', 'Value must be zero or greater.');
  }
}

function isZonedTimestamp(value: ZonedDateTimeString) {
  return zonedTimestampPattern.test(value) && Number.isFinite(Date.parse(value));
}

function validateTimestamp(
  issues: CurrentWeatherValidationIssue[],
  path: string,
  value: ZonedDateTimeString,
) {
  if (!isZonedTimestamp(value)) {
    addIssue(
      issues,
      path,
      'invalid_timestamp',
      'Timestamp must be valid ISO 8601 with Z or an explicit UTC offset.',
    );
  }
}

function validateTimeZone(issues: CurrentWeatherValidationIssue[], path: string, value: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
  } catch {
    addIssue(issues, path, 'invalid_timezone', 'Value must be a valid IANA time zone.');
  }
}

function validateRequiredText(
  issues: CurrentWeatherValidationIssue[],
  path: string,
  value: string,
) {
  if (value.trim().length === 0) {
    addIssue(issues, path, 'empty_value', 'Value must not be empty.');
  }
}

export function validateCurrentWeather(weather: CurrentWeather): CurrentWeatherValidationResult {
  const issues: CurrentWeatherValidationIssue[] = [];

  validateTimestamp(issues, 'observedAt', weather.observedAt);
  validateRequiredText(issues, 'location.name', weather.location.name);
  validateTimeZone(issues, 'location.timeZone', weather.location.timeZone);

  if (
    weather.location.countryCode !== undefined &&
    !/^[A-Z]{2}$/.test(weather.location.countryCode)
  ) {
    addIssue(
      issues,
      'location.countryCode',
      'invalid_value',
      'Country code must contain two uppercase ISO letters.',
    );
  }

  if (weather.location.coordinates !== undefined) {
    validateRange(
      issues,
      'location.coordinates.latitude',
      weather.location.coordinates.latitude,
      -90,
      90,
    );
    validateRange(
      issues,
      'location.coordinates.longitude',
      weather.location.coordinates.longitude,
      -180,
      180,
    );
  }

  if (!isWeatherCondition(weather.condition)) {
    addIssue(issues, 'condition', 'invalid_value', 'Condition must be canonical.');
  }

  if (!dayPhaseSet.has(weather.daylight.phase)) {
    addIssue(issues, 'daylight.phase', 'invalid_value', 'Day phase must be canonical.');
  }

  if (weather.daylight.phase === 'day' && weather.daylight.isDay !== true) {
    addIssue(issues, 'daylight', 'inconsistent_value', 'Day phase must set isDay to true.');
  }

  if (weather.daylight.phase === 'night' && weather.daylight.isDay !== false) {
    addIssue(issues, 'daylight', 'inconsistent_value', 'Night phase must set isDay to false.');
  }

  validateFiniteNumber(issues, 'temperature.valueCelsius', weather.temperature.valueCelsius);
  validateFiniteNumber(
    issues,
    'temperature.feelsLikeCelsius',
    weather.temperature.feelsLikeCelsius,
  );

  if (weather.temperature.minCelsius !== undefined) {
    validateFiniteNumber(issues, 'temperature.minCelsius', weather.temperature.minCelsius);
  }
  if (weather.temperature.maxCelsius !== undefined) {
    validateFiniteNumber(issues, 'temperature.maxCelsius', weather.temperature.maxCelsius);
  }
  if (weather.temperature.dewPointCelsius !== undefined) {
    validateFiniteNumber(
      issues,
      'temperature.dewPointCelsius',
      weather.temperature.dewPointCelsius,
    );
  }
  if (
    weather.temperature.minCelsius !== undefined &&
    weather.temperature.maxCelsius !== undefined &&
    weather.temperature.minCelsius > weather.temperature.maxCelsius
  ) {
    addIssue(
      issues,
      'temperature',
      'inconsistent_value',
      'Minimum temperature must not exceed maximum temperature.',
    );
  }

  validateRange(issues, 'humidityPercent', weather.humidityPercent, 0, 100);

  if (weather.pressureHectopascals !== undefined) {
    validateRange(issues, 'pressureHectopascals', weather.pressureHectopascals, 1, 2000);
  }
  if (weather.visibilityMeters !== undefined) {
    validateNonNegative(issues, 'visibilityMeters', weather.visibilityMeters);
  }
  if (weather.cloudCoverPercent !== undefined) {
    validateRange(issues, 'cloudCoverPercent', weather.cloudCoverPercent, 0, 100);
  }

  validateNonNegative(issues, 'wind.speedMetersPerSecond', weather.wind.speedMetersPerSecond);
  if (weather.wind.gustMetersPerSecond !== undefined) {
    validateNonNegative(issues, 'wind.gustMetersPerSecond', weather.wind.gustMetersPerSecond);
    if (weather.wind.gustMetersPerSecond < weather.wind.speedMetersPerSecond) {
      addIssue(
        issues,
        'wind.gustMetersPerSecond',
        'inconsistent_value',
        'Gust speed must not be lower than sustained wind speed.',
      );
    }
  }
  if (weather.wind.directionDegrees !== undefined) {
    validateRange(issues, 'wind.directionDegrees', weather.wind.directionDegrees, 0, 359.999);
  }
  if (weather.wind.direction !== undefined && !windDirectionSet.has(weather.wind.direction)) {
    addIssue(issues, 'wind.direction', 'invalid_value', 'Wind direction must be canonical.');
  }

  if (weather.precipitation !== undefined) {
    const precipitation = weather.precipitation;

    if (!precipitationTypeSet.has(precipitation.type)) {
      addIssue(
        issues,
        'precipitation.type',
        'invalid_value',
        'Precipitation type must be canonical.',
      );
    }
    if (precipitation.probability !== undefined) {
      validateRange(issues, 'precipitation.probability', precipitation.probability, 0, 1);
    }
    if (precipitation.amountMillimeters !== undefined) {
      validateNonNegative(
        issues,
        'precipitation.amountMillimeters',
        precipitation.amountMillimeters,
      );
    }
    if (
      precipitation.intensity !== undefined &&
      !precipitationIntensitySet.has(precipitation.intensity)
    ) {
      addIssue(
        issues,
        'precipitation.intensity',
        'invalid_value',
        'Precipitation intensity must be canonical.',
      );
    }
    if (
      precipitation.type === 'none' &&
      precipitation.intensity !== undefined &&
      precipitation.intensity !== 'none'
    ) {
      addIssue(
        issues,
        'precipitation',
        'inconsistent_value',
        'Dry precipitation cannot have an active intensity.',
      );
    }
    if (precipitation.type === 'none' && (precipitation.amountMillimeters ?? 0) > 0) {
      addIssue(
        issues,
        'precipitation',
        'inconsistent_value',
        'Dry precipitation cannot have a positive amount.',
      );
    }
    if (precipitation.type !== 'none' && precipitation.intensity === 'none') {
      addIssue(
        issues,
        'precipitation',
        'inconsistent_value',
        'Active precipitation cannot use the none intensity.',
      );
    }
  }

  if (weather.uv !== undefined) {
    validateNonNegative(issues, 'uv.index', weather.uv.index);
    if (weather.uv.maxToday !== undefined) {
      validateNonNegative(issues, 'uv.maxToday', weather.uv.maxToday);
      if (weather.uv.maxToday < weather.uv.index) {
        addIssue(
          issues,
          'uv.maxToday',
          'inconsistent_value',
          'Daily maximum UV must not be below the current UV index.',
        );
      }
    }
    if (weather.uv.category !== undefined && !uvCategorySet.has(weather.uv.category)) {
      addIssue(issues, 'uv.category', 'invalid_value', 'UV category must be canonical.');
    }
  }

  if (weather.airQuality !== undefined) {
    validateNonNegative(issues, 'airQuality.index', weather.airQuality.index);
    if (weather.airQuality.scale !== undefined) {
      validateRequiredText(issues, 'airQuality.scale', weather.airQuality.scale);
    }
    if (
      weather.airQuality.category !== undefined &&
      !airQualityCategorySet.has(weather.airQuality.category)
    ) {
      addIssue(
        issues,
        'airQuality.category',
        'invalid_value',
        'Air-quality category must be canonical.',
      );
    }
    if (weather.airQuality.category !== undefined && weather.airQuality.scale === undefined) {
      addIssue(
        issues,
        'airQuality.scale',
        'inconsistent_value',
        'A scale is required when an air-quality category is supplied.',
      );
    }
    if (weather.airQuality.pollutants !== undefined) {
      for (const [name, value] of Object.entries(weather.airQuality.pollutants)) {
        if (value !== undefined) {
          validateNonNegative(issues, `airQuality.pollutants.${name}`, value);
        }
      }
    }
  }

  if (weather.sun !== undefined) {
    validateTimestamp(issues, 'sun.sunrise', weather.sun.sunrise);
    validateTimestamp(issues, 'sun.sunset', weather.sun.sunset);
  }

  if (weather.moon !== undefined) {
    if (!moonPhaseSet.has(weather.moon.phase)) {
      addIssue(issues, 'moon.phase', 'invalid_value', 'Moon phase must be canonical.');
    }
    if (weather.moon.illumination !== undefined) {
      validateRange(issues, 'moon.illumination', weather.moon.illumination, 0, 1);
    }
    if (weather.moon.moonrise !== undefined) {
      validateTimestamp(issues, 'moon.moonrise', weather.moon.moonrise);
    }
    if (weather.moon.moonset !== undefined) {
      validateTimestamp(issues, 'moon.moonset', weather.moon.moonset);
    }
  }

  if (weather.alerts !== undefined) {
    const alertIds = new Set<string>();

    weather.alerts.forEach((alert, index) => {
      const path = `alerts.${index}`;
      validateRequiredText(issues, `${path}.id`, alert.id);
      validateRequiredText(issues, `${path}.type`, alert.type);
      validateRequiredText(issues, `${path}.title`, alert.title);

      if (alertIds.has(alert.id)) {
        addIssue(issues, `${path}.id`, 'duplicate_id', 'Alert IDs must be unique.');
      }
      alertIds.add(alert.id);

      if (!alertSeveritySet.has(alert.severity)) {
        addIssue(issues, `${path}.severity`, 'invalid_value', 'Alert severity must be canonical.');
      }

      if (alert.startsAt !== undefined) {
        validateTimestamp(issues, `${path}.startsAt`, alert.startsAt);
      }
      if (alert.endsAt !== undefined) {
        validateTimestamp(issues, `${path}.endsAt`, alert.endsAt);
      }
      if (
        alert.startsAt !== undefined &&
        alert.endsAt !== undefined &&
        isZonedTimestamp(alert.startsAt) &&
        isZonedTimestamp(alert.endsAt) &&
        Date.parse(alert.endsAt) < Date.parse(alert.startsAt)
      ) {
        addIssue(
          issues,
          path,
          'inconsistent_value',
          'Alert end time must not precede its start time.',
        );
      }
    });
  }

  return issues.length === 0 ? { valid: true, issues: [] } : { valid: false, issues };
}

export function assertValidCurrentWeather(weather: CurrentWeather): void {
  const result = validateCurrentWeather(weather);

  if (!result.valid) {
    const summary = result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    throw new Error(`Invalid CurrentWeather: ${summary}`);
  }
}
