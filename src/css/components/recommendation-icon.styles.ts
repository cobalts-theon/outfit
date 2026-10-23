/**
 * Giao diện của recommendation-icon.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet } from 'react-native';
import { homeVisualTokens, appThemes, radii } from '@/theme';

const recommendationActionIconColors = appThemes.light.colors;

// Style icon của lời khuyên.
export const recommendationActionIconStyles = StyleSheet.create({
  group: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  frame: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: recommendationActionIconColors.border,
    backgroundColor: recommendationActionIconColors.surface,
  },
  compactFrame: { width: 34, height: 34, borderWidth: 2 },
  compactImage: { width: 25, height: 25 },
  framePrimary: { backgroundColor: homeVisualTokens.sunflower },
  image: { width: 36, height: 36 },
});
