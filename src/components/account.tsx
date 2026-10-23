import { Image } from 'expo-image';
import { useProfileAvatarUrl } from '@/services/account';
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ImageStyle,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { appThemes, homeVisualTokens, radii, spacing, typography } from '@/theme';
import { NeoButton, SlideIn, NeoBadge, NeoSheet } from '@/components/controls';
import { type AccountModel, useAccountModel, type AuthMode } from '@/hooks/account';
import { getUserDisplayName, getUserInitials } from '@/context/auth';
import { useEffect, useState } from 'react';
import { parseLifestylePreferences } from '@/utils/recommendations';
import { EmailOtpForm } from '@/components/email-otp';
import { LifestyleSetup } from '@/components/lifestyle-setup';

// account-styles

const colors = appThemes.light.colors;

export const accountStyles = StyleSheet.create({
  statePanel: {
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    boxShadow: '6px 6px 0px #1D3557',
  },
  warningPanel: { alignItems: 'flex-start', backgroundColor: homeVisualTokens.warningSurface },
  identityPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surface,
    boxShadow: '6px 6px 0px #1D3557',
  },
  avatarLarge: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.mint,
  },
  avatarImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 9 },
  avatarActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  avatarAction: { minWidth: 144, flexGrow: 1 },
  avatarLoading: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatarPanel: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  avatarPanelCopy: { gap: spacing.xs },
  avatarText: { color: colors.text, fontFamily: typography.brand, fontSize: 25, lineHeight: 30 },
  identityCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  displayName: { color: colors.text, fontFamily: typography.heading, fontSize: 22, lineHeight: 27 },
  email: { color: colors.text, fontFamily: typography.body, fontSize: 12, lineHeight: 17 },
  infoPanel: {
    gap: spacing.xs,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  formPanel: {
    gap: spacing.md,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surface,
    boxShadow: '6px 6px 0px #1D3557',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 18,
    lineHeight: 22,
  },
  body: { color: colors.text, fontFamily: typography.body, fontSize: 13, lineHeight: 20 },
  fieldGroup: { gap: spacing.xs },
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
    borderRadius: radii.control,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 15,
    backgroundColor: homeVisualTokens.paper,
  },
  message: {
    borderWidth: 3,
    borderRadius: radii.control,
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
    borderRadius: radii.control,
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

// profile-avatar-content

interface ProfileAvatarContentProps {
  readonly avatarPath: string | null | undefined;
  readonly fallback: string;
  readonly imageStyle: StyleProp<ImageStyle>;
  readonly textStyle: StyleProp<TextStyle>;
}

export function ProfileAvatarContent({
  avatarPath,
  fallback,
  imageStyle,
  textStyle,
}: ProfileAvatarContentProps) {
  const avatarUrlQuery = useProfileAvatarUrl(avatarPath);

  if (avatarUrlQuery.data !== undefined && avatarUrlQuery.data !== null) {
    return (
      <Image
        accessibilityElementsHidden
        cachePolicy="memory-disk"
        contentFit="cover"
        importantForAccessibility="no-hide-descendants"
        source={{ uri: avatarUrlQuery.data }}
        style={imageStyle}
        transition={150}
      />
    );
  }

  return <Text style={textStyle}>{fallback}</Text>;
}

// account-auth-form

export function AccountAuthForm({ model, entry }: { model: AccountModel; entry: boolean }) {
  const {
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
    setOtpFlow,
    submit,
  } = model;
  return (
    <>
      {entry ? (
        <Text style={accountStyles.body}>
          Tạo tài khoản hoặc đăng nhập để nhận gợi ý sinh hoạt phù hợp với bạn và thời tiết.
        </Text>
      ) : null}
      {!entry ? (
        <View style={accountStyles.modeRow}>
          <NeoButton
            disabled={pending || mode === 'sign_in'}
            label="ĐĂNG NHẬP"
            onPress={() => {
              setMode('sign_in');
              setErrorMessage(undefined);
              setMessage(undefined);
            }}
            tone="secondary"
          />
          <NeoButton
            disabled={pending || mode === 'sign_up'}
            label="TẠO TÀI KHOẢN"
            onPress={() => {
              setMode('sign_up');
              setErrorMessage(undefined);
              setMessage(undefined);
            }}
            tone="secondary"
          />
        </View>
      ) : null}
      <SlideIn replayKey={mode} style={accountStyles.formPanel}>
        <Text accessibilityRole="header" style={accountStyles.sectionTitle}>
          {mode === 'sign_in' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
        </Text>
        {mode === 'sign_up' ? (
          <View style={accountStyles.fieldGroup}>
            <Text style={accountStyles.fieldLabel}>TÊN HIỂN THỊ</Text>
            <TextInput
              accessibilityLabel="Tên hiển thị"
              autoCapitalize="words"
              autoComplete="name"
              onChangeText={setFullName}
              placeholder="Nguyễn An"
              placeholderTextColor={homeVisualTokens.unavailable}
              style={accountStyles.input}
              value={fullName}
            />
          </View>
        ) : null}
        <View style={accountStyles.fieldGroup}>
          <Text style={accountStyles.fieldLabel}>EMAIL</Text>
          <TextInput
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            inputMode="email"
            onChangeText={setEmail}
            placeholder="ban@example.com"
            placeholderTextColor={homeVisualTokens.unavailable}
            style={accountStyles.input}
            value={email}
          />
        </View>
        <View style={accountStyles.fieldGroup}>
          <Text style={accountStyles.fieldLabel}>MẬT KHẨU</Text>
          <TextInput
            accessibilityLabel="Mật khẩu"
            autoCapitalize="none"
            autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
            onChangeText={setPassword}
            placeholder="Ít nhất 6 ký tự"
            placeholderTextColor={homeVisualTokens.unavailable}
            secureTextEntry
            style={accountStyles.input}
            value={password}
          />
        </View>
      </SlideIn>
      {message === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={accountStyles.message}>
          {message}
        </Text>
      )}
      {errorMessage === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={accountStyles.error}>
          {errorMessage}
        </Text>
      )}
      <NeoButton
        disabled={pending}
        label={pending ? 'ĐANG XỬ LÝ…' : mode === 'sign_in' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
        onPress={() => void submit()}
      />
      {mode === 'sign_in' ? (
        <NeoButton
          disabled={pending}
          tone="secondary"
          label="QUÊN MẬT KHẨU?"
          onPress={() => {
            setPassword('');
            setErrorMessage(undefined);
            setOtpFlow({ purpose: 'recovery', email: email.trim().toLowerCase(), sent: false });
          }}
        />
      ) : null}
      {entry ? (
        <NeoButton
          tone="neutral"
          disabled={pending}
          label={mode === 'sign_up' ? 'ĐÃ CÓ TÀI KHOẢN? ĐĂNG NHẬP' : 'CHƯA CÓ TÀI KHOẢN? ĐĂNG KÝ'}
          onPress={() => {
            setMode(mode === 'sign_up' ? 'sign_in' : 'sign_up');
            setPassword('');
            setErrorMessage(undefined);
          }}
        />
      ) : null}
      <Text style={accountStyles.privacyNote}>
        Tài khoản giúp lưu thói quen và địa điểm của bạn. Bạn chỉ cần đăng nhập lại khi phiên hết
        hạn hoặc đã đăng xuất.
      </Text>
    </>
  );
}

// account-profile

export function AccountProfile({
  model,
  onEditLifestyle,
}: {
  model: AccountModel;
  onEditLifestyle: () => void;
}) {
  const {
    state,
    profileQuery,
    pending,
    message,
    errorMessage,
    runSignOut,
    avatarPath,
    avatarPending,
    chooseProfileAvatar,
    deleteProfileAvatar,
  } = model;
  if (state.status !== 'signed_in') return null;
  return (
    <>
      <View style={accountStyles.identityPanel}>
        <View style={accountStyles.avatarLarge}>
          <ProfileAvatarContent
            avatarPath={avatarPath}
            imageStyle={accountStyles.avatarImage}
            fallback={getUserInitials(state.user)}
            textStyle={accountStyles.avatarText}
          />
        </View>
        <View style={accountStyles.identityCopy}>
          <NeoBadge label="ĐÃ ĐĂNG NHẬP" tone="green" />
          <Text accessibilityRole="header" style={accountStyles.displayName}>
            {profileQuery.data?.full_name ?? getUserDisplayName(state.user)}
          </Text>
          <Text style={accountStyles.email}>{state.user.email}</Text>
        </View>
      </View>
      <View style={accountStyles.infoPanel}>
        <Text style={accountStyles.sectionTitle}>SINH HOẠT CỦA BẠN</Text>
        <Text style={accountStyles.body}>
          Chọn hoạt động và buổi rảnh để điều chỉnh gợi ý sinh hoạt.
        </Text>
        <NeoButton label="THÓI QUEN SINH HOẠT" tone="secondary" onPress={onEditLifestyle} />
      </View>
      <View style={accountStyles.avatarPanel}>
        <View style={accountStyles.avatarPanelCopy}>
          <Text style={accountStyles.sectionTitle}>ẢNH ĐẠI DIỆN</Text>
          <Text style={accountStyles.body}>
            Chọn ảnh vuông tối đa 5 MB. Ảnh được lưu riêng tư theo tài khoản.
          </Text>
        </View>
        {avatarPending ? (
          <View accessibilityLiveRegion="polite" style={accountStyles.avatarLoading}>
            <ActivityIndicator color={homeVisualTokens.technical} />
            <Text style={accountStyles.body}>Đang đồng bộ ảnh…</Text>
          </View>
        ) : (
          <View style={accountStyles.avatarActions}>
            <View style={accountStyles.avatarAction}>
              <NeoButton
                disabled={pending}
                label={avatarPath === undefined || avatarPath === null ? 'CHỌN ẢNH' : 'ĐỔI ẢNH'}
                onPress={() => void chooseProfileAvatar()}
              />
            </View>
            {avatarPath === undefined || avatarPath === null ? null : (
              <View style={accountStyles.avatarAction}>
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
      <View style={accountStyles.infoPanel}>
        <Text style={accountStyles.sectionTitle}>ĐỒNG BỘ CÁ NHÂN</Text>
        <Text style={accountStyles.body}>
          Địa điểm và thói quen được lưu riêng theo tài khoản của bạn.
        </Text>
      </View>
      {message === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={accountStyles.message}>
          {message}
        </Text>
      )}
      {errorMessage === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={accountStyles.error}>
          {errorMessage}
        </Text>
      )}
      <NeoButton
        disabled={pending || avatarPending}
        label={pending ? 'ĐANG ĐĂNG XUẤT…' : 'ĐĂNG XUẤT'}
        onPress={() => void runSignOut()}
        tone="danger"
      />
    </>
  );
}

// account-sheet

interface AccountSheetProps {
  readonly visible: boolean;
  readonly onClose?: () => void;
  readonly entry?: boolean;
  readonly initialMode?: AuthMode;
}

export function AccountSheet({
  visible,
  onClose,
  entry = false,
  initialMode = 'sign_in',
}: AccountSheetProps) {
  const model = useAccountModel(visible, initialMode);
  const { state, mode, setMode, otpFlow, setOtpFlow, setMessage, setErrorMessage } = model;
  const [editingLifestyle, setEditingLifestyle] = useState(false);
  const userId = state.status === 'signed_in' ? state.user.id : undefined;
  useEffect(() => {
    setEditingLifestyle(false);
  }, [userId]);
  return (
    <NeoSheet
      backAction={entry}
      presentation={entry ? 'page' : 'modal'}
      closeTone="coral"
      scrollResetKey={editingLifestyle ? 'lifestyle' : otpFlow ? 'otp' : 'account'}
      label={entry ? 'CHÀO MỪNG BẠN' : 'CÁ NHÂN'}
      onClose={onClose}
      title={
        entry ? (mode === 'sign_up' ? 'RẤT VUI ĐƯỢC GẶP BẠN' : 'CHÀO BẠN TRỞ LẠI') : 'TÀI KHOẢN'
      }
      visible={visible}
    >
      {state.status === 'signed_in' && editingLifestyle ? (
        <LifestyleSetup
          key={state.user.id}
          initial={parseLifestylePreferences(state.user.user_metadata.lifestyle_preferences)}
          onboarding={false}
          onClose={(saved) => {
            setEditingLifestyle(false);
            setMessage(saved ? 'Lựa chọn khuyến nghị đã được cập nhật.' : undefined);
          }}
        />
      ) : state.status === 'loading' ? (
        <View style={accountStyles.statePanel}>
          <ActivityIndicator color={homeVisualTokens.technical} />
          <Text style={accountStyles.body}>Đang khôi phục phiên đăng nhập an toàn…</Text>
        </View>
      ) : state.status === 'unconfigured' ? (
        <View style={[accountStyles.statePanel, accountStyles.warningPanel]}>
          <Text accessibilityRole="header" style={accountStyles.sectionTitle}>
            CHƯA THỂ KẾT NỐI
          </Text>
          <Text style={accountStyles.body}>
            Dịch vụ tài khoản chưa sẵn sàng. Vui lòng thử lại sau.
          </Text>
        </View>
      ) : state.status === 'signed_in' ? (
        <AccountProfile model={model} onEditLifestyle={() => setEditingLifestyle(true)} />
      ) : otpFlow ? (
        <EmailOtpForm
          key={`${otpFlow.purpose}:${otpFlow.email}`}
          initialEmail={otpFlow.email}
          purpose={otpFlow.purpose}
          initiallySent={otpFlow.sent}
          onCancel={() => {
            setOtpFlow(undefined);
            setMode('sign_in');
            setErrorMessage(undefined);
          }}
        />
      ) : (
        <AccountAuthForm model={model} entry={entry} />
      )}
    </NeoSheet>
  );
}
