import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchExpoGeocodedLocations,
  searchOpenMeteoLocations,
  deleteSavedLocation,
  listSavedLocations,
  saveLocation,
  expoLocationService,
  type SavedLocation,
  LocationSearchError,
} from '@/services/location';
import {
  type ManualLocationSelection,
  selectDevicePosition,
  stateFromLocationPermission,
  type LocationCapabilityState,
  createManualSelectedLocation,
  type ManualLocationCandidate,
} from '@/utils/validation';
import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert, Keyboard } from 'react-native';
import { useAuth } from '@/context/auth';

// location-queries

export const locationSearchKeys = {
  all: ['location-search'] as const,
  query: (query: string) =>
    [...locationSearchKeys.all, query.trim().toLocaleLowerCase('vi')] as const,
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

// location-capability-provider

interface LocationCapabilityContextValue {
  readonly state: LocationCapabilityState;
  readonly requestPermission: () => Promise<void>;
  readonly retry: () => Promise<void>;
  readonly refreshPermission: () => Promise<void>;
  readonly selectManualLocation: (selection: ManualLocationSelection) => void;
}

const LocationCapabilityContext = createContext<LocationCapabilityContextValue | null>(null);

export function LocationCapabilityProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<LocationCapabilityState>({ status: 'idle' });
  const activeOperation = useRef(0);

  const acquireForOperation = useCallback(async (operationId: number) => {
    if (activeOperation.current !== operationId) {
      return;
    }

    setState({ status: 'acquiring_position' });
    const result = await expoLocationService.acquirePosition();

    if (activeOperation.current !== operationId) {
      return;
    }

    if (result.ok) {
      const readyState = {
        status: 'ready' as const,
        position: result.position,
        selectedLocation: selectDevicePosition(result.position),
        fallbackReason: result.fallbackReason,
      };
      setState({ ...readyState });

      const placeName = await expoLocationService.resolvePlaceName(result.position.coordinates);
      if (activeOperation.current === operationId && placeName !== undefined) {
        const namedPosition = { ...result.position, placeName };
        setState({
          ...readyState,
          position: namedPosition,
          selectedLocation: selectDevicePosition(namedPosition),
        });
      }
      return;
    }

    if (result.code === 'services_unavailable') {
      setState({ status: 'services_unavailable' });
      return;
    }

    setState({ status: 'acquisition_error', code: result.code, message: result.message });
  }, []);

  const refreshPermission = useCallback(async () => {
    const operationId = activeOperation.current + 1;
    activeOperation.current = operationId;
    setState({ status: 'checking_permission' });

    const result = await expoLocationService.checkPermission();

    if (activeOperation.current !== operationId) {
      return;
    }

    if (!result.ok) {
      setState({ status: 'permission_unavailable', message: result.message });
      return;
    }

    const nextState = stateFromLocationPermission(result.permission);

    if (nextState.status === 'acquiring_position') {
      await acquireForOperation(operationId);
      return;
    }

    setState(nextState);
  }, [acquireForOperation]);

  const requestPermission = useCallback(async () => {
    const operationId = activeOperation.current + 1;
    activeOperation.current = operationId;
    setState({ status: 'requesting_permission' });

    const result = await expoLocationService.requestPermission();

    if (activeOperation.current !== operationId) {
      return;
    }

    if (!result.ok) {
      setState({ status: 'permission_unavailable', message: result.message });
      return;
    }

    const nextState = stateFromLocationPermission(result.permission);

    if (nextState.status === 'acquiring_position') {
      await acquireForOperation(operationId);
      return;
    }

    setState(nextState);
  }, [acquireForOperation]);

  const retry = useCallback(async () => {
    if (
      state.status === 'permission_required' ||
      (state.status === 'permission_denied' && state.canAskAgain)
    ) {
      await requestPermission();
      return;
    }

    if (
      (state.status === 'ready' && state.position !== undefined) ||
      state.status === 'services_unavailable' ||
      state.status === 'acquisition_error'
    ) {
      const operationId = activeOperation.current + 1;
      activeOperation.current = operationId;
      await acquireForOperation(operationId);
      return;
    }

    await refreshPermission();
  }, [acquireForOperation, refreshPermission, requestPermission, state]);

  const selectManualLocation = useCallback((selection: ManualLocationSelection) => {
    activeOperation.current += 1;
    setState({ status: 'ready', selectedLocation: createManualSelectedLocation(selection) });
  }, []);

  useEffect(() => {
    void refreshPermission();

    return () => {
      activeOperation.current += 1;
    };
  }, [refreshPermission]);

  return (
    <LocationCapabilityContext.Provider
      value={{ state, requestPermission, retry, refreshPermission, selectManualLocation }}
    >
      {children}
    </LocationCapabilityContext.Provider>
  );
}

export function useLocationCapability() {
  const value = use(LocationCapabilityContext);

  if (value === null) {
    throw new Error('useLocationCapability must be used inside LocationCapabilityProvider.');
  }

  return value;
}

// use-locations-model

export function candidateSelection(candidate: ManualLocationCandidate): ManualLocationSelection {
  return {
    label: (
      candidate.selectionLabel ?? [candidate.label, candidate.context].filter(Boolean).join(' · ')
    ).slice(0, 100),
    coordinates: candidate.coordinates,
  };
}

export function savedSelection(location: SavedLocation): ManualLocationSelection {
  return {
    label: location.label,
    coordinates: { latitude: location.latitude, longitude: location.longitude },
  };
}

export function isSameLocation(location: SavedLocation, candidate: ManualLocationCandidate) {
  return (
    Math.abs(location.latitude - candidate.coordinates.latitude) < 0.00001 &&
    Math.abs(location.longitude - candidate.coordinates.longitude) < 0.00001
  );
}

function locationSearchErrorCopy(error: unknown) {
  if (!(error instanceof LocationSearchError)) {
    return {
      title: 'KHÔNG THỂ TÌM ĐỊA ĐIỂM',
      message: 'Đã có lỗi ngoài dự kiến. Hãy thử lại sau ít phút.',
    };
  }
  switch (error.code) {
    case 'timeout':
      return {
        title: 'TÌM KIẾM QUÁ LÂU',
        message: 'Dịch vụ chưa phản hồi kịp. Kết nối có thể chậm; hãy nhấn TÌM LẠI.',
      };
    case 'rate_limit':
      return {
        title: 'TẠM THỜI QUÁ TẢI',
        message: 'Dịch vụ đang nhận nhiều yêu cầu. Chờ một lát rồi thử lại.',
      };
    case 'provider':
    case 'invalid_response':
      return {
        title: 'DỊCH VỤ TẠM GIÁN ĐOẠN',
        message: 'Dịch vụ địa danh đang gặp sự cố. Địa điểm GPS hiện tại vẫn dùng được.',
      };
    case 'network':
      return {
        title: 'CHƯA CÓ KẾT NỐI',
        message: 'Không thể kết nối tới dịch vụ địa danh. Kiểm tra mạng rồi nhấn TÌM LẠI.',
      };
  }
}

export function useLocationsModel(onClose: () => void, onRequireAuth: () => void) {
  const { state: authState } = useAuth();
  const { selectManualLocation } = useLocationCapability();
  const [draftQuery, setDraftQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [notice, setNotice] = useState<string>();
  const userId = authState.status === 'signed_in' ? authState.user.id : undefined;
  const searchQuery = useLocationSearch(submittedQuery);
  const savedLocationsQuery = useSavedLocations(userId);
  const saveMutation = useSaveLocation(userId);
  const deleteMutation = useDeleteSavedLocation(userId);
  const savedLocations = savedLocationsQuery.data ?? [];
  const normalizedDraftQuery = draftQuery.trim();
  const isCurrentSearch =
    normalizedDraftQuery.length >= 2 &&
    normalizedDraftQuery.toLocaleLowerCase('vi') === submittedQuery.trim().toLocaleLowerCase('vi');
  const searchErrorCopy = locationSearchErrorCopy(searchQuery.error);
  const runSearch = () => {
    Keyboard.dismiss();
    setNotice(undefined);
    const query = normalizedDraftQuery;
    if (query.length < 2) {
      setNotice('Nhập ít nhất 2 ký tự để tìm địa điểm.');
      return;
    }
    if (isCurrentSearch) {
      void searchQuery.refetch();
      return;
    }
    setSubmittedQuery(query);
  };
  const useSelection = (selection: ManualLocationSelection) => {
    selectManualLocation(selection);
    onClose();
  };
  const saveCandidate = async (candidate: ManualLocationCandidate) => {
    if (userId === undefined) {
      onRequireAuth();
      return;
    }
    setNotice(undefined);
    try {
      await saveMutation.mutateAsync(candidateSelection(candidate));
      setNotice(`Đã lưu ${candidate.label} vào tài khoản.`);
    } catch {
      setNotice('Không thể lưu địa điểm. Hãy kiểm tra mạng và thử lại.');
    }
  };
  const confirmDelete = (location: SavedLocation) => {
    Alert.alert('Xóa địa điểm?', `${location.label} sẽ bị xóa khỏi tài khoản của bạn.`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setNotice(undefined);
          void deleteMutation.mutateAsync(location.id).catch(() => {
            setNotice('Không thể xóa địa điểm. Hãy thử lại.');
          });
        },
      },
    ]);
  };
  return {
    authState,
    draftQuery,
    setDraftQuery,
    notice,
    searchQuery,
    savedLocationsQuery,
    saveMutation,
    deleteMutation,
    savedLocations,
    isCurrentSearch,
    searchErrorCopy,
    runSearch,
    useSelection,
    saveCandidate,
    confirmDelete,
  };
}

export type LocationsModel = ReturnType<typeof useLocationsModel>;
