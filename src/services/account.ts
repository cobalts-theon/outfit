import { requireSupabaseClient, createRecoverySupabaseClient } from '@/services/supabase';
import { parseLifestylePreferences, type LifestylePreferences } from '@/utils/recommendations';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { File } from 'expo-file-system';

export const PROFILE_AVATAR_BUCKET = 'profile-images';
export const PROFILE_AVATAR_MAX_BYTES = 5 * 1024 * 1024;

const mimeTypeExtensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/gif': 'gif',
} as const;

type SupportedProfileAvatarMimeType = keyof typeof mimeTypeExtensions;

const extensionMimeTypes: Record<string, SupportedProfileAvatarMimeType> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  gif: 'image/gif',
};

export interface ProfileAvatarAsset {
  readonly uri: string;
  readonly mimeType?: string | null;
  readonly fileName?: string | null;
  readonly fileSize?: number | null;
  readonly file?: {
    readonly size?: number;
    arrayBuffer(): Promise<ArrayBuffer>;
  } | null;
}

function extensionFromPath(path: string | null | undefined) {
  const cleanPath = path?.split(/[?#]/, 1)[0];
  return cleanPath?.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
}

export function resolveProfileAvatarMimeType(
  asset: ProfileAvatarAsset,
): SupportedProfileAvatarMimeType {
  // Cropping can transcode the selected library item, so the resulting local
  // URI is more authoritative than metadata from the original asset.
  const outputExtension = extensionFromPath(asset.uri);
  const outputMimeType =
    outputExtension === undefined ? undefined : extensionMimeTypes[outputExtension];

  if (outputMimeType !== undefined) {
    return outputMimeType;
  }

  const pickerMimeType = asset.mimeType?.toLowerCase().split(';', 1)[0]?.trim();
  const normalizedMimeType = pickerMimeType === 'image/jpg' ? 'image/jpeg' : pickerMimeType;

  if (normalizedMimeType !== undefined && normalizedMimeType in mimeTypeExtensions) {
    return normalizedMimeType as SupportedProfileAvatarMimeType;
  }

  const extension = extensionFromPath(asset.fileName);
  const inferredMimeType = extension === undefined ? undefined : extensionMimeTypes[extension];

  if (inferredMimeType === undefined) {
    throw new Error('profile_avatar_unsupported_type');
  }

  return inferredMimeType;
}

export function assertProfileAvatarSize(size: number | null | undefined) {
  if (size !== undefined && size !== null && size > PROFILE_AVATAR_MAX_BYTES) {
    throw new Error('profile_avatar_too_large');
  }
}

export function buildProfileAvatarPath(
  userId: string,
  mimeType: SupportedProfileAvatarMimeType,
  uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
) {
  return `${userId}/${uniquePart}.${mimeTypeExtensions[mimeType]}`;
}

function isOwnedAvatarPath(userId: string, path: string | null | undefined) {
  return path?.startsWith(`${userId}/`) === true;
}

async function removeOwnedAvatar(userId: string, path: string | null | undefined) {
  if (!isOwnedAvatarPath(userId, path) || path === undefined || path === null) {
    return;
  }

  await requireSupabaseClient().storage.from(PROFILE_AVATAR_BUCKET).remove([path]);
}

async function readProfileAvatarBytes(asset: ProfileAvatarAsset) {
  if (asset.file !== undefined && asset.file !== null) {
    assertProfileAvatarSize(asset.file.size);
    return asset.file.arrayBuffer();
  }

  if (asset.uri.startsWith('file://')) {
    const localFile = new File(asset.uri);

    if (!localFile.exists) {
      throw new Error('profile_avatar_unreadable_file');
    }

    assertProfileAvatarSize(localFile.size);
    return localFile.arrayBuffer();
  }

  const response = await fetch(asset.uri);
  if (!response.ok) {
    throw new Error('profile_avatar_unreadable_file');
  }

  return response.arrayBuffer();
}

export async function createProfileAvatarSignedUrl(path: string) {
  const { data, error } = await requireSupabaseClient()
    .storage.from(PROFILE_AVATAR_BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error !== null) {
    throw error;
  }

  return data.signedUrl;
}

export async function uploadProfileAvatar(
  userId: string,
  previousPath: string | null | undefined,
  asset: ProfileAvatarAsset,
) {
  assertProfileAvatarSize(asset.fileSize);
  const mimeType = resolveProfileAvatarMimeType(asset);
  const bytes = await readProfileAvatarBytes(asset);

  if (bytes.byteLength === 0) {
    throw new Error('profile_avatar_empty_file');
  }
  assertProfileAvatarSize(bytes.byteLength);

  const client = requireSupabaseClient();
  const path = buildProfileAvatarPath(userId, mimeType);
  const { error: uploadError } = await client.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(path, bytes, {
      cacheControl: '3600',
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError !== null) {
    throw uploadError;
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .update({ avatar_url: path })
    .eq('id', userId)
    .select('id, full_name, avatar_url, created_at')
    .single();

  if (profileError !== null) {
    await removeOwnedAvatar(userId, path);
    throw profileError;
  }

  if (previousPath !== path) {
    await removeOwnedAvatar(userId, previousPath);
  }

  return profile;
}

export async function removeProfileAvatar(userId: string, currentPath: string | null | undefined) {
  const { data: profile, error } = await requireSupabaseClient()
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', userId)
    .select('id, full_name, avatar_url, created_at')
    .single();

  if (error !== null) {
    throw error;
  }

  await removeOwnedAvatar(userId, currentPath);
  return profile;
}

// email-otp

export type EmailOtpPurpose = 'signup' | 'recovery';

export const OTP_RESEND_DELAY_MS = 60_000;

export function normalizeOtpEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('invalid_email');
  return email;
}

export async function requestEmailOtp(emailInput: string, purpose: EmailOtpPurpose): Promise<void> {
  const email = normalizeOtpEmail(emailInput);
  const auth = requireSupabaseClient().auth;
  if (purpose !== 'signup') throw new Error('Use the isolated password recovery flow.');
  const { error } = await auth.resend({ type: 'signup', email });
  if (error) throw error;
}

export async function verifyEmailOtp(emailInput: string, input: string): Promise<void> {
  const email = normalizeOtpEmail(emailInput);
  const token = input.trim();
  if (!/^\d{6}$/.test(token)) throw new Error('invalid_otp');
  const { data, error } = await requireSupabaseClient().auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  if (!data.session) throw new Error('otp_session_missing');
}

export function emailOtpErrorMessage(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message === 'password_mismatch') return 'Hai mật khẩu chưa trùng nhau.';
  if (message === 'weak_password' || code === 'weak_password')
    return 'Mật khẩu cần ít nhất 6 ký tự và đáp ứng yêu cầu bảo mật của dịch vụ.';
  if (code === 'same_password') return 'Chọn mật khẩu khác mật khẩu cũ.';
  if (message === 'invalid_email') return 'Nhập địa chỉ email hợp lệ.';
  if (message === 'invalid_otp') return 'Nhập đầy đủ mã 6 chữ số trong email.';
  if (['otp_expired', 'access_denied'].includes(code))
    return 'Mã không đúng hoặc đã hết hạn. Kiểm tra lại hoặc gửi mã mới.';
  if (code === 'over_email_send_rate_limit')
    return 'Đã đạt giới hạn gửi email. Vui lòng thử lại sau.';
  if (code.includes('rate_limit') || /rate limit|too many|security purposes/.test(message))
    return 'Bạn đang yêu cầu quá nhanh. Chờ một lúc rồi thử lại.';
  if (code === 'email_address_not_authorized')
    return 'Dịch vụ email hiện chưa cho phép gửi đến địa chỉ này. Vui lòng liên hệ người quản lý ứng dụng.';
  if (/network|fetch|timeout/.test(message)) return 'Không thể kết nối. Kiểm tra mạng rồi thử lại.';
  return 'Chưa thể hoàn tất xác thực. Kiểm tra email, mã và thử lại.';
}

export function createPasswordRecovery() {
  const auth = createRecoverySupabaseClient().auth;
  let verified = false;
  let disposed = false;
  return {
    async send(email: string) {
      const { error } = await auth.resetPasswordForEmail(normalizeOtpEmail(email));
      if (error) throw error;
    },
    async verify(email: string, input: string) {
      verified = false;
      const token = input.trim();
      if (!/^\d{6}$/.test(token)) throw new Error('invalid_otp');
      const { data, error } = await auth.verifyOtp({
        email: normalizeOtpEmail(email),
        token,
        type: 'recovery',
      });
      if (error) throw error;
      if (!data.session) throw new Error('otp_session_missing');
      if (disposed) {
        await auth.signOut({ scope: 'local' });
        throw new Error('otp_session_missing');
      }
      verified = true;
    },
    async updatePassword(password: string, confirmation: string) {
      if (!verified) throw new Error('otp_session_missing');
      if (password.length < 6) throw new Error('weak_password');
      if (password !== confirmation) throw new Error('password_mismatch');
      const { error } = await auth.updateUser({ password });
      if (error) throw error;
      verified = false;
      // The password has already changed; cleanup failure must not report otherwise.
      await auth.signOut({ scope: 'local' }).catch(() => undefined);
    },
    dispose() {
      disposed = true;
      verified = false;
      void auth.signOut({ scope: 'local' }).catch(() => undefined);
    },
  };
}

// lifestyle-preferences

export async function saveLifestylePreferences(preferences?: LifestylePreferences): Promise<void> {
  const validated = preferences === undefined ? undefined : parseLifestylePreferences(preferences);
  if (preferences !== undefined && !validated) throw new Error('Invalid lifestyle preferences');
  const { error } = await requireSupabaseClient().auth.updateUser({
    data: {
      lifestyle_onboarding_pending: false,
      ...(validated ? { lifestyle_preferences: validated } : {}),
    },
  });
  if (error) throw error;
}

// profile-query

export const profileKeys = {
  all: ['profile'] as const,
  avatar: (path: string) => [...profileKeys.all, 'avatar', path] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

export function profileQueryOptions(userId: string | undefined) {
  return queryOptions({
    queryKey: userId === undefined ? profileKeys.all : profileKeys.detail(userId),
    enabled: userId !== undefined,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (userId === undefined) {
        return null;
      }

      const { data, error } = await requireSupabaseClient()
        .from('profiles')
        .select('id, full_name, avatar_url, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (error !== null) {
        throw error;
      }

      return data;
    },
  });
}

export function useProfile(userId: string | undefined) {
  return useQuery(profileQueryOptions(userId));
}

export function useProfileAvatarUrl(path: string | null | undefined) {
  return useQuery({
    queryKey:
      path === undefined || path === null
        ? [...profileKeys.all, 'avatar']
        : profileKeys.avatar(path),
    enabled: path !== undefined && path !== null,
    staleTime: 50 * 60 * 1000,
    queryFn: () =>
      path === undefined || path === null
        ? Promise.resolve(null)
        : createProfileAvatarSignedUrl(path),
  });
}

export function useUploadProfileAvatar(
  userId: string | undefined,
  currentPath: string | null | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (asset: ProfileAvatarAsset) => {
      if (userId === undefined) {
        throw new Error('profile_avatar_requires_auth');
      }
      return uploadProfileAvatar(userId, currentPath, asset);
    },
    onSuccess: (profile) => {
      if (userId !== undefined) {
        queryClient.setQueryData(profileKeys.detail(userId), profile);
      }
    },
  });
}

export function useRemoveProfileAvatar(
  userId: string | undefined,
  currentPath: string | null | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (userId === undefined) {
        throw new Error('profile_avatar_requires_auth');
      }
      return removeProfileAvatar(userId, currentPath);
    },
    onSuccess: (profile) => {
      if (userId !== undefined) {
        queryClient.setQueryData(profileKeys.detail(userId), profile);
      }
    },
  });
}
