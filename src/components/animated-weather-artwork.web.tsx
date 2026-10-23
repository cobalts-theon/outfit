import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import type { WeatherIconAssetPair } from '@/components/home-weather';
import { useReducedMotion } from '@/components/controls';

// animated-weather-artwork.web

interface AnimatedWeatherArtworkProps {
  readonly assets: WeatherIconAssetPair;
  readonly shadowOffset: number;
  readonly size: number;
}

export function AnimatedWeatherArtwork({
  assets,
  shadowOffset,
  size,
}: AnimatedWeatherArtworkProps) {
  const reducedMotion = useReducedMotion();
  const source = reducedMotion ? assets.static : assets.animated;

  return (
    <View style={styles.stage}>
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        source={source}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            transform: [{ translateX: shadowOffset }, { translateY: shadowOffset }],
          },
        ]}
        tintColor="#1D3557"
      />
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        source={source}
        style={[styles.image, { width: size, height: size }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, position: 'relative' },
  image: { position: 'absolute', left: 0, top: 0 },
});
