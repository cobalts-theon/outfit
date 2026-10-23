/**
 * Màn hình thiết lập sở thích ban đầu sau khi tạo tài khoản.
 * Các lựa chọn giúp điều chỉnh ngữ cảnh gợi ý sinh hoạt.
 */
import { NeoBadge } from '@/components/controls';
import { useRef } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth';
import { LifestyleSetup } from '@/components/lifestyle-setup';
import { parseLifestylePreferences } from '@/utils/recommendations';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { styles } from '@/css/screens/before-start.styles';

// before-start

export { BeforeStartScreen as default };

// before-start-screen

// Hiển thị bước thiết lập sở thích.
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
