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
    <View accessibilityLabel="Điều kiện hiện tại" style={styles.container} testID="weather-hero">
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
            minimumFontScale={0.8}
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
  );
}

const colors = appThemes.dark.colors;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: homeVisualTokens.field,
    overflow: 'hidden',
  },
  heroRow: {
    minHeight: 196,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  heroRowCompact: {
    minHeight: 170,
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
    fontFamily: typography.identitySemibold,
    fontSize: 82,
    lineHeight: 92,
    letterSpacing: -6,
    fontVariant: ['tabular-nums'],
  },
  temperatureCompact: {
    fontSize: 68,
    lineHeight: 78,
    letterSpacing: -5,
  },
  degree: {
    color: homeVisualTokens.technical,
    fontSize: 44,
    letterSpacing: -2,
  },
  condition: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 16,
    lineHeight: 22,
  },
  feelsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  feelsLabel: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  feelsValue: {
    color: colors.textMuted,
    fontFamily: typography.identitySemibold,
    fontSize: 14,
    lineHeight: 20,
    fontVariant: ['tabular-nums'],
  },
});
