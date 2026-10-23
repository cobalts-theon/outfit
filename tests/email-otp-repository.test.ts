import { beforeEach, expect, it, jest } from '@jest/globals';
import { createRecoverySupabaseClient, requireSupabaseClient } from '@/services/supabase';
import { createPasswordRecovery, emailOtpErrorMessage, normalizeOtpEmail, requestEmailOtp, verifyEmailOtp } from '@/services/account';

jest.mock('@/services/supabase', () => ({ requireSupabaseClient: jest.fn(), createRecoverySupabaseClient: jest.fn() }));

const send = jest.fn<(input: unknown) => Promise<{ error: Error | null }>>();

const update = jest.fn<(input: unknown) => Promise<{ error: Error | null }>>();

const signOut = jest.fn<(input: unknown) => Promise<{ error: Error | null }>>();

const resend = jest.fn<(input: unknown) => Promise<{ error: Error | null }>>();

const verify = jest.fn<(input: unknown) => Promise<{ data: { session: unknown }; error: Error | null }>>();

beforeEach(() => {
  update.mockReset().mockResolvedValue({ error: null });
  signOut.mockReset().mockResolvedValue({ error: null });
  jest.mocked(createRecoverySupabaseClient).mockReturnValue({ auth: { resetPasswordForEmail: send, verifyOtp: verify, updateUser: update, signOut } } as never);
  send.mockReset().mockResolvedValue({ error: null });
  resend.mockReset().mockResolvedValue({ error: null });
  verify.mockReset().mockResolvedValue({ data: { session: {} }, error: null });
  jest.mocked(requireSupabaseClient).mockReturnValue({ auth: { signInWithOtp: send, resend, verifyOtp: verify } } as never);
});

it('requests password recovery for the normalized email', async () => {
  await createPasswordRecovery().send(' User@Example.com ');
  expect(send).toHaveBeenCalledWith('user@example.com');
  expect(resend).not.toHaveBeenCalled();
});

it('resends signup verification without creating another user or changing metadata', async () => {
  await requestEmailOtp('user@example.com', 'signup');
  expect(resend).toHaveBeenCalledWith({ type: 'signup', email: 'user@example.com' });
  expect(send).not.toHaveBeenCalled();
});

it('verifies an email code, preserving leading zeroes', async () => {
  await verifyEmailOtp(' User@Example.com ', ' 012345 ');
  expect(verify).toHaveBeenCalledWith({ email: 'user@example.com', token: '012345', type: 'email' });
});

it.each(['123', '12a456', '1234567', '12345678901', ''])('rejects malformed codes before sending: %s', async token => {
  await expect(verifyEmailOtp('user@example.com', token)).rejects.toThrow('invalid_otp');
  expect(verify).not.toHaveBeenCalled();
});

it('rejects invalid email locally', () => {
  expect(() => normalizeOtpEmail('user@')).toThrow('invalid_email');
});

it('requires a real session, not just a successful-looking verification response', async () => {
  verify.mockResolvedValue({ data: { session: null }, error: null });
  await expect(verifyEmailOtp('user@example.com', '123456')).rejects.toThrow('otp_session_missing');
});

it('propagates expiration errors rather than signing in locally', async () => {
  const expired = Object.assign(new Error('expired'), { code: 'otp_expired' });
  verify.mockResolvedValue({ data: { session: null }, error: expired });
  await expect(verifyEmailOtp('user@example.com', '123456')).rejects.toBe(expired);
  expect(emailOtpErrorMessage(expired)).toContain('hết hạn');
});

it('propagates send failures and provides understandable rate-limit/network messages', async () => {
  send.mockResolvedValue({ error: new Error('Network request failed') });
  await expect(createPasswordRecovery().send('user@example.com')).rejects.toThrow('Network');
  expect(emailOtpErrorMessage({ code: 'over_request_rate_limit' })).toContain('Chờ');
  expect(emailOtpErrorMessage(new Error('Network request failed'))).toContain('kết nối');
});

it('uses recovery verification and only updates after a valid session', async () => {
  const recovery = createPasswordRecovery();
  await expect(recovery.updatePassword('new-password', 'new-password')).rejects.toThrow('otp_session_missing');
  expect(update).not.toHaveBeenCalled();
  await recovery.verify(' User@Example.com ', '012345');
  expect(verify).toHaveBeenCalledWith({ email: 'user@example.com', token: '012345', type: 'recovery' });
  await expect(recovery.updatePassword('new-password', 'different')).rejects.toThrow('password_mismatch');
  await expect(recovery.updatePassword('short', 'short')).rejects.toThrow('weak_password');
  expect(update).not.toHaveBeenCalled();
  await recovery.updatePassword('new-password', 'new-password');
  expect(update).toHaveBeenCalledWith({ password: 'new-password' });
  expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
  await expect(recovery.updatePassword('another-password', 'another-password')).rejects.toThrow('otp_session_missing');
});

it('does not allow a missing recovery session to change a password', async () => {
  const recovery = createPasswordRecovery();
  verify.mockResolvedValue({ data: { session: null }, error: null });
  await expect(recovery.verify('user@example.com', '123456')).rejects.toThrow('otp_session_missing');
  await expect(recovery.updatePassword('new-password', 'new-password')).rejects.toThrow('otp_session_missing');
  expect(update).not.toHaveBeenCalled();
});

it('preserves recovery for retry after a password update failure', async () => {
  const recovery = createPasswordRecovery();
  await recovery.verify('user@example.com', '123456');
  update.mockResolvedValueOnce({ error: new Error('Network request failed') });
  await expect(recovery.updatePassword('new-password', 'new-password')).rejects.toThrow('Network');
  expect(signOut).not.toHaveBeenCalled();
  await recovery.updatePassword('new-password', 'new-password');
  expect(signOut).toHaveBeenCalled();
});

it('invalidates recovery on cancellation', async () => {
  const recovery = createPasswordRecovery();
  await recovery.verify('user@example.com', '123456');
  recovery.dispose();
  await expect(recovery.updatePassword('new-password', 'new-password')).rejects.toThrow('otp_session_missing');
});
