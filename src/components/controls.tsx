import {
  radii,
  appThemes,
  homeVisualTokens,
  spacing,
  touchTargets,
  typography,
  layout,
} from '@/theme';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  FlatList,
  AccessibilityInfo,
  Animated,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// neo-button

interface NeoButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly tone?: 'primary' | 'secondary' | 'danger' | 'neutral' | 'accent';
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
        neoButtonStyles.button,
        tone === 'secondary' && neoButtonStyles.secondary,
        tone === 'danger' && neoButtonStyles.danger,
        tone === 'accent' && neoButtonStyles.danger,
        tone === 'neutral' && neoButtonStyles.neutral,
        disabled && neoButtonStyles.disabled,
        pressed && !disabled && neoButtonStyles.pressed,
      ]}
    >
      <Text
        style={[
          neoButtonStyles.text,
          tone === 'secondary' && neoButtonStyles.secondaryText,
          disabled && neoButtonStyles.textDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const neoButtonColors = appThemes.light.colors;

const neoButtonMinimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const neoButtonStyles = StyleSheet.create({
  button: {
    minHeight: neoButtonMinimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: neoButtonColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: homeVisualTokens.coral,
    boxShadow: '4px 4px 0px #1D3557',
  },
  neutral: { backgroundColor: homeVisualTokens.field },
  secondary: { backgroundColor: neoButtonColors.secondary, boxShadow: '4px 4px 0px #1D3557' },
  secondaryText: { color: neoButtonColors.onSecondary },
  danger: { backgroundColor: homeVisualTokens.coral },
  disabled: { backgroundColor: homeVisualTokens.unavailableSurface, boxShadow: 'none' },
  pressed: { transform: [{ translateX: 3 }, { translateY: 3 }], boxShadow: '1px 1px 0px #1D3557' },
  text: {
    color: neoButtonColors.text,
    fontFamily: typography.heading,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  textDisabled: { color: neoButtonColors.text },
});

export function NeoBackButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={backStyles.shadowSpace}>
      <View pointerEvents="none" style={backStyles.shadowPlate} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        onPress={onPress}
        style={({ pressed }) => [backStyles.button, pressed && backStyles.pressed]}
      >
        <Text style={backStyles.arrow}>←</Text>
      </Pressable>
    </View>
  );
}

const backStyles = StyleSheet.create({
  // Native header clips outside the measured custom-view bounds. Reserve
  // space for the entire 4px shadow and the pressed translation inside them.
  shadowSpace: { width: 56, height: 56, paddingTop: 2, paddingLeft: 2, marginRight: 12 },
  shadowPlate: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 48,
    height: 48,
    borderRadius: radii.control,
    backgroundColor: appThemes.light.colors.border,
  },
  button: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: homeVisualTokens.coral,
    borderWidth: 3,
    borderColor: appThemes.light.colors.border,
    borderRadius: radii.control,
  },
  pressed: { transform: [{ translateX: 3 }, { translateY: 3 }] },
  arrow: {
    color: appThemes.light.colors.text,
    fontFamily: typography.heading,
    fontSize: 26,
    lineHeight: 32,
  },
});

// neo-badge

/** A small non-interactive label with the same outlined frame as other neo controls. */
export function NeoBadge({
  label,
  tone = 'blue',
}: {
  label: string;
  tone?: 'blue' | 'green' | 'orange' | 'neutral';
}) {
  return (
    <View
      style={[
        neoBadgeStyles.frame,
        tone === 'green' && neoBadgeStyles.green,
        tone === 'orange' && neoBadgeStyles.orange,
        tone === 'neutral' && neoBadgeStyles.neutral,
      ]}
    >
      <Text style={neoBadgeStyles.label}>{label}</Text>
    </View>
  );
}

const neoBadgeStyles = StyleSheet.create({
  frame: {
    alignSelf: 'flex-start',
    flexShrink: 1,
    maxWidth: '100%',
    borderWidth: 2,
    borderColor: homeVisualTokens.ink,
    borderRadius: radii.control,
    backgroundColor: homeVisualTokens.infoSurface,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    boxShadow: '3px 3px 0px #1D3557',
    marginRight: 3,
    marginBottom: 3,
  },
  neutral: { backgroundColor: homeVisualTokens.field },
  green: { backgroundColor: homeVisualTokens.mint },
  orange: { backgroundColor: homeVisualTokens.coral },
  label: {
    color: homeVisualTokens.ink,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 17,
  },
});

// use-reduced-motion

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReducedMotion(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reducedMotion;
}

// neo-sheet

interface NeoSheetProps extends PropsWithChildren {
  readonly visible: boolean;
  readonly presentation?: 'modal' | 'page';
  readonly backAction?: boolean;
  readonly scrollResetKey?: string;
  readonly closeTone?: 'neutral' | 'coral';
  readonly label: string;
  readonly title: string;
  readonly onClose?: () => void;
}

export function NeoSheet({
  visible,
  label,
  title,
  onClose,
  children,
  scrollResetKey,
  closeTone = 'neutral',
  presentation = 'modal',
  backAction = false,
}: NeoSheetProps) {
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });

    return () => cancelAnimationFrame(frame);
  }, [visible, scrollResetKey]);

  const content = (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={neoSheetStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={neoSheetStyles.keyboardAvoiding}
      >
        <View style={neoSheetStyles.header}>
          <View style={neoSheetStyles.headerCopy}>
            <NeoBadge label={label} />
            <Text accessibilityRole="header" style={neoSheetStyles.title}>
              {title}
            </Text>
          </View>
          {onClose ? (
            <Pressable
              accessibilityLabel={backAction ? 'Quay lại giới thiệu' : 'Đóng'}
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                neoSheetStyles.closeButton,
                closeTone === 'coral' && neoSheetStyles.closeButtonCoral,
                pressed && neoSheetStyles.closeButtonPressed,
              ]}
            >
              <Text style={neoSheetStyles.closeText}>{backAction ? '←' : 'X'}</Text>
            </Pressable>
          ) : null}
        </View>
        <ScrollView
          contentContainerStyle={neoSheetStyles.content}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
  if (presentation === 'page') return content;
  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible={visible}
    >
      {content}
    </Modal>
  );
}

const neoSheetColors = appThemes.light.colors;

const neoSheetMinimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const neoSheetStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: neoSheetColors.background },
  keyboardAvoiding: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 4,
    borderColor: neoSheetColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: neoSheetColors.surface,
  },
  headerCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  title: {
    color: neoSheetColors.text,
    fontFamily: typography.heading,
    fontSize: 21,
    lineHeight: 28,
  },
  closeButton: {
    width: neoSheetMinimumTouchTarget,
    minHeight: neoSheetMinimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: neoSheetColors.border,
    backgroundColor: neoSheetColors.surface,
    boxShadow: '4px 4px 0px #1D3557',
  },
  closeButtonCoral: { backgroundColor: homeVisualTokens.coral },
  closeButtonPressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
    boxShadow: '1px 1px 0px #1D3557',
  },
  closeText: {
    color: neoSheetColors.text,
    fontFamily: typography.brand,
    fontSize: 20,
    lineHeight: 23,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
});

// time-dropdown

const times = Array.from({ length: 48 }, (_, i) => i * 30);

export const formatClock = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

export function TimeDropdown({
  label,
  value,
  onChange,
  disabled,
  minTime = 0,
}: {
  label: string;
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  minTime?: number;
}) {
  const options = times.filter((time) => time >= minTime);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  return (
    <View style={timeDropdownStyles.group}>
      <Text style={timeDropdownStyles.label}>{label}</Text>
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={`${label}: ${value === undefined ? 'Chọn giờ' : formatClock(value)}`}
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          timeDropdownStyles.control,
          value !== undefined && timeDropdownStyles.filled,
          open && timeDropdownStyles.open,
        ]}
      >
        <Text style={timeDropdownStyles.text}>
          {value === undefined ? 'Chọn giờ' : formatClock(value)}
        </Text>
        <Text style={timeDropdownStyles.text}>⌄</Text>
      </Pressable>
      <Modal
        transparent
        visible={open}
        animationType={reduced ? 'none' : 'fade'}
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={timeDropdownStyles.backdrop}>
          <View style={timeDropdownStyles.menu}>
            <Text accessibilityRole="header" style={timeDropdownStyles.label}>
              {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={String}
              initialScrollIndex={value === undefined ? 0 : Math.max(0, options.indexOf(value))}
              getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: value === item }}
                  accessibilityLabel={formatClock(item)}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  style={[timeDropdownStyles.option, value === item && timeDropdownStyles.selected]}
                >
                  <Text style={timeDropdownStyles.text}>
                    {formatClock(item)}
                    {value === item ? '  ✓' : ''}
                  </Text>
                </Pressable>
              )}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setOpen(false)}
              style={[timeDropdownStyles.option, timeDropdownStyles.close]}
            >
              <Text style={timeDropdownStyles.label}>ĐÓNG</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const timeDropdownStyles = StyleSheet.create({
  group: { gap: spacing.sm, flex: 1, minWidth: 130 },
  label: {
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 23,
    color: homeVisualTokens.ink,
  },
  text: { fontFamily: typography.body, fontSize: 17, color: homeVisualTokens.ink },
  control: {
    minHeight: 52,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: radii.control,
    padding: spacing.sm,
    backgroundColor: homeVisualTokens.field,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filled: { backgroundColor: homeVisualTokens.selectionSurface },
  open: { backgroundColor: homeVisualTokens.infoSurface },
  close: {
    backgroundColor: homeVisualTokens.paleBlueField,
    borderWidth: 2,
    borderColor: homeVisualTokens.ink,
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(33,33,33,0.5)',
  },
  menu: {
    maxHeight: '75%',
    backgroundColor: homeVisualTokens.field,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: radii.control,
    padding: spacing.md,
    gap: spacing.sm,
  },
  option: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.control,
  },
  selected: { backgroundColor: homeVisualTokens.sunflower },
});

// animations

/** Brief native slide on entry; respects the system's reduced-motion setting. */
export function SlideIn({
  children,
  horizontal = false,
  replayKey,
  style,
}: PropsWithChildren<{
  horizontal?: boolean;
  replayKey?: boolean | string;
  style?: StyleProp<ViewStyle>;
}>) {
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState<boolean>();
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduceMotion(value);
      })
      .catch(() => {
        if (active) setReduceMotion(true);
      });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    if (reduceMotion === undefined) return;
    progress.stopAnimation();
    progress.setValue(reduceMotion ? 1 : 0);
    if (reduceMotion) return;
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: horizontal ? 240 : 200,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [horizontal, progress, reduceMotion, replayKey]);
  const distance = horizontal ? -320 : 24;
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }),
          transform: horizontal
            ? [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [distance, 0],
                  }),
                },
              ]
            : [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [distance, 0],
                  }),
                },
              ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Keep closing content mounted until its slide finishes; rapid toggles cancel cleanly. */
export function SlideReveal({
  visible,
  children,
  style,
}: PropsWithChildren<{ visible: boolean; style?: StyleProp<ViewStyle> }>) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  useEffect(() => {
    if (visible) setMounted(true);
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: reduced ? 0 : 200,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
    return () => animation.stop();
  }, [progress, reduced, visible]);
  if (!mounted) return null;
  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
