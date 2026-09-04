import { StyleSheet, Text, View } from 'react-native';

import type { ForecastDetailItem } from '@/features/forecast/model/forecast-presentation';
import { appThemes, homeVisualTokens, neoShadows, spacing, typography } from '@/theme/tokens';

export function ForecastDetails({ items }: { readonly items: readonly ForecastDetailItem[] }) {
  return (
    <View style={styles.section} testID="forecast-details">
      <View style={styles.headingRow}>
        <Text accessibilityRole="header" style={styles.heading}>
          CHU KỲ & CHI TIẾT
        </Text>
        <Text style={styles.status}>THÔNG TIN PHỤ</Text>
      </View>
      {items.length === 0 ? (
        <Text style={styles.empty}>Chưa có dữ liệu thiên văn hoặc chi tiết khí quyển.</Text>
      ) : (
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.label} style={styles.item}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
              <Text style={styles.note}>{item.note}</Text>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.sourceNote}>
        Thời gian theo múi giờ của vị trí. Pha Mặt Trăng không biểu thị độ sáng.
      </Text>
    </View>
  );
}

const colors = appThemes.light.colors;

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    borderTopWidth: 3,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  headingRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  heading: {
    color: homeVisualTokens.ink,
    fontFamily: typography.display,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 1,
  },
  status: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 3,
    borderColor: colors.border,
    overflow: 'hidden',
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  item: {
    width: '50%',
    minHeight: 112,
    gap: spacing.xxs,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 0.6,
  },
  value: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 21,
    lineHeight: 24,
  },
  note: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 17,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  sourceNote: {
    color: homeVisualTokens.technicalMuted,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 17,
  },
});
