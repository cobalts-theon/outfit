import { radii, appThemes, homeVisualTokens, neoShadows, spacing, typography } from '@/theme';
import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AnimatedWeatherArtwork } from '@/components/animated-weather-artwork';
import type { CurrentWeather, WeatherCondition } from '@/types/weather';
import {
  getWeatherIconKey,
  getConditionLabel,
  getDaylightLabel,
  getAirQualityLabel,
  getUvLabel,
  type WeatherIconKey,
} from '@/hooks/home';
import { Image } from 'expo-image';

// home-primitives

interface SystemLabelProps {
  readonly index: string;
  readonly label: string;
  readonly value?: string;
}

export function SystemLabel({ label, value }: SystemLabelProps) {
  return (
    <View style={homePrimitivesStyles.systemLabelRow}>
      <View style={homePrimitivesStyles.systemLabelGroup}>
        <Text accessibilityRole="header" style={homePrimitivesStyles.systemLabel}>
          {label}
        </Text>
      </View>
      {value === undefined ? null : (
        <Text style={homePrimitivesStyles.systemValue}>{value.replaceAll(' // ', ' · ')}</Text>
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
        homePrimitivesStyles.section,
        tone === 'deep' && homePrimitivesStyles.sectionDeep,
        elevated && homePrimitivesStyles.sectionElevated,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const homePrimitivesColors = appThemes.light.colors;

const homePrimitivesStyles = StyleSheet.create({
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
    flex: 1,
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
    color: homePrimitivesColors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
    textAlign: 'right',
  },
  section: {
    borderTopWidth: 3,
    borderColor: homePrimitivesColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionDeep: { backgroundColor: homePrimitivesColors.surface },
  sectionElevated: {
    borderWidth: 3,
    borderRadius: radii.control,
    marginHorizontal: spacing.sm,
    marginBottom: 6,
    boxShadow: neoShadows.panel,
  },
});

// static-weather-artwork

interface StaticWeatherArtworkProps {
  readonly assets: WeatherIconAssetPair;
  readonly shadowOffset: number;
  readonly size: number;
}

export function StaticWeatherArtwork({ assets, shadowOffset, size }: StaticWeatherArtworkProps) {
  const recyclingKey = String(assets.static);

  return (
    <View style={staticWeatherArtworkStyles.stage}>
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        recyclingKey={`${recyclingKey}-shadow`}
        source={assets.static}
        style={[
          staticWeatherArtworkStyles.image,
          {
            width: size,
            height: size,
            transform: [{ translateX: shadowOffset }, { translateY: shadowOffset }],
          },
        ]}
        tintColor="#1D3557"
        transition={0}
      />
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        recyclingKey={recyclingKey}
        source={assets.static}
        style={[staticWeatherArtworkStyles.image, { width: size, height: size }]}
        transition={0}
      />
    </View>
  );
}

const staticWeatherArtworkStyles = StyleSheet.create({
  stage: { flex: 1, position: 'relative' },
  image: { position: 'absolute', left: 0, top: 0 },
});

// weather-icon-assets

export interface WeatherIconAssetPair {
  readonly animated: number;
  readonly static: number;
}

export const weatherIconAssets: Readonly<Record<WeatherIconKey, WeatherIconAssetPair>> = {
  sunny: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/sunny.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/day.svg'),
  },
  night: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/night.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/night.svg'),
  },
  partly_cloudy_day: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/cloudy-day-white-cloud.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/cloudy-day-1.svg'),
  },
  partly_cloudy_night: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/cloudy-night-white-cloud.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/cloudy-night-1.svg'),
  },
  cloudy: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/cloudy.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/cloudy.svg'),
  },
  rain_light: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/rainy-less.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/rainy-4.svg'),
  },
  rain: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/rainy-medium.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/rainy-5.svg'),
  },
  rain_heavy: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/rainy-hard.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/rainy-6.svg'),
  },
  thunder: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/thunder.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/thunder.svg'),
  },
  snow_light: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/snowy-1.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/snowy-1.svg'),
  },
  snow: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/snowy-5.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/snowy-5.svg'),
  },
  snow_heavy: {
    animated: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/snowy-6.svg'),
    static: require('../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/snowy-6.svg'),
  },
};

// weather-glyph

interface WeatherConditionIconProps {
  readonly condition: WeatherCondition;
  readonly isDay: boolean;
  readonly size?: number;
  readonly framed?: boolean;
  readonly animated?: boolean;
}

export function WeatherConditionIcon({
  condition,
  isDay,
  size = 40,
  framed = false,
  animated = false,
}: WeatherConditionIconProps) {
  const assets = weatherIconAssets[getWeatherIconKey(condition, isDay)];
  const shadowOffset = Math.max(3, Math.round(size * 0.055));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        weatherGlyphStyles.iconStage,
        { width: size + shadowOffset, height: size + shadowOffset },
        framed && weatherGlyphStyles.iconStageFramed,
      ]}
    >
      <View pointerEvents="none" style={weatherGlyphStyles.artwork}>
        {animated ? (
          <AnimatedWeatherArtwork assets={assets} shadowOffset={shadowOffset} size={size} />
        ) : (
          <StaticWeatherArtwork assets={assets} shadowOffset={shadowOffset} size={size} />
        )}
      </View>
    </View>
  );
}

interface WeatherGlyphProps {
  readonly weather: CurrentWeather;
  readonly compact?: boolean;
}

export function WeatherGlyph({ weather, compact = false }: WeatherGlyphProps) {
  return (
    <View
      accessibilityLabel={`Biểu tượng thời tiết ${weather.daylight.isDay ? 'ban ngày' : 'ban đêm'}`}
      accessibilityRole="image"
      style={[weatherGlyphStyles.heroFrame, compact && weatherGlyphStyles.heroFrameCompact]}
    >
      <WeatherConditionIcon
        animated
        condition={weather.condition}
        framed
        isDay={weather.daylight.isDay}
        size={compact ? 154 : 178}
      />
    </View>
  );
}

const weatherGlyphStyles = StyleSheet.create({
  iconStage: { position: 'relative', overflow: 'visible' },
  iconStageFramed: { backgroundColor: homeVisualTokens.fieldRaised },
  artwork: { position: 'absolute', inset: 0, backgroundColor: 'transparent' },
  heroFrame: {
    width: 178,
    height: 186,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    backgroundColor: '#D8E2DC',
    overflow: 'hidden',
  },
  heroFrameCompact: { width: 152, height: 164 },
});

// weather-hero

interface WeatherHeroProps {
  readonly weather: CurrentWeather;
  readonly compact?: boolean;
  readonly reflow?: boolean;
}

export function WeatherHero({ weather, compact = false, reflow = false }: WeatherHeroProps) {
  const temperature = Math.round(weather.temperature.valueCelsius);
  const feelsLike = Math.round(weather.temperature.feelsLikeCelsius);
  const conditionLabel = getConditionLabel(weather.condition);
  const daylightLabel = getDaylightLabel(weather.daylight);

  return (
    <View
      accessibilityLabel="Điều kiện hiện tại"
      style={weatherHeroStyles.wrapper}
      testID="weather-hero"
    >
      <View pointerEvents="none" style={weatherHeroStyles.shadow} />
      <View style={weatherHeroStyles.container}>
        <SystemLabel index="00" label="HIỆN TẠI" value={daylightLabel.toUpperCase()} />

        <View
          style={[
            weatherHeroStyles.heroRow,
            compact && weatherHeroStyles.heroRowCompact,
            reflow && weatherHeroStyles.heroRowReflow,
          ]}
        >
          <View style={weatherHeroStyles.reading}>
            <Text
              accessibilityLabel={`${temperature} độ C`}
              adjustsFontSizeToFit
              minimumFontScale={0.74}
              numberOfLines={1}
              style={[
                weatherHeroStyles.temperature,
                compact && weatherHeroStyles.temperatureCompact,
              ]}
            >
              {temperature}
              <Text style={weatherHeroStyles.degree}>°</Text>
            </Text>
            <Text maxFontSizeMultiplier={1.6} style={weatherHeroStyles.condition}>
              {conditionLabel}
            </Text>
            <View style={weatherHeroStyles.feelsRow}>
              <Text style={weatherHeroStyles.feelsLabel}>CẢM NHẬN</Text>
              <Text
                accessibilityLabel={`Cảm nhận như ${feelsLike} độ C`}
                style={weatherHeroStyles.feelsValue}
              >
                {feelsLike}°C
              </Text>
            </View>
          </View>

          <WeatherGlyph compact={compact} weather={weather} />
        </View>
      </View>
    </View>
  );
}

const weatherHeroColors = appThemes.light.colors;

const weatherHeroStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginHorizontal: spacing.sm,
    marginRight: spacing.sm + 7,
    marginBottom: 7,
  },
  shadow: {
    borderRadius: radii.control,
    position: 'absolute',
    top: 7,
    right: -7,
    bottom: -7,
    left: 7,
    backgroundColor: homeVisualTokens.ink,
  },
  container: {
    position: 'relative',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: weatherHeroColors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: homeVisualTokens.field,
    overflow: 'hidden',
  },
  heroRow: {
    minHeight: 188,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  heroRowCompact: { minHeight: 172, gap: spacing.xs },
  heroRowReflow: { minHeight: 320, flexDirection: 'column', alignItems: 'stretch' },
  reading: { flex: 1, minWidth: 0 },
  temperature: {
    color: weatherHeroColors.text,
    fontFamily: typography.temperature,
    fontSize: 88,
    lineHeight: 90,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
  },
  temperatureCompact: { fontSize: 78, lineHeight: 80 },
  degree: { color: homeVisualTokens.technical, fontSize: 38 },
  condition: {
    color: weatherHeroColors.text,
    fontFamily: typography.display,
    fontSize: 21,
    lineHeight: 28,
    textTransform: 'uppercase',
  },
  feelsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  feelsLabel: {
    color: weatherHeroColors.text,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  feelsValue: {
    color: weatherHeroColors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 14,
    lineHeight: 20,
    fontVariant: ['tabular-nums'],
  },
});

// environment-metrics

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
        environmentMetricsStyles.metric,
        stacked && environmentMetricsStyles.metricStacked,
        last && environmentMetricsStyles.metricLast,
        stacked && last && environmentMetricsStyles.metricStackedLast,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          environmentMetricsStyles.metricLabel,
          stacked && environmentMetricsStyles.metricLabelStacked,
        ]}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[
          environmentMetricsStyles.metricValue,
          stacked && environmentMetricsStyles.metricValueStacked,
          unavailable && environmentMetricsStyles.metricUnavailable,
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          environmentMetricsStyles.metricDetail,
          stacked && environmentMetricsStyles.metricDetailStacked,
        ]}
      >
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
      <View
        style={[
          environmentMetricsStyles.metrics,
          stacked && environmentMetricsStyles.metricsStacked,
        ]}
      >
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
        <Text style={environmentMetricsStyles.scaleNote}>
          UV · WHO UVI · AQI · {getAirQualityScaleLabel(airQuality.scale)}
        </Text>
      )}
    </RuledSection>
  );
}

const environmentMetricsColors = appThemes.light.colors;

const environmentMetricsStyles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: environmentMetricsColors.border,
    marginTop: spacing.sm,
    overflow: 'hidden',
    boxShadow: neoShadows.panel,
    marginBottom: 6,
  },
  metricsStacked: { flexDirection: 'column' },
  metric: {
    flex: 1,
    minWidth: 0,
    minHeight: 96,
    justifyContent: 'flex-start',
    gap: spacing.xs,
    borderRightWidth: 2,
    borderColor: environmentMetricsColors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  metricLast: { borderRightWidth: 0 },
  metricStacked: {
    flex: 0,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRightWidth: 0,
    borderBottomWidth: 2,
  },
  metricStackedLast: { borderBottomWidth: 0 },
  metricLabel: {
    minHeight: 16,
    color: environmentMetricsColors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  metricLabelStacked: { width: 54 },
  metricValue: {
    includeFontPadding: false,
    color: environmentMetricsColors.text,
    fontFamily: typography.temperature,
    fontSize: 31,
    lineHeight: 34,
    fontVariant: ['tabular-nums'],
  },
  metricValueStacked: { width: 64 },
  metricUnavailable: { color: homeVisualTokens.unavailable },
  metricDetail: {
    color: environmentMetricsColors.text,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  metricDetailStacked: { flex: 1 },
  scaleNote: {
    color: environmentMetricsColors.textMuted,
    fontFamily: typography.identity,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
});
