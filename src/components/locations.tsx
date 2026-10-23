/**
 * Giao diện xin quyền vị trí, tìm địa điểm và chọn địa điểm đã lưu.
 * Cho phép chọn thủ công khi GPS không sẵn sàng.
 */
import { Text, View, ActivityIndicator, TextInput } from 'react-native';
import { homeVisualTokens } from '@/theme';
import { NeoButton, NeoSheet } from '@/components/controls';
import { candidateSelection, isSameLocation, type LocationsModel, savedSelection, useLocationsModel } from '@/context/location';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { locationStyles } from '@/css/components/locations.styles';

export { locationStyles } from "@/css/components/locations.styles";

// location-styles

// location-search-results

// Hiển thị kết quả tìm địa điểm.
export function LocationSearchResults({ model }: { model: LocationsModel }) {
  const { searchQuery, searchErrorCopy, runSearch, savedLocations, useSelection, saveMutation, saveCandidate } = model;
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

// Hiển thị danh sách địa điểm đã lưu.
export function SavedLocationsPanel({ model, onRequireAuth }: {
  model: LocationsModel;
  onRequireAuth: () => void;
}) {
  const { authState, savedLocationsQuery, savedLocations, useSelection, deleteMutation, confirmDelete } = model;
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

// Mở bảng tìm và chọn địa điểm.
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

export * from '@/components/location-capability';
