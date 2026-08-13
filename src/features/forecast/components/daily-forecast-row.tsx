import { StyleSheet, Text, View } from 'react-native';

import type { DailyForecastItem } from '@/features/forecast/model/forecast-presentation';
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
      <View style={styles.dateBlock}>
        <Text style={styles.date}>{item.dateLabel}</Text>
        <Text style={styles.condition}>{item.conditionLabel}</Text>
      </View>
      <View style={styles.precipitationBlock}>
        <Text style={styles.precipitation}>{item.precipitationLabel}</Text>
        <Text style={styles.amount}>{item.amountLabel ?? 'Lượng —'}</Text>
      </View>
      <Text style={styles.temperature}>{item.temperatureRangeLabel}</Text>
    </View>
  );
}

const colors = appThemes.dark.colors;

const styles = StyleSheet.create({
  row: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  date: {
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  condition: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  precipitationBlock: {
    width: 90,
    gap: spacing.xxs,
  },
  precipitation: {
    color: homeVisualTokens.attention,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 16,
  },
  amount: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 9,
    lineHeight: 14,
  },
  temperature: {
    width: 92,
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 20,
    lineHeight: 28,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
});
