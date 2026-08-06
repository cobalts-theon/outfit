# DATABASE.md

## 1. Purpose

Supabase provides shared backend capabilities for the Mobile App and Web Admin.

Primary backend concerns:

- user identity;
- preferences;
- saved locations;
- notification preferences;
- recommendation rules;
- controlled admin management.

Weather API responses should not be persisted by default.

---

## 2. Security principles

- Row Level Security (RLS) is required for user-owned client-accessible tables.
- Mobile clients use the public/anon key plus authenticated user context.
- Never ship a Supabase service-role key in React Native.
- Admin capabilities require explicit authorization.
- Prefer database constraints in addition to client validation.
- Use migrations for schema changes.

---

## 3. Initial schema direction

This is a design target, not an instruction to create all tables immediately.

Create only tables required by the current milestone.

### 3.1 Implemented remote schema — 2026-08-06

The linked Supabase project currently has these application tables only:

```text
profiles
saved_locations
recommendation_rules
recommendation_logs
```

No notification tables, role tables, or other future schema were added during
the initial migration baseline and hardening work. The four existing
`recommendation_rules` rows were preserved, and the rule table shape was not
redesigned.

The committed database representation is:

```text
supabase/migrations/20260806123445_remote_schema_baseline.sql
supabase/migrations/20260806123541_harden_existing_schema.sql
supabase/migrations/20260806124959_consolidate_rule_select_policy.sql
src/types/database.ts
```

---

## 4. Profiles

```text
profiles
```

Current fields:

```text
id uuid PK → auth.users.id
full_name text nullable
avatar_url text nullable
created_at timestamptz
```

The primary key guarantees one profile per Auth user. The foreign key cascades
on Auth user deletion.

Potential preference fields remain future design only and must be added through
a later migration when the mobile flow requires them.

Current constraints:

- one profile per auth user.

RLS:

- user can read/update own profile;
- controlled admin access separately if required.

---

## 5. Saved locations

```text
saved_locations
```

Current fields:

```text
id uuid PK
user_id uuid FK
label text
latitude numeric
longitude numeric
is_default boolean
created_at timestamptz
```

Requirements:

- indexed by `user_id`;
- reasonable coordinate constraints;
- only one default per user if enforcing at DB/application layer.

All three requirements are enforced in the current migration. Timezone,
country code, sorting, and update timestamps remain future design only.

RLS:

- owner CRUD only.

Do not store unnecessary precise location history.

Saved location is different from continuous tracking.

---

## 6. Notification preferences

```text
notification_preferences
```

Possible shape:

```text
user_id uuid PK/FK

severe_weather_enabled boolean
uv_enabled boolean
air_quality_enabled boolean
heavy_rain_enabled boolean
heat_enabled boolean

quiet_hours_enabled boolean
quiet_hours_start time nullable
quiet_hours_end time nullable

created_at timestamptz
updated_at timestamptz
```

Exact categories should follow the final product scope.

RLS:

- owner read/update.

---

## 7. Device push tokens

If push delivery requires persisted device tokens:

```text
push_devices
```

Suggested:

```text
id uuid PK
user_id uuid FK
platform text
push_token text
device_label text nullable
enabled boolean
last_seen_at timestamptz
created_at timestamptz
updated_at timestamptz
```

Security:

- owner can register/update own device;
- delivery backend can read through controlled server privileges;
- token uniqueness policy should be defined.

Do not expose all device tokens to normal clients.

---

## 8. Recommendation rules

```text
recommendation_rules
```

The existing table is intentionally retained without redesign:

```text
id uuid PK
name text
temp_min numeric nullable
temp_max numeric nullable
humidity_min numeric nullable
humidity_max numeric nullable
uv_min numeric nullable
uv_max numeric nullable
aqi_min numeric nullable
aqi_max numeric nullable
weather_condition text nullable
clothing_suggestion text
health_advice text nullable
icon_key text nullable
priority integer
is_active boolean
created_at timestamptz
updated_at timestamptz
```

Do not finalize a generic rule DSL without testing real requirements.

Any later move to JSON conditions, categories, severity, versioning, or audit
metadata is a rule-model redesign and requires a separate decision and
migration.

---

## 9. Rule categories

Potential:

```text
temperature
heat
cold
uv
air_quality
rain
storm
wind
clothing
general
```

Categories are product taxonomy, not medical diagnosis categories.

---

## 10. Admin authorization

Web Admin must not treat "authenticated" as equivalent to "admin".

The temporary implemented authorization method is the trusted Auth app
metadata claim:

```text
app_metadata.app_role = "admin"
```

`recommendation_rules` policies read this value through
`auth.jwt() -> 'app_metadata' ->> 'app_role'`. Normal authenticated users can
read active rules only. Admins can read inactive rules and create, update, or
delete rules.

Do not use `user_metadata` for authorization because users can edit it. JWT
claims are cached until the session token is refreshed, so changing
`app_metadata.app_role` does not take effect in an already-issued JWT until
refresh.

Do not add `user_roles`, Auth Hooks, or a generalized RBAC system until a later
requirement justifies that design.

---

## 11. Recommendation logs

The remote project already contains:

```text
recommendation_logs
```

Current fields:

```text
id uuid PK
user_id uuid nullable FK → auth.users.id
rule_id uuid nullable FK → recommendation_rules.id
location_name text nullable
latitude numeric nullable
longitude numeric nullable
temperature numeric nullable
humidity numeric nullable
uv_index numeric nullable
aqi numeric nullable
weather_condition text nullable
created_at timestamptz
feedback smallint nullable
feedback_at timestamptz nullable
```

Authenticated users can read and insert their own logs. Client updates are
column-limited to `feedback` and `feedback_at`; clients cannot delete logs.
Deleting an Auth user cascades to owned logs, while deleting a rule preserves
the log and sets `rule_id` to null.

Continue to evaluate the table's data-growth and privacy implications before
using it broadly for history or analytics:

- unnecessary data growth;
- privacy;
- duplicate weather-derived information.

---

## 12. Optional notification history

Potential:

```text
notification_history
```

Fields:

```text
id
user_id
category
title
body
trigger_data jsonb
sent_at
status
```

Useful for delivery/debugging, but not mandatory initially.

---

## 13. Weather data storage policy

Default:

> Do not persist all current/hourly forecast API responses in Supabase.

Reasons:

- rapidly stale;
- potentially high volume;
- provider licensing/caching constraints may apply;
- unnecessary database growth.

Persist only if needed for:

- audit;
- historical feature;
- recommendation reproducibility;
- analytics;
- provider caching strategy.

Any such decision must be documented.

---

## 14. RLS checklist

For every user-owned table:

- enable RLS;
- SELECT policy;
- INSERT policy;
- UPDATE policy;
- DELETE policy if needed;
- ensure `auth.uid()` ownership logic;
- test with two separate users.

For admin tables:

- normal users should not modify rules;
- admin write access must be enforced at database/backend level, not only hidden in UI.

Implemented policies:

- `profiles`: authenticated owner SELECT and UPDATE only;
- `saved_locations`: authenticated owner SELECT, INSERT, UPDATE, and DELETE;
- `recommendation_logs`: authenticated owner SELECT and INSERT, plus owner
  updates limited by grants to `feedback` and `feedback_at`; no client DELETE;
- `recommendation_rules`: authenticated users read active rules; admins with
  `app_metadata.app_role = "admin"` read all rules and perform writes;
- `anon`: no application-table privileges.

Policy helper calls use `(select auth.uid())` and `(select auth.jwt())` so
Postgres can cache stable claim values per statement. Ownership columns used by
RLS are indexed.

---

## 15. Indexing

Likely indexes:

```text
saved_locations(user_id)
push_devices(user_id)
recommendation_rules(enabled, category)
```

Do not add speculative indexes everywhere.

Use query patterns and Supabase/Postgres advisor feedback.

Implemented indexes:

```text
saved_locations_user_id_idx
saved_locations_one_default_per_user_idx
recommendation_logs_user_created_at_idx
recommendation_logs_rule_id_idx
recommendation_rules_active_priority_idx
```

The unique partial saved-location index enforces at most one default location
per user. The final performance advisor run reports the active-rule index as
unused at INFO level because it is new and the application has not generated
production query statistics yet; it is retained for the expected active-rule
priority query.

Implemented constraints also validate saved-location labels and coordinates,
recommendation measurement ranges, rule min/max bounds, non-negative UV/AQI,
feedback values, and cascading ownership foreign keys. Deleting a rule sets a
historical log's nullable `rule_id` to null.

---

## 16. Migrations

All durable schema changes should exist as migrations.

Recommended:

```text
supabase/
├── migrations/
└── functions/
```

Migration workflow:

1. inspect current schema;
2. create migration;
3. apply to development;
4. verify RLS;
5. test;
6. update generated types;
7. document significant architecture changes.

### Existing-project baseline decision

The preferred official workflow was evaluated first. `npx supabase db pull`
was not safely practical in the execution environment because the repository
had no Supabase CLI installation/configuration, CLI credentials and database
password were unavailable, and the installed Podman runtime could not start in
the sandbox. Current Supabase CLI documentation also requires a linked project
and a running Docker-compatible daemon for `db pull`.

Therefore the initial baseline is MCP-derived and idempotent. It was built from
the remote Postgres catalogs, parsed and preflighted in a rolled-back remote
transaction, then recorded through the project-scoped Supabase migration API.
The local filenames match the remote migration-history versions.

Future environments with a working official CLI should use the normal CLI
workflow against these committed migrations; do not create a second competing
baseline.

---

## 17. Type generation

If Supabase generated TypeScript types are used:

- regenerate after schema changes;
- avoid manually editing generated types;
- keep application domain models separate from database row types when semantics differ.

Generated types are stored at `src/types/database.ts`. They were generated from
the remote project only after the auth-trigger test, two-user RLS matrix, and
advisor checks passed.

### Verification performed on 2026-08-06

- Hosted Supabase Auth signup created one `auth.users` row and exactly one
  matching `profiles` row through `on_auth_user_created`.
- A complete two-user transaction tested positive and negative SELECT, INSERT,
  UPDATE, and DELETE behavior across all four public tables, including both
  directions of cross-user isolation.
- The same matrix verified normal-user versus admin rule access using
  `app_metadata.app_role = "admin"`, active/inactive visibility, anonymous
  denial, ownership-transfer denial, and the new integrity constraints.
- Test rows were rolled back; the two disposable auth users were deleted and
  cascade cleanup left zero orphan profiles.
- Final Supabase security advisors: zero findings.
- Final Supabase performance advisors: zero warnings; one expected INFO notice
  for the newly created, not-yet-used active-rule index.

---

## 18. Supabase MCP usage

When an agent uses Supabase MCP:

Prefer:

- project-scoped connection;
- development project;
- read-only mode for inspection when write access is unnecessary.

Before destructive or broad changes:

- inspect schema;
- explain intended migration;
- avoid direct production experimentation.

---

## 19. Edge Functions

Potential uses later:

- rule evaluation requiring trusted backend context;
- notification triggering;
- admin-controlled operations;
- scheduled processing.

Do not move simple client-safe logic to Edge Functions without benefit.

Do not put secrets in the mobile app if an API integration requires server-side credentials.

---

## 20. Initial implementation order

Recommended:

1. Create Supabase project/config.
2. Authentication only if required by current user flow.
3. `profiles`.
4. `saved_locations`.
5. `notification_preferences`.
6. `recommendation_rules`.
7. Admin authorization.
8. Push device registration/delivery infrastructure.

Do not build the full database before the first working weather vertical slice.
