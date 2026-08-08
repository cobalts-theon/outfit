import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  selectDevicePosition,
  stateFromLocationPermission,
  type LocationCapabilityState,
} from '@/features/locations/domain/location';
import { expoLocationService } from '@/services/location/expo-location-service';

interface LocationCapabilityContextValue {
  readonly state: LocationCapabilityState;
  readonly requestPermission: () => Promise<void>;
  readonly retry: () => Promise<void>;
  readonly refreshPermission: () => Promise<void>;
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
      setState({
        status: 'ready',
        position: result.position,
        selectedLocation: selectDevicePosition(result.position),
        fallbackReason: result.fallbackReason,
      });
      return;
    }

    if (result.code === 'services_unavailable') {
      setState({ status: 'services_unavailable' });
      return;
    }

    setState({
      status: 'acquisition_error',
      code: result.code,
      message: result.message,
    });
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
      state.status === 'ready' ||
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

  useEffect(() => {
    void refreshPermission();

    return () => {
      activeOperation.current += 1;
    };
  }, [refreshPermission]);

  return (
    <LocationCapabilityContext.Provider
      value={{ state, requestPermission, retry, refreshPermission }}
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

