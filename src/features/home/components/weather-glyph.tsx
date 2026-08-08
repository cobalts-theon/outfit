import { StyleSheet, View } from 'react-native';

import type { CurrentWeather } from '@/features/weather/domain/current-weather';
import { getWeatherGlyphState } from '@/features/home/model/weather-glyph-state';
import { appThemes, homeVisualTokens } from '@/theme/tokens';

import { DitherLayer } from './home-primitives';

interface WeatherGlyphProps {
  readonly weather: CurrentWeather;
  readonly compact?: boolean;
}

const AQI_PARTICLES = Array.from({ length: 18 }, (_, index) => index);

export function WeatherGlyph({ weather, compact = false }: WeatherGlyphProps) {
  const {
    hasCloud,
    hasAtmosphere,
    hasStorm,
    hasPrecipitation,
    moonPhase,
    hasVisibleMoon,
    moonIsFull,
    moonIsNew,
    moonIsQuarter,
    moonIsWaxing,
    particleCount,
    hasElevatedAqi,
    windRotation,
    windOpacity,
  } = getWeatherGlyphState(weather);
  const accessibilityLabel = [
    weather.daylight.isDay ? 'Cảnh thời tiết ban ngày' : 'Cảnh thời tiết ban đêm',
    hasCloud ? 'có mây' : 'trời quang',
    hasPrecipitation ? 'có giáng thủy' : undefined,
    hasStorm ? 'có dông hoặc bão' : undefined,
    hasAtmosphere ? 'tầm nhìn bị ảnh hưởng' : undefined,
    hasVisibleMoon ? 'có hiển thị pha trăng' : undefined,
    `gió ${Math.round(weather.wind.speedMetersPerSecond * 3.6)} ki-lô-mét trên giờ`,
    weather.airQuality === undefined ? undefined : `AQI ${Math.round(weather.airQuality.index)}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[styles.frame, compact && styles.frameCompact]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.artwork}
      >
        <View style={styles.gridHorizontalOne} />
        <View style={styles.gridHorizontalTwo} />
        <View style={styles.gridVerticalOne} />
        <View style={styles.gridVerticalTwo} />

        {weather.daylight.isDay ? <View style={styles.celestial} /> : null}

        {hasVisibleMoon ? (
          <View
            style={[
              styles.celestial,
              styles.celestialNight,
              moonIsNew && styles.moonNew,
            ]}
          >
            {moonIsFull || moonIsNew ? null : (
              <View
                style={[
                  moonIsQuarter ? styles.moonHalf : styles.moonCutout,
                  moonIsWaxing ? styles.moonMaskWaxing : styles.moonMaskWaning,
                ]}
              />
            )}
          </View>
        ) : null}

        <View
          style={[
            styles.windGroup,
            { opacity: windOpacity, transform: [{ rotate: windRotation }] },
          ]}
        >
          <View style={styles.windLineLong} />
          <View style={styles.windLineShort} />
        </View>

        {particleCount === 0 ? null : (
          <View style={styles.particleField}>
            {AQI_PARTICLES.slice(0, particleCount).map((particle) => (
              <View
                key={particle}
                style={[
                  styles.particle,
                  hasElevatedAqi && styles.particleElevated,
                  particle % 3 === 0 && styles.particleFaint,
                ]}
              />
            ))}
          </View>
        )}

        {hasCloud ? (
          <View style={styles.cloudGroup}>
            <View style={[styles.cloudBand, styles.cloudBandTop]} />
            <View style={[styles.cloudBand, styles.cloudBandMiddle]} />
            <View style={[styles.cloudBand, styles.cloudBandBottom]} />
          </View>
        ) : null}

        {hasAtmosphere ? (
          <View style={styles.hazeGroup}>
            <View style={styles.hazeLine} />
            <View style={[styles.hazeLine, styles.hazeLineShort]} />
            <View style={styles.hazeLine} />
          </View>
        ) : null}

        {hasPrecipitation ? (
          <View style={styles.rainGroup}>
            <View style={styles.rainLine} />
            <View style={[styles.rainLine, styles.rainLineOffset]} />
            <View style={styles.rainLine} />
            <View style={[styles.rainLine, styles.rainLineOffset]} />
          </View>
        ) : null}

        {hasStorm ? (
          <View style={styles.stormMark}>
            <View style={styles.stormSegmentOne} />
            <View style={styles.stormSegmentTwo} />
          </View>
        ) : null}

        <DitherLayer dense={hasAtmosphere || hasPrecipitation} style={styles.dither} />
      </View>
    </View>
  );
}

const colors = appThemes.dark.colors;

const styles = StyleSheet.create({
  frame: {
    width: 152,
    height: 152,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.fieldDeep,
    overflow: 'hidden',
  },
  frameCompact: {
    width: 132,
    height: 132,
  },
  artwork: {
    flex: 1,
  },
  gridHorizontalOne: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: homeVisualTokens.grid,
  },
  gridHorizontalTwo: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: homeVisualTokens.grid,
  },
  gridVerticalOne: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: homeVisualTokens.grid,
  },
  gridVerticalTwo: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: homeVisualTokens.grid,
  },
  celestial: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: homeVisualTokens.attention,
  },
  celestialNight: {
    backgroundColor: colors.text,
  },
  moonCutout: {
    position: 'absolute',
    top: -4,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: homeVisualTokens.fieldDeep,
  },
  moonHalf: {
    position: 'absolute',
    top: 0,
    width: 27,
    height: 54,
    backgroundColor: homeVisualTokens.fieldDeep,
  },
  moonMaskWaxing: {
    left: 0,
  },
  moonMaskWaning: {
    right: 0,
  },
  moonNew: {
    borderWidth: 1,
    borderColor: colors.textMuted,
    backgroundColor: 'transparent',
  },
  windGroup: {
    position: 'absolute',
    left: 18,
    top: 56,
    width: 64,
    height: 24,
    justifyContent: 'space-between',
  },
  windLineLong: {
    width: 64,
    height: 2,
    backgroundColor: homeVisualTokens.technical,
  },
  windLineShort: {
    width: 38,
    height: 2,
    alignSelf: 'flex-end',
    backgroundColor: homeVisualTokens.technicalMuted,
  },
  particleField: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: 54,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  particle: {
    width: 2,
    height: 2,
    backgroundColor: homeVisualTokens.attention,
  },
  particleElevated: {
    width: 3,
    height: 3,
    backgroundColor: homeVisualTokens.danger,
  },
  particleFaint: {
    opacity: 0.45,
  },
  cloudGroup: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 73,
    height: 44,
  },
  cloudBand: {
    position: 'absolute',
    height: 9,
    backgroundColor: colors.textMuted,
  },
  cloudBandTop: {
    top: 0,
    left: 32,
    right: 8,
  },
  cloudBandMiddle: {
    top: 12,
    left: 12,
    right: 0,
    backgroundColor: '#C2C8C6',
  },
  cloudBandBottom: {
    top: 24,
    left: 0,
    right: 26,
    backgroundColor: '#6F797C',
  },
  hazeGroup: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    gap: 7,
  },
  hazeLine: {
    height: 3,
    backgroundColor: colors.textMuted,
    opacity: 0.7,
  },
  hazeLineShort: {
    width: '70%',
    alignSelf: 'flex-end',
  },
  rainGroup: {
    position: 'absolute',
    left: 34,
    right: 30,
    bottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rainLine: {
    width: 2,
    height: 26,
    backgroundColor: homeVisualTokens.technical,
    transform: [{ rotate: '14deg' }],
  },
  rainLineOffset: {
    marginTop: 8,
  },
  stormMark: {
    position: 'absolute',
    right: 22,
    bottom: 14,
    width: 24,
    height: 42,
  },
  stormSegmentOne: {
    position: 'absolute',
    top: 0,
    left: 9,
    width: 5,
    height: 24,
    backgroundColor: homeVisualTokens.warning,
    transform: [{ rotate: '28deg' }],
  },
  stormSegmentTwo: {
    position: 'absolute',
    top: 19,
    left: 5,
    width: 5,
    height: 23,
    backgroundColor: homeVisualTokens.warning,
    transform: [{ rotate: '28deg' }],
  },
  dither: {
    left: 10,
    bottom: 9,
  },
});
