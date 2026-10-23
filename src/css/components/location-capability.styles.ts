/**
 * Giao diện của location-capability.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet, Platform } from 'react-native';
import { appThemes, homeVisualTokens, radii, spacing, typography, neoShadows, touchTargets } from '@/theme';
import type { ViewStyle } from 'react-native';

const locationCapabilityStripColors = appThemes.light.colors;

const minimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

// Style thanh trạng thái GPS.
export const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationCapabilityStripColors.border,
    backgroundColor: homeVisualTokens.fieldDeep,
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  containerCompact: { paddingVertical: spacing.sm },
  readyContainer: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationCapabilityStripColors.border,
    backgroundColor: homeVisualTokens.fieldDeep,
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  readyCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  readyDetail: {
    color: locationCapabilityStripColors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 0.45,
  },
  readyPlaceName: {
    color: locationCapabilityStripColors.text,
    fontFamily: typography.heading,
    fontSize: 17,
    lineHeight: 21,
  },
  labelRow: { minHeight: 20, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  signal: { width: 9, height: 9, borderWidth: 2, borderColor: homeVisualTokens.ink },
  label: {
    flex: 1,
    color: homeVisualTokens.ink,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
  },
  title: { color: locationCapabilityStripColors.text, fontFamily: typography.heading, fontSize: 21, lineHeight: 24 },
  titleCompact: { fontSize: 19, lineHeight: 22 },
  detail: {
    maxWidth: 620,
    color: locationCapabilityStripColors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xxs },
  action: {
    minHeight: minimumTouchTarget,
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.infoSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    boxShadow: neoShadows.control,
  },
  actionSecondary: { backgroundColor: homeVisualTokens.field },
  actionPressed: { boxShadow: neoShadows.controlPressed, transform: [{ translateX: 3 }, { translateY: 3 }] },
  actionText: {
    color: locationCapabilityStripColors.text,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.6,
  },
  actionTextSecondary: { color: locationCapabilityStripColors.text },
});

// Bố cục phụ của các khối con trên giao diện.
// Style tín hiệu vị trí chọn thủ công.
export const locationCapabilityLayoutStyles = StyleSheet.create({
  manualSignal: { backgroundColor: homeVisualTokens.technical },
});

// Style thay đổi theo kích thước, trạng thái hoặc tiến độ chuyển động.
// Chọn màu báo nguồn vị trí.
export function positionSignalStyle(source: string): ViewStyle {
  return {
    backgroundColor: source === 'last_known'
      ? homeVisualTokens.warning
      : homeVisualTokens.calm,
  };
}

// Đặt màu tín hiệu vị trí.
export function signalColorStyle(signalColor: string): ViewStyle {
  return { backgroundColor: signalColor };
}
