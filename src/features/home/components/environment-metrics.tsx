import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { CurrentWeather } from '@/features/weather/domain/current-weather';
import {
  getAirQualityLabel,
  getUvLabel,
} from '@/features/home/model/home-prototype';
import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

import { RuledSection, SystemLabel } from './home-primitives';

interface EnvironmentMetricsProps {
  readonly weather: CurrentWeather;
  readonly source: 'live' | 'fixture';
}

interface MetricProps {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly unavailable?: boolean;
  readonly last?: boolean;
  readonly stacked?: boolean;
}

function getAirQualityScaleLabel(scale: string) {
  if (scale === 'us_aqi') return 'US AQI';
  if (scale === 'european_aqi') return 'EU AQI';
  return scale.replaceAll('_', ' ').toUpperCase();
}

function Metric({
  label,
  value,
  detail,
  unavailable = false,
  last = false,
  stacked = false,
}: MetricProps) {
  return (
    <View
      accessibilityLabel={`${label}: ${unavailable ? 'không có dữ liệu' : `${value}, ${detail}`}`}
      style={[
        styles.metric,
        stacked && styles.metricStacked,
        last && styles.metricLast,
        stacked && last && styles.metricStackedLast,
      ]}
    >
      <Text style={[styles.metricLabel, stacked && styles.metricLabelStacked]}>{label}</Text>
      <Text
        style={[
          styles.metricValue,
          stacked && styles.metricValueStacked,
          unavailable && styles.metricUnavailable,
        ]}
      >
        {value}
      </Text>
      <Text style={[styles.metricDetail, stacked && styles.metricDetailStacked]}>
        {detail}
      </Text>
    </View>
  );
}

export function EnvironmentMetrics({ source, weather }: EnvironmentMetricsProps) {
  const { width, fontScale } = useWindowDimensions();
  const airQuality = weather.airQuality;
  const uv = weather.uv;
  const stacked = width < 360 || fontScale >= 1.35;
  const windSpeedKilometersPerHour = Math.round(weather.wind.speedMetersPerSecond * 3.6);
  const windDirection = weather.wind.direction === undefined ? '' : ` ${weather.wind.direction}`;

  return (
    <RuledSection accessibilityLabel="Các chỉ số môi trường" testID="environment-metrics">
      <SystemLabel
        index="00.B"
        label="CHỈ SỐ HIỆN TẠI"
        value={source === 'live' ? 'TRỰC TIẾP' : 'BẢN MẪU'}
      />
      <View style={[styles.metrics, stacked && styles.metricsStacked]}>
        <Metric
          detail={airQuality === undefined ? 'Chưa có' : getAirQualityLabel(airQuality.category)}
          label="AQI"
          unavailable={airQuality === undefined}
          value={airQuality === undefined ? '—' : String(Math.round(airQuality.index))}
          stacked={stacked}
        />
        <Metric
          detail={uv === undefined ? 'Chưa có' : getUvLabel(uv.category)}
          label="UV"
          unavailable={uv === undefined}
          value={uv === undefined ? '—' : uv.index.toFixed(1)}
          stacked={stacked}
        />
        <Metric
          detail={`km/h${windDirection}`}
          label="GIÓ"
          stacked={stacked}
          value={String(windSpeedKilometersPerHour)}
        />
        <Metric
          detail="Độ ẩm tương đối"
          label="ĐỘ ẨM"
          last
          stacked={stacked}
          value={`${Math.round(weather.humidityPercent)}%`}
        />
      </View>
      {airQuality?.scale === undefined ? null : (
        <Text style={styles.scaleNote}>
          UV // WHO UVI · AQI // {getAirQualityScaleLabel(airQuality.scale)}
        </Text>
      )}
    </RuledSection>
  );
}

const colors = appThemes.dark.colors;

const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  metricsStacked: {
    flexDirection: 'column',
  },
  metric: {
    flex: 1,
    minWidth: 0,
    minHeight: 96,
    justifyContent: 'space-between',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  metricLast: {
    borderRightWidth: 0,
  },
  metricStacked: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRightWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  metricStackedLast: {
    borderBottomWidth: 0,
  },
  metricLabel: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  metricLabelStacked: {
    width: 54,
  },
  metricValue: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 22,
    lineHeight: 30,
    fontVariant: ['tabular-nums'],
  },
  metricValueStacked: {
    width: 64,
  },
  metricUnavailable: {
    color: homeVisualTokens.unavailable,
  },
  metricDetail: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  metricDetailStacked: {
    flex: 1,
  },
  scaleNote: {
    color: colors.textMuted,
    fontFamily: typography.identity,
    fontSize: 9,
    lineHeight: 16,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
});
