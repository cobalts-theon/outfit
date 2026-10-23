/**
 * Giao diện của welcome-screen.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet } from 'react-native';
import { homeVisualTokens, spacing, typography } from '@/theme';
import type { ViewStyle } from 'react-native';

// Style màn hình chào.
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: homeVisualTokens.paper },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  tagline: { flex: 1, textAlign: 'right', fontFamily: typography.body, fontSize: 11, color: homeVisualTokens.ink },
  slide: { paddingHorizontal: 4, gap: 12 },
  art: { width: '100%', height: '100%' },
  artFrame: {
    width: '100%',
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2A9D8F',
  },
  eyebrow: { fontFamily: typography.body, fontSize: 11, color: homeVisualTokens.ink, textAlign: 'center' },
  title: {
    fontFamily: typography.heading,
    fontSize: 27,
    lineHeight: 35,
    textAlign: 'center',
    color: homeVisualTokens.ink,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 21,
    color: homeVisualTokens.ink,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginVertical: 4 },
  dotTarget: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.field,
  },
  dotActive: { width: 26, backgroundColor: homeVisualTokens.coral },
  actions: { marginTop: 'auto', gap: 14, paddingTop: 8, paddingRight: 4 },
  note: { textAlign: 'center', fontFamily: typography.body, fontSize: 11, lineHeight: 18, color: homeVisualTokens.ink },
});

// Style thay đổi theo kích thước, trạng thái hoặc tiến độ chuyển động.
// Đặt chiều rộng trang giới thiệu.
export function slideWidthStyle(width: number): ViewStyle {
  return { width };
}

// Tính chiều cao khung ảnh giới thiệu.
export function artFrameHeightStyle(width: number): ViewStyle {
  return { height: Math.min((width - 8) * 0.625, 245) };
}

// Giữ chiều cao vùng tiêu đề.
export function titleHeightStyle(titleHeight: number): ViewStyle {
  return { minHeight: titleHeight };
}

// Giữ chiều cao vùng nội dung.
export function bodyHeightStyle(bodyHeight: number): ViewStyle {
  return { minHeight: bodyHeight };
}
