/**
 * Các điều khiển dùng lại: nút, nhãn, hiệu ứng xuất hiện và hỗ trợ giảm chuyển động.
 * Dùng chung để màu sắc và thao tác thống nhất giữa các màn hình.
 */
import { Platform, Pressable, Text, View, KeyboardAvoidingView, Modal, ScrollView, FlatList, AccessibilityInfo, Animated, type StyleProp, type ViewStyle } from 'react-native';
import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { neoButtonStyles, backStyles, neoBadgeStyles, neoSheetStyles, timeDropdownStyles } from '@/css/components/controls.styles';
import { slideInAnimationStyle, slideRevealAnimationStyle } from '@/css/components/controls.styles';

// neo-button

interface NeoButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly tone?: 'primary' | 'secondary' | 'danger' | 'neutral' | 'accent';
  readonly accessibilityLabel?: string;
}

// Hiển thị nút dùng chung.
export function NeoButton({ label, onPress, disabled = false, tone = 'primary', accessibilityLabel }: NeoButtonProps) {
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
        style={[neoButtonStyles.text, tone === 'secondary' && neoButtonStyles.secondaryText, disabled && neoButtonStyles.textDisabled]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Hiển thị nút quay lại.
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

// neo-badge

/** A small non-interactive label with the same outlined frame as other neo controls. */
// Hiển thị nhãn trạng thái.
export function NeoBadge({ label, tone = 'blue' }: {
  label: string;
  tone?: 'blue' | 'green' | 'orange' | 'neutral';
}) {
  return (
    <View
      style={[neoBadgeStyles.frame, tone === 'green' && neoBadgeStyles.green, tone === 'orange' && neoBadgeStyles.orange, tone === 'neutral' && neoBadgeStyles.neutral]}
    >
      <Text style={neoBadgeStyles.label}>{label}</Text>
    </View>
  );
}

// use-reduced-motion

// Theo dõi tùy chọn giảm chuyển động.
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReducedMotion(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);

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

// Hiển thị bảng nội dung dạng modal.
export function NeoSheet({ visible, label, title, onClose, children, scrollResetKey, closeTone = 'neutral', presentation = 'modal', backAction = false }: NeoSheetProps) {
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
              style={({ pressed }) => [neoSheetStyles.closeButton, closeTone === 'coral' && neoSheetStyles.closeButtonCoral, pressed && neoSheetStyles.closeButtonPressed]}
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

// time-dropdown

const times = Array.from({ length: 48 }, (_, i) => i * 30);

// Đổi số phút thành giờ và phút.
export const formatClock = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

// Hiển thị danh sách chọn giờ.
export function TimeDropdown({ label, value, onChange, disabled, minTime = 0 }: {
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
        style={[timeDropdownStyles.control, value !== undefined && timeDropdownStyles.filled, open && timeDropdownStyles.open]}
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

// animations

/** Brief native slide on entry; respects the system's reduced-motion setting. */
// Tạo hiệu ứng trượt khi xuất hiện.
export function SlideIn({ children, horizontal = false, replayKey, style }: PropsWithChildren<{
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
      style={[style, slideInAnimationStyle(progress, horizontal, distance)]}
    >
      {children}
    </Animated.View>
  );
}

/** Keep closing content mounted until its slide finishes; rapid toggles cancel cleanly. */
// Hiện hoặc ẩn nội dung có chuyển động.
export function SlideReveal({ visible, children, style }: PropsWithChildren<{ visible: boolean; style?: StyleProp<ViewStyle> }>) {
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
      style={[style, slideRevealAnimationStyle(progress)]}
    >
      {children}
    </Animated.View>
  );
}
