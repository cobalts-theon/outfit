import * as ExpoLocation from 'expo-location';

import {
  normalizeCoordinates,
  type DevicePosition,
  type DevicePositionSource,
  type LocationAcquisitionErrorCode,
  type LocationFallbackReason,
  type LocationPermission,
  type LocationPermissionAccuracy,
} from '@/features/locations/domain/location';

const DEFAULT_CURRENT_POSITION_TIMEOUT_MS = 12_000;
const DEFAULT_LAST_KNOWN_MAX_AGE_MS = 15 * 60 * 1_000;
const DEFAULT_LAST_KNOWN_REQUIRED_ACCURACY_METERS = 5_000;

export interface LocationAcquisitionOptions {
  readonly currentPositionTimeoutMs?: number;
  readonly lastKnownMaxAgeMs?: number;
  readonly lastKnownRequiredAccuracyMeters?: number;
}

export type LocationPermissionOperationResult =
  | { readonly ok: true; readonly permission: LocationPermission }
  | { readonly ok: false; readonly message: string };

export type LocationAcquisitionResult =
  | {
      readonly ok: true;
      readonly position: DevicePosition;
      readonly fallbackReason?: LocationFallbackReason;
    }
  | {
      readonly ok: false;
      readonly code: LocationAcquisitionErrorCode | 'services_unavailable';
      readonly message: string;
    };

class CurrentPositionTimeoutError extends Error {
  constructor() {
    super('Current position request timed out.');
    this.name = 'CurrentPositionTimeoutError';
  }
}

function permissionAccuracy(
  response: ExpoLocation.LocationPermissionResponse,
): LocationPermissionAccuracy {
  if (response.ios?.accuracy === 'reduced' || response.android?.accuracy === 'coarse') {
    return 'approximate';
  }

  if (response.ios?.accuracy === 'full' || response.android?.accuracy === 'fine') {
    return 'precise';
  }

  return 'unknown';
}

export function mapExpoPermissionResponse(
  response: ExpoLocation.LocationPermissionResponse,
): LocationPermission {
  if (response.status === ExpoLocation.PermissionStatus.GRANTED || response.granted) {
    return { status: 'granted', accuracy: permissionAccuracy(response) };
  }

  if (response.status === ExpoLocation.PermissionStatus.UNDETERMINED) {
    return { status: 'prompt', canAskAgain: true };
  }

  if (response.status === ExpoLocation.PermissionStatus.DENIED) {
    return { status: 'denied', canAskAgain: response.canAskAgain };
  }

  return { status: 'unknown' };
}

export function normalizeExpoPosition(
  location: ExpoLocation.LocationObject,
  source: DevicePositionSource,
): DevicePosition | null {
  const coordinates = normalizeCoordinates(location.coords.latitude, location.coords.longitude);
  const observedAt = new Date(location.timestamp);

  if (
    coordinates === null ||
    !Number.isFinite(location.timestamp) ||
    Number.isNaN(observedAt.getTime())
  ) {
    return null;
  }

  const accuracy = location.coords.accuracy;

  return {
    coordinates,
    observedAt: observedAt.toISOString(),
    accuracyMeters:
      accuracy === null || !Number.isFinite(accuracy) || accuracy < 0 ? undefined : accuracy,
    source,
    isMocked: location.mocked,
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new CurrentPositionTimeoutError()), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

async function readLastKnownPosition(
  options: Required<Pick<
    LocationAcquisitionOptions,
    'lastKnownMaxAgeMs' | 'lastKnownRequiredAccuracyMeters'
  >>,
): Promise<DevicePosition | null> {
  try {
    const location = await ExpoLocation.getLastKnownPositionAsync({
      maxAge: options.lastKnownMaxAgeMs,
      requiredAccuracy: options.lastKnownRequiredAccuracyMeters,
    });

    return location === null ? null : normalizeExpoPosition(location, 'last_known');
  } catch {
    return null;
  }
}

export async function checkForegroundLocationPermission(): Promise<LocationPermissionOperationResult> {
  try {
    const response = await ExpoLocation.getForegroundPermissionsAsync();
    return { ok: true, permission: mapExpoPermissionResponse(response) };
  } catch {
    return {
      ok: false,
      message: 'Không thể kiểm tra quyền vị trí trên thiết bị này.',
    };
  }
}

export async function requestForegroundLocationPermission(): Promise<LocationPermissionOperationResult> {
  try {
    const response = await ExpoLocation.requestForegroundPermissionsAsync();
    return { ok: true, permission: mapExpoPermissionResponse(response) };
  } catch {
    return {
      ok: false,
      message: 'Không thể yêu cầu quyền vị trí trên thiết bị này.',
    };
  }
}

export async function acquireDevicePosition(
  options: LocationAcquisitionOptions = {},
): Promise<LocationAcquisitionResult> {
  const currentPositionTimeoutMs =
    options.currentPositionTimeoutMs ?? DEFAULT_CURRENT_POSITION_TIMEOUT_MS;
  const fallbackOptions = {
    lastKnownMaxAgeMs: options.lastKnownMaxAgeMs ?? DEFAULT_LAST_KNOWN_MAX_AGE_MS,
    lastKnownRequiredAccuracyMeters:
      options.lastKnownRequiredAccuracyMeters ??
      DEFAULT_LAST_KNOWN_REQUIRED_ACCURACY_METERS,
  };

  try {
    const servicesEnabled = await ExpoLocation.hasServicesEnabledAsync();

    if (!servicesEnabled) {
      const fallback = await readLastKnownPosition(fallbackOptions);

      return fallback === null
        ? {
            ok: false,
            code: 'services_unavailable',
            message: 'Dịch vụ vị trí đang tắt hoặc không khả dụng.',
          }
        : { ok: true, position: fallback, fallbackReason: 'services_unavailable' };
    }
  } catch {
    return {
      ok: false,
      code: 'unexpected',
      message: 'Không thể kiểm tra dịch vụ vị trí.',
    };
  }

  let failureCode: LocationAcquisitionErrorCode = 'position_unavailable';
  let fallbackReason: LocationFallbackReason = 'current_error';

  try {
    const location = await withTimeout(
      ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced }),
      currentPositionTimeoutMs,
    );
    const position = normalizeExpoPosition(location, 'current');

    if (position !== null) {
      return { ok: true, position };
    }

    failureCode = 'invalid_position';
    fallbackReason = 'current_invalid';
  } catch (error) {
    if (error instanceof CurrentPositionTimeoutError) {
      failureCode = 'timeout';
      fallbackReason = 'current_timeout';
    }
  }

  const fallback = await readLastKnownPosition(fallbackOptions);

  if (fallback !== null) {
    return { ok: true, position: fallback, fallbackReason };
  }

  const messages: Record<LocationAcquisitionErrorCode, string> = {
    timeout: 'Yêu cầu vị trí mất quá nhiều thời gian.',
    position_unavailable: 'Không thể lấy vị trí hiện tại.',
    invalid_position: 'Thiết bị trả về tọa độ không hợp lệ.',
    unexpected: 'Đã xảy ra lỗi vị trí không xác định.',
  };

  return { ok: false, code: failureCode, message: messages[failureCode] };
}

export const expoLocationService = {
  checkPermission: checkForegroundLocationPermission,
  requestPermission: requestForegroundLocationPermission,
  acquirePosition: acquireDevicePosition,
} as const;
