import { Archivo_900Black } from '@expo-google-fonts/archivo/900Black';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue/400Regular';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';
import { Syne_400Regular } from '@expo-google-fonts/syne/400Regular';
import { Syne_800ExtraBold } from '@expo-google-fonts/syne/800ExtraBold';
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
    ArchivoBlack: Archivo_900Black,
    BebasNeue: BebasNeue_400Regular,
    JetBrainsMono: JetBrainsMono_400Regular,
    JetBrainsMonoBold: JetBrainsMono_700Bold,
    Syne: Syne_400Regular,
    SyneExtraBold: Syne_800ExtraBold,
  });
  const isReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isReady]);

  return { isReady, fontError };
}
