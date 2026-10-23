/**
 * Thanh trạng thái quyền vị trí/GPS; giải thích trạng thái và cung cấp thao tác khôi phục.
 */
import { Text, View, ActivityIndicator, Linking, Pressable } from 'react-native';
import { homeVisualTokens } from '@/theme';
import { useLocationCapability } from '@/context/location';
import type { LocationAcquisitionErrorCode, LocationCapabilityState } from '@/utils/validation';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { styles } from '@/css/components/location-capability.styles';
import { positionSignalStyle, signalColorStyle, locationCapabilityLayoutStyles } from '@/css/components/location-capability.styles';

// location-capability-strip

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

interface LocationCapabilityStripProps {
  readonly compact?: boolean;
}

// Mô tả vị trí đang được sử dụng.
function readyDetail(state: Extract<LocationCapabilityState, { status: 'ready' }>) {
  if (state.position === undefined) {
    const placeName = state.selectedLocation.label ?? 'Địa điểm đã chọn';
    return `ĐỊA ĐIỂM ĐÃ CHỌN // ${placeName}. Vị trí này được tìm từ xa và không thay đổi GPS thiết bị.`;
  }

  const accuracy = state.position.accuracyMeters;
  const placeName = state.selectedLocation.label ?? 'Địa điểm hiện tại';
  const accuracyLabel = accuracy === undefined ? '' : ` // ĐỘ CHÍNH XÁC ±${Math.round(accuracy)} M`;
  const fallbackLabel =
    state.position.source === 'last_known' ? 'VỊ TRÍ GẦN NHẤT' : 'VỊ TRÍ HIỆN TẠI';

  return `${fallbackLabel} // ${placeName}${accuracyLabel}. Vị trí này được dùng để tải thời tiết địa phương.`;
}

// Đổi lỗi lấy vị trí thành lời giải thích.
function acquisitionErrorLabel(code: LocationAcquisitionErrorCode) {
  const labels: Record<LocationAcquisitionErrorCode, string> = {
    timeout: 'QUÁ THỜI GIAN',
    position_unavailable: 'KHÔNG CÓ TÍN HIỆU',
    invalid_position: 'TỌA ĐỘ KHÔNG HỢP LỆ',
    unexpected: 'KHÔNG XÁC ĐỊNH',
  };

  return labels[code];
}

// Chọn nội dung theo trạng thái vị trí.
function getPresentation(state: LocationCapabilityState): LocationPresentation {
  switch (state.status) {
    case 'idle':
      return {
        label: 'VỊ TRÍ // CHƯA KIỂM TRA',
        title: 'Khả năng vị trí đang khởi tạo',
        detail: 'Màn hình chính tiếp tục dùng dữ liệu minh họa.',
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
          'Ứng dụng chỉ yêu cầu vị trí khi đang sử dụng. Bạn có thể từ chối và tìm địa điểm thủ công từ menu.',
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
      if (state.position === undefined) {
        return {
          label: 'VỊ TRÍ // CHỌN THỦ CÔNG',
          title: 'Đang xem thời tiết ở địa điểm đã chọn',
          detail: readyDetail(state),
          tone: 'ready',
          primaryAction: 'retry',
          primaryActionLabel: 'DÙNG GPS',
        };
      }
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
        title: 'Ứng dụng vẫn hoạt động khi không có GPS',
        detail: state.canAskAgain
          ? 'Quyền vị trí chưa được cấp. Bạn có thể thử lại hoặc tìm địa điểm thủ công từ menu.'
          : 'Quyền vị trí đã bị chặn. Bạn có thể thay đổi trong cài đặt hoặc tìm địa điểm thủ công từ menu.',
        tone: 'attention',
        primaryAction: state.canAskAgain ? 'request' : 'settings',
        primaryActionLabel: state.canAskAgain ? 'THỬ LẠI' : 'MỞ CÀI ĐẶT',
        showRefreshAfterSettings: !state.canAskAgain,
      };
    case 'permission_unavailable':
      return {
        label: 'VỊ TRÍ // QUYỀN KHÔNG KHẢ DỤNG',
        title: 'Không thể kiểm tra quyền vị trí',
        detail: `${state.message} Ứng dụng vẫn dùng dữ liệu minh họa; tìm địa điểm thủ công có trong menu.`,
        tone: 'attention',
        primaryAction: 'retry',
        primaryActionLabel: 'KIỂM TRA LẠI',
      };
    case 'services_unavailable':
      return {
        label: 'VỊ TRÍ // DỊCH VỤ ĐANG TẮT',
        title: 'Dịch vụ vị trí không khả dụng',
        detail:
          'Bật dịch vụ vị trí của thiết bị rồi thử lại. Ứng dụng không bị khóa và vẫn dùng dữ liệu minh họa.',
        tone: 'attention',
        primaryAction: 'retry',
        primaryActionLabel: 'THỬ LẠI',
      };
    case 'acquisition_error':
      return {
        label: `VỊ TRÍ // ${acquisitionErrorLabel(state.code)}`,
        title: 'Chưa lấy được tọa độ thiết bị',
        detail: `${state.message} Ứng dụng vẫn dùng dữ liệu minh họa.`,
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

// Hiển thị nút thao tác vị trí.
function LocationAction({ label, onPress, secondary = false }: LocationActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: homeVisualTokens.grid }}
      onPress={onPress}
      style={({ pressed }) => [styles.action, secondary && styles.actionSecondary, pressed && styles.actionPressed]}
    >
      <Text style={[styles.actionText, secondary && styles.actionTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

// Hiển thị quyền GPS và vị trí hiện tại.
export function LocationCapabilityStrip({ compact = false }: LocationCapabilityStripProps) {
  const { state, requestPermission, retry, refreshPermission } = useLocationCapability();
  const presentation = getPresentation(state);

  if (state.status === 'ready') {
    if (state.position === undefined) {
      const placeName = state.selectedLocation.label ?? 'Địa điểm đã chọn';

      return (
        <View
          accessibilityLabel={`Địa điểm chọn thủ công. ${placeName}. Không thay đổi GPS thiết bị.`}
          accessibilityLiveRegion="polite"
          style={[styles.readyContainer, compact && styles.containerCompact]}
          testID="location-capability-ready-manual"
        >
          <View style={styles.readyCopy}>
            <View style={styles.labelRow}>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[styles.signal, locationCapabilityLayoutStyles.manualSignal]}
              />
              <Text style={styles.label}>ĐỊA ĐIỂM ĐÃ CHỌN</Text>
            </View>
            <Text accessibilityRole="header" style={styles.readyPlaceName}>
              {placeName}
            </Text>
            <Text style={styles.readyDetail}>TỪ XA · KHÔNG THAY ĐỔI GPS</Text>
          </View>
          <LocationAction label="DÙNG GPS" onPress={() => void refreshPermission()} secondary />
        </View>
      );
    }

    const accuracy = state.position.accuracyMeters;
    const sourceLabel =
      state.position.source === 'last_known' ? 'VỊ TRÍ GẦN NHẤT' : 'VỊ TRÍ HIỆN TẠI';
    const placeName = state.selectedLocation.label ?? 'Địa điểm hiện tại';
    const accuracyLabel =
      accuracy === undefined ? 'GPS SẴN SÀNG' : `GPS · ±${Math.round(accuracy)} M`;

    return (
      <View
        accessibilityLabel={`${sourceLabel}. ${placeName}. ${accuracyLabel}`}
        accessibilityLiveRegion="polite"
        style={[styles.readyContainer, compact && styles.containerCompact]}
        testID="location-capability-ready"
      >
        <View style={styles.readyCopy}>
          <View style={styles.labelRow}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.signal, positionSignalStyle(state.position.source)]}
            />
            <Text style={styles.label}>{sourceLabel}</Text>
          </View>
          <Text accessibilityRole="header" style={styles.readyPlaceName}>
            {placeName}
          </Text>
          <Text style={styles.readyDetail}>{accuracyLabel}</Text>
        </View>
        <LocationAction label="CẬP NHẬT" onPress={() => void retry()} secondary />
      </View>
    );
  }

  // Thực hiện thao tác vị trí đang gợi ý.
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
      style={[styles.container, compact && styles.containerCompact]}
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
            style={[styles.signal, signalColorStyle(signalColor)]}
          />
        )}
        <Text style={styles.label}>{presentation.label.replaceAll(' // ', ' · ')}</Text>
      </View>

      <Text accessibilityRole="header" style={[styles.title, compact && styles.titleCompact]}>
        {presentation.title}
      </Text>
      <Text style={styles.detail}>{presentation.detail}</Text>

      {presentation.primaryAction === undefined ? null : (
        <View style={styles.actions}>
          <LocationAction
            label={presentation.primaryActionLabel ?? 'THỬ LẠI'}
            onPress={runPrimaryAction}
          />
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
