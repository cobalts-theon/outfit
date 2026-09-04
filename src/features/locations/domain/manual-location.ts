import { normalizeCoordinates, type AppCoordinates, type SelectedAppLocation } from './location';

export interface ManualLocationCandidate {
  readonly id: string;
  readonly label: string;
  readonly context: string;
  readonly selectionLabel?: string;
  readonly coordinates: AppCoordinates;
  readonly timezone?: string;
}

export interface ManualLocationSelection {
  readonly label: string;
  readonly coordinates: AppCoordinates;
}

export function createManualSelectedLocation(
  selection: ManualLocationSelection,
): SelectedAppLocation {
  const label = selection.label.trim();
  const coordinates = normalizeCoordinates(
    selection.coordinates.latitude,
    selection.coordinates.longitude,
  );

  if (label.length === 0 || coordinates === null) {
    throw new Error('Địa điểm thủ công không hợp lệ.');
  }

  return {
    coordinates,
    label,
    selectedAt: new Date().toISOString(),
    source: 'manual',
  };
}
