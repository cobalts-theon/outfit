import { type PropsWithChildren, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  appThemes,
  homeVisualTokens,
  layout,
  spacing,
  touchTargets,
  typography,
} from '@/theme/tokens';

interface NeoSheetProps extends PropsWithChildren {
  readonly visible: boolean;
  readonly label: string;
  readonly title: string;
  readonly onClose: () => void;
}

export function NeoSheet({ visible, label, title, onClose, children }: NeoSheetProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });

    return () => cancelAnimationFrame(frame);
  }, [visible]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible={visible}
    >
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoiding}
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.label}>{label}</Text>
              <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            </View>
            <Pressable
              accessibilityLabel="Đóng"
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <Text style={styles.closeText}>X</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const colors = appThemes.light.colors;
const minimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 4,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: homeVisualTokens.sunflower,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  label: {
    color: colors.text,
    fontFamily: typography.brand,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
  },
  title: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 23,
    lineHeight: 28,
  },
  closeButton: {
    width: minimumTouchTarget,
    minHeight: minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: '4px 4px 0px #101010',
  },
  closeButtonPressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
    boxShadow: '1px 1px 0px #101010',
  },
  closeText: {
    color: colors.text,
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
