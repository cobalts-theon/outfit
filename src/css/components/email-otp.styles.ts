/**
 * Giao diện của email-otp.tsx: màu, font, khoảng cách, kích thước và trạng thái hiển thị.
 * Sửa bố cục ở đây; xử lý sự kiện và dữ liệu nằm trong file .tsx tương ứng.
 */
import { StyleSheet } from 'react-native';
import { homeVisualTokens, radii, typography, spacing } from '@/theme';

// Style sáu ô nhập mã OTP.
export const otpCodeInputStyles = StyleSheet.create({
  container: { position: 'relative', minHeight: 56 },
  cells: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    flex: 1,
    minHeight: 56,
    borderWidth: 2,
    borderColor: homeVisualTokens.ink,
    borderRadius: radii.control,
    backgroundColor: homeVisualTokens.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { backgroundColor: homeVisualTokens.sunflower, borderWidth: 3 },
  disabled: { backgroundColor: homeVisualTokens.unavailableSurface },
  digit: { color: homeVisualTokens.ink, fontFamily: typography.heading, fontSize: 24 },
  input: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    color: 'transparent',
    backgroundColor: 'transparent',
    fontSize: 16,
  },
});

// Style form xác thực email.
export const emailOtpFormStyles = StyleSheet.create({
  form: {
    gap: spacing.md,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: radii.control,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.field,
  },
  title: { fontFamily: typography.heading, fontSize: 20, lineHeight: 28, color: homeVisualTokens.ink },
  body: { fontFamily: typography.body, fontSize: 13, lineHeight: 21, color: homeVisualTokens.ink },
  input: {
    minHeight: 52,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    color: homeVisualTokens.ink,
    padding: spacing.sm,
    backgroundColor: homeVisualTokens.paper,
    fontFamily: typography.body,
    fontSize: 16,
  },
  code: { fontSize: 20, letterSpacing: 3 },
  error: {
    backgroundColor: homeVisualTokens.sunflower,
    padding: spacing.sm,
    borderRadius: radii.control,
    color: homeVisualTokens.ink,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 21,
  },
});
