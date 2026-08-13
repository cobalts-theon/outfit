import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocationCapability } from '@/features/locations/application/location-capability-provider';
import type { LocationCapabilityState } from '@/features/locations/domain/location';
import {
  appThemes,
  homeVisualTokens,
  spacing,
  touchTargets,
  typography,
} from '@/theme/tokens';

interface LocationPresentation {
  readonly label: string;
  readonly title: string;
  readonly detail: string;
  readonly tone: 'neutral' | 'ready' | 'attention';
  readonly loading?: boolean;
  readonly primaryAction?: 'request' | 'retry' | 'settings';
  readonly primaryActionLabel?: string;
  readonly showRefreshAfterSettings?: boolean;
}

function readyDetail(state: Extract<LocationCapabilityState, { status: 'ready' }>) {
  const { latitude, longitude } = state.selectedLocation.coordinates;
  const accuracy = state.position.accuracyMeters;
  const coordinateLabel = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  const accuracyLabel = accuracy === undefined ? '' : ` // ±${Math.round(accuracy)} m`;
  const fallbackLabel =
    state.position.source === 'last_known' ? 'VỊ TRÍ GẦN NHẤT' : 'VỊ TRÍ HIỆN TẠI';

  return `${fallbackLabel} // ${coordinateLabel}${accuracyLabel}. Tọa độ này được chuẩn hóa trước khi tạo weather query.`;
}

function getPresentation(state: LocationCapabilityState): LocationPresentation {
  switch (state.status) {
    case 'idle':
      return {
        label: 'VỊ TRÍ // CHƯA KIỂM TRA',
        title: 'Khả năng vị trí đang khởi tạo',
        detail: 'Home tiếp tục dùng dữ liệu mẫu.',
        tone: 'neutral',
      };
    case 'checking_permission':
      return {
        label: 'VỊ TRÍ // KIỂM TRA QUYỀN',
        title: 'Đang kiểm tra quyền vị trí',
        detail: 'Không có hộp thoại hệ thống nào được mở ở bước này.',
        tone: 'neutral',
        loading: true,
      };
    case 'permission_required':
      return {
        label: 'VỊ TRÍ // CẦN CHO PHÉP',
        title: 'Dùng vị trí để chuẩn bị thời tiết địa phương',
        detail:
          'Ứng dụng chỉ yêu cầu vị trí khi đang sử dụng. Bạn có thể từ chối và tiếp tục dùng Home; tìm địa điểm thủ công sẽ là nguồn thay thế sau.',
        tone: 'attention',
        primaryAction: 'request',
        primaryActionLabel: 'CHO PHÉP VỊ TRÍ',
      };
    case 'requesting_permission':
      return {
        label: 'VỊ TRÍ // ĐANG YÊU CẦU',
        title: 'Đang chờ lựa chọn quyền',
        detail: 'Hãy phản hồi hộp thoại quyền của hệ điều hành.',
        tone: 'neutral',
        loading: true,
      };
    case 'acquiring_position':
      return {
        label: 'VỊ TRÍ // ĐANG ĐỊNH VỊ',
        title: 'Đang lấy tọa độ thiết bị',
        detail: 'Nếu vị trí hiện tại mất quá nhiều thời gian, ứng dụng sẽ thử vị trí gần nhất.',
        tone: 'neutral',
        loading: true,
      };
    case 'ready':
      return {
        label:
          state.position.source === 'last_known'
            ? 'VỊ TRÍ // SẴN SÀNG CÓ DỰ PHÒNG'
            : 'VỊ TRÍ // SẴN SÀNG',
        title:
          state.position.source === 'last_known'
            ? 'Đang dùng vị trí gần nhất của thiết bị'
            : 'Đã nhận vị trí thiết bị',
        detail: readyDetail(state),
        tone: state.position.source === 'last_known' ? 'attention' : 'ready',
        primaryAction: 'retry',
        primaryActionLabel: 'CẬP NHẬT',
      };
    case 'permission_denied':
      return {
        label: 'VỊ TRÍ // BỊ TỪ CHỐI',
        title: 'Home vẫn hoạt động khi không có GPS',
        detail: state.canAskAgain
          ? 'Quyền vị trí chưa được cấp. Bạn có thể thử lại; tìm địa điểm thủ công sẽ được bổ sung sau.'
          : 'Quyền vị trí đã bị chặn. Bạn có thể thay đổi trong cài đặt; tìm địa điểm thủ công sẽ được bổ sung sau.',
        tone: 'attention',
        primaryAction: state.canAskAgain ? 'request' : 'settings',
        primaryActionLabel: state.canAskAgain ? 'THỬ LẠI' : 'MỞ CÀI ĐẶT',
        showRefreshAfterSettings: !state.canAskAgain,
      };
    case 'permission_unavailable':
      return {
        label: 'VỊ TRÍ // QUYỀN KHÔNG KHẢ DỤNG',
        title: 'Không thể kiểm tra quyền vị trí',
        detail: `${state.message} Home vẫn dùng dữ liệu mẫu; tìm địa điểm thủ công sẽ được bổ sung sau.`,
        tone: 'attention',
        primaryAction: 'retry',
        primaryActionLabel: 'KIỂM TRA LẠI',
      };
    case 'services_unavailable':
      return {
        label: 'VỊ TRÍ // DỊCH VỤ ĐANG TẮT',
        title: 'Dịch vụ vị trí không khả dụng',
        detail:
          'Bật dịch vụ vị trí của thiết bị rồi thử lại. Home không bị khóa và vẫn dùng dữ liệu mẫu.',
        tone: 'attention',
        primaryAction: 'retry',
        primaryActionLabel: 'THỬ LẠI',
      };
    case 'acquisition_error':
      return {
        label: `VỊ TRÍ // LỖI ${state.code.toUpperCase()}`,
        title: 'Chưa lấy được tọa độ thiết bị',
        detail: `${state.message} Home vẫn dùng dữ liệu mẫu.`,
        tone: 'attention',
        primaryAction: 'retry',
        primaryActionLabel: 'THỬ LẠI',
      };
  }
}

interface LocationActionProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly secondary?: boolean;
}

function LocationAction({ label, onPress, secondary = false }: LocationActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: homeVisualTokens.grid }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        secondary && styles.actionSecondary,
        pressed && styles.actionPressed,
      ]}
    >
      <Text style={[styles.actionText, secondary && styles.actionTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

export function LocationCapabilityStrip() {
  const { state, requestPermission, retry, refreshPermission } = useLocationCapability();
  const presentation = getPresentation(state);

  if (state.status === 'ready') {
    const { latitude, longitude } = state.selectedLocation.coordinates;
    const accuracy = state.position.accuracyMeters;
    const sourceLabel =
      state.position.source === 'last_known' ? 'VỊ TRÍ GẦN NHẤT' : 'VỊ TRÍ HIỆN TẠI';
    const coordinateLabel = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    const detail =
      accuracy === undefined
        ? coordinateLabel
        : `${coordinateLabel} · ±${Math.round(accuracy)} m`;

    return (
      <View
        accessibilityLabel={`${sourceLabel}. ${detail}`}
        accessibilityLiveRegion="polite"
        style={styles.readyContainer}
        testID="location-capability-ready"
      >
        <View style={styles.readyCopy}>
          <View style={styles.labelRow}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                styles.signal,
                {
                  backgroundColor:
                    state.position.source === 'last_known'
                      ? homeVisualTokens.warning
                      : homeVisualTokens.calm,
                },
              ]}
            />
            <Text style={styles.label}>{sourceLabel}</Text>
          </View>
          <Text numberOfLines={1} style={styles.readyDetail}>
            {detail}
          </Text>
        </View>
        <LocationAction label="CẬP NHẬT" onPress={() => void retry()} secondary />
      </View>
    );
  }

  const runPrimaryAction = () => {
    switch (presentation.primaryAction) {
      case 'request':
        void requestPermission();
        return;
      case 'retry':
        void retry();
        return;
      case 'settings':
        void Linking.openSettings().catch(() => undefined);
        return;
      case undefined:
        return;
    }
  };

  const signalColor =
    presentation.tone === 'ready'
      ? homeVisualTokens.calm
      : presentation.tone === 'attention'
        ? homeVisualTokens.warning
        : homeVisualTokens.technicalMuted;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={styles.container}
      testID={`location-capability-${state.status}`}
    >
      <View style={styles.labelRow}>
        {presentation.loading ? (
          <ActivityIndicator
            accessibilityLabel="Đang xử lý vị trí"
            color={homeVisualTokens.technical}
            size="small"
          />
        ) : (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.signal, { backgroundColor: signalColor }]}
          />
        )}
        <Text style={styles.label}>{presentation.label}</Text>
      </View>

      <Text accessibilityRole="header" style={styles.title}>
        {presentation.title}
      </Text>
      <Text style={styles.detail}>{presentation.detail}</Text>

      {presentation.primaryAction === undefined ? null : (
        <View style={styles.actions}>
          <LocationAction label={presentation.primaryActionLabel ?? 'THỬ LẠI'} onPress={runPrimaryAction} />
          {presentation.showRefreshAfterSettings ? (
            <LocationAction
              label="KIỂM TRA LẠI"
              onPress={() => void refreshPermission()}
              secondary
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

const colors = appThemes.dark.colors;
const minimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.fieldDeep,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  readyContainer: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.fieldDeep,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  readyCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  readyDetail: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
    fontVariant: ['tabular-nums'],
  },
  labelRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  signal: {
    width: 6,
    height: 6,
  },
  label: {
    flex: 1,
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.7,
  },
  title: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 14,
    lineHeight: 20,
  },
  detail: {
    maxWidth: 620,
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  action: {
    minHeight: minimumTouchTarget,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: homeVisualTokens.technical,
    borderRadius: 2,
    backgroundColor: homeVisualTokens.field,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actionSecondary: {
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  actionPressed: {
    backgroundColor: homeVisualTokens.fieldRaised,
  },
  actionText: {
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  actionTextSecondary: {
    color: colors.textMuted,
  },
});
