/**
 * Giao diện khởi động và thanh điều hướng; nhận theme hiện tại từ app.tsx.
 * Chỉnh màn hình chờ, nền trang và tiêu đề điều hướng tại đây.
 */
import { StyleSheet } from 'react-native';
import { type AppTheme, typography } from '@/theme';

// Tạo style màn hình chờ và điều hướng.
export function createAppStyles(theme: AppTheme) {
  return StyleSheet.create({
    loadingScreen: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      backgroundColor: theme.colors.background,
    },
    loadingText: { fontFamily: typography.body, color: theme.colors.text },
    content: { backgroundColor: theme.colors.background },
    header: { backgroundColor: theme.colors.surface },
    headerTitle: { fontFamily: typography.heading, fontSize: 18 },
  });
}
