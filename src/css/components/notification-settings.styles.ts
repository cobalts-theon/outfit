/**
 * Giao diện của notification-settings.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { radii, appThemes, homeVisualTokens, spacing, typography } from '@/theme';
import { StyleSheet } from 'react-native';

const colors = appThemes.light.colors;

// Style bảng cài đặt thông báo.
export const styles = StyleSheet.create({
  statusPanel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surface,
    boxShadow: '6px 6px 0px #1D3557',
  },
  icon: { width: 64, height: 64, flexShrink: 0 },
  statusCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  statusLabel: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  statusTitle: { color: colors.text, fontFamily: typography.heading, fontSize: 22, lineHeight: 28 },
  statusDetail: { color: colors.text, fontFamily: typography.body, fontSize: 13, lineHeight: 20 },
  section: { borderTopWidth: 3, borderColor: colors.border },
  sectionTitle: {
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 18,
    lineHeight: 22,
  },
  topicRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  checkMark: {
    width: 16,
    height: 16,
    flexShrink: 0,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.infoSurface,
  },
  topicText: { flex: 1, minWidth: 0, color: colors.text, fontFamily: typography.body, fontSize: 14, lineHeight: 21 },
  scopeNote: {
    gap: spacing.xs,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  scopeTitle: { color: colors.text, fontFamily: typography.heading, fontSize: 16, lineHeight: 20 },
  scopeCopy: { color: colors.text, fontFamily: typography.body, fontSize: 13, lineHeight: 20 },
  scopeState: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  feedback: {
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
    backgroundColor: homeVisualTokens.sunflower,
  },
  actions: { gap: spacing.sm },
  platformNote: { color: colors.textMuted, fontFamily: typography.body, fontSize: 11, lineHeight: 17 },
});
