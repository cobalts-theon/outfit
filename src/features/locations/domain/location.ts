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
  | {
      readonly status: 'granted';
      readonly accuracy: LocationPermissionAccuracy;
    }
  | {
      readonly status: 'denied';
      readonly canAskAgain: boolean;
    };

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
  | {
      readonly status: 'permission_denied';
      readonly canAskAgain: boolean;
    }
  | {
      readonly status: 'permission_unavailable';
      readonly message: string;
    }
  | { readonly status: 'services_unavailable' }
  | {
      readonly status: 'acquisition_error';
      readonly code: LocationAcquisitionErrorCode;
      readonly message: string;
    };

export function normalizeCoordinates(
  latitude: number,
  longitude: number,
): AppCoordinates | null {
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
