/**
 * Giao diện của app-shell.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { radii, appThemes, homeVisualTokens, spacing, touchTargets, typography, neoShadows } from '@/theme';
import { Platform, StyleSheet } from 'react-native';

const appDrawerColors = appThemes.light.colors;

const appDrawerMinimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

// Style menu điều hướng.
export const appDrawerStyles = StyleSheet.create({
  modalRoot: { flex: 1, flexDirection: 'row' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#1D355799' },
  slide: { width: '86%', maxWidth: 370 },
  drawer: {
    flex: 1,
    borderTopRightRadius: radii.overlay,
    borderBottomRightRadius: radii.overlay,
    width: '100%',
    maxWidth: 370,
    borderRightWidth: 4,
    borderColor: appDrawerColors.border,
    backgroundColor: homeVisualTokens.paper,
    boxShadow: '8px 0px 0px #1D3557',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 4,
    borderColor: appDrawerColors.border,
    padding: spacing.md,
    backgroundColor: appDrawerColors.surface,
  },
  headingCopy: { flex: 1, minWidth: 0 },
  menuLabel: {
    color: appDrawerColors.text,
    fontFamily: typography.brand,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
  },
  heading: { color: appDrawerColors.text, fontFamily: typography.heading, fontSize: 25, lineHeight: 30 },
  closeButton: {
    width: appDrawerMinimumTouchTarget,
    minHeight: appDrawerMinimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appDrawerColors.border,
    backgroundColor: homeVisualTokens.coral,
  },
  closeButtonPressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
  closeText: { color: appDrawerColors.text, fontFamily: typography.brand, fontSize: 20 },
  actionsScroll: { flex: 1 },
  actions: { gap: spacing.sm, padding: spacing.md, paddingBottom: spacing.lg },
  action: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appDrawerColors.border,
    backgroundColor: appDrawerColors.surface,
    boxShadow: '5px 5px 0px #1D3557',
  },
  actionCream: { backgroundColor: '#F1FAEE' },
  actionMint: { backgroundColor: homeVisualTokens.mint },
  actionYellow: { backgroundColor: homeVisualTokens.sunflower },
  actionCoral: { backgroundColor: homeVisualTokens.coral },
  actionPressed: { transform: [{ translateX: 3 }, { translateY: 3 }], boxShadow: '2px 2px 0px #1D3557' },
  actionIndex: {
    width: 48,
    paddingTop: spacing.sm,
    borderRightWidth: 3,
    borderColor: appDrawerColors.border,
    color: appDrawerColors.text,
    fontFamily: typography.brand,
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
    backgroundColor: homeVisualTokens.infoSurface,
    borderTopLeftRadius: radii.control - 3,
    borderBottomLeftRadius: radii.control - 3,
  },
  actionCopy: { flex: 1, justifyContent: 'center', gap: spacing.xxs, padding: spacing.sm },
  actionLabel: { color: appDrawerColors.text, fontFamily: typography.heading, fontSize: 18, lineHeight: 22 },
  actionDetail: { color: appDrawerColors.text, fontFamily: typography.body, fontSize: 11, lineHeight: 16 },
  footer: {
    gap: spacing.xxs,
    borderTopWidth: 4,
    borderColor: appDrawerColors.border,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.paper,
  },
  footerBrand: { color: appDrawerColors.text, fontFamily: typography.brand, fontSize: 13, lineHeight: 16 },
  footerDetail: { color: appDrawerColors.textMuted, fontFamily: typography.identity, fontSize: 10, lineHeight: 14 },
});

const appMastheadColors = appThemes.light.colors;

const appMastheadMinimumTouchTarget =
  Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

// Style đầu trang ứng dụng.
export const appMastheadStyles = StyleSheet.create({
  wrap: { position: 'relative', marginHorizontal: spacing.sm, marginRight: spacing.sm + 5, marginBottom: 5 },
  shadow: {
    borderRadius: radii.control,
    position: 'absolute',
    top: 5,
    right: -5,
    bottom: -5,
    left: 5,
    backgroundColor: appMastheadColors.border,
  },
  bar: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appMastheadColors.border,
    paddingHorizontal: spacing.xs,
    backgroundColor: appMastheadColors.surface,
  },
  iconButton: {
    width: appMastheadMinimumTouchTarget,
    height: appMastheadMinimumTouchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appMastheadColors.border,
    backgroundColor: homeVisualTokens.coral,
  },
  iconButtonPressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
  hamburger: { width: 23, gap: 5 },
  hamburgerLine: { width: 23, height: 3, backgroundColor: appMastheadColors.text },
  hamburgerLineShort: { width: 16 },
  wordmark: { flex: 1, minWidth: 0, alignItems: 'center' },
  wordmarkPrimary: {
    color: appMastheadColors.text,
    fontFamily: typography.brand,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: -0.4,
  },
  wordmarkSecondary: {
    color: appMastheadColors.text,
    fontFamily: typography.brandRegular,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1.3,
  },
  avatar: {
    width: appMastheadMinimumTouchTarget,
    height: appMastheadMinimumTouchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appMastheadColors.border,
    backgroundColor: homeVisualTokens.unavailableSurface,
  },
  avatarSignedIn: { backgroundColor: appMastheadColors.surface },
  avatarImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 9 },
  avatarText: { color: appMastheadColors.text, fontFamily: typography.brand, fontSize: 14, lineHeight: 17 },

  authSignal: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: appMastheadColors.border,
    backgroundColor: homeVisualTokens.unavailableSurface,
  },
  authSignalSignedIn: { backgroundColor: homeVisualTokens.calm },
});

const appErrorColors = appThemes.light.colors;

// Style màn hình báo lỗi.
export const appErrorStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: appErrorColors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: homeVisualTokens.dangerSurface,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appErrorColors.border,
    margin: spacing.md,
  },
  label: { color: appErrorColors.text, fontFamily: typography.identitySemibold, fontSize: 12, letterSpacing: 1 },
  title: { color: appErrorColors.text, fontFamily: typography.display, fontSize: 28, lineHeight: 34 },
  message: { color: appErrorColors.textMuted, fontFamily: typography.body, fontSize: 16, lineHeight: 24 },
  debugMessage: { color: appErrorColors.text, fontFamily: typography.identity, fontSize: 12, lineHeight: 18 },
  button: {
    minHeight: touchTargets.android,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.infoSurface,
    boxShadow: neoShadows.control,
  },
  buttonPressed: { boxShadow: neoShadows.controlPressed, transform: [{ translateX: 3 }, { translateY: 3 }] },
  buttonLabel: { color: appErrorColors.text, fontFamily: typography.heading, fontSize: 18 },
});
