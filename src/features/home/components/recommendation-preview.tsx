import { StyleSheet, Text, View } from 'react-native';

import type { HomeRecommendationPreview } from '@/features/home/model/home-prototype';
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
      <SystemLabel index="03" label="HÀNH ĐỘNG" value="BẢN MẪU // CHƯA CÓ RULE ENGINE" />
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
});
