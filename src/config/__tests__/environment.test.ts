import { describe, expect, it } from '@jest/globals';

import { validatePublicEnvironment } from '@/config/environment';

describe('validatePublicEnvironment', () => {
  it('accepts a public Supabase configuration', () => {
    const result = validatePublicEnvironment({
      supabaseUrl: 'https://project-ref.supabase.co',
      supabasePublishableKey: 'sb_publishable_example',
    });

    expect(result).toEqual({
      status: 'ready',
      supabase: {
        url: 'https://project-ref.supabase.co',
        publishableKey: 'sb_publishable_example',
      },
      issues: [],
    });
  });

  it('reports both missing public variables without exposing values', () => {
    const result = validatePublicEnvironment({});

    expect(result.status).toBe('incomplete');
    expect(result.issues).toEqual([
      { variable: 'EXPO_PUBLIC_SUPABASE_URL', reason: 'missing' },
      { variable: 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', reason: 'missing' },
    ]);
  });

  it('rejects secret keys in public Expo configuration', () => {
    const result = validatePublicEnvironment({
      supabaseUrl: 'https://project-ref.supabase.co',
      supabasePublishableKey: 'sb_secret_do_not_ship',
    });

    expect(result.status).toBe('incomplete');
    expect(result.issues).toContainEqual({
      variable: 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      reason: 'secret-key',
    });
  });

  it('allows local HTTP development but rejects other insecure URLs', () => {
    expect(
      validatePublicEnvironment({
        supabaseUrl: 'http://127.0.0.1:54321',
        supabasePublishableKey: 'local-anon-key',
      }).status,
    ).toBe('ready');

    expect(
      validatePublicEnvironment({
        supabaseUrl: 'http://example.com',
        supabasePublishableKey: 'public-key',
      }).status,
    ).toBe('incomplete');
  });
});
