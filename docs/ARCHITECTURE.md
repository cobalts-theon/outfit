# ARCHITECTURE.md

## 1. Architecture goals

The system should be:

- maintainable;
- provider-independent where practical;
- mobile-first;
- secure by default;
- easy to extend with new weather indicators/rules;
- testable at domain boundaries;
- operated through Supabase Dashboard, with the mobile app as the user surface.

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
                         │ Supabase Studio │
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

The application has 50 TypeScript source files in 11 directories including src
(ADR-049). This includes Expo routes, the web-specific artwork implementation
and generated database types. Tests remain outside src.

Screens compose named components from 14 grouped UI files. Each group retains
its original component functions and styles; grouping does not flatten the UI
into one render function. The before-start route owns its small screen directly.

Context owns app startup, authentication, location and notifications. The three
hook modules coordinate account, Home and Plans. Services group account data,
location, plans, notifications and live weather, while four weather files keep
requests, response parsing, adapters and transport understandable. Five utility
modules retain validation, planning, presentation and recommendation rules.
The README contains the exact folder counts and a guide to editing each part.

Related declarations share files; colliding local names use descriptive prefixes.
Imports and native/web module resolution follow the new names. Generated database
types, persistence keys, query keys, API requests, UI and business rules retain
their original contents or behavior. Tests mock SQLite installation and WebView
because grouped modules now import those native dependencies in Node.

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

### 5.1 Live current + hourly + daily weather application boundary

Phase 3B.2 introduced the application-owned orchestration/query layer under
`src/services/live-weather.ts` and `src/services/live-weather.ts`; Phases 3B.3 and 4 extend the same boundary
with normalized hourly and daily forecast data:

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
Open-Meteo current/hourly/daily/AQ parsers + adapters
        ↓
LiveCurrentWeatherResult { status, weather, hourlyForecast?, dailyForecast?, issues }
        ↓
Home preview/recommendations + Forecast presentation
```

The location capability remains provider-independent and never imports
Open-Meteo. The application boundary selects the temporary live-slice AQI
scale, maps provider/network failures into `LiveWeatherError`, and exposes only
normalized `CurrentWeather`, optional normalized `HourlyForecast`, optional
normalized `DailyForecast`, and project-owned partial-data issues. One Forecast
HTTP response supplies all three domain models without merging their types.
The provider parses current, hourly, and daily slices independently, so a
malformed optional collection becomes a collection-specific issue while valid
slices remain usable. A failure of the Forecast HTTP request or required
current slice still fails the query. Air Quality remains optional enrichment.

`HourlyForecast` is a separate project-owned ordered collection. Each entry has
an absolute ISO `Z` forecast timestamp, canonical condition, independent
daylight state, explicit Celsius temperature, and optional apparent
temperature, precipitation, wind, and UV. The collection retains a normalized
location with the provider IANA timezone for local labels. Home selects six
near-term entries in its presentation layer; this display limit is not part of
the forecast domain.

`DailyForecast` is a separate ordered collection keyed by local forecast date.
Every entry requires a canonical condition and minimum/maximum Celsius values;
precipitation probability/amount, UV maximum, sunrise/sunset, and moon-cycle
data remain optional. Forecast presentation selects seven daily entries and
keeps visibility, pressure, and astronomy below primary temperature and
precipitation information.

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
  │                         ├──────────────→ Weather query
  │                         └──────────────→ Reverse geocode once
  │                                              ↓
  │                                      Customer place label
  │
Denied
  ↓
Manual location search → geocoding adapter → normalized candidate
  ↓
SelectedAppLocation(source = manual) → Weather query
  ↓
Optional authenticated save → Supabase saved_locations
```

Requirements:

- handle permission unavailable/blocked;
- handle GPS timeout;
- allow manual fallback;
- avoid repeated aggressive permission prompts;
- cache last valid location when appropriate.
- resolve a concise district/city label after successful device acquisition;
- bound reverse-geocoding work with a timeout and keep valid coordinates usable
  when the platform geocoder is unavailable;
- keep raw coordinates and IANA timezone values in domain/provider data rather
  than using them as primary customer-facing location labels.
- keep Open-Meteo Geocoding DTOs inside their provider adapter; UI consumes
  only normalized manual-location candidates;
- on Android, prefer the system forward geocoder only when foreground location
  permission is already granted; never prompt for GPS merely to search, and
  keep Open-Meteo Geocoding as the permission-independent remote path;
- allow guests to search/select a remote location, requiring authentication
  only when persisting or synchronizing a saved location.

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

## 11. Dashboard operations and activity plans

Supabase Dashboard is the operational surface; no separate Web Admin is in scope.
The live multi-activity planner uses the pure `assessActivity` evaluator with
normalized hourly weather and timestamp-keyed US AQI. It requires full hourly
coverage, checks freshness, uses destination-local time, and does not rank unsafe
or unknown windows. The legacy walking evaluator/policy parser remains separately
tested; the current planner does not fetch the unused `walking_policies` release.

`useActivityPlanner` owns location, forecast and account-plan queries/mutations.
`usePlansScreen` owns selection, comparisons, save validation and reminder opt-in.
Saved-plan rescheduling refreshes evidence and updates the same owned row with
concurrency guards. Checklist and reminder preferences remain per plan.

Product routes require authentication. Existing guest storage and its original
storage key remain compatible; authenticated failures never fall back to it.
No feedback UI or feedback queries remain. Historical feedback columns/tables
and generated database types are retained without schema changes.

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

### Do now recommendations

`src/utils/recommendations.ts` composes normalized rule output with
current destination-local daypart wording; clock-only routine advice is omitted. Home omits weather-derived advice
when its data is stale. `DailyActionPanel` renders the existing SVGs, action
heading and reason, highlighting the first priority recommendation.
`ConditionsSummary` provides brief context; `UpcomingGuidance` presents activity
preparation derived from fresh future forecast samples. Home collapses the
large weather display, metrics and forecast until explicitly expanded.
It does not read completion storage or expose task/reminder controls.
Automatic notification events carry no task IDs. Provider startup retires old
manual reminders and actionable weather schedules; normal weather sync replaces
the latter without task buttons. Legacy storage is left intact but does not
control recommendation visibility. Remote push infrastructure remains separate.

## Onboarding personalization

Auth signup marks initial setup pending. Home observes authenticated metadata
and opens a separate LifestyleOnboarding modal. Account retains an inline edit
form; shared selection fields have a two-step mode only inside the welcome modal.
The auth data repository validates and saves preferences through updateUser;
USER_UPDATED refreshes the existing AuthProvider state. No parallel preference
cache or database table is introduced. A pure personalization step runs after
weather-derived daily actions and uses the selected location’s current daypart.
Unconfigured, guest and missing/invalid preference states retain generic advice.

Current onboarding navigation: Home observes the new-account marker, closes
Account and pushes /before-start once per user per Home session. The dedicated
route guards authentication and returns Home after save/defer. LifestyleSetup
shares fields with Account; only the route uses its three-step presentation.
The previous LifestyleOnboarding modal has been removed.

## Email OTP account flow

AccountSheet opens EmailOtpForm after password signup requiring confirmation,
on an unconfirmed-email password-login error, or through the forgotten-password action.
The data repository owns calls to Supabase Auth. The existing AuthProvider
subscription accepts the resulting session and Home starts initial setup only
after sign-in. Recovery uses a separate nonpersistent client, verifies a recovery
code, then updates the password; it never publishes its session to AuthProvider.
The user returns to password login after success. Email/code/password drafts are component state, never persisted or logged.

## Authentication route boundary

RootNavigator uses Stack.Protected: auth is available while signed out; index,
forecast, plans and before-start require signed_in. Session restoration renders
a loading view before routes, preventing a Home flash. Notification navigation
waits for authentication. Auth renders WelcomeScreen first; choosing Register or Login opens AccountSheet
in page presentation with a back action to welcome, reusing signup, email
confirmation and password recovery. RLS
remains the server boundary; the route guard controls access to app screens.

## Activity advisor and plan monitor

activity-advisor is a pure evaluator over normalized PlanningHour values. It
checks continuous hourly coverage for the whole duration, data freshness,
activity-specific preferences, official alert overlap and missing AQI/UV.
Scores never promote hazardous/unknown periods into ranked suggestions.
PlansScreen reuses location/forecast queries and account plan persistence.
PlanMonitor runs under Auth/Notification providers, fetches each saved plan's
coordinates through QueryClient, evaluates current risk against saved baseline,
and serializes local notification scheduling/cancellation. It refreshes every
five foreground minutes/on app return; it is not a background service.
Recommendation priority comes from weather rules and explicit lifestyle
preferences. Activity choices retain the order declared by `ACTIVITIES`.
Feedback-based suppression/ranking and inaccurate-report cache invalidation have
been removed; manual forecast refresh remains available.

## Upcoming plans and rescheduling — 2026-09-15

Upcoming/detail queries live under the account activity-plans query prefix, so
save/change/reschedule invalidates Home and detail together. Upcoming queries
select the nearest future planned row directly, without the history limit, and
refresh every 30 seconds. Home hides elapsed rows immediately using its clock.
useSavedPlanForecast reuses normalized weather/AQI queries at saved coordinates.
Details render fresh preparation, with saved preparation as an explicit fallback.
Rescheduling refetches weather/AQI before reevaluating the chosen start. The
repository updates the same row with owner/status/original interval/checklist
filters; stale or conflicting writes do not create a replacement. Retained
checks intersect the new checklist. Existing reminder settings are not overwritten.
Local scheduling cancels the previous trigger before replacing it; a new start
less than 15 minutes away cancels the obsolete reminder without scheduling a
past trigger. Persisted scheduling state supports retries without duplicate
alerts. Notification planId and Home navigation open the owned plan at page top.

## Presentation boundaries — 2026-10-19

HomeScreen composes UI; useHomeModel owns live weather, daily actions and local
notification synchronization. home-presentation contains reusable view types and
labels, while home/fixtures contains visual scenarios and the disclosed fallback.
AccountSheet delegates requests to useAccountModel and renders AccountAuthForm or
AccountProfile. LocationsSheet delegates to useLocationsModel and composes search
results and saved-location panels. Shared time selection and reduced-motion
handling live under components/ui. Network/provider validation and public routes
remain unchanged.


## Environmental recommendation scope — 2026-10-22 (ADR-053)

This section supersedes earlier account-required routes and full plan-lifecycle
presentation. Home, Forecast and Plans are public; before-start remains protected.
Root keeps the session restoration loading state, and private queries/mutations
require an authenticated owner. Guest assessment never reads legacy guest plans
or silently saves to local guest storage. Login is requested inline when saving.

Plans are presented as saved future hours with evidence, local reminder opt-in
and a reversible cancel action. Completion, deletion/history, rescheduling and
checkbox preparation are removed from the UI. Existing database rows, grants,
RLS and repository compatibility remain unchanged. Three visible activity types
retain legacy outing/shopping IDs for old data. New policy variants encode the
selected transport/exposure as activity-v2:<transport>:<exposure> in the existing
policy_version, so monitors reevaluate using the saved exposure rather than later
profile changes; old versions retain conservative legacy defaults.

Profile images and picker hooks are retired; stored assets remain untouched.
Onboarding availability is optional and initializes the hour chooser after auth
restoration. Home separates precautions from optional opportunities and keeps all
warning/danger recommendations visible. Fixture data never generates live advice.
Forecast presents daylight/visibility evidence, omitting Moon phase and pressure.


## Weather context and avatar restoration — ADR-054

Restore avatar helpers/hooks/UI inside services/account.ts, hooks/account.ts and
components/account.tsx; no additional production source modules. Four explicit
activity IDs reuse the existing schema. Work/school travel remains distinct from
outing, with evaluation limited to the selected location rather than an entire
route. Home requests the full recommendation set before daypart/personalization
filtering, so hidden opportunities cannot remove unrelated precautions. Ordinary
clothing advice uses measured temperatures; nighttime wording never invents a
work/school schedule. Weather queries refresh every ten foreground minutes.


### Expo Go local delivery (ADR-057)

The notification service chooses the project channel for actual builds and the
host default for Expo Go Android. Recommendation and saved-plan persistence record
that choice, repairing previously scheduled messages when it changes. Permission
checks precede immediate tests. Saved-plan reminders use a future date or one
immediate presentation if already within the 15-minute reminder period. This does
not introduce a server sender or background weather-fetching loop.
