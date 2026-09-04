import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { DetailedHourlyItem } from '@/features/forecast/model/forecast-presentation';
import { WeatherConditionIcon } from '@/features/home/components/weather-glyph';
import { appThemes, homeVisualTokens, neoShadows, spacing, typography } from '@/theme/tokens';

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
        style={styles.iconWrap}
      >
        <WeatherConditionIcon condition={item.condition} isDay={item.isDay} size={60} />
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
          <Text style={styles.emptyMark}>CHƯA CÓ</Text>
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

const colors = appThemes.light.colors;

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
    borderBottomWidth: 3,
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
    color: homeVisualTokens.ink,
    fontFamily: typography.display,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 1,
  },
  status: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 0.7,
  },
  summary: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: spacing.md,
  },
  sequence: {
    borderTopWidth: 3,
    borderColor: colors.border,
    marginTop: spacing.xs,
    paddingLeft: spacing.md,
    backgroundColor: colors.surface,
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  item: {
    width: 132,
    minHeight: 250,
    gap: spacing.xs,
    borderRightWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  itemCurrent: {
    backgroundColor: homeVisualTokens.fieldRaised,
  },
  day: {
    minHeight: 15,
    color: homeVisualTokens.technicalMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  time: {
    color: colors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
  },
  timeCurrent: {
    color: homeVisualTokens.ink,
    fontFamily: typography.identitySemibold,
  },
  iconWrap: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperature: {
    color: colors.text,
    fontFamily: typography.temperature,
    fontSize: 27,
    lineHeight: 31,
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
  emptyState: {
    minHeight: 128,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: 3,
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
