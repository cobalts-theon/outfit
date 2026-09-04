import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as ExpoLocation from 'expo-location';

import {
  acquireDevicePosition,
  checkForegroundLocationPermission,
  formatReverseGeocodedPlace,
  mapExpoPermissionResponse,
  normalizeExpoPosition,
  requestForegroundLocationPermission,
  resolveDevicePlaceName,
} from '@/services/location/expo-location-service';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  PermissionStatus: {
    DENIED: 'denied',
    GRANTED: 'granted',
    UNDETERMINED: 'undetermined',
  },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

const getPermissionMock = jest.mocked(ExpoLocation.getForegroundPermissionsAsync);
const requestPermissionMock = jest.mocked(ExpoLocation.requestForegroundPermissionsAsync);
const hasServicesMock = jest.mocked(ExpoLocation.hasServicesEnabledAsync);
const getCurrentPositionMock = jest.mocked(ExpoLocation.getCurrentPositionAsync);
const getLastKnownPositionMock = jest.mocked(ExpoLocation.getLastKnownPositionAsync);
const reverseGeocodeMock = jest.mocked(ExpoLocation.reverseGeocodeAsync);

function permission(
  status: ExpoLocation.PermissionStatus,
  options: {
    readonly canAskAgain?: boolean;
    readonly granted?: boolean;
    readonly iosAccuracy?: 'full' | 'reduced';
    readonly androidAccuracy?: 'fine' | 'coarse' | 'none';
  } = {},
): ExpoLocation.LocationPermissionResponse {
  return {
    status,
    canAskAgain: options.canAskAgain ?? status !== ExpoLocation.PermissionStatus.DENIED,
    granted: options.granted ?? status === ExpoLocation.PermissionStatus.GRANTED,
    expires: 'never',
    ios:
      options.iosAccuracy === undefined
        ? undefined
        : { accuracy: options.iosAccuracy, scope: 'whenInUse' },
    android:
      options.androidAccuracy === undefined
        ? undefined
        : { accuracy: options.androidAccuracy },
  };
}

function platformPosition(
  latitude = 10.7769,
  longitude = 106.7009,
  timestamp = Date.parse('2026-08-06T08:00:00.000Z'),
): ExpoLocation.LocationObject {
  return {
    coords: {
      latitude,
      longitude,
      accuracy: 18,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp,
    mocked: false,
  };
}

beforeEach(() => {
  jest.useRealTimers();
  jest.resetAllMocks();
  hasServicesMock.mockResolvedValue(true);
  getLastKnownPositionMock.mockResolvedValue(null);
  reverseGeocodeMock.mockResolvedValue([
    {
      city: 'Thành phố Hồ Chí Minh',
      country: 'Việt Nam',
      district: 'Quận 1',
      formattedAddress: null,
      isoCountryCode: 'VN',
      name: null,
      postalCode: null,
      region: 'Thành phố Hồ Chí Minh',
      street: null,
      streetNumber: null,
      subregion: null,
      timezone: null,
    },
  ]);
});

describe('Expo Location permission boundary', () => {
  it('maps undetermined, denied, precise, and approximate results', () => {
    expect(mapExpoPermissionResponse(permission(ExpoLocation.PermissionStatus.UNDETERMINED))).toEqual({
      status: 'prompt',
      canAskAgain: true,
    });
    expect(
      mapExpoPermissionResponse(
        permission(ExpoLocation.PermissionStatus.DENIED, { canAskAgain: false }),
      ),
    ).toEqual({ status: 'denied', canAskAgain: false });
    expect(
      mapExpoPermissionResponse(
        permission(ExpoLocation.PermissionStatus.GRANTED, { iosAccuracy: 'full' }),
      ),
    ).toEqual({ status: 'granted', accuracy: 'precise' });
    expect(
      mapExpoPermissionResponse(
        permission(ExpoLocation.PermissionStatus.GRANTED, { androidAccuracy: 'coarse' }),
      ),
    ).toEqual({ status: 'granted', accuracy: 'approximate' });
  });

  it('keeps permission checking and requesting separate', async () => {
    getPermissionMock.mockResolvedValue(
      permission(ExpoLocation.PermissionStatus.UNDETERMINED),
    );
    requestPermissionMock.mockResolvedValue(
      permission(ExpoLocation.PermissionStatus.DENIED, { canAskAgain: true }),
    );

    await expect(checkForegroundLocationPermission()).resolves.toEqual({
      ok: true,
      permission: { status: 'prompt', canAskAgain: true },
    });
    await expect(requestForegroundLocationPermission()).resolves.toEqual({
      ok: true,
      permission: { status: 'denied', canAskAgain: true },
    });
    expect(getCurrentPositionMock).not.toHaveBeenCalled();
  });

  it('maps permission API failures to an explicit unavailable result', async () => {
    getPermissionMock.mockRejectedValue(new Error('native module unavailable'));
    requestPermissionMock.mockRejectedValue(new Error('request unavailable'));

    await expect(checkForegroundLocationPermission()).resolves.toMatchObject({ ok: false });
    await expect(requestForegroundLocationPermission()).resolves.toMatchObject({ ok: false });
  });
});

describe('Expo Location position boundary', () => {
  it('builds a concise place label and removes duplicate administrative names', () => {
    expect(
      formatReverseGeocodedPlace({
        district: 'Quận 1',
        city: 'Thành phố Hồ Chí Minh',
        region: 'Thành phố Hồ Chí Minh',
        name: null,
        country: 'Việt Nam',
      }),
    ).toBe('Quận 1 · Thành phố Hồ Chí Minh');
    expect(
      formatReverseGeocodedPlace({
        district: null,
        city: 'Đà Nẵng',
        region: 'Đà Nẵng',
        name: '159',
        country: 'Việt Nam',
      }),
    ).toBe('Đà Nẵng');
    expect(
      formatReverseGeocodedPlace({
        district: null,
        city: null,
        region: null,
        name: null,
        country: null,
      }),
    ).toBeUndefined();
  });

  it('normalizes platform coordinates without leaking Expo objects', () => {
    expect(normalizeExpoPosition(platformPosition(), 'current')).toEqual({
      coordinates: { latitude: 10.7769, longitude: 106.7009 },
      observedAt: '2026-08-06T08:00:00.000Z',
      accuracyMeters: 18,
      source: 'current',
      isMocked: false,
    });
  });

  it('rejects malformed platform positions', () => {
    expect(normalizeExpoPosition(platformPosition(95, 106.7), 'current')).toBeNull();
    expect(
      normalizeExpoPosition(platformPosition(10.7, 106.7, Number.MAX_VALUE), 'current'),
    ).toBeNull();
  });

  it('returns a current position immediately when services and coordinates are valid', async () => {
    getCurrentPositionMock.mockResolvedValue(platformPosition());

    await expect(acquireDevicePosition()).resolves.toMatchObject({
      ok: true,
      position: { source: 'current' },
    });
    expect(getCurrentPositionMock).toHaveBeenCalledWith({ accuracy: ExpoLocation.Accuracy.Balanced });
    expect(getLastKnownPositionMock).not.toHaveBeenCalled();
    expect(reverseGeocodeMock).not.toHaveBeenCalled();
  });

  it('resolves a place label separately from position acquisition', async () => {
    await expect(
      resolveDevicePlaceName({ latitude: 10.7769, longitude: 106.7009 }),
    ).resolves.toBe('Quận 1 · Thành phố Hồ Chí Minh');
    expect(reverseGeocodeMock).toHaveBeenCalledWith({
      latitude: 10.7769,
      longitude: 106.7009,
    });
  });

  it('keeps reverse-geocoding failure separate from valid GPS acquisition', async () => {
    reverseGeocodeMock.mockRejectedValue(new Error('geocoder unavailable'));

    await expect(
      resolveDevicePlaceName({ latitude: 10.7769, longitude: 106.7009 }),
    ).resolves.toBeUndefined();
  });

  it('falls back to a bounded last-known position after current acquisition fails', async () => {
    getCurrentPositionMock.mockRejectedValue(new Error('position unavailable'));
    getLastKnownPositionMock.mockResolvedValue(platformPosition());

    await expect(acquireDevicePosition()).resolves.toMatchObject({
      ok: true,
      position: { source: 'last_known' },
      fallbackReason: 'current_error',
    });
    expect(getLastKnownPositionMock).toHaveBeenCalledWith({
      maxAge: 900_000,
      requiredAccuracy: 5_000,
    });
  });

  it('uses last-known position when services are unavailable and reports failure otherwise', async () => {
    hasServicesMock.mockResolvedValue(false);
    getLastKnownPositionMock.mockResolvedValueOnce(platformPosition()).mockResolvedValueOnce(null);

    await expect(acquireDevicePosition()).resolves.toMatchObject({
      ok: true,
      position: { source: 'last_known' },
      fallbackReason: 'services_unavailable',
    });
    await expect(acquireDevicePosition()).resolves.toEqual({
      ok: false,
      code: 'services_unavailable',
      message: 'Dịch vụ vị trí đang tắt hoặc không khả dụng.',
    });
  });

  it('maps a timed-out current request after fallback is exhausted', async () => {
    jest.useFakeTimers();
    getCurrentPositionMock.mockImplementation(() => new Promise(() => undefined));

    const resultPromise = acquireDevicePosition({ currentPositionTimeoutMs: 100 });
    await jest.advanceTimersByTimeAsync(100);

    await expect(resultPromise).resolves.toEqual({
      ok: false,
      code: 'timeout',
      message: 'Yêu cầu vị trí mất quá nhiều thời gian.',
    });
  });

  it('maps invalid current and fallback positions to an explicit error', async () => {
    getCurrentPositionMock.mockResolvedValue(platformPosition(95, 200));
    getLastKnownPositionMock.mockResolvedValue(platformPosition(-95, -200));

    await expect(acquireDevicePosition()).resolves.toEqual({
      ok: false,
      code: 'invalid_position',
      message: 'Thiết bị trả về tọa độ không hợp lệ.',
    });
  });

  it('maps service-status failures without attempting position acquisition', async () => {
    hasServicesMock.mockRejectedValue(new Error('provider unavailable'));

    await expect(acquireDevicePosition()).resolves.toEqual({
      ok: false,
      code: 'unexpected',
      message: 'Không thể kiểm tra dịch vụ vị trí.',
    });
    expect(getCurrentPositionMock).not.toHaveBeenCalled();
  });
});
