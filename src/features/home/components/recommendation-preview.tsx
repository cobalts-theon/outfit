import { StyleSheet, Text, View } from 'react-native';

import type { HomeRecommendationPreview } from '@/features/home/model/home-prototype';
import { RecommendationActionIcon } from '@/features/recommendations/components/recommendation-action-icon';
import type {
  Recommendation,
  RecommendationEvaluation,
  RecommendationInputDimension,
  RecommendationSeverity,
} from '@/features/recommendations/domain/recommendation';
import { resolveRecommendationIconPresentation } from '@/features/recommendations/presentation/recommendation-icon-assets';
import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

import { RuledSection, SystemLabel } from './home-primitives';

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
      style={[styles.row, primaryAction ? styles.rowPrimaryAction : null]}
    >
      <Text style={[styles.label, emphasized && styles.labelEmphasized]}>{label}</Text>
      <Text style={[styles.value, emphasized && styles.valueEmphasized]}>{value}</Text>
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
      <View style={styles.rows}>
        <RecommendationRow
          emphasized
          label="LÀM"
          primaryAction
          value={recommendation.do}
        />
        <RecommendationRow label="GỢI Ý" value={recommendation.what} />
        <RecommendationRow label="LÝ DO" value={recommendation.why} />
      </View>
      <Text style={styles.disclaimer}>
        Gợi ý chung về sức khỏe và an toàn; không phải chẩn đoán hay điều trị y tế.
      </Text>
    </RuledSection>
  );
}

function LiveRecommendationItem({
  index,
  primary,
  recommendation,
}: {
  readonly index: number;
  readonly primary: boolean;
  readonly recommendation: Recommendation;
}) {
  const severityColor = severityColors[recommendation.severity];
  const actionLabel = getActionLabel(recommendation);
  const iconPresentation = resolveRecommendationIconPresentation(recommendation.actionKey);

  return (
    <View
      accessibilityLabel={`${actionLabel}. ${severityLabels[recommendation.severity]}. ${recommendation.title}. ${recommendation.reason}. Hành động: ${recommendation.action}`}
      style={styles.liveItem}
    >
      <View style={styles.liveHeading}>
        <RecommendationActionIcon actionKey={recommendation.actionKey} primary={primary} />
        <View style={styles.liveMeta}>
          <Text style={styles.liveGroup}>
            {`${String(index + 1).padStart(2, '0')} · ${actionLabel}`}
          </Text>
          <View style={styles.liveDetailRow}>
            <Text style={styles.liveEquipment}>{iconPresentation.detailLabel}</Text>
            <Text style={[styles.liveSeverity, { color: severityColor }]}>
              {severityLabels[recommendation.severity]}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.liveRows}>
        <RecommendationRow
          emphasized
          label="LÀM"
          primaryAction={primary}
          value={recommendation.action}
        />
        <RecommendationRow
          label="GỢI Ý"
          value={`${recommendation.title}. ${recommendation.message}`}
        />
        <RecommendationRow label="LÝ DO" value={recommendation.reason} />
      </View>
    </View>
  );
}

export function LiveRecommendationPanel({
  evaluation,
}: LiveRecommendationPanelProps) {
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
        isEmpty
          ? `${stateTitle}. ${stateCopy}`
          : `${recommendations.length} gợi ý được ưu tiên.`
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
        <View style={styles.placeholder}>
          <Text accessibilityRole="header" style={styles.placeholderTitle}>
            {stateTitle}
          </Text>
          <Text style={styles.placeholderCopy}>{stateCopy}</Text>
        </View>
      ) : (
        <View style={styles.liveList}>
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
        <Text style={styles.limitedNote}>
          DỮ LIỆU THIẾU ·{' '}
          {evaluation.missingDimensions
            .map((dimension) => missingDimensionLabels[dimension])
            .join(' · ')}
        </Text>
      ) : null}
      <Text style={styles.disclaimer}>
        Gợi ý chung về sức khỏe và an toàn; không phải chẩn đoán hay điều trị y tế.
      </Text>
    </RuledSection>
  );
}

const colors = appThemes.light.colors;

const styles = StyleSheet.create({
  rows: {
    borderTopWidth: 2,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderBottomWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  rowPrimaryAction: {
    backgroundColor: homeVisualTokens.sunflower,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  label: {
    width: 72,
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 1,
  },
  labelEmphasized: {
    color: homeVisualTokens.ink,
  },
  value: {
    flex: 1,
    maxWidth: 580,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  valueEmphasized: {
    fontFamily: typography.headingSemibold,
  },
  disclaimer: {
    maxWidth: 580,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  placeholder: {
    gap: spacing.xs,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.border,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  placeholderTitle: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 22,
    lineHeight: 25,
  },
  placeholderCopy: {
    maxWidth: 580,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
  liveList: {
    borderTopWidth: 2,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  liveItem: {
    borderBottomWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  liveHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  liveMeta: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
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
    color: colors.textMuted,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.45,
  },
  liveRows: {
    borderTopWidth: 2,
    borderColor: colors.border,
  },
  limitedNote: {
    color: homeVisualTokens.unavailable,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.45,
    marginTop: spacing.sm,
  },
});
