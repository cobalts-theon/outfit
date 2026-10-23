/**
 * Các phần hiển thị thời tiết hiện tại: hình thời tiết, chỉ số môi trường và icon.
 * Nội dung sử dụng kiểu dữ liệu nội bộ thay vì mã riêng của nhà cung cấp.
 */
import type { PropsWithChildren } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { AnimatedWeatherArtwork } from '@/components/animated-weather-artwork';
import type { CurrentWeather, WeatherCondition } from '@/types/weather';
import { getWeatherIconKey, getConditionLabel, getDaylightLabel, getAirQualityLabel, getUvLabel, type WeatherIconKey } from '@/hooks/home';
import { Image } from 'expo-image';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { homePrimitivesStyles, staticWeatherArtworkStyles, weatherGlyphStyles, weatherHeroStyles, environmentMetricsStyles } from '@/css/components/home-weather.styles';
import { artworkShadowStyle, artworkSizeStyle, artworkStageStyle } from '@/css/components/home-weather.styles';

// home-primitives

interface SystemLabelProps {
  readonly index: string;
  readonly label: string;
  readonly value?: string;
}

// Hiển thị nhãn tiêu đề của một phần.
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

// Tạo khung nội dung có đường viền.
export function RuledSection({ children, testID, accessibilityLabel, tone = 'default', elevated = false }: RuledSectionProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[homePrimitivesStyles.section, tone === 'deep' && homePrimitivesStyles.sectionDeep, elevated && homePrimitivesStyles.sectionElevated]}
      testID={testID}
    >
      {children}
    </View>
  );
}

// static-weather-artwork

interface StaticWeatherArtworkProps {
  readonly assets: WeatherIconAssetPair;
  readonly shadowOffset: number;
  readonly size: number;
}

// Hiển thị hình thời tiết tĩnh.
export function StaticWeatherArtwork({ assets, shadowOffset, size }: StaticWeatherArtworkProps) {
  const recyclingKey = String(assets.static);

  return (
    <View style={staticWeatherArtworkStyles.stage}>
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        recyclingKey={`${recyclingKey}-shadow`}
        source={assets.static}
        style={[staticWeatherArtworkStyles.image, artworkShadowStyle(size, shadowOffset)]}
        tintColor="#1D3557"
        transition={0}
      />
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        recyclingKey={recyclingKey}
        source={assets.static}
        style={[staticWeatherArtworkStyles.image, artworkSizeStyle(size)]}
        transition={0}
      />
    </View>
  );
}

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

// Chọn icon theo điều kiện thời tiết.
export function WeatherConditionIcon({ condition, isDay, size = 40, framed = false, animated = false }: WeatherConditionIconProps) {
  const assets = weatherIconAssets[getWeatherIconKey(condition, isDay)];
  const shadowOffset = Math.max(3, Math.round(size * 0.055));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[weatherGlyphStyles.iconStage, artworkStageStyle(size, shadowOffset), framed && weatherGlyphStyles.iconStageFramed]}
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

// Hiển thị hình thời tiết theo kích thước.
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

// weather-hero

interface WeatherHeroProps {
  readonly weather: CurrentWeather;
  readonly compact?: boolean;
  readonly reflow?: boolean;
}

// Hiển thị thời tiết chính và nhiệt độ.
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
          style={[weatherHeroStyles.heroRow, compact && weatherHeroStyles.heroRowCompact, reflow && weatherHeroStyles.heroRowReflow]}
        >
          <View style={weatherHeroStyles.reading}>
            <Text
              accessibilityLabel={`${temperature} độ C`}
              adjustsFontSizeToFit
              minimumFontScale={0.74}
              numberOfLines={1}
              style={[weatherHeroStyles.temperature, compact && weatherHeroStyles.temperatureCompact]}
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

// Lấy nhãn thang đo chất lượng không khí.
function getAirQualityScaleLabel(scale: string) {
  if (scale === 'us_aqi') return 'US AQI';
  if (scale === 'european_aqi') return 'EU AQI';
  return scale.replaceAll('_', ' ').toUpperCase();
}

// Hiển thị một chỉ số môi trường.
function Metric({ label, value, detail, unavailable = false, last = false, stacked = false }: MetricProps) {
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
        style={[environmentMetricsStyles.metricLabel, stacked && environmentMetricsStyles.metricLabelStacked]}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[environmentMetricsStyles.metricValue, stacked && environmentMetricsStyles.metricValueStacked, unavailable && environmentMetricsStyles.metricUnavailable]}
      >
        {value}
      </Text>
      <Text
        style={[environmentMetricsStyles.metricDetail, stacked && environmentMetricsStyles.metricDetailStacked]}
      >
        {detail}
      </Text>
    </View>
  );
}

// Hiển thị nhóm chỉ số môi trường.
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
        style={[environmentMetricsStyles.metrics, stacked && environmentMetricsStyles.metricsStacked]}
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
