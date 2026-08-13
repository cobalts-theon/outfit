import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { DetailedHourlyItem } from '@/features/forecast/model/forecast-presentation';
import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

interface DetailedHourlyForecastProps {
  readonly items: readonly DetailedHourlyItem[];
  readonly unavailable: boolean;
}

function HourlyItem({ item }: { readonly item: DetailedHourlyItem }) {
  return (
    <View
      accessibilityLabel={`${item.timeLabel}, ${item.conditionLabel}, ${item.temperatureLabel}, ${item.precipitationLabel}${
        item.precipitationAmountLabel === undefined
          ? ''
          : `, lượng ${item.precipitationAmountLabel}`
      }`}
      style={[styles.item, item.isCurrent && styles.itemCurrent]}
    >
      <Text style={styles.day}>{item.dayLabel ?? ' '}</Text>
      <Text style={[styles.time, item.isCurrent && styles.timeCurrent]}>{item.timeLabel}</Text>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.signal}
      >
        <View style={[styles.signalLine, !item.isDay && styles.signalLineNight]} />
        <View style={styles.signalDot} />
      </View>
      <Text style={styles.temperature}>{item.temperatureLabel}</Text>
      <Text style={styles.condition}>{item.conditionLabel}</Text>
      <Text style={styles.precipitation}>{item.precipitationLabel}</Text>
      <Text style={styles.amount}>{item.precipitationAmountLabel ?? 'Lượng —'}</Text>
    </View>
  );
}

export function DetailedHourlyForecast({
  items,
  unavailable,
}: DetailedHourlyForecastProps) {
  return (
    <View style={styles.section} testID="detailed-hourly-forecast">
      <View style={styles.headingRow}>
        <Text accessibilityRole="header" style={styles.heading}>
          THEO GIỜ
        </Text>
        <Text style={styles.status}>{unavailable ? 'CHƯA KHẢ DỤNG' : '24 GIỜ TỚI'}</Text>
      </View>
      <Text style={styles.summary}>
        Nhiệt độ, điều kiện và xác suất mưa theo giờ địa phương.
      </Text>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyMark}>--:--</Text>
          <Text style={styles.emptyCopy}>
            Chuỗi theo giờ chưa khả dụng. Không có giá trị thay thế được tạo ra.
          </Text>
        </View>
      ) : (
        <FlatList
          accessibilityLabel="Dự báo chi tiết theo giờ"
          contentContainerStyle={styles.sequence}
          data={items}
          horizontal
          initialNumToRender={8}
          keyExtractor={(item) => item.id}
          maxToRenderPerBatch={8}
          nestedScrollEnabled
          removeClippedSubviews
          renderItem={({ item }) => <HourlyItem item={item} />}
          showsHorizontalScrollIndicator={false}
          windowSize={5}
        />
      )}
    </View>
  );
}

const colors = appThemes.dark.colors;

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingTop: spacing.lg,
  },
  headingRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  heading: {
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1,
  },
  status: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 9,
    lineHeight: 15,
    letterSpacing: 0.7,
  },
  summary: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: spacing.md,
  },
  sequence: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginTop: spacing.xs,
    paddingLeft: spacing.md,
  },
  item: {
    width: 118,
    minHeight: 214,
    gap: spacing.xs,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  itemCurrent: {
    backgroundColor: homeVisualTokens.fieldRaised,
    borderTopWidth: 2,
    borderTopColor: homeVisualTokens.technical,
  },
  day: {
    minHeight: 15,
    color: homeVisualTokens.technicalMuted,
    fontFamily: typography.identity,
    fontSize: 8,
    lineHeight: 13,
    letterSpacing: 0.5,
  },
  time: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 10,
    lineHeight: 16,
  },
  timeCurrent: {
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
  },
  signal: {
    width: 44,
    height: 12,
    justifyContent: 'center',
  },
  signalLine: {
    width: 44,
    height: 2,
    backgroundColor: homeVisualTokens.attention,
  },
  signalLineNight: {
    backgroundColor: homeVisualTokens.technicalMuted,
  },
  signalDot: {
    position: 'absolute',
    right: 9,
    width: 7,
    height: 7,
    backgroundColor: colors.text,
  },
  temperature: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 27,
    lineHeight: 33,
    fontVariant: ['tabular-nums'],
  },
  condition: {
    minHeight: 38,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  precipitation: {
    color: homeVisualTokens.attention,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 15,
  },
  amount: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 9,
    lineHeight: 14,
  },
  emptyState: {
    minHeight: 128,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  emptyMark: {
    color: homeVisualTokens.unavailable,
    fontFamily: typography.identitySemibold,
    fontSize: 22,
  },
  emptyCopy: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
});
