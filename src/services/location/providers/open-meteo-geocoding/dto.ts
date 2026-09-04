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

export function parseOpenMeteoGeocodingResponse(
  input: unknown,
): readonly OpenMeteoGeocodingResultDto[] {
  if (typeof input !== 'object' || input === null || !('results' in input)) {
    return [];
  }

  const results = (input as OpenMeteoGeocodingResponseDto).results;
  return Array.isArray(results) ? (results as OpenMeteoGeocodingResultDto[]) : [];
}
