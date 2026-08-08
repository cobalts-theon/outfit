import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

interface SystemLabelProps {
  readonly index: string;
  readonly label: string;
  readonly value?: string;
}

export function SystemLabel({ index, label, value }: SystemLabelProps) {
  return (
    <View style={styles.systemLabelRow}>
      <Text accessibilityRole="header" style={styles.systemLabel}>
        {index} // {label}
      </Text>
      {value === undefined ? null : <Text style={styles.systemValue}>{value}</Text>}
    </View>
  );
}

interface RuledSectionProps extends PropsWithChildren {
  readonly testID?: string;
  readonly accessibilityLabel?: string;
  readonly tone?: 'default' | 'deep';
}

export function RuledSection({
  children,
  testID,
  accessibilityLabel,
  tone = 'default',
}: RuledSectionProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[styles.section, tone === 'deep' && styles.sectionDeep]}
      testID={testID}
    >
      {children}
    </View>
  );
}

interface DitherLayerProps extends Pick<ViewProps, 'style'> {
  readonly dense?: boolean;
}

const DITHER_DOTS = Array.from({ length: 42 }, (_, index) => index);

export function DitherLayer({ dense = false, style }: DitherLayerProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.dither, style]}
    >
      {DITHER_DOTS.map((dot) => (
        <View
          key={dot}
          style={[
            styles.ditherDot,
            dense && styles.ditherDotDense,
            dot % 5 === 0 && styles.ditherDotFaint,
          ]}
        />
      ))}
    </View>
  );
}

const colors = appThemes.dark.colors;

const styles = StyleSheet.create({
  systemLabelRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  systemLabel: {
    flexShrink: 1,
    color: homeVisualTokens.technical,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1,
  },
  systemValue: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.7,
    textAlign: 'right',
  },
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  sectionDeep: {
    backgroundColor: homeVisualTokens.fieldDeep,
  },
  dither: {
    position: 'absolute',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    width: 92,
    opacity: 0.58,
  },
  ditherDot: {
    width: 2,
    height: 2,
    backgroundColor: homeVisualTokens.technicalMuted,
  },
  ditherDotDense: {
    width: 3,
    height: 3,
  },
  ditherDotFaint: {
    opacity: 0.35,
  },
});
