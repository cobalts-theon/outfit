import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

let isConfigured = false;

export function configureQueryRuntime() {
  if (isConfigured) {
    return;
  }

  isConfigured = true;

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(state.isConnected === true && state.isInternetReachable !== false);
    }),
  );

  if (Platform.OS !== 'web') {
    focusManager.setEventListener((setFocused) => {
      const subscription = AppState.addEventListener('change', (status) => {
        setFocused(status === 'active');
      });

      return () => subscription.remove();
    });
  }
}
