/**
 * Giao diện của before-start.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet } from 'react-native';
import { homeVisualTokens, spacing, typography } from '@/theme';

// Style màn hình thiết lập ban đầu.
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: homeVisualTokens.paper },
  header: {
    padding: spacing.md,
    backgroundColor: homeVisualTokens.field,
    borderBottomWidth: 3,
    borderColor: homeVisualTokens.ink,
    gap: spacing.sm,
  },
  title: { color: homeVisualTokens.ink, fontFamily: typography.heading, fontSize: 21, lineHeight: 29 },
  body: { color: homeVisualTokens.ink, fontFamily: typography.body, fontSize: 13, lineHeight: 21 },
  content: { padding: spacing.md, paddingBottom: spacing.xl, width: '100%', maxWidth: 720, alignSelf: 'center' },
});
