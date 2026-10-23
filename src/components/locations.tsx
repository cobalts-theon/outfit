import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  Linking,
  Platform,
  Pressable,
} from 'react-native';
import {
  appThemes,
  homeVisualTokens,
  radii,
  spacing,
  typography,
  neoShadows,
  touchTargets,
} from '@/theme';
import { NeoButton, NeoSheet } from '@/components/controls';
import {
  candidateSelection,
  isSameLocation,
  type LocationsModel,
  savedSelection,
  useLocationsModel,
  useLocationCapability,
} from '@/context/location';
import type { LocationAcquisitionErrorCode, LocationCapabilityState } from '@/utils/validation';

// location-styles

const locationStylesColors = appThemes.light.colors;

export const locationStyles = StyleSheet.create({
  introPanel: {
    gap: spacing.xs,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.md,
    backgroundColor: locationStylesColors.surface,
    boxShadow: '6px 6px 0px #1D3557',
  },
  introTitle: {
    color: locationStylesColors.text,
    fontFamily: typography.heading,
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    color: locationStylesColors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  introBody: {
    color: locationStylesColors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  searchPanel: {
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.md,
    backgroundColor: locationStylesColors.surface,
  },
  sectionLabel: {
    color: locationStylesColors.text,
    fontFamily: typography.brand,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1,
  },
  sectionTitle: {
    color: locationStylesColors.text,
    fontFamily: typography.heading,
    fontSize: 19,
    lineHeight: 23,
  },
  input: {
    minHeight: 52,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    paddingHorizontal: spacing.sm,
    color: locationStylesColors.text,
    fontFamily: typography.body,
    fontSize: 15,
    backgroundColor: homeVisualTokens.paper,
  },
  notice: {
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.sm,
    color: locationStylesColors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: homeVisualTokens.mint,
  },
  statePanel: {
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.md,
    backgroundColor: locationStylesColors.surface,
  },
  errorPanel: { backgroundColor: homeVisualTokens.dangerSurface },
  resultsSection: { gap: spacing.sm },
  savedSection: {
    gap: spacing.sm,
    borderTopWidth: 4,
    borderColor: locationStylesColors.border,
    paddingTop: spacing.lg,
  },
  locationRow: {
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.sm,
    backgroundColor: locationStylesColors.surface,
  },
  savedRow: {
    gap: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.sm,
    backgroundColor: locationStylesColors.surface,
  },
  locationCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  locationName: {
    color: locationStylesColors.text,
    fontFamily: typography.heading,
    fontSize: 17,
    lineHeight: 21,
  },
  locationContext: {
    color: locationStylesColors.textMuted,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 16,
  },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  authPrompt: {
    gap: spacing.md,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.warningSurface,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  emptyText: {
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationStylesColors.border,
    padding: spacing.md,
    color: locationStylesColors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
    backgroundColor: homeVisualTokens.unavailableSurface,
  },
  providerNote: {
    color: locationStylesColors.textMuted,
    fontFamily: typography.body,
    fontSize: 10,
    lineHeight: 16,
  },
});

// location-search-results

export function LocationSearchResults({ model }: { model: LocationsModel }) {
  const {
    searchQuery,
    searchErrorCopy,
    runSearch,
    savedLocations,
    useSelection,
    saveMutation,
    saveCandidate,
  } = model;
  return (
    <>
      {searchQuery.isError ? (
        <View
          accessibilityLiveRegion="assertive"
          style={[locationStyles.statePanel, locationStyles.errorPanel]}
        >
          <Text style={locationStyles.sectionTitle}>{searchErrorCopy.title}</Text>
          <Text style={locationStyles.body}>{searchErrorCopy.message}</Text>
          <NeoButton label="TÌM LẠI" onPress={runSearch} tone="secondary" />
        </View>
      ) : searchQuery.data !== undefined ? (
        <View style={locationStyles.resultsSection}>
          <Text style={locationStyles.sectionLabel}>
            TÌM THẤY · {String(searchQuery.data.length).padStart(2, '0')}
          </Text>
          <Text accessibilityRole="header" style={locationStyles.sectionTitle}>
            KẾT QUẢ
          </Text>
          {searchQuery.data.length === 0 ? (
            <Text style={locationStyles.emptyText}>
              Không tìm thấy địa điểm phù hợp. Hãy thử tên rộng hơn hoặc kiểm tra chính tả.
            </Text>
          ) : (
            searchQuery.data.map((candidate) => {
              const alreadySaved = savedLocations.some((location) =>
                isSameLocation(location, candidate),
              );
              return (
                <View key={candidate.id} style={locationStyles.locationRow}>
                  <View style={locationStyles.locationCopy}>
                    <Text style={locationStyles.locationName}>{candidate.label}</Text>
                    <Text style={locationStyles.locationContext}>
                      {candidate.context || 'Không có mô tả khu vực'}
                    </Text>
                  </View>
                  <View style={locationStyles.rowActions}>
                    <NeoButton
                      accessibilityLabel={`Xem thời tiết tại ${candidate.label}`}
                      label="XEM"
                      onPress={() => useSelection(candidateSelection(candidate))}
                      tone="secondary"
                    />
                    <NeoButton
                      accessibilityLabel={`${alreadySaved ? 'Đã lưu' : 'Lưu'} ${candidate.label}`}
                      disabled={alreadySaved || saveMutation.isPending}
                      label={alreadySaved ? 'ĐÃ LƯU' : 'LƯU'}
                      onPress={() => void saveCandidate(candidate)}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>
      ) : null}
    </>
  );
}

// saved-locations-panel

export function SavedLocationsPanel({
  model,
  onRequireAuth,
}: {
  model: LocationsModel;
  onRequireAuth: () => void;
}) {
  const {
    authState,
    savedLocationsQuery,
    savedLocations,
    useSelection,
    deleteMutation,
    confirmDelete,
  } = model;
  return (
    <View style={locationStyles.savedSection}>
      <Text style={locationStyles.sectionLabel}>ĐỒNG BỘ THEO TÀI KHOẢN</Text>
      <Text accessibilityRole="header" style={locationStyles.sectionTitle}>
        ĐỊA ĐIỂM ĐÃ LƯU
      </Text>
      {authState.status !== 'signed_in' ? (
        <View style={locationStyles.authPrompt}>
          <Text style={locationStyles.body}>
            Đăng nhập bằng avatar ở góc phải để lưu và đồng bộ địa điểm giữa các phiên.
          </Text>
          <NeoButton label="MỞ TÀI KHOẢN" onPress={onRequireAuth} tone="secondary" />
        </View>
      ) : savedLocationsQuery.isPending ? (
        <View style={locationStyles.loadingRow}>
          <ActivityIndicator color={homeVisualTokens.technical} />
          <Text style={locationStyles.body}>Đang tải địa điểm đã lưu…</Text>
        </View>
      ) : savedLocationsQuery.isError ? (
        <View style={[locationStyles.statePanel, locationStyles.errorPanel]}>
          <Text style={locationStyles.body}>Không thể tải địa điểm đã lưu.</Text>
          <NeoButton
            label="THỬ LẠI"
            onPress={() => void savedLocationsQuery.refetch()}
            tone="secondary"
          />
        </View>
      ) : savedLocations.length === 0 ? (
        <Text style={locationStyles.emptyText}>Chưa có địa điểm nào. Tìm ở trên rồi nhấn LƯU.</Text>
      ) : (
        savedLocations.map((location) => (
          <View key={location.id} style={locationStyles.savedRow}>
            <View style={locationStyles.locationCopy}>
              <Text style={locationStyles.locationName}>{location.label}</Text>
              <Text style={locationStyles.locationContext}>
                {location.is_default ? 'MẶC ĐỊNH · ĐỒNG BỘ SUPABASE' : 'ĐỒNG BỘ SUPABASE'}
              </Text>
            </View>
            <View style={locationStyles.rowActions}>
              <NeoButton
                accessibilityLabel={`Dùng địa điểm ${location.label}`}
                label="DÙNG"
                onPress={() => useSelection(savedSelection(location))}
                tone="secondary"
              />
              <NeoButton
                accessibilityLabel={`Xóa địa điểm ${location.label}`}
                disabled={deleteMutation.isPending}
                label="XÓA"
                onPress={() => confirmDelete(location)}
                tone="danger"
              />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

// locations-sheet

interface LocationsSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onRequireAuth: () => void;
}

export function LocationsSheet({ visible, onClose, onRequireAuth }: LocationsSheetProps) {
  const model = useLocationsModel(onClose, onRequireAuth);
  const { draftQuery, setDraftQuery, notice, searchQuery, isCurrentSearch, runSearch } = model;
  return (
    <NeoSheet label="KHU VỰC CỦA BẠN" onClose={onClose} title="ĐỊA ĐIỂM" visible={visible}>
      <View style={locationStyles.introPanel}>
        <Text accessibilityRole="header" style={locationStyles.introTitle}>
          CHỌN NƠI BẠN QUAN TÂM
        </Text>
        <Text style={locationStyles.introBody}>
          Tìm thành phố hoặc khu vực để xem gợi ý và dự báo. Lưu lại để dùng lần sau.
        </Text>
      </View>
      <View style={locationStyles.searchPanel}>
        <Text style={locationStyles.sectionLabel}>TÌM KIẾM</Text>
        <Text accessibilityRole="header" style={locationStyles.sectionTitle}>
          TÌM ĐỊA ĐIỂM
        </Text>
        <TextInput
          accessibilityLabel="Tên thành phố hoặc khu vực"
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={setDraftQuery}
          onSubmitEditing={runSearch}
          placeholder="Ví dụ: Đà Lạt, Seoul, Paris…"
          placeholderTextColor={homeVisualTokens.unavailable}
          returnKeyType="search"
          style={locationStyles.input}
          value={draftQuery}
        />
        <NeoButton
          disabled={searchQuery.isFetching}
          label={
            searchQuery.isFetching ? 'ĐANG TÌM…' : isCurrentSearch ? 'TÌM LẠI' : 'TÌM ĐỊA ĐIỂM'
          }
          onPress={runSearch}
        />
      </View>
      {notice === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={locationStyles.notice}>
          {notice}
        </Text>
      )}
      <LocationSearchResults model={model} />
      <SavedLocationsPanel model={model} onRequireAuth={onRequireAuth} />
      <Text style={locationStyles.providerNote}>
        Tìm địa danh bằng Open-Meteo và bộ định vị thiết bị khi cần. Chỉ lưu nơi bạn chọn, không lưu
        lịch sử di chuyển.
      </Text>
    </NeoSheet>
  );
}

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

function acquisitionErrorLabel(code: LocationAcquisitionErrorCode) {
  const labels: Record<LocationAcquisitionErrorCode, string> = {
    timeout: 'QUÁ THỜI GIAN',
    position_unavailable: 'KHÔNG CÓ TÍN HIỆU',
    invalid_position: 'TỌA ĐỘ KHÔNG HỢP LỆ',
    unexpected: 'KHÔNG XÁC ĐỊNH',
  };

  return labels[code];
}

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
                style={[styles.signal, { backgroundColor: homeVisualTokens.technical }]}
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
          <Text accessibilityRole="header" style={styles.readyPlaceName}>
            {placeName}
          </Text>
          <Text style={styles.readyDetail}>{accuracyLabel}</Text>
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
            style={[styles.signal, { backgroundColor: signalColor }]}
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

const locationCapabilityStripColors = appThemes.light.colors;

const minimumTouchTarget = Platform.OS === 'ios' ? touchTargets.ios : touchTargets.android;

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationCapabilityStripColors.border,
    backgroundColor: homeVisualTokens.fieldDeep,
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  containerCompact: { paddingVertical: spacing.sm },
  readyContainer: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: locationCapabilityStripColors.border,
    backgroundColor: homeVisualTokens.fieldDeep,
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  readyCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  readyDetail: {
    color: locationCapabilityStripColors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 0.45,
  },
  readyPlaceName: {
    color: locationCapabilityStripColors.text,
    fontFamily: typography.heading,
    fontSize: 17,
    lineHeight: 21,
  },
  labelRow: { minHeight: 20, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  signal: { width: 9, height: 9, borderWidth: 2, borderColor: homeVisualTokens.ink },
  label: {
    flex: 1,
    color: homeVisualTokens.ink,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
  },
  title: {
    color: locationCapabilityStripColors.text,
    fontFamily: typography.heading,
    fontSize: 21,
    lineHeight: 24,
  },
  titleCompact: { fontSize: 19, lineHeight: 22 },
  detail: {
    maxWidth: 620,
    color: locationCapabilityStripColors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xxs },
  action: {
    minHeight: minimumTouchTarget,
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.infoSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    boxShadow: neoShadows.control,
  },
  actionSecondary: { backgroundColor: homeVisualTokens.field },
  actionPressed: {
    boxShadow: neoShadows.controlPressed,
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },
  actionText: {
    color: locationCapabilityStripColors.text,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.6,
  },
  actionTextSecondary: { color: locationCapabilityStripColors.text },
});
