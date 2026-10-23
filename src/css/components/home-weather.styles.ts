/**
 * Giao diện của home-weather.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { radii, appThemes, homeVisualTokens, neoShadows, spacing, typography } from '@/theme';
import { StyleSheet } from 'react-native';
import type { ImageStyle, ViewStyle } from 'react-native';

const homePrimitivesColors = appThemes.light.colors;

// Style tiêu đề và khung nội dung dùng chung.
export const homePrimitivesStyles = StyleSheet.create({
  systemLabelRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  systemLabelGroup: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
  systemLabel: {
    flexShrink: 1,
    color: homeVisualTokens.ink,
    fontFamily: typography.heading,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0.4,
  },
  systemValue: {
    color: homePrimitivesColors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
    textAlign: 'right',
  },
  section: {
    borderTopWidth: 3,
    borderColor: homePrimitivesColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionDeep: { backgroundColor: homePrimitivesColors.surface },
  sectionElevated: {
    borderWidth: 3,
    borderRadius: radii.control,
    marginHorizontal: spacing.sm,
    marginBottom: 6,
    boxShadow: neoShadows.panel,
  },
});

// Style ảnh thời tiết tĩnh.
export const staticWeatherArtworkStyles = StyleSheet.create({
  stage: { flex: 1, position: 'relative' },
  image: { position: 'absolute', left: 0, top: 0 },
});

// Style khung hình thời tiết.
export const weatherGlyphStyles = StyleSheet.create({
  iconStage: { position: 'relative', overflow: 'visible' },
  iconStageFramed: { backgroundColor: homeVisualTokens.fieldRaised },
  artwork: { position: 'absolute', inset: 0, backgroundColor: 'transparent' },
  heroFrame: {
    width: 178,
    height: 186,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    backgroundColor: '#D8E2DC',
    overflow: 'hidden',
  },
  heroFrameCompact: { width: 152, height: 164 },
});

const weatherHeroColors = appThemes.light.colors;

// Style khối thời tiết chính.
export const weatherHeroStyles = StyleSheet.create({
  wrapper: { position: 'relative', marginHorizontal: spacing.sm, marginRight: spacing.sm + 7, marginBottom: 7 },
  shadow: {
    borderRadius: radii.control,
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
    borderRadius: radii.control,
    borderColor: weatherHeroColors.border,
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
  heroRowCompact: { minHeight: 172, gap: spacing.xs },
  heroRowReflow: { minHeight: 320, flexDirection: 'column', alignItems: 'stretch' },
  reading: { flex: 1, minWidth: 0 },
  temperature: {
    color: weatherHeroColors.text,
    fontFamily: typography.temperature,
    fontSize: 88,
    lineHeight: 90,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
  },
  temperatureCompact: { fontSize: 78, lineHeight: 80 },
  degree: { color: homeVisualTokens.technical, fontSize: 38 },
  condition: {
    color: weatherHeroColors.text,
    fontFamily: typography.display,
    fontSize: 21,
    lineHeight: 28,
    textTransform: 'uppercase',
  },
  feelsRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs, marginTop: spacing.xs },
  feelsLabel: {
    color: weatherHeroColors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  feelsValue: {
    color: weatherHeroColors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 14,
    lineHeight: 20,
    fontVariant: ['tabular-nums'],
  },
});

const environmentMetricsColors = appThemes.light.colors;

// Style các chỉ số môi trường.
export const environmentMetricsStyles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: environmentMetricsColors.border,
    marginTop: spacing.sm,
    overflow: 'hidden',
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  metricsStacked: { flexDirection: 'column' },
  metric: {
    flex: 1,
    minWidth: 0,
    minHeight: 96,
    justifyContent: 'flex-start',
    gap: spacing.xs,
    borderRightWidth: 2,
    borderColor: environmentMetricsColors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  metricLast: { borderRightWidth: 0 },
  metricStacked: {
    flex: 0,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRightWidth: 0,
    borderBottomWidth: 2,
  },
  metricStackedLast: { borderBottomWidth: 0 },
  metricLabel: {
    minHeight: 16,
    color: environmentMetricsColors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  metricLabelStacked: { width: 54 },
  metricValue: {
    includeFontPadding: false,
    color: environmentMetricsColors.text,
    fontFamily: typography.temperature,
    fontSize: 31,
    lineHeight: 34,
    fontVariant: ['tabular-nums'],
  },
  metricValueStacked: { width: 64 },
  metricUnavailable: { color: homeVisualTokens.unavailable },
  metricDetail: { color: environmentMetricsColors.text, fontFamily: typography.body, fontSize: 12, lineHeight: 17 },
  metricDetailStacked: { flex: 1 },
  scaleNote: {
    color: environmentMetricsColors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
});

// Style thay đổi theo kích thước, trạng thái hoặc tiến độ chuyển động.
// Tạo kích thước và độ lệch bóng ảnh.
export function artworkShadowStyle(size: number, shadowOffset: number): ImageStyle {
  return { width: size, height: size, transform: [{ translateX: shadowOffset }, { translateY: shadowOffset }] };
}

// Đặt kích thước ảnh thời tiết.
export function artworkSizeStyle(size: number): ImageStyle {
  return { width: size, height: size };
}

// Chừa diện tích cho ảnh và bóng.
export function artworkStageStyle(size: number, shadowOffset: number): ViewStyle {
  return { width: size + shadowOffset, height: size + shadowOffset };
}
