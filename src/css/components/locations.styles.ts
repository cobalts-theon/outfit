/**
 * Giao diện của locations.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet } from 'react-native';
import { appThemes, homeVisualTokens, radii, spacing, typography } from '@/theme';

const locationStylesColors = appThemes.light.colors;

// Style tìm kiếm và địa điểm đã lưu.
export const locationStyles = StyleSheet.create({
  introPanel: {
    gap: spacing.xs,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.md,
    backgroundColor: locationStylesColors.surface,
    boxShadow: '6px 6px 0px #1D3557',
  },
  introTitle: { color: locationStylesColors.text, fontFamily: typography.heading, fontSize: 20, lineHeight: 28 },
  body: { color: locationStylesColors.text, fontFamily: typography.body, fontSize: 13, lineHeight: 20 },
  introBody: { color: locationStylesColors.text, fontFamily: typography.body, fontSize: 13, lineHeight: 20 },
  searchPanel: {
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.md,
    backgroundColor: locationStylesColors.surface,
  },
  sectionLabel: {
    color: locationStylesColors.text,
    fontFamily: typography.brand,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1,
  },
  sectionTitle: { color: locationStylesColors.text, fontFamily: typography.heading, fontSize: 19, lineHeight: 23 },
  input: {
    minHeight: 52,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    paddingHorizontal: spacing.sm,
    color: locationStylesColors.text,
    fontFamily: typography.body,
    fontSize: 15,
    backgroundColor: homeVisualTokens.paper,
  },
  notice: {
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.sm,
    color: locationStylesColors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: homeVisualTokens.mint,
  },
  statePanel: {
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.md,
    backgroundColor: locationStylesColors.surface,
  },
  errorPanel: { backgroundColor: homeVisualTokens.dangerSurface },
  resultsSection: { gap: spacing.sm },
  savedSection: {
    gap: spacing.sm,
    borderTopWidth: 4,
    borderColor: locationStylesColors.border,
    paddingTop: spacing.lg,
  },
  locationRow: {
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.sm,
    backgroundColor: locationStylesColors.surface,
  },
  savedRow: {
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.sm,
    backgroundColor: locationStylesColors.surface,
  },
  locationCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  locationName: { color: locationStylesColors.text, fontFamily: typography.heading, fontSize: 17, lineHeight: 21 },
  locationContext: { color: locationStylesColors.textMuted, fontFamily: typography.body, fontSize: 11, lineHeight: 16 },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  authPrompt: {
    gap: spacing.md,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.warningSurface,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  emptyText: {
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.md,
    color: locationStylesColors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
    backgroundColor: homeVisualTokens.unavailableSurface,
  },
  providerNote: { color: locationStylesColors.textMuted, fontFamily: typography.body, fontSize: 10, lineHeight: 16 },
});
