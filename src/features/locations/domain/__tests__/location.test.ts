import { describe, expect, it } from '@jest/globals';

import {
  normalizeCoordinates,
  selectDevicePosition,
  stateFromLocationPermission,
  type DevicePosition,
} from '@/features/locations/domain/location';
import { createManualSelectedLocation } from '@/features/locations/domain/manual-location';

describe('normalized location domain', () => {
  it('accepts valid geographic boundaries', () => {
    expect(normalizeCoordinates(-90, -180)).toEqual({ latitude: -90, longitude: -180 });
    expect(normalizeCoordinates(90, 180)).toEqual({ latitude: 90, longitude: 180 });
    expect(normalizeCoordinates(10.7769, 106.7009)).toEqual({
      latitude: 10.7769,
      longitude: 106.7009,
    });
  });

  it.each([
    [91, 0],
    [-91, 0],
    [0, 181],
    [0, -181],
    [Number.NaN, 0],
    [0, Number.POSITIVE_INFINITY],
  ])('rejects invalid coordinates (%s, %s)', (latitude, longitude) => {
    expect(normalizeCoordinates(latitude, longitude)).toBeNull();
  });

  it('maps denied permission without blocking the rest of the application', () => {
    expect(stateFromLocationPermission({ status: 'denied', canAskAgain: true })).toEqual({
      status: 'permission_denied',
      canAskAgain: true,
    });
    expect(stateFromLocationPermission({ status: 'denied', canAskAgain: false })).toEqual({
      status: 'permission_denied',
      canAskAgain: false,
    });
  });

  it('maps permission lifecycle results into explicit capability states', () => {
    expect(stateFromLocationPermission({ status: 'prompt', canAskAgain: true })).toEqual({
      status: 'permission_required',
    });
    expect(
      stateFromLocationPermission({ status: 'granted', accuracy: 'approximate' }),
    ).toEqual({ status: 'acquiring_position' });
    expect(stateFromLocationPermission({ status: 'unknown' })).toEqual({
      status: 'permission_unavailable',
      message: 'Không thể xác định trạng thái quyền vị trí.',
    });
  });

  it('keeps a selected location separate from the acquired device position', () => {
    const position = {
      coordinates: { latitude: 10.7769, longitude: 106.7009 },
      observedAt: '2026-08-06T08:00:00.000Z',
      accuracyMeters: 20,
      placeName: 'Quận 1 · Thành phố Hồ Chí Minh',
      source: 'current',
    } as const satisfies DevicePosition;

    const selected = selectDevicePosition(position);

    expect(selected).toMatchObject({
      coordinates: position.coordinates,
      source: 'device',
      accuracyMeters: 20,
      label: 'Quận 1 · Thành phố Hồ Chí Minh',
    });
    expect(selected.selectedAt).not.toBe(position.observedAt);
  });

  it('creates a manual location without requiring a device position', () => {
    const selected = createManualSelectedLocation({
      label: 'Đà Lạt · Lâm Đồng · Việt Nam',
      coordinates: { latitude: 11.9404, longitude: 108.4583 },
    });

    expect(selected).toMatchObject({
      source: 'manual',
      label: 'Đà Lạt · Lâm Đồng · Việt Nam',
      coordinates: { latitude: 11.9404, longitude: 108.4583 },
    });
  });

  it('rejects invalid manual locations before they reach application state', () => {
    expect(() =>
      createManualSelectedLocation({
        label: '   ',
        coordinates: { latitude: 91, longitude: 108.4583 },
      }),
    ).toThrow('Địa điểm thủ công không hợp lệ.');
  });
});
