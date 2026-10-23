/**
 * Giao diện của recommendation-preview.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet } from 'react-native';
import { homeVisualTokens, spacing, typography, appThemes } from '@/theme';
import type { TextStyle } from 'react-native';
import type { RecommendationSeverity } from '@/types/weather';

const recommendationPreviewColors = appThemes.light.colors;

// Style lời khuyên và bằng chứng chi tiết.
export const recommendationPreviewStyles = StyleSheet.create({
  rows: { borderTopWidth: 2, borderColor: recommendationPreviewColors.border, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderBottomWidth: 2,
    borderColor: recommendationPreviewColors.border,
    paddingVertical: spacing.md,
  },
  rowPrimaryAction: { marginHorizontal: -spacing.md, paddingHorizontal: spacing.md },
  label: {
    width: 72,
    color: recommendationPreviewColors.text,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 1,
  },
  labelEmphasized: { color: homeVisualTokens.ink },
  value: {
    flex: 1,
    maxWidth: 580,
    color: recommendationPreviewColors.text,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  valueEmphasized: { fontFamily: typography.headingSemibold },
  disclaimer: {
    maxWidth: 580,
    color: recommendationPreviewColors.text,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  placeholder: {
    gap: spacing.xs,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: recommendationPreviewColors.border,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  placeholderTitle: {
    color: recommendationPreviewColors.text,
    fontFamily: typography.heading,
    fontSize: 22,
    lineHeight: 25,
  },
  placeholderCopy: {
    maxWidth: 580,
    color: recommendationPreviewColors.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
  liveList: { borderTopWidth: 2, borderColor: recommendationPreviewColors.border, marginTop: spacing.sm },
  liveItem: { borderBottomWidth: 2, borderColor: recommendationPreviewColors.border, paddingVertical: spacing.md },
  liveHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.sm },
  liveMeta: { flex: 1, minWidth: 0, gap: spacing.xxs },
  liveGroup: {
    color: homeVisualTokens.ink,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.7,
  },
  liveDetailRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.xs },
  liveSeverity: {
    flexShrink: 0,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
    textAlign: 'right',
  },
  liveEquipment: {
    flex: 1,
    minWidth: 0,
    color: recommendationPreviewColors.textMuted,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.45,
  },
  liveRows: { borderTopWidth: 2, borderColor: recommendationPreviewColors.border },
  limitedNote: {
    color: homeVisualTokens.unavailable,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.45,
    marginTop: spacing.sm,
  },
});

// Style thay đổi theo kích thước, trạng thái hoặc tiến độ chuyển động.
// Tạo style nhãn mức độ cảnh báo.
export function severityBadgeStyle(severityColor: string): TextStyle {
  return { color: homeVisualTokens.ink, backgroundColor: severityColor, paddingHorizontal: 4 };
}

export const severityColors: Record<RecommendationSeverity, string> = {
  info: homeVisualTokens.calm,
  attention: homeVisualTokens.attention,
  warning: homeVisualTokens.warning,
  danger: homeVisualTokens.danger,
};
