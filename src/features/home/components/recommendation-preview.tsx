import { StyleSheet, Text, View } from 'react-native';

import type { HomeRecommendationPreview } from '@/features/home/model/home-prototype';
import type {
  Recommendation,
  RecommendationEvaluation,
  RecommendationGroup,
  RecommendationInputDimension,
  RecommendationSeverity,
} from '@/features/recommendations/domain/recommendation';
import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

import { RuledSection, SystemLabel } from './home-primitives';

interface RecommendationPreviewProps {
  readonly recommendation: HomeRecommendationPreview;
}

interface RecommendationRowProps {
  readonly label: 'WHAT' | 'WHY' | 'DO';
  readonly value: string;
  readonly emphasized?: boolean;
}

interface LiveRecommendationPanelProps {
  readonly evaluation: RecommendationEvaluation;
}

const groupLabels: Record<RecommendationGroup, string> = {
  weather_alert: 'CẢNH BÁO',
  wellness: 'SỨC KHỎE',
  outdoor: 'NGOÀI TRỜI',
  clothing: 'TRANG PHỤC',
};

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

function RecommendationRow({ label, value, emphasized = false }: RecommendationRowProps) {
  return (
    <View accessibilityLabel={`${label}: ${value}`} style={styles.row}>
      <Text style={[styles.label, emphasized && styles.labelEmphasized]}>{label}</Text>
      <Text style={[styles.value, emphasized && styles.valueEmphasized]}>{value}</Text>
    </View>
  );
}

export function RecommendationPreview({ recommendation }: RecommendationPreviewProps) {
  return (
    <RuledSection accessibilityLabel="Hành động đề xuất mẫu" testID="recommendation-preview" tone="deep">
      <SystemLabel index="03" label="HÀNH ĐỘNG" value="BẢN MẪU // KHÔNG PHẢI LIVE" />
      <View style={styles.rows}>
        <RecommendationRow label="WHAT" value={recommendation.what} />
        <RecommendationRow label="WHY" value={recommendation.why} />
        <RecommendationRow emphasized label="DO" value={recommendation.do} />
      </View>
      <Text style={styles.disclaimer}>
        Gợi ý chung về sức khỏe và an toàn; không phải chẩn đoán hay điều trị y tế.
      </Text>
    </RuledSection>
  );
}

function LiveRecommendationItem({
  index,
  recommendation,
}: {
  readonly index: number;
  readonly recommendation: Recommendation;
}) {
  const severityColor = severityColors[recommendation.severity];

  return (
    <View
      accessibilityLabel={`${groupLabels[recommendation.group]}. ${severityLabels[recommendation.severity]}. ${recommendation.title}. ${recommendation.reason}. Hành động: ${recommendation.action}`}
      style={styles.liveItem}
    >
      <View style={styles.liveMeta}>
        <Text style={styles.liveGroup}>
          {`${String(index + 1).padStart(2, '0')} // ${groupLabels[recommendation.group]}`}
        </Text>
        <Text style={[styles.liveSeverity, { color: severityColor }]}>
          {severityLabels[recommendation.severity]}
        </Text>
      </View>
      <View style={styles.liveRows}>
        <RecommendationRow
          label="WHAT"
          value={`${recommendation.title}. ${recommendation.message}`}
        />
        <RecommendationRow label="WHY" value={recommendation.reason} />
        <RecommendationRow emphasized label="DO" value={recommendation.action} />
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
      testID="live-recommendations"
      tone="deep"
    >
      <SystemLabel
        index="03"
        label="HÀNH ĐỘNG"
        value={isEmpty ? 'RULE ENGINE // KHÔNG CÓ ƯU TIÊN' : `RULE ENGINE // ${recommendations.length} GỢI Ý`}
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
              recommendation={recommendation}
            />
          ))}
        </View>
      )}
      {evaluation.status === 'limited' ? (
        <Text style={styles.limitedNote}>
          DỮ LIỆU THIẾU //{' '}
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

const colors = appThemes.dark.colors;

const styles = StyleSheet.create({
  rows: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  label: {
    width: 44,
    color: colors.textMuted,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 21,
    letterSpacing: 1,
  },
  labelEmphasized: {
    color: homeVisualTokens.technical,
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
    fontFamily: typography.body,
  },
  disclaimer: {
    maxWidth: 580,
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  placeholder: {
    gap: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  placeholderTitle: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 15,
    lineHeight: 22,
  },
  placeholderCopy: {
    maxWidth: 580,
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
  liveList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  liveItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  liveMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  liveGroup: {
    flex: 1,
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.7,
  },
  liveSeverity: {
    flexShrink: 0,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.7,
    textAlign: 'right',
  },
  liveRows: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  limitedNote: {
    color: homeVisualTokens.unavailable,
    fontFamily: typography.identity,
    fontSize: 9,
    lineHeight: 16,
    letterSpacing: 0.45,
    marginTop: spacing.sm,
  },
});
