import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { publicEnvironment, type SupabasePublicConfiguration } from '@/config/environment';
import type { Database } from '@/types/database';

export type AppSupabaseClient = SupabaseClient<Database>;

export function createAppSupabaseClient(
  configuration: SupabasePublicConfiguration,
): AppSupabaseClient {
  return createClient<Database>(configuration.url, configuration.publishableKey, {
    auth: {
      storage: globalThis.localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase =
  publicEnvironment.status === 'ready'
    ? createAppSupabaseClient(publicEnvironment.supabase)
    : null;

export const isSupabaseConfigured = supabase !== null;

export function requireSupabaseClient(): AppSupabaseClient {
  if (supabase === null) {
    throw new Error(
      'Supabase is not configured. Add the public values documented in .env.example.',
    );
  }

  return supabase;
}
