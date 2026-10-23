import { NeoBadge } from '@/components/controls';
import { useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth';
import { LifestyleSetup } from '@/components/lifestyle-setup';
import { parseLifestylePreferences } from '@/utils/recommendations';
import { homeVisualTokens, spacing, typography } from '@/theme';

// before-start

export { BeforeStartScreen as default };

// before-start-screen

export function BeforeStartScreen() {
  const { state } = useAuth();
  const router = useRouter();
  const scroll = useRef<ScrollView>(null);
  if (state.status === 'loading') return <ActivityIndicator />;
  if (state.status !== 'signed_in') return <Redirect href="/" />;
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <NeoBadge label="LÀM QUEN VỚI BẠN" tone="orange" />
        <Text accessibilityRole="header" style={styles.title}>
          TRƯỚC KHI BẮT ĐẦU
        </Text>
        <Text style={styles.body}>Chọn theo thói quen. Thay đổi bất cứ lúc nào.</Text>
      </View>
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <LifestyleSetup
          key={state.user.id}
          onboarding
          initial={parseLifestylePreferences(state.user.user_metadata.lifestyle_preferences)}
          onClose={() => router.replace('/')}
          onStepChange={() => scroll.current?.scrollTo({ y: 0, animated: false })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: homeVisualTokens.paper },
  header: {
    padding: spacing.md,
    backgroundColor: homeVisualTokens.field,
    borderBottomWidth: 3,
    borderColor: homeVisualTokens.ink,
    gap: spacing.sm,
  },
  title: {
    color: homeVisualTokens.ink,
    fontFamily: typography.heading,
    fontSize: 21,
    lineHeight: 29,
  },
  body: { color: homeVisualTokens.ink, fontFamily: typography.body, fontSize: 13, lineHeight: 21 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
});
