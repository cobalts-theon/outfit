/**
 * Thao tác vị trí: xin quyền, lấy GPS, tìm địa danh và lưu địa điểm.
 * Chuẩn hóa kết quả để phần giao diện dùng cùng một cấu trúc.
 */
import * as ExpoLocation from 'expo-location';
import {
  normalizeCoordinates, type DevicePosition, type DevicePositionSource, type LocationAcquisitionErrorCode, type LocationFallbackReason, type LocationPermission,
  type LocationPermissionAccuracy, type ManualLocationCandidate, type ManualLocationSelection,
} from '@/utils/validation';
import { Platform } from 'react-native';
import type { Tables } from '@/types/database';
import { requireSupabaseClient } from '@/services/supabase';

// expo-location-service

const DEFAULT_CURRENT_POSITION_TIMEOUT_MS = 12_000;

const DEFAULT_LAST_KNOWN_MAX_AGE_MS = 15 * 60 * 1_000;

const DEFAULT_LAST_KNOWN_REQUIRED_ACCURACY_METERS = 5_000;

const REVERSE_GEOCODE_TIMEOUT_MS = 2_500;

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
  // Khởi tạo lỗi và thông tin đi kèm.
  constructor() {
    super('Current position request timed out.');
    this.name = 'CurrentPositionTimeoutError';
  }
}

// Xác định mức chính xác của quyền vị trí.
function permissionAccuracy(response: ExpoLocation.LocationPermissionResponse): LocationPermissionAccuracy {
  if (response.ios?.accuracy === 'reduced' || response.android?.accuracy === 'coarse') {
    return 'approximate';
  }

  if (response.ios?.accuracy === 'full' || response.android?.accuracy === 'fine') {
    return 'precise';
  }

  return 'unknown';
}

// Chuẩn hóa quyền vị trí từ Expo.
export function mapExpoPermissionResponse(response: ExpoLocation.LocationPermissionResponse): LocationPermission {
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

// Chuẩn hóa tọa độ thiết bị trả về.
export function normalizeExpoPosition(location: ExpoLocation.LocationObject, source: DevicePositionSource): DevicePosition | null {
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

// Ghép tên địa điểm từ dữ liệu tọa độ.
export function formatReverseGeocodedPlace(
  address: Pick<
    ExpoLocation.LocationGeocodedAddress,
    'city' | 'country' | 'district' | 'name' | 'region'
  >,
): string | undefined {
  // Loại bỏ tên địa điểm trùng nhau.
  const uniqueNames = (candidates: readonly (string | null)[]) => {
    const names: string[] = [];

    for (const candidate of candidates) {
      const name = candidate?.trim();
      if (
        name &&
        !names.some((existing) => existing.localeCompare(name, 'vi', { sensitivity: 'base' }) === 0)
      ) {
        names.push(name);
      }
      if (names.length === 2) break;
    }

    return names;
  };

  const administrativeNames = uniqueNames([address.district, address.city, address.region]);
  if (administrativeNames.length > 0) return administrativeNames.join(' · ');

  const placeName = address.name?.trim();
  const fallbackNames = uniqueNames([placeName && /\p{L}/u.test(placeName) ? placeName : null, address.country]);

  return fallbackNames.length === 0 ? undefined : fallbackNames.join(' · ');
}

// Giới hạn thời gian lấy vị trí.
async function expoLocationServiceWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
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

// Tìm tên địa điểm theo tọa độ thiết bị.
export async function resolveDevicePlaceName(coordinates: DevicePosition['coordinates']): Promise<string | undefined> {
  try {
    const addresses = await expoLocationServiceWithTimeout(ExpoLocation.reverseGeocodeAsync(coordinates), REVERSE_GEOCODE_TIMEOUT_MS);
    return addresses[0] && formatReverseGeocodedPlace(addresses[0]);
  } catch {
    return undefined;
  }
}

// Đọc vị trí gần nhất còn phù hợp.
async function readLastKnownPosition(
  options: Required<
    Pick<LocationAcquisitionOptions, 'lastKnownMaxAgeMs' | 'lastKnownRequiredAccuracyMeters'>
  >,
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

// Kiểm tra quyền vị trí khi dùng app.
export async function checkForegroundLocationPermission(): Promise<LocationPermissionOperationResult> {
  try {
    const response = await ExpoLocation.getForegroundPermissionsAsync();
    return { ok: true, permission: mapExpoPermissionResponse(response) };
  } catch {
    return { ok: false, message: 'Không thể kiểm tra quyền vị trí trên thiết bị này.' };
  }
}

// Xin quyền vị trí khi dùng app.
export async function requestForegroundLocationPermission(): Promise<LocationPermissionOperationResult> {
  try {
    const response = await ExpoLocation.requestForegroundPermissionsAsync();
    return { ok: true, permission: mapExpoPermissionResponse(response) };
  } catch {
    return { ok: false, message: 'Không thể yêu cầu quyền vị trí trên thiết bị này.' };
  }
}

// Lấy vị trí mới hoặc vị trí gần nhất.
export async function acquireDevicePosition(options: LocationAcquisitionOptions = {}): Promise<LocationAcquisitionResult> {
  const currentPositionTimeoutMs =
    options.currentPositionTimeoutMs ?? DEFAULT_CURRENT_POSITION_TIMEOUT_MS;
  const fallbackOptions = {
    lastKnownMaxAgeMs: options.lastKnownMaxAgeMs ?? DEFAULT_LAST_KNOWN_MAX_AGE_MS,
    lastKnownRequiredAccuracyMeters:
      options.lastKnownRequiredAccuracyMeters ?? DEFAULT_LAST_KNOWN_REQUIRED_ACCURACY_METERS,
  };

  try {
    const servicesEnabled = await ExpoLocation.hasServicesEnabledAsync();

    if (!servicesEnabled) {
      const fallback = await readLastKnownPosition(fallbackOptions);

      return fallback === null
        ? { ok: false, code: 'services_unavailable', message: 'Dịch vụ vị trí đang tắt hoặc không khả dụng.' }
        : { ok: true, position: fallback, fallbackReason: 'services_unavailable' };
    }
  } catch {
    return { ok: false, code: 'unexpected', message: 'Không thể kiểm tra dịch vụ vị trí.' };
  }

  let failureCode: LocationAcquisitionErrorCode = 'position_unavailable';
  let fallbackReason: LocationFallbackReason = 'current_error';

  try {
    const location = await expoLocationServiceWithTimeout(ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced }), currentPositionTimeoutMs);
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
  resolvePlaceName: resolveDevicePlaceName,
} as const;

// geocoding

export interface OpenMeteoGeocodingResultDto {
  readonly id?: unknown;
  readonly name?: unknown;
  readonly latitude?: unknown;
  readonly longitude?: unknown;
  readonly country?: unknown;
  readonly country_code?: unknown;
  readonly admin1?: unknown;
  readonly admin2?: unknown;
  readonly timezone?: unknown;
}

export interface OpenMeteoGeocodingResponseDto {
  readonly results?: unknown;
}

// Kiểm tra phản hồi tìm kiếm địa điểm.
export function parseOpenMeteoGeocodingResponse(input: unknown): readonly OpenMeteoGeocodingResultDto[] {
  if (typeof input !== 'object' || input === null || !('results' in input)) {
    return [];
  }

  const results = (input as OpenMeteoGeocodingResponseDto).results;
  return Array.isArray(results) ? (results as OpenMeteoGeocodingResultDto[]) : [];
}

// Đọc giá trị chuỗi nếu hợp lệ.
function textValue(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

// Đọc giá trị số nếu hợp lệ.
function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

// Chuẩn hóa một kết quả địa điểm.
export function adaptOpenMeteoGeocodingResult(dto: OpenMeteoGeocodingResultDto): ManualLocationCandidate | null {
  const name = textValue(dto.name);
  const latitude = numberValue(dto.latitude);
  const longitude = numberValue(dto.longitude);

  if (name === undefined || latitude === undefined || longitude === undefined) {
    return null;
  }

  const coordinates = normalizeCoordinates(latitude, longitude);
  if (coordinates === null) {
    return null;
  }

  const admin2 = textValue(dto.admin2);
  const admin1 = textValue(dto.admin1);
  const country = textValue(dto.country);
  const contextParts = [admin2, admin1, country].filter((part, index, parts): part is string => part !== undefined && parts.indexOf(part) === index);
  const providerId =
    typeof dto.id === 'number' || typeof dto.id === 'string'
      ? String(dto.id)
      : `${latitude},${longitude}`;

  return {
    id: `open-meteo:${providerId}`,
    label: name,
    context: contextParts.join(' · '),
    coordinates,
    ...(textValue(dto.timezone) === undefined ? {} : { timezone: textValue(dto.timezone) }),
  };
}

// Chuẩn hóa danh sách kết quả địa điểm.
export function adaptOpenMeteoGeocodingResults(results: readonly OpenMeteoGeocodingResultDto[]) {
  return results
    .map(adaptOpenMeteoGeocodingResult)
    .filter((result): result is ManualLocationCandidate => result !== null);
}

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

export const LOCATION_SEARCH_TIMEOUT_MS = 20_000;

export type LocationSearchErrorCode =
  | 'network'
  | 'timeout'
  | 'rate_limit'
  | 'provider'
  | 'invalid_response';

export class LocationSearchError extends Error {
  readonly code: LocationSearchErrorCode;
  readonly status?: number;

  // Khởi tạo lỗi và thông tin đi kèm.
  constructor(code: LocationSearchErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'LocationSearchError';
    this.code = code;
    this.status = status;
  }
}

interface GeocodingFetchResponse {
  readonly ok: boolean;
  readonly status: number;
  json(): Promise<unknown>;
}

type GeocodingFetch = (
  input: string,
  init: { readonly signal: AbortSignal },
) => Promise<GeocodingFetchResponse>;

interface LocationSearchDependencies {
  readonly fetchImplementation?: GeocodingFetch;
  readonly timeoutMs?: number;
}

// Tìm địa điểm qua Open-Meteo.
export async function searchOpenMeteoLocations(query: string, signal?: AbortSignal, dependencies: LocationSearchDependencies = {}): Promise<readonly ManualLocationCandidate[]> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) {
    return [];
  }

  const fetchImplementation = dependencies.fetchImplementation ?? fetch;
  const timeoutMs = dependencies.timeoutMs ?? LOCATION_SEARCH_TIMEOUT_MS;
  const timeoutController = new AbortController();
  let abortedByCaller = signal?.aborted ?? false;
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);
  // Hủy truy vấn khi bên gọi yêu cầu.
  const abortFromCaller = () => timeoutController.abort();
  // Ghi nhận yêu cầu hủy từ bên gọi.
  const markCallerAbort = () => {
    abortedByCaller = true;
    abortFromCaller();
  };
  signal?.addEventListener('abort', markCallerAbort, { once: true });
  if (abortedByCaller) {
    timeoutController.abort();
  }

  try {
    const response = await fetchImplementation(
      `${GEOCODING_ENDPOINT}?name=${encodeURIComponent(normalizedQuery)}&count=8&language=vi&format=json`,
      { signal: timeoutController.signal },
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new LocationSearchError('rate_limit', 'Dịch vụ tìm kiếm đang nhận quá nhiều yêu cầu.', response.status);
      }

      throw new LocationSearchError('provider', `Dịch vụ tìm kiếm phản hồi HTTP ${response.status}.`, response.status);
    }

    try {
      return adaptOpenMeteoGeocodingResults(parseOpenMeteoGeocodingResponse(await response.json()));
    } catch {
      throw new LocationSearchError('invalid_response', 'Dịch vụ tìm kiếm trả về dữ liệu không hợp lệ.');
    }
  } catch (error) {
    if (error instanceof LocationSearchError) {
      throw error;
    }

    if (timeoutController.signal.aborted) {
      if (abortedByCaller) {
        throw error;
      }

      throw new LocationSearchError('timeout', 'Tìm địa điểm quá thời gian. Hãy thử lại.');
    }

    throw new LocationSearchError('network', 'Không thể kết nối tới dịch vụ tìm địa điểm.');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', markCallerAbort);
  }
}

// expo-geocoding

const NATIVE_GEOCODING_TIMEOUT_MS = 8_000;

class NativeGeocodingTimeoutError extends Error {
  // Khởi tạo lỗi và thông tin đi kèm.
  constructor() {
    super('Native forward geocoding timed out.');
    this.name = 'NativeGeocodingTimeoutError';
  }
}

// Giới hạn thời gian tìm tọa độ.
async function expoGeocodingWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
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
// Tìm địa điểm qua dịch vụ thiết bị.
export async function searchExpoGeocodedLocations(query: string): Promise<readonly ManualLocationCandidate[] | undefined> {
  const normalizedQuery = query.trim();
  if (Platform.OS !== 'android' || normalizedQuery.length < 2) return undefined;

  const permission = await ExpoLocation.getForegroundPermissionsAsync();
  if (!permission.granted) return undefined;

  const results = await expoGeocodingWithTimeout(ExpoLocation.geocodeAsync(normalizedQuery), NATIVE_GEOCODING_TIMEOUT_MS);

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

// saved-locations

export type SavedLocation = Tables<'saved_locations'>;

// Lấy danh sách địa điểm đã lưu.
export async function listSavedLocations(userId: string): Promise<readonly SavedLocation[]> {
  const { data, error } = await requireSupabaseClient()
    .from('saved_locations')
    .select('id, user_id, label, latitude, longitude, is_default, created_at')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error !== null) {
    throw error;
  }

  return data;
}

// Lưu địa điểm vào tài khoản.
export async function saveLocation(userId: string, selection: ManualLocationSelection): Promise<SavedLocation> {
  const label = selection.label.trim().slice(0, 100);

  const { data, error } = await requireSupabaseClient()
    .from('saved_locations')
    .insert({
      user_id: userId,
      label,
      latitude: selection.coordinates.latitude,
      longitude: selection.coordinates.longitude,
      is_default: false,
    })
    .select('id, user_id, label, latitude, longitude, is_default, created_at')
    .single();

  if (error !== null) {
    throw error;
  }

  return data;
}

// Xóa địa điểm đã lưu.
export async function deleteSavedLocation(userId: string, locationId: string) {
  const { error } = await requireSupabaseClient()
    .from('saved_locations')
    .delete()
    .eq('id', locationId)
    .eq('user_id', userId);

  if (error !== null) {
    throw error;
  }
}
