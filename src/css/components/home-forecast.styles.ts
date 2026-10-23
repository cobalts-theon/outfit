/**
 * Giao diện của home-forecast.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { radii, appThemes, homeVisualTokens, neoShadows, spacing, typography, touchTargets } from '@/theme';
import { StyleSheet, Platform } from 'react-native';

const forecastPreviewColors = appThemes.light.colors;

// Style dự báo tóm tắt trên Home.
export const forecastPreviewStyles = StyleSheet.create({
  summary: {
    maxWidth: 620,
    color: forecastPreviewColors.text,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  sequence: {
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: forecastPreviewColors.border,
    marginTop: spacing.sm,
    backgroundColor: forecastPreviewColors.surface,
    overflow: 'hidden',
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  item: {
    width: 116,
    minHeight: 198,
    borderRightWidth: 2,
    borderColor: forecastPreviewColors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  itemLargeText: { width: 152 },
  itemCurrent: { backgroundColor: homeVisualTokens.fieldRaised, borderTopWidth: 0, paddingTop: spacing.sm },
  time: {
    color: forecastPreviewColors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  timeCurrent: { color: homeVisualTokens.ink, fontFamily: typography.identitySemibold },
  iconWrap: { width: 70, height: 70, alignItems: 'center', justifyContent: 'center' },
  temperature: {
    color: forecastPreviewColors.text,
    fontFamily: typography.temperature,
    fontSize: 30,
    lineHeight: 32,
    fontVariant: ['tabular-nums'],
  },
  condition: { color: forecastPreviewColors.text, fontFamily: typography.body, fontSize: 12, lineHeight: 17 },
  precipitation: {
    color: forecastPreviewColors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
  },
  emptyState: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: forecastPreviewColors.border,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  emptyMark: { color: homeVisualTokens.unavailable, fontFamily: typography.identitySemibold, fontSize: 22 },
  emptyCopy: {
    flex: 1,
    color: forecastPreviewColors.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
  forecastLinkHit: { alignSelf: 'flex-start', marginTop: spacing.sm },
  forecastLink: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    paddingHorizontal: spacing.md,
    backgroundColor: homeVisualTokens.sunflower,
    boxShadow: neoShadows.control,
  },
  forecastLinkPressed: { boxShadow: neoShadows.controlPressed, transform: [{ translateX: 3 }, { translateY: 3 }] },
  forecastLinkText: {
    color: homeVisualTokens.ink,
    fontFamily: typography.heading,
    fontSize: 17,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
});

const liveWeatherStatusStripColors = appThemes.light.colors;

const minimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

// Style trạng thái nguồn dữ liệu thời tiết.
export const liveWeatherStatusStripStyles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: liveWeatherStatusStripColors.border,
    backgroundColor: homeVisualTokens.warningSurface,
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  labelRow: { minHeight: 20, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  signal: {
    width: 9,
    height: 9,
    borderWidth: 2,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.warning,
  },
  label: {
    flex: 1,
    color: homeVisualTokens.ink,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
  },
  title: { color: liveWeatherStatusStripColors.text, fontFamily: typography.heading, fontSize: 21, lineHeight: 24 },
  detail: {
    maxWidth: 620,
    color: liveWeatherStatusStripColors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  action: {
    minHeight: minimumTouchTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: homeVisualTokens.infoSurface,
    boxShadow: neoShadows.control,
  },
  actionPressed: { boxShadow: neoShadows.controlPressed, transform: [{ translateX: 3 }, { translateY: 3 }] },
  actionText: {
    color: liveWeatherStatusStripColors.text,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.6,
  },
});
