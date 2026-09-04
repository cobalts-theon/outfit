/*
 * THESIS: A civic weather bulletin turns normalized readings into one decisive route; it refuses the dark terminal dashboard.
 * OWN-WORLD: Warm paper, ink-black 3px rules, cobalt, sunflower, coral and mint; square blocks and offset print shadows.
 * STORY: Read the weather now, act on the prioritized guidance, understand why, then compare what changes next.
 * FIRST VIEWPORT: Blue location ticket above a dominant temperature/sun field; the recommendation surface follows immediately.
 * FORM: Weather Public Bulletin, assigned direction 6, seed 513c0742. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppDrawer } from '@/components/ui/app-drawer';
import { AppMasthead } from '@/components/ui/app-masthead';
import { AccountSheet } from '@/features/auth/components/account-sheet';
import type { CurrentWeather } from '@/features/weather/domain/current-weather';
import { EnvironmentMetrics } from '@/features/home/components/environment-metrics';
import { ForecastPreview } from '@/features/home/components/forecast-preview';
import { LiveWeatherStatusStrip } from '@/features/home/components/live-weather-status-strip';
import {
  LiveRecommendationPanel,
  RecommendationPreview,
} from '@/features/home/components/recommendation-preview';
import { RiskAdvisory } from '@/features/home/components/risk-advisory';
import { WeatherHero } from '@/features/home/components/weather-hero';
import { LocationCapabilityStrip } from '@/features/locations/components/location-capability-strip';
import { LocationsSheet } from '@/features/locations/components/locations-sheet';
import { useLocationCapability } from '@/features/locations/application/location-capability-provider';
import { useNotifications } from '@/features/notifications/application/notification-provider';
import { NotificationSettingsSheet } from '@/features/notifications/components/notification-settings-sheet';
import { createRecommendationNotificationPlan } from '@/features/notifications/domain/recommendation-notification-plan';
import { createLiveRecommendationPresentation } from '@/features/home/model/home-live-presentation';
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
  neoShadows,
  spacing,
  touchTargets,
  typography,
} from '@/theme/tokens';

const LAST_SCENARIO_INDEX = HOME_PROTOTYPE_SCENARIOS.length - 1;

export function HomePrototypeScreen() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const router = useRouter();
  const { sync: syncNotifications } = useNotifications();
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
  const liveRecommendationPresentation =
    liveResult === undefined
      ? undefined
      : createLiveRecommendationPresentation(liveResult);
  const risk =
    liveRecommendationPresentation === undefined
      ? fixturePresentation.risk
      : liveRecommendationPresentation.risk;
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
  const location =
    selectedLocation?.label ??
    (selectedLocation === undefined
      ? [weather.location.name, weather.location.region].filter(Boolean).join(' // ')
      : 'VỊ TRÍ HIỆN TẠI');
  const freshnessLabel = isLive
    ? `TRỰC TIẾP${liveResult.status === 'partial' ? ' // MỘT PHẦN' : ''}${
        liveWeatherQuery.isStale ? ' // CÓ THỂ CŨ' : ''
      } // QUAN SÁT ${observedTime}`
    : selectedLocation !== undefined && liveWeatherQuery.isPending
      ? `MINH HỌA // ĐANG TẢI DỮ LIỆU // ${observedTime}`
      : selectedLocation !== undefined && liveWeatherQuery.isError
        ? `MINH HỌA // DỮ LIỆU TRỰC TIẾP KHÔNG KHẢ DỤNG // ${observedTime}`
        : `MINH HỌA // QUAN SÁT ${observedTime}`;

  useEffect(() => {
    if (
      liveResult === undefined ||
      selectedLocation === undefined
    ) {
      return;
    }

    const notificationPresentation = createLiveRecommendationPresentation(liveResult);
    const events = createRecommendationNotificationPlan({
      currentWeather: liveResult.weather,
      evaluation: notificationPresentation.evaluation,
      hourlyForecast: liveResult.hourlyForecast,
      locationIdentity: `${selectedLocation.source}:${selectedLocation.coordinates.latitude.toFixed(3)},${selectedLocation.coordinates.longitude.toFixed(3)}`,
      locationLabel: location,
    });
    void syncNotifications(events);
  }, [
    liveResult,
    location,
    selectedLocation,
    syncNotifications,
  ]);

  const showNextScenario = useCallback(() => {
    setScenarioIndex((current) => (current === LAST_SCENARIO_INDEX ? 0 : current + 1));
  }, []);

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" translucent={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        testID="home-screen"
      >
        <View style={styles.frame}>
          <AppMasthead
            onOpenAccount={() => setAccountOpen(true)}
            onOpenMenu={() => setDrawerOpen(true)}
          />
          <View style={styles.headerWrap}>
            <View pointerEvents="none" style={styles.headerShadow} />
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
                  <Text style={styles.freshness}>
                    {freshnessLabel.replaceAll(' // ', ' · ')}
                  </Text>
                </View>
              </View>

              {isLive ? (
                <View
                  accessibilityLabel={`Hiện tại dùng dữ liệu live; Dự báo kế tiếp ${
                    forecastSource === 'live' ? 'dùng dữ liệu live' : 'chưa khả dụng'
                  }; Hành động dùng Rule Engine`}
                  style={styles.sourceReadout}
                >
                  <Text style={styles.sourceReadoutPrimary}>TRỰC TIẾP</Text>
                  <Text style={styles.sourceReadoutSecondary}>
                    {forecastSource === 'live'
                      ? 'HIỆN TẠI + TIẾP THEO'
                      : 'HIỆN TẠI · TIẾP THEO —'}
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
          </View>

          <WeatherHero
            compact={compact}
            reflow={largeTextReflow}
            weather={weather}
          />
          {liveRecommendationPresentation === undefined ? (
            <RecommendationPreview recommendation={fixturePresentation.recommendation} />
          ) : (
            <LiveRecommendationPanel
              evaluation={liveRecommendationPresentation.evaluation}
            />
          )}
          <RiskAdvisory compact risk={risk} />
          <ForecastPreview
            forecast={forecast}
            forecastRouteAvailable={liveResult !== undefined}
            source={forecastSource}
          />
          <EnvironmentMetrics source={isLive ? 'live' : 'fixture'} weather={weather} />
          <LocationCapabilityStrip compact />
          {selectedLocation === undefined ? null : (
            <LiveWeatherStatusStrip query={liveWeatherQuery} />
          )}

          <View style={styles.footer}>
            <Text style={styles.footerPrimary}>
              {(isLive
                ? forecastSource === 'live'
                  ? 'HIỆN TẠI + HÀNH ĐỘNG + LÝ DO + TIẾP THEO // TRỰC TIẾP'
                  : 'HIỆN TẠI + HÀNH ĐỘNG + LÝ DO // TRỰC TIẾP · TIẾP THEO // CHƯA KHẢ DỤNG'
                : 'DỮ LIỆU MINH HỌA // KHÔNG TRỰC TIẾP').replaceAll(' // ', ' · ')}
            </Text>
            <Text style={styles.footerSecondary}>
              {isLive
                ? forecastSource === 'live'
                  ? 'Điều kiện, chuỗi theo giờ và gợi ý tự động dùng dữ liệu đã chuẩn hóa; đây là thông tin sức khỏe và an toàn chung.'
                  : 'Điều kiện hiện tại và gợi ý tự động dùng dữ liệu đang có; chuỗi theo giờ chưa khả dụng và không được suy diễn.'
                : 'Chạm bộ chọn mẫu ở đầu màn hình để kiểm tra các trạng thái.'}
            </Text>
            <Text style={styles.attribution}>WEATHER ICONS · AMCHARTS · CC BY 4.0</Text>
          </View>
        </View>
      </ScrollView>
      <AppDrawer
        onClose={() => setDrawerOpen(false)}
        onOpenAccount={() => {
          setDrawerOpen(false);
          setAccountOpen(true);
        }}
        onOpenForecast={() => {
          setDrawerOpen(false);
          router.push('/forecast');
        }}
        onOpenHome={() => setDrawerOpen(false)}
        onOpenLocations={() => {
          setDrawerOpen(false);
          setLocationsOpen(true);
        }}
        onOpenNotifications={() => {
          setDrawerOpen(false);
          setNotificationsOpen(true);
        }}
        visible={drawerOpen}
      />
      <AccountSheet onClose={() => setAccountOpen(false)} visible={accountOpen} />
      <LocationsSheet
        onClose={() => setLocationsOpen(false)}
        onRequireAuth={() => {
          setLocationsOpen(false);
          setAccountOpen(true);
        }}
        visible={locationsOpen}
      />
      <NotificationSettingsSheet
        onClose={() => setNotificationsOpen(false)}
        visible={notificationsOpen}
      />
    </SafeAreaView>
  );
}

const colors = appThemes.light.colors;
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
    paddingBottom: spacing.lg,
  },
  frame: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  headerWrap: {
    position: 'relative',
    marginHorizontal: spacing.sm,
    marginBottom: 6,
    marginRight: spacing.sm + 6,
  },
  headerShadow: {
    position: 'absolute',
    top: 6,
    right: -6,
    bottom: -6,
    left: 6,
    backgroundColor: homeVisualTokens.ink,
  },
  header: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.cobalt,
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
    color: colors.surface,
    fontFamily: typography.display,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    textTransform: 'uppercase',
  },
  freshnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  liveMark: {
    width: 7,
    height: 7,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: homeVisualTokens.mint,
  },
  freshness: {
    flexShrink: 1,
    color: colors.surface,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.45,
  },
  scenarioButton: {
    width: 94,
    minHeight: minimumTouchTarget,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    backgroundColor: homeVisualTokens.sunflower,
    boxShadow: neoShadows.control,
  },
  scenarioButtonPressed: {
    boxShadow: neoShadows.controlPressed,
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },
  sourceReadout: {
    minWidth: 122,
    minHeight: minimumTouchTarget,
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: spacing.xxs,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    paddingHorizontal: spacing.xs,
    backgroundColor: homeVisualTokens.paper,
  },
  sourceReadoutPrimary: {
    color: homeVisualTokens.ink,
    fontFamily: typography.heading,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.8,
  },
  sourceReadoutSecondary: {
    color: colors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
  },
  scenarioCount: {
    color: homeVisualTokens.ink,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 15,
    fontVariant: ['tabular-nums'],
  },
  scenarioLabel: {
    maxWidth: '100%',
    color: colors.text,
    fontFamily: typography.headingSemibold,
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'right',
  },
  footer: {
    gap: spacing.xs,
    borderTopWidth: 3,
    borderColor: colors.border,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
  },
  footerPrimary: {
    color: homeVisualTokens.ink,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.7,
  },
  footerSecondary: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  attribution: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.4,
  },
});
