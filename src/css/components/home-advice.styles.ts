/**
 * Giao diện của home-advice.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet } from 'react-native';
import { homeVisualTokens, spacing, typography, appThemes, neoShadows, radii } from '@/theme';
import type { ViewStyle } from 'react-native';
import type { RecommendationSeverity } from '@/types/weather';

// Style nút mở phần chọn giờ.
export const activityPlanningButtonStyles = StyleSheet.create({
  container: { marginHorizontal: spacing.md, paddingRight: 4, paddingBottom: 4 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 76,
    padding: 12,
    backgroundColor: homeVisualTokens.mint,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: 12,
    boxShadow: '4px 4px 0px #1D3557',
  },
  pressed: { transform: [{ translateX: 3 }, { translateY: 3 }], boxShadow: '1px 1px 0px #1D3557' },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  title: { fontFamily: typography.heading, fontSize: 16, lineHeight: 22, color: homeVisualTokens.ink },
  subtitle: { fontFamily: typography.body, fontSize: 11, lineHeight: 17, color: homeVisualTokens.ink },
  arrow: { fontFamily: typography.heading, fontSize: 22, color: homeVisualTokens.ink },
});

const conditionsSummaryColors = appThemes.light.colors;

// Style tóm tắt thời tiết.
export const conditionsSummaryStyles = StyleSheet.create({
  summary: {
    marginHorizontal: spacing.sm,
    marginRight: spacing.sm + 4,
    marginBottom: 4,
    padding: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: conditionsSummaryColors.border,
    backgroundColor: conditionsSummaryColors.surface,
    boxShadow: neoShadows.control,
    gap: spacing.xxs,
  },
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  location: {
    fontFamily: typography.heading,
    color: conditionsSummaryColors.text,
    fontSize: 17,
    lineHeight: 23,
    flexShrink: 1,
  },
  conditions: { fontFamily: typography.body, color: conditionsSummaryColors.text, fontSize: 12, lineHeight: 19 },
  source: { fontFamily: typography.body, color: conditionsSummaryColors.text, fontSize: 10, lineHeight: 16 },
});

const dailyActionPanelColors = appThemes.light.colors;

// Style khối hành động cần làm ngay.
export const dailyActionPanelStyles = StyleSheet.create({
  secondaryHeading: {
    fontFamily: typography.identitySemibold,
    color: dailyActionPanelColors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  list: { marginTop: spacing.sm },
  item: {
    borderTopWidth: 2,
    borderColor: dailyActionPanelColors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  priority: { marginHorizontal: -spacing.md, paddingHorizontal: spacing.md },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headingStacked: { flexDirection: 'column', alignItems: 'flex-start' },
  headingCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  title: { fontFamily: typography.heading, color: dailyActionPanelColors.text, fontSize: 18, lineHeight: 25 },
  compactTitle: { fontSize: 15, lineHeight: 22 },
  reason: { fontFamily: typography.body, color: dailyActionPanelColors.text, fontSize: 13, lineHeight: 21 },
  note: {
    fontFamily: typography.body,
    color: dailyActionPanelColors.textMuted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
});

// Style lời nhắc cho thời tiết sắp tới.
export const upcomingGuidanceStyles = StyleSheet.create({
  item: { gap: spacing.xs, paddingTop: spacing.sm },
  title: { color: appThemes.light.colors.text, fontFamily: typography.heading, fontSize: 17, lineHeight: 24 },
  reason: { color: appThemes.light.colors.text, fontFamily: typography.body, fontSize: 13, lineHeight: 21 },
});

// Style thay đổi theo kích thước, trạng thái hoặc tiến độ chuyển động.
// Chọn màu nền theo mức độ lời khuyên.
export function actionSurfaceStyle(severity: RecommendationSeverity, isOpportunity: boolean, priority: boolean): ViewStyle {
  const surface = severity === 'danger'
    ? homeVisualTokens.dangerSurface
    : severity === 'warning'
      ? homeVisualTokens.warningSurface
      : severity === 'attention'
        ? homeVisualTokens.attentionSurface
        : isOpportunity
          ? homeVisualTokens.field
          : priority
            ? homeVisualTokens.sunflower
            : homeVisualTokens.field;
  return { backgroundColor: surface };
}
