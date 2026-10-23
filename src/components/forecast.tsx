import { radii, appThemes, homeVisualTokens, neoShadows, spacing, typography } from '@/theme';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import type { ForecastDetailItem, DetailedHourlyItem, DailyForecastItem } from '@/utils/forecast';
import { WeatherConditionIcon } from '@/components/home-weather';

// forecast-details

export function ForecastDetails({ items }: { readonly items: readonly ForecastDetailItem[] }) {
  return (
    <View style={forecastDetailsStyles.section} testID="forecast-details">
      <View style={forecastDetailsStyles.headingRow}>
        <Text accessibilityRole="header" style={forecastDetailsStyles.heading}>
          ÁNH SÁNG & TẦM NHÌN
        </Text>
        <Text style={forecastDetailsStyles.status}>THÔNG TIN PHỤ</Text>
      </View>
      {items.length === 0 ? (
        <Text style={forecastDetailsStyles.empty}>
          Chưa có dữ liệu thiên văn hoặc chi tiết khí quyển.
        </Text>
      ) : (
        <View style={forecastDetailsStyles.grid}>
          {items.map((item) => (
            <View key={item.label} style={forecastDetailsStyles.item}>
              <Text style={forecastDetailsStyles.label}>{item.label}</Text>
              <Text style={forecastDetailsStyles.value}>{item.value}</Text>
              <Text style={forecastDetailsStyles.note}>{item.note}</Text>
            </View>
          ))}
        </View>
      )}
      <Text style={forecastDetailsStyles.sourceNote}>
        Thời gian theo múi giờ của địa điểm đang xem.
      </Text>
    </View>
  );
}

const forecastDetailsColors = appThemes.light.colors;

const forecastDetailsStyles = StyleSheet.create({
  section: {
    gap: spacing.md,
    borderTopWidth: 3,
    borderColor: forecastDetailsColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  headingRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  heading: {
    color: homeVisualTokens.ink,
    fontFamily: typography.display,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 1,
  },
  status: {
    color: forecastDetailsColors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: forecastDetailsColors.border,
    overflow: 'hidden',
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  item: {
    width: '50%',
    minHeight: 112,
    gap: spacing.xxs,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: forecastDetailsColors.border,
    padding: spacing.sm,
  },
  label: {
    color: forecastDetailsColors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 0.6,
  },
  value: {
    color: forecastDetailsColors.text,
    fontFamily: typography.heading,
    fontSize: 21,
    lineHeight: 24,
  },
  note: {
    color: forecastDetailsColors.textMuted,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 17,
  },
  empty: {
    color: forecastDetailsColors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  sourceNote: {
    color: homeVisualTokens.technicalMuted,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 17,
  },
});

// detailed-hourly-forecast

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
      style={[
        detailedHourlyForecastStyles.item,
        item.isCurrent && detailedHourlyForecastStyles.itemCurrent,
      ]}
    >
      <Text style={detailedHourlyForecastStyles.day}>{item.dayLabel ?? ' '}</Text>
      <Text
        style={[
          detailedHourlyForecastStyles.time,
          item.isCurrent && detailedHourlyForecastStyles.timeCurrent,
        ]}
      >
        {item.timeLabel}
      </Text>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={detailedHourlyForecastStyles.iconWrap}
      >
        <WeatherConditionIcon condition={item.condition} isDay={item.isDay} size={60} />
      </View>
      <Text style={detailedHourlyForecastStyles.temperature}>{item.temperatureLabel}</Text>
      <Text style={detailedHourlyForecastStyles.condition}>{item.conditionLabel}</Text>
      <Text style={detailedHourlyForecastStyles.precipitation}>{item.precipitationLabel}</Text>
      <Text style={detailedHourlyForecastStyles.amount}>
        {item.precipitationAmountLabel ?? 'Lượng —'}
      </Text>
    </View>
  );
}

export function DetailedHourlyForecast({ items, unavailable }: DetailedHourlyForecastProps) {
  return (
    <View style={detailedHourlyForecastStyles.section} testID="detailed-hourly-forecast">
      <View style={detailedHourlyForecastStyles.headingRow}>
        <Text accessibilityRole="header" style={detailedHourlyForecastStyles.heading}>
          THEO GIỜ
        </Text>
        <Text style={detailedHourlyForecastStyles.status}>
          {unavailable ? 'CHƯA KHẢ DỤNG' : '24 GIỜ TỚI'}
        </Text>
      </View>
      <Text style={detailedHourlyForecastStyles.summary}>
        Vuốt ngang để so sánh thời điểm bạn định ra ngoài.
      </Text>

      {items.length === 0 ? (
        <View style={detailedHourlyForecastStyles.emptyState}>
          <Text style={detailedHourlyForecastStyles.emptyMark}>CHƯA CÓ</Text>
          <Text style={detailedHourlyForecastStyles.emptyCopy}>
            Chuỗi theo giờ chưa khả dụng. Không có giá trị thay thế được tạo ra.
          </Text>
        </View>
      ) : (
        <FlatList
          accessibilityLabel="Dự báo chi tiết theo giờ"
          contentContainerStyle={detailedHourlyForecastStyles.sequence}
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

const detailedHourlyForecastColors = appThemes.light.colors;

const detailedHourlyForecastStyles = StyleSheet.create({
  section: {
    gap: spacing.xs,
    borderBottomWidth: 3,
    borderColor: detailedHourlyForecastColors.border,
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
    color: detailedHourlyForecastColors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 0.7,
  },
  summary: {
    color: detailedHourlyForecastColors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: spacing.md,
  },
  sequence: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, gap: spacing.sm },
  item: {
    width: 132,
    minHeight: 250,
    gap: spacing.xs,
    borderWidth: 3,
    borderRadius: radii.control,
    backgroundColor: detailedHourlyForecastColors.surface,
    boxShadow: neoShadows.control,
    borderColor: detailedHourlyForecastColors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  itemCurrent: { backgroundColor: homeVisualTokens.fieldRaised },
  day: {
    minHeight: 15,
    color: homeVisualTokens.technicalMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  time: {
    color: detailedHourlyForecastColors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
  },
  timeCurrent: { color: homeVisualTokens.ink, fontFamily: typography.identitySemibold },
  iconWrap: { width: 70, height: 70, alignItems: 'center', justifyContent: 'center' },
  temperature: {
    color: detailedHourlyForecastColors.text,
    fontFamily: typography.temperature,
    fontSize: 27,
    lineHeight: 31,
    fontVariant: ['tabular-nums'],
  },
  condition: {
    minHeight: 38,
    color: detailedHourlyForecastColors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  precipitation: {
    color: detailedHourlyForecastColors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
  },
  amount: {
    color: detailedHourlyForecastColors.textMuted,
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
    borderColor: detailedHourlyForecastColors.border,
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
    color: detailedHourlyForecastColors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
});

// daily-forecast-row

export function DailyForecastRow({ item }: { readonly item: DailyForecastItem }) {
  return (
    <View
      accessibilityLabel={`${item.dateLabel}, ${item.conditionLabel}, thấp nhất và cao nhất ${item.temperatureRangeLabel}, ${item.precipitationLabel}${
        item.amountLabel === undefined ? '' : `, tổng lượng ${item.amountLabel}`
      }`}
      style={dailyForecastRowStyles.row}
      testID={`daily-forecast-${item.id}`}
    >
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <WeatherConditionIcon condition={item.condition} isDay size={56} />
      </View>
      <View style={dailyForecastRowStyles.content}>
        <View style={dailyForecastRowStyles.primaryRow}>
          <Text style={dailyForecastRowStyles.date}>{item.dateLabel}</Text>
          <Text style={dailyForecastRowStyles.temperature}>{item.temperatureRangeLabel}</Text>
        </View>
        <View style={dailyForecastRowStyles.secondaryRow}>
          <Text style={dailyForecastRowStyles.condition}>{item.conditionLabel}</Text>
          <View style={dailyForecastRowStyles.precipitationBlock}>
            <Text style={dailyForecastRowStyles.precipitation}>{item.precipitationLabel}</Text>
            <Text style={dailyForecastRowStyles.amount}>{item.amountLabel ?? 'Lượng —'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const dailyForecastRowColors = appThemes.light.colors;

const dailyForecastRowStyles = StyleSheet.create({
  row: {
    minHeight: 108,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    borderColor: dailyForecastRowColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: dailyForecastRowColors.surface,
  },
  content: { flex: 1, minWidth: 0, gap: spacing.xs },
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
    color: dailyForecastRowColors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  precipitationBlock: { flexShrink: 0, alignItems: 'flex-end', gap: 2 },
  precipitation: {
    color: dailyForecastRowColors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
  },
  amount: {
    color: dailyForecastRowColors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
  },
  temperature: {
    width: 92,
    color: dailyForecastRowColors.text,
    fontFamily: typography.temperature,
    fontSize: 21,
    lineHeight: 27,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
});
