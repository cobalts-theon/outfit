import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeoBadge, NeoButton, useReducedMotion } from '@/components/controls';
import { AccountSheet } from '@/components/account';
import { homeVisualTokens, spacing, typography } from '@/theme';

// welcome-screen

const slides = [
  {
    image: require('../../assets/start-image/running-on-good-day.jpg'),
    label: 'KHỎE HƠN MỖI NGÀY',
    title: 'Ngày đẹp trời.\nMình làm gì nhỉ?',
    body: 'Gợi ý vận động, trang phục và sinh hoạt từ thời tiết quanh bạn.',
  },
  {
    image: require('../../assets/start-image/rainy-day.jpeg'),
    label: 'CHỦ ĐỘNG RA NGOÀI',
    title: 'Đi đâu cũng\nchuẩn bị một chút.',
    body: 'Biết lúc nào cần mang ô, tránh nắng hay chọn thời điểm phù hợp.',
  },
  {
    image: require('../../assets/start-image/Schedule.jpeg'),
    label: 'PHÙ HỢP VỚI BẠN',
    title: 'Thói quen của bạn.\nGợi ý dành cho bạn.',
    body: 'Chọn hoạt động và giờ rảnh để lên kế hoạch cho một ngày dễ chịu hơn.',
  },
] as const;

export function WelcomeScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>();
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const [titleHeight, setTitleHeight] = useState(70);
  const [bodyHeight, setBodyHeight] = useState(63);
  const carousel = useRef<ScrollView>(null);
  const reducedMotion = useReducedMotion();
  if (mode)
    return (
      <AccountSheet
        key={mode}
        visible
        entry
        initialMode={mode}
        onClose={() => setMode(undefined)}
      />
    );
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <NeoBadge label="WEATHER" tone="orange" />
          <Text style={styles.tagline}>Thời tiết hiểu bạn hơn.</Text>
        </View>
        <View
          onLayout={(event) => {
            const nextWidth = event.nativeEvent.layout.width;
            setWidth(nextWidth);
            carousel.current?.scrollTo({ x: page * nextWidth, animated: false });
          }}
        >
          <ScrollView
            ref={carousel}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              if (width) setPage(Math.round(event.nativeEvent.contentOffset.x / width));
            }}
          >
            {width > 0
              ? slides.map((slide, index) => (
                  <View
                    key={slide.label}
                    style={[styles.slide, { width }]}
                    accessibilityElementsHidden={page !== index}
                    importantForAccessibility={page === index ? 'auto' : 'no-hide-descendants'}
                  >
                    <View style={[styles.artFrame, { height: Math.min((width - 8) * 0.625, 245) }]}>
                      <Image
                        source={slide.image}
                        contentFit="cover"
                        style={styles.art}
                        accessibilityLabel={slide.label}
                      />
                    </View>
                    <Text style={styles.eyebrow}>{slide.label}</Text>
                    <View style={{ minHeight: titleHeight }}>
                      <Text
                        accessibilityRole="header"
                        style={styles.title}
                        onLayout={(event) => {
                          const height = event.nativeEvent.layout.height;
                          setTitleHeight((current) => Math.max(current, height));
                        }}
                      >
                        {slide.title}
                      </Text>
                    </View>
                    <View style={{ minHeight: bodyHeight }}>
                      <Text
                        style={styles.body}
                        onLayout={(event) => {
                          const height = event.nativeEvent.layout.height;
                          setBodyHeight((current) => Math.max(current, height));
                        }}
                      >
                        {slide.body}
                      </Text>
                    </View>
                  </View>
                ))
              : null}
          </ScrollView>
        </View>
        <View style={styles.pagination}>
          {slides.map((slide, index) => (
            <Pressable
              key={slide.label}
              accessibilityRole="button"
              accessibilityLabel={`Giới thiệu ${index + 1}: ${slide.label}`}
              accessibilityState={{ selected: page === index }}
              onPress={() => {
                setPage(index);
                carousel.current?.scrollTo({ x: index * width, animated: !reducedMotion });
              }}
              style={styles.dotTarget}
            >
              <View style={[styles.dot, page === index && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
        <View style={styles.actions}>
          <NeoButton label="XEM KHUYẾN NGHỊ" onPress={() => router.replace('/')} />
          <NeoButton tone="secondary" label="ĐĂNG KÝ" onPress={() => setMode('sign_up')} />
          <NeoButton label="ĐĂNG NHẬP" tone="secondary" onPress={() => setMode('sign_in')} />
          <Text style={styles.note}>Xem gợi ý ngay. Đăng nhập khi cần lưu và đồng bộ.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: homeVisualTokens.paper },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  tagline: {
    flex: 1,
    textAlign: 'right',
    fontFamily: typography.body,
    fontSize: 11,
    color: homeVisualTokens.ink,
  },
  slide: { paddingHorizontal: 4, gap: 12 },
  art: { width: '100%', height: '100%' },
  artFrame: {
    width: '100%',
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2A9D8F',
  },
  eyebrow: {
    fontFamily: typography.body,
    fontSize: 11,
    color: homeVisualTokens.ink,
    textAlign: 'center',
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 27,
    lineHeight: 35,
    textAlign: 'center',
    color: homeVisualTokens.ink,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 21,
    color: homeVisualTokens.ink,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginVertical: 4 },
  dotTarget: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.field,
  },
  dotActive: { width: 26, backgroundColor: homeVisualTokens.coral },
  actions: { marginTop: 'auto', gap: 14, paddingTop: 8, paddingRight: 4 },
  note: {
    textAlign: 'center',
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 18,
    color: homeVisualTokens.ink,
  },
});
