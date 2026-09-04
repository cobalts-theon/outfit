import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ManualLocationSelection } from '@/features/locations/domain/manual-location';
import {
  deleteSavedLocation,
  listSavedLocations,
  saveLocation,
} from '@/features/locations/data/saved-locations-repository';

export const savedLocationKeys = {
  all: ['saved-locations'] as const,
  list: (userId: string) => [...savedLocationKeys.all, userId] as const,
};

export function useSavedLocations(userId: string | undefined) {
  return useQuery({
    queryKey: userId === undefined ? savedLocationKeys.all : savedLocationKeys.list(userId),
    enabled: userId !== undefined,
    staleTime: 5 * 60 * 1000,
    queryFn: () => (userId === undefined ? Promise.resolve([]) : listSavedLocations(userId)),
  });
}

export function useSaveLocation(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (selection: ManualLocationSelection) => {
      if (userId === undefined) {
        throw new Error('Bạn cần đăng nhập để lưu địa điểm.');
      }
      return saveLocation(userId, selection);
    },
    onSuccess: async () => {
      if (userId !== undefined) {
        await queryClient.invalidateQueries({ queryKey: savedLocationKeys.list(userId) });
      }
    },
  });
}

export function useDeleteSavedLocation(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: string) => {
      if (userId === undefined) {
        throw new Error('Bạn cần đăng nhập để xóa địa điểm.');
      }
      return deleteSavedLocation(userId, locationId);
    },
    onSuccess: async () => {
      if (userId !== undefined) {
        await queryClient.invalidateQueries({ queryKey: savedLocationKeys.list(userId) });
      }
    },
  });
}
