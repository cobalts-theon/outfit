import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { appThemes, homeVisualTokens, neoShadows, spacing, typography } from '@/theme/tokens';

interface SystemLabelProps {
  readonly index: string;
  readonly label: string;
  readonly value?: string;
}

export function SystemLabel({ label, value }: SystemLabelProps) {
  return (
    <View style={styles.systemLabelRow}>
      <View style={styles.systemLabelGroup}>
        <Text accessibilityRole="header" style={styles.systemLabel}>
          {label}
        </Text>
      </View>
      {value === undefined ? null : (
        <Text style={styles.systemValue}>{value.replaceAll(' // ', ' · ')}</Text>
      )}
    </View>
  );
}

interface RuledSectionProps extends PropsWithChildren {
  readonly testID?: string;
  readonly accessibilityLabel?: string;
  readonly tone?: 'default' | 'deep';
  readonly elevated?: boolean;
}

export function RuledSection({
  children,
  testID,
  accessibilityLabel,
  tone = 'default',
  elevated = false,
}: RuledSectionProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.section,
        tone === 'deep' && styles.sectionDeep,
        elevated && styles.sectionElevated,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const colors = appThemes.light.colors;

const styles = StyleSheet.create({
  systemLabelRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  systemLabelGroup: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  systemLabel: {
    flexShrink: 1,
    color: homeVisualTokens.ink,
    fontFamily: typography.heading,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0.4,
  },
  systemValue: {
    color: colors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
    textAlign: 'right',
  },
  section: {
    borderTopWidth: 3,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  sectionDeep: {
    backgroundColor: homeVisualTokens.fieldDeep,
  },
  sectionElevated: {
    borderWidth: 3,
    marginHorizontal: spacing.sm,
    marginBottom: 6,
    boxShadow: neoShadows.panel,
  },
});
