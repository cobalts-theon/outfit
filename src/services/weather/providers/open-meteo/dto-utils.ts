import { OpenMeteoResponseError } from '@/services/weather/providers/open-meteo/errors';

export type JsonRecord = Record<string, unknown>;
export type NullableNumber = number | null;

export function readRecord(value: unknown, path: string): JsonRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new OpenMeteoResponseError('Expected an object.', path);
  }

  return value as JsonRecord;
}

export function readString(record: JsonRecord, key: string, path = key): string {
  const value = record[key];

  if (typeof value !== 'string' || value.length === 0) {
    throw new OpenMeteoResponseError('Expected a non-empty string.', path);
  }

  return value;
}

export function readNumber(record: JsonRecord, key: string, path = key): number {
  const value = record[key];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new OpenMeteoResponseError('Expected a finite number.', path);
  }

  return value;
}

export function readOptionalNumber(
  record: JsonRecord,
  key: string,
  path = key,
): NullableNumber | undefined {
  const value = record[key];

  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new OpenMeteoResponseError('Expected a finite number or null.', path);
  }

  return value;
}

export function readNumberArray(
  record: JsonRecord,
  key: string,
  path = key,
): readonly NullableNumber[] {
  const value = record[key];

  if (!Array.isArray(value)) {
    throw new OpenMeteoResponseError('Expected an array.', path);
  }

  return value.map((entry, index) => {
    if (entry === null) {
      return entry;
    }

    if (typeof entry !== 'number' || !Number.isFinite(entry)) {
      throw new OpenMeteoResponseError(
        'Expected a finite number or null.',
        `${path}.${index}`,
      );
    }

    return entry;
  });
}

export function readOptionalNumberArray(
  record: JsonRecord,
  key: string,
  path = key,
): readonly NullableNumber[] | undefined {
  return record[key] === undefined ? undefined : readNumberArray(record, key, path);
}

export function readOptionalRecord(
  record: JsonRecord,
  key: string,
  path = key,
): JsonRecord | undefined {
  const value = record[key];
  return value === undefined ? undefined : readRecord(value, path);
}

export function readUnitMap(
  record: JsonRecord,
  key: string,
): Readonly<Record<string, string>> | undefined {
  const unitRecord = readOptionalRecord(record, key);

  if (unitRecord === undefined) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(unitRecord).map(([unitKey, value]) => {
      if (typeof value !== 'string') {
        throw new OpenMeteoResponseError('Expected a string unit.', `${key}.${unitKey}`);
      }

      return [unitKey, value];
    }),
  );
}
