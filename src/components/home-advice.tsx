/**
 * Hiển thị lời khuyên cần làm ngay, bằng chứng và thay đổi sắp tới trên Home.
 * Cho phép mở rộng nội dung và chuyển sang bước chọn giờ hoạt động.
 */
import { visibleDailyActions } from '@/utils/recommendations';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { NeoBadge, NeoButton } from '@/components/controls';
import type { CurrentWeather } from '@/types/weather';
import { getConditionLabel } from '@/hooks/home';
import type { DailyAction, UpcomingAction } from '@/utils/recommendations';
import { RuledSection, SystemLabel } from '@/components/home-weather';
import { useState } from 'react';
import { RecommendationActionIcon } from '@/components/recommendation-icon';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { activityPlanningButtonStyles, conditionsSummaryStyles, dailyActionPanelStyles, upcomingGuidanceStyles } from '@/css/components/home-advice.styles';
import { actionSurfaceStyle } from '@/css/components/home-advice.styles';

export * from '@/components/recommendation-icon';

// activity-planning-button

// Mở phần chọn giờ hoạt động.
export function ActivityPlanningButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={activityPlanningButtonStyles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Khi nào phù hợp để ra ngoài? Chọn hoạt động và tìm giờ phù hợp"
        onPress={onPress}
        style={({ pressed }) => [activityPlanningButtonStyles.button, pressed && activityPlanningButtonStyles.pressed]}
      >
        <RecommendationActionIcon compact actionKey="outdoor-activity-window" />
        <View style={activityPlanningButtonStyles.copy}>
          <Text style={activityPlanningButtonStyles.title}>Khi nào phù hợp để ra ngoài?</Text>
          <Text style={activityPlanningButtonStyles.subtitle}>
            Xem khung giờ và lý do từ chỉ số môi trường
          </Text>
        </View>
        <Text accessible={false} style={activityPlanningButtonStyles.arrow}>
          →
        </Text>
      </Pressable>
    </View>
  );
}

// conditions-summary

// Tóm tắt thời tiết đang xem.
export function ConditionsSummary({ weather, location, period, source, onChooseLocation }: {
  weather: CurrentWeather;
  location: string;
  period: string;
  source: string;
  onChooseLocation: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Đổi địa điểm. ${location}. ${source}`}
      onPress={onChooseLocation}
      style={conditionsSummaryStyles.summary}
    >
      <View style={conditionsSummaryStyles.heading}>
        <Text style={conditionsSummaryStyles.location}>{location}</Text>
        <NeoBadge label={period} />
      </View>
      <Text style={conditionsSummaryStyles.conditions}>
        {Math.round(weather.temperature.valueCelsius)}° · {getConditionLabel(weather.condition)} ·
        Cảm nhận {Math.round(weather.temperature.feelsLikeCelsius)}°
      </Text>
      <Text style={conditionsSummaryStyles.source}>{source}</Text>
    </Pressable>
  );
}

// daily-action-panel

// Hiển thị các hành động được gợi ý.
export function DailyActionPanel({ actions, period, notice, onRefresh, refreshing = false }: {
  actions: readonly DailyAction[];
  period: string;
  notice?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const { fontScale, width } = useWindowDimensions();
  const reflow = fontScale >= 1.35 || width < 340;
  const [expanded, setExpanded] = useState(false);
  // Nhận diện gợi ý hoạt động tùy chọn.
  const opportunity = (action: DailyAction) =>
    !action.urgent &&
    !['warning', 'danger'].includes(action.recommendation?.severity ?? '') &&
    (action.key.startsWith('outdoor-') || action.key.includes('laundry'));
  const grouped = visibleDailyActions(actions, expanded);
  const hiddenCount = actions.length - grouped.length;
  return (
    <RuledSection
      elevated
      tone="deep"
      testID="live-recommendations"
      accessibilityLabel="Nên làm ngay"
    >
      <SystemLabel index="03" label="NÊN LÀM NGAY" value={period} />
      <View style={dailyActionPanelStyles.list}>
        {grouped.map((action, index) => {
          const priority = index === 0 && !opportunity(action);
          const severity = action.recommendation?.severity ?? (action.urgent ? 'warning' : 'info');
          const reason =
            !expanded && !priority && severity === 'info'
              ? (action.recommendation?.action ?? action.reason)
              : action.reason;
          return (
            <View key={action.id}>
              {opportunity(action) && (index === 0 || !opportunity(grouped[index - 1])) ? (
                <SystemLabel index="04" label="CÓ THỂ LÀM NẾU CẦN" />
              ) : null}
              <View
                style={[dailyActionPanelStyles.item, priority && dailyActionPanelStyles.priority, actionSurfaceStyle(severity, opportunity(action), priority)]}
              >
                {severity !== 'info' ? (
                  <NeoBadge
                    label={
                      severity === 'danger'
                        ? 'NGUY HIỂM'
                        : severity === 'warning'
                          ? 'CẢNH BÁO'
                          : 'CẦN LƯU Ý'
                    }
                    tone={severity === 'danger' || severity === 'warning' ? 'orange' : 'neutral'}
                  />
                ) : null}
                <View
                  style={[dailyActionPanelStyles.heading, reflow && dailyActionPanelStyles.headingStacked]}
                >
                  <RecommendationActionIcon
                    actionKey={action.key}
                    compact={!priority}
                    primary={priority}
                  />
                  <View style={dailyActionPanelStyles.headingCopy}>
                    <Text
                      accessibilityRole="header"
                      style={[dailyActionPanelStyles.title, !priority && dailyActionPanelStyles.compactTitle]}
                    >
                      {action.title}
                    </Text>
                  </View>
                </View>
                <Text style={dailyActionPanelStyles.reason}>
                  {reason.replace('Điều kiện hiện tại được chuẩn hóa là ', 'Hiện có ')}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      {hiddenCount > 0 || expanded || grouped.length > 1 ? (
        <NeoButton
          tone="neutral"
          label={
            expanded ? 'THU GỌN' : hiddenCount > 0 ? `XEM THÊM ${hiddenCount} GỢI Ý` : 'XEM CĂN CỨ'
          }
          onPress={() => setExpanded((value) => !value)}
        />
      ) : null}
      {actions.length === 0 && !notice ? (
        <Text style={dailyActionPanelStyles.note}>
          Các chỉ số hiện có chưa kích hoạt khuyến nghị cụ thể. Kiểm tra lại khi điều kiện thay đổi.
        </Text>
      ) : null}
      {notice ? <Text style={dailyActionPanelStyles.note}>{notice}</Text> : null}
      {!actions.length && onRefresh ? (
        <NeoButton
          tone="neutral"
          disabled={refreshing}
          label={refreshing ? 'ĐANG CẬP NHẬT…' : 'CẬP NHẬT CHỈ SỐ'}
          onPress={onRefresh}
        />
      ) : null}
    </RuledSection>
  );
}

export * from '@/components/recommendation-preview';

// upcoming-guidance

// Hiển thị lời nhắc cho thay đổi sắp tới.
export function UpcomingGuidance({ actions }: { actions: readonly UpcomingAction[] }) {
  if (!actions.length) return null;
  return (
    <RuledSection testID="upcoming-guidance">
      <SystemLabel index="04" label="SẮP XẾP VÀI GIỜ TỚI" />
      {actions.map((action) => (
        <View key={action.at} style={upcomingGuidanceStyles.item}>
          <NeoBadge label={action.at} />
          <Text style={upcomingGuidanceStyles.title}>{action.title}</Text>
          <Text style={upcomingGuidanceStyles.reason}>{action.reason}</Text>
        </View>
      ))}
    </RuledSection>
  );
}
