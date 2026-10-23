/**
 * Màn hình chính: lấy dữ liệu từ useHomeModel rồi hiển thị lời khuyên và thời tiết.
 * Trạng thái cục bộ điều khiển việc mở menu, tài khoản, địa điểm và cài đặt.
 */
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StatusBar, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppDrawer, AppMasthead } from '@/components/app-shell';
import { NeoButton, SlideIn, SlideReveal } from '@/components/controls';
import { AccountSheet } from '@/components/account';
import { LocationsSheet, LocationCapabilityStrip } from '@/components/locations';
import { NotificationSettingsSheet } from '@/components/notification-settings';
import { createUpcomingActions } from '@/utils/recommendations';
import { useHomeModel } from '@/hooks/home';
import { ActivityPlanningButton, ConditionsSummary, DailyActionPanel, UpcomingGuidance } from '@/components/home-advice';
import { EnvironmentMetrics, WeatherHero } from '@/components/home-weather';
import { ForecastPreview, LiveWeatherStatusStrip } from '@/components/home-forecast';
import { UpcomingPlan } from '@/components/plans';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { styles, colors } from '@/css/screens/home-screen.styles';

// home-screen

// Hiển thị màn hình thời tiết chính.
export function HomeScreen() {
  const {
    user, now, selectedLocation, liveWeatherQuery, liveResult, isLive, weather, liveRecommendationPresentation, forecast, forecastSource, observedTime, location, context, actions,
    isStale,
  } = useHomeModel();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370;
  const largeTextReflow = fontScale >= 1.35;
  const [showWeatherDetails, setShowWeatherDetails] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [dismissedOnboarding, setDismissedOnboarding] = useState<string>();
  const needsOnboarding =
    user?.user_metadata.lifestyle_onboarding_pending === true && dismissedOnboarding !== user.id;
  const router = useRouter();
  useEffect(() => {
    if (needsOnboarding && user) {
      setAccountOpen(false);
      setDrawerOpen(false);
      setDismissedOnboarding(user.id);
      router.push('/before-start');
    }
  }, [needsOnboarding, router, user]);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" translucent={false} />
      <ScrollView
        refreshControl={
          selectedLocation ? (
            <RefreshControl
              refreshing={liveWeatherQuery.isFetching}
              onRefresh={() => {
                void liveWeatherQuery.refetch();
              }}
            />
          ) : undefined
        }
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        testID="home-screen"
      >
        <View style={styles.frame}>
          <SlideIn>
            <AppMasthead
              onOpenAccount={() => setAccountOpen(true)}
              onOpenMenu={() => setDrawerOpen(true)}
            />
          </SlideIn>
          <ConditionsSummary
            weather={weather}
            location={location}
            period={context.label}
            source={
              isLive
                ? `Cập nhật ${observedTime}${isStale ? ' · Dữ liệu đã cũ' : ''}`
                : 'DỮ LIỆU MINH HỌA'
            }
            onChooseLocation={() => setLocationsOpen(true)}
          />
          {liveRecommendationPresentation === undefined ? (
            <DailyActionPanel
              actions={[]}
              period={context.label}
              onRefresh={selectedLocation ? () => void liveWeatherQuery.refetch() : undefined}
              refreshing={liveWeatherQuery.isFetching}
              notice={
                selectedLocation
                  ? liveWeatherQuery.isError
                    ? 'Chưa tải được chỉ số môi trường. Kiểm tra mạng và cập nhật lại.'
                    : 'Đang chờ chỉ số môi trường để đưa ra khuyến nghị.'
                  : 'Chọn vị trí để nhận khuyến nghị từ dữ liệu môi trường.'
              }
            />
          ) : (
            <DailyActionPanel
              actions={actions}
              period={context.label}
              onRefresh={() => void liveWeatherQuery.refetch()}
              refreshing={liveWeatherQuery.isFetching}
              notice={
                isStale
                  ? 'Dữ liệu đã quá 30 phút. Cập nhật chỉ số để nhận khuyến nghị mới.'
                  : liveRecommendationPresentation.evaluation.status !== 'ready'
                    ? 'Một số chỉ số chưa có. Gợi ý dùng dữ liệu hiện có.'
                    : undefined
              }
            />
          )}
          <ActivityPlanningButton onPress={() => router.navigate('/plans')} />
          <UpcomingPlan now={now} />
          {liveResult ? (
            <UpcomingGuidance
              actions={createUpcomingActions(weather, liveResult.hourlyForecast, liveWeatherQuery.dataUpdatedAt, now)}
            />
          ) : null}
          <SlideIn style={styles.weatherDetailsToggle}>
            <NeoButton
              tone="secondary"
              label={
                showWeatherDetails ? 'Thu gọn chỉ số & dự báo' : 'Xem chỉ số & dự báo làm căn cứ'
              }
              onPress={() => setShowWeatherDetails((value) => !value)}
            />
          </SlideIn>
          <SlideReveal visible={showWeatherDetails} style={styles.evidenceStack}>
            <WeatherHero compact={compact} reflow={largeTextReflow} weather={weather} />
            <EnvironmentMetrics source={isLive ? 'live' : 'fixture'} weather={weather} />
            <ForecastPreview
              forecast={forecast}
              forecastRouteAvailable={liveResult !== undefined}
              source={forecastSource}
            />
          </SlideReveal>
          {showWeatherDetails || !selectedLocation ? <LocationCapabilityStrip compact /> : null}
          {selectedLocation === undefined || !showWeatherDetails ? null : (
            <LiveWeatherStatusStrip query={liveWeatherQuery} />
          )}
          <View style={styles.footer}>
            <Text style={styles.footerSecondary}>
              Gợi ý dựa trên thời tiết khu vực. Kiểm tra điều kiện thực tế trước khi làm.
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
