import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono/600SemiBold';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export interface AppBootstrapState {
  isReady: boolean;
  fontError: Error | null;
}

export function useAppBootstrap(): AppBootstrapState {
  const [fontsLoaded, fontError] = useFonts({
    JetBrainsMono: JetBrainsMono_400Regular,
    JetBrainsMonoSemiBold: JetBrainsMono_600SemiBold,
  });
  const isReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isReady]);

  return { isReady, fontError };
}
