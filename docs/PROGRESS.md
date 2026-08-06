# PROGRESS.md

## Current milestone

**Phase 0 — Project Foundation / Visual Direction**

Project documentation and agent tooling are being finalized before the first production vertical slice.

---

## Project status

### Completed

- Project topic defined: weather forecasting and user health support.
- Mobile technology direction: React Native.
- Web Admin technology direction: ReactJS.
- Backend direction: Supabase.
- Weather/AQI integration scope includes OpenWeatherMap and AirVisual as initial references.
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

Prepare the remaining development environment and agent tool loop required for
the first mobile vertical slice. The initial Supabase migration/security
foundation is complete; notification schema and generalized RBAC remain
intentionally deferred.

Priority tooling:

```text
Supabase MCP
Maestro MCP
Playwright MCP
```

The first implementation milestone should not begin with the entire application.

---

## Next recommended tasks

### 1. Verify MCP tooling

Confirm available Codex MCP servers.

Desired initial set:

```text
Supabase
Maestro
Playwright
```

Optional later:

```text
Figma / Framelink
```

### 2. Choose weather data provider strategy

Evaluate providers against:

- current weather;
- hourly forecast;
- daily forecast;
- precipitation;
- wind/gust;
- UV;
- AQI/pollutants;
- severe alerts;
- sunrise/sunset;
- moon/astronomy;
- location/timezone;
- pricing/rate limits.

Decide whether:

- one provider is enough; or
- weather + air quality use separate providers.

Record the result in `DECISIONS.md`.

### 3. Scaffold the React Native application

Create only the foundation required for the first vertical slice:

```text
app bootstrap
navigation
theme
typography
design tokens
weather domain types
provider abstraction
query/cache foundation
error handling
```

Include JetBrains Mono early so typography can be tested on real screens.

### 4. Implement the first vertical slice

Target:

```text
Location permission
→ GPS coordinates
→ current weather provider
→ provider adapter
→ normalized weather model
→ Home current-weather UI
```

Do not begin with the full database or Admin.

### 5. Add key environmental metrics

After current weather works:

- AQI;
- UV;
- wind;
- hourly preview.

### 6. Add the basic recommendation engine

Start with a small number of explainable rules.

### 7. Establish the visual review loop

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

- [ ] React Native + TypeScript baseline
- [ ] Navigation
- [ ] Theme/design tokens
- [ ] App providers
- [ ] Query/cache layer
- [ ] Error handling foundation

### Phase 2 — Weather core

- [ ] Location permission
- [ ] Manual-location fallback
- [ ] GPS
- [ ] Weather provider interface
- [ ] Provider adapter
- [ ] Current weather domain model
- [ ] Weather normalization tests

### Phase 3 — Home MVP

- [ ] Current weather hero
- [ ] Day/night icon
- [ ] Temperature
- [ ] Feels like
- [ ] Main condition
- [ ] Wind
- [ ] AQI
- [ ] UV
- [ ] Hourly preview
- [ ] Loading/error/offline states

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

- Which weather provider(s) will be used?
- Which AQI standard will the UI normalize to?
- Is login mandatory for MVP or optional?
- What push notification infrastructure will be used?
- Will rule evaluation run client-side, server-side, or hybrid?
- Which app icon library will be used for non-weather UI?
- How much moon/astronomy data is available from the chosen provider?
- Exact color tokens for the terminal/dither visual system.
- Whether a secondary body font is needed in addition to JetBrains Mono.
- Dither rendering technique on React Native.
- Whether the current-weather hero uses SVG, Lottie, custom RN animation, or a hybrid.

---

## Known issues

- `recommendation_rules_active_priority_idx` is new and therefore appears as an
  unused-index INFO notice until real application queries generate statistics.

---

## Blockers

None recorded yet.

---

## Next concrete action

Choose the weather provider, then start the first vertical slice while using
the new generated database types for any Supabase integration:

```text
GPS
→ Current Weather
→ Normalize
→ Home
→ Visual Review
```

---

## Update policy

After meaningful work:

- move completed work into `Completed`;
- update `In progress`;
- update `Next recommended tasks`;
- add blockers/issues;
- keep this file concise.

Do not append chat/session transcripts.
