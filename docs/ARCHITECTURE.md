# ARCHITECTURE.md

## 1. Architecture goals

The system should be:

- maintainable;
- provider-independent where practical;
- mobile-first;
- secure by default;
- easy to extend with new weather indicators/rules;
- testable at domain boundaries;
- capable of supporting both Mobile App and Web Admin.

---

## 2. High-level system

```text
                         ┌──────────────────────┐
                         │     Weather APIs     │
                         │ OpenWeather/AirVisual│
                         │   or later provider  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │ Provider Adapters      │
                       │ normalize external API │
                       └──────────┬─────────────┘
                                  │
                                  ▼
                       ┌────────────────────────┐
                       │ Weather Domain Model   │
                       └──────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
          ┌───────────────────┐       ┌──────────────────┐
          │ React Native App  │       │ Recommendation   │
          │ current/forecast  │       │ / Rule Engine    │
          └─────────┬─────────┘       └────────┬─────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                         ┌─────────────────┐
                         │    Supabase     │
                         │ DB/Auth/Rules   │
                         │ preferences/etc │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ ReactJS Admin   │
                         │ manage rules    │
                         └─────────────────┘
```

---

## 3. Mobile technology direction

- React Native 0.86 through Expo SDK 57
- TypeScript
- Expo Router with its stable native Stack foundation
- TanStack Query for remote/server state and cache ownership
- Lightweight client state where needed
- Typed Supabase JS client using the generated `Database` type
- React Native safe-area support
- Reanimated for appropriate native animation
- Lottie only where animation adds real product value
- SVG/static assets for compact repeated forecast icons

Exact package choices should be documented in `DECISIONS.md` when installed.

---

## 4. Mobile source organization

Preferred direction:

```text
src/
├── app/                    # Expo Router route modules only
├── application/
│   ├── providers/
│   └── bootstrap/
│
├── navigation/
│
├── components/
│   ├── ui/
│   └── weather/
│
├── features/
│   ├── weather/
│   ├── forecast/
│   ├── air-quality/
│   ├── recommendations/
│   ├── alerts/
│   ├── locations/
│   └── settings/
│
├── services/
│   ├── query/
│   ├── weather/
│   │   ├── providers/
│   │   ├── adapters/
│   │   └── weather-service.ts
│   └── supabase/
│
├── stores/
├── theme/
├── types/
└── utils/
```

Because Expo Router treats files under `src/app` as routes, bootstrap,
provider, service, and feature modules must live outside that directory.

Feature folders may contain:

```text
feature/
├── components/
├── hooks/
├── screens/
├── types/
├── utils/
└── api/
```

Avoid forcing every feature to have every subfolder.

---

## 5. Weather provider boundary

External provider response types are infrastructure types.

They must not become domain/UI contracts.

Use:

```text
HTTP provider response
        ↓
provider-specific parser
        ↓
normalizer/adapter
        ↓
Weather domain model
        ↓
features/UI
```

Example:

```ts
interface WeatherProvider {
  getCurrent(location: Coordinates): Promise<CurrentWeather>;
  getForecast(location: Coordinates): Promise<WeatherForecast>;
}
```

The implementation can change without requiring screen rewrites.

---

### 5.1 Live current + hourly weather application boundary

Phase 3B.2 introduced the application-owned orchestration/query layer under
`src/features/weather/application/`; Phase 3B.3 extends the same boundary with
normalized hourly forecast data:

```text
SelectedAppLocation.coordinates
        ↓
normalized live-query input (coordinates rounded to 3 decimals)
        ↓
TanStack Query live-weather key/cache
        ↓
Forecast current + hourly + daily astronomy ─┐ one Forecast request
Air Quality current ─────────────────────────┤ concurrent provider requests
                                             ↓
Open-Meteo current/hourly/AQ parsers + adapters
        ↓
LiveCurrentWeatherResult { status, weather, hourlyForecast?, issues }
        ↓
Home domain presentation
```

The location capability remains provider-independent and never imports
Open-Meteo. The application boundary selects the temporary live-slice AQI
scale, maps provider/network failures into `LiveWeatherError`, and exposes only
normalized `CurrentWeather`, optional normalized `HourlyForecast`, and
project-owned partial-data issues. One Forecast HTTP response supplies both
domain models without merging their types. The provider parses required
current/daily fields independently from hourly arrays, so malformed or
mismatched hourly data can become an hourly-only issue while valid current
weather remains usable. A failure of the Forecast HTTP request or required
current slice still fails the query. Air Quality remains optional enrichment.

`HourlyForecast` is a separate project-owned ordered collection. Each entry has
an absolute ISO `Z` forecast timestamp, canonical condition, independent
daylight state, explicit Celsius temperature, and optional apparent
temperature, precipitation, wind, and UV. The collection retains a normalized
location with the provider IANA timezone for local labels. Home selects six
near-term entries in its presentation layer; this display limit is not part of
the forecast domain.

The live query uses a ten-minute stale window, refetches stale data through
the existing focus/reconnect runtime, performs no fixed polling, and retries
only transient network/provider/rate-limit failures up to two times.

---

## 6. Domain model direction

Core domain concepts:

```text
Location
CurrentWeather
WeatherCondition
WeatherForecast
HourlyForecast
DailyForecast
Wind
Precipitation
AirQuality
UV
SunData
MoonData
WeatherAlert
Recommendation
```

The domain should represent meaning, not provider payload shape.

---

## 7. Data/state ownership

### Remote/server state

Examples:

- current weather;
- forecast;
- AQI;
- remote user preferences;
- rules;
- saved locations from backend.

Use query/cache behavior.

Responsibilities:

- cache;
- stale time;
- retry;
- refetch;
- deduplication;
- loading/error state.

### Client state

Examples:

- selected tab;
- temporary UI state;
- local unit selection before persistence;
- onboarding state;
- transient modal/sheet state.

Do not copy entire query results into a global client store.

---

## 8. Location architecture

Location is a capability, not a permanent requirement.

Flow:

```text
App starts
  ↓
Check existing permission
  ↓
Allowed ───────────────→ Read coordinates
  │                         ↓
  │                     Weather query
  │
Denied
  ↓
Manual location selection
```

Requirements:

- handle permission unavailable/blocked;
- handle GPS timeout;
- allow manual fallback;
- avoid repeated aggressive permission prompts;
- cache last valid location when appropriate.

---

## 9. Recommendation architecture

The recommendation system should separate:

1. environmental measurements;
2. normalized conditions;
3. rule evaluation;
4. recommendation content;
5. UI presentation.

Conceptually:

```text
Weather/AQI/UV inputs
        ↓
Rule evaluation
        ↓
Triggered recommendations
        ↓
Prioritization
        ↓
Mobile presentation / notification
```

A rule may include:

- category;
- enabled state;
- conditions;
- severity;
- priority;
- recommendation content;
- validity/version metadata.

Avoid embedding all rule thresholds directly inside React Native components.

---

## 10. Supabase responsibilities

Supabase is appropriate for:

- authentication when required;
- user profile/preferences;
- saved locations;
- notification preferences;
- recommendation rules;
- rule content;
- optional recommendation history;
- optional notification history;
- admin authorization.

Do **not** store every weather API response by default.

Only persist weather data when there is a concrete product/analytics/history requirement.

---

## 11. Web Admin boundary

The Admin system should manipulate controlled application configuration, primarily recommendation rules.

It should not share UI code with the mobile app unless there is a deliberate cross-platform library decision.

Potential Admin modules:

```text
Rules
├── list
├── create
├── edit
├── enable/disable
└── preview

Content
├── recommendation text
└── localization later

Audit
└── change metadata/history later
```

---

## 12. Push notification architecture

Notification system has two concerns:

### User preference

Examples:

- severe weather;
- high UV;
- poor AQI;
- heavy rain;
- heat;
- quiet settings.

### Trigger delivery

The eventual triggering mechanism may use:

- scheduled backend jobs;
- Edge Functions;
- provider webhook if available;
- periodic evaluation.

Do not implement notification scheduling architecture prematurely before requirements and provider limits are understood.

---

## 13. Error model

Features should distinguish at least:

- network error;
- provider error;
- rate limit;
- invalid/missing provider data;
- location permission denied;
- location unavailable;
- backend authorization error;
- unexpected application error.

User-facing messages should be understandable and recoverable where possible.

---

## 14. Offline behavior

Minimum offline strategy:

- preserve last successful weather data when reasonable;
- indicate that displayed data may be stale;
- allow navigation to already-loaded content;
- do not falsely present stale data as current;
- gracefully handle Supabase/network unavailability.

---

## 15. Testing direction

### Unit

Prioritize:

- environment validation;
- shared foundation tokens and utilities;
- weather normalization;
- rule evaluation;
- AQI/UV classification;
- formatting;
- date/time/day-night logic.

### Integration

Prioritize:

- provider adapter → domain;
- Supabase repository functions;
- authentication/preferences flow.

### UI/E2E

Prioritize:

- first launch/location permission;
- current-weather Home;
- forecast navigation;
- permission denial/manual location;
- network failure;
- recommendation display.

---

## 16. Performance priorities

- avoid unnecessary full-screen re-renders;
- render long forecast lists efficiently;
- cache remote data appropriately;
- minimize repeated weather API calls;
- avoid loading large animation assets in every list row;
- use static/small icons for repeated hourly/daily forecast items;
- reserve richer animation for the current-weather hero when justified.

---

## 17. Architectural constraints

Do not:

- couple screens directly to external weather schemas;
- duplicate backend secrets in mobile;
- use Supabase service-role credentials in React Native;
- create one giant app-wide store;
- hard-code every rule in presentation components;
- create hundreds of weather combination enums;
- mix admin business logic into mobile presentation code.

---

## 18. Change process

Any durable change to:

- state management;
- weather provider;
- navigation architecture;
- backend platform;
- rule engine model;
- persistence strategy;
- notification infrastructure;

must be recorded in `DECISIONS.md`.
