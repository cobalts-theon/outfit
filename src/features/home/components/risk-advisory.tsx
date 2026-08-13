import { StyleSheet, Text, View } from 'react-native';

import type { HomeRiskPreview, HomeRiskTone } from '@/features/home/model/home-prototype';
import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

import { SystemLabel } from './home-primitives';

interface RiskAdvisoryProps {
  readonly risk: HomeRiskPreview;
  readonly compact?: boolean;
}

const toneColors: Record<HomeRiskTone, { signal: string; surface: string }> = {
  calm: { signal: homeVisualTokens.calm, surface: homeVisualTokens.calmSurface },
  attention: { signal: homeVisualTokens.attention, surface: homeVisualTokens.attentionSurface },
  warning: { signal: homeVisualTokens.warning, surface: homeVisualTokens.warningSurface },
  danger: { signal: homeVisualTokens.danger, surface: homeVisualTokens.dangerSurface },
  unavailable: {
    signal: homeVisualTokens.unavailable,
    surface: homeVisualTokens.unavailableSurface,
  },
};

export function RiskAdvisory({ risk, compact = false }: RiskAdvisoryProps) {
  const tone = toneColors[risk.tone];

  return (
    <View
      accessibilityLabel={`${risk.levelLabel}. ${risk.title}. ${risk.reason}. Hành động: ${risk.immediateAction}`}
      style={[
        styles.container,
        compact && styles.containerCompact,
        { backgroundColor: tone.surface },
      ]}
      testID="risk-advisory"
    >
      <SystemLabel index="01" label="RỦI RO" value={risk.levelLabel} />
      <View style={styles.signalRow}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.signal,
            compact && styles.signalCompact,
            { backgroundColor: tone.signal },
          ]}
        />
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.title}>
            {risk.title}
          </Text>
          <Text style={styles.reason}>{risk.reason}</Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <Text style={[styles.actionLabel, { color: tone.signal }]}>
          {compact ? 'LƯU Ý' : 'LÀM NGAY'}
        </Text>
        <Text style={styles.action}>{risk.immediateAction}</Text>
      </View>
    </View>
  );
}

const colors = appThemes.dark.colors;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    overflow: 'hidden',
  },
  containerCompact: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  signal: {
    width: 6,
    minHeight: 72,
  },
  signalCompact: {
    width: 4,
    minHeight: 54,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    maxWidth: 540,
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 19,
    lineHeight: 27,
  },
  reason: {
    maxWidth: 600,
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionLabel: {
    width: 64,
    fontFamily: typography.identitySemibold,
    fontSize: 10,
    lineHeight: 18,
    letterSpacing: 0.8,
  },
  action: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
});
