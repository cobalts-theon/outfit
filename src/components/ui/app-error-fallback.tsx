import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  appThemes,
  homeVisualTokens,
  neoShadows,
  spacing,
  touchTargets,
  typography,
} from '@/theme/tokens';

interface AppErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

const colors = appThemes.light.colors;

export function AppErrorFallback({ error, onRetry }: AppErrorFallbackProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View accessibilityRole="alert" style={styles.content}>
        <Text style={styles.label}>PHỤC HỒI GIAO DIỆN</Text>
        <Text style={styles.title}>Ứng dụng gặp sự cố</Text>
        <Text style={styles.message}>
          Không thể hoàn tất thao tác. Hãy thử khởi động lại phần giao diện này.
        </Text>
        {__DEV__ && error ? <Text style={styles.debugMessage}>{error.message}</Text> : null}
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}>
          <Text style={styles.buttonLabel}>THỬ LẠI</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: homeVisualTokens.dangerSurface,
    borderWidth: 3,
    borderColor: colors.border,
    margin: spacing.md,
  },
  label: {
    color: colors.danger,
    fontFamily: typography.identitySemibold,
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
  },
  message: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  debugMessage: {
    color: colors.warning,
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
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.cobalt,
    boxShadow: neoShadows.control,
  },
  buttonPressed: {
    boxShadow: neoShadows.controlPressed,
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },
  buttonLabel: {
    color: colors.surface,
    fontFamily: typography.heading,
    fontSize: 18,
  },
});
