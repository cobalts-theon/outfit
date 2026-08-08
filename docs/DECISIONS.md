# DECISIONS.md

This file records durable architectural/product decisions.

Use concise ADR-style entries.

---

## ADR-001 — Mobile framework

**Status:** Accepted

**Decision:** Use React Native with TypeScript for the end-user mobile application.

**Reason:**

The project scope explicitly targets a cross-platform mobile application with React Native.

**Consequences:**

- UI must be designed for native mobile behavior.
- Web-only UI guidance must not be applied blindly.
- Android/iOS differences must be considered.

---

## ADR-002 — Web Admin technology

**Status:** Accepted

**Decision:** Use ReactJS for the Web Admin subsystem.

**Reason:**

The project scope requires an admin interface for managing recommendation scenarios/rules.

**Consequences:**

- Mobile and Admin are separate product surfaces.
- Shared domain types may be considered later, but UI architecture should not be forced to be identical.

---

## ADR-003 — Backend platform

**Status:** Accepted

**Decision:** Use Supabase for application backend capabilities.

**Intended responsibilities:**

- Auth
- PostgreSQL
- RLS
- preferences
- saved locations
- recommendation rules
- notification configuration
- server-side functions where needed

**Consequences:**

- RLS is a primary security boundary.
- Service-role secrets never ship in mobile clients.
- Schema changes use migrations.

---

## ADR-004 — Weather provider abstraction

**Status:** Accepted

**Decision:** External weather/AQI providers must be accessed through adapters and normalized into an internal domain model.

**Reason:**

The academic scope mentions OpenWeatherMap and AirVisual, but provider capabilities and future choices may change.

**Consequences:**

- Screens never depend directly on provider response types/codes.
- Provider changes should mostly affect service/adapter layers.

---

## ADR-005 — Weather condition model

**Status:** Accepted

**Decision:** Keep approximately 30–35 canonical primary weather conditions and model day/night, moon, wind, precipitation, UV, AQI, and alerts as independent dimensions.

**Reason:**

A combinatorial weather enum would grow into hundreds of variants and be difficult to maintain.

**Consequences:**

- No `full_moon_heavy_rain`-style domain values.
- UI resolves visuals by composition.

---

## ADR-006 — Weather visual assets

**Status:** Accepted for initial design direction

**Decision:** Prefer Meteocons for weather visuals, with static compact assets for forecast lists and optional richer/animated current-weather hero visuals.

**Consequences:**

- Do not import hundreds of unused assets.
- Keep an internal weather-icon resolver.
- General application icons use a separate consistent UI icon family.

---

## ADR-007 — Recommendation model

**Status:** Accepted

**Decision:** Environmental inputs and recommendation logic are separate from presentation.

**Reason:**

Temperature/UV/AQI conditions must be converted into reusable health/outdoor and clothing recommendations, and Admin should be able to manage rule scenarios.

**Consequences:**

- Rule evaluation is not embedded in screen components.
- Rules should be explainable and prioritizable.

---

## ADR-008 — Health guidance scope

**Status:** Accepted

**Decision:** The product provides general environmental health/outdoor guidance, not diagnosis or treatment.

**Consequences:**

- Recommendation copy should stay within general wellness/safety guidance.
- Severe events should foreground official warnings where available.
- Future personalized medical features require a separate decision/review.

---

## ADR-009 — Weather persistence

**Status:** Accepted

**Decision:** Do not store every weather API response in Supabase by default.

**Reason:**

Weather data is transient and high-volume; persistence is not required for the core MVP.

**Consequences:**

Weather history/cache storage must have a defined use case before being added.

---

## ADR-010 — UI product direction

**Status:** Accepted

**Decision:** The Home screen is organized around:

1. Now
2. Risk
3. Next hours
4. Action/recommendation

**Reason:**

The product's value is interpretation and decision support, not presenting all weather metrics equally.

**Consequences:**

- Avoid dashboard-card overload.
- Secondary metrics remain secondary.

---

## ADR-011 — Visual identity

**Status:** Accepted

**Decision:**

The mobile application's primary visual direction is:

- retro-futuristic;
- terminal/system-interface inspired;
- dithered;
- ASCII-inspired;
- technical and data-driven;
- atmospheric rather than traditionally decorative.

JetBrains Mono is the initial primary typography direction.

Experimental digital experiences such as KPRverse may be used as visual references for atmosphere, hierarchy, technical presentation, motion, and interface character.

They must not be directly cloned.

**Reason:**

The application should have a recognizable visual identity rather than resemble a generic consumer weather application or generic AI-generated dashboard.

Weather data naturally supports a technical/data-oriented presentation, making a monitoring-system visual language appropriate to the product.

**Constraints:**

Visual experimentation must never reduce:

- weather readability;
- environmental risk comprehension;
- forecast comparison;
- recommendation clarity;
- accessibility;
- native mobile usability.

Dither, ASCII, system labels, and terminal motifs are supporting visual tools.

They are not a reason to obscure information.

**Consequences:**

- `docs/DESIGN.md` is mandatory context for substantial UI work.
- JetBrains Mono should be evaluated early on real Android/iOS screens.
- UI research should include experimental and technical interfaces in addition to traditional weather apps.
- Generic card-heavy SaaS layouts should be actively avoided.
- Weather semantic colors remain independent from the brand palette.
- A secondary body font may be introduced later if long-form monospace readability is insufficient; doing so requires another decision entry.

---

## ADR-012 — Existing Supabase schema baseline

**Status:** Accepted

**Decision:** Use an MCP-derived, idempotent baseline for the existing remote
Supabase schema.

**Reason:**

The official `npx supabase db pull` workflow was evaluated first but could not
be run safely in the current environment: no local CLI/config or CLI database
credentials were available, and the Docker-compatible Podman runtime could not
initialize in the sandbox. The authenticated Supabase MCP connection could
inspect the project catalogs and record migrations without disturbing existing
data.

**Consequences:**

- The baseline records only the four existing public tables.
- The migration is idempotent and was applied before separate hardening
  migrations.
- Local migration filenames match the remote migration history.
- A future working CLI environment should continue from these migrations and
  must not create a second initial baseline.

---

## ADR-013 — Temporary admin authorization

**Status:** Accepted

**Decision:** Authorize recommendation-rule administrators with the trusted
Auth claim `app_metadata.app_role = "admin"`.

**Reason:**

The current Admin requirement is narrow and does not justify a role table,
Auth Hook, or generalized RBAC system.

**Consequences:**

- `recommendation_rules` RLS reads the claim through `auth.jwt()`.
- Normal authenticated users read active rules only; admins can read inactive
  rules and create, update, or delete rules.
- `user_metadata` must never be used for authorization.
- Role changes require a JWT refresh before an existing session observes them.
- Adding `user_roles`, Auth Hooks, or generalized RBAC requires a new decision.

---

## ADR-014 — Initial database hardening scope

**Status:** Accepted

**Decision:** Harden the existing four-table schema with least-privilege grants,
owner/admin RLS, integrity constraints, foreign-key delete behavior, supporting
indexes, and a secured `handle_new_user()` function, without redesigning
`recommendation_rules` or adding future tables.

**Consequences:**

- `handle_new_user()` remains `security definer` for the Auth trigger, uses an
  empty fixed search path, fully qualifies objects, and is not executable by
  public client roles.
- User-owned foreign keys cascade on Auth user deletion; deleted rules set
  nullable historical log references to null.
- The complete two-user RLS matrix and hosted Auth trigger test are migration
  blockers for future changes to these policies or the trigger.
- TypeScript database types are generated only after tests and advisors pass.

---

## ADR-015 — Phase 1 mobile application foundation

**Status:** Accepted

**Decision:** Keep Expo Router on Expo SDK 57 and use its stable native Stack as
the navigation foundation. Do not use the starter's unstable native tabs for
core architecture. Keep `src/app` limited to route modules and place bootstrap
and provider infrastructure under `src/application`.

Use TanStack Query v5 for remote/server state and cache ownership, with React
Native online and focus state connected through NetInfo and AppState. Do not
install a general client-state library until a concrete client-owned state need
exists.

Initialize Supabase through a singleton `supabase-js` client parameterized by
the generated `Database` type. Persist sessions through Expo SQLite's
`localStorage` implementation, accept only public Expo environment variables,
and keep the application shell bootable when those variables have not yet been
configured.

Embed JetBrains Mono through the Expo Font config plugin and retain runtime
loading for Expo Go and web development compatibility.

**Reason:**

The first mobile milestone needs stable native navigation, explicit state
ownership, a secure typed backend boundary, and reliable startup behavior
before product features are introduced. Expo Router publishes files under its
route directory, so application infrastructure cannot safely live there.

**Consequences:**

- Future routes compose through the stable Router stack unless a demonstrated
  implementation blocker requires a new navigation decision.
- Tab navigation remains deferred until real product routes justify it.
- Server data must use TanStack Query rather than being copied into a global
  client store.
- Supabase-backed features must handle missing public configuration explicitly;
  service-role or secret keys remain forbidden in client variables.
- The exact client-state library and detailed post-Home navigation structure
  remain open decisions.

---

## ADR-016 — Initial weather and air-quality provider strategy

**Status:** Accepted

**Decision:** Use Open-Meteo's Forecast API for current weather, hourly/daily
forecast fields, and daily astronomy, and use Open-Meteo's Air Quality API for
AQI and pollutant data in the current MVP. Do not use AirVisual for the current
MVP.

Integrate through native Fetch and explicit REST JSON DTOs under the
provider-specific service boundary. Do not install the `openmeteo` package or
expose its index-ordered variable access outside the provider layer. Request
construction, response parsing, WMO mapping, unit checks, and domain adaptation
remain centralized under `src/services/weather/providers/open-meteo`.

Do not select one global AQI standard at this stage. Request both
`european_aqi` and `us_aqi`, and require the adapter caller to select which
explicit scale is represented by `AirQualityReference`.

**Reason:**

Open-Meteo currently supplies the MVP's relevant weather, UV, astronomy, AQI,
and pollutant fields through documented JSON endpoints. Explicit DTOs are
clearer to validate and fixture than the generated client's positional
`variables(index)` access, preserve provider isolation, and fit React Native
and future TanStack Query integration without another native dependency.

**Consequences:**

- The data path is TanStack Query → Open-Meteo fetch function → parsed
  Open-Meteo DTO → adapter → normalized domain.
- Application features and React components must not import Open-Meteo DTOs or
  provider field names.
- Requests use `timezone=auto`, Unix timestamps, Celsius, millimetres, and
  metres per second; adapters emit the existing Phase 2A units and zoned
  timestamp contract.
- Open-Meteo WMO codes map centrally into the existing `WeatherCondition`
  vocabulary, with unknown codes degrading to `unknown`.
- Daily `sunrise`, `sunset`, `moonrise`, `moonset`, and `moon_phase` may enrich
  the current domain for the corresponding local day; they are not modeled as
  current-observation fields. Moon phase fraction does not provide moon
  illumination.
- The Forecast API does not provide the authoritative severe-weather alert
  feed required by `WeatherAlert`; alerts remain unavailable unless a separate
  authoritative provider is selected later.
- The provider transport and adapters are not wired into application queries,
  GPS, or UI during Phase 2B.

---

## ADR-017 — Foreground location capability

**Status:** Accepted

**Decision:** Use the Expo SDK 57-compatible `expo-location` module for
foreground permission checks, foreground permission requests, service-status
checks, and one-shot device position acquisition. Keep Expo response objects
inside `src/services/location/` and normalize them into project-owned
coordinates, device-position, and selected-location contracts before they reach
application state or future weather queries.

Own permission and acquisition state in a dedicated application capability
provider rather than TanStack Query. Request no background permission and start
no continuous location subscription. A current position uses balanced accuracy
with a 12-second application timeout; when useful, the capability may fall back
to a platform last-known position no older than 15 minutes and no less accurate
than 5 kilometres.

Do not persist continuous location history or write location to Supabase. The
platform's bounded last-known cache is sufficient for this phase. Keep the
project-owned selected-location contract open to a future `manual` source,
without implementing manual search or reverse geocoding yet.

**Reason:**

Location permission and acquisition are local native interactions, not remote
server data. A normalized capability boundary prevents Expo-specific objects
from coupling the weather layer and lets manual selection become an alternative
source without changing future query inputs.

**Consequences:**

- Permission, service-disabled, timeout, invalid-coordinate, and acquisition
  failures remain explicit recoverable states.
- Denying GPS never blocks the fixture-backed Home surface.
- The next weather integration consumes
  `SelectedAppLocation.coordinates`; it does not call Expo Location directly.
- Reverse geocoding, background location, continuous tracking, application-level
  coordinate persistence, and Supabase writes remain out of scope.
- Physical Android/iOS permission and GPS behavior still requires device or
  emulator verification.

---

## ADR-018 — Live current-weather query and partial-data policy

**Status:** Accepted for Phase 3B.2

**Decision:** Add an application-owned current-weather orchestration boundary
between `SelectedAppLocation` and the Open-Meteo provider layer. Run the minimal
Forecast current/astronomy and Air Quality current requests concurrently, then
compose only parsed/adapted results into `CurrentWeather`.

Use coordinates rounded to three decimal places for both the provider request
and query identity. Include normalized coordinates, selected-location identity,
and the live-slice AQI scale in the key; do not include Expo Location objects,
accuracy, or selection timestamps. Use a ten-minute stale window, existing
AppState/connectivity refetch behavior, no fixed polling, and at most two retries
for transient network, provider, or rate-limit errors. Deterministic input and
malformed-response errors are not retried.

Forecast is required. Air Quality/UV is optional enrichment: its failure yields
a successful partial result with unavailable fields and project-owned issues,
while a Forecast failure yields a project-owned query error. Use `us_aqi` as an
explicit configurable default only for the Phase 3B.2 live slice; do not resolve
the final product AQI standard.

**Reason:**

Weather models operate at a coarser grid than insignificant foreground-GPS
jitter, and current conditions should refresh without being treated as
immutable data. Separate required and optional provider results keeps valid
weather usable without turning missing environmental measurements into false
zero or safe states.

**Consequences:**

- TanStack Query remains the sole owner of live weather remote state.
- Coordinates that normalize to the same three-decimal pair do not create a new
  cache entry; a changed rounded-coordinate, label/source, or AQI-scale identity
  does.
- Home can display cached/stale and partial state explicitly while keeping raw
  provider DTOs and errors below the application boundary.
- `Now` and environment metrics become live after success; normalized hourly
  `Next` and rule-engine-backed `Risk`/`Action` remain separate future work.
- Final AQI standard/classification remains an open product decision.

---

## ADR-019 — Share the live Forecast request, separate current and hourly domains

**Status:** Accepted for Phase 3B.3

**Decision:** Extend the existing live-weather query so one Open-Meteo Forecast
request provides current conditions, the selected hourly variables, and the
existing astronomy fields. Adapt that response into separate `CurrentWeather`
and `HourlyForecast` domain models. Do not add hourly arrays to
`CurrentWeather` and do not expose provider arrays above the provider boundary.

Hourly DTO parsing/adaptation is an independently degradable slice. A valid
required current payload remains usable when only hourly JSON is malformed,
missing, unordered, or has mismatched array lengths. The application exposes
that state as a project-owned `hourly_forecast` issue and omits the normalized
collection. A Forecast transport/HTTP failure or malformed required current
slice still fails the complete live query.

Keep the three-decimal coordinate identity and ten-minute stale/refetch policy.
Bump the query contract key from `v1` to `v2` so a persisted or in-memory result
without `HourlyForecast` is not mistaken for the extended result shape. Home
selects up to six near-term entries as presentation logic; the domain preserves
the full ordered provider horizon.

**Reason:** Current and hourly data share coordinates, units, timezone, and the
Forecast endpoint, so separate HTTP calls would duplicate work. Shared
transport does not require shared domain ownership. Isolating hourly parse and
adapter failure preserves truthful current conditions and avoids falling back
to mock forecast values during a live session.

**Consequences:**

- TanStack Query remains the sole owner of both current and hourly remote state.
- `Now`, environment readings, and `Next` can be live after one query succeeds;
  `Action` remains explicitly fixture-backed and permanent Risk logic remains
  deferred.
- Absolute ISO timestamps plus the collection IANA timezone define all hourly
  time semantics.
- The cache/stale/refetch strategy and GPS-jitter normalization do not change;
  only the result-contract version changes.
- Detailed hourly screens, daily forecast domain, alerts, and recommendation
  rules remain future work.

---

# Decisions still open

Create new ADR entries when these are resolved:

- Final AQI standard/classification
- Final UV standard mapping
- Authoritative severe-weather alert provider
- Client state library
- Detailed navigation structure after the initial Home route
- Authentication requirement for MVP
- Push notification provider/infrastructure
- Rule-engine storage/execution format
- General-purpose icon library
- Analytics/crash reporting
