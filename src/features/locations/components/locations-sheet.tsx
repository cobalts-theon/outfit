import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NeoButton } from '@/components/ui/neo-button';
import { NeoSheet } from '@/components/ui/neo-sheet';
import { useAuth } from '@/features/auth/application/auth-provider';
import { useLocationCapability } from '@/features/locations/application/location-capability-provider';
import { useLocationSearch } from '@/features/locations/application/location-search-query';
import {
  useDeleteSavedLocation,
  useSavedLocations,
  useSaveLocation,
} from '@/features/locations/application/saved-locations-query';
import type { ManualLocationCandidate, ManualLocationSelection } from '@/features/locations/domain/manual-location';
import type { SavedLocation } from '@/features/locations/data/saved-locations-repository';
import { LocationSearchError } from '@/services/location/providers/open-meteo-geocoding/client';
import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

interface LocationsSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onRequireAuth: () => void;
}

function candidateSelection(candidate: ManualLocationCandidate): ManualLocationSelection {
  return {
    label: (
      candidate.selectionLabel ??
      [candidate.label, candidate.context].filter(Boolean).join(' · ')
    ).slice(0, 100),
    coordinates: candidate.coordinates,
  };
}

function savedSelection(location: SavedLocation): ManualLocationSelection {
  return {
    label: location.label,
    coordinates: { latitude: location.latitude, longitude: location.longitude },
  };
}

function isSameLocation(
  location: SavedLocation,
  candidate: ManualLocationCandidate,
) {
  return (
    Math.abs(location.latitude - candidate.coordinates.latitude) < 0.00001 &&
    Math.abs(location.longitude - candidate.coordinates.longitude) < 0.00001
  );
}

function locationSearchErrorCopy(error: unknown) {
  if (!(error instanceof LocationSearchError)) {
    return {
      title: 'KHÔNG THỂ TÌM ĐỊA ĐIỂM',
      message: 'Đã có lỗi ngoài dự kiến. Hãy thử lại sau ít phút.',
    };
  }

  switch (error.code) {
    case 'timeout':
      return {
        title: 'TÌM KIẾM QUÁ LÂU',
        message: 'Dịch vụ chưa phản hồi kịp. Kết nối có thể chậm; hãy nhấn TÌM LẠI.',
      };
    case 'rate_limit':
      return {
        title: 'TẠM THỜI QUÁ TẢI',
        message: 'Dịch vụ đang nhận nhiều yêu cầu. Chờ một lát rồi thử lại.',
      };
    case 'provider':
    case 'invalid_response':
      return {
        title: 'DỊCH VỤ TẠM GIÁN ĐOẠN',
        message: 'Dịch vụ địa danh đang gặp sự cố. Địa điểm GPS hiện tại vẫn dùng được.',
      };
    case 'network':
      return {
        title: 'CHƯA CÓ KẾT NỐI',
        message: 'Không thể kết nối tới dịch vụ địa danh. Kiểm tra mạng rồi nhấn TÌM LẠI.',
      };
  }
}

export function LocationsSheet({ visible, onClose, onRequireAuth }: LocationsSheetProps) {
  const { state: authState } = useAuth();
  const { selectManualLocation } = useLocationCapability();
  const [draftQuery, setDraftQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [feedback, setFeedback] = useState<string>();
  const userId = authState.status === 'signed_in' ? authState.user.id : undefined;
  const searchQuery = useLocationSearch(submittedQuery);
  const savedLocationsQuery = useSavedLocations(userId);
  const saveMutation = useSaveLocation(userId);
  const deleteMutation = useDeleteSavedLocation(userId);
  const savedLocations = savedLocationsQuery.data ?? [];
  const normalizedDraftQuery = draftQuery.trim();
  const isCurrentSearch =
    normalizedDraftQuery.length >= 2 &&
    normalizedDraftQuery.toLocaleLowerCase('vi') ===
      submittedQuery.trim().toLocaleLowerCase('vi');
  const searchErrorCopy = locationSearchErrorCopy(searchQuery.error);

  const runSearch = () => {
    Keyboard.dismiss();
    setFeedback(undefined);
    const query = normalizedDraftQuery;
    if (query.length < 2) {
      setFeedback('Nhập ít nhất 2 ký tự để tìm địa điểm.');
      return;
    }

    if (isCurrentSearch) {
      void searchQuery.refetch();
      return;
    }

    setSubmittedQuery(query);
  };

  const useSelection = (selection: ManualLocationSelection) => {
    selectManualLocation(selection);
    onClose();
  };

  const saveCandidate = async (candidate: ManualLocationCandidate) => {
    if (userId === undefined) {
      onRequireAuth();
      return;
    }

    setFeedback(undefined);
    try {
      await saveMutation.mutateAsync(candidateSelection(candidate));
      setFeedback(`Đã lưu ${candidate.label} vào tài khoản.`);
    } catch {
      setFeedback('Không thể lưu địa điểm. Hãy kiểm tra mạng và thử lại.');
    }
  };

  const confirmDelete = (location: SavedLocation) => {
    Alert.alert(
      'Xóa địa điểm?',
      `${location.label} sẽ bị xóa khỏi tài khoản của bạn.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setFeedback(undefined);
            void deleteMutation.mutateAsync(location.id).catch(() => {
              setFeedback('Không thể xóa địa điểm. Hãy thử lại.');
            });
          },
        },
      ],
    );
  };

  return (
    <NeoSheet label="LOCATION//REMOTE" onClose={onClose} title="ĐỊA ĐIỂM" visible={visible}>
      <View style={styles.introPanel}>
        <Text accessibilityRole="header" style={styles.introTitle}>ĐI ĐÂU CŨNG XEM ĐƯỢC</Text>
        <Text style={styles.introBody}>
          Tìm một thành phố hoặc khu vực, xem thời tiết tại đó ngay và lưu lại cho lần sau. Bạn không cần đứng tại địa điểm ấy và GPS thiết bị không bị thay đổi.
        </Text>
      </View>

      <View style={styles.searchPanel}>
        <Text style={styles.sectionLabel}>SEARCH//PLACE</Text>
        <Text accessibilityRole="header" style={styles.sectionTitle}>TÌM ĐỊA ĐIỂM TỪ XA</Text>
        <TextInput
          accessibilityLabel="Tên thành phố hoặc khu vực"
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={setDraftQuery}
          onSubmitEditing={runSearch}
          placeholder="Ví dụ: Đà Lạt, Seoul, Paris…"
          placeholderTextColor={homeVisualTokens.unavailable}
          returnKeyType="search"
          style={styles.input}
          value={draftQuery}
        />
        <NeoButton
          disabled={searchQuery.isFetching}
          label={
            searchQuery.isFetching
              ? 'ĐANG TÌM…'
              : isCurrentSearch
                ? 'TÌM LẠI'
                : 'TÌM ĐỊA ĐIỂM'
          }
          onPress={runSearch}
        />
      </View>

      {feedback === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={styles.feedback}>{feedback}</Text>
      )}

      {searchQuery.isError ? (
        <View accessibilityLiveRegion="assertive" style={[styles.statePanel, styles.errorPanel]}>
          <Text style={styles.sectionTitle}>{searchErrorCopy.title}</Text>
          <Text style={styles.body}>{searchErrorCopy.message}</Text>
          <NeoButton label="TÌM LẠI" onPress={runSearch} tone="secondary" />
        </View>
      ) : searchQuery.data !== undefined ? (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionLabel}>RESULTS//{String(searchQuery.data.length).padStart(2, '0')}</Text>
          <Text accessibilityRole="header" style={styles.sectionTitle}>KẾT QUẢ</Text>
          {searchQuery.data.length === 0 ? (
            <Text style={styles.emptyText}>Không tìm thấy địa điểm phù hợp. Hãy thử tên rộng hơn hoặc kiểm tra chính tả.</Text>
          ) : (
            searchQuery.data.map((candidate) => {
              const alreadySaved = savedLocations.some((location) => isSameLocation(location, candidate));
              return (
                <View key={candidate.id} style={styles.locationRow}>
                  <View style={styles.locationCopy}>
                    <Text style={styles.locationName}>{candidate.label}</Text>
                    <Text style={styles.locationContext}>{candidate.context || 'Không có mô tả khu vực'}</Text>
                  </View>
                  <View style={styles.rowActions}>
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

      <View style={styles.savedSection}>
        <Text style={styles.sectionLabel}>SAVED//CLOUD</Text>
        <Text accessibilityRole="header" style={styles.sectionTitle}>ĐỊA ĐIỂM ĐÃ LƯU</Text>
        {authState.status !== 'signed_in' ? (
          <View style={styles.authPrompt}>
            <Text style={styles.body}>Đăng nhập bằng avatar ở góc phải để lưu và đồng bộ địa điểm giữa các phiên.</Text>
            <NeoButton label="MỞ TÀI KHOẢN" onPress={onRequireAuth} tone="secondary" />
          </View>
        ) : savedLocationsQuery.isPending ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={homeVisualTokens.technical} />
            <Text style={styles.body}>Đang tải địa điểm đã lưu…</Text>
          </View>
        ) : savedLocationsQuery.isError ? (
          <View style={[styles.statePanel, styles.errorPanel]}>
            <Text style={styles.body}>Không thể tải địa điểm đã lưu.</Text>
            <NeoButton label="THỬ LẠI" onPress={() => void savedLocationsQuery.refetch()} tone="secondary" />
          </View>
        ) : savedLocations.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có địa điểm nào. Tìm ở trên rồi nhấn LƯU.</Text>
        ) : (
          savedLocations.map((location) => (
            <View key={location.id} style={styles.savedRow}>
              <View style={styles.locationCopy}>
                <Text style={styles.locationName}>{location.label}</Text>
                <Text style={styles.locationContext}>
                  {location.is_default ? 'MẶC ĐỊNH · ĐỒNG BỘ SUPABASE' : 'ĐỒNG BỘ SUPABASE'}
                </Text>
              </View>
              <View style={styles.rowActions}>
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

      <Text style={styles.providerNote}>
        Tìm kiếm địa danh: Open-Meteo Geocoding; trên Android đã cấp quyền vị trí, bộ định vị hệ thống có thể được dùng khi cần. Dữ liệu đã lưu chỉ chứa nhãn và tọa độ điểm bạn chủ động chọn; ứng dụng không lưu lịch sử di chuyển.
      </Text>
    </NeoSheet>
  );
}

const colors = appThemes.light.colors;

const styles = StyleSheet.create({
  introPanel: {
    gap: spacing.xs,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.cobalt,
    boxShadow: '6px 6px 0px #101010',
  },
  introTitle: {
    color: colors.surface,
    fontFamily: typography.heading,
    fontSize: 23,
    lineHeight: 28,
  },
  body: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  introBody: {
    color: colors.surface,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  searchPanel: {
    gap: spacing.sm,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  sectionLabel: {
    color: colors.text,
    fontFamily: typography.brand,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 19,
    lineHeight: 23,
  },
  input: {
    minHeight: 52,
    borderWidth: 3,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 15,
    backgroundColor: homeVisualTokens.paper,
  },
  feedback: {
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: homeVisualTokens.mint,
  },
  statePanel: {
    gap: spacing.sm,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  errorPanel: {
    backgroundColor: homeVisualTokens.dangerSurface,
  },
  resultsSection: {
    gap: spacing.sm,
  },
  savedSection: {
    gap: spacing.sm,
    borderTopWidth: 4,
    borderColor: colors.border,
    paddingTop: spacing.lg,
  },
  locationRow: {
    gap: spacing.sm,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.sm,
    backgroundColor: homeVisualTokens.paleBlueField,
  },
  savedRow: {
    gap: spacing.sm,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.sm,
    backgroundColor: homeVisualTokens.mint,
  },
  locationCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  locationName: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 17,
    lineHeight: 21,
  },
  locationContext: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 16,
  },
  rowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  authPrompt: {
    gap: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
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
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
    backgroundColor: homeVisualTokens.unavailableSurface,
  },
  providerNote: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 10,
    lineHeight: 16,
  },
});
