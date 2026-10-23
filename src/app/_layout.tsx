/**
 * Điểm khởi động giao diện: chờ tải font, gắn các Provider rồi mở điều hướng.
 * Lỗi ngoài dự kiến được chuyển sang màn hình cho phép thử lại.
 */
import type { ErrorBoundaryProps } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppBootstrap, AppProviders, RootNavigator } from '@/context/app';
import { AppErrorFallback } from '@/components/app-shell';

// _layout

// Hiển thị lỗi và cho phép thử lại.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <AppErrorFallback error={error} onRetry={retry} />
    </SafeAreaProvider>
  );
}

// Khởi tạo giao diện và điều hướng.
export default function RootLayout() {
  const { isReady } = useAppBootstrap();

  if (!isReady) {
    return null;
  }

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
