/**
 * Kiểm tra cấu hình công khai và tạo Supabase client dùng chung.
 * Client giữ phiên đăng nhập; dữ liệu được truy cập theo quyền do backend kiểm soát.
 */
import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// environment

export interface PublicEnvironmentInput {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
}

export interface SupabasePublicConfiguration {
  url: string;
  publishableKey: string;
}

export interface EnvironmentIssue {
  variable: 'EXPO_PUBLIC_SUPABASE_URL' | 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY';
  reason: 'missing' | 'invalid-url' | 'secret-key';
}

export type PublicEnvironment =
  | { status: 'ready'; supabase: SupabasePublicConfiguration; issues: readonly [] }
  | { status: 'incomplete'; supabase: null; issues: readonly EnvironmentIssue[] };

// Kiểm tra URL backend được phép sử dụng.
function isAllowedSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

    return url.protocol === 'https:' || (url.protocol === 'http:' && isLocalHost);
  } catch {
    return false;
  }
}

// Phát hiện khóa bí mật trong cấu hình app.
function looksLikeSecretKey(value: string) {
  return value.startsWith('sb_secret_') || value.toLowerCase().includes('service_role');
}

// Kiểm tra cấu hình công khai của backend.
export function validatePublicEnvironment(input: PublicEnvironmentInput): PublicEnvironment {
  const url = input.supabaseUrl?.trim() ?? '';
  const publishableKey = input.supabasePublishableKey?.trim() ?? '';
  const issues: EnvironmentIssue[] = [];

  if (url.length === 0) {
    issues.push({ variable: 'EXPO_PUBLIC_SUPABASE_URL', reason: 'missing' });
  } else if (!isAllowedSupabaseUrl(url)) {
    issues.push({ variable: 'EXPO_PUBLIC_SUPABASE_URL', reason: 'invalid-url' });
  }

  if (publishableKey.length === 0) {
    issues.push({ variable: 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', reason: 'missing' });
  } else if (looksLikeSecretKey(publishableKey)) {
    issues.push({ variable: 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', reason: 'secret-key' });
  }

  if (issues.length > 0) {
    return { status: 'incomplete', supabase: null, issues };
  }

  return { status: 'ready', supabase: { url, publishableKey }, issues: [] };
}

export const publicEnvironment = validatePublicEnvironment({
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

// supabase

export type AppSupabaseClient = SupabaseClient<Database>;

// Tạo client backend có lưu phiên.
export function createAppSupabaseClient(configuration: SupabasePublicConfiguration): AppSupabaseClient {
  return createClient<Database>(configuration.url, configuration.publishableKey, {
    auth: { storage: globalThis.localStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });
}

export const supabase =
  publicEnvironment.status === 'ready' ? createAppSupabaseClient(publicEnvironment.supabase) : null;

export const isSupabaseConfigured = supabase !== null;

// Lấy client hoặc báo thiếu cấu hình.
export function requireSupabaseClient(): AppSupabaseClient {
  if (supabase === null) {
    throw new Error('Supabase is not configured. Add the public values documented in .env.example.');
  }

  return supabase;
}

// Password recovery must not replace the application's persisted login session.
// Tạo client riêng cho khôi phục mật khẩu.
export function createRecoverySupabaseClient(): AppSupabaseClient {
  if (publicEnvironment.status !== 'ready') throw new Error('Supabase is not configured.');
  return createClient<Database>(
    publicEnvironment.supabase.url,
    publicEnvironment.supabase.publishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'weather-password-recovery',
      },
    },
  );
}
