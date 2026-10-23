/**
 * Giao diện của forecast.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { radii, appThemes, homeVisualTokens, neoShadows, spacing, typography } from '@/theme';
import { StyleSheet } from 'react-native';

const forecastDetailsColors = appThemes.light.colors;

// Style các chỉ số dự báo chi tiết.
export const forecastDetailsStyles = StyleSheet.create({
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
  value: { color: forecastDetailsColors.text, fontFamily: typography.heading, fontSize: 21, lineHeight: 24 },
  note: { color: forecastDetailsColors.textMuted, fontFamily: typography.body, fontSize: 11, lineHeight: 17 },
  empty: { color: forecastDetailsColors.textMuted, fontFamily: typography.body, fontSize: 13, lineHeight: 20 },
  sourceNote: { color: homeVisualTokens.technicalMuted, fontFamily: typography.body, fontSize: 11, lineHeight: 17 },
});

const detailedHourlyForecastColors = appThemes.light.colors;

// Style danh sách dự báo theo giờ.
export const detailedHourlyForecastStyles = StyleSheet.create({
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
  time: { color: detailedHourlyForecastColors.text, fontFamily: typography.identity, fontSize: 11, lineHeight: 17 },
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
  emptyMark: { color: homeVisualTokens.unavailable, fontFamily: typography.identitySemibold, fontSize: 22 },
  emptyCopy: {
    flex: 1,
    color: detailedHourlyForecastColors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
});

const dailyForecastRowColors = appThemes.light.colors;

// Style dòng dự báo theo ngày.
export const dailyForecastRowStyles = StyleSheet.create({
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
  primaryRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  secondaryRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  date: {
    flex: 1,
    color: homeVisualTokens.ink,
    fontFamily: typography.heading,
    fontSize: 18,
    lineHeight: 21,
    letterSpacing: 0.5,
  },
  condition: { flex: 1, color: dailyForecastRowColors.text, fontFamily: typography.body, fontSize: 13, lineHeight: 19 },
  precipitationBlock: { flexShrink: 0, alignItems: 'flex-end', gap: 2 },
  precipitation: {
    color: dailyForecastRowColors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
  },
  amount: { color: dailyForecastRowColors.textMuted, fontFamily: typography.identity, fontSize: 11, lineHeight: 16 },
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
