import { StyleSheet, Text, View } from 'react-native';

import type { CurrentWeather } from '@/features/weather/domain/current-weather';
import {
  getConditionLabel,
  getDaylightLabel,
} from '@/features/home/model/home-prototype';
import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

import { SystemLabel } from './home-primitives';
import { WeatherGlyph } from './weather-glyph';

interface WeatherHeroProps {
  readonly weather: CurrentWeather;
  readonly compact?: boolean;
  readonly reflow?: boolean;
}

export function WeatherHero({ weather, compact = false, reflow = false }: WeatherHeroProps) {
  const temperature = Math.round(weather.temperature.valueCelsius);
  const feelsLike = Math.round(weather.temperature.feelsLikeCelsius);
  const conditionLabel = getConditionLabel(weather.condition);
  const daylightLabel = getDaylightLabel(weather.daylight);

  return (
    <View
      accessibilityLabel="Điều kiện hiện tại"
      style={styles.wrapper}
      testID="weather-hero"
    >
      <View pointerEvents="none" style={styles.shadow} />
      <View style={styles.container}>
        <SystemLabel index="00" label="HIỆN TẠI" value={daylightLabel.toUpperCase()} />

        <View
          style={[
            styles.heroRow,
            compact && styles.heroRowCompact,
            reflow && styles.heroRowReflow,
          ]}
        >
          <View style={styles.reading}>
            <Text
              accessibilityLabel={`${temperature} độ C`}
              adjustsFontSizeToFit
              minimumFontScale={0.74}
              numberOfLines={1}
              style={[styles.temperature, compact && styles.temperatureCompact]}
            >
              {temperature}
              <Text style={styles.degree}>°</Text>
            </Text>
            <Text maxFontSizeMultiplier={1.6} style={styles.condition}>
              {conditionLabel}
            </Text>
            <View style={styles.feelsRow}>
              <Text style={styles.feelsLabel}>CẢM NHẬN</Text>
              <Text accessibilityLabel={`Cảm nhận như ${feelsLike} độ C`} style={styles.feelsValue}>
                {feelsLike}°C
              </Text>
            </View>
          </View>

          <WeatherGlyph compact={compact} weather={weather} />
        </View>
      </View>
    </View>
  );
}

const colors = appThemes.light.colors;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginHorizontal: spacing.sm,
    marginRight: spacing.sm + 7,
    marginBottom: 7,
  },
  shadow: {
    position: 'absolute',
    top: 7,
    right: -7,
    bottom: -7,
    left: 7,
    backgroundColor: homeVisualTokens.ink,
  },
  container: {
    position: 'relative',
    borderWidth: 3,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: homeVisualTokens.field,
    overflow: 'hidden',
  },
  heroRow: {
    minHeight: 188,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  heroRowCompact: {
    minHeight: 172,
    gap: spacing.xs,
  },
  heroRowReflow: {
    minHeight: 320,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  reading: {
    flex: 1,
    minWidth: 0,
  },
  temperature: {
    color: colors.text,
    fontFamily: typography.temperature,
    fontSize: 88,
    lineHeight: 90,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
  },
  temperatureCompact: {
    fontSize: 78,
    lineHeight: 80,
  },
  degree: {
    color: homeVisualTokens.technical,
    fontSize: 38,
  },
  condition: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 21,
    lineHeight: 28,
    textTransform: 'uppercase',
  },
  feelsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  feelsLabel: {
    color: colors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  feelsValue: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 14,
    lineHeight: 20,
    fontVariant: ['tabular-nums'],
  },
});
