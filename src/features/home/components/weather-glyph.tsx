import { StyleSheet, View } from 'react-native';

import { AnimatedWeatherArtwork } from '@/components/weather/animated-weather-artwork';
import { StaticWeatherArtwork } from '@/components/weather/static-weather-artwork';
import { weatherIconAssets } from '@/components/weather/weather-icon-assets';
import type { CurrentWeather } from '@/features/weather/domain/current-weather';
import type { WeatherCondition } from '@/features/weather/domain/weather-condition';
import { getWeatherIconKey } from '@/features/home/model/weather-glyph-state';
import { homeVisualTokens } from '@/theme/tokens';

interface WeatherConditionIconProps {
  readonly condition: WeatherCondition;
  readonly isDay: boolean;
  readonly size?: number;
  readonly framed?: boolean;
  readonly animated?: boolean;
}

export function WeatherConditionIcon({
  condition,
  isDay,
  size = 40,
  framed = false,
  animated = false,
}: WeatherConditionIconProps) {
  const assets = weatherIconAssets[getWeatherIconKey(condition, isDay)];
  const shadowOffset = Math.max(3, Math.round(size * 0.055));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.iconStage,
        { width: size + shadowOffset, height: size + shadowOffset },
        framed && styles.iconStageFramed,
      ]}
    >
      <View pointerEvents="none" style={styles.artwork}>
        {animated ? (
          <AnimatedWeatherArtwork assets={assets} shadowOffset={shadowOffset} size={size} />
        ) : (
          <StaticWeatherArtwork assets={assets} shadowOffset={shadowOffset} size={size} />
        )}
      </View>
    </View>
  );
}

interface WeatherGlyphProps {
  readonly weather: CurrentWeather;
  readonly compact?: boolean;
}

export function WeatherGlyph({ weather, compact = false }: WeatherGlyphProps) {
  return (
    <View
      accessibilityLabel={`Biểu tượng thời tiết ${weather.daylight.isDay ? 'ban ngày' : 'ban đêm'}`}
      accessibilityRole="image"
      style={[styles.heroFrame, compact && styles.heroFrameCompact]}
    >
      <WeatherConditionIcon
        animated
        condition={weather.condition}
        framed
        isDay={weather.daylight.isDay}
        size={compact ? 154 : 178}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconStage: {
    position: 'relative',
    overflow: 'visible',
  },
  iconStageFramed: {
    backgroundColor: homeVisualTokens.fieldRaised,
  },
  artwork: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'transparent',
  },
  heroFrame: {
    width: 178,
    height: 186,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    backgroundColor: '#D6E5FF',
    overflow: 'hidden',
  },
  heroFrameCompact: {
    width: 152,
    height: 164,
  },
});
