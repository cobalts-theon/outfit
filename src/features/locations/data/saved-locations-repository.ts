import type { ManualLocationSelection } from '@/features/locations/domain/manual-location';
import type { Tables } from '@/types/database';
import { requireSupabaseClient } from '@/services/supabase/client';

export type SavedLocation = Tables<'saved_locations'>;

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

export async function saveLocation(
  userId: string,
  selection: ManualLocationSelection,
): Promise<SavedLocation> {
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
