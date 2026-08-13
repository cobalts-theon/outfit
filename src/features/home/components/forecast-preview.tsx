import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Link } from 'expo-router';

import type { HomeForecastPreview } from '@/features/home/model/home-prototype';
import { getConditionLabel } from '@/features/home/model/home-prototype';
import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

import { RuledSection, SystemLabel } from './home-primitives';

interface ForecastPreviewProps {
  readonly forecast: HomeForecastPreview;
  readonly forecastRouteAvailable: boolean;
  readonly source: 'live' | 'fixture' | 'unavailable';
}

const sourceLabels = {
  live: 'DỮ LIỆU LIVE',
  fixture: 'DỮ LIỆU MẪU',
  unavailable: 'CHƯA KHẢ DỤNG',
} as const;

export function ForecastPreview({
  forecast,
  forecastRouteAvailable,
  source,
}: ForecastPreviewProps) {
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.35;

  return (
    <RuledSection accessibilityLabel="Diễn biến tiếp theo" testID="forecast-preview">
      <SystemLabel index="02" label="TIẾP THEO" value={sourceLabels[source]} />
      <Text style={styles.summary}>{forecast.summary}</Text>

      {forecast.items.length === 0 ? (
        <View accessibilityLabel="Không có chuỗi dự báo" style={styles.emptyState}>
          <Text style={styles.emptyMark}>--:--</Text>
          <Text style={styles.emptyCopy}>Chuỗi theo giờ chưa khả dụng.</Text>
        </View>
      ) : (
        <ScrollView
          accessibilityLabel={
            source === 'live'
              ? 'Chuỗi dự báo theo giờ trực tiếp'
              : 'Chuỗi dự báo theo giờ mẫu'
          }
          contentContainerStyle={styles.sequence}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
        >
          {forecast.items.map((item) => {
            const condition = getConditionLabel(item.condition);
            const precipitation =
              item.precipitationProbability === undefined
                ? 'Mưa —'
                : `Mưa ${Math.round(item.precipitationProbability * 100)}%`;

            return (
              <View
                accessibilityLabel={`${item.timeLabel}, ${condition}, ${item.temperatureCelsius} độ C, ${precipitation}`}
                key={item.id}
                style={[
                  styles.item,
                  largeText && styles.itemLargeText,
                  item.isCurrent && styles.itemCurrent,
                ]}
              >
                <Text style={[styles.time, item.isCurrent && styles.timeCurrent]}>
                  {item.timeLabel}
                </Text>
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={styles.conditionMark}
                >
                  <View style={[styles.conditionLine, !item.isDay && styles.conditionLineNight]} />
                  <View style={styles.conditionDot} />
                </View>
                <Text style={styles.temperature}>{Math.round(item.temperatureCelsius)}°</Text>
                <Text style={styles.condition}>{condition}</Text>
                <Text style={styles.precipitation}>{precipitation}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
      {forecastRouteAvailable ? (
        <Link asChild href="/forecast">
          <Pressable
            accessibilityHint="Mở dự báo chi tiết theo giờ và theo ngày"
            accessibilityRole="button"
            android_ripple={{ color: homeVisualTokens.grid }}
            style={({ pressed }) => [
              styles.forecastLink,
              pressed && styles.forecastLinkPressed,
            ]}
          >
            <Text style={styles.forecastLinkText}>XEM DỰ BÁO ĐẦY ĐỦ →</Text>
          </Pressable>
        </Link>
      ) : null}
    </RuledSection>
  );
}

const colors = appThemes.dark.colors;

const styles = StyleSheet.create({
  summary: {
    maxWidth: 620,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  sequence: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  item: {
    width: 104,
    minHeight: 156,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  itemLargeText: {
    width: 144,
  },
  itemCurrent: {
    backgroundColor: homeVisualTokens.fieldRaised,
    borderTopWidth: 2,
    borderTopColor: homeVisualTokens.technical,
    paddingTop: 10,
  },
  time: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  timeCurrent: {
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
  },
  conditionMark: {
    width: 40,
    height: 14,
    justifyContent: 'center',
  },
  conditionLine: {
    width: 40,
    height: 2,
    backgroundColor: homeVisualTokens.attention,
  },
  conditionLineNight: {
    backgroundColor: homeVisualTokens.technicalMuted,
  },
  conditionDot: {
    position: 'absolute',
    right: 8,
    width: 7,
    height: 7,
    backgroundColor: colors.text,
  },
  temperature: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 25,
    lineHeight: 31,
    fontVariant: ['tabular-nums'],
  },
  condition: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  precipitation: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 10,
    lineHeight: 16,
  },
  emptyState: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  emptyMark: {
    color: homeVisualTokens.unavailable,
    fontFamily: typography.identitySemibold,
    fontSize: 22,
  },
  emptyCopy: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
  forecastLink: {
    minHeight: 48,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: homeVisualTokens.technical,
    marginTop: spacing.sm,
  },
  forecastLinkPressed: {
    backgroundColor: homeVisualTokens.fieldRaised,
  },
  forecastLinkText: {
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
});
