import type { UseQueryResult } from '@tanstack/react-query';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  LiveWeatherError,
  type LiveCurrentWeatherResult,
} from '@/features/weather/application/live-current-weather';
import {
  appThemes,
  homeVisualTokens,
  neoShadows,
  spacing,
  touchTargets,
  typography,
} from '@/theme/tokens';

interface LiveWeatherStatusStripProps {
  readonly query: UseQueryResult<LiveCurrentWeatherResult, unknown>;
}

function safeErrorMessage(error: unknown) {
  return error instanceof LiveWeatherError
    ? error.message
    : 'Không thể tải dữ liệu thời tiết trực tiếp.';
}

export function LiveWeatherStatusStrip({ query }: LiveWeatherStatusStripProps) {
  const hasData = query.data !== undefined;
  const pausedWithoutData = !hasData && query.fetchStatus === 'paused';
  const failedWithoutData = !hasData && query.isError;
  const partial = query.data?.status === 'partial';
  const backgroundRefreshFailed = hasData && query.isError;
  const stale = hasData && query.isStale;

  if (
    hasData &&
    !partial &&
    !backgroundRefreshFailed &&
    !stale &&
    !query.isFetching
  ) {
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
    label = query.isFetching
      ? 'THỜI TIẾT // ĐANG LÀM MỚI'
      : 'THỜI TIẾT // CÓ THỂ ĐÃ CŨ';
    title = query.isFetching
      ? 'Đang làm mới bản quan sát gần nhất'
      : 'Bản quan sát cần được làm mới';
    detail = 'Dữ liệu cache vẫn được giữ và thời gian quan sát không bị che giấu.';
    loading = query.isFetching;
    canRetry = !query.isFetching;
  }

  return (
    <View accessibilityLiveRegion="polite" style={styles.container} testID="live-weather-status">
      <View style={styles.labelRow}>
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
            style={styles.signal}
          />
        )}
        <Text style={styles.label}>{label.replaceAll(' // ', ' · ')}</Text>
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.detail}>{detail}</Text>
      {canRetry ? (
        <Pressable
          accessibilityRole="button"
          android_ripple={{ color: homeVisualTokens.grid }}
          onPress={() => void query.refetch()}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionText}>THỬ LẠI</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const colors = appThemes.light.colors;
const minimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.warningSurface,
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  labelRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  signal: {
    width: 9,
    height: 9,
    borderWidth: 2,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.warning,
  },
  label: {
    flex: 1,
    color: homeVisualTokens.ink,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
  },
  title: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 21,
    lineHeight: 24,
  },
  detail: {
    maxWidth: 620,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  action: {
    minHeight: minimumTouchTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: homeVisualTokens.cobalt,
    boxShadow: neoShadows.control,
  },
  actionPressed: {
    boxShadow: neoShadows.controlPressed,
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },
  actionText: {
    color: colors.surface,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.6,
  },
});
