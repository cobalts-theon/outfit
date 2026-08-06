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

# Decisions still open

Create new ADR entries when these are resolved:

- Final weather provider(s)
- Final AQI standard/classification
- Final UV standard mapping
- Query/cache library
- Client state library
- Exact navigation structure
- Authentication requirement for MVP
- Push notification provider/infrastructure
- Rule-engine storage/execution format
- General-purpose icon library
- Analytics/crash reporting
