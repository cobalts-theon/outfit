# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.


 AGENTS.md

## Project identity

This repository implements **Hệ thống dự báo thời tiết và hỗ trợ sức khỏe người dùng**.

The product includes:

- A **React Native mobile application** for end users.
- A **ReactJS Web Admin** for managing recommendation scenarios/rules.
- Weather and environmental data integrations such as **OpenWeatherMap** and **AirVisual**.
- Real-time device location through GPS.
- A **Rule Engine** that converts weather/environmental conditions such as temperature, UV, and AQI into health and clothing recommendations.
- Push notifications.
- Supabase as the application backend/database platform.

The mobile application is the current primary development target.

---

## Mandatory context loading

Before performing substantial work, read the relevant project documents:

1. `docs/PRODUCT.md`
2. `docs/ARCHITECTURE.md`
3. `docs/PROGRESS.md`
4. `docs/DECISIONS.md`

Additionally:

- For UI/UX work, read `docs/DESIGN.md`.
- For weather data, API mapping, weather icons, day/night, moon, AQI, UV, wind, alerts, or forecast work, read `docs/WEATHER.md`.
- For Supabase, schema, RLS, migrations, authentication, notification preferences, saved locations, or rule data, read `docs/DATABASE.md`.

Do not begin implementation by guessing requirements that are already documented.

---

## Installed skills

Use project skills when applicable:

- `vercel-react-native-skills`
- `vercel-react-best-practices`
- `vercel-composition-patterns`
- `impeccable`
- `supabase`
- `supabase-postgres-best-practices`

Prefer the most specific relevant skill instead of loading every skill for every task.

Examples:

- React Native screen/component work → `vercel-react-native-skills`
- Component API/refactoring → `vercel-composition-patterns`
- Visual critique/polish → `impeccable`
- Database/Auth/RLS → `supabase`
- SQL/schema/performance → `supabase-postgres-best-practices`

---

## Core engineering rules

### 1. Domain before provider

UI and business logic must not depend directly on raw weather-provider response objects.

Use this direction:

`Provider response -> adapter/normalizer -> domain model -> app features/UI`

Weather provider changes must be isolated behind adapters.

### 2. Feature-based architecture

Prefer feature boundaries over large generic folders.

Recommended direction:

```text
src/
  app/
  navigation/
  components/
    ui/
    weather/
  features/
    weather/
    forecast/
    air-quality/
    recommendations/
    alerts/
    locations/
    settings/
  services/
  stores/
  theme/
  types/
  utils/
```

Do not create large all-purpose files or giant screen components.

### 3. Separate server state and client state

- Remote/weather/backend data: query/cache layer.
- Local UI/client state: lightweight client store where needed.
- Do not duplicate the same authoritative data in multiple stores.

### 4. Mobile-first native behavior

Always consider:

- Safe areas
- Android and iOS differences
- Touch targets
- Screen size variation
- Dynamic text
- Loading/error/offline states
- Permission-denied states
- Keyboard behavior
- Reduced motion/accessibility where relevant
- Efficient list rendering

### 5. No provider-specific weather codes in UI

Never scatter provider codes throughout components.

Bad:

```ts
if (weather.code === 501) { ... }
```

Good:

```ts
if (weather.condition === "rain") { ... }
```

Provider codes must be normalized in one place.

### 6. Security

Never:

- expose Supabase service-role keys in the mobile app;
- bypass RLS from the client;
- hard-code production secrets;
- store unnecessary sensitive data;
- trust user-supplied IDs without authorization checks.

### 7. Health recommendation scope

Recommendations are general informational/wellness guidance based on environmental conditions.

Do not present the application as diagnosing, treating, or replacing professional medical advice.

For severe environmental hazards, emphasize official alerts and conservative safety guidance.

---

## UI / Visual Identity Rules

The project has a strong visual identity defined in `docs/DESIGN.md`.

For any meaningful UI work, `docs/DESIGN.md` is mandatory context.

The visual direction is:

- retro-futuristic;
- terminal/system-interface inspired;
- dithered;
- ASCII-inspired;
- technical;
- atmospheric;
- data-driven;
- monospace-first.

Primary typography direction:

- JetBrains Mono.

The UI must NOT regress into:

- generic SaaS dashboard design;
- excessive rounded cards;
- generic soft gradients;
- glassmorphism everywhere;
- large pill-shaped containers;
- generic AI-generated mobile UI;
- decorative cyberpunk effects that harm usability.

The application is still a practical weather product.

Always preserve:

1. immediate current-weather readability;
2. clear risk communication;
3. easy forecast comparison;
4. understandable recommendations;
5. native mobile usability.

Dither, ASCII, noise, technical labels, and experimental visual effects are atmospheric tools, not replacements for information hierarchy.

Do not directly clone any visual reference.

References such as KPRverse are sources of visual principles and atmosphere only.

---

## UI Implementation Workflow

For substantial new screens or major redesigns:

### Before coding

1. Read:
   - `docs/PRODUCT.md`
   - `docs/DESIGN.md`
   - `docs/WEATHER.md` when weather data is involved
   - `docs/PROGRESS.md`
   - relevant architecture/feature documentation.

2. Use relevant project skills:
   - `vercel-react-native-skills`
   - `vercel-composition-patterns`
   - `impeccable`
   - other specific skills only when relevant.

3. Study relevant real-world visual/UI references when reference/browser tools are available.

Research multiple references rather than copying one.

Potential research categories:

- weather applications;
- AQI interfaces;
- UV interfaces;
- environmental monitoring;
- scientific/technical interfaces;
- terminal UI;
- dither design;
- editorial experimental interfaces.

4. Analyze references for:
   - hierarchy;
   - typography;
   - spacing;
   - information density;
   - layout;
   - interaction;
   - visual atmosphere.

5. Synthesize findings according to this project's `DESIGN.md`.

Do not import another product's brand identity.

### During implementation

Use React Native-native patterns.

Prefer reusable semantic components.

Possible design-system primitives may include:

```text
Screen
Section
SystemLabel
Metric
MetricGroup
Divider
Panel
WeatherHero
WeatherIcon
ForecastItem
Advisory
Recommendation
AsciiDecoration
DitherLayer
```

Do not create abstract components before repeated patterns actually exist.

Weather rendering must continue using normalized domain conditions rather than provider-specific codes.

### After implementation

When the application can be rendered:

1. Run the app.
2. Open the relevant screen on emulator/device.
3. Use available mobile inspection/screenshot tooling.
4. Capture the implementation.
5. Visually critique it.

Check:

- hierarchy;
- alignment;
- spacing;
- typography;
- contrast;
- component consistency;
- clipping;
- long Vietnamese text;
- information density;
- small-screen behavior;
- whether the intended visual identity is actually visible;
- whether the UI has fallen back into generic card/SaaS patterns.

6. Use Impeccable for visual critique when useful.
7. Fix meaningful problems.
8. Review the screen again.

Do not declare substantial UI work complete without at least one visual review when rendering tools are available.

---

## Visual Reference Policy

External design references are inspiration.

Agents must:

- inspect multiple references;
- extract reusable design principles;
- adapt patterns to the project's product goals;
- preserve originality.

Agents must NOT:

- replicate one site/app screen exactly;
- copy unique branding;
- copy proprietary assets;
- reproduce a reference's distinctive composition pixel-for-pixel.

The desired outcome is a unique project identity informed by strong design work.

---

## Weather visual rules

Weather conditions, day/night, moon phase, wind, AQI, UV, precipitation, and alerts are separate dimensions.

Do not create combinatorial enums such as:

- `full_moon_heavy_rain`
- `cloudy_windy_night`
- `sunny_high_uv`

Instead compose a visual state from independent data.

Use `docs/WEATHER.md`.

---

## Database change policy

For every schema change:

1. Inspect the current schema.
2. Create a migration.
3. Apply RLS where user-owned data is involved.
4. Review indexes and constraints.
5. Regenerate TypeScript types if used.
6. Update `docs/DATABASE.md` when architecture changes.
7. Record an architectural decision in `docs/DECISIONS.md` when appropriate.

Prefer development/staging data when using Supabase MCP.

---

## Definition of done

A feature is not done when code merely compiles.

For meaningful UI/features, check:

- TypeScript correctness
- loading state
- empty state where applicable
- error state
- permission-denied state where applicable
- offline/network failure behavior
- small-screen behavior
- Android behavior
- iOS behavior when available
- accessibility basics
- no obvious unnecessary re-renders
- no secrets committed
- documentation/state updated

When UI can be rendered, review it visually before declaring it complete.

---

## Project continuity

After completing meaningful work, update `docs/PROGRESS.md`.

Keep it concise and state-based, not a conversation log.

Update:

- completed items;
- current work;
- next recommended task;
- blockers;
- known issues.

If a durable architectural/product decision was made, update `docs/DECISIONS.md`.

Do not silently reverse an existing decision. If a decision needs to change, document:

- previous decision;
- new decision;
- reason;
- consequences.

---

## Working style for agents

Before coding:

1. Understand the requested outcome.
2. Inspect existing implementation.
3. Read relevant docs.
4. Reuse existing components and patterns.
5. Make the smallest coherent change that advances the product.

After coding:

1. Verify the result.
2. Review for regressions.
3. Update documentation/state when needed.
4. Report what changed and any remaining risk.

Do not rewrite unrelated parts of the codebase without a clear reason.
