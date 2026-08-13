# PROGRESS.md

## Current milestone

**Phase 3B.3 — Normalized Hourly Forecast + Live Home Next complete**

Normalized selected coordinates now drive a TanStack Query application boundary
that composes one Open-Meteo Forecast response into separate `CurrentWeather`
and `HourlyForecast` domain models while enriching current conditions with AQI,
pollutants, and UV. Home uses live `Now`, environment, and `Next` data after a
successful query; the real recommendation engine, manual search, reverse
geocoding, and saved locations remain deferred.

---

## Project status

### Completed

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
- Initial weather-condition/icon architecture defined:
  - normalized internal conditions;
  - day/night separation;
  - moon phases;
  - Meteocons direction.
- Visual identity selected:
  - retro-futuristic;
  - terminal/system-interface inspired;
  - dither;
  - ASCII motifs;
  - technical/data-driven atmosphere.
- JetBrains Mono selected as the initial primary typography direction.
- Experimental digital interfaces such as KPRverse selected as reference category, not direct templates.
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
  - initial adaptive light/dark design tokens derived from the approved visual
    direction;
  - JetBrains Mono regular and semibold loading through Expo Font;
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

No feature implementation is currently in progress. Phase 3B.3 and its Android
native smoke test are complete. Remaining work is platform/edge-case
verification, not another Phase 3B.3 implementation pass.

---

## Next recommended tasks

### 1. Complete the native platform matrix

Repeat the verified location-to-live-weather flow on physical Android hardware
with real GNSS and on iOS. Cover approximate-only permission, user denial,
blocked permission/settings recovery, TalkBack/VoiceOver order, large text,
and the remaining severe-risk/night visual states.

### 2. Verify cache and network edge states natively

Exercise stale-cache display, offline-paused loading, background-refresh error,
and complete Forecast failure on a controllable native network. The live
partial-data path has already been observed on Android.

### 3. Connect the real recommendation engine

Use normalized current and future hourly-domain inputs. Do not turn the Phase
3B observation-only risk notice into permanent recommendation logic. Start
with a small number of explainable rules.

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

The Home screen is the first place to validate the dither/ASCII/terminal visual language.

### First UI validation goals

Validate:

- JetBrains Mono readability;
- large temperature display;
- technical labels;
- dither without text interference;
- weather icon compatibility;
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
- [ ] Manual-location fallback
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

- [ ] Recommendation domain model
- [ ] UV rules
- [ ] AQI rules
- [ ] Heat rules
- [ ] Rain rules
- [ ] Clothing rules
- [ ] Prioritization
- [ ] Explanation/reason display

### Phase 6 — Supabase

- [x] Existing remote project/schema baseline
- [x] Temporary admin authorization decision
- [x] Profiles schema and auth trigger hardening
- [x] Saved locations schema hardening
- [ ] Notification preferences
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
- Is login mandatory for MVP or optional?
- What push notification infrastructure will be used?
- Will rule evaluation run client-side, server-side, or hybrid?
- Which app icon library will be used for non-weather UI?
- Which authoritative provider will supply severe-weather alerts?
- Whether the Phase 3A prototype colors become the production semantic tokens.
- Whether a secondary body font is needed in addition to JetBrains Mono.
- Whether production weather artwork keeps the Phase 3A native-view dither
  technique or moves to a dedicated renderer.
- Whether the current-weather hero uses SVG, Lottie, custom RN animation, or a hybrid.

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

---

## Next concrete action

Complete the remaining physical Android/iOS and native cache/error matrix above.
Do not repeat the Phase 3B.3 implementation or advance to another product phase
without explicit authorization.

---

## Update policy

After meaningful work:

- move completed work into `Completed`;
- update `In progress`;
- update `Next recommended tasks`;
- add blockers/issues;
- keep this file concise.

Do not append chat/session transcripts.
