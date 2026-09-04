import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { appThemes, homeVisualTokens, spacing, touchTargets, typography } from '@/theme/tokens';

interface NeoButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly tone?: 'primary' | 'secondary' | 'danger';
  readonly accessibilityLabel?: string;
}

export function NeoButton({
  label,
  onPress,
  disabled = false,
  tone = 'primary',
  accessibilityLabel,
}: NeoButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'secondary' && styles.secondary,
        tone === 'danger' && styles.danger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>{label}</Text>
    </Pressable>
  );
}

const colors = appThemes.light.colors;
const minimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const styles = StyleSheet.create({
  button: {
    minHeight: minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: homeVisualTokens.sunflower,
    boxShadow: '4px 4px 0px #101010',
  },
  secondary: {
    backgroundColor: colors.surface,
  },
  danger: {
    backgroundColor: homeVisualTokens.coral,
  },
  disabled: {
    backgroundColor: homeVisualTokens.unavailableSurface,
    boxShadow: 'none',
  },
  pressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
    boxShadow: '1px 1px 0px #101010',
  },
  text: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  textDisabled: {
    color: homeVisualTokens.unavailable,
  },
});
