import { QueryClient } from '@tanstack/react-query';

import { configureQueryRuntime } from '@/services/query/query-runtime';

configureQueryRuntime();

export const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
