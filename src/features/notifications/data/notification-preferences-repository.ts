import { requireSupabaseClient } from '@/services/supabase/client';

export async function upsertCloudNotificationPreference(
  userId: string,
  enabled: boolean,
): Promise<void> {
  const { error } = await requireSupabaseClient()
    .from('notification_preferences')
    .upsert(
      {
        user_id: userId,
        notifications_enabled: enabled,
      },
      { onConflict: 'user_id' },
    );

  if (error !== null) {
    throw error;
  }
}
