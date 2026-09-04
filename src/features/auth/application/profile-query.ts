import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ProfileAvatarAsset } from '@/features/auth/data/profile-avatar-repository';
import {
  createProfileAvatarSignedUrl,
  removeProfileAvatar,
  uploadProfileAvatar,
} from '@/features/auth/data/profile-avatar-repository';
import { requireSupabaseClient } from '@/services/supabase/client';

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
  avatar: (path: string) => [...profileKeys.all, 'avatar', path] as const,
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
    queryKey: path === undefined || path === null ? [...profileKeys.all, 'avatar'] : profileKeys.avatar(path),
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
