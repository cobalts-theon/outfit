import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { NeoButton } from '@/components/ui/neo-button';
import { NeoSheet } from '@/components/ui/neo-sheet';
import {
  getUserDisplayName,
  getUserInitials,
  useAuth,
} from '@/features/auth/application/auth-provider';
import {
  useProfile,
  useRemoveProfileAvatar,
  useUploadProfileAvatar,
} from '@/features/auth/application/profile-query';
import { ProfileAvatarContent } from '@/features/auth/components/profile-avatar-content';
import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

interface AccountSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

type AuthMode = 'sign_in' | 'sign_up';

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

export function AccountSheet({ visible, onClose }: AccountSheetProps) {
  const { state, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign_in');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const userId = state.status === 'signed_in' ? state.user.id : undefined;
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
          setMessage('Đã tạo tài khoản. Hãy mở email để xác nhận rồi đăng nhập.');
          setMode('sign_in');
        }
      }
      setPassword('');
    } catch (error) {
      setErrorMessage(authErrorMessage(error));
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

  return (
    <NeoSheet label="ACCOUNT//AUTH" onClose={onClose} title="TÀI KHOẢN" visible={visible}>
      {state.status === 'loading' ? (
        <View style={styles.statePanel}>
          <ActivityIndicator color={homeVisualTokens.technical} />
          <Text style={styles.body}>Đang khôi phục phiên đăng nhập an toàn…</Text>
        </View>
      ) : state.status === 'unconfigured' ? (
        <View style={[styles.statePanel, styles.warningPanel]}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>CHƯA CẤU HÌNH SUPABASE</Text>
          <Text style={styles.body}>
            Thêm EXPO_PUBLIC_SUPABASE_URL và EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY vào tệp .env. Không dùng service-role key trong ứng dụng.
          </Text>
        </View>
      ) : state.status === 'signed_in' ? (
        <>
          <View style={styles.identityPanel}>
            <View style={styles.avatarLarge}>
              <ProfileAvatarContent
                avatarPath={avatarPath}
                fallback={getUserInitials(state.user)}
                imageStyle={styles.avatarImage}
                textStyle={styles.avatarText}
              />
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.accountStatus}>SESSION//ACTIVE</Text>
              <Text accessibilityRole="header" style={styles.displayName}>
                {profileQuery.data?.full_name ?? getUserDisplayName(state.user)}
              </Text>
              <Text style={styles.email}>{state.user.email}</Text>
            </View>
          </View>
          <View style={styles.avatarPanel}>
            <View style={styles.avatarPanelCopy}>
              <Text style={styles.sectionTitle}>ẢNH ĐẠI DIỆN</Text>
              <Text style={styles.body}>Chọn ảnh vuông tối đa 5 MB. Ảnh được lưu riêng tư theo tài khoản.</Text>
            </View>
            {avatarPending ? (
              <View accessibilityLiveRegion="polite" style={styles.avatarLoading}>
                <ActivityIndicator color={homeVisualTokens.technical} />
                <Text style={styles.body}>Đang đồng bộ ảnh…</Text>
              </View>
            ) : (
              <View style={styles.avatarActions}>
                <View style={styles.avatarAction}>
                  <NeoButton
                    disabled={pending}
                    label={avatarPath === undefined || avatarPath === null ? 'CHỌN ẢNH' : 'ĐỔI ẢNH'}
                    onPress={() => void chooseProfileAvatar()}
                  />
                </View>
                {avatarPath === undefined || avatarPath === null ? null : (
                  <View style={styles.avatarAction}>
                    <NeoButton
                      disabled={pending}
                      label="XÓA ẢNH"
                      onPress={() => void deleteProfileAvatar()}
                      tone="secondary"
                    />
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={styles.infoPanel}>
            <Text style={styles.sectionTitle}>ĐỒNG BỘ CÁ NHÂN</Text>
            <Text style={styles.body}>
              Các địa điểm bạn lưu được bảo vệ theo tài khoản và chỉ chính bạn có thể đọc, thêm, sửa hoặc xóa.
            </Text>
          </View>
          {message === undefined ? null : (
            <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>
          )}
          {errorMessage === undefined ? null : (
            <Text accessibilityLiveRegion="polite" style={styles.error}>{errorMessage}</Text>
          )}
          <NeoButton
            disabled={pending || avatarPending}
            label={pending ? 'ĐANG ĐĂNG XUẤT…' : 'ĐĂNG XUẤT'}
            onPress={() => void runSignOut()}
            tone="danger"
          />
        </>
      ) : (
        <>
          <View style={styles.modeRow}>
            <NeoButton
              disabled={mode === 'sign_in'}
              label="ĐĂNG NHẬP"
              onPress={() => {
                setMode('sign_in');
                setErrorMessage(undefined);
                setMessage(undefined);
              }}
              tone="secondary"
            />
            <NeoButton
              disabled={mode === 'sign_up'}
              label="TẠO TÀI KHOẢN"
              onPress={() => {
                setMode('sign_up');
                setErrorMessage(undefined);
                setMessage(undefined);
              }}
              tone="secondary"
            />
          </View>

          <View style={styles.formPanel}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              {mode === 'sign_in' ? 'TRỞ LẠI HỆ THỐNG' : 'TẠO HỒ SƠ MỚI'}
            </Text>
            {mode === 'sign_up' ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>TÊN HIỂN THỊ</Text>
                <TextInput
                  accessibilityLabel="Tên hiển thị"
                  autoCapitalize="words"
                  autoComplete="name"
                  onChangeText={setFullName}
                  placeholder="Nguyễn An"
                  placeholderTextColor={homeVisualTokens.unavailable}
                  style={styles.input}
                  value={fullName}
                />
              </View>
            ) : null}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>EMAIL</Text>
              <TextInput
                accessibilityLabel="Email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                inputMode="email"
                onChangeText={setEmail}
                placeholder="ban@example.com"
                placeholderTextColor={homeVisualTokens.unavailable}
                style={styles.input}
                value={email}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>MẬT KHẨU</Text>
              <TextInput
                accessibilityLabel="Mật khẩu"
                autoCapitalize="none"
                autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
                onChangeText={setPassword}
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor={homeVisualTokens.unavailable}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>
          </View>

          {message === undefined ? null : (
            <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>
          )}
          {errorMessage === undefined ? null : (
            <Text accessibilityLiveRegion="polite" style={styles.error}>{errorMessage}</Text>
          )}
          <NeoButton
            disabled={pending}
            label={pending ? 'ĐANG XỬ LÝ…' : mode === 'sign_in' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
            onPress={() => void submit()}
          />
          <Text style={styles.privacyNote}>
            Phiên đăng nhập được lưu trên thiết bị. Dữ liệu địa điểm được giới hạn bằng Row Level Security theo ID tài khoản.
          </Text>
        </>
      )}
    </NeoSheet>
  );
}

const colors = appThemes.light.colors;

const styles = StyleSheet.create({
  statePanel: {
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    boxShadow: '6px 6px 0px #101010',
  },
  warningPanel: {
    alignItems: 'flex-start',
    backgroundColor: homeVisualTokens.warningSurface,
  },
  identityPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.cobalt,
    boxShadow: '6px 6px 0px #101010',
  },
  avatarLarge: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.mint,
  },
  avatarText: {
    color: colors.text,
    fontFamily: typography.brand,
    fontSize: 25,
    lineHeight: 30,
  },
  avatarImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  accountStatus: {
    color: colors.surface,
    fontFamily: typography.brand,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1,
  },
  displayName: {
    color: colors.surface,
    fontFamily: typography.heading,
    fontSize: 22,
    lineHeight: 27,
  },
  email: {
    color: colors.surface,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  infoPanel: {
    gap: spacing.xs,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.mint,
  },
  avatarPanel: {
    gap: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  avatarPanelCopy: {
    gap: spacing.xs,
  },
  avatarLoading: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  avatarAction: {
    minWidth: 144,
    flexGrow: 1,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  formPanel: {
    gap: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surface,
    boxShadow: '6px 6px 0px #101010',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 18,
    lineHeight: 22,
  },
  body: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.6,
  },
  input: {
    minHeight: 50,
    borderWidth: 3,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 15,
    backgroundColor: homeVisualTokens.paper,
  },
  message: {
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: homeVisualTokens.mint,
  },
  error: {
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: homeVisualTokens.dangerSurface,
  },
  privacyNote: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 17,
  },
});
