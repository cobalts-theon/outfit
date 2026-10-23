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

**Status:** Superseded by ADR-022

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

## ADR-020 — Deterministic client-side recommendations over normalized data

**Status:** Accepted for the initial product version

**Decision:** Evaluate the initial recommendation set locally and
synchronously from project-owned normalized `CurrentWeather` and optional
`HourlyForecast` values. Keep provider DTO parsing, React presentation, and
rule evaluation as separate boundaries. The engine returns structured groups,
severity, action identity, explanation, triggers, missing-input dimensions,
and evaluation status rather than presentation-specific component output.

Use U.S. AQI as the single explicitly labeled product scale for this version.
Use normalized UV categories and weather conditions rather than provider codes.
Order matches by severity and explicit rule priority, deduplicate matches that
lead to the same action while preserving their reasons and triggers, and limit
the Home Action surface to the three highest-priority results. Missing inputs
remain unavailable and are never inferred as zero or safe.

The initial rule definitions remain source-controlled application logic. Do
not reinterpret the existing Supabase `recommendation_rules` rows as executable
input until a validated rule format and administration workflow are designed.

**Reason:**

The initial engine must be deterministic, testable at exact category
boundaries, usable offline with cached normalized weather, and independent of
the current provider. Structured results let Risk and Action share one
evaluation without scattering health or clothing strings across components.

**Consequences:**

- Home can provide weather-alert, general-wellness, outdoor-activity, and
  clothing guidance from available live normalized inputs without AI/LLM
  generation or medical diagnosis.
- U.S. AQI category behavior is stable and explicit for the current product;
  supporting another AQI scale later requires a deliberate product/domain
  extension rather than an unlabeled substitution.
- Rule changes currently require an application release. Persistence, remote
  rule editing, versioning, validation, and Web Admin integration remain future
  work.
- An authoritative severe-weather alert provider remains unresolved; the
  engine can consume normalized alerts when they exist but does not fabricate
  them from Forecast API data.

---

## ADR-021 — Extend the shared live Forecast contract with an independent daily domain

**Status:** Accepted for Phase 4

**Decision:** Keep one Open-Meteo Forecast request and extend it to the selected
daily forecast variables plus current visibility. Adapt the response into three
separate project-owned models: required `CurrentWeather`, optional
`HourlyForecast`, and optional `DailyForecast`. Parse and adapt hourly and daily
collections independently so either optional collection may become a scoped
partial-data issue without removing valid current weather or the other
collection.

Version the TanStack Query contract as `v3`. The Forecast route consumes the
same cached live result as Home and uses native Stack navigation; it does not
create a second provider query or persist duplicate server state.

Daily entries require local forecast date, normalized condition, and minimum
and maximum temperature. Precipitation, UV maximum, sun, and moon dimensions
remain optional. Open-Meteo's moon-cycle fraction maps to normalized phase only,
never inferred illumination. Provider wind direction `360` is normalized to
the domain-equivalent north value `0` before domain validation.

**Reason:** Current, hourly, and daily data share coordinates, timezone, units,
freshness, and endpoint. A shared transport avoids duplicate network/cache
ownership, while separate models and failure boundaries preserve truthful
partial data and keep provider arrays out of React and rule evaluation.

**Consequences:**

- Home and Forecast read one authoritative live query result and refresh
  together for a changed normalized location identity.
- A malformed daily collection does not erase current/hourly data; a malformed
  hourly collection does not erase current/daily data.
- The Forecast route can show 24 hourly and seven daily entries without making
  those presentation limits part of the domain.
- Visibility, pressure, and astronomy remain secondary optional details.
- Severe-weather alerts, authentication, persistence, and remote rule storage
  remain outside this decision.

---

## ADR-022 — Light-only Weather Public Bulletin visual identity

**Status:** Accepted

**Decision:** Supersede ADR-011's dark retro-futurist/terminal direction with a
light-only neobrutalist visual system named **Weather Public Bulletin**.

The production mobile UI uses warm paper backgrounds, square geometry, thick
black outlines, structural offset shadows, cobalt blue, sunflower yellow, mint,
and coral/red semantic accents. Barlow Condensed owns display and heading roles;
JetBrains Mono remains the data and technical-label face. Native geometric
weather art is composed from independent normalized weather dimensions.

The app configuration, navigation theme, status bar, error surface, Home, and
Forecast surfaces expose light mode only. Day/night remains weather data and
must not switch the application chrome into a dark theme.

**Reason:** The user explicitly replaced the previous neo-futurist direction
while retaining the product, data contracts, and decision hierarchy. The new
world is more legible, distinctive, and civic/editorial without weakening the
practical `Now → Risk → Next → Action` story.

**Consequences:**

- `docs/DESIGN.md` defines Weather Public Bulletin as the sole current visual
  authority; old terminal, dither, ASCII, glow, and dark-theme rules are no
  longer production guidance.
- Hard shadows communicate structure and interaction; soft gradients,
  glassmorphism, pill-heavy cards, and decorative cyberpunk effects remain out
  of scope.
- User-facing mobile metadata must remain at least 11 pt, preserve Vietnamese
  wrapping, native touch targets, safe areas, and reduced-motion behavior.
- Weather-risk colors remain semantic and independent from decorative brand
  accents.
- The approved concept image is reference-only; production visuals remain
  native code and do not ship generated raster artwork.

---

## ADR-023 — Unified JetBrains Mono and animated square weather artwork

**Status:** Superseded in part by ADR-024

**Decision:** Clarify ADR-022 by retaining its light Weather Public Bulletin
neo-brutalist system while replacing its mixed Barlow/system/JetBrains type
roles with JetBrains Mono Regular, SemiBold, and Bold for every user-facing
text role. All application surfaces, controls, status marks, and icon frames
have zero corner radius.

Weather conditions render from the local amCharts Weather Icons 1.0.0 animated
SVG package. A synchronized black-filtered copy of the same SVG is offset
behind the colored layer to make the artwork belong to the hard-shadow visual
system. Rendering continues to select artwork from normalized domain
conditions and independent day/night state, never provider codes. When reduced
motion is enabled, both layers use the package's static counterparts. Preserve
the bundled CC BY 4.0 license and attribution.

**Reason:** The user explicitly clarified that the product must keep the old
square neo-brutalist identity, use JetBrains Mono everywhere, simplify the
former ASCII-heavy presentation, and use the newly supplied animated SVG set.

**Consequences:**

- This decision supersedes only the typography and generated/native weather-art
  clauses of ADR-022; its light palette, hierarchy, hard outlines, and
  structural offset shadows remain current.
- Barlow Condensed, system body type, Expo Symbols weather glyphs, rounded
  containers, and ASCII weather art are not part of the active mobile system.
- Animated SVGs render locally in a non-interactive WebView on native and as
  local images on web; forecast lists remain virtualized to bound active work.
- Accessibility keeps text labels as the authoritative weather description and
  honors the platform reduced-motion preference.

---

## ADR-024 — Vietnamese poster typography and bounded weather animation

**Status:** Superseded in part by ADR-025

**Decision:** Preserve the light, square Weather Public Bulletin and replace
the active JetBrains Mono typography roles with Archivo Regular 400, Archivo
Bold 700, Archivo Black 900, and Bebas Neue Regular 400. Vietnamese interface
copy, headings, controls, and navigation use Archivo; Bebas Neue is restricted
to oversized numeric weather readings. The standalone Syne and Archivo Black
packages are not shipped because their bundled files do not cover the complete
Vietnamese character range. Archivo's 900 Black file provides the intended
poster weight with complete Vietnamese coverage.

Bound animated weather rendering by context. A current-weather hero may mount
one non-interactive WebView that renders the colored animated SVG and its black
offset duplicate in the same document. Repeated hourly and daily items use
cached static SVGs through Expo Image with the same hard black offset treatment.
Reduced-motion mode also selects static artwork.

**Reason:** The prior all-monospace treatment reduced customer readability and
did not deliver the requested poster hierarchy. Rendering two WebViews for
every weather icon multiplied native views, SVG animation work, and memory use
across forecast sequences. Language coverage and fast scanning take priority
over including every candidate display font or animating repeated decoration.

**Consequences:**

- This decision supersedes the typography clause and the unbounded animated
  rendering consequence of ADR-023. Square geometry, local amCharts assets,
  normalized condition mapping, attribution, and hard offset shadows remain.
- No user-facing Vietnamese string should depend on a fallback font for missing
  glyphs.
- Home and Forecast current-weather artwork may animate; forecast list artwork
  remains visually consistent but static and cacheable.
- New animated surfaces require a product role and performance review rather
  than being enabled by default.

---

## ADR-025 — Role-based technical body type and customer-facing place labels

**Status:** Accepted

**Decision:** Keep Archivo 900 Black for poster headlines and Bebas Neue for
oversized numeric weather readings, but use JetBrains Mono Regular/Bold for
normal copy, metadata, compact controls, status, and emphasized body text. Only
these assigned font cuts are embedded; unused Archivo Regular/Bold files are
removed from the application font set.

After a successful device-position acquisition, the location service performs
one bounded platform reverse-geocode request and carries a concise district/city
label through `DevicePosition` and `SelectedAppLocation`. Failure or timeout of
reverse geocoding never invalidates usable GPS coordinates. Home, Forecast, and
the location status surface prefer the resolved place label and do not expose
raw coordinates or IANA timezone identifiers as primary customer copy.

Action/recommendation content is elevated into a fully bordered mint panel with
the standard hard black panel plate. Current, hourly, and daily weather artwork
may use larger optical sizes without changing the bounded-animation policy from
ADR-024.

**Reason:** The customer-facing interface needs poster weight at structural
headings but a more technical, clearly differentiated reading texture for
ordinary text. A human place name answers where the forecast applies more
quickly than coordinates or `Asia/Ho_Chi_Minh`. The Action step should visually
close the `Now → Risk → Next → Action` route instead of blending into a flat
section.

**Consequences:**

- This decision supersedes only the normal-copy typography and place-label
  presentation clauses of ADR-024; Archivo Black headings, Bebas numeric type,
  square geometry, and bounded icon animation remain current.
- Reverse geocoding is invoked only during explicit position acquisition or
  refresh, not during component render or every weather refetch.
- Location permission, GPS, weather loading, and offline fallbacks continue to
  work when no place name can be resolved.

---

## ADR-026 — Recommendation-first Home hierarchy

**Status:** Accepted

**Decision:** Home follows `Now → Action → Why → Next`. The concise current
weather hero remains the first context surface, but the prioritized Rule Engine
recommendations follow it immediately. The first `LÀM` row is shown before its
suggestion and explanation and receives the single sunflower action emphasis.

The risk advisory becomes the explanatory `Why` layer. Near-term forecast comes
after it, while detailed environmental metrics, location controls, and data
source status move below the primary decision path.

**Reason:** The product is a daily-life and health-support assistant powered by
weather, not primarily a weather dashboard. The previous order delayed useful
guidance behind multiple weather, forecast, GPS, and source surfaces.

**Consequences:**

- This decision supersedes the Home ordering clauses of ADR-010, ADR-022, and
  ADR-025; their visual identity, data truth, and recommendation safety rules
  remain current.
- Current weather stays prominent enough to establish trust and context, but
  metrics and technical state no longer compete with the primary action.
- Recommendation priority must come from the Rule Engine; the UI does not
  invent or reorder domain severity.
- Empty, partial, fixture, offline, and permission-denied states retain the same
  ordering and remain explicit about unavailable evidence.

---

## ADR-027 — Optional authentication, remote saved locations, and global app chrome

**Status:** Accepted

**Decision:** Keep weather, GPS, forecast, recommendations, and manual remote
location search usable without login. Require Supabase Auth only for personal
cloud data such as `saved_locations`. Implement email/password sign-up,
sign-in, sign-out, persisted sessions through the existing Expo SQLite storage,
and foreground-only token auto-refresh lifecycle handling.

Add a square neobrutalist Home masthead with hamburger navigation at top left
and an account avatar at top right. The drawer exposes Home, Forecast, remote
locations, and account. Manual search uses Open-Meteo Geocoding behind a
provider DTO/parser/adapter boundary and produces the existing normalized
`SelectedAppLocation(source = "manual")` contract. A user may view a result
immediately or, when authenticated, persist its label and coordinates through
the existing owner-scoped `saved_locations` table.

Embed Syne Regular 400 and ExtraBold 800 for short ASCII-only masthead and
system labels. Keep Archivo 900 for Vietnamese poster headings, JetBrains Mono
for Vietnamese body/data copy, and Bebas Neue for oversized numeric weather
readings because the bundled Syne cuts do not provide complete Vietnamese
coverage.

**Reason:** Location permission must remain optional, users need to prepare for
places they are not physically visiting, and cloud synchronization needs a
clear account boundary without turning authentication into a weather paywall.
The dedicated ASCII role honors the requested Syne character while preventing
silent fallback or missing Vietnamese glyphs.

**Consequences:**

- Auth session state remains client state; profiles and saved locations remain
  remote state owned by TanStack Query/Supabase.
- RLS and the authenticated role remain the backend ownership boundary; the
  client never receives a service-role key.
- No database migration is required because `profiles`, the auth trigger,
  `saved_locations`, grants, ownership policies, constraints, and indexes were
  already implemented and verified.
- Remote location selection cancels an in-flight GPS acquisition for
  application state but never changes OS GPS state or writes travel history.
- New global chrome preserves the accepted `Now → Action → Why → Next` Home
  hierarchy beneath it and keeps native Back behavior for overlays/routes.

---

## ADR-028 — Android system-geocoder fallback for manual place search

**Status:** Accepted

**Decision:** Keep Open-Meteo Geocoding as the permission-independent remote
place-search provider. On Android only, when foreground location permission is
already granted, try Expo Location's bounded system forward geocoder first and
normalize its result into the same `ManualLocationCandidate` contract. Never
request location permission merely to perform manual search.

**Reason:** Physical Redmi 7 verification reproduced a TLS/connection stall to
the dedicated Open-Meteo Geocoding host while Open-Meteo Forecast/Air Quality
and Android's system geocoder remained usable. A native fallback restores the
primary task on affected Android networking stacks without leaking Expo values
into UI or changing device GPS state.

**Consequences:**

- Android users with existing permission can search even when the remote
  geocoding host cannot complete its handshake.
- Permission-denied users still use Open-Meteo and are never pressured into
  granting GPS access for manual search.
- Native results may contain one coarse candidate and therefore use the typed
  query as their customer label; Open-Meteo remains richer when available.
- If remote geocoding remains unreliable for permission-denied Android users,
  a configurable backend geocoding proxy is the next production-grade step.

---

## ADR-029 — Semantic action kits and opt-in device notifications

**Status:** Accepted for the current client milestone

**Decision:** Represent each Home recommendation with a small semantic kit of
one or two SVGs selected from the recommendation `actionKey`. Clothing,
temperature, umbrella, hanger, and footwear imagery comes from
`assets/weather-cloths`; specialist AQI and shelter imagery remains in the
recommendation icon set. Visible kit labels explain the preparation meaning,
while the SVGs remain decorative to assistive technology because the complete
recommendation text is authoritative.

Use Expo Notifications for an explicit opt-in, device-local scheduling layer.
Schedule current or near-term rain, the highest warning/danger risk, and one
primary attention-level action. Persist stable event signatures locally so a
weather refetch does not resend the same situation. Tapping an app notification
returns to Home. Use a dedicated Android channel and monochrome notification
icon in project builds, with an Expo Go fallback channel for local testing.

Do not claim remote push delivery until the app has an EAS project ID, platform
credentials, a protected token registry, a server-side sender, Expo receipt
handling, and token-revocation cleanup.

**Reason:** Action-specific equipment is faster to scan than a generic clothing
glyph, but imagery must not replace Vietnamese guidance. Device-local alerts
provide useful rain and environmental reminders immediately after normalized
weather is loaded, while the current repository lacks the credentials and
backend ownership required for honest remote push.

**Consequences:**

- The client can schedule useful notifications after a successful live-weather
  evaluation, including while it later runs in the background.
- Sun/heat/hydration actions use the temperature symbol without a duplicate
  shirt; clothing artwork remains specific to clothing recommendations.
- Client scheduling is serialized, failed native replacements are left
  retryable, and foreground permission changes are reflected in the opt-in UI.
- Expo Go can verify local scheduling but cannot verify Android remote push;
  development/release builds remain mandatory for Expo push tokens.
- Notification preference and scheduled-record state are device-local for this
  milestone; no Supabase table or service-role capability is added.
- Remote notification infrastructure remains a separate security and
  architecture decision.

---

## ADR-030 — Authenticated notification preference synchronization

**Status:** Accepted

**Decision:** Add one owner-scoped `notification_preferences` row per Supabase
Auth user. Keep operating-system permission, native schedule identifiers, and
Expo Go fallback behavior device-local. When an authenticated user explicitly
enables or disables notifications, upsert the account-level opt-in through the
public Supabase client; guests continue without a database dependency.

The three category columns map directly to the implemented planner slots:
rain/laundry protection, environmental warning-or-danger risk, and the primary
attention-level action. Do not add push tokens, delivery history, quiet hours,
or a remote sender until EAS/FCM/APNs credentials and their lifecycle are
implemented together.

**Reason:** This creates useful cross-account preference state without
pretending that the current local scheduler is remote push. It also avoids a
speculative schema that has no client registration or protected sender yet.

**Consequences:**

- Authenticated enable/disable actions sync to Supabase; a cloud failure does
  not undo a successful device-local action and is reported in the sheet.
- Owner RLS and explicit grants prevent cross-user or anonymous access.
- The primary-key `user_id` covers the RLS lookup without a redundant index.
- Remote push provider, token lifecycle, and delivery infrastructure remain an
  open decision.

---

## ADR-031 — Private owner-scoped profile images

**Status:** Accepted

**Decision:** Store account avatars in a private Supabase Storage bucket named
`profile-images`. Put every image below its authenticated user's UUID folder,
limit uploads to 5 MiB and supported raster MIME types, and enforce owner-only
SELECT/INSERT/UPDATE/DELETE with `storage.objects` RLS. Keep the existing
`profiles.avatar_url` column as the object-path reference and generate a
short-lived signed URL only for display.

The Expo client uses the native system image picker with square editing and
uploads an `ArrayBuffer`, as required by Supabase's React Native Storage
contract. New uploads receive unique paths; after the profile reference is
updated, the previous owned object is removed.

**Reason:** A profile image is personal account data. A private bucket matches
the existing owner-only profile contract and prevents permanent public asset
URLs, while unique filenames avoid stale image replacement through caches.

**Consequences:**

- Signed-in users can choose, replace, and remove their own image; guests do
  not touch Storage.
- The same image is shown in the account sheet and global masthead with initials
  as the loading/error/empty fallback.
- Storage policies are the authorization boundary; client folder names and
  profile IDs are not trusted on their own.
- Camera and microphone permissions are explicitly excluded because this flow
  selects only from the system photo picker.

---

## ADR-032 — Dashboard operations and one complete walking planning flow

**Date:** 2026-09-08 (records the decision accepted in the resumed session).

**Decision:** Defer the separate ReactJS Web Admin in ADR-002 and operate with
Supabase Dashboard. Extend the mobile product with light-walking plans first:
destination, date, availability, duration, ranked alternatives, saved snapshot,
cancellation, completion and feedback.

**Reason:** Concentrate implementation on useful activity decisions and avoid
building a second administrative UI before the rule workflow is established.

**Consequences:** Versioned `walking_policies` are immutable except for active
selection. Mobile validates permitted thresholds; policy fallback is visible.
Use hourly US AQI, never substitute current AQI for missing forecast hours.
Thresholds are product preferences, not medical limits or guarantees. All
required conditions must pass before ranking. Guests retain local history;
authenticated history is owner-scoped in Supabase. Existing generic Home rules
remain client-side. Automatic plan monitoring and Expo remote push still require
backend work and EAS/FCM/APNs configuration; saved plans do not promise monitoring.

---

## ADR-033 — Daily-life guidance first, user-entered availability

**Date:** 2026-09-10.

**Decision:** Replace the walking-only entry point with forecast-backed daily
recommendations. Users enter their own same-day start/end times. Morning, noon,
afternoon, evening and overnight advice uses the destination timezone and only
upcoming forecast samples. Missing AQI does not suppress weather-based guidance,
but it remains a blocker for selecting a walking interval.

**Previous behavior:** Fixed morning/afternoon/day presets, walking-first UI,
hour-aligned candidate starts and automatic exclusion of darkness. A generic
missing-forecast message also covered elapsed or too-short availability.

**New behavior:** Arbitrary-minute user start plus quarter-hour alternatives,
non-overlapping choices, explicit reasons when no interval is available and an
optional walking subsection. Darkness requires an explicit lit-route preparation
instead of automatically rejecting all evening activity. Numeric walking policy
limits are unchanged; saved reasons remain historical snapshots. No new activity
values, database policy release or backend migration are introduced.

**Reason:** The user needs actionable daily-life sentences at relevant times,
not only a walking-time selector or preset availability periods.

---

## ADR-034 — Daypart actions belong in Do now

**Date:** 2026-09-10.

**Decision:** Supersedes ADR-033’s separate guidance-screen entry. Automatically
select current-daypart activities inside Home’s “Nên làm ngay”; keep walking
availability as an optional drawer tool. Preserve the existing neo brutalism.
Reduce repeated copy to action + short evidence, expand details on demand.

**Persistence:** Device-local completion keyed by destination/local date/activity
and daypart; laundry spans the date. No cloud migration or new walking activity
values. Completion is reversible, retained seven days, and shared by users of
this device. High-severity safety warnings do not become completable chores.

**Notifications:** Reuse permission-gated local scheduling, add a category with
Done and handle responses both live and at cold start. Done opens the app so the
handler reliably persists completion, then cancels related schedules. Rain uses
forecast timing; other chores offer an explicit 15-minute reminder. Disabling
notifications cancels both kinds. Remote push/background forecast monitoring is
not claimed: EAS push credentials and server/token infrastructure remain absent.

---

## ADR-035 — Preserve the original icon-led recommendation layout

**Date:** 2026-09-10.

**Decision:** Supersedes ADR-034’s three compact cards. Reuse existing SVGs and
Làm / Gợi ý / Lý do rows, removing only repeated wording. Highlight concrete
weather chores with Done and 15-minute reminders; ordinary recommendations do
not get these controls. Severe warnings retain safety precedence.

Walking is ordinary advice inside Do now, gated by existing weather evidence
and current local daypart, not a separate hamburger destination. Remove that
menu entry while preserving previously saved plans and the legacy route.
No change to notification delivery infrastructure or completion persistence.

---

## ADR-036 — Read-only recommendations, no chore controls

**Date:** 2026-09-11.

**Decision:** Supersedes ADR-035’s chore controls and multi-row presentation.
Home retains original SVG assets and neo brutalism, presenting each action with
its reason. Remove Done, Undo and 15-minute reminder controls, including their
completion-based visibility. Existing manual schedules are retired at startup;
automatic weather notifications continue without completion buttons. No change
to walking eligibility, saved legacy plans or the menu’s removed planner entry.

---

## ADR-037 — Recommendations are the primary product surface

**Date:** 2026-09-11.

**Decision:** Replace weather-first Home hierarchy with brief context, priority
advice, other activity decisions, forecast-backed preparation and optional
weather evidence. Temperature hero/metrics/forecast are collapsed by default.
Preserve SVGs, subtly rounded neo brutalism and read-only recommendations.

Remove generic clock-only routine advice. Use existing environmental rule
matches to recommend adjusting activity, while retaining strict evidence for
positive outdoor suggestions. Future preparation uses fresh upcoming hourly
samples within six hours; no measurements are invented. Weather remains the
explanation layer. Product success is a supported daily-life decision, not
reading the weather dashboard. No change to remote push infrastructure.

---

## ADR-038 — Concrete Jungle palette, 12px corners and entry motion

**Date:** 2026-09-11.

**Decision:** Adopt the user-specified ten-color Concrete Jungle palette and
12px surface/control corners, retaining hard outlines and shadows. Shared
secondary buttons are blue. Drawer uses horizontal entry; weather details use
vertical entry; both respect reduced motion. Forecast uses separate hourly and
seven-day tabs plus optional measurements instead of one long mixed list.
Recommendation-first Home and weather-derived advice remain the product focus.

---

## ADR-039 — Account-owned onboarding preferences

**Date:** 2026-09-12.

Store small versioned lifestyle selections in user-editable Auth metadata. Use
these only for recommendation relevance, never authorization. New app signups
carry a pending marker; existing accounts opt in through Account. Defer is
allowed. Personalization follows the weather engine, preserves warning/danger
advice, and never creates favorable conditions from missing measurements.

---

## ADR-040 — Separate welcome slides and context-sensitive household advice

**Date:** 2026-09-12. Supersedes the shared initial/editor UI in ADR-039 and
household-task priority from earlier Home iterations.

First-run setup is a separate bottom pop-up with two sliding steps. Account
keeps a direct edit form. Both share versioned preference validation/storage.
Wellbeing, travel and personal activities precede optional laundry; chores do
not receive the highlighted Home treatment solely by being first in a list.
Drying requires a dry daylight forecast, moderate humidity and wind; laundry
advice is omitted at evening/night. Rain notifications emphasize travel
preparation, not an assumption that everyone has washing outside.

---

## ADR-041 — Before-start route and exact availability

**Date:** 2026-09-12. Supersedes ADR-040's welcome pop-up.

New app signups open /before-start, a full page titled “Trước khi bắt đầu”.
Three steps ask about activities, transport, daily outdoor exposure and free
time. SVG selection rows handle activities/single-choice answers; two dropdowns
choose start/end in 30-minute increments, including overnight intervals. Account
keeps direct editing. Optional version-1 metadata fields preserve older profiles;
exact availability overrides legacy dayparts when available. Transport affects
rain preparation and prolonged exposure affects heat guidance; urgent warnings
are unchanged. No diagnosis or additional permissions are requested.

---

## ADR-042 — Consistent application-wide color hierarchy

**Date:** 2026-09-12. Refines ADR-038 without changing its ten-color palette.

Apply shared visual roles throughout the app: neutral reading surfaces, orange
primary actions, blue navigation/selection, green success and amber prioritized
content. Restrict large saturated backgrounds to information that merits
attention. Preserve 12px frames, original SVGs and hard shadows. Forecast data
precedes supporting preparation content; notification controls precede lengthy
explanations. Recommendation rules, permissions and stored preferences are unchanged.

---

## ADR-043 — Supabase-owned email OTP

**Date:** 2026-09-12.

Updated 2026-09-15 after scope clarification: OTP is for new-account confirmation
and forgotten passwords only. Remove the previously proposed passwordless login.
Recovery uses resetPasswordForEmail, verifyOtp(type=recovery), then updateUser
on an isolated nonpersistent client; return to password login after success. Use the existing
AuthProvider session listener and defer onboarding until verified authentication.
Do not build an OTP table or verify codes locally. Hosted templates must expose
Token; local template files are not a deployment. MCP currently lacks the Auth
configuration endpoint, so hosted setup remains an explicit outstanding step.

---

# Decisions still open

Create new ADR entries when these are resolved:

- Final UV standard mapping
- Authoritative severe-weather alert provider
- Client state library
- Detailed navigation structure after the initial Home route
- Remote push provider, token lifecycle, and delivery infrastructure
- Remote rule storage, validation, versioning, and administration format
- General-purpose icon library
- Analytics/crash reporting

## ADR-044 — Require authentication at app entry (2026-09-15)

User requests mandatory registration/login to use the system. Replace guest
access with a protected route boundary and a registration-first auth page.
Existing sessions remain usable. Do not mark signup complete without its
Supabase session; recovery remains isolated and returns to password login.

## ADR-045 — Activity planning and feedback (2026-09-15)

Expand the existing walking planner rather than add a parallel persistence
system. Share a pure activity evaluator across results, comparisons and local
monitoring. Store only baseline decision evidence needed to detect worsening.
Feedback customizes optional advice, never suppresses hazards. Per-plan reminders
are opt-in. Because no configured background push service exists, local
foreground change monitoring is explicit in UI; do not claim continuous checks
while closed. Server-driven monitoring remains a separate unfinished capability.

## ADR-046 — Bring saved intentions back to Home

Prioritize the next actual saved activity and adjustment of that same plan.
Do not create a duplicate plan when changing time. Reuse the activity evaluator
and destination queries; require refreshed evidence and explicit time selection.
Keep weather hazards above plans on Home, and place secondary controls inside
saved-plan details. Use account-scoped optimistic guards to avoid overwriting
concurrent edits. Retain the existing explicit foreground-only monitoring scope.


## ADR-047 — Retire feedback and clarify production module boundaries

**Date:** 2026-10-19. Supersedes the feedback portions of ADR-045; retains
ADR-046's plan lifecycle and rescheduling behavior.

**Decision:** Remove helpful/dislike/inaccurate controls, feedback data access and
feedback-based recommendation/activity ranking. Keep weather-rule priority,
explicit onboarding preferences, all five activities, checklists, rescheduling,
completion, cancellation, deletion and local reminders. No chatbot AI is added.

**Reason:** Reduce product and code complexity while preserving the useful
forecast-to-action and saved-plan workflows.

**Consequences:** Existing feedback tables/columns, migrations and generated types
remain for compatibility; this release performs no schema migration or data
cleanup. Production Home/planner names replace prototype/walking names. Screens
compose focused panels and application hooks; shared UI behavior has one owner.
The legacy walking-policy request is removed from the live activity planner
because its output was unused. Legacy storage keys and tested evaluator behavior
remain compatible. Pre-existing uncommitted work is preserved.


## ADR-048 — Simplify the source tree for a small student project

**Date:** 2026-10-22. Supersedes the folder organization in ADR-015/ADR-047.

**Previous:** Features nested application/domain/data/model/screens folders,
with many small files and tests spread through the source tree.

**Decision:** Use familiar screens/components/hooks/context/services/utils/types
folders. Merge related small modules, remove unreachable retired UI, centralize
tests, and use direct route re-exports. Preserve normalized data, query behavior,
authentication, all live screens, account plans and notifications.

**Reason:** The user requests fewer files/folders and code understandable for a
student project. File organization should match the app's current size.

**Consequences:** Imports change across the application and tests; UI markup,
styles and persistence contracts are retained. Retired daypart UI and its unused
evaluator/test are removed. Old screenshots and unused assets are preserved in
verified ZIP archives under artifacts. No database, dependency or API migration.


## ADR-049 — Group the application into 50 source files

**Date:** 2026-10-22. Refines ADR-048 at the user's explicit request.

**Previous:** The first cleanup retained 120 application files. The user requests
45–50 files, readable lines and unchanged UI/logic.

**Decision:** Group related components, hooks, services and utilities into exactly
50 files under src, including routes, platform variants and database types.
Keep component functions separate within their grouped files. Prefix colliding
private names, preserve object shorthand keys, and update imports and tests.
Use a target print width of 100 without changing literal text or generated types.

**Consequences:** There are 14 UI files, four contexts, three hook files, ten
service files, five utility files, two type files, one demo-data file, one theme,
four screens and six route files. No function, rule, query option, storage key,
API contract, UI/style definition or test assertion is intentionally changed.
The small before-start screen lives directly in its route. Native dependencies
are mocked in Jest setup, without changing the device application. Related
component definitions share files rather than becoming giant render functions.


## ADR-050 — Gmail sends OTP through an authenticated Send Email Hook

**Date:** 2026-10-22. Replaces the hosted-template/SMTP delivery setup in ADR-043;
retains Supabase-owned OTPs, password signup and isolated password recovery.

**Decision:** The user explicitly requests Gmail delivery without Supabase SMTP.
Use the Free-plan HTTP Send Email Hook and a small Edge Function. Supabase Auth
still creates and verifies OTPs; Nodemailer sends code-only messages directly
through the personal Gmail account. Do not build another OTP table or replace
authentication. Mobile screens and queries remain unchanged.

**Reason:** Hosted template edits were blocked on Free + default email sender,
and the user declined configuring custom SMTP in Supabase.

**Consequences:** Two server modules and pinned Deno dependencies are outside
src (which remains 50 files). Gmail App Password and webhook HMAC key live only
in server secrets. The gateway accepts webhook requests without JWT; the handler
requires Standard Webhooks signature/timestamp validation. Setup probes Gmail
before enabling the hook; unsigned callers cannot send or probe credentials.
Supabase SMTP/template settings remain untouched. App Password is still required
to authorize the Gmail account. Warm-instance retry coalescing is best effort;
Gmail quotas and hook execution limits remain practical constraints.

**Status:** Function v1 deployed; signed health probe passes. Hook activation and
real inbox delivery await the user's Gmail and App Password. No test email sent.


## ADR-051 — Authorize Gmail delivery with Google Cloud OAuth

**Date:** 2026-10-22. Supersedes the SMTP/App Password transport in ADR-050.

**Decision:** At the user's request, use a Google Cloud Web application OAuth
client and offline refresh token for the personal Gmail sender. Request only
Gmail's gmail.send scope. Send MIME messages through Gmail API HTTPS, keeping
Supabase's signed Send Email Hook, OTP generation/verification and app UI intact.

**Consequences:** Client ID, client secret, refresh token and Gmail address stay
in private admin env/server secrets. One extra server module handles OAuth/cache
and MIME; Nodemailer is removed. Application src remains 50 files. The user must
complete Google consent; External Testing refresh tokens expire after 7 days.
Setup checks token refresh before enabling the hook; actual API/inbox delivery
still requires an OTP request. No Gmail mailbox read permission or SMTP setup.

**Status:** Function v3 deployed; Google OAuth refresh and signed connection
probe pass. Hook enabled with verified configuration readback. TypeScript and
24 mail/setup tests pass. Real recovery OTP now passes Auth → gmail-otp → Gmail API (HTTP 200 and
successful hook log, 21:09 UTC+7). Inbox receipt remains user-verified.


## ADR-052 — Use six-digit email OTPs

**Date:** 2026-10-22.

**Decision:** At the user's request, configure hosted Auth mailer_otp_length=6,
keep six visible input cells and limit signup/recovery verification to six digits.
Preserve leading zeroes; never truncate Auth tokens in the email sender.

**Consequences:** Future Gmail-hook setup also sets and checks OTP length 6.
Users must request a fresh code after the change rather than shorten an older
code. Gmail delivery and the rest of the authentication flow remain unchanged.


## ADR-053 — Focus the app on environmental recommendations

**Date:** 2026-10-22. Supersedes mandatory product-route authentication in
ADR-044 and full plan-lifecycle presentation in earlier planning decisions.

**Reason:** The user approved simplifying the product after a code-based scope
review: environmental conditions should lead to understandable actions, without
making the app a personal calendar or profile-management product.

**Decision:** Allow public Home/Forecast/activity assessment; require login only
for private sync/save. Keep three activity choices: walking, running and travel.
Differentiate exposure/transport and preserve saved policy context. Show read-only
weather-driven preparation. Reduce plans to saved future hours, reminder and
remove/cancel. Remove avatar uploads and Moon/pressure presentation. Reuse optional
saved availability. Put precautions before opportunities and the hour chooser.

**Consequences:** Existing user data, legacy activity IDs, schema, RLS, Gmail OTP
and local scheduling remain compatible. No server data is deleted automatically.
Retire the image picker dependency/plugin and obsolete avatar tests. No new source
files or generic abstraction layer. Minute-level choices are clearly explained
as estimates based on hourly forecast samples. No medical score is introduced.


## ADR-054 — Ground advice in weather and respect late-night context

**Date:** 2026-10-22. Refines ADR-053 and reverses its avatar retirement at the
user's explicit request. User rejected pale controls, blue-on-blue advice and
inferred work/school preparation at 22:00.

**Decision:** Retain four explicit activities (walking/running/work-school/outing)
and restore the original private avatar repository, signed URLs, picker, upload,
remove controls and tests inside existing grouped files. Keep colored buttons.
Do now rows use white/amber/orange, with no blue/green row or badge fill. The
reading canvas is warm white; external navigation can use blue/green accents.

**Advice:** Add low-priority measured clothing advice in the existing gap between
cold and hot rules. It never fabricates air-quality, UV or a safe outdoor window.
At 22:00–04:59 in the selected location, ordinary comfort wording fits rest and
retains temperature/feels-like evidence. Never infer departure time from interests
or free-time preferences. Keep environmental hazards first, regardless of time.
Evaluate the full candidate set before Home filtering/collapsing, rather than
truncate to three before personalization. Refresh every ten foreground minutes;
empty, missing, failed and stale states remain explicit with retry controls.

**Consequences:** No schema, RLS, Gmail delivery or OTP-length changes. Source
stays 50 files. Avatar objects already stored remain usable. Night rules, restored
avatar tests and contrast checks cover the corrections; native review is recorded
in PROGRESS.md. Durable user constraints are recorded in AGENTS.md.


## ADR-055 — Evaluate outdoor activity with editable inputs

**Date:** 2026-10-22. Extends ADR-054 at the user's request.

**Decision:** Keep the timing flow focused on weather/environment suitability for
walking, running, commuting and outings. Date and duration are editable boxes;
accept valid calendar dates and whole-minute durations from 1 through 1440.
Use one live result beside inputs on wide screens, below on phones. Display
measurements and preparation directly. Show adverse-weather evidence when no
acceptable window exists; never present such a window as a recommendation to save.

**Consequences:** Arbitrary dates do not extend available forecast coverage.
Elapsed availability requests another date; selected-location timezone, freshness,
full-interval coverage and missing-data handling remain authoritative. Replace only
the old 30/60/90-minute database constraint; no columns, RLS, grants or existing
rows change. TypeScript database row types remain identical. No source files added.


## ADR-056 — Assess a commute at the user's departure

**Date:** 2026-10-22. Refines the shared activity chooser in ADR-055 after the
user identified the extra availability range as confusing for work/school.

**Decision:** Work/school asks for date, departure, travel minutes and transport.
Travel duration ends at arrival; it is not time spent at school/work. Assess the
exact selected departure and full travel interval instead of ranking the user's
free-time windows. Do not infer departure from profile availability. Keep the
range-based finder for walking/running/general outings.

**Consequences:** Commute results retain adverse or unknown conditions and show
weather-driven preparation. They cannot silently replace departure with better
weather later. Saved-commute monitoring suppresses alternate departure proposals.
The existing location-based coverage limit stays explicit. No schema, source-file
count, OTP, avatar or visual-identity changes.


**ADR-056 refinement — morning departures:** At the user's request, new
work/school departures start at 06:00 in the selected location's time zone.
Offer quick choices 06:00, 06:30 and 07:00; the full selector starts at 06:00.
The domain rejects earlier selections. Users still explicitly choose departure;
weather evidence, dates and other activities' time choices remain unchanged.


## ADR-057 — Deliver notifications through Expo Go's local channel

**Date:** 2026-10-22. User clarified the runtime is Expo Go and requested visible
phone notifications in that runtime.

**Decision:** Use local notification presentation/scheduling. In Expo Go Android,
omit the unavailable project-owned channel and use the host default. Actual app
builds retain the configured high-priority channel, with a null creation result
handled as unavailable. Record the delivery channel to repair old deduplication
records. Apply this to both environmental alerts and saved plans.

**Behavior:** Present test/first-enable confirmation immediately after permission.
Do not depend on an alarm or action category for tests. If a saved activity starts
in under 15 minutes, send its reminder once now; otherwise schedule 15 minutes
before. Keep weather evidence rules, explicit opt-in and deduplication. Give
visible feedback for errors and access to system notification settings.

**Limits:** Expo Go Android cannot receive this app's remote server push. It can
show local notifications under Expo Go's name. Device DND and channel settings
remain controlled by the user. No backend/schema or EAS provisioning is required
for this correction; server-based monitoring is still separate future work.


## ADR-058 — Adopt the user's ten-color palette

**Date:** 2026-10-22. User explicitly replaces the former orange/blue/green palette.

**Decision:** Centralize all ten supplied swatches in theme.ts and remap semantic
roles. Use cream surfaces, navy borders/shadows/secondary controls, red primary
controls, cyan information, yellow selection, gold advice, orange warning and
teal favorable states. Replace remaining hardcoded UI colors and native shell
background/notification accents. Keep layouts, typography and all application logic.

**Consequences:** Small text uses deeper navy where needed to retain AA contrast,
including red-filled buttons; navy secondary controls use cream copy. Preserve
warm Do now surfaces, avatar behavior, notification delivery and the 50-source-file
limit. Historical color decisions are superseded only for swatch values and the
listed semantic assignments. Weather illustration assets remain weather-specific.


**ADR-058 button refinement:** Secondary buttons use cyan #A8DADC and dark copy
instead of a navy fill that merged with the navy border/shadow. Apply centrally
to all NeoButton secondary actions, including location/forecast refresh, account,
notification settings and quick date choices. Custom GPS actions also use dark
copy on cyan. Contrast checks cover both label/fill and secondary fill/border.


## ADR-059 — Broaden measured comfort advice and compact its presentation

**Date:** 2026-10-23. User requested daily activities beyond clothing, then asked
to remove the repeated blocks and “Gợi ý sinh hoạt” labels.

**Decision:** Add informational advice for moderate warmth, conditional indoor
comfort and outside humidity extremes. These are comfort heuristics, not clinical
thresholds; indoor readings are unknown. Avoid duplicated hydration advice at the
existing severe-heat threshold. Use selected-location time for nighttime/rest
wording. Preserve stale/missing evidence gates and hazard priority.

**Presentation:** One Do now panel, no badges on ordinary info rows. Keep badges
for actual attention/warning/danger. Show three preview rows including optional
activities, plus all warnings. Secondary icons/type are compact and show actions;
expand for remaining advice and detailed environmental evidence. Reuse existing
icon assets and files; no file-count increase or notification-threshold changes.


## ADR-060 — Smaller modules for defense preparation (2026-10-23)

**Previous decision:** ADR-049 grouped application declarations into 50 files.

**Decision:** Prioritize shorter files for the student's request to make source
less overwhelming. Split the seven files exceeding 700 lines by responsibility,
adding eight modules: recommendation icon/preview, location capability, weather
fixtures, current-weather adapter, walking planner, recommendation engine and
comfort rules. Preserve the old exports for existing callers.

**Consequences:** Source count increases from 50 to 58. No source file exceeds
700 lines; the largest is 653 lines. This reduces the size of individual files,
not the amount of product behavior. Keep readable formatting and Vietnamese
headers. Do not remove features or compress statements to reach a line target.

**Validation:** TypeScript, all 357 tests across 40 suites, and Android export pass.


## ADR-061 — Dedicated style files for live editing (2026-10-23)

**Previous decision:** UI modules grouped components with their StyleSheet blocks.

**Decision:** The user requested CSS-like files that can be opened directly when
asked to change UI during the defense. Use React Native `.styles.ts` modules,
not browser-only CSS imports. Add one matching style module per UI file, plus
app context styles: 23 modules total. Keep before-start styles outside `src/app`
so Expo Router does not interpret them as a route. Extract static and inline
styles, dynamic style helpers and the native artwork's embedded CSS. Preserve
shared tokens in `theme.ts` and exported account/location style contracts.

**Consequences:** 81 source files total (58 application + 23 style). Components
link directly to their style modules; functionality remains in components,
hooks, services and utils. The edit guide maps visible sections to source files.

**Validation:** All 72 moved static declarations retain their initializers.
TypeScript, 357 tests and Android/web exports pass. No device/iOS visual review
was performed for this structural change.


## ADR-062 — Central CSS folder (2026-10-23)

**Previous decision:** ADR-061 placed `.styles.ts` beside the UI source files.

**Decision:** At the user's request, move all 23 unchanged style modules to
`src/css/components`, `src/css/screens` and `src/css/context`. Preserve filenames,
update imports/re-exports, and update the UI edit guide links. Keep `.styles.ts`
so native React Native styling continues working. `theme.ts` remains the shared
palette/type/spacing token source.

**Consequences:** 81 source files in 15 directories including src. No style files
remain mixed into component/screen/context folders. Ctrl/Cmd-click still opens
the matching style file; no layout or behavior changes.

**Validation:** TypeScript, all 357 tests/40 suites and Android/web exports pass.
