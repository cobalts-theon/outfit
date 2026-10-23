import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { homeVisualTokens, radii, typography, spacing } from '@/theme';
import { NeoBadge, NeoButton, SlideIn } from '@/components/controls';
import {
  createPasswordRecovery,
  emailOtpErrorMessage,
  normalizeOtpEmail,
  OTP_RESEND_DELAY_MS,
  requestEmailOtp,
  verifyEmailOtp,
  type EmailOtpPurpose,
} from '@/services/account';

// otp-code-input

// One native input preserves paste, autofill, backspace and screen-reader behavior.
export function OtpCodeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const count = 6;
  return (
    <View style={otpCodeInputStyles.container}>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={otpCodeInputStyles.cells}
      >
        {Array.from({ length: count }, (_, index) => (
          <View
            key={index}
            style={[
              otpCodeInputStyles.cell,
              focused && index === Math.min(value.length, count - 1) && otpCodeInputStyles.active,
              disabled && otpCodeInputStyles.disabled,
            ]}
          >
            <Text style={otpCodeInputStyles.digit}>{value[index] ?? '·'}</Text>
          </View>
        ))}
      </View>
      <TextInput
        accessibilityLabel="Mã xác thực trong email, 6 chữ số"
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 6))}
        editable={!disabled}
        inputMode="numeric"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={6}
        caretHidden
        selection={{ start: value.length, end: value.length }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect={false}
        style={otpCodeInputStyles.input}
      />
    </View>
  );
}

const otpCodeInputStyles = StyleSheet.create({
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

// email-otp-form

export function EmailOtpForm({
  initialEmail,
  purpose,
  initiallySent = false,
  onCancel,
}: {
  initialEmail: string;
  purpose: EmailOtpPurpose;
  initiallySent?: boolean;
  onCancel: () => void;
}) {
  const [recovery] = useState(() =>
    purpose === 'recovery' ? createPasswordRecovery() : undefined,
  );
  const [verified, setVerified] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  useEffect(() => () => recovery?.dispose(), [recovery]);
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(initiallySent);
  const [token, setToken] = useState('');
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendAt, setResendAt] = useState(initiallySent ? Date.now() + OTP_RESEND_DELAY_MS : 0);
  const [now, setNow] = useState(Date.now());
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  useEffect(() => {
    if (!resendAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [resendAt]);
  const send = async () => {
    if (lock.current || Date.now() < resendAt) return;
    lock.current = true;
    setPending(true);
    setError('');
    setMessage('');
    try {
      const normalized = normalizeOtpEmail(email);
      if (recovery) await recovery.send(normalized);
      else await requestEmailOtp(normalized, purpose);
      setEmail(normalized);
      setSent(true);
      setToken('');
      setNow(Date.now());
      setResendAt(Date.now() + OTP_RESEND_DELAY_MS);
      setMessage('Nếu email đủ điều kiện, thư xác thực sẽ được gửi. Kiểm tra cả thư rác.');
    } catch (e) {
      setError(emailOtpErrorMessage(e));
    } finally {
      lock.current = false;
      setPending(false);
    }
  };
  const verify = async () => {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setError('');
    setMessage('');
    try {
      if (recovery) {
        await recovery.verify(email, token);
        setToken('');
        setVerified(true);
      } else await verifyEmailOtp(email, token);
    } catch (e) {
      setError(emailOtpErrorMessage(e));
    } finally {
      lock.current = false;
      setPending(false);
    }
  };
  const savePassword = async () => {
    if (lock.current || !recovery) return;
    lock.current = true;
    setPending(true);
    setError('');
    try {
      await recovery.updatePassword(password, confirmation);
      setPassword('');
      setConfirmation('');
      setCompleted(true);
    } catch (e) {
      setError(emailOtpErrorMessage(e));
    } finally {
      lock.current = false;
      setPending(false);
    }
  };
  if (completed)
    return (
      <SlideIn style={emailOtpFormStyles.form}>
        <NeoBadge label="ĐÃ ĐỔI MẬT KHẨU" tone="green" />
        <Text style={emailOtpFormStyles.body}>
          Mật khẩu đã được cập nhật. Dùng mật khẩu mới để đăng nhập.
        </Text>
        <NeoButton label="VỀ ĐĂNG NHẬP" onPress={onCancel} />
      </SlideIn>
    );
  if (verified)
    return (
      <SlideIn style={emailOtpFormStyles.form}>
        <NeoBadge label="ĐÃ XÁC MINH EMAIL" />
        <Text accessibilityRole="header" style={emailOtpFormStyles.title}>
          ĐẶT MẬT KHẨU MỚI
        </Text>
        <Text style={emailOtpFormStyles.body}>Chọn mật khẩu mới có ít nhất 6 ký tự.</Text>
        <TextInput
          accessibilityLabel="Mật khẩu mới"
          placeholder="Mật khẩu mới"
          placeholderTextColor={homeVisualTokens.unavailable}
          style={emailOtpFormStyles.input}
          value={password}
          onChangeText={setPassword}
          editable={!pending}
          secureTextEntry
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          accessibilityLabel="Nhập lại mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          placeholderTextColor={homeVisualTokens.unavailable}
          style={emailOtpFormStyles.input}
          value={confirmation}
          onChangeText={setConfirmation}
          editable={!pending}
          secureTextEntry
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {error ? (
          <Text accessibilityLiveRegion="polite" style={emailOtpFormStyles.error}>
            {error}
          </Text>
        ) : null}
        <NeoButton
          disabled={pending}
          label={pending ? 'ĐANG LƯU…' : 'LƯU MẬT KHẨU MỚI'}
          onPress={() => void savePassword()}
        />
        <NeoButton disabled={pending} tone="neutral" label="HỦY" onPress={onCancel} />
      </SlideIn>
    );
  return (
    <SlideIn style={emailOtpFormStyles.form}>
      <NeoBadge label="XÁC THỰC EMAIL" />
      <Text accessibilityRole="header" style={emailOtpFormStyles.title}>
        {purpose === 'signup' ? 'XÁC NHẬN TÀI KHOẢN' : 'QUÊN MẬT KHẨU'}
      </Text>
      {sent ? (
        <>
          <Text style={emailOtpFormStyles.body}>
            Nhập mã trong email gửi đến {email}. Mã chỉ dùng một lần.
          </Text>
          <OtpCodeInput value={token} onChange={setToken} disabled={pending} />
        </>
      ) : (
        <>
          <Text style={emailOtpFormStyles.body}>
            {purpose === 'signup'
              ? 'Gửi lại mã để xác nhận email của tài khoản.'
              : 'Nhập email đã đăng ký. Mã OTP giúp bạn xác minh và đặt mật khẩu mới.'}
          </Text>
          <TextInput
            accessibilityLabel="Email nhận OTP"
            editable={!pending}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            inputMode="email"
            placeholder="ban@example.com"
            placeholderTextColor={homeVisualTokens.unavailable}
            style={emailOtpFormStyles.input}
          />
        </>
      )}
      {message ? (
        <Text accessibilityLiveRegion="polite" style={emailOtpFormStyles.body}>
          {message}
        </Text>
      ) : null}
      {error ? (
        <Text accessibilityLiveRegion="polite" style={emailOtpFormStyles.error}>
          {error}
        </Text>
      ) : null}
      <NeoButton
        disabled={pending}
        label={pending ? 'ĐANG XỬ LÝ…' : sent ? 'XÁC MINH MÃ' : 'GỬI MÃ OTP'}
        onPress={() => void (sent ? verify() : send())}
      />
      {sent ? (
        <NeoButton
          disabled={pending || remaining > 0}
          tone="secondary"
          label={remaining > 0 ? `GỬI LẠI SAU ${remaining} GIÂY` : 'GỬI LẠI MÃ'}
          onPress={() => void send()}
        />
      ) : null}
      <NeoButton disabled={pending} tone="neutral" label="QUAY LẠI" onPress={onCancel} />
    </SlideIn>
  );
}

const emailOtpFormStyles = StyleSheet.create({
  form: {
    gap: spacing.md,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: radii.control,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.field,
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 20,
    lineHeight: 28,
    color: homeVisualTokens.ink,
  },
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
