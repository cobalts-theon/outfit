/**
 * Giao diện của plans-screen.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { Platform, StyleSheet } from 'react-native';
import { homeVisualTokens, touchTargets, typography } from '@/theme';

// Style màn hình đánh giá và chọn giờ.
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: homeVisualTokens.paper },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 116,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: homeVisualTokens.field,
    borderBottomWidth: 3,
    borderColor: homeVisualTokens.ink,
  },
  topBarCopy: { flex: 1, minWidth: 0, gap: 8 },
  topBarTitle: { fontFamily: typography.heading, color: homeVisualTokens.ink, fontSize: 21, lineHeight: 29 },
  closeSpace: { paddingRight: 4, paddingBottom: 4 },
  closeButton: {
    width: Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android,
    minHeight: Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android,
    borderWidth: 3,
    borderRadius: 12,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.coral,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '4px 4px 0px #1D3557',
  },
  closePressed: { transform: [{ translateX: 3 }, { translateY: 3 }], boxShadow: '1px 1px 0px #1D3557' },
  closeText: { fontFamily: typography.brand, fontSize: 20, lineHeight: 23, color: homeVisualTokens.ink },
  content: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 40,
    gap: 16,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
  },
  title: { fontFamily: typography.heading, color: homeVisualTokens.ink, fontSize: 25, lineHeight: 33 },
  heading: { fontFamily: typography.heading, color: homeVisualTokens.ink, fontSize: 16, lineHeight: 23 },
  body: { fontFamily: typography.body, color: homeVisualTokens.ink, fontSize: 13, lineHeight: 21 },
  fine: { fontFamily: typography.body, color: homeVisualTokens.ink, fontSize: 11, lineHeight: 18 },
  note: {
    fontFamily: typography.body,
    color: homeVisualTokens.ink,
    fontSize: 12,
    lineHeight: 20,
    padding: 12,
    backgroundColor: homeVisualTokens.sunflower,
    borderRadius: 12,
  },
  section: { borderTopWidth: 3, borderColor: homeVisualTokens.ink, paddingTop: 16, gap: 12 },
  assessmentLayout: { gap: 16 },
  sideBySide: { flexDirection: 'row', alignItems: 'flex-start' },
  settings: { flex: 1, gap: 12, minWidth: 0 },
  results: {
    flex: 1,
    minWidth: 0,
    gap: 12,
    padding: 12,
    backgroundColor: homeVisualTokens.field,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  activity: {
    minWidth: 130,
    flexGrow: 1,
    flexBasis: '42%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: homeVisualTokens.field,
    borderWidth: 3,
    borderRadius: 12,
    borderColor: homeVisualTokens.ink,
    padding: 8,
  },
  selected: { backgroundColor: homeVisualTokens.selectionSurface, borderWidth: 3 },
});

// Bố cục phụ của các khối con trên giao diện.
// Style nhãn và nhóm đồ chuẩn bị.
export const plansScreenLayoutStyles = StyleSheet.create({
  activityLabel: { flexShrink: 1 },
  preparationGroup: { gap: 8 },
});
