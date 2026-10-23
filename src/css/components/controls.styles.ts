/**
 * Giao diện của controls.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { radii, appThemes, homeVisualTokens, spacing, touchTargets, typography, layout } from '@/theme';
import { Platform, StyleSheet } from 'react-native';
import type { Animated, ViewStyle } from 'react-native';

const neoButtonColors = appThemes.light.colors;

const neoButtonMinimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

// Style nút dùng chung và trạng thái nhấn.
export const neoButtonStyles = StyleSheet.create({
  button: {
    minHeight: neoButtonMinimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: neoButtonColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: homeVisualTokens.coral,
    boxShadow: '4px 4px 0px #1D3557',
  },
  neutral: { backgroundColor: homeVisualTokens.field },
  secondary: { backgroundColor: neoButtonColors.secondary, boxShadow: '4px 4px 0px #1D3557' },
  secondaryText: { color: neoButtonColors.onSecondary },
  danger: { backgroundColor: homeVisualTokens.coral },
  disabled: { backgroundColor: homeVisualTokens.unavailableSurface, boxShadow: 'none' },
  pressed: { transform: [{ translateX: 3 }, { translateY: 3 }], boxShadow: '1px 1px 0px #1D3557' },
  text: {
    color: neoButtonColors.text,
    fontFamily: typography.heading,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  textDisabled: { color: neoButtonColors.text },
});

// Style nút quay lại.
export const backStyles = StyleSheet.create({
  // Native header clips outside the measured custom-view bounds. Reserve
  // space for the entire 4px shadow and the pressed translation inside them.
  shadowSpace: { width: 56, height: 56, paddingTop: 2, paddingLeft: 2, marginRight: 12 },
  shadowPlate: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 48,
    height: 48,
    borderRadius: radii.control,
    backgroundColor: appThemes.light.colors.border,
  },
  button: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: homeVisualTokens.coral,
    borderWidth: 3,
    borderColor: appThemes.light.colors.border,
    borderRadius: radii.control,
  },
  pressed: { transform: [{ translateX: 3 }, { translateY: 3 }] },
  arrow: { color: appThemes.light.colors.text, fontFamily: typography.heading, fontSize: 26, lineHeight: 32 },
});

// Style nhãn trạng thái.
export const neoBadgeStyles = StyleSheet.create({
  frame: {
    alignSelf: 'flex-start',
    flexShrink: 1,
    maxWidth: '100%',
    borderWidth: 2,
    borderColor: homeVisualTokens.ink,
    borderRadius: radii.control,
    backgroundColor: homeVisualTokens.infoSurface,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    boxShadow: '3px 3px 0px #1D3557',
    marginRight: 3,
    marginBottom: 3,
  },
  neutral: { backgroundColor: homeVisualTokens.field },
  green: { backgroundColor: homeVisualTokens.mint },
  orange: { backgroundColor: homeVisualTokens.coral },
  label: { color: homeVisualTokens.ink, fontFamily: typography.identitySemibold, fontSize: 11, lineHeight: 17 },
});

const neoSheetColors = appThemes.light.colors;

const neoSheetMinimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

// Style bảng nội dung dạng modal.
export const neoSheetStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: neoSheetColors.background },
  keyboardAvoiding: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 4,
    borderColor: neoSheetColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: neoSheetColors.surface,
  },
  headerCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  title: { color: neoSheetColors.text, fontFamily: typography.heading, fontSize: 21, lineHeight: 28 },
  closeButton: {
    width: neoSheetMinimumTouchTarget,
    minHeight: neoSheetMinimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: neoSheetColors.border,
    backgroundColor: neoSheetColors.surface,
    boxShadow: '4px 4px 0px #1D3557',
  },
  closeButtonCoral: { backgroundColor: homeVisualTokens.coral },
  closeButtonPressed: { transform: [{ translateX: 3 }, { translateY: 3 }], boxShadow: '1px 1px 0px #1D3557' },
  closeText: { color: neoSheetColors.text, fontFamily: typography.brand, fontSize: 20, lineHeight: 23 },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
});

// Style danh sách chọn giờ.
export const timeDropdownStyles = StyleSheet.create({
  group: { gap: spacing.sm, flex: 1, minWidth: 130 },
  label: { fontFamily: typography.heading, fontSize: 16, lineHeight: 23, color: homeVisualTokens.ink },
  text: { fontFamily: typography.body, fontSize: 17, color: homeVisualTokens.ink },
  control: {
    minHeight: 52,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: radii.control,
    padding: spacing.sm,
    backgroundColor: homeVisualTokens.field,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filled: { backgroundColor: homeVisualTokens.selectionSurface },
  open: { backgroundColor: homeVisualTokens.infoSurface },
  close: {
    backgroundColor: homeVisualTokens.paleBlueField,
    borderWidth: 2,
    borderColor: homeVisualTokens.ink,
    alignItems: 'center',
  },
  backdrop: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: 'rgba(33,33,33,0.5)' },
  menu: {
    maxHeight: '75%',
    backgroundColor: homeVisualTokens.field,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: radii.control,
    padding: spacing.md,
    gap: spacing.sm,
  },
  option: { height: 52, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radii.control },
  selected: { backgroundColor: homeVisualTokens.sunflower },
});

// Style thay đổi theo kích thước, trạng thái hoặc tiến độ chuyển động.
// Tính độ mờ và vị trí khi trượt vào.
export function slideInAnimationStyle(progress: Animated.Value, horizontal: boolean, distance: number): Animated.WithAnimatedValue<ViewStyle> {
  return {
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }),
    transform: horizontal
      ? [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }]
      : [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  };
}

// Tính hiệu ứng hiện và ẩn nội dung.
export function slideRevealAnimationStyle(progress: Animated.Value): Animated.WithAnimatedValue<ViewStyle> {
  return {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
  };
}
