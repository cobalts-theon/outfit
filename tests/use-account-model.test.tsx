import { afterEach, beforeEach, expect, it, jest } from '@jest/globals';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { useAuth } from '@/context/auth';
import { useAccountModel, type AccountModel, type AuthMode } from '@/hooks/account';

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));

jest.mock('@/context/auth', () => ({ useAuth: jest.fn() }));

jest.mock('@/services/account', () => ({
  useProfile: () => ({ data: undefined }),
  useUploadProfileAvatar: () => ({ isPending: false }),
  useRemoveProfileAvatar: () => ({ isPending: false }),
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let model: AccountModel;

let renderer: ReactTestRenderer;

const signIn = jest.fn<() => Promise<void>>();

const signUp = jest.fn<() => Promise<{ requiresEmailConfirmation: boolean }>>();

const signOut = jest.fn();

function Probe({ visible = true, mode = 'sign_in' }: { visible?: boolean; mode?: AuthMode }) {
  model = useAccountModel(visible, mode);
  return null;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuth).mockReturnValue({
    state: { status: 'signed_out' },
    signIn,
    signUp,
    signOut,
  } as unknown as ReturnType<typeof useAuth>);
});

afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
});

it('keeps validation local without sending an invalid authentication request', async () => {
  await act(async () => {
    renderer = create(<Probe />);
  });
  await act(async () => model.submit());
  expect(model.errorMessage).toContain('Nhập email hợp lệ');
  expect(signIn).not.toHaveBeenCalled();
  expect(signUp).not.toHaveBeenCalled();
});

it('opens signup OTP after confirmation-required registration and clears the password', async () => {
  signUp.mockResolvedValue({ requiresEmailConfirmation: true });
  await act(async () => {
    renderer = create(<Probe mode="sign_up" />);
  });
  await act(async () => {
    model.setFullName('Nguyễn An');
    model.setEmail(' AN@example.com ');
    model.setPassword('password123');
  });
  await act(async () => model.submit());
  expect(model.otpFlow).toEqual({ purpose: 'signup', email: 'an@example.com', sent: true });
  expect(model.password).toBe('');
  expect(model.pending).toBe(false);
});

it('routes an unconfirmed password login to signup verification', async () => {
  signIn.mockRejectedValue({ code: 'email_not_confirmed' });
  await act(async () => {
    renderer = create(<Probe />);
  });
  await act(async () => {
    model.setEmail('an@example.com');
    model.setPassword('password123');
  });
  await act(async () => model.submit());
  expect(model.otpFlow).toEqual({ purpose: 'signup', email: 'an@example.com', sent: false });
  expect(model.password).toBe('');
});

it('discards recovery when the sheet closes, while retaining signup confirmation', async () => {
  await act(async () => {
    renderer = create(<Probe />);
  });
  await act(async () =>
    model.setOtpFlow({ purpose: 'recovery', email: 'an@example.com', sent: false }),
  );
  await act(async () => renderer.update(<Probe visible={false} />));
  expect(model.otpFlow).toBeUndefined();
  await act(async () => renderer.update(<Probe />));
  await act(async () =>
    model.setOtpFlow({ purpose: 'signup', email: 'an@example.com', sent: true }),
  );
  await act(async () => renderer.update(<Probe visible={false} />));
  expect(model.otpFlow?.purpose).toBe('signup');
});
