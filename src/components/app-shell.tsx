/**
 * Khung giao diện dùng chung: đầu trang, menu và màn hình báo lỗi.
 * Các màn hình ghép những thành phần này để giữ cách điều hướng nhất quán.
 */
import { useProfile } from '@/services/account';
import { useReducedMotion, SlideIn } from '@/components/controls';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserDisplayName, useAuth, getUserInitials } from '@/context/auth';
import { ProfileAvatarContent } from '@/components/account';
import { Component, type ErrorInfo, type PropsWithChildren } from 'react';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { appDrawerStyles, appMastheadStyles, appErrorStyles } from '@/css/components/app-shell.styles';

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

export function AppDrawer({ visible, onClose, onOpenHome, onOpenForecast, onOpenLocations, onOpenNotifications, onOpenAccount }: AppDrawerProps) {
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
                style={({ pressed }) => [appDrawerStyles.closeButton, pressed && appDrawerStyles.closeButtonPressed]}
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
          style={({ pressed }) => [appMastheadStyles.iconButton, pressed && appMastheadStyles.iconButtonPressed]}
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
          style={({ pressed }) => [appMastheadStyles.avatar, state.status === 'signed_in' && appMastheadStyles.avatarSignedIn, pressed && appMastheadStyles.iconButtonPressed]}
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
            style={[appMastheadStyles.authSignal, state.status === 'signed_in' && appMastheadStyles.authSignalSignedIn]}
          />
        </Pressable>
      </View>
    </View>
  );
}

// app-error

interface AppErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

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
          style={({ pressed }) => [appErrorStyles.button, pressed ? appErrorStyles.buttonPressed : null]}
        >
          <Text style={appErrorStyles.buttonLabel}>THỬ LẠI</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

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
