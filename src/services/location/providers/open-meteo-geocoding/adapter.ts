import type { ManualLocationCandidate } from '@/features/locations/domain/manual-location';
import { normalizeCoordinates } from '@/features/locations/domain/location';

import type { OpenMeteoGeocodingResultDto } from './dto';

function textValue(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function adaptOpenMeteoGeocodingResult(
  dto: OpenMeteoGeocodingResultDto,
): ManualLocationCandidate | null {
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
  const contextParts = [admin2, admin1, country].filter(
    (part, index, parts): part is string => part !== undefined && parts.indexOf(part) === index,
  );
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

export function adaptOpenMeteoGeocodingResults(
  results: readonly OpenMeteoGeocodingResultDto[],
) {
  return results
    .map(adaptOpenMeteoGeocodingResult)
    .filter((result): result is ManualLocationCandidate => result !== null);
}
