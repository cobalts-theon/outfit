# WEATHER.md

## 1. Purpose

This document defines the application's internal weather vocabulary and the boundary between external weather APIs and UI/business logic.

The app may receive data from OpenWeatherMap, AirVisual, or another provider in the future.

The application must normalize provider-specific data into a stable internal model.

---

## 2. Core principle

Weather is multidimensional.

Do not model weather as one enormous enum containing every combination.

Instead compose:

```text
condition
+ day/night
+ cloud cover
+ precipitation
+ wind
+ air quality
+ UV
+ visibility
+ temperature
+ alerts
+ sun/moon
```

Example:

```json
{
  "condition": "rain",
  "isDay": false,
  "temperature": 25,
  "feelsLike": 28,
  "cloudCover": 92,
  "windSpeed": 18,
  "windGust": 32,
  "aqi": 74,
  "uvIndex": 0,
  "moonPhase": "waxing_gibbous"
}
```

---

## 3. Internal primary weather conditions

Target approximately **30–35 semantic conditions**.

Suggested canonical set:

### Sky

- `clear`
- `mostly_clear`
- `partly_cloudy`
- `mostly_cloudy`
- `cloudy`
- `overcast`

### Rain

- `drizzle`
- `light_rain`
- `rain`
- `heavy_rain`
- `showers`
- `heavy_showers`
- `freezing_rain`

### Thunder

- `thunderstorm`
- `thunderstorm_rain`
- `severe_thunderstorm`
- `hail`

### Snow/ice

- `sleet`
- `light_snow`
- `snow`
- `heavy_snow`
- `snow_showers`
- `blizzard`

### Reduced visibility/atmosphere

- `mist`
- `fog`
- `haze`
- `smoke`
- `dust`
- `sandstorm`

### Severe/special

- `tropical_storm`
- `hurricane`
- `tornado`

### Fallback

- `unknown`

Do not expand this set for simple combinations such as windy rain or full-moon rain.

---

## 4. Day/night

Day/night is independent:

```ts
type DayPhase =
  | "dawn"
  | "day"
  | "sunset"
  | "twilight"
  | "night";
```

Minimum functional requirement:

```ts
isDay: boolean;
```

Preferred derivation:

- provider day/night field when trustworthy; or
- location-aware sunrise/sunset timestamps.

Use richer day phases only for visual scenes if needed.

---

## 5. Moon phases

Canonical eight-phase model:

```ts
type MoonPhase =
  | "new"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";
```

Moon data:

```ts
interface MoonData {
  phase: MoonPhase;
  illumination?: number; // 0..1
  moonrise?: string;
  moonset?: string;
}
```

Moon phase is primarily visual/informational.

Do not create weather condition names such as `full_moon_rain`.

---

## 6. Weather icon system

### Main weather icon

Use about **30–35 semantic conditions**.

Some conditions have separate day/night visual variants.

Total practical weather visual assets should remain around **50–70**, not hundreds.

### Asset direction

Current preferred direction:

- **Meteocons** for main weather visuals.
- Static SVG or equivalent for compact hourly/daily lists.
- Lottie/animation only for selected hero/current-weather visuals.
- General app controls/icons should use the normal app icon system, not weather illustrations.

### Icon mapping

```text
raw provider code
       ↓
normalizeWeatherCondition()
       ↓
WeatherCondition
       ↓
resolveWeatherIcon(condition, isDay, optional context)
       ↓
asset
```

The UI should never import assets based directly on OpenWeatherMap/AirVisual codes.

---

## 7. Visual composition

For a richer current-weather hero, treat a weather scene as layers:

```text
Sky
├── day
├── dawn
├── sunset
├── twilight
└── night

Celestial
├── sun
├── moon phase
└── stars

Atmosphere
├── clouds
├── fog
├── haze
└── dust

Precipitation
├── drizzle
├── rain
├── snow
└── hail

Effects
├── lightning
└── wind
```

Do not require every layer to be visible.

Example:

Heavy overcast rain at night may not visibly show the moon even if moon data exists.

---

## 8. Temperature model

Recommended fields:

```ts
interface TemperatureData {
  value: number;
  feelsLike: number;
  min?: number;
  max?: number;
  dewPoint?: number;
}
```

Display units are a presentation/user-preference concern.

Normalize internally to a consistent unit.

---

## 9. Wind

Recommended:

```ts
interface Wind {
  speed: number;
  gust?: number;
  degree?: number;
  direction?: WindDirection;
}
```

Canonical directions:

```ts
type WindDirection =
  | "N"
  | "NE"
  | "E"
  | "SE"
  | "S"
  | "SW"
  | "W"
  | "NW";
```

Wind is a metric/dimension.

Do not create main conditions such as `rain_windy`.

Strong wind may become an alert/recommendation trigger.

---

## 10. Precipitation

```ts
type PrecipitationType =
  | "none"
  | "drizzle"
  | "rain"
  | "freezing_rain"
  | "sleet"
  | "snow"
  | "hail";
```

Recommended fields:

```ts
interface Precipitation {
  type: PrecipitationType;
  probability?: number; // 0..1
  amount?: number;
  intensity?: "none" | "light" | "moderate" | "heavy" | "extreme";
}
```

---

## 11. Air quality

Store provider value plus normalized application classification.

Potential pollutants:

```ts
interface AirQuality {
  aqi: number;
  category: AirQualityCategory;
  pm25?: number;
  pm10?: number;
  o3?: number;
  no2?: number;
  so2?: number;
  co?: number;
}
```

AQI classification depends on the selected AQI standard/provider.

**Do not hard-code final AQI thresholds until the application explicitly chooses the AQI standard.**

Record that choice in `DECISIONS.md`.

---

## 12. UV

Recommended:

```ts
interface UVData {
  index: number;
  category: UVCategory;
  maxToday?: number;
}
```

Suggested semantic categories:

- `low`
- `moderate`
- `high`
- `very_high`
- `extreme`

The exact threshold standard should be documented when implemented.

At night, UV should not occupy primary risk space unless there is a specific reason.

---

## 13. Other atmosphere fields

Recommended support where provider data exists:

```ts
humidity: number;
pressure?: number;
visibility?: number;
cloudCover?: number;
dewPoint?: number;
```

These are secondary metrics unless they contribute to an active risk or recommendation.

---

## 14. Sun

```ts
interface SunData {
  sunrise: string;
  sunset: string;
}
```

Use location-correct timestamps.

Do not assume device timezone is always the weather location timezone when supporting remote saved locations.

---

## 15. Alerts

Alerts are separate from the main condition.

```ts
interface WeatherAlert {
  id: string;
  type: string;
  severity: "info" | "watch" | "warning" | "severe" | "extreme";
  title: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  source?: string;
}
```

Example:

```text
condition = rain

alerts:
- heavy-rain warning
- flood warning
- strong-wind warning
```

Do not encode all alerts into the main weather icon.

---

## 16. Forecast model

### Hourly

Recommended:

```ts
interface HourlyForecast {
  time: string;
  condition: WeatherCondition;
  isDay: boolean;
  temperature: number;
  feelsLike?: number;
  precipitationProbability?: number;
  precipitation?: Precipitation;
  wind?: Wind;
  uvIndex?: number;
  aqi?: number;
}
```

### Daily

Recommended:

```ts
interface DailyForecast {
  date: string;
  condition: WeatherCondition;
  minTemperature: number;
  maxTemperature: number;
  precipitationProbability?: number;
  sunrise?: string;
  sunset?: string;
  moon?: MoonData;
}
```

Avoid placing every possible metric in compact forecast rows.

---

## 17. Normalization requirements

Every provider adapter should handle:

- unknown condition code;
- missing optional fields;
- units;
- provider-specific timestamp/timezone;
- day/night mapping;
- null AQI/pollutants;
- unavailable moon data;
- unavailable alerts;
- malformed or partial response.

Never crash the whole Home screen because one optional metric is missing.

---

## 18. Provider strategy

The initial academic/project scope references:

- OpenWeatherMap
- AirVisual

Before production integration, verify which provider is authoritative for each capability.

Possible split:

```text
Weather provider
→ current/hourly/daily/wind/precipitation

Air-quality provider
→ AQI/pollutants
```

If a single provider later supplies all required fields reliably, adapters make migration possible.

---

## 19. Internal type example

```ts
interface CurrentWeather {
  observedAt: string;
  location: WeatherLocation;

  condition: WeatherCondition;
  isDay: boolean;

  temperature: number;
  feelsLike: number;

  humidity: number;
  pressure?: number;
  visibility?: number;
  cloudCover?: number;
  dewPoint?: number;

  wind: Wind;
  precipitation?: Precipitation;

  uv?: UVData;
  airQuality?: AirQuality;

  sun?: SunData;
  moon?: MoonData;

  alerts: WeatherAlert[];
}
```

This domain model is the UI contract, not raw API JSON.
