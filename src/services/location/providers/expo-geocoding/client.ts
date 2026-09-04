import * as ExpoLocation from 'expo-location';
import { Platform } from 'react-native';

import type { ManualLocationCandidate } from '@/features/locations/domain/manual-location';
import { normalizeCoordinates } from '@/features/locations/domain/location';

const NATIVE_GEOCODING_TIMEOUT_MS = 8_000;

class NativeGeocodingTimeoutError extends Error {
  constructor() {
    super('Native forward geocoding timed out.');
    this.name = 'NativeGeocodingTimeoutError';
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => reject(new NativeGeocodingTimeoutError()), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

/**
 * Android fallback for devices whose native HTTP stack cannot complete the
 * Open-Meteo Geocoding TLS handshake. It never asks for permission itself.
 */
export async function searchExpoGeocodedLocations(
  query: string,
): Promise<readonly ManualLocationCandidate[] | undefined> {
  const normalizedQuery = query.trim();
  if (Platform.OS !== 'android' || normalizedQuery.length < 2) return undefined;

  const permission = await ExpoLocation.getForegroundPermissionsAsync();
  if (!permission.granted) return undefined;

  const results = await withTimeout(
    ExpoLocation.geocodeAsync(normalizedQuery),
    NATIVE_GEOCODING_TIMEOUT_MS,
  );

  return results.slice(0, 5).flatMap((result, index) => {
    const coordinates = normalizeCoordinates(result.latitude, result.longitude);
    if (coordinates === null) return [];

    return [
      {
        id: `expo-geocoder:${coordinates.latitude},${coordinates.longitude}:${index}`,
        label: normalizedQuery,
        context: 'Kết quả địa danh từ hệ thống Android',
        selectionLabel: normalizedQuery,
        coordinates,
      },
    ];
  });
}
