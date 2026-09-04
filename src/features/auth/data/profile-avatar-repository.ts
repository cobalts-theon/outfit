import { File } from 'expo-file-system';

import { requireSupabaseClient } from '@/services/supabase/client';

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

export function resolveProfileAvatarMimeType(asset: ProfileAvatarAsset): SupportedProfileAvatarMimeType {
  // Cropping can transcode the selected library item, so the resulting local
  // URI is more authoritative than metadata from the original asset.
  const outputExtension = extensionFromPath(asset.uri);
  const outputMimeType = outputExtension === undefined
    ? undefined
    : extensionMimeTypes[outputExtension];

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
    .storage
    .from(PROFILE_AVATAR_BUCKET)
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

export async function removeProfileAvatar(
  userId: string,
  currentPath: string | null | undefined,
) {
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
