import { SlideReveal, SlideIn, NeoButton } from '@/components/controls';
import { UpcomingGuidance } from '@/components/home-advice';
import { createUpcomingActions } from '@/utils/recommendations';
import {
  radii,
  appThemes,
  homeVisualTokens,
  layout,
  neoShadows,
  spacing,
  touchTargets,
  typography,
} from '@/theme';
import { useCallback, useState } from 'react';
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
import { DailyForecastRow, DetailedHourlyForecast, ForecastDetails } from '@/components/forecast';
import {
  type DailyForecastItem,
  createDailyForecastItems,
  createDetailedHourlyItems,
  createForecastDetails,
  getForecastConditionLabel,
} from '@/utils/forecast';
import { useLocationCapability } from '@/context/location';
import { LocationCapabilityStrip } from '@/components/locations';
import {
  LiveWeatherError,
  type LiveWeatherDataIssue,
  useLiveCurrentWeather,
} from '@/services/live-weather';

// forecast-screen

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
        <Text style={styles.stateLabel}>DỰ BÁO · TRẠNG THÁI</Text>
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
  const [mode, setMode] = useState<'hourly' | 'daily'>('hourly');
  const [showDetails, setShowDetails] = useState(false);
  const { state: locationState } = useLocationCapability();
  const selectedLocation =
    locationState.status === 'ready' ? locationState.selectedLocation : undefined;
  const query = useLiveCurrentWeather(selectedLocation);
  const result = query.data;

  const renderDailyItem = useCallback(
    ({ item }: { readonly item: DailyForecastItem }) => (
      <SlideIn>
        <DailyForecastRow item={item} />
      </SlideIn>
    ),
    [],
  );

  if (selectedLocation === undefined) {
    return (
      <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.safeArea}>
        <View style={styles.frame}>
          <LocationCapabilityStrip />
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
          : 'Đang lấy dự báo cho địa điểm đã chọn.';
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
              {selectedLocation.label ?? result.weather.location.name}
            </Text>
            <Text style={styles.coordinates}>
              {`${selectedLocation.source === 'device' ? 'VỊ TRÍ HIỆN TẠI' : 'VỊ TRÍ ĐÃ CHỌN'} · QUAN SÁT ${observedTime}`}
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

        <Text style={styles.currentMeta}>
          {`${Math.round(result.weather.temperature.valueCelsius)}° · ${getForecastConditionLabel(result.weather.condition)} · Cảm nhận ${Math.round(result.weather.temperature.feelsLikeCelsius)}°`}
        </Text>
      </View>
      <View accessibilityRole="tablist" style={styles.tabs}>
        {(['hourly', 'daily'] as const).map((value) => (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === value }}
            onPress={() => setMode(value)}
            style={[styles.tab, mode === value && styles.tabSelected]}
          >
            <Text style={styles.tabText}>{value === 'hourly' ? 'THEO GIỜ' : '7 NGÀY'}</Text>
          </Pressable>
        ))}
      </View>
      <PartialForecastState issues={forecastIssues} />
      {mode === 'hourly' ? (
        <SlideIn replayKey={mode}>
          <DetailedHourlyForecast
            items={hourlyItems}
            unavailable={result.hourlyForecast === undefined}
          />
        </SlideIn>
      ) : null}
      {mode === 'daily' ? (
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
      ) : null}
    </View>
  );

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.safeArea}>
      <FlatList
        ListEmptyComponent={mode === 'daily' ? DailyEmptyState : null}
        ListFooterComponent={
          <View style={styles.detailsToggle}>
            <UpcomingGuidance
              actions={createUpcomingActions(
                result.weather,
                result.hourlyForecast,
                query.dataUpdatedAt,
              )}
            />
            <NeoButton
              label={showDetails ? 'Thu gọn chi tiết' : 'Xem thêm độ ẩm, gió & mặt trời'}
              onPress={() => setShowDetails((value) => !value)}
              tone="secondary"
            />
            <SlideReveal visible={showDetails} style={{ paddingTop: spacing.md }}>
              <ForecastDetails items={details} />
            </SlideReveal>
          </View>
        }
        ListHeaderComponent={header}
        contentContainerStyle={styles.content}
        data={mode === 'daily' ? dailyItems : []}
        refreshing={query.isFetching}
        onRefresh={() => {
          void query.refetch();
        }}
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

const colors = appThemes.light.colors;

const minimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing.sm, margin: spacing.sm },
  tab: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: neoShadows.control,
  },
  tabSelected: { backgroundColor: homeVisualTokens.infoSurface },
  tabText: { fontFamily: typography.heading, fontSize: 15, lineHeight: 21, color: colors.text },
  detailsToggle: { padding: spacing.sm, gap: spacing.md },
  safeArea: { flex: 1, backgroundColor: colors.background },
  frame: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' },
  list: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingBottom: spacing.xl,
  },
  state: {
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.unavailableSurface,
    margin: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    boxShadow: neoShadows.panel,
  },
  stateSignalRow: { minHeight: 20, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stateSignal: { width: 6, height: 6, backgroundColor: homeVisualTokens.unavailable },
  stateLabel: {
    color: homeVisualTokens.ink,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
  },
  stateTitle: { color: colors.text, fontFamily: typography.heading, fontSize: 20, lineHeight: 26 },
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
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    paddingHorizontal: spacing.md,
    backgroundColor: homeVisualTokens.infoSurface,
    boxShadow: neoShadows.control,
  },
  partialState: {
    gap: spacing.xs,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.unavailableSurface,
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  partialLabel: {
    color: homeVisualTokens.unavailable,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
  },
  partialCopy: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  briefing: {
    gap: spacing.md,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    margin: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    boxShadow: neoShadows.panel,
  },
  briefingTopRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  briefingLocation: { flex: 1, minWidth: 0, gap: spacing.xxs },
  locationName: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 22,
    lineHeight: 28,
    textTransform: 'uppercase',
  },
  coordinates: {
    color: colors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
  },
  refreshAction: {
    minHeight: minimumTouchTarget,
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    paddingHorizontal: spacing.sm,
    backgroundColor: homeVisualTokens.infoSurface,
    boxShadow: neoShadows.control,
  },
  refreshActionDisabled: { opacity: 0.55 },
  actionPressed: {
    boxShadow: neoShadows.controlPressed,
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },
  actionText: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.5,
  },
  currentReading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.lg },
  currentIcon: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    backgroundColor: colors.surface,
    boxShadow: neoShadows.control,
  },
  currentTemperature: {
    color: colors.text,
    fontFamily: typography.temperature,
    fontSize: 72,
    lineHeight: 74,
    fontVariant: ['tabular-nums'],
  },
  currentNarrative: { flex: 1, minWidth: 0, gap: spacing.xxs },
  currentCondition: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 20,
    lineHeight: 26,
    textTransform: 'uppercase',
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
    color: homeVisualTokens.ink,
    fontFamily: typography.display,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 1,
  },
  dailyStatus: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
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
