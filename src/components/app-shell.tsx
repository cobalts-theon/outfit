import { useProfile } from '@/services/account';
import { useReducedMotion, SlideIn } from '@/components/controls';
import {
  radii,
  appThemes,
  homeVisualTokens,
  spacing,
  touchTargets,
  typography,
  neoShadows,
} from '@/theme';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserDisplayName, useAuth, getUserInitials } from '@/context/auth';
import { ProfileAvatarContent } from '@/components/account';
import { Component, type ErrorInfo, type PropsWithChildren } from 'react';

// app-drawer

interface AppDrawerProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onOpenHome: () => void;
  readonly onOpenForecast: () => void;
  readonly onOpenLocations: () => void;
  readonly onOpenNotifications: () => void;
  readonly onOpenAccount: () => void;
}

interface DrawerActionProps {
  readonly index: string;
  readonly label: string;
  readonly detail: string;
  readonly onPress: () => void;
  readonly accent?: 'blue' | 'mint' | 'yellow' | 'coral' | 'cream';
}

function DrawerAction({ index, label, detail, onPress, accent = 'blue' }: DrawerActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [appDrawerStyles.action, pressed && appDrawerStyles.actionPressed]}
    >
      <Text
        style={[
          appDrawerStyles.actionIndex,
          accent === 'cream' && appDrawerStyles.actionCream,
          accent === 'mint' && appDrawerStyles.actionMint,
          accent === 'yellow' && appDrawerStyles.actionYellow,
          accent === 'coral' && appDrawerStyles.actionCoral,
        ]}
      >
        {index}
      </Text>
      <View style={appDrawerStyles.actionCopy}>
        <Text style={appDrawerStyles.actionLabel}>{label}</Text>
        <Text style={appDrawerStyles.actionDetail}>{detail}</Text>
      </View>
    </Pressable>
  );
}

export function AppDrawer({
  visible,
  onClose,
  onOpenHome,
  onOpenForecast,
  onOpenLocations,
  onOpenNotifications,
  onOpenAccount,
}: AppDrawerProps) {
  const reducedMotion = useReducedMotion();
  const { state } = useAuth();
  const accountDetail =
    state.status === 'signed_in'
      ? getUserDisplayName(state.user)
      : state.status === 'unconfigured'
        ? 'Supabase chưa cấu hình'
        : 'Đăng nhập để đồng bộ dữ liệu';

  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={appDrawerStyles.modalRoot}>
        <Pressable
          accessibilityLabel="Đóng menu"
          accessibilityRole="button"
          onPress={onClose}
          style={appDrawerStyles.backdrop}
        />
        <SlideIn horizontal replayKey={visible} style={appDrawerStyles.slide}>
          <SafeAreaView edges={['top', 'bottom', 'left']} style={appDrawerStyles.drawer}>
            <View style={appDrawerStyles.headingRow}>
              <View style={appDrawerStyles.headingCopy}>
                <Text style={appDrawerStyles.menuLabel}>KHÁM PHÁ</Text>
                <Text accessibilityRole="header" style={appDrawerStyles.heading}>
                  ĐIỀU HƯỚNG
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Đóng menu"
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [
                  appDrawerStyles.closeButton,
                  pressed && appDrawerStyles.closeButtonPressed,
                ]}
              >
                <Text style={appDrawerStyles.closeText}>X</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={appDrawerStyles.actions}
              showsVerticalScrollIndicator={false}
              style={appDrawerStyles.actionsScroll}
            >
              <DrawerAction
                accent="cream"
                index="01"
                label="TRANG CHỦ"
                detail="Điều kiện và gợi ý hiện tại"
                onPress={onOpenHome}
              />
              <DrawerAction
                index="02"
                label="DỰ BÁO"
                detail="Theo giờ và bảy ngày"
                onPress={onOpenForecast}
              />
              <DrawerAction
                accent="mint"
                index="03"
                label="ĐỊA ĐIỂM"
                detail="Tìm, lưu và xem từ xa"
                onPress={onOpenLocations}
              />
              <DrawerAction
                accent="yellow"
                index="04"
                label="THÔNG BÁO"
                detail="Mưa, sinh hoạt và rủi ro môi trường"
                onPress={onOpenNotifications}
              />
              <DrawerAction
                accent="coral"
                index="05"
                label="TÀI KHOẢN"
                detail={accountDetail}
                onPress={onOpenAccount}
              />
            </ScrollView>

            <View style={appDrawerStyles.footer}>
              <Text style={appDrawerStyles.footerBrand}>WEATHER//SYSTEM</Text>
              <Text style={appDrawerStyles.footerDetail}>Gợi ý sinh hoạt theo thời tiết</Text>
            </View>
          </SafeAreaView>
        </SlideIn>
      </View>
    </Modal>
  );
}

const appDrawerColors = appThemes.light.colors;

const appDrawerMinimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const appDrawerStyles = StyleSheet.create({
  modalRoot: { flex: 1, flexDirection: 'row' },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#1D355799',
  },
  slide: { width: '86%', maxWidth: 370 },
  drawer: {
    flex: 1,
    borderTopRightRadius: radii.overlay,
    borderBottomRightRadius: radii.overlay,
    width: '100%',
    maxWidth: 370,
    borderRightWidth: 4,
    borderColor: appDrawerColors.border,
    backgroundColor: homeVisualTokens.paper,
    boxShadow: '8px 0px 0px #1D3557',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 4,
    borderColor: appDrawerColors.border,
    padding: spacing.md,
    backgroundColor: appDrawerColors.surface,
  },
  headingCopy: { flex: 1, minWidth: 0 },
  menuLabel: {
    color: appDrawerColors.text,
    fontFamily: typography.brand,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
  },
  heading: {
    color: appDrawerColors.text,
    fontFamily: typography.heading,
    fontSize: 25,
    lineHeight: 30,
  },
  closeButton: {
    width: appDrawerMinimumTouchTarget,
    minHeight: appDrawerMinimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appDrawerColors.border,
    backgroundColor: homeVisualTokens.coral,
  },
  closeButtonPressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
  closeText: { color: appDrawerColors.text, fontFamily: typography.brand, fontSize: 20 },
  actionsScroll: { flex: 1 },
  actions: { gap: spacing.sm, padding: spacing.md, paddingBottom: spacing.lg },
  action: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appDrawerColors.border,
    backgroundColor: appDrawerColors.surface,
    boxShadow: '5px 5px 0px #1D3557',
  },
  actionCream: { backgroundColor: '#F1FAEE' },
  actionMint: { backgroundColor: homeVisualTokens.mint },
  actionYellow: { backgroundColor: homeVisualTokens.sunflower },
  actionCoral: { backgroundColor: homeVisualTokens.coral },
  actionPressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
    boxShadow: '2px 2px 0px #1D3557',
  },
  actionIndex: {
    width: 48,
    paddingTop: spacing.sm,
    borderRightWidth: 3,
    borderColor: appDrawerColors.border,
    color: appDrawerColors.text,
    fontFamily: typography.brand,
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
    backgroundColor: homeVisualTokens.infoSurface,
    borderTopLeftRadius: radii.control - 3,
    borderBottomLeftRadius: radii.control - 3,
  },
  actionCopy: { flex: 1, justifyContent: 'center', gap: spacing.xxs, padding: spacing.sm },
  actionLabel: {
    color: appDrawerColors.text,
    fontFamily: typography.heading,
    fontSize: 18,
    lineHeight: 22,
  },
  actionDetail: {
    color: appDrawerColors.text,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    gap: spacing.xxs,
    borderTopWidth: 4,
    borderColor: appDrawerColors.border,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.paper,
  },
  footerBrand: {
    color: appDrawerColors.text,
    fontFamily: typography.brand,
    fontSize: 13,
    lineHeight: 16,
  },
  footerDetail: {
    color: appDrawerColors.textMuted,
    fontFamily: typography.identity,
    fontSize: 10,
    lineHeight: 14,
  },
});

// app-masthead

interface AppMastheadProps {
  readonly onOpenMenu: () => void;
  readonly onOpenAccount: () => void;
}

export function AppMasthead({ onOpenMenu, onOpenAccount }: AppMastheadProps) {
  const { state } = useAuth();
  const profileQuery = useProfile(state.status === 'signed_in' ? state.user.id : undefined);
  const initials = state.status === 'signed_in' ? getUserInitials(state.user) : 'TK';

  return (
    <View style={appMastheadStyles.wrap}>
      <View pointerEvents="none" style={appMastheadStyles.shadow} />
      <View style={appMastheadStyles.bar}>
        <Pressable
          accessibilityLabel="Mở menu"
          accessibilityRole="button"
          onPress={onOpenMenu}
          style={({ pressed }) => [
            appMastheadStyles.iconButton,
            pressed && appMastheadStyles.iconButtonPressed,
          ]}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={appMastheadStyles.hamburger}
          >
            <View style={appMastheadStyles.hamburgerLine} />
            <View style={[appMastheadStyles.hamburgerLine, appMastheadStyles.hamburgerLineShort]} />
            <View style={appMastheadStyles.hamburgerLine} />
          </View>
        </Pressable>

        <View accessibilityLabel="Weather system" style={appMastheadStyles.wordmark}>
          <Text style={appMastheadStyles.wordmarkPrimary}>WEATHER</Text>
          <Text style={appMastheadStyles.wordmarkSecondary}>// SYSTEM</Text>
        </View>

        <Pressable
          accessibilityLabel={
            state.status === 'signed_in' ? 'Mở tài khoản' : 'Đăng nhập hoặc tạo tài khoản'
          }
          accessibilityRole="button"
          onPress={onOpenAccount}
          style={({ pressed }) => [
            appMastheadStyles.avatar,
            state.status === 'signed_in' && appMastheadStyles.avatarSignedIn,
            pressed && appMastheadStyles.iconButtonPressed,
          ]}
        >
          <ProfileAvatarContent
            avatarPath={profileQuery.data?.avatar_url}
            imageStyle={appMastheadStyles.avatarImage}
            fallback={initials}
            textStyle={appMastheadStyles.avatarText}
          />
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              appMastheadStyles.authSignal,
              state.status === 'signed_in' && appMastheadStyles.authSignalSignedIn,
            ]}
          />
        </Pressable>
      </View>
    </View>
  );
}

const appMastheadColors = appThemes.light.colors;

const appMastheadMinimumTouchTarget =
  Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const appMastheadStyles = StyleSheet.create({
  wrap: {
    position: 'relative',
    marginHorizontal: spacing.sm,
    marginRight: spacing.sm + 5,
    marginBottom: 5,
  },
  shadow: {
    borderRadius: radii.control,
    position: 'absolute',
    top: 5,
    right: -5,
    bottom: -5,
    left: 5,
    backgroundColor: appMastheadColors.border,
  },
  bar: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appMastheadColors.border,
    paddingHorizontal: spacing.xs,
    backgroundColor: appMastheadColors.surface,
  },
  iconButton: {
    width: appMastheadMinimumTouchTarget,
    height: appMastheadMinimumTouchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appMastheadColors.border,
    backgroundColor: homeVisualTokens.coral,
  },
  iconButtonPressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
  hamburger: { width: 23, gap: 5 },
  hamburgerLine: { width: 23, height: 3, backgroundColor: appMastheadColors.text },
  hamburgerLineShort: { width: 16 },
  wordmark: { flex: 1, minWidth: 0, alignItems: 'center' },
  wordmarkPrimary: {
    color: appMastheadColors.text,
    fontFamily: typography.brand,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: -0.4,
  },
  wordmarkSecondary: {
    color: appMastheadColors.text,
    fontFamily: typography.brandRegular,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1.3,
  },
  avatar: {
    width: appMastheadMinimumTouchTarget,
    height: appMastheadMinimumTouchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appMastheadColors.border,
    backgroundColor: homeVisualTokens.unavailableSurface,
  },
  avatarSignedIn: { backgroundColor: appMastheadColors.surface },
  avatarImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 9 },
  avatarText: {
    color: appMastheadColors.text,
    fontFamily: typography.brand,
    fontSize: 14,
    lineHeight: 17,
  },

  authSignal: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: appMastheadColors.border,
    backgroundColor: homeVisualTokens.unavailableSurface,
  },
  authSignalSignedIn: { backgroundColor: homeVisualTokens.calm },
});

// app-error

interface AppErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

const appErrorColors = appThemes.light.colors;

export function AppErrorFallback({ error, onRetry }: AppErrorFallbackProps) {
  return (
    <SafeAreaView style={appErrorStyles.safeArea}>
      <View accessibilityRole="alert" style={appErrorStyles.content}>
        <Text style={appErrorStyles.label}>PHỤC HỒI GIAO DIỆN</Text>
        <Text style={appErrorStyles.title}>Ứng dụng gặp sự cố</Text>
        <Text style={appErrorStyles.message}>
          Không thể hoàn tất thao tác. Hãy thử khởi động lại phần giao diện này.
        </Text>
        {__DEV__ && error ? <Text style={appErrorStyles.debugMessage}>{error.message}</Text> : null}
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [
            appErrorStyles.button,
            pressed ? appErrorStyles.buttonPressed : null,
          ]}
        >
          <Text style={appErrorStyles.buttonLabel}>THỬ LẠI</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const appErrorStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: appErrorColors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: homeVisualTokens.dangerSurface,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: appErrorColors.border,
    margin: spacing.md,
  },
  label: {
    color: appErrorColors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    color: appErrorColors.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
  },
  message: {
    color: appErrorColors.textMuted,
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  debugMessage: {
    color: appErrorColors.text,
    fontFamily: typography.identity,
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    minHeight: touchTargets.android,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.infoSurface,
    boxShadow: neoShadows.control,
  },
  buttonPressed: {
    boxShadow: neoShadows.controlPressed,
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },
  buttonLabel: { color: appErrorColors.text, fontFamily: typography.heading, fontSize: 18 },
});

interface GlobalErrorBoundaryState {
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<PropsWithChildren, GlobalErrorBoundaryState> {
  state: GlobalErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error', error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error !== null) {
      return <AppErrorFallback error={this.state.error} onRetry={this.reset} />;
    }

    return this.props.children;
  }
}
