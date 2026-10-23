import { visibleDailyActions } from '@/utils/recommendations';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { homeVisualTokens, spacing, typography, appThemes, neoShadows, radii } from '@/theme';
import { NeoBadge, NeoButton } from '@/components/controls';
import type {
  CurrentWeather,
  Recommendation,
  RecommendationEvaluation,
  RecommendationInputDimension,
  RecommendationSeverity,
} from '@/types/weather';
import { getConditionLabel, type HomeRecommendationPreview } from '@/hooks/home';
import type { DailyAction, UpcomingAction } from '@/utils/recommendations';
import { RuledSection, SystemLabel } from '@/components/home-weather';
import { useState, type ReactNode } from 'react';
import { Image } from 'expo-image';

// recommendation-action-icon

export type RecommendationIconKey =
  | 'shelter'
  | 'air-quality'
  | 'hanger'
  | 'shirt'
  | 't-shirt'
  | 'winter-layer'
  | 'shoes'
  | 'temperature-high'
  | 'temperature-low'
  | 'umbrella';

export const recommendationIconAssets: Readonly<Record<RecommendationIconKey, number>> = {
  shelter: require('../../assets/recommendation-icons/shelter.svg'),
  'air-quality': require('../../assets/recommendation-icons/air-quality.svg'),
  hanger: require('../../assets/weather-cloths/accessories-clothes-clothing-fashion-hangger-svgrepo-com.svg'),
  shirt: require('../../assets/weather-cloths/clothes-dress-fashion-man-shirt-svgrepo-com.svg'),
  't-shirt': require('../../assets/weather-cloths/cloth-clothes-clothing-neck-shirt-svgrepo-com.svg'),
  'winter-layer': require('../../assets/weather-cloths/clothes-fashion-shal-snowflake-winter-svgrepo-com.svg'),
  shoes: require('../../assets/weather-cloths/shoes-svgrepo-com.svg'),
  'temperature-high': require('../../assets/weather-cloths/temperature-high-svgrepo-com.svg'),
  'temperature-low': require('../../assets/weather-cloths/temperature-low-svgrepo-com.svg'),
  umbrella: require('../../assets/weather-cloths/umbrella-svgrepo-com.svg'),
};

export interface RecommendationIconPresentation {
  readonly iconKeys: readonly RecommendationIconKey[];
  readonly detailLabel: string;
}

const actionIconPresentations: Readonly<Record<string, RecommendationIconPresentation>> = {
  'morning-bag': { iconKeys: ['shirt'], detailLabel: 'CHUẨN BỊ BUỔI SÁNG' },
  'noon-break': { iconKeys: ['shelter'], detailLabel: 'NGHỈ TRƯA' },
  'afternoon-errands': { iconKeys: ['shoes'], detailLabel: 'VIỆC BUỔI CHIỀU' },
  'evening-prepare': { iconKeys: ['shirt'], detailLabel: 'CHUẨN BỊ NGÀY MAI' },
  'night-rest': { iconKeys: ['shelter'], detailLabel: 'NGHỈ NGƠI' },
  'weather-shelter': { iconKeys: ['shelter'], detailLabel: 'NƠI TRÚ AN TOÀN' },
  'air-quality-exposure': { iconKeys: ['air-quality'], detailLabel: 'GIẢM PHƠI NHIỄM' },
  'rain-protection': { iconKeys: ['umbrella', 'shoes'], detailLabel: 'Ô · GIÀY BÁM TỐT' },
  'dry-laundry': { iconKeys: ['hanger'], detailLabel: 'GIẶT PHƠI KHI CẦN' },
  'protect-laundry': { iconKeys: ['hanger', 'umbrella'], detailLabel: 'MÓC ÁO · CHỖ CÓ MÁI' },
  'sun-heat-protection': { iconKeys: ['temperature-high'], detailLabel: 'CHỐNG NẮNG · GIẢM NÓNG' },
  'sun-protection': { iconKeys: ['temperature-high'], detailLabel: 'CHE NẮNG · GIẢM PHƠI NẮNG' },
  'heat-hydration': { iconKeys: ['temperature-high'], detailLabel: 'BÙ NƯỚC · GIẢM NÓNG' },
  'indoor-comfort': { iconKeys: ['shelter'], detailLabel: 'CHỖ NGỒI · CHỖ NGHỈ' },
  'damp-care': { iconKeys: ['umbrella'], detailLabel: 'ĐỒ ƯỚT · CHỖ NGHỈ' },
  'dry-air-care': { iconKeys: ['shelter'], detailLabel: 'KHÔNG KHÍ KHÔ' },
  'light-clothing': { iconKeys: ['t-shirt', 'shirt'], detailLabel: 'ÁO NHẸ · DỄ ĐIỀU CHỈNH' },
  'warm-clothing': {
    iconKeys: ['temperature-low', 'winter-layer'],
    detailLabel: 'LỚP GIỮ ẤM · CHE CHẮN',
  },
  'outdoor-adjustment': { iconKeys: ['shoes'], detailLabel: 'ĐIỀU CHỈNH VẬN ĐỘNG' },
  'outdoor-activity-window': { iconKeys: ['shoes'], detailLabel: 'ĐI BỘ · VẬN ĐỘNG NHẸ' },
};

const fallbackPresentation: RecommendationIconPresentation = {
  iconKeys: ['shoes'],
  detailLabel: 'HÀNH ĐỘNG NGOÀI TRỜI',
};

export function resolveRecommendationIconPresentation(
  actionKey: string,
): RecommendationIconPresentation {
  return actionIconPresentations[actionKey] ?? fallbackPresentation;
}

interface RecommendationActionIconProps {
  readonly actionKey: string;
  readonly primary?: boolean;
  readonly compact?: boolean;
}

export function RecommendationActionIcon({
  actionKey,
  primary = false,
  compact = false,
}: RecommendationActionIconProps) {
  const presentation = resolveRecommendationIconPresentation(actionKey);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={recommendationActionIconStyles.group}
    >
      {(compact ? presentation.iconKeys.slice(0, 1) : presentation.iconKeys).map(
        (iconKey, index) => (
          <View
            key={iconKey}
            style={[
              recommendationActionIconStyles.frame,
              compact && recommendationActionIconStyles.compactFrame,
              primary && index === 0 ? recommendationActionIconStyles.framePrimary : null,
            ]}
          >
            <Image
              contentFit="contain"
              source={recommendationIconAssets[iconKey]}
              style={[
                recommendationActionIconStyles.image,
                compact && recommendationActionIconStyles.compactImage,
              ]}
            />
          </View>
        ),
      )}
    </View>
  );
}

const recommendationActionIconColors = appThemes.light.colors;

const recommendationActionIconStyles = StyleSheet.create({
  group: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  frame: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: recommendationActionIconColors.border,
    backgroundColor: recommendationActionIconColors.surface,
  },
  compactFrame: { width: 34, height: 34, borderWidth: 2 },
  compactImage: { width: 25, height: 25 },
  framePrimary: { backgroundColor: homeVisualTokens.sunflower },
  image: { width: 36, height: 36 },
});

// activity-planning-button

export function ActivityPlanningButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={activityPlanningButtonStyles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Khi nào phù hợp để ra ngoài? Chọn hoạt động và tìm giờ phù hợp"
        onPress={onPress}
        style={({ pressed }) => [
          activityPlanningButtonStyles.button,
          pressed && activityPlanningButtonStyles.pressed,
        ]}
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

const activityPlanningButtonStyles = StyleSheet.create({
  container: { marginHorizontal: spacing.md, paddingRight: 4, paddingBottom: 4 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 76,
    padding: 12,
    backgroundColor: homeVisualTokens.mint,
    borderWidth: 3,
    borderColor: homeVisualTokens.ink,
    borderRadius: 12,
    boxShadow: '4px 4px 0px #1D3557',
  },
  pressed: { transform: [{ translateX: 3 }, { translateY: 3 }], boxShadow: '1px 1px 0px #1D3557' },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  title: {
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 22,
    color: homeVisualTokens.ink,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 17,
    color: homeVisualTokens.ink,
  },
  arrow: { fontFamily: typography.heading, fontSize: 22, color: homeVisualTokens.ink },
});

// conditions-summary

export function ConditionsSummary({
  weather,
  location,
  period,
  source,
  onChooseLocation,
}: {
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

const conditionsSummaryColors = appThemes.light.colors;

const conditionsSummaryStyles = StyleSheet.create({
  summary: {
    marginHorizontal: spacing.sm,
    marginRight: spacing.sm + 4,
    marginBottom: 4,
    padding: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: conditionsSummaryColors.border,
    backgroundColor: conditionsSummaryColors.surface,
    boxShadow: neoShadows.control,
    gap: spacing.xxs,
  },
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  location: {
    fontFamily: typography.heading,
    color: conditionsSummaryColors.text,
    fontSize: 17,
    lineHeight: 23,
    flexShrink: 1,
  },
  conditions: {
    fontFamily: typography.body,
    color: conditionsSummaryColors.text,
    fontSize: 12,
    lineHeight: 19,
  },
  source: {
    fontFamily: typography.body,
    color: conditionsSummaryColors.text,
    fontSize: 10,
    lineHeight: 16,
  },
});

// daily-action-panel

export function DailyActionPanel({
  actions,
  period,
  notice,
  onRefresh,
  refreshing = false,
}: {
  actions: readonly DailyAction[];
  period: string;
  notice?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const { fontScale, width } = useWindowDimensions();
  const reflow = fontScale >= 1.35 || width < 340;
  const [expanded, setExpanded] = useState(false);
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
          const surface =
            severity === 'danger'
              ? homeVisualTokens.dangerSurface
              : severity === 'warning'
                ? homeVisualTokens.warningSurface
                : severity === 'attention'
                  ? homeVisualTokens.attentionSurface
                  : opportunity(action)
                    ? homeVisualTokens.field
                    : priority
                      ? homeVisualTokens.sunflower
                      : homeVisualTokens.field;
          return (
            <View key={action.id}>
              {opportunity(action) && (index === 0 || !opportunity(grouped[index - 1])) ? (
                <SystemLabel index="04" label="CÓ THỂ LÀM NẾU CẦN" />
              ) : null}
              <View
                style={[
                  dailyActionPanelStyles.item,
                  priority && dailyActionPanelStyles.priority,
                  { backgroundColor: surface },
                ]}
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
                  style={[
                    dailyActionPanelStyles.heading,
                    reflow && dailyActionPanelStyles.headingStacked,
                  ]}
                >
                  <RecommendationActionIcon
                    actionKey={action.key}
                    compact={!priority}
                    primary={priority}
                  />
                  <View style={dailyActionPanelStyles.headingCopy}>
                    <Text
                      accessibilityRole="header"
                      style={[
                        dailyActionPanelStyles.title,
                        !priority && dailyActionPanelStyles.compactTitle,
                      ]}
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

const dailyActionPanelColors = appThemes.light.colors;

const dailyActionPanelStyles = StyleSheet.create({
  secondaryHeading: {
    fontFamily: typography.identitySemibold,
    color: dailyActionPanelColors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  list: { marginTop: spacing.sm },
  item: {
    borderTopWidth: 2,
    borderColor: dailyActionPanelColors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  priority: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headingStacked: { flexDirection: 'column', alignItems: 'flex-start' },
  headingCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  title: {
    fontFamily: typography.heading,
    color: dailyActionPanelColors.text,
    fontSize: 18,
    lineHeight: 25,
  },
  compactTitle: { fontSize: 15, lineHeight: 22 },
  reason: {
    fontFamily: typography.body,
    color: dailyActionPanelColors.text,
    fontSize: 13,
    lineHeight: 21,
  },
  note: {
    fontFamily: typography.body,
    color: dailyActionPanelColors.textMuted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
});

// recommendation-preview

interface RecommendationPreviewProps {
  readonly recommendation: HomeRecommendationPreview;
}

interface RecommendationRowProps {
  readonly label: 'GỢI Ý' | 'LÝ DO' | 'LÀM';
  readonly value: string;
  readonly emphasized?: boolean;
  readonly primaryAction?: boolean;
}

interface LiveRecommendationPanelProps {
  readonly evaluation: RecommendationEvaluation;
}

const actionLabels: Readonly<Record<string, string>> = {
  'weather-shelter': 'TRÚ ẨN',
  'air-quality-exposure': 'KHÔNG KHÍ',
  'rain-protection': 'CHỐNG MƯA',
  'protect-laundry': 'SINH HOẠT',
  'sun-heat-protection': 'NẮNG & NHIỆT',
  'sun-protection': 'CHỐNG NẮNG',
  'heat-hydration': 'BÙ NƯỚC',
  'light-clothing': 'ĐỒ THOÁNG',
  'warm-clothing': 'GIỮ ẤM',
  'outdoor-activity-window': 'RA NGOÀI',
};

function getActionLabel(recommendation: Recommendation) {
  return actionLabels[recommendation.actionKey] ?? 'HÀNH ĐỘNG';
}

const severityLabels: Record<RecommendationSeverity, string> = {
  info: 'THÔNG TIN',
  attention: 'LƯU Ý',
  warning: 'CẢNH BÁO',
  danger: 'NGUY HIỂM',
};

const severityColors: Record<RecommendationSeverity, string> = {
  info: homeVisualTokens.calm,
  attention: homeVisualTokens.attention,
  warning: homeVisualTokens.warning,
  danger: homeVisualTokens.danger,
};

const missingDimensionLabels: Record<RecommendationInputDimension, string> = {
  current_weather: 'thời tiết hiện tại',
  uv: 'UV',
  us_aqi: 'US AQI',
  precipitation: 'mưa hiện tại',
  hourly_forecast: 'dự báo theo giờ',
};

function RecommendationRow({
  label,
  value,
  emphasized = false,
  primaryAction = false,
}: RecommendationRowProps) {
  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      style={[
        recommendationPreviewStyles.row,
        primaryAction ? recommendationPreviewStyles.rowPrimaryAction : null,
      ]}
    >
      <Text
        style={[
          recommendationPreviewStyles.label,
          emphasized && recommendationPreviewStyles.labelEmphasized,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          recommendationPreviewStyles.value,
          emphasized && recommendationPreviewStyles.valueEmphasized,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function RecommendationPreview({ recommendation }: RecommendationPreviewProps) {
  return (
    <RuledSection
      accessibilityLabel="Hành động đề xuất mẫu"
      elevated
      testID="recommendation-preview"
      tone="deep"
    >
      <SystemLabel index="03" label="NÊN LÀM NGAY" value="DỮ LIỆU MINH HỌA" />
      <View style={recommendationPreviewStyles.rows}>
        <RecommendationRow emphasized label="LÀM" primaryAction value={recommendation.do} />
        <RecommendationRow label="GỢI Ý" value={recommendation.what} />
        <RecommendationRow label="LÝ DO" value={recommendation.why} />
      </View>
      <Text style={recommendationPreviewStyles.disclaimer}>
        Gợi ý chung về sức khỏe và an toàn; không phải chẩn đoán hay điều trị y tế.
      </Text>
    </RuledSection>
  );
}

export function LiveRecommendationItem({
  index,
  primary,
  recommendation,
  children,
}: {
  readonly index: number;
  readonly primary: boolean;
  readonly recommendation: Recommendation;
  readonly children?: ReactNode;
}) {
  const severityColor = severityColors[recommendation.severity];
  const actionLabel = getActionLabel(recommendation);
  const iconPresentation = resolveRecommendationIconPresentation(recommendation.actionKey);

  return (
    <View
      accessibilityLabel={`${actionLabel}. ${severityLabels[recommendation.severity]}. ${recommendation.title}. ${recommendation.reason}. Hành động: ${recommendation.action}`}
      style={recommendationPreviewStyles.liveItem}
    >
      <View style={recommendationPreviewStyles.liveHeading}>
        <RecommendationActionIcon actionKey={recommendation.actionKey} primary={primary} />
        <View style={recommendationPreviewStyles.liveMeta}>
          <Text style={recommendationPreviewStyles.liveGroup}>
            {`${String(index + 1).padStart(2, '0')} · ${actionLabel}`}
          </Text>
          <View style={recommendationPreviewStyles.liveDetailRow}>
            <Text style={recommendationPreviewStyles.liveEquipment}>
              {iconPresentation.detailLabel}
            </Text>
            <Text
              style={[
                recommendationPreviewStyles.liveSeverity,
                {
                  color: homeVisualTokens.ink,
                  backgroundColor: severityColor,
                  paddingHorizontal: 4,
                },
              ]}
            >
              {severityLabels[recommendation.severity]}
            </Text>
          </View>
        </View>
      </View>
      <View style={recommendationPreviewStyles.liveRows}>
        <RecommendationRow
          emphasized
          label="LÀM"
          primaryAction={primary}
          value={recommendation.action}
        />
        <RecommendationRow label="GỢI Ý" value={recommendation.message} />
        <RecommendationRow label="LÝ DO" value={recommendation.reason} />
      </View>
      {children}
    </View>
  );
}

export function LiveRecommendationPanel({ evaluation }: LiveRecommendationPanelProps) {
  const recommendations = evaluation.recommendations;
  const isEmpty = recommendations.length === 0;
  const stateTitle =
    evaluation.status === 'ready'
      ? 'Chưa có hành động ưu tiên'
      : 'Chưa đủ dữ liệu cho gợi ý đầy đủ';
  const stateCopy =
    evaluation.status === 'ready'
      ? 'Các quy tắc ban đầu chưa phát hiện điều kiện cần thay đổi kế hoạch hoặc trang phục.'
      : 'Rule Engine chỉ dùng số đo đang có và không suy diễn từ UV, US AQI, mưa hoặc dự báo bị trống.';

  return (
    <RuledSection
      accessibilityLabel={`Hành động từ Rule Engine. ${
        isEmpty ? `${stateTitle}. ${stateCopy}` : `${recommendations.length} gợi ý được ưu tiên.`
      }`}
      elevated
      testID="live-recommendations"
      tone="deep"
    >
      <SystemLabel
        index="03"
        label="NÊN LÀM NGAY"
        value={isEmpty ? 'CHƯA CÓ ƯU TIÊN' : `${recommendations.length} ƯU TIÊN`}
      />
      {isEmpty ? (
        <View style={recommendationPreviewStyles.placeholder}>
          <Text accessibilityRole="header" style={recommendationPreviewStyles.placeholderTitle}>
            {stateTitle}
          </Text>
          <Text style={recommendationPreviewStyles.placeholderCopy}>{stateCopy}</Text>
        </View>
      ) : (
        <View style={recommendationPreviewStyles.liveList}>
          {recommendations.map((recommendation, index) => (
            <LiveRecommendationItem
              index={index}
              key={recommendation.actionKey}
              primary={index === 0}
              recommendation={recommendation}
            />
          ))}
        </View>
      )}
      {evaluation.status === 'limited' ? (
        <Text style={recommendationPreviewStyles.limitedNote}>
          DỮ LIỆU THIẾU ·{' '}
          {evaluation.missingDimensions
            .map((dimension) => missingDimensionLabels[dimension])
            .join(' · ')}
        </Text>
      ) : null}
      <Text style={recommendationPreviewStyles.disclaimer}>
        Gợi ý chung về sức khỏe và an toàn; không phải chẩn đoán hay điều trị y tế.
      </Text>
    </RuledSection>
  );
}

const recommendationPreviewColors = appThemes.light.colors;

const recommendationPreviewStyles = StyleSheet.create({
  rows: {
    borderTopWidth: 2,
    borderColor: recommendationPreviewColors.border,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderBottomWidth: 2,
    borderColor: recommendationPreviewColors.border,
    paddingVertical: spacing.md,
  },
  rowPrimaryAction: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  label: {
    width: 72,
    color: recommendationPreviewColors.text,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 1,
  },
  labelEmphasized: { color: homeVisualTokens.ink },
  value: {
    flex: 1,
    maxWidth: 580,
    color: recommendationPreviewColors.text,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  valueEmphasized: { fontFamily: typography.headingSemibold },
  disclaimer: {
    maxWidth: 580,
    color: recommendationPreviewColors.text,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  placeholder: {
    gap: spacing.xs,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: recommendationPreviewColors.border,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  placeholderTitle: {
    color: recommendationPreviewColors.text,
    fontFamily: typography.heading,
    fontSize: 22,
    lineHeight: 25,
  },
  placeholderCopy: {
    maxWidth: 580,
    color: recommendationPreviewColors.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
  liveList: {
    borderTopWidth: 2,
    borderColor: recommendationPreviewColors.border,
    marginTop: spacing.sm,
  },
  liveItem: {
    borderBottomWidth: 2,
    borderColor: recommendationPreviewColors.border,
    paddingVertical: spacing.md,
  },
  liveHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  liveMeta: { flex: 1, minWidth: 0, gap: spacing.xxs },
  liveGroup: {
    color: homeVisualTokens.ink,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.7,
  },
  liveDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  liveSeverity: {
    flexShrink: 0,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
    textAlign: 'right',
  },
  liveEquipment: {
    flex: 1,
    minWidth: 0,
    color: recommendationPreviewColors.textMuted,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.45,
  },
  liveRows: { borderTopWidth: 2, borderColor: recommendationPreviewColors.border },
  limitedNote: {
    color: homeVisualTokens.unavailable,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.45,
    marginTop: spacing.sm,
  },
});

// upcoming-guidance

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

const upcomingGuidanceStyles = StyleSheet.create({
  item: { gap: spacing.xs, paddingTop: spacing.sm },
  title: {
    color: appThemes.light.colors.text,
    fontFamily: typography.heading,
    fontSize: 17,
    lineHeight: 24,
  },
  reason: {
    color: appThemes.light.colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 21,
  },
});
