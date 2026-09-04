import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import type { WeatherIconAssetPair } from './weather-icon-assets';

interface StaticWeatherArtworkProps {
  readonly assets: WeatherIconAssetPair;
  readonly shadowOffset: number;
  readonly size: number;
}

export function StaticWeatherArtwork({ assets, shadowOffset, size }: StaticWeatherArtworkProps) {
  const recyclingKey = String(assets.static);

  return (
    <View style={styles.stage}>
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        recyclingKey={`${recyclingKey}-shadow`}
        source={assets.static}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            transform: [{ translateX: shadowOffset }, { translateY: shadowOffset }],
          },
        ]}
        tintColor="#101010"
        transition={0}
      />
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        recyclingKey={recyclingKey}
        source={assets.static}
        style={[styles.image, { width: size, height: size }]}
        transition={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    position: 'relative',
  },
  image: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
