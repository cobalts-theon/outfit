/**
 * Màn hình chọn hoạt động, đánh giá giờ phù hợp và xem giờ đã lưu.
 * Dùng hook lập kế hoạch để thực hiện tính toán và thao tác dữ liệu.
 */
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeoBadge, NeoButton, TimeDropdown } from '@/components/controls';
import { LocationsSheet, LocationCapabilityStrip } from '@/components/locations';
import { RecommendationActionIcon } from '@/components/home-advice';
import { homeVisualTokens } from '@/theme';
import { usePlansScreen } from '@/hooks/plans';
import { AccountSheet } from '@/components/account';
import { ACTIVITIES, localHour, displayPlanningDate } from '@/utils/planning';
import { PlanningDateDuration, PlannerChoices, SavedPlanList, ActivityAssessmentCard } from '@/components/plans';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { styles } from '@/css/screens/plans-screen.styles';
import { plansScreenLayoutStyles } from '@/css/screens/plans-screen.styles';

// plans-screen

// Hiển thị màn hình đánh giá và lưu giờ.
export function PlansScreen() {
  const router = useRouter();
  const {
    planId, model, focused, chosenActivity, commute, departure, setDeparture, setActivity, activity, duration, durationText, setDurationText, dateValue, setDateText,
    selectionError, from, setFrom, to, setTo, transport, setTransport, accountOpen, setAccountOpen, remind, setRemind, locationOpen, setLocationOpen, notice, setNotice, now, zone,
    today, tomorrow, dates, day, selected, busy, loading, validRange, candidates, assessment, enableReminder, save, changeSaved,
  } = usePlansScreen();
  const wide = useWindowDimensions().width >= 700;
  const elapsed =
    day === today &&
    (commute ? departure : to) !== undefined &&
    (commute ? departure! : to!) <= localHour(new Date(now).toISOString(), zone) * 60;
  let resultMessage = selectionError;
  if (!resultMessage) {
    if (!selected) resultMessage = 'Chọn địa điểm để lấy dự báo môi trường.';
    else if (!chosenActivity) resultMessage = 'Chọn hoạt động cần đánh giá.';
    else if (commute && departure === undefined) resultMessage = 'Chọn giờ bạn dự định xuất phát.';
    else if (!commute && !validRange) resultMessage = 'Chọn khoảng giờ bạn có thể ra ngoài.';
    else if (elapsed) resultMessage = 'Giờ đã chọn hôm nay đã qua. Chọn ngày mai hoặc giờ sắp tới.';
    else if (!dates.includes(day))
      resultMessage = 'Chưa có dự báo cho ngày này. Chọn ngày gần hơn hoặc cập nhật dự báo.';
    else if (!commute && duration > to! - from!)
      resultMessage = 'Thời lượng dài hơn khoảng giờ đã chọn.';
    else
      resultMessage =
        'Chưa đủ dự báo cho toàn bộ thời gian đã chọn. Cập nhật dự báo hoặc chọn lại giờ.';
  }
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => void model.refresh()} />
        }
      >
        <View style={styles.topBar}>
          <View style={styles.topBarCopy}>
            <NeoBadge label="HOẠT ĐỘNG & MÔI TRƯỜNG" />
            <Text accessibilityRole="header" style={styles.topBarTitle}>
              KHI NÀO NÊN RA NGOÀI?
            </Text>
          </View>
          <View style={styles.closeSpace}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng chọn giờ phù hợp"
              onPress={() => router.replace('/')}
              style={({ pressed }) => [styles.closeButton, pressed && styles.closePressed]}
            >
              <Text style={styles.closeText}>X</Text>
            </Pressable>
          </View>
        </View>
        {planId ? (
          <View style={styles.section}>
            <Text style={styles.heading}>Giờ bạn đã lưu</Text>
            {!model.owner ? (
              <NeoButton label="ĐĂNG NHẬP ĐỂ XEM GIỜ ĐÃ LƯU" onPress={() => setAccountOpen(true)} />
            ) : focused.isPending ? (
              <ActivityIndicator />
            ) : focused.isError ? (
              <NeoButton label="Tải lại kế hoạch" onPress={() => void focused.refetch()} />
            ) : focused.data ? (
              <SavedPlanList
                plans={[focused.data]}
                initialExpanded
                busy={busy}
                now={now}
                onChange={changeSaved}
              />
            ) : (
              <Text style={styles.body}>
                Giờ này không còn sắp tới hoặc không thuộc tài khoản này.
              </Text>
            )}
            {notice ? (
              <Text accessibilityLiveRegion="polite" style={styles.note}>
                {notice}
              </Text>
            ) : null}
          </View>
        ) : null}
        <Text accessibilityRole="header" style={styles.title}>
          Bạn muốn đánh giá hoạt động nào?
        </Text>
        <Text style={styles.body}>
          {commute
            ? 'Chọn giờ đi làm/đi học để xem điều kiện thời tiết và cần chuẩn bị gì.'
            : 'Chọn khoảng giờ rảnh để tìm lúc phù hợp cho hoạt động ngoài trời.'}
        </Text>
        <View style={styles.grid}>
          {ACTIVITIES.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: chosenActivity === item.id }}
              onPress={() => {
                setActivity(item.id);
                setNotice('');
              }}
              style={[styles.activity, chosenActivity === item.id && styles.selected]}
            >
              <RecommendationActionIcon compact actionKey={item.icon} primary={false} />
              <Text style={[styles.heading, plansScreenLayoutStyles.activityLabel]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        {!chosenActivity ? (
          <Text style={styles.body}>Chọn một hoạt động ở trên để bắt đầu.</Text>
        ) : null}
        <View style={styles.section}>
          <Text style={styles.heading}>
            {selected?.label ?? model.weather.data?.weather.location.name ?? 'Chọn địa điểm'}
          </Text>
          <NeoButton tone="secondary" label="ĐỔI ĐỊA ĐIỂM" onPress={() => setLocationOpen(true)} />
          {!selected ? <LocationCapabilityStrip /> : null}
        </View>
        <View style={[styles.assessmentLayout, wide && styles.sideBySide]}>
          <View style={styles.settings}>
            <Text style={styles.heading}>
              {commute ? 'Chuyến đi của bạn' : 'Điều kiện bạn chọn'}
            </Text>
            <PlanningDateDuration
              commute={commute}
              date={dateValue}
              duration={durationText}
              today={today}
              tomorrow={tomorrow}
              onDate={setDateText}
              onDuration={setDurationText}
            />
            {commute ? (
              <>
                <PlannerChoices
                  label="Giờ đi buổi sáng"
                  value={departure ?? ''}
                  onChange={(value) => setDeparture(Number(value))}
                  options={[360, 390, 420].map((value) => ({
                    value,
                    label: value === 360 ? '6:00' : value === 390 ? '6:30' : '7:00',
                  }))}
                />
                <TimeDropdown
                  label="Giờ xuất phát (từ 6:00)"
                  value={departure}
                  minTime={360}
                  onChange={setDeparture}
                />
                <Text style={styles.body}>
                  Thời gian di chuyển là số phút từ lúc xuất phát đến nơi, không phải thời gian
                  học/làm. App đánh giá giờ bạn chọn và gợi ý chuẩn bị cho chuyến đi.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.heading}>Khoảng giờ có thể ra ngoài</Text>
                <View style={styles.grid}>
                  <TimeDropdown label="Từ" value={from} onChange={setFrom} />
                  <TimeDropdown label="Đến" value={to} onChange={setTo} />
                </View>
              </>
            )}
            {chosenActivity && !['walking', 'running'].includes(chosenActivity) ? (
              <PlannerChoices
                label="Bạn sẽ di chuyển bằng gì?"
                value={transport}
                onChange={setTransport}
                options={[
                  { value: 'walk', label: 'Đi bộ' },
                  { value: 'bike', label: 'Xe đạp' },
                  { value: 'motorbike', label: 'Xe máy' },
                  { value: 'covered', label: 'Ô tô / xe buýt' },
                ]}
              />
            ) : null}
            {commute ? (
              <Text style={styles.fine}>
                Dự báo tại khu vực đã chọn, chưa đánh giá toàn bộ tuyến đường.
              </Text>
            ) : null}
            <Text style={styles.fine}>Giờ tại địa điểm đã chọn · {zone}</Text>
            <Text style={styles.fine}>
              Đánh giá từ dữ liệu theo giờ; không dự đoán chính xác tới từng phút.
            </Text>
          </View>
          <View style={styles.results} accessibilityLiveRegion="polite">
            <NeoBadge label="KẾT QUẢ ĐÁNH GIÁ" />
            <Text style={styles.heading}>
              {ACTIVITIES.find((item) => item.id === chosenActivity)?.label ??
                'Chưa chọn hoạt động'}
            </Text>
            <Text style={styles.body}>
              {dateValue} · {commute ? 'Di chuyển ' : ''}
              {durationText || '…'} phút
            </Text>
            {loading ? <ActivityIndicator color={homeVisualTokens.cobalt} /> : null}
            {model.weather.isError || model.aqi.isError ? (
              <Text style={styles.note}>
                Một phần dự báo chưa tải được. Dữ liệu thiếu không được coi là điều kiện tốt.
              </Text>
            ) : null}
            {!loading && assessment ? (
              <View style={plansScreenLayoutStyles.preparationGroup}>
                {commute ? <Text style={styles.fine}>Xuất phát → dự kiến đến nơi</Text> : null}
                <ActivityAssessmentCard
                  assessment={assessment}
                  timeZone={zone}
                  title={
                    commute
                      ? assessment.status === 'unknown'
                        ? 'CHƯA ĐỦ DỮ LIỆU'
                        : assessment.status === 'avoid'
                          ? 'ĐIỀU KIỆN BẤT LỢI'
                          : 'THỜI TIẾT KHI DI CHUYỂN'
                      : assessment.status === 'avoid'
                        ? 'NÊN ĐỔI GIỜ'
                        : 'KHUNG GIỜ ĐỀ XUẤT'
                  }
                  busy={busy}
                  onSave={() => void save(assessment)}
                />
              </View>
            ) : !loading ? (
              <Text style={styles.body}>{resultMessage}</Text>
            ) : null}
            {elapsed ? (
              <NeoButton
                label="XEM NGÀY MAI"
                onPress={() => setDateText(displayPlanningDate(tomorrow))}
              />
            ) : null}
            <NeoButton
              label="CẬP NHẬT DỰ BÁO"
              tone="secondary"
              disabled={loading || !selected}
              onPress={() => void model.refresh()}
            />
          </View>
        </View>
        <View style={styles.section}>
          <NeoButton
            tone={remind ? 'primary' : 'neutral'}
            label={remind ? '✓ NHẮC TRƯỚC GIỜ ĐÃ CHỌN' : 'NHẮC TRƯỚC GIỜ ĐÃ CHỌN'}
            onPress={() => {
              if (remind) setRemind(false);
              else
                void enableReminder()
                  .then((granted) => {
                    setRemind(granted);
                    if (!granted) setNotice('Cần cho phép thông báo trong cài đặt thiết bị.');
                  })
                  .catch(() => setNotice('Chưa bật được thông báo.'));
            }}
          />
          <Text style={styles.fine}>
            Áp dụng khi lưu giờ mới: nhắc trước 15 phút. App kiểm tra dự báo khi đang mở hoặc mở
            lại; chưa theo dõi liên tục khi đã đóng.
          </Text>
          {!loading
            ? candidates
                .slice(1)
                .map((assessment) => (
                  <ActivityAssessmentCard
                    key={`${activity}:${assessment.start}:${duration}`}
                    assessment={assessment}
                    timeZone={zone}
                    title="LỰA CHỌN KHÁC"
                    busy={busy}
                    onSave={() => void save(assessment)}
                  />
                ))
            : null}
        </View>
        {notice ? (
          <Text accessibilityLiveRegion="polite" style={styles.note}>
            {notice}
          </Text>
        ) : null}
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.heading}>
            Giờ sắp tới đã lưu
          </Text>
          {!model.owner ? (
            <Text style={styles.body}>
              Bạn có thể xem mọi khung giờ. Đăng nhập khi muốn lưu và đồng bộ.
            </Text>
          ) : model.plans.isError ? (
            <NeoButton label="THỬ TẢI LẠI KẾ HOẠCH" onPress={() => void model.plans.refetch()} />
          ) : model.plans.isPending ? (
            <ActivityIndicator />
          ) : (
            <SavedPlanList
              plans={(model.plans.data ?? []).filter((plan) => plan.id !== planId)}
              busy={busy}
              now={now}
              onChange={changeSaved}
            />
          )}
        </View>
      </ScrollView>
      <AccountSheet visible={accountOpen} onClose={() => setAccountOpen(false)} />
      <LocationsSheet
        visible={locationOpen}
        onClose={() => setLocationOpen(false)}
        onRequireAuth={() => {
          setLocationOpen(false);
          setAccountOpen(true);
        }}
      />
    </SafeAreaView>
  );
}
