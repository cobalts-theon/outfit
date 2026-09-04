import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/services/supabase/client', () => ({
  requireSupabaseClient: jest.fn(),
}));

import { upsertCloudNotificationPreference } from '@/features/notifications/data/notification-preferences-repository';
import { requireSupabaseClient } from '@/services/supabase/client';

const mockRequireSupabaseClient = jest.mocked(requireSupabaseClient);
const mockUpsert = jest.fn<
  (values: unknown, options: unknown) => Promise<{ error: Error | null }>
>();
const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));

describe('notification preference repository', () => {
  beforeEach(() => {
    mockFrom.mockClear();
    mockUpsert.mockReset();
    mockRequireSupabaseClient.mockReset().mockReturnValue({
      from: mockFrom,
    } as never);
  });

  it('upserts the authenticated user preference by user_id', async () => {
    mockUpsert.mockResolvedValue({ error: null });

    await upsertCloudNotificationPreference('user-123', true);

    expect(mockFrom).toHaveBeenCalledWith('notification_preferences');
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        user_id: 'user-123',
        notifications_enabled: true,
      },
      { onConflict: 'user_id' },
    );
  });

  it('propagates a Supabase write error', async () => {
    const error = new Error('RLS denied write');
    mockUpsert.mockResolvedValue({ error });

    await expect(upsertCloudNotificationPreference('user-123', false)).rejects.toBe(error);
  });
});
