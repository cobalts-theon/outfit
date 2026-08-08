import { describe, expect, it } from '@jest/globals';

import {
  normalizeCoordinates,
  selectDevicePosition,
  stateFromLocationPermission,
  type DevicePosition,
} from '@/features/locations/domain/location';

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
      source: 'current',
    } as const satisfies DevicePosition;

    const selected = selectDevicePosition(position);

    expect(selected).toMatchObject({
      coordinates: position.coordinates,
      source: 'device',
      accuracyMeters: 20,
    });
    expect(selected.selectedAt).not.toBe(position.observedAt);
  });
});
