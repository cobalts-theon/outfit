import { beforeEach, expect, it, jest } from '@jest/globals';
import { requireSupabaseClient } from '@/services/supabase';
import { saveLifestylePreferences } from '@/services/account';
import type { LifestylePreferences } from '@/utils/recommendations';

jest.mock('@/services/supabase', () => ({ requireSupabaseClient: jest.fn() }));

const updateUser = jest.fn<(input: unknown) => Promise<{ error: Error | null }>>();

const preferences: LifestylePreferences = { version: 1, activities: ['exercise'], periods: ['morning'] };

beforeEach(() => {
  updateUser.mockReset().mockResolvedValue({ error: null });
  jest.mocked(requireSupabaseClient).mockReturnValue({ auth: { updateUser } } as never);
});

it('saves only the signed-in user’s preference metadata', async () => {
  await saveLifestylePreferences(preferences);
  expect(updateUser).toHaveBeenCalledWith({ data: { lifestyle_onboarding_pending: false, lifestyle_preferences: preferences } });
});

it('defers onboarding without overwriting existing preferences', async () => {
  await saveLifestylePreferences();
  expect(updateUser).toHaveBeenCalledWith({ data: { lifestyle_onboarding_pending: false } });
});

it('propagates offline errors so the editor retains the unsaved draft', async () => {
  updateUser.mockResolvedValue({ error: new Error('Network unavailable') });
  await expect(saveLifestylePreferences(preferences)).rejects.toThrow('Network unavailable');
});

it('rejects invalid preferences before contacting auth', async () => {
  await expect(saveLifestylePreferences({ ...preferences, periods: [] })).rejects.toThrow('Invalid');
  expect(updateUser).not.toHaveBeenCalled();
});
