/**
 * Hiển thị dự báo tóm tắt và tình trạng nguồn dữ liệu trên Home.
 * Phân biệt dữ liệu trực tiếp, đang tải, thiếu dữ liệu và lỗi.
 */
import { homeVisualTokens } from '@/theme';
import { Pressable, ScrollView, Text, useWindowDimensions, View, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { type HomeForecastPreview, getConditionLabel } from '@/hooks/home';
import { RuledSection, SystemLabel, WeatherConditionIcon } from '@/components/home-weather';
import type { UseQueryResult } from '@tanstack/react-query';
import { LiveWeatherError, type LiveCurrentWeatherResult } from '@/services/live-weather';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { forecastPreviewStyles, liveWeatherStatusStripStyles } from '@/css/components/home-forecast.styles';

// forecast-preview

interface ForecastPreviewProps {
  readonly forecast: HomeForecastPreview;
  readonly forecastRouteAvailable: boolean;
  readonly source: 'live' | 'fixture' | 'unavailable';
}

const sourceLabels = { live: 'DỮ LIỆU LIVE', fixture: 'DỮ LIỆU MẪU', unavailable: 'CHƯA KHẢ DỤNG' } as const;

// Hiển thị dự báo tóm tắt trên Home.
export function ForecastPreview({ forecast, forecastRouteAvailable, source }: ForecastPreviewProps) {
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.35;

  return (
    <RuledSection accessibilityLabel="Diễn biến tiếp theo" testID="forecast-preview">
      <SystemLabel index="02" label="TIẾP THEO" value={sourceLabels[source]} />
      <Text style={forecastPreviewStyles.summary}>{forecast.summary}</Text>

      {forecast.items.length === 0 ? (
        <View accessibilityLabel="Không có chuỗi dự báo" style={forecastPreviewStyles.emptyState}>
          <Text style={forecastPreviewStyles.emptyMark}>CHƯA CÓ</Text>
          <Text style={forecastPreviewStyles.emptyCopy}>Chuỗi theo giờ chưa khả dụng.</Text>
        </View>
      ) : (
        <ScrollView
          accessibilityLabel={
            source === 'live' ? 'Chuỗi dự báo theo giờ trực tiếp' : 'Chuỗi dự báo theo giờ mẫu'
          }
          contentContainerStyle={forecastPreviewStyles.sequence}
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
                style={[forecastPreviewStyles.item, largeText && forecastPreviewStyles.itemLargeText, item.isCurrent && forecastPreviewStyles.itemCurrent]}
              >
                <Text
                  style={[forecastPreviewStyles.time, item.isCurrent && forecastPreviewStyles.timeCurrent]}
                >
                  {item.timeLabel}
                </Text>
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={forecastPreviewStyles.iconWrap}
                >
                  <WeatherConditionIcon condition={item.condition} isDay={item.isDay} size={60} />
                </View>
                <Text style={forecastPreviewStyles.temperature}>
                  {Math.round(item.temperatureCelsius)}°
                </Text>
                <Text style={forecastPreviewStyles.condition}>{condition}</Text>
                <Text style={forecastPreviewStyles.precipitation}>{precipitation}</Text>
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
            style={forecastPreviewStyles.forecastLinkHit}
          >
            {({ pressed }) => (
              <View
                style={[forecastPreviewStyles.forecastLink, pressed && forecastPreviewStyles.forecastLinkPressed]}
              >
                <Text style={forecastPreviewStyles.forecastLinkText}>XEM DỰ BÁO ĐẦY ĐỦ</Text>
              </View>
            )}
          </Pressable>
        </Link>
      ) : null}
    </RuledSection>
  );
}

// live-weather-status-strip

interface LiveWeatherStatusStripProps {
  readonly query: UseQueryResult<LiveCurrentWeatherResult, unknown>;
}

// Chọn thông báo lỗi thời tiết phù hợp.
function safeErrorMessage(error: unknown) {
  return error instanceof LiveWeatherError
    ? error.message
    : 'Không thể tải dữ liệu thời tiết trực tiếp.';
}

// Hiển thị trạng thái dữ liệu thời tiết.
export function LiveWeatherStatusStrip({ query }: LiveWeatherStatusStripProps) {
  const hasData = query.data !== undefined;
  const pausedWithoutData = !hasData && query.fetchStatus === 'paused';
  const failedWithoutData = !hasData && query.isError;
  const partial = query.data?.status === 'partial';
  const backgroundRefreshFailed = hasData && query.isError;
  const stale = hasData && query.isStale;

  if (hasData && !partial && !backgroundRefreshFailed && !stale && !query.isFetching) {
    return null;
  }

  let label = 'THỜI TIẾT // ĐANG TẢI';
  let title = 'Đang tải điều kiện thời tiết trực tiếp';
  let detail = 'Dữ liệu mẫu vẫn hiển thị cho đến khi có bản quan sát hợp lệ.';
  let loading = query.isPending && !pausedWithoutData;
  let canRetry = false;

  if (pausedWithoutData) {
    label = 'THỜI TIẾT // CHỜ KẾT NỐI';
    title = 'Chưa có kết nối để tải thời tiết';
    detail = 'Khi mạng trở lại, query sẽ tiếp tục bằng hạ tầng cache hiện có.';
  } else if (failedWithoutData) {
    label = 'THỜI TIẾT // LỖI';
    title = 'Chưa tải được thời tiết trực tiếp';
    detail = safeErrorMessage(query.error);
    loading = false;
    canRetry = true;
  } else if (partial) {
    label = 'THỜI TIẾT // DỮ LIỆU MỘT PHẦN';
    title = 'Thời tiết đã cập nhật, một phần dữ liệu chưa đầy đủ';
    detail = query.data?.issues.map((issue) => issue.message).join(' ') ?? '';
    loading = query.isFetching;
    canRetry = !query.isFetching;
  } else if (backgroundRefreshFailed) {
    label = 'THỜI TIẾT // LẦN LÀM MỚI LỖI';
    title = 'Đang giữ bản quan sát gần nhất';
    detail = `${safeErrorMessage(query.error)} Thời gian quan sát vẫn hiển thị ở đầu màn hình.`;
    loading = false;
    canRetry = true;
  } else if (hasData && query.isFetching) {
    label = 'THỜI TIẾT // ĐANG LÀM MỚI';
    title = 'Đang làm mới bản quan sát hiện tại';
    detail = 'Bản quan sát gần nhất vẫn được giữ trong khi yêu cầu mới đang chạy.';
    loading = true;
  } else if (stale) {
    label = query.isFetching ? 'THỜI TIẾT // ĐANG LÀM MỚI' : 'THỜI TIẾT // CÓ THỂ ĐÃ CŨ';
    title = query.isFetching
      ? 'Đang làm mới bản quan sát gần nhất'
      : 'Bản quan sát cần được làm mới';
    detail = 'Dữ liệu cache vẫn được giữ và thời gian quan sát không bị che giấu.';
    loading = query.isFetching;
    canRetry = !query.isFetching;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      style={liveWeatherStatusStripStyles.container}
      testID="live-weather-status"
    >
      <View style={liveWeatherStatusStripStyles.labelRow}>
        {loading ? (
          <ActivityIndicator
            accessibilityLabel="Đang tải thời tiết"
            color={homeVisualTokens.technical}
            size="small"
          />
        ) : (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={liveWeatherStatusStripStyles.signal}
          />
        )}
        <Text style={liveWeatherStatusStripStyles.label}>{label.replaceAll(' // ', ' · ')}</Text>
      </View>
      <Text accessibilityRole="header" style={liveWeatherStatusStripStyles.title}>
        {title}
      </Text>
      <Text style={liveWeatherStatusStripStyles.detail}>{detail}</Text>
      {canRetry ? (
        <Pressable
          accessibilityRole="button"
          android_ripple={{ color: homeVisualTokens.grid }}
          onPress={() => void query.refetch()}
          style={({ pressed }) => [liveWeatherStatusStripStyles.action, pressed && liveWeatherStatusStripStyles.actionPressed]}
        >
          <Text style={liveWeatherStatusStripStyles.actionText}>THỬ LẠI</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
