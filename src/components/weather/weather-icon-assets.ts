import type { WeatherIconKey } from '@/features/home/model/weather-glyph-state';

export interface WeatherIconAssetPair {
  readonly animated: number;
  readonly static: number;
}

export const weatherIconAssets: Readonly<Record<WeatherIconKey, WeatherIconAssetPair>> = {
  sunny: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/sunny.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/day.svg'),
  },
  night: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/night.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/night.svg'),
  },
  partly_cloudy_day: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/cloudy-day-white-cloud.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/cloudy-day-1.svg'),
  },
  partly_cloudy_night: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/cloudy-night-white-cloud.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/cloudy-night-1.svg'),
  },
  cloudy: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/cloudy.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/cloudy.svg'),
  },
  rain_light: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/rainy-less.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/rainy-4.svg'),
  },
  rain: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/rainy-medium.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/rainy-5.svg'),
  },
  rain_heavy: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/rainy-hard.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/rainy-6.svg'),
  },
  thunder: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/thunder.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/thunder.svg'),
  },
  snow_light: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/snowy-1.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/snowy-1.svg'),
  },
  snow: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/snowy-5.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/snowy-5.svg'),
  },
  snow_heavy: {
    animated: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/animated/snowy-6.svg'),
    static: require('../../../assets/weather.icon/amcharts_weather_icons_1.0.0/static/snowy-6.svg'),
  },
};
