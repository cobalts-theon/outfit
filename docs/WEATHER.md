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

- Local **amCharts Weather Icons 1.0.0** assets for main weather visuals, with
  bundled CC BY 4.0 license and attribution preserved.
- Cached static SVGs with a hard black offset layer for compact hourly/daily lists.
- One animated SVG surface, containing both color and offset-shadow layers, only
  for selected hero/current-weather visuals; never mount WebViews per list row.
- Reduced-motion mode uses the matching static asset in every context.
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

The initial MVP provider strategy is:

- Open-Meteo Forecast API for current weather, hourly/daily forecast fields,
  UV support, and daily astronomy;
- Open-Meteo Air Quality API for AQI and pollutant concentrations;
- no AirVisual integration for the current MVP;
- no severe-weather alert provider yet.

The provider boundary is:

```text
TanStack Query (future integration)
→ native Fetch
→ Open-Meteo JSON
→ provider-specific runtime parser/DTO
→ Open-Meteo adapter
→ normalized project domain
→ application feature/UI
```

Request construction, DTOs, parsing, WMO mapping, and adaptation live under:

```text
src/services/weather/providers/open-meteo/
```

Provider response shapes and names such as `weather_code`, `temperature_2m`,
and `european_aqi` must not cross that boundary.

### Forecast request contract

Planned location requests use:

- `timezone=auto`;
- `timeformat=unixtime` so adapters can emit unambiguous ISO `Z` timestamps;
- `temperature_unit=celsius`;
- `wind_speed_unit=ms`;
- `precipitation_unit=mm`.

Selected current variables:

```text
temperature_2m, relative_humidity_2m, apparent_temperature, is_day,
precipitation, rain, showers, snowfall, weather_code, cloud_cover,
visibility, pressure_msl, surface_pressure, wind_speed_10m, wind_direction_10m,
wind_gusts_10m
```

Selected hourly variables:

```text
temperature_2m, apparent_temperature,
precipitation_probability, precipitation, rain, showers, snowfall,
weather_code, wind_speed_10m, wind_direction_10m, wind_gusts_10m,
uv_index, is_day
```

Relative humidity, cloud cover, and visibility are intentionally not requested
for the Phase 3B.3 hourly domain because Home `Next` and the currently planned
forecast contract do not consume them.

Selected daily variables:

```text
weather_code, temperature_2m_max, temperature_2m_min,
apparent_temperature_max, apparent_temperature_min, uv_index_max, sunrise,
sunset, moonrise, moonset, moon_phase, precipitation_sum,
precipitation_probability_max, wind_speed_10m_max, wind_gusts_10m_max,
wind_direction_10m_dominant
```

### WMO mapping

One centralized mapper converts Open-Meteo's documented WMO codes into the
existing canonical `WeatherCondition`. It does not expand the domain to mirror
the provider. Unsupported future codes map to `unknown`.

Thunderstorm-with-hail codes keep thunderstorm as the primary condition while
the independent precipitation adapter records hail. Freezing drizzle maps to
the closest existing canonical freezing-precipitation condition. Snow grains
and intensity variants similarly collapse into the existing stable vocabulary.

### Air-quality request contract

Both current and hourly Air Quality requests select:

```text
pm2_5, pm10, carbon_monoxide, nitrogen_dioxide, sulphur_dioxide, ozone,
european_aqi, us_aqi, uv_index
```

The adapter must be called with either `european_aqi` or `us_aqi`. It stores the
chosen raw index and exact scale in `AirQualityReference`. U.S. categories may
map to the existing directly compatible category names. European category
labels are not forced into the U.S.-shaped canonical vocabulary; the numeric
index and `european_aqi` scale remain authoritative.

Pollutant concentrations remain in µg/m³. UV remains an independent
`UVReference`, never an AQI field.

### Astronomy

Open-Meteo supplies `sunrise`, `sunset`, `moonrise`, `moonset`, and
`moon_phase` in daily forecast data. The adapter selects the row corresponding
to the current observation's local date and maps it into `SunData`/`MoonData`.

`moon_phase` is a fraction of the lunar cycle. It maps to the existing
eight-phase model. It is not moon illumination, so `illumination` remains
absent unless a future authoritative field supplies it.

### Unsupported capability

The selected Open-Meteo endpoints do not provide an authoritative severe-alert
feed for `WeatherAlert`. The adapter therefore leaves `alerts` unavailable
rather than reporting a known-empty array. A separate authoritative alert
provider requires a later decision.

No live query, GPS flow, or React component is connected in Phase 2B.

The academic scope's earlier OpenWeatherMap/AirVisual references remain project
history, not the current MVP integration choice.

The split remains:

```text
Open-Meteo Forecast API
→ current/hourly/daily/wind/precipitation

Open-Meteo Air Quality API
→ AQI/pollutants
```

Manual location discovery uses Open-Meteo Geocoding as a separate provider
boundary. Its raw place IDs, administrative fields, and response shape are
adapted into project-owned `ManualLocationCandidate` values before application
state or UI. Selecting a candidate changes only `SelectedAppLocation`; it does
not mutate device GPS or persist movement history.

On Android devices where foreground location permission is already granted,
the application may use Expo Location's system forward geocoder first. This
bounded native fallback exists because older Android networking stacks may not
complete the dedicated Open-Meteo Geocoding host handshake even while Forecast
and Air Quality remain reachable. It never requests permission on behalf of a
manual search; without existing permission, Open-Meteo remains the remote path.
Both providers normalize into the same `ManualLocationCandidate` contract.

### Phase 3B.2 live current composition

The first live application slice now uses narrower provider requests than the
future full-forecast request contract:

- Forecast `current`: the established 15 current-condition variables;
- Forecast `daily`: `sunrise`, `sunset`, `moonrise`, `moonset`, and
  `moon_phase` only;
- Air Quality `current`: PM2.5, PM10, CO, NO2, SO2, ozone, European AQI, U.S.
  AQI, and UV;
- no hourly arrays are requested by this slice.

The application runs Forecast and Air Quality independently and concurrently.
Forecast is required to construct `CurrentWeather`. Air Quality is optional
enrichment: fetch, parse, or adapter failure removes AQI/UV rather than
inventing values, preserves valid weather, and returns an explicit partial
result issue. A valid environmental response that omits AQI or UV also remains
partial. `alerts` stays `undefined` because no authoritative alert request was
made.

Phase 3B.2 uses `us_aqi` as an explicit, configurable application-level default
for this live slice so the existing presentation can show an index and its
compatible category. This is not the final product AQI-standard decision;
`AirQualityReference.scale` remains authoritative and the final choice remains
open.

### Phase 3B.3 normalized hourly composition

The live Forecast request now combines the existing current variables, the 13
selected hourly variables above, and the five current-day astronomy fields.
This is one Forecast HTTP request; `CurrentWeather` and `HourlyForecast` remain
separate normalized domain models. The independent Air Quality current request
still runs concurrently.

```text
Open-Meteo hourly JSON arrays
→ runtime-parsed Open-Meteo hourly DTO
→ Open-Meteo hourly adapter
→ HourlyForecast { location, entries[] }
→ application live-weather result
→ Home near-term presentation subset
```

Each normalized hourly entry contains:

- `forecastAt`: absolute ISO 8601 timestamp with `Z`;
- canonical `WeatherCondition` via the single WMO mapper;
- independent `DaylightState` from `is_day`;
- Celsius temperature and optional apparent temperature;
- optional normalized `Precipitation`, including probability converted from
  provider percent to the domain's `0..1` ratio;
- optional normalized `Wind` and `UVReference`.

The collection preserves the IANA timezone returned for `timezone=auto` so UI
labels can cross local day boundaries without interpreting ambiguous local
datetime strings. Hourly timestamps must be strictly chronological. Every
present provider array must match the `time` array length. Missing optional
arrays or null values stay unavailable; required timestamp, temperature,
weather-code, or daylight values invalidate the hourly collection.

Hourly failure is secondary to valid current weather. A malformed hourly array,
array-length mismatch, or absent hourly block produces an explicit
`hourly_forecast` issue and omits `HourlyForecast`; it does not erase a valid
`CurrentWeather`. A failed Forecast HTTP request or malformed required current
slice remains a complete query failure. UV may still come from a valid Forecast
hour when Air Quality fails; AQI remains unavailable in that case.

### Phase 4 normalized daily and detailed forecast composition

Phase 4 keeps the same one-request Forecast transport and adds a distinct
`DailyForecast` domain model. The live query contract is versioned as `v3` so
older cached current/hourly-only results cannot be mistaken for the extended
shape.

```text
Open-Meteo daily JSON arrays
→ independently parsed daily DTO
→ Open-Meteo daily adapter
→ DailyForecast { location, entries[] }
→ Forecast seven-day presentation
```

Every normalized daily entry requires a provider local-date timestamp,
canonical condition, and minimum/maximum Celsius values. Precipitation maximum
probability is converted to the domain `0..1` ratio; precipitation sum remains
millimeters. UV maximum, sunrise/sunset, moonrise/moonset, and moon phase are
optional and omitted when unavailable. Moon illumination is never inferred
from the cycle fraction.

Daily parsing and adaptation degrade independently from current and hourly
data. Invalid daily chronology, units, lengths, or required values produce a
`daily_forecast` issue and omit only `DailyForecast`. Likewise, an hourly-only
failure does not remove valid current or daily values. UI presentation never
fills timestamp gaps or missing readings with generated values.

Open-Meteo may encode due north as either `0` or the equivalent boundary value
`360`. The provider adapter accepts `0..360`, normalizes `360` to the domain's
canonical `0`, and continues to reject values outside that provider range.

The detailed Forecast route consumes only normalized data. It shows 24 relevant
hourly entries, seven daily entries, current visibility and sea-level/surface
pressure where present, and the current day's authoritative astronomy values.
Home retains its six-entry `Now + Next` presentation subset.

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


## Walking forecast input — 2026-09-08

Walking planning reuses normalized hourly weather and separately requests three
days of `us_aqi` from Open-Meteo Air Quality with Unix timestamps. The provider
boundary validates units and chronological timestamps, omits missing/negative
AQI and joins by absolute ISO timestamp. Raw provider arrays never reach UI.
The evaluator requires feels-like temperature, UV, rain probability, wind,
gusts and AQI at every needed hour, including the end forecast. Missing fields
or stale data prevent a recommendation for that window. Official alerts remain
an unsupported upstream capability; the walking feature does not invent them.


## Time-aware guidance and custom availability — 2026-09-10

Daypart advice uses normalized future hourly samples in the destination timezone.
The displayed interval is restricted to user availability and the supplied sample
range. It never substitutes current AQI for hourly AQI. Missing fields are named;
weather-specific advice can remain useful without establishing walking eligibility.

Walking intervals include the exact requested start minute and quarter-hour
alternatives. All bounding hourly samples are checked conservatively, including
the endpoint; sub-hour interpolation is not presented as measured data. Expired
availability and too-short duration have separate messages from missing coverage.
Nighttime samples no longer automatically fail eligibility; a proposed interval
containing darkness explicitly requires adequate route lighting and visibility.

Saved-plan preparation and rescheduling use the saved destination's normalized
hourly forecast and hourly AQI. Missing/stale evidence remains unknown rather
than favorable. Rescheduling requires a successful weather refresh and a fresh
evaluation across the original duration; AQI failures prevent exercise options.
The original start is excluded before ranking alternative non-overlapping windows.
Free hours are user-selected, initialized only from actual saved preferences.


## Weather-first daily wording — 2026-10-22 (ADR-054)

Keep measurement evidence mandatory. Ordinary temperature values between existing
cold/hot clothing branches support low-priority adjustable-clothing guidance,
without inferring AQI/UV quality or a dry outdoor window. From 22:00–04:59 in the
selected location, wording refers to rest/comfort and keeps those measurements.
A clock alone does not create advice; actual hazards outrank ordinary comfort.
Interests and free-time metadata never create work/school departure schedules.
Tomorrow-specific recommendations require tomorrow's forecast or an explicit plan.
