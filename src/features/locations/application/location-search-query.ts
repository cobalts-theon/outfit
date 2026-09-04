import { queryOptions, useQuery } from '@tanstack/react-query';

import { searchExpoGeocodedLocations } from '@/services/location/providers/expo-geocoding/client';
import { searchOpenMeteoLocations } from '@/services/location/providers/open-meteo-geocoding/client';

export const locationSearchKeys = {
  all: ['location-search'] as const,
  query: (query: string) => [...locationSearchKeys.all, query.trim().toLocaleLowerCase('vi')] as const,
};

export function locationSearchQueryOptions(query: string) {
  const normalizedQuery = query.trim();

  return queryOptions({
    queryKey: locationSearchKeys.query(normalizedQuery),
    enabled: normalizedQuery.length >= 2,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    queryFn: async ({ signal }) => {
      try {
        const nativeResults = await searchExpoGeocodedLocations(normalizedQuery);
        if (nativeResults !== undefined && nativeResults.length > 0) {
          return nativeResults;
        }
      } catch {
        // The provider-independent remote search below remains the fallback.
      }

      return searchOpenMeteoLocations(normalizedQuery, signal);
    },
  });
}

export function useLocationSearch(query: string) {
  return useQuery(locationSearchQueryOptions(query));
}
