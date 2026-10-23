import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import {
  useProfile,
  useUploadProfileAvatar,
  useRemoveProfileAvatar,
  type EmailOtpPurpose,
} from '@/services/account';

// use-account-model

export type AuthMode = 'sign_in' | 'sign_up';

function authErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message.includes('invalid login credentials')) {
    return 'Email hoặc mật khẩu chưa đúng.';
  }
  if (message.includes('email not confirmed')) {
    return 'Hãy xác nhận email trước khi đăng nhập.';
  }
  if (message.includes('already registered')) {
    return 'Email này đã có tài khoản.';
  }
  if (message.includes('password')) {
    return 'Mật khẩu chưa đạt yêu cầu. Hãy dùng ít nhất 6 ký tự.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Không thể kết nối máy chủ. Hãy kiểm tra mạng và thử lại.';
  }
  return 'Không thể hoàn tất yêu cầu tài khoản. Hãy thử lại.';
}

function profileAvatarErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes('profile_avatar_too_large') || message.includes('maximum allowed size')) {
    return 'Ảnh vượt quá 5 MB. Hãy chọn ảnh nhỏ hơn.';
  }
  if (message.includes('profile_avatar_unsupported_type') || message.includes('mime type')) {
    return 'Định dạng ảnh chưa được hỗ trợ. Hãy chọn JPG, PNG, WebP, HEIC hoặc GIF.';
  }
  if (message.includes('profile_avatar_empty_file')) {
    return 'Tệp ảnh đang trống hoặc không đọc được.';
  }
  if (message.includes('profile_avatar_unreadable_file')) {
    return 'Không thể đọc tệp ảnh đã chọn. Hãy chọn lại một ảnh khác.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Không thể tải ảnh lên. Hãy kiểm tra mạng và thử lại.';
  }

  return 'Không thể cập nhật ảnh đại diện. Hãy thử lại.';
}

export function useAccountModel(visible: boolean, initialMode: AuthMode) {
  const { state, signIn, signUp, signOut } = useAuth();
  const [otpFlow, setOtpFlow] = useState<{
    purpose: EmailOtpPurpose;
    email: string;
    sent: boolean;
  }>();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const userId = state.status === 'signed_in' ? state.user.id : undefined;
  useEffect(() => {
    setMessage(undefined);
    if (userId) setOtpFlow(undefined);
  }, [userId]);
  useEffect(() => {
    if (!visible) setOtpFlow((flow) => (flow?.purpose === 'recovery' ? undefined : flow));
  }, [visible]);
  const profileQuery = useProfile(userId);
  const avatarPath = profileQuery.data?.avatar_url;
  const uploadAvatarMutation = useUploadProfileAvatar(userId, avatarPath);
  const removeAvatarMutation = useRemoveProfileAvatar(userId, avatarPath);
  const avatarPending = uploadAvatarMutation.isPending || removeAvatarMutation.isPending;
  const submit = async () => {
    setMessage(undefined);
    setErrorMessage(undefined);
    if (!email.includes('@') || password.length < 6) {
      setErrorMessage('Nhập email hợp lệ và mật khẩu có ít nhất 6 ký tự.');
      return;
    }
    if (mode === 'sign_up' && fullName.trim().length < 2) {
      setErrorMessage('Nhập tên hiển thị có ít nhất 2 ký tự.');
      return;
    }
    setPending(true);
    try {
      if (mode === 'sign_in') {
        await signIn(email, password);
      } else {
        const result = await signUp({ email, password, fullName });
        if (result.requiresEmailConfirmation) {
          setOtpFlow({ purpose: 'signup', email: email.trim().toLowerCase(), sent: true });
        }
      }
      setPassword('');
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'email_not_confirmed'
      ) {
        setPassword('');
        setOtpFlow({ purpose: 'signup', email: email.trim().toLowerCase(), sent: false });
      } else setErrorMessage(authErrorMessage(error));
    } finally {
      setPending(false);
    }
  };
  const runSignOut = async () => {
    setPending(true);
    setErrorMessage(undefined);
    try {
      await signOut();
    } catch (error) {
      setErrorMessage(authErrorMessage(error));
    } finally {
      setPending(false);
    }
  };
  const chooseProfileAvatar = async () => {
    setMessage(undefined);
    setErrorMessage(undefined);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.82,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      if (asset === undefined) {
        throw new Error('profile_avatar_empty_file');
      }

      await uploadAvatarMutation.mutateAsync({
        uri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
        file: asset.file,
      });
      setMessage('Ảnh đại diện đã được cập nhật.');
    } catch (error) {
      setErrorMessage(profileAvatarErrorMessage(error));
    }
  };

  const deleteProfileAvatar = async () => {
    setMessage(undefined);
    setErrorMessage(undefined);

    try {
      await removeAvatarMutation.mutateAsync();
      setMessage('Đã xóa ảnh đại diện.');
    } catch (error) {
      setErrorMessage(profileAvatarErrorMessage(error));
    }
  };

  return {
    avatarPath,
    avatarPending,
    chooseProfileAvatar,
    deleteProfileAvatar,
    state,
    otpFlow,
    setOtpFlow,
    mode,
    setMode,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    pending,
    message,
    setMessage,
    errorMessage,
    setErrorMessage,
    profileQuery,
    submit,
    runSignOut,
  };
}

export type AccountModel = ReturnType<typeof useAccountModel>;
