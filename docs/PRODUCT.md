# Product

<!-- impeccable:product-schema 1 -->

## Product Name

**Hệ thống dự báo thời tiết và hỗ trợ sức khỏe người dùng**

This is the current working/provisional product name. A final brand name has
not been selected.

Working description:

> A weather and outdoor assistant that combines weather, air quality, UV,
> location, and rule-based recommendations so people can quickly understand
> current conditions, recognize environmental risk, and decide what to do or
> wear before going outside.

## Platform

adaptive

The primary product surface is one React Native / Expo native application that
adapts appropriately across Android and iOS. Expo web may remain available for
development, testing, or secondary compatibility, but it is not the primary
product surface.

A separate ReactJS Web Admin is a secondary operational surface for managing
recommendation rules. It is not part of the adaptive end-user mobile surface.

## Users

Primary users are members of the general public checking local conditions
before commuting, studying, exercising, travelling locally, or spending time
outdoors.

They need to:

- understand current weather without interpreting specialist data;
- identify the most important environmental or weather-related risk;
- compare near-term changes before deciding when or how to go outside;
- receive practical health/outdoor and clothing guidance;
- account for strong sun, poor air quality, heat, rain, wind, or rapidly
  changing conditions.

The product must not assume meteorological expertise.

## Product Purpose

Traditional weather applications often present many measurements while leaving
the user to interpret their practical meaning. This product exists to answer
four questions within a few seconds:

1. What is the weather now?
2. Is there an environmental risk?
3. What will happen next?
4. What should I do or wear?

The product is successful when a user can open it and quickly understand the
current conditions, the most important risk, the near-term forecast, and a
useful action or recommendation.

## Positioning

The product is a general-audience weather and outdoor assistant that prioritizes
interpretation and action rather than presenting a dashboard of undifferentiated
measurements.

Its differentiating mechanism is a rule-based recommendation layer that turns
normalized weather and environmental conditions—including temperature,
apparent temperature, UV, AQI, wind, precipitation, humidity, and alerts—into
prioritized health/outdoor and clothing guidance.

The Home product hierarchy is:

```text
Now → Action → Why → Next
```

Weather remains the evidence layer, but the first customer task is deciding
what to do. Risk and environmental readings explain the recommendation instead
of delaying it.

The application should behave like:

> It is 31°C, feels like 37°C, UV is very high, and the next two hours are dry.
> Wear light clothing, use sun protection, and avoid prolonged direct sun around
> midday.

It should not behave like:

> Here are 20 weather numbers.

## Operating Context

### Open the app

1. Obtain or recall the user's location.
2. Load current weather and environmental conditions.
3. Present temperature, main condition, primary risk, and the next-hours
   preview immediately.
4. Allow users to expand into forecasts and secondary details.

### First location permission

1. Explain why location is useful.
2. Request operating-system permission.
3. If allowed, load local conditions from device coordinates.
4. If denied or unavailable, offer manual location search and selection.
5. Never permanently block the product because GPS permission is denied.

### Check risk

1. Prioritize the most important active risk.
2. Explain the relevant indicator in understandable language.
3. Provide a practical action.
4. For severe hazards, foreground official warnings and conservative guidance.

### Plan the next hours

1. Compare hourly temperature, condition, wind, and precipitation changes.
2. Identify meaningful transitions.
3. Decide when to leave or whether to carry rain, sun, warmth, or wind
   protection.

### Manage preferences

Users may configure units, saved/default locations, notification categories,
and quiet behavior when those features are implemented.

### Web Admin

Authorized administrators manage recommendation scenarios/rules, including
enabled state, thresholds supported by the current model, recommendation
content, and lifecycle metadata. The Web Admin is secondary to the mobile
product and must not delay the mobile core experience.

## Capabilities and Constraints

### MVP capabilities

- current location permission and GPS;
- manual-location fallback;
- current weather, temperature, feels-like temperature, and condition;
- day/night-aware weather representation;
- hourly and daily forecasts;
- wind speed, direction, and gust when available;
- humidity and precipitation probability/intensity;
- UV and AQI;
- basic weather alerts;
- health/outdoor and clothing recommendations;
- saved/default location behavior;
- loading, error, permission-denied, and offline-aware states;
- push-notification foundation/preferences;
- Supabase-backed authentication, user data, saved locations, and controlled
  recommendation rules where required.

### Secondary capabilities

- sunrise and sunset;
- moon phase and illumination;
- moonrise/moonset when provider data supports it;
- visibility, pressure, and dew point;
- pollutant detail such as PM2.5 and PM10;
- multiple saved locations;
- recommendation explanations and reasons;
- recent important notification or alert history when justified.

### Product and technical constraints

- Provider responses must be normalized before reaching business logic or UI.
- UI and recommendations must not depend on provider-specific weather codes.
- Weather condition, day/night, moon, wind, precipitation, UV, AQI, and alerts
  remain independent dimensions rather than combinatorial condition enums.
- Remote/server state and local client state must have separate ownership.
- Mobile behavior must respect Android and iOS conventions, safe areas, system
  navigation, touch targets, text scaling, reduced-motion settings, and
  permission-denied paths.
- Service-role secrets must never ship in the mobile client; RLS remains a
  backend security boundary.
- Weather responses are not persisted by default without a concrete product,
  history, analytics, or licensing requirement.
- The current recommendation-rule schema is not a finalized general-purpose
  rule DSL and must not be redesigned without tested requirements.
- Login is optional for weather and manual-location use, but required for
  Supabase-backed saved-location synchronization. AQI standard, notification
  delivery infrastructure, and rule-evaluation placement remain explicit open
  decisions.

### Health and safety boundary

Recommendations provide general environmental wellness and outdoor-safety
guidance only. The product does not diagnose disease, prescribe or provide
medical treatment, replace professional medical advice, or infer medical
conditions from weather data.

Personal health profiles, if considered later, require separate privacy and
safety review.

### Recommendation contract

Recommendations should be concise, explainable, tied to measured conditions,
conservative under high-risk conditions, and understandable without specialist
knowledge. A recommendation may include:

- title;
- message;
- category;
- severity;
- reason;
- triggering measurements or rules;
- optional action.

Example:

```json
{
  "category": "uv",
  "severity": "high",
  "title": "UV rất cao",
  "message": "Hạn chế tiếp xúc trực tiếp với nắng kéo dài và sử dụng biện pháp chống nắng.",
  "reason": "UV index = 9"
}
```

### Information hierarchy

The Home experience follows:

1. **Now** — concise location, weather, temperature, condition, and feels-like context.
2. **Action** — prioritized clothing, sun, rain, wind, heat, or outdoor guidance.
3. **Why** — the most important risk and the measured reason behind the guidance.
4. **Next** — a compact near-term forecast for planning and comparison.
5. **Secondary details** — humidity, pressure, visibility, sunrise/sunset,
   moon, and pollutants.

Not all measurements receive equal hierarchy.

### Non-goals for the initial MVP

- social or community features;
- chat;
- complex AI-generated medical advice;
- climate-history analytics;
- arbitrary global meteorological research tooling;
- hundreds of hard-coded weather combinations;
- highly elaborate 3D weather scenes;
- an admin-heavy platform built before the mobile core experience.

## Brand Commitments

- Keep **Hệ thống dự báo thời tiết và hỗ trợ sức khỏe người dùng** as the
  working/provisional product name until a final brand name is approved.
- No finalized logo or authoritative brand-identity assets exist yet.
- The current visual direction is documented separately in `docs/DESIGN.md`.
  It is a design commitment for current work, not evidence of validated user
  preference.
- Do not invent a final brand, official logo, proprietary visual assets, or
  external claims during product or design work.

## Evidence on Hand

Durable project evidence currently consists of:

- product requirements and flows in this file;
- architecture decisions in `docs/ARCHITECTURE.md` and `docs/DECISIONS.md`;
- weather-domain rules in `docs/WEATHER.md`;
- backend state and security decisions in `docs/DATABASE.md`;
- implementation status in `docs/PROGRESS.md`;
- a runnable Expo 57 / React Native project scaffold;
- an existing Supabase schema, migrations, RLS verification, and generated
  TypeScript database types.

Evidence that does **not** currently exist:

- formal or validated user research;
- approved research findings;
- validated preference for the visual direction;
- finalized logo or brand assets;
- testimonials, case studies, adoption metrics, benchmarks, press, or other
  external product proof;
- approved external marketing or medical claims.

Future work must not fabricate absent evidence.

## Product Principles

1. **Interpret before displaying.** Convert measurements into clear meaning and
   prioritized actions instead of presenting an undifferentiated data dump.
2. **Now → Action → Why → Next.** On Home, surface the useful action immediately
   after current context; weather and environmental data remain its evidence.
3. **Practical and conservative guidance.** Recommendations must be explainable,
   useful outdoors, and safely bounded away from diagnosis or treatment.
4. **Location is helpful, not coercive.** Use native location when permitted and
   preserve a useful manual fallback when it is not.
5. **Native trust on both platforms.** Maintain one coherent product while
   respecting Android and iOS interaction, navigation, accessibility, and
   system-behavior expectations.

## Accessibility & Inclusion

- Support Android and iOS system text scaling and avoid layouts that depend on
  fixed text sizes.
- Meet native touch-target expectations and protect interactive content with
  safe-area and system-bar insets.
- Communicate risk with text and hierarchy as well as color.
- Provide meaningful accessibility labels and keep decorative content out of
  screen-reader output.
- Respect reduced-motion or remove-animation settings.
- Avoid flashing, aggressive glitch effects, or motion that interferes with
  reading weather and safety information.
- Support long Vietnamese labels and recommendations without clipping while
  keeping language understandable to non-specialists.
- Keep the app useful when location permission, GPS, or network access is
  unavailable.
