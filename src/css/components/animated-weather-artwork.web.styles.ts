/**
 * Giao diện của animated-weather-artwork.web.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet } from 'react-native';
import type { ImageStyle } from 'react-native';

// Style ảnh thời tiết trên web.
export const styles = StyleSheet.create({
  stage: { flex: 1, position: 'relative' },
  image: { position: 'absolute', left: 0, top: 0 },
});

// Style thay đổi theo kích thước, trạng thái hoặc tiến độ chuyển động.
// Tạo kích thước và độ lệch bóng ảnh.
export function artworkShadowStyle(size: number, shadowOffset: number): ImageStyle {
  return { width: size, height: size, transform: [{ translateX: shadowOffset }, { translateY: shadowOffset }] };
}

// Đặt kích thước ảnh thời tiết.
export function artworkSizeStyle(size: number): ImageStyle {
  return { width: size, height: size };
}
