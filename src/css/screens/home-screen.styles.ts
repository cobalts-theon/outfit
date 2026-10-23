/**
 * Giao diện của home-screen.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet } from 'react-native';
import { appThemes, layout, spacing, typography } from '@/theme';

export const colors = appThemes.light.colors;

// Style bố cục màn hình Home.
export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.lg },
  frame: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  evidenceStack: { gap: spacing.lg, paddingTop: spacing.sm },
  weatherDetailsToggle: { marginHorizontal: spacing.sm, marginBottom: spacing.sm },
  footer: {
    gap: spacing.xs,
    borderTopWidth: 3,
    borderColor: colors.border,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
  },
  footerSecondary: { color: colors.text, fontFamily: typography.body, fontSize: 12, lineHeight: 18 },
  attribution: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.4,
  },
});
