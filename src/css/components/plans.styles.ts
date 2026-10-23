/**
 * Giao diện của plans.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet } from 'react-native';
import { homeVisualTokens, spacing, typography } from '@/theme';

// Style các lựa chọn lập giờ.
export const plannerControlsStyles = StyleSheet.create({
  group: { gap: spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  label: { fontFamily: typography.identitySemibold, fontSize: 12, color: homeVisualTokens.ink },
  choice: {
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: homeVisualTokens.ink,
    justifyContent: 'center',
    backgroundColor: homeVisualTokens.field,
  },
  selected: { backgroundColor: homeVisualTokens.selectionSurface, borderWidth: 3 },
  pressed: { opacity: 0.7 },
  copy: { fontFamily: typography.body, fontSize: 13, color: homeVisualTokens.ink },
});

// Style thẻ đánh giá hoạt động.
export const activityAssessmentCardStyles = StyleSheet.create({
  card: {
    backgroundColor: homeVisualTokens.field,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  title: { color: homeVisualTokens.ink, fontFamily: typography.heading, fontSize: 24 },
  heading: { color: homeVisualTokens.ink, fontFamily: typography.heading, fontSize: 16 },
  body: { color: homeVisualTokens.ink, fontFamily: typography.body, fontSize: 13, lineHeight: 21 },
  fine: { color: homeVisualTokens.ink, fontFamily: typography.body, fontSize: 11, lineHeight: 18 },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: homeVisualTokens.ink,
    minHeight: 48,
  },
});

// Style danh sách giờ đã lưu.
export const savedPlanListStyles = StyleSheet.create({
  list: { gap: spacing.md },
  plan: {
    borderWidth: 2,
    borderRadius: 12,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.field,
    padding: spacing.md,
    gap: spacing.sm,
  },
  status: { fontFamily: typography.identitySemibold, color: homeVisualTokens.technicalMuted, fontSize: 12 },
  heading: { fontFamily: typography.heading, fontSize: 17, color: homeVisualTokens.ink },
  body: { fontFamily: typography.body, fontSize: 13, lineHeight: 21, color: homeVisualTokens.ink },
  fine: { fontFamily: typography.body, fontSize: 11, lineHeight: 18, color: homeVisualTokens.unavailable },
});

// Style hoạt động sắp diễn ra.
export const upcomingPlanStyles = StyleSheet.create({
  outer: { marginHorizontal: 16, marginVertical: 12, paddingRight: 4, paddingBottom: 4, gap: 12 },
  card: {
    backgroundColor: homeVisualTokens.field,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: 12,
    boxShadow: '4px 4px 0px #1D3557',
    padding: 16,
    gap: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontFamily: typography.heading, fontSize: 19, lineHeight: 26, color: homeVisualTokens.ink },
  body: { fontFamily: typography.body, fontSize: 13, lineHeight: 21, color: homeVisualTokens.ink },
  fine: { fontFamily: typography.body, fontSize: 12, lineHeight: 20, color: homeVisualTokens.ink },
});

// Bố cục phụ của các khối con trên giao diện.
// Style bố cục phụ của phần lập giờ.
export const plansLayoutStyles = StyleSheet.create({
  dateField: { flex: 1, minWidth: 140, gap: 8 },
  dateToggle: {
    backgroundColor: homeVisualTokens.sunflower,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  shrinkText: { flexShrink: 1 },
  fieldOptions: { gap: 8 },
  fieldsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionGroup: { gap: 8 },
  flexFill: { flex: 1 },
  savedGroup: { gap: spacing.sm },
  upcomingGroup: { gap: spacing.sm },
});
