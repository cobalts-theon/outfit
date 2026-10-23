/**
 * Giao diện của animated-weather-artwork.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet } from 'react-native';

// Style WebView hiển thị ảnh thời tiết.
export const styles = StyleSheet.create({ webView: { flex: 1, backgroundColor: 'transparent' } });

// CSS dùng bên trong WebView để hiển thị ảnh SVG trên điện thoại.
// Tạo CSS cho ảnh thời tiết trong WebView.
export function weatherArtworkCss(size: number, shadowOffset: number) {
  return `html,body{position:relative;margin:0;width:100%;height:100%;overflow:hidden;background:transparent}.art{position:absolute;top:0;left:0;width:${size}px;height:${size}px;object-fit:contain}.shadow{transform:translate(${shadowOffset}px,${shadowOffset}px);filter:grayscale(1) brightness(0)}`;
}
