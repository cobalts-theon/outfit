# PROGRESS.md

## Current milestone

**Account profile images and device notifications implemented**

The mobile application keeps its existing domain, provider, query, location,
recommendation, and navigation behavior while Home now prioritizes customer
guidance through `Now → Action → Why → Next`. The Rule Engine panel follows the
weather hero immediately, its highest-priority `LÀM` row is surfaced first, and
risk becomes the explanation layer. Detailed metrics, GPS controls, and source
status sit below the decision path. The light-only square neo-brutalist system,
role-based Archivo Black/JetBrains Mono/Bebas Neue typography, named place
labels, large bounded weather artwork, and hard structural shadows remain. Home
now adds a Syne masthead, hamburger drawer, account avatar, optional Supabase
email/password auth, and remote place search. Guests can view a searched place;
authenticated users can persist it through owner-scoped `saved_locations`.
Redmi 7 Android review has passed; iOS review remains pending. The Home Action
surface now uses concrete clothing/activity kits from the project-owned
`assets/weather-cloths` SVG set, and opt-in Expo notifications schedule rain,
environmental risk, and attention-level primary actions without duplicate
alerts.

Authenticated users can now choose, crop, replace, and remove a private profile
image. The image is reflected in both the account sheet and masthead avatar,
with initials retained as the loading, empty, and recoverable-error fallback.

---

## Project status

### Completed

- Private account profile images:
  - added the Expo SDK 57 system image picker with square editing and no camera
    or microphone permission;
  - validates common raster formats and a 5 MiB maximum before uploading the
    React Native `ArrayBuffer`;
  - added remote migration `20260902105227_add_private_profile_images_bucket`
    with a private bucket and owner-UUID-folder Storage RLS;
  - stores only the object path in `profiles.avatar_url`, serves one-hour signed
    URLs, removes replaced images, and falls back to account initials;
  - account-sheet choose/change/delete controls expose loading, success, file,
    network, and Storage error states;
  - the new helper tests and strict TypeScript pass; full regression and native
    visual review are tracked below.

- Action icon and device-notification pass:
  - recommendation headings now compose one or two semantic SVGs for the
    actual preparation kit: umbrella/shoes, hanger/cover, temperature-only
    sun/heat protection, light clothing, cold/warm layer, or outdoor footwear;
  - sun/heat/hydration actions no longer repeat a shirt icon; shirt artwork is
    reserved for explicit light-clothing recommendations;
  - clothing and daily-life artwork resolves from `assets/weather-cloths`,
    while AQI and shelter retain their specialist symbols;
  - compact labels explain each icon kit without relying on imagery alone;
  - local notifications cover current/near-term rain, the highest warning or
    danger risk, and one primary attention-level action, with stable signatures
    preventing repeated scheduling after every weather refresh;
  - tapping an app notification returns to Home, and Android uses a dedicated
    high-priority channel plus a valid white 96×96 notification icon in
    development/release builds;
  - device scheduling is serialized across weather refreshes, failed native
    replacements remain retryable, disabling waits for in-flight work before
    cancellation, and permission state is rechecked when the app returns to
    the foreground;
  - Expo Go falls back to its host notification channel when project-owned
    channel creation is unavailable instead of failing the opt-in flow;
  - strict TypeScript, 200 tests across 26 suites, Expo SDK 57 public config,
    Android production export, and physical Redmi 7 visual review passed;
  - Redmi 7 confirmed the local notification was posted at high importance;
    Android correctly suppressed it while Do Not Disturb was active, then
    displayed it after Do Not Disturb was disabled, and tapping it returned to
    Home.
  - authenticated notification opt-in now upserts to the owner-scoped Supabase
    `notification_preferences` table while device permission and native
    schedules remain local; guests retain the existing local-only flow;
  - remote migration `20260902102854_add_notification_preferences`, generated
    TypeScript types, RLS/grants, retry-safe client repository, and repository
    tests are committed with the mobile integration.

- Manual place search hardening and daily-life recommendation expansion:
  - same-query submissions now refetch instead of becoming a no-op;
  - search dismisses the keyboard, exposes timeout/network/rate-limit/provider
    states in Vietnamese, and uses a 20-second bounded remote timeout;
  - Android devices with existing foreground permission use the bounded system
    forward geocoder before Open-Meteo, fixing the reproduced Redmi 7 TLS stall
    without prompting for additional permission;
  - physical Redmi 7 verification passed from `Paris` search result through
    normalized manual selection and a location-driven Home refresh;
  - Rule Engine now recommends protecting outdoor laundry during current or
    near-term rain and suggests light outdoor activity only during a verified
    dry, comfortable, low-UV, good-US-AQI window;
  - near-term rules now start at the first forecast timestamp at or after the
    current observation instead of accidentally evaluating past hours;
  - strict TypeScript, 183 tests across 22 suites, Impeccable detector, Android
    production export, and physical Redmi 7 visual review passed.

- Project topic defined: weather forecasting and user health support.
- Mobile technology direction: React Native.
- Web Admin technology direction: ReactJS.
- Backend direction: Supabase.
- Open-Meteo selected for initial MVP weather, astronomy, AQI, and pollutants;
  earlier OpenWeatherMap/AirVisual references remain historical scope context.
- Real-time GPS requirement identified.
- Rule Engine requirement identified.
- Health and clothing recommendation requirement identified.
- Push notification requirement identified.
- Project-local Agent Skills installed for:
  - React Native;
  - React best practices;
  - composition patterns;
  - Impeccable;
  - Supabase;
  - Supabase/Postgres best practices.
- Optional authentication and remote saved-location flow completed:
  - square sunflower masthead with hamburger left and account avatar right;
  - neobrutalist drawer for Home, Forecast, Locations, and Account;
  - Supabase email/password sign-up, sign-in, sign-out, Expo SQLite session
    persistence, and native AppState token-refresh lifecycle;
  - Open-Meteo Geocoding parser/adapter/query boundary for remote place search;
  - manual `SelectedAppLocation` selection without changing device GPS;
  - guest remote viewing plus authenticated list/save/delete against the
    existing owner-scoped `saved_locations` schema;
  - Syne Regular/ExtraBold restricted to ASCII chrome labels, preserving
    Archivo/JetBrains Mono Vietnamese coverage and Bebas numeric display;
  - strict TypeScript, 176 tests across 21 suites, Android production export,
    and two-pass native Redmi 7 visual review.
- Initial weather-condition/icon architecture defined:
  - normalized internal conditions;
  - day/night separation;
  - moon phases;
  - local amCharts animated/static asset direction.
- Visual identity replaced with **Weather Public Bulletin**:
  - light-only warm-paper canvas;
  - neobrutalist square geometry and thick black rules;
  - structural offset shadows;
  - cobalt, sunflower, mint, and coral/red accents;
  - Vietnamese-capable Archivo Black for poster headings, JetBrains Mono
    Regular/Bold for normal copy and technical labels, and Bebas Neue for
    oversized numeric weather readings;
  - no rounded surfaces or controls;
  - one local animated amCharts SVG surface with synchronized black offset
artwork per current-weather hero, plus cached static forecast-row artwork
and reduced-motion fallbacks;
  - consistent customer-facing depth tokens: 4px interactive control plates,
    compressed pressed states, and 6px grouped panel/table plates while
    individual data cells remain flat for scanability;
  - simplified section and recommendation language without ASCII weather art.
- Weather artwork performance pass completed:
  - current-weather artwork reduced from two WebViews to one WebView containing
    both foreground and black offset layers;
  - repeated hourly/daily weather artwork moved to `expo-image`, eliminating
    per-row WebViews while retaining the square neo-brutalist treatment;
  - image sizing reserves the hard-shadow offset so artwork is not clipped.
- Customer-facing location and hierarchy pass completed:
  - one timeout-bounded reverse-geocode request after successful GPS
    acquisition, with weather/GPS fallback preserved when naming fails;
  - district/city labels replace raw coordinates and `Asia/Ho_Chi_Minh` on
    Home, Forecast, and ready-location surfaces;
  - larger current, hourly, and daily SVG artwork while repeated icons remain
    static and cacheable;
  - Action/recommendation content now has a complete square border and hard
    black panel shadow.
  - native Android capture confirmed the resolved “Đà Nẵng” label without the
    geocoder's numeric street placemark, readable large SVGs, and a two-tier
    daily row that does not vertically fragment the date.
- Recommendation-first Home pass completed:
  - the primary path is now `Now → Action → Why → Next`;
  - the Rule Engine panel follows the current-weather hero instead of appearing
    after GPS, metrics, and forecast surfaces;
  - `LÀM` appears first, with one sunflower emphasis for the highest-priority
    recommendation;
  - the risk panel is reframed as the reason behind the guidance, while
    environmental metrics and technical location/data status remain below the
    decision path.
- Typography/performance verification passed:
  - TypeScript strict check;
  - full 171-test repository suite;
  - Android production export with Archivo Black, Bebas Neue, JetBrains Mono
    Regular/Bold, and the local animated/static weather SVG assets;
  - Impeccable typography detector with no findings;
  - source audit confirms one WebView implementation path and zero WebViews in
    repeated forecast artwork.
- UI implementation workflow now requires visual review when rendering tools are available.
- Existing remote Supabase schema captured as an MCP-derived idempotent
  baseline after the official CLI `db pull` workflow was found impractical in
  the sandbox.
- Remote migration history established for the baseline and two hardening
  migrations.
- Existing four-table schema hardened without adding future tables or changing
  the `recommendation_rules` shape:
  - least-privilege grants;
  - owner-scoped RLS;
  - temporary admin authorization through
    `app_metadata.app_role = "admin"`;
  - integrity constraints and foreign-key delete behavior;
  - supporting ownership, foreign-key, default-location, and active-rule
    indexes.
- `handle_new_user()` hardened with an empty fixed search path and restricted
  execute privileges.
- Hosted Auth signup verified to create exactly one profile row.
- Complete two-user RLS matrix passed, including cross-user denial, admin rule
  CRUD, anonymous denial, and integrity checks.
- Supabase security advisors passed with zero findings.
- Supabase performance advisors passed with zero warnings; only a new-index
  usage INFO notice remains.
- TypeScript database types generated at `src/types/database.ts` after all
  database tests passed.
- Existing Expo SDK 57 starter converted into the Phase 1 mobile foundation
  without recreating the project:
  - stable Expo Router native Stack; unstable native tabs removed;
  - composed safe-area, query/cache, theme, and global-error providers;
  - TanStack Query cache with native focus and connectivity integration;
  - typed Supabase client using generated database types and Expo SQLite
    session persistence;
  - validated `EXPO_PUBLIC_SUPABASE_URL` and publishable-key configuration,
    with secret-key rejection and a boot-safe unconfigured state;
  - light-only design tokens aligned with the current visual direction;
  - Archivo regular/bold/black and Bebas Neue loading through Expo Font;
  - Jest/`jest-expo` test foundation.
- Phase 1 verification passed:
  - TypeScript strict check;
  - 6 foundation unit tests;
  - Expo public configuration resolution;
  - successful Android, iOS, and static web production bundles.
- Provider-independent weather domain foundation implemented:
  - the canonical 33-value `WeatherCondition` vocabulary from `WEATHER.md`;
  - a normalized `CurrentWeather` contract with explicit SI-style units and
    timezone-aware observation/environmental timestamps;
  - independent condition, day/night, moon, precipitation, wind, UV, AQI, and
    alert dimensions;
  - explicit partial-data semantics: an omitted optional dimension is
    unavailable, while values such as precipitation `none` and `alerts: []`
    represent known empty states;
  - adapter-boundary validation for canonical values, physical ranges,
    chronology, time zones, and cross-field consistency, without selecting
    provider-specific UV or AQI thresholds.
- Eleven typed Vietnamese weather fixtures added for clear day, clear night,
  partly cloudy, rainy night, heavy rain, thunderstorm, fog/haze, high UV,
  unhealthy AQI, severe alert, and partial/missing-data scenarios.
- Phase 2A verification passed:
  - TypeScript strict check;
  - 13 weather-domain unit tests covering invariants, canonical conditions,
    optional data, independent environmental dimensions, and invalid values;
  - full 19-test repository suite.
- Open-Meteo provider boundary implemented without changing Phase 2A:
  - centralized Forecast and Air Quality endpoints, exact request variables,
    `timezone=auto`, Unix timestamps, and normalized unit parameters;
  - native Fetch-compatible transport with injected transport support and no
    `openmeteo` NPM dependency;
  - runtime-parsed REST JSON DTOs for current, hourly, daily, AQI, pollutants,
    UV, and astronomy data;
  - centralized documented WMO-code mapping with safe `unknown` fallback;
  - current-weather adaptation for daylight, temperature, precipitation,
    pressure, cloud cover, wind, UV, AQI, pollutants, sun, and moon data;
  - explicit European/U.S. AQI scale selection without a global standard;
  - static provider fixtures and entirely offline adapter tests;
  - severe alerts explicitly left unavailable because the selected endpoints
    do not provide an authoritative alert feed.
- Phase 2B verification passed:
  - TypeScript strict check;
  - 56 Open-Meteo request/parser/adapter/mapping tests;
  - full 75-test repository suite.
- Phase 3A Home visual prototype implemented without changing the weather
  domain or Open-Meteo provider boundary:
  - fixed `Now → Risk → Next → Action` decision path with a restrained
    environment-reading row;
  - normalized current-weather hero with temperature, feels-like, condition,
    daylight, location, and observation time;
  - independently composed geometric day/night, moon phase, wind, AQI
    particulates, cloud, precipitation, storm, visibility, and dither cues
    using domain semantics only;
  - fixture-authored primary risk rail with calm, UV, AQI, rain, storm,
    severe-alert, and unavailable-data treatments;
  - explicit UI-only typed hourly preview, kept separate from
    `CurrentWeather` until a forecast domain contract is introduced;
  - explicit fixture-backed `WHAT / WHY / DO` copy, kept separate from the
    future recommendation rule engine;
  - nine-state in-app prototype selector covering normal, night, high UV,
    unhealthy AQI, rainy night, heavy rain, thunderstorm, severe alert, and
    partial-data scenarios;
  - flat ruled sections, JetBrains Mono identity type, restrained native
    geometric weather imagery, dry semantic fields, and accessibility-hidden
    dither details;
  - full safe-area protection, compact/large-text reflow, native minimum touch
    targets, screen-reader labels, long Vietnamese wrapping, and a stable
    no-motion presentation that inherently respects reduced-motion settings.
- Phase 3A verification passed:
  - TypeScript strict check;
  - 8 new Home presentation/composition tests;
  - full 83-test repository suite;
  - successful Android production bundle including JetBrains Mono assets;
  - static Impeccable detector pass with no findings;
  - independent source-level Impeccable finish review reached `ship` after
    correcting decision-path order, independent scene cues, bottom insets,
    and compact/large-text reflow.
- Android native screenshot review completed on the connected compact WayDroid
  surface (Android 13, 576x1024 at 180 dpi). The live Home hierarchy, safe-area
  handling, Vietnamese wrapping, current-weather hero, horizontal hourly rows,
  and fixture boundary for Action rendered without clipping or a blocking
  visual defect. Physical Android hardware and iOS visual review remain
  separate platform-validation tasks.
- Phase 3B.1 Location Capability implemented without changing Supabase, the
  Open-Meteo boundary, the weather domain, or the Home composition:
  - Expo SDK 57-compatible `expo-location` with a foreground-only config-plugin
    permission explanation;
  - project-owned coordinates, device-position, permission, capability-state,
    and selected-location contracts;
  - explicit idle, permission-checking, permission-required,
    permission-requesting, position-acquiring, ready, permission-denied,
    permission-unavailable, services-unavailable, and acquisition-error states;
  - balanced one-shot position request with a 12-second application timeout;
  - bounded last-known fallback limited to 15 minutes and 5-kilometre accuracy;
  - invalid-coordinate and invalid-timestamp rejection before values reach
    application state;
  - application-owned capability provider, separate from TanStack Query;
  - selected-location boundary supports future `device` and `manual` sources;
  - minimal ruled Home status/action strip for explanation, permission request,
    progress, retry, settings recovery, fallback disclosure, and denial without
    blocking fixture weather;
  - no reverse geocoding, background permission, continuous tracking,
    application-level coordinate persistence, history, Supabase writes, or
    weather requests.
- Phase 3B.1 verification passed:
  - TypeScript strict check;
  - 21 new location domain/service tests with Expo Location fully mocked;
  - full 104-test repository suite;
  - Expo dependency and public native-permission configuration checks;
  - successful Android production bundle;
  - successful Expo development-server bootstrap.
- Phase 3B.2 Live Current Weather + Air Quality integration implemented without
  changing Supabase, the location state machine, or hourly forecast scope:
  - application-owned selected-location → query → provider → adapter → domain
    orchestration boundary;
  - three-decimal coordinate normalization for requests and stable query keys;
  - minimal concurrent Forecast current/astronomy and Air Quality current
    requests, without hourly arrays;
  - required Forecast versus optional environmental composition, with
    project-owned complete, partial, malformed, and transient error semantics;
  - no fabricated AQI/UV zeroes, safe categories, alerts, or moon illumination;
  - explicit configurable `us_aqi` live-slice default while the final product
    AQI standard remains open;
  - ten-minute staleness, focus/reconnect refetch, no polling, and bounded
    transient-only retry;
  - live Home `Now`/environment data with loading, offline-paused, retry,
    partial, stale, and background-refresh-error presentation;
  - explicit fixed fixture boundaries for `Next` and `Action`; live `Risk`
    remains an observation/availability notice rather than a fake rule result.
- Phase 3B.2 verification passed:
  - strict TypeScript check;
  - 17 new automated tests and full 121-test repository suite;
  - Expo SDK 57 dependency check against the locally bundled version map and
    successful public config resolution;
  - successful Android production bundle;
  - successful Expo/Metro development-server boot;
  - fixed-coordinate TP.HCM live smoke through minimal Open-Meteo responses,
    DTO parsing, existing adapters, and application `CurrentWeather`
    composition.
- Phase 3B.3 normalized hourly integration implemented without changing
  Supabase, the location state machine, or recommendation-engine scope:
  - one live Forecast request shared by separate normalized current and hourly
    domain adapters;
  - ordered absolute hourly timestamps with provider IANA timezone context;
  - canonical condition, independent daylight, Celsius temperature, optional
    apparent temperature, precipitation, wind, and UV per hourly entry;
  - independently degradable hourly parsing/adaptation that preserves valid
    current weather and reports an explicit partial-data issue;
  - six-entry near-term Home presentation selected above the domain layer;
  - Home `Next` uses live hourly data when available and never falls back to a
    fixture during a live partial result.
- Phase 3B.3 automated verification passed before native testing:
  - 138/138 Jest tests across 17 suites;
  - strict TypeScript check;
  - Expo SDK 57 public configuration resolution;
  - dependency compatibility against the local SDK 57 bundled map;
  - successful Android production bundle;
  - successful Expo/Metro development-server boot.
- Phase 3B.3 Android native verification passed on ADB device
  `192.168.240.112:5555` (`WayDroid x86_64 Device`, Android 13, Expo Go 57.0.3):
  - Expo Go opened the SDK 57 project and Metro delivered the Android bundle;
  - Android displayed the native foreground-location dialog and granted
    while-in-use fine/coarse permission;
  - the location-disabled state kept Home usable with fixture data and exposed
    a retry action;
  - a temporary Android GPS test provider supplied TP.HCM and Hanoi fixes; the
    WayDroid/Google location stack resolved them through the bounded
    last-known fallback, then the application exposed normalized
    `SelectedAppLocation` coordinates;
  - TP.HCM produced live Open-Meteo current weather, AQI/UV, and a normalized
    six-entry hourly `Next` sequence in `Asia/Ho_Chi_Minh`;
  - changing the test fix to Hanoi changed the rounded query coordinates and
    produced a distinct live current observation, proving location-driven
    query refresh;
  - a live hourly-malformed response exercised the partial-data UI: valid
    current/AQI/UV stayed visible while `Next` became explicitly unavailable;
  - native Home captures are stored under `artifacts/native-verification/`,
    including `gps-after-accuracy-choice.png`, `home-live-next-tphcm.png`, and
    `location-disabled-result.png`;
  - no implementation defect was found and no source fix was required.
- Light neobrutalist redesign implemented without changing product logic
  (historical ordering later superseded by ADR-026):
  - app configuration, splash, status bar, navigation, and error fallback are
    light-only;
  - Home originally used `Now → Risk → Next → Action`, with location failure kept
    compact and non-blocking after the primary decision path;
  - Forecast uses the same visual language and a single truthful location
    recovery state;
  - generated concept imagery remains reference-only; weather artwork ships as
    accessible native geometry composed from normalized domain dimensions;
  - all reviewed user-facing metadata is at least 11 pt and recovery copy is
    plain Vietnamese rather than internal English/error codes;
  - strict TypeScript, 165 Jest tests across 20 suites, Android production
    export, and native WayDroid visual review passed;
  - Impeccable finish review reached `ship` after two focused correction passes.

### Documentation created / updated

- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/WEATHER.md`
- `docs/DESIGN.md`
- `docs/DATABASE.md`
- `docs/DECISIONS.md`
- `docs/PROGRESS.md`

---

## In progress

Profile-image regression and native visual verification are in progress.
Authentication, remote locations, action icon kits, local recommendation notifications, the Weather
Public Bulletin extension, and Android visual review are complete. Hosted
email-confirmation/account testing, remote push infrastructure, and
iOS/platform edge-case verification remain.

---

## Next recommended tasks

### 1. Complete the native platform matrix

Complete the verified location-to-live-weather flow on Android with real GNSS
and perform the visual/behavior pass on iOS. Cover approximate-only permission, user denial,
blocked permission/settings recovery, TalkBack/VoiceOver order, large text,
and the remaining severe-risk/night visual states.

### 2. Verify cache and network edge states natively

Exercise stale-cache display, offline-paused loading, background-refresh error,
and complete Forecast failure on a controllable native network. The live
partial-data path has already been observed on Android.

### 3. Broaden daily-life recommendations without weakening evidence

Add time-window-aware rules for commute timing, laundry drying windows,
hydration, ventilation, exercise, umbrella/rainwear, and outfit layers. Keep
each action explainable from normalized current/hourly inputs and resolve
conflicts through priority. Extend the accepted clothing/activity SVG kit only
when a new action has a concrete customer role.

### 4. Continue the visual review loop

For the Home screen:

```text
research references
→ implement
→ run emulator
→ capture screenshot
→ Impeccable critique
→ fix
→ review again
```

Home is the reference surface for the Weather Public Bulletin visual language.

### First UI validation goals

Validate:

- Archivo Vietnamese readability across guidance, data, navigation, and controls;
- Archivo Black poster hierarchy and Bebas Neue numeric display fit;
- large temperature display;
- technical labels at a native-readable size;
- square outlines and structural shadows without clipping;
- bounded animated hero compatibility, static forecast icon caching, black offset synchronization, and reduced motion;
- day/night scene;
- AQI presentation;
- UV presentation;
- forecast readability;
- recommendation readability;
- Vietnamese text;
- small Android screen behavior.

---

## MVP roadmap

### Phase 1 — App shell

- [x] React Native + TypeScript baseline
- [x] Navigation
- [x] Theme/design tokens
- [x] App providers
- [x] Query/cache layer
- [x] Error handling foundation

### Phase 2 — Weather core

- [x] Location permission (Android WayDroid smoke passed; iOS/physical coverage pending)
- [x] Manual-location fallback and remote search
- [x] GPS acquisition capability (Android test-provider/fallback smoke passed;
  physical GNSS and iOS coverage pending)
- [x] Weather provider interface
- [x] Provider adapter
- [x] Current weather domain model
- [x] Weather normalization tests

### Phase 3 — Home MVP

- [x] Current weather hero (live after selected-location query success)
- [x] Day/night visual (live after selected-location query success)
- [x] Temperature
- [x] Feels like
- [x] Main condition
- [x] Wind
- [x] AQI
- [x] UV
- [x] Hourly preview (live normalized `HourlyForecast` after query success)
- [x] Loading/error/offline-aware current-weather states

### Phase 4 — Forecast

- [ ] Hourly forecast screen/detail
- [ ] Daily forecast
- [ ] Precipitation
- [ ] Sunrise/sunset
- [ ] Moon phase
- [ ] Visibility/pressure as secondary details

### Phase 5 — Recommendations

- [x] Recommendation domain model
- [x] UV rules
- [x] AQI rules
- [x] Heat rules
- [x] Rain and laundry-protection rules
- [x] Clothing rules
- [x] Positive outdoor-window rule
- [x] Prioritization
- [x] Explanation/reason display
- [ ] Time-window planner and conflict-aware daily routine bundles
- [ ] Consistent vector pictograms for clothing and daily-life actions

### Phase 6 — Supabase

- [x] Existing remote project/schema baseline
- [x] Temporary admin authorization decision
- [x] Profiles schema and auth trigger hardening
- [x] Saved locations schema hardening
- [x] Mobile email/password authentication
- [x] Mobile saved-location list/save/delete integration
- [x] Private profile-image Storage and mobile editing
- [x] Notification preferences
- [x] Existing recommendation rules access hardening
- [x] RLS tests
- [x] Generated types

### Phase 7 — Web Admin

- [ ] Admin auth/role
- [ ] Rule list
- [ ] Rule editor
- [ ] Enable/disable
- [ ] Validation
- [ ] Audit metadata

### Phase 8 — Notifications

- [ ] Device push registration
- [ ] User categories/preferences
- [ ] Severe-weather triggers
- [ ] UV/AQI triggers
- [ ] Delivery testing

### Phase 9 — Quality

- [ ] Small-screen Android review
- [ ] iOS review
- [ ] Accessibility
- [ ] Performance
- [ ] Offline behavior
- [ ] E2E mobile flows
- [ ] Security review
- [ ] UI polish

---

## Known open questions

- Which AQI standard will the UI normalize to?
- Which remote push backend will own token lifecycle, weather evaluation, Expo
  push receipts, and retries?
- Will rule evaluation run client-side, server-side, or hybrid?
- Which app icon library will be used for non-weather UI?
- Which authoritative provider will supply severe-weather alerts?

---

## Known issues

- `recommendation_rules_active_priority_idx` is new and therefore appears as an
  unused-index INFO notice until real application queries generate statistics.
- Local Supabase public environment values are not committed. The app boots in
  an explicit unconfigured state until a developer creates a local `.env` from
  `.env.example`.
- `npm audit --omit=dev` reports 11 moderate transitive advisories in the Expo
  CLI/config-plugin toolchain and its `xcode`/`uuid` dependency chain. It reports
  no high or critical findings; the suggested automatic fix would downgrade
  Expo to SDK 46, so it was not applied. Monitor compatible Expo 57 updates.

---

## Blockers

- No blocker remains for the Phase 3B.3 Android smoke test.
- Still unverified: physical-hardware GNSS returning a `current` rather than
  `last_known` fix; approximate-only, explicit deny/blocked, and settings-return
  permission paths; iOS behavior; TalkBack/VoiceOver and large-text passes; and
  stale/offline/background-refresh/complete-error transitions on a controllable
  native network.
- Remote push remains blocked on an EAS `projectId`, Android FCM v1/iOS APNs
  credentials, a protected token registry, and a server sender. Local scheduled
  notifications are implemented and do not require those services.

---

## Next concrete action

Link the application to an EAS project, configure FCM v1/APNs credentials, then
design the authenticated `push_devices` registry and server sender before
claiming remote push delivery. In parallel, verify hosted email confirmation,
signed-in saved-location CRUD, iOS, and large-text/reduced-motion behavior.

---

## Update policy

After meaningful work:

- move completed work into `Completed`;
- update `In progress`;
- update `Next recommended tasks`;
- add blockers/issues;
- keep this file concise.

Do not append chat/session transcripts.
