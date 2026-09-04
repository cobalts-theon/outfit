import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { getUserInitials, useAuth } from '@/features/auth/application/auth-provider';
import { useProfile } from '@/features/auth/application/profile-query';
import { ProfileAvatarContent } from '@/features/auth/components/profile-avatar-content';
import { appThemes, homeVisualTokens, spacing, touchTargets, typography } from '@/theme/tokens';

interface AppMastheadProps {
  readonly onOpenMenu: () => void;
  readonly onOpenAccount: () => void;
}

export function AppMasthead({ onOpenMenu, onOpenAccount }: AppMastheadProps) {
  const { state } = useAuth();
  const userId = state.status === 'signed_in' ? state.user.id : undefined;
  const profileQuery = useProfile(userId);
  const initials = state.status === 'signed_in' ? getUserInitials(state.user) : 'TK';

  return (
    <View style={styles.wrap}>
      <View pointerEvents="none" style={styles.shadow} />
      <View style={styles.bar}>
        <Pressable
          accessibilityLabel="Mở menu"
          accessibilityRole="button"
          onPress={onOpenMenu}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.hamburger}>
            <View style={styles.hamburgerLine} />
            <View style={[styles.hamburgerLine, styles.hamburgerLineShort]} />
            <View style={styles.hamburgerLine} />
          </View>
        </Pressable>

        <View accessibilityLabel="Weather system" style={styles.wordmark}>
          <Text style={styles.wordmarkPrimary}>WEATHER</Text>
          <Text style={styles.wordmarkSecondary}>// SYSTEM</Text>
        </View>

        <Pressable
          accessibilityLabel={state.status === 'signed_in' ? 'Mở tài khoản' : 'Đăng nhập hoặc tạo tài khoản'}
          accessibilityRole="button"
          onPress={onOpenAccount}
          style={({ pressed }) => [
            styles.avatar,
            state.status === 'signed_in' && styles.avatarSignedIn,
            pressed && styles.iconButtonPressed,
          ]}
        >
          <ProfileAvatarContent
            avatarPath={profileQuery.data?.avatar_url}
            fallback={initials}
            imageStyle={styles.avatarImage}
            textStyle={styles.avatarText}
          />
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.authSignal,
              state.status === 'signed_in' && styles.authSignalSignedIn,
            ]}
          />
        </Pressable>
      </View>
    </View>
  );
}

const colors = appThemes.light.colors;
const minimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    marginHorizontal: spacing.sm,
    marginRight: spacing.sm + 5,
    marginBottom: 5,
  },
  shadow: {
    position: 'absolute',
    top: 5,
    right: -5,
    bottom: -5,
    left: 5,
    backgroundColor: colors.border,
  },
  bar: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 3,
    borderColor: colors.border,
    paddingHorizontal: spacing.xs,
    backgroundColor: homeVisualTokens.sunflower,
  },
  iconButton: {
    width: minimumTouchTarget,
    height: minimumTouchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconButtonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  hamburger: {
    width: 23,
    gap: 5,
  },
  hamburgerLine: {
    width: 23,
    height: 3,
    backgroundColor: colors.text,
  },
  hamburgerLineShort: {
    width: 16,
  },
  wordmark: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  wordmarkPrimary: {
    color: colors.text,
    fontFamily: typography.brand,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: -0.4,
  },
  wordmarkSecondary: {
    color: colors.text,
    fontFamily: typography.brandRegular,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1.3,
  },
  avatar: {
    width: minimumTouchTarget,
    height: minimumTouchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.coral,
  },
  avatarSignedIn: {
    backgroundColor: homeVisualTokens.mint,
  },
  avatarText: {
    color: colors.text,
    fontFamily: typography.brand,
    fontSize: 14,
    lineHeight: 17,
  },
  avatarImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  authSignal: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.unavailableSurface,
  },
  authSignalSignedIn: {
    backgroundColor: homeVisualTokens.calm,
  },
});
