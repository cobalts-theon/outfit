import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getUserDisplayName, useAuth } from '@/features/auth/application/auth-provider';
import { appThemes, homeVisualTokens, spacing, touchTargets, typography } from '@/theme/tokens';

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
  readonly accent?: 'blue' | 'mint' | 'yellow' | 'coral';
}

function DrawerAction({ index, label, detail, onPress, accent = 'blue' }: DrawerActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        accent === 'mint' && styles.actionMint,
        accent === 'yellow' && styles.actionYellow,
        accent === 'coral' && styles.actionCoral,
        pressed && styles.actionPressed,
      ]}
    >
      <Text style={styles.actionIndex}>{index}</Text>
      <View style={styles.actionCopy}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionDetail}>{detail}</Text>
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
  const { state } = useAuth();
  const accountDetail =
    state.status === 'signed_in'
      ? getUserDisplayName(state.user)
      : state.status === 'unconfigured'
        ? 'Supabase chưa cấu hình'
        : 'Đăng nhập để đồng bộ dữ liệu';

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Đóng menu"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />
        <SafeAreaView edges={['top', 'bottom', 'left']} style={styles.drawer}>
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}>
              <Text style={styles.menuLabel}>MENU//01</Text>
              <Text accessibilityRole="header" style={styles.heading}>ĐIỀU HƯỚNG</Text>
            </View>
            <Pressable
              accessibilityLabel="Đóng menu"
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <Text style={styles.closeText}>X</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.actions}
            showsVerticalScrollIndicator={false}
            style={styles.actionsScroll}
          >
            <DrawerAction index="01" label="THỜI TIẾT" detail="Điều kiện và gợi ý hiện tại" onPress={onOpenHome} />
            <DrawerAction index="02" label="DỰ BÁO" detail="Theo giờ và bảy ngày" onPress={onOpenForecast} />
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

          <View style={styles.footer}>
            <Text style={styles.footerBrand}>WEATHER//SYSTEM</Text>
            <Text style={styles.footerDetail}>NOW → ACTION → WHY → NEXT</Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const colors = appThemes.light.colors;
const minimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#10101099',
  },
  drawer: {
    width: '86%',
    maxWidth: 370,
    borderRightWidth: 4,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.cobalt,
    boxShadow: '8px 0px 0px #101010',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 4,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.sunflower,
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
  },
  menuLabel: {
    color: colors.text,
    fontFamily: typography.brand,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
  },
  heading: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 25,
    lineHeight: 30,
  },
  closeButton: {
    width: minimumTouchTarget,
    minHeight: minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeButtonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  closeText: {
    color: colors.text,
    fontFamily: typography.brand,
    fontSize: 20,
  },
  actionsScroll: {
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  action: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: '5px 5px 0px #101010',
  },
  actionMint: {
    backgroundColor: homeVisualTokens.mint,
  },
  actionYellow: {
    backgroundColor: homeVisualTokens.sunflower,
  },
  actionCoral: {
    backgroundColor: homeVisualTokens.coral,
  },
  actionPressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
    boxShadow: '2px 2px 0px #101010',
  },
  actionIndex: {
    width: 48,
    paddingTop: spacing.sm,
    borderRightWidth: 3,
    borderColor: colors.border,
    color: colors.text,
    fontFamily: typography.brand,
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
  },
  actionCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xxs,
    padding: spacing.sm,
  },
  actionLabel: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 18,
    lineHeight: 22,
  },
  actionDetail: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    gap: spacing.xxs,
    borderTopWidth: 4,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.paper,
  },
  footerBrand: {
    color: colors.text,
    fontFamily: typography.brand,
    fontSize: 13,
    lineHeight: 16,
  },
  footerDetail: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 10,
    lineHeight: 14,
  },
});
