import { StyleSheet, Text, View } from 'react-native';

import type { DailyForecastItem } from '@/features/forecast/model/forecast-presentation';
import { WeatherConditionIcon } from '@/features/home/components/weather-glyph';
import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

export function DailyForecastRow({ item }: { readonly item: DailyForecastItem }) {
  return (
    <View
      accessibilityLabel={`${item.dateLabel}, ${item.conditionLabel}, thấp nhất và cao nhất ${item.temperatureRangeLabel}, ${item.precipitationLabel}${
        item.amountLabel === undefined ? '' : `, tổng lượng ${item.amountLabel}`
      }`}
      style={styles.row}
      testID={`daily-forecast-${item.id}`}
    >
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <WeatherConditionIcon condition={item.condition} isDay size={56} />
      </View>
      <View style={styles.content}>
        <View style={styles.primaryRow}>
          <Text style={styles.date}>{item.dateLabel}</Text>
          <Text style={styles.temperature}>{item.temperatureRangeLabel}</Text>
        </View>
        <View style={styles.secondaryRow}>
          <Text style={styles.condition}>{item.conditionLabel}</Text>
          <View style={styles.precipitationBlock}>
            <Text style={styles.precipitation}>{item.precipitationLabel}</Text>
            <Text style={styles.amount}>{item.amountLabel ?? 'Lượng —'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const colors = appThemes.light.colors;

const styles = StyleSheet.create({
  row: {
    minHeight: 108,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  date: {
    flex: 1,
    color: homeVisualTokens.ink,
    fontFamily: typography.heading,
    fontSize: 18,
    lineHeight: 21,
    letterSpacing: 0.5,
  },
  condition: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  precipitationBlock: {
    flexShrink: 0,
    alignItems: 'flex-end',
    gap: 2,
  },
  precipitation: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
  },
  amount: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
  },
  temperature: {
    width: 92,
    color: colors.text,
    fontFamily: typography.temperature,
    fontSize: 21,
    lineHeight: 27,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
});
