import { StyleSheet, Text, View } from 'react-native';

import type { HomeRiskPreview, HomeRiskTone } from '@/features/home/model/home-prototype';
import { appThemes, homeVisualTokens, neoShadows, spacing, typography } from '@/theme/tokens';

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
      style={styles.wrapper}
      testID="risk-advisory"
    >
      <View
        style={[
          styles.container,
          compact && styles.containerCompact,
          { backgroundColor: tone.surface },
        ]}
      >
        <SystemLabel index="01" label="VÌ SAO" value={risk.levelLabel} />
        <View style={styles.signalRow}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.signal, { backgroundColor: tone.signal }]}
          />
          <View style={styles.copy}>
            <Text accessibilityRole="header" style={styles.title}>
              {risk.title}
            </Text>
            <Text style={styles.reason}>{risk.reason}</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <Text style={[styles.actionLabel, { color: homeVisualTokens.ink }]}>CẦN LƯU Ý</Text>
          <Text style={styles.action}>{risk.immediateAction}</Text>
        </View>
      </View>
    </View>
  );
}

const colors = appThemes.light.colors;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginHorizontal: spacing.sm,
  },
  container: {
    position: 'relative',
    borderWidth: 3,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    overflow: 'hidden',
    boxShadow: neoShadows.panel,
  },
  containerCompact: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  signal: {
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: homeVisualTokens.ink,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    maxWidth: 540,
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 21,
    lineHeight: 27,
    textTransform: 'uppercase',
  },
  reason: {
    maxWidth: 600,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionLabel: {
    width: 72,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.8,
  },
  action: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.headingSemibold,
    fontSize: 15,
    lineHeight: 22,
  },
});
