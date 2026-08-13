import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DailyForecastRow } from '@/features/forecast/components/daily-forecast-row';
import { DetailedHourlyForecast } from '@/features/forecast/components/detailed-hourly-forecast';
import { ForecastDetails } from '@/features/forecast/components/forecast-details';
import type { DailyForecastItem } from '@/features/forecast/model/forecast-presentation';
import {
  createDailyForecastItems,
  createDetailedHourlyItems,
  createForecastDetails,
  getForecastConditionLabel,
} from '@/features/forecast/model/forecast-presentation';
import { useLocationCapability } from '@/features/locations/application/location-capability-provider';
import { LocationCapabilityStrip } from '@/features/locations/components/location-capability-strip';
import {
  LiveWeatherError,
  type LiveWeatherDataIssue,
} from '@/features/weather/application/live-current-weather';
import { useLiveCurrentWeather } from '@/features/weather/application/live-current-weather-query';
import {
  appThemes,
  homeVisualTokens,
  layout,
  spacing,
  touchTargets,
  typography,
} from '@/theme/tokens';

function formatObservedTime(timestamp: string, timeZone: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(timestamp));
}

function StatusState({
  title,
  detail,
  loading = false,
  onRetry,
}: {
  readonly title: string;
  readonly detail: string;
  readonly loading?: boolean;
  readonly onRetry?: () => void;
}) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.state} testID="forecast-state">
      <View style={styles.stateSignalRow}>
        {loading ? (
          <ActivityIndicator color={homeVisualTokens.technical} size="small" />
        ) : (
          <View style={styles.stateSignal} />
        )}
        <Text style={styles.stateLabel}>DỰ BÁO // TRẠNG THÁI</Text>
      </View>
      <Text accessibilityRole="header" style={styles.stateTitle}>
        {title}
      </Text>
      <Text style={styles.stateDetail}>{detail}</Text>
      {onRetry === undefined ? null : (
        <Pressable
          accessibilityRole="button"
          android_ripple={{ color: homeVisualTokens.grid }}
          onPress={onRetry}
          style={({ pressed }) => [styles.stateAction, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionText}>THỬ LẠI</Text>
        </Pressable>
      )}
    </View>
  );
}

function PartialForecastState({ issues }: { readonly issues: readonly LiveWeatherDataIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <View style={styles.partialState} testID="forecast-partial-state">
      <Text style={styles.partialLabel}>DỮ LIỆU MỘT PHẦN</Text>
      <Text style={styles.partialCopy}>{issues.map((issue) => issue.message).join(' ')}</Text>
    </View>
  );
}

function DailyEmptyState() {
  return (
    <View style={styles.dailyEmpty} testID="daily-forecast-unavailable">
      <Text style={styles.dailyEmptyMark}>-- / --</Text>
      <Text style={styles.dailyEmptyCopy}>
        Chuỗi dự báo theo ngày chưa khả dụng. Dữ liệu hiện tại và theo giờ vẫn được giữ nếu hợp lệ.
      </Text>
    </View>
  );
}

export function ForecastScreen() {
  const { state: locationState } = useLocationCapability();
  const selectedLocation =
    locationState.status === 'ready' ? locationState.selectedLocation : undefined;
  const query = useLiveCurrentWeather(selectedLocation);
  const result = query.data;

  const renderDailyItem = useCallback(
    ({ item }: { readonly item: DailyForecastItem }) => <DailyForecastRow item={item} />,
    [],
  );

  if (selectedLocation === undefined) {
    return (
      <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.safeArea}>
        <View style={styles.frame}>
          <LocationCapabilityStrip />
          <StatusState
            detail="Bật dịch vụ vị trí và thử lại từ Home. Màn hình dự báo không dùng dữ liệu mẫu."
            title="Chưa có vị trí cho dự báo trực tiếp"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (result === undefined) {
    const paused = query.fetchStatus === 'paused';
    const detail =
      query.error instanceof LiveWeatherError
        ? query.error.message
        : paused
          ? 'Kết nối mạng chưa sẵn sàng. Yêu cầu sẽ tiếp tục khi kết nối trở lại.'
          : 'Đang lấy dự báo theo tọa độ đã chọn.';
    return (
      <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.safeArea}>
        <View style={styles.frame}>
          <StatusState
            detail={detail}
            loading={query.isPending && !paused}
            onRetry={query.isError ? () => void query.refetch() : undefined}
            title={query.isError ? 'Chưa tải được dự báo trực tiếp' : 'Đang tải dự báo'}
          />
        </View>
      </SafeAreaView>
    );
  }

  const hourlyItems =
    result.hourlyForecast === undefined
      ? []
      : createDetailedHourlyItems(result.hourlyForecast, result.weather.observedAt);
  const dailyItems =
    result.dailyForecast === undefined ? [] : createDailyForecastItems(result.dailyForecast);
  const details = createForecastDetails(result.weather, result.dailyForecast);
  const forecastIssues = result.issues.filter(
    (issue) => issue.source === 'hourly_forecast' || issue.source === 'daily_forecast',
  );
  const currentPrecipitation = result.weather.precipitation;
  const coordinateLabel = result.weather.location.coordinates;
  const observedTime = formatObservedTime(
    result.weather.observedAt,
    result.weather.location.timeZone,
  );

  const header = (
    <View>
      <View style={styles.briefing} testID="forecast-briefing">
        <View style={styles.briefingTopRow}>
          <View style={styles.briefingLocation}>
            <Text accessibilityRole="header" style={styles.locationName}>
              {result.weather.location.name}
            </Text>
            <Text style={styles.coordinates}>
              {coordinateLabel === undefined
                ? result.weather.location.timeZone
                : `${coordinateLabel.latitude.toFixed(4)}, ${coordinateLabel.longitude.toFixed(4)} · ${result.weather.location.timeZone}`}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Làm mới dự báo"
            accessibilityRole="button"
            android_ripple={{ color: homeVisualTokens.grid }}
            disabled={query.isFetching}
            onPress={() => void query.refetch()}
            style={({ pressed }) => [
              styles.refreshAction,
              pressed && styles.actionPressed,
              query.isFetching && styles.refreshActionDisabled,
            ]}
          >
            <Text style={styles.actionText}>{query.isFetching ? 'ĐANG TẢI' : 'LÀM MỚI'}</Text>
          </Pressable>
        </View>

        <View style={styles.currentReading}>
          <Text
            accessibilityLabel={`${Math.round(result.weather.temperature.valueCelsius)} độ C`}
            style={styles.currentTemperature}
          >
            {Math.round(result.weather.temperature.valueCelsius)}°
          </Text>
          <View style={styles.currentNarrative}>
            <Text style={styles.currentCondition}>
              {getForecastConditionLabel(result.weather.condition)}
            </Text>
            <Text style={styles.currentMeta}>
              {`Quan sát ${observedTime} · cảm nhận ${Math.round(
                result.weather.temperature.feelsLikeCelsius,
              )}°C`}
            </Text>
            <Text style={styles.currentMeta}>
              {currentPrecipitation === undefined
                ? 'Mưa hiện tại —'
                : `Mưa ${
                    currentPrecipitation.probability === undefined
                      ? '—'
                      : `${Math.round(currentPrecipitation.probability * 100)}%`
                  } · ${
                    currentPrecipitation.amountMillimeters === undefined
                      ? 'lượng —'
                      : `${currentPrecipitation.amountMillimeters.toFixed(1)} mm`
                  }`}
            </Text>
          </View>
        </View>
      </View>

      <PartialForecastState issues={forecastIssues} />
      <DetailedHourlyForecast
        items={hourlyItems}
        unavailable={result.hourlyForecast === undefined}
      />
      <View style={styles.dailyHeading}>
        <View style={styles.dailyHeadingRow}>
          <Text accessibilityRole="header" style={styles.dailyTitle}>
            THEO NGÀY
          </Text>
          <Text style={styles.dailyStatus}>
            {result.dailyForecast === undefined ? 'CHƯA KHẢ DỤNG' : '7 NGÀY'}
          </Text>
        </View>
        <Text style={styles.dailySummary}>
          Khoảng nhiệt độ và lượng mưa tối đa theo từng ngày địa phương.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.safeArea}>
      <FlatList
        ListEmptyComponent={DailyEmptyState}
        ListFooterComponent={<ForecastDetails items={details} />}
        ListHeaderComponent={header}
        contentContainerStyle={styles.content}
        data={dailyItems}
        initialNumToRender={7}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        maxToRenderPerBatch={7}
        renderItem={renderDailyItem}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        testID="forecast-screen"
        windowSize={5}
      />
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
  frame: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingBottom: spacing.xl,
  },
  state: {
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.unavailableSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  stateSignalRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stateSignal: {
    width: 6,
    height: 6,
    backgroundColor: homeVisualTokens.unavailable,
  },
  stateLabel: {
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.7,
  },
  stateTitle: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 16,
    lineHeight: 23,
  },
  stateDetail: {
    maxWidth: 620,
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  stateAction: {
    minHeight: minimumTouchTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: homeVisualTokens.technical,
    borderRadius: 2,
    paddingHorizontal: spacing.md,
  },
  partialState: {
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.unavailableSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  partialLabel: {
    color: homeVisualTokens.unavailable,
    fontFamily: typography.identitySemibold,
    fontSize: 9,
    lineHeight: 15,
    letterSpacing: 0.7,
  },
  partialCopy: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  briefing: {
    gap: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.field,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  briefingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  briefingLocation: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  locationName: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 18,
    lineHeight: 26,
  },
  coordinates: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 9,
    lineHeight: 15,
  },
  refreshAction: {
    minHeight: minimumTouchTarget,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingHorizontal: spacing.sm,
  },
  refreshActionDisabled: {
    opacity: 0.55,
  },
  actionPressed: {
    backgroundColor: homeVisualTokens.fieldRaised,
  },
  actionText: {
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  currentReading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  currentTemperature: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 54,
    lineHeight: 62,
    fontVariant: ['tabular-nums'],
  },
  currentNarrative: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  currentCondition: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 16,
    lineHeight: 23,
  },
  currentMeta: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  dailyHeading: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  dailyHeadingRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dailyTitle: {
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1,
  },
  dailyStatus: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 9,
    lineHeight: 15,
    letterSpacing: 0.7,
  },
  dailySummary: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  dailyEmpty: {
    minHeight: 128,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  dailyEmptyMark: {
    color: homeVisualTokens.unavailable,
    fontFamily: typography.identitySemibold,
    fontSize: 20,
  },
  dailyEmptyCopy: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
});
