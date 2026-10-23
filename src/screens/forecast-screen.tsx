/**
 * Màn hình dự báo chi tiết: lấy dữ liệu cho vị trí đang chọn rồi ghép các khối dự báo.
 */
import { SlideReveal, SlideIn, NeoButton } from '@/components/controls';
import { UpcomingGuidance } from '@/components/home-advice';
import { createUpcomingActions } from '@/utils/recommendations';
import { homeVisualTokens } from '@/theme';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyForecastRow, DetailedHourlyForecast, ForecastDetails } from '@/components/forecast';
import { type DailyForecastItem, createDailyForecastItems, createDetailedHourlyItems, createForecastDetails, getForecastConditionLabel } from '@/utils/forecast';
import { useLocationCapability } from '@/context/location';
import { LocationCapabilityStrip } from '@/components/locations';
import { LiveWeatherError, type LiveWeatherDataIssue, useLiveCurrentWeather } from '@/services/live-weather';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { styles } from '@/css/screens/forecast-screen.styles';
import { forecastScreenLayoutStyles } from '@/css/screens/forecast-screen.styles';

// forecast-screen

// Định dạng giờ số liệu theo địa điểm.
function formatObservedTime(timestamp: string, timeZone: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(timestamp));
}

// Hiển thị trạng thái tải hoặc lỗi dự báo.
function StatusState({ title, detail, loading = false, onRetry }: {
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

// Thông báo dự báo còn thiếu dữ liệu.
function PartialForecastState({ issues }: { readonly issues: readonly LiveWeatherDataIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <View style={styles.partialState} testID="forecast-partial-state">
      <Text style={styles.partialLabel}>DỮ LIỆU MỘT PHẦN</Text>
      <Text style={styles.partialCopy}>{issues.map((issue) => issue.message).join(' ')}</Text>
    </View>
  );
}

// Hiển thị khi chưa có dự báo ngày.
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

// Hiển thị màn hình dự báo chi tiết.
export function ForecastScreen() {
  const [mode, setMode] = useState<'hourly' | 'daily'>('hourly');
  const [showDetails, setShowDetails] = useState(false);
  const { state: locationState } = useLocationCapability();
  const selectedLocation =
    locationState.status === 'ready' ? locationState.selectedLocation : undefined;
  const query = useLiveCurrentWeather(selectedLocation);
  const result = query.data;

  // Hiển thị một dòng trong danh sách dự báo ngày.
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
  const forecastIssues = result.issues.filter((issue) => issue.source === 'hourly_forecast' || issue.source === 'daily_forecast');
  const observedTime = formatObservedTime(result.weather.observedAt, result.weather.location.timeZone);

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
            style={({ pressed }) => [styles.refreshAction, pressed && styles.actionPressed, query.isFetching && styles.refreshActionDisabled]}
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
              actions={createUpcomingActions(result.weather, result.hourlyForecast, query.dataUpdatedAt)}
            />
            <NeoButton
              label={showDetails ? 'Thu gọn chi tiết' : 'Xem thêm độ ẩm, gió & mặt trời'}
              onPress={() => setShowDetails((value) => !value)}
              tone="secondary"
            />
            <SlideReveal visible={showDetails} style={forecastScreenLayoutStyles.forecastContent}>
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
