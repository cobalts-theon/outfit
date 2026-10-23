/**
 * Phiên bản hình thời tiết dành cho web; được chọn theo đuôi .web.tsx.
 * Giữ cách trình bày phù hợp với khả năng của trình duyệt.
 */
import { Image } from 'expo-image';
import { View } from 'react-native';
import type { WeatherIconAssetPair } from '@/components/home-weather';
import { useReducedMotion } from '@/components/controls';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { styles } from '@/css/components/animated-weather-artwork.web.styles';
import { artworkShadowStyle, artworkSizeStyle } from '@/css/components/animated-weather-artwork.web.styles';

// animated-weather-artwork.web

interface AnimatedWeatherArtworkProps {
  readonly assets: WeatherIconAssetPair;
  readonly shadowOffset: number;
  readonly size: number;
}

// Hiển thị hình thời tiết chuyển động.
export function AnimatedWeatherArtwork({ assets, shadowOffset, size }: AnimatedWeatherArtworkProps) {
  const reducedMotion = useReducedMotion();
  const source = reducedMotion ? assets.static : assets.animated;

  return (
    <View style={styles.stage}>
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        source={source}
        style={[styles.image, artworkShadowStyle(size, shadowOffset)]}
        tintColor="#1D3557"
      />
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        source={source}
        style={[styles.image, artworkSizeStyle(size)]}
      />
    </View>
  );
}
