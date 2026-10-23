/**
 * Các khối xem lời khuyên và bằng chứng; hiển thị mức độ và dữ liệu còn thiếu.
 */
import { Text, View } from 'react-native';
import type { Recommendation, RecommendationEvaluation, RecommendationInputDimension, RecommendationSeverity } from '@/types/weather';
import { type HomeRecommendationPreview } from '@/hooks/home';
import { RuledSection, SystemLabel } from '@/components/home-weather';
import { type ReactNode } from 'react';
import { resolveRecommendationIconPresentation, RecommendationActionIcon } from '@/components/recommendation-icon';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { recommendationPreviewStyles } from '@/css/components/recommendation-preview.styles';
import { severityBadgeStyle, severityColors } from '@/css/components/recommendation-preview.styles';

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

// Lấy nhãn ngắn cho hành động.
function getActionLabel(recommendation: Recommendation) {
  return actionLabels[recommendation.actionKey] ?? 'HÀNH ĐỘNG';
}

const severityLabels: Record<RecommendationSeverity, string> = {
  info: 'THÔNG TIN',
  attention: 'LƯU Ý',
  warning: 'CẢNH BÁO',
  danger: 'NGUY HIỂM',
};

const missingDimensionLabels: Record<RecommendationInputDimension, string> = {
  current_weather: 'thời tiết hiện tại',
  uv: 'UV',
  us_aqi: 'US AQI',
  precipitation: 'mưa hiện tại',
  hourly_forecast: 'dự báo theo giờ',
};

// Hiển thị một dòng lời khuyên.
function RecommendationRow({ label, value, emphasized = false, primaryAction = false }: RecommendationRowProps) {
  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      style={[recommendationPreviewStyles.row, primaryAction ? recommendationPreviewStyles.rowPrimaryAction : null]}
    >
      <Text
        style={[recommendationPreviewStyles.label, emphasized && recommendationPreviewStyles.labelEmphasized]}
      >
        {label}
      </Text>
      <Text
        style={[recommendationPreviewStyles.value, emphasized && recommendationPreviewStyles.valueEmphasized]}
      >
        {value}
      </Text>
    </View>
  );
}

// Hiển thị lời khuyên tóm tắt.
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

// Hiển thị lời khuyên và bằng chứng.
export function LiveRecommendationItem({ index, primary, recommendation, children }: {
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
              style={[recommendationPreviewStyles.liveSeverity, severityBadgeStyle(severityColor)]}
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

// Hiển thị nhóm lời khuyên trực tiếp.
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
