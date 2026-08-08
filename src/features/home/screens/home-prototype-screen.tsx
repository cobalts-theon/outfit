import { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import type { CurrentWeather } from '@/features/weather/domain/current-weather';
import { EnvironmentMetrics } from '@/features/home/components/environment-metrics';
import { ForecastPreview } from '@/features/home/components/forecast-preview';
import { LiveWeatherStatusStrip } from '@/features/home/components/live-weather-status-strip';
import { RecommendationPreview } from '@/features/home/components/recommendation-preview';
import { RiskAdvisory } from '@/features/home/components/risk-advisory';
import { WeatherHero } from '@/features/home/components/weather-hero';
import { LocationCapabilityStrip } from '@/features/locations/components/location-capability-strip';
import { useLocationCapability } from '@/features/locations/application/location-capability-provider';
import { createLiveObservationRisk } from '@/features/home/model/home-live-presentation';
import {
  createHomeHourlyForecastPreview,
  createUnavailableHomeForecastPreview,
} from '@/features/home/model/home-hourly-forecast';
import {
  formatObservedTime,
  HOME_PROTOTYPE_SCENARIOS,
} from '@/features/home/model/home-prototype';
import { useLiveCurrentWeather } from '@/features/weather/application/live-current-weather-query';
import {
  appThemes,
  homeVisualTokens,
  layout,
  spacing,
  touchTargets,
  typography,
} from '@/theme/tokens';

const LAST_SCENARIO_INDEX = HOME_PROTOTYPE_SCENARIOS.length - 1;

export function HomePrototypeScreen() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const { state: locationState } = useLocationCapability();
  const selectedLocation =
    locationState.status === 'ready' ? locationState.selectedLocation : undefined;
  const liveWeatherQuery = useLiveCurrentWeather(selectedLocation);
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370;
  const largeTextReflow = fontScale >= 1.35;
  const headerReflow = width < 340 || fontScale >= 1.4;
  const scenario = HOME_PROTOTYPE_SCENARIOS[scenarioIndex];
  const liveResult = liveWeatherQuery.data;
  const isLive = liveResult !== undefined;
  const fixturePresentation = isLive ? HOME_PROTOTYPE_SCENARIOS[0] : scenario;
  const weather: CurrentWeather = liveResult?.weather ?? scenario.weather;
  const risk =
    liveResult === undefined ? fixturePresentation.risk : createLiveObservationRisk(liveResult);
  const forecast =
    liveResult === undefined
      ? fixturePresentation.forecast
      : liveResult.hourlyForecast === undefined
        ? createUnavailableHomeForecastPreview()
        : createHomeHourlyForecastPreview(liveResult.hourlyForecast, liveResult.weather.observedAt);
  const forecastSource =
    liveResult === undefined
      ? 'fixture'
      : liveResult.hourlyForecast === undefined
        ? 'unavailable'
        : 'live';
  const observedTime = formatObservedTime(weather);
  const location = [weather.location.name, weather.location.region]
    .filter(Boolean)
    .join(' // ');
  const freshnessLabel = isLive
    ? `LIVE${liveResult.status === 'partial' ? ' // MỘT PHẦN' : ''}${
        liveWeatherQuery.isStale ? ' // CÓ THỂ CŨ' : ''
      } // QUAN SÁT ${observedTime}`
    : selectedLocation !== undefined && liveWeatherQuery.isPending
      ? `FIXTURE // ĐANG TẢI LIVE // ${observedTime}`
      : selectedLocation !== undefined && liveWeatherQuery.isError
        ? `FIXTURE // LIVE KHÔNG KHẢ DỤNG // ${observedTime}`
        : `FIXTURE // QUAN SÁT ${observedTime}`;

  const showNextScenario = useCallback(() => {
    setScenarioIndex((current) => (current === LAST_SCENARIO_INDEX ? 0 : current + 1));
  }, []);

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        testID="home-screen"
      >
        <View style={styles.frame}>
          <View
            accessibilityLabel={`Vị trí ${location}. Quan sát lúc ${observedTime}`}
            style={[styles.header, headerReflow && styles.headerReflow]}
          >
            <View style={styles.locationBlock}>
              <Text style={styles.location}>{location}</Text>
              <View style={styles.freshnessRow}>
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={styles.liveMark}
                />
                <Text style={styles.freshness}>{freshnessLabel}</Text>
              </View>
            </View>

            {isLive ? (
              <View
                accessibilityLabel={`Hiện tại dùng dữ liệu live; Dự báo kế tiếp ${
                  forecastSource === 'live' ? 'dùng dữ liệu live' : 'chưa khả dụng'
                }; Hành động vẫn dùng fixture`}
                style={styles.sourceBadge}
              >
                <Text style={styles.sourceBadgePrimary}>NOW // LIVE</Text>
                <Text style={styles.sourceBadgeSecondary}>
                  {forecastSource === 'live'
                    ? 'NEXT // LIVE · ACTION // FIXTURE'
                    : 'NEXT // UNAVAILABLE · ACTION // FIXTURE'}
                </Text>
              </View>
            ) : (
              <Pressable
                accessibilityHint="Chuyển sang trạng thái dữ liệu mẫu tiếp theo"
                accessibilityLabel={`Mẫu ${scenarioIndex + 1} trên ${HOME_PROTOTYPE_SCENARIOS.length}: ${scenario.selectorLabel}`}
                accessibilityRole="button"
                android_ripple={{ color: homeVisualTokens.grid }}
                hitSlop={4}
                onPress={showNextScenario}
                style={({ pressed }) => [
                  styles.scenarioButton,
                  pressed && styles.scenarioButtonPressed,
                ]}
                testID="prototype-scenario-button"
              >
                <Text style={styles.scenarioCount}>
                  {`${String(scenarioIndex + 1).padStart(2, '0')}/${String(
                    HOME_PROTOTYPE_SCENARIOS.length,
                  ).padStart(2, '0')}`}
                </Text>
                <Text numberOfLines={1} style={styles.scenarioLabel}>
                  {scenario.selectorLabel}
                </Text>
              </Pressable>
            )}
          </View>

          <LocationCapabilityStrip />
          {selectedLocation === undefined ? null : (
            <LiveWeatherStatusStrip query={liveWeatherQuery} />
          )}
          <WeatherHero
            compact={compact}
            reflow={largeTextReflow}
            weather={weather}
          />
          <RiskAdvisory risk={risk} />
          <ForecastPreview forecast={forecast} source={forecastSource} />
          <RecommendationPreview recommendation={fixturePresentation.recommendation} />
          <EnvironmentMetrics weather={weather} />

          <View style={styles.footer}>
            <Text style={styles.footerPrimary}>
              {isLive
                ? forecastSource === 'live'
                  ? 'NOW + ENVIRONMENT + NEXT // LIVE · ACTION // FIXTURE'
                  : 'NOW + ENVIRONMENT // LIVE · NEXT // UNAVAILABLE · ACTION // FIXTURE'
                : 'HOME PROTOTYPE // OFFLINE FIXTURES'}
            </Text>
            <Text style={styles.footerSecondary}>
              {isLive
                ? forecastSource === 'live'
                  ? 'Chuỗi theo giờ là dữ liệu live; Hành động vẫn là nội dung bố cục mẫu, chưa được tạo bởi rule engine.'
                  : 'Chuỗi theo giờ không khả dụng; Hành động vẫn là nội dung bố cục mẫu, chưa được tạo bởi rule engine.'
                : 'Chạm bộ chọn mẫu ở đầu màn hình để kiểm tra các trạng thái.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const colors = appThemes.dark.colors;
const minimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  frame: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  headerReflow: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  locationBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  location: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 14,
    lineHeight: 20,
  },
  freshnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  liveMark: {
    width: 5,
    height: 5,
    backgroundColor: homeVisualTokens.technical,
  },
  freshness: {
    flexShrink: 1,
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 0.45,
  },
  scenarioButton: {
    width: 94,
    minHeight: minimumTouchTarget,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    backgroundColor: homeVisualTokens.field,
  },
  scenarioButtonPressed: {
    borderColor: homeVisualTokens.technical,
    backgroundColor: homeVisualTokens.fieldRaised,
  },
  sourceBadge: {
    minWidth: 132,
    minHeight: minimumTouchTarget,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: homeVisualTokens.technical,
    borderRadius: 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    backgroundColor: homeVisualTokens.field,
  },
  sourceBadgePrimary: {
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 15,
  },
  sourceBadgeSecondary: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 8,
    lineHeight: 13,
  },
  scenarioCount: {
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 15,
    fontVariant: ['tabular-nums'],
  },
  scenarioLabel: {
    maxWidth: '100%',
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
  },
  footer: {
    gap: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  footerPrimary: {
    color: homeVisualTokens.technicalMuted,
    fontFamily: typography.identity,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.7,
  },
  footerSecondary: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
