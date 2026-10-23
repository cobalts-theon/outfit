# Product

<!-- impeccable:product-schema 1 -->

## Product Name

**Hệ thống dự báo thời tiết và hỗ trợ sức khỏe người dùng**

This is the current working/provisional product name. A final brand name has
not been selected.

Working description:

> A daily-life recommendation assistant that uses weather, air quality, UV
> and near-term forecasts to help people decide what to do, adjust or postpone.
> Environmental measurements explain each recommendation.

## Platform

adaptive

The primary product surface is one React Native / Expo native application that
adapts appropriately across Android and iOS. Expo web may remain available for
development, testing, or secondary compatibility, but it is not the primary
product surface.

Supabase Dashboard is the operational surface for data and versioned walking
policies. A separate Web Admin is deferred (ADR-032).

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

1. What should I do now?
2. What should I change or postpone?
3. What should I prepare for the next few hours?
4. Which weather measurements support this advice?

The product is successful when a user can open it and quickly understand the
most useful action, its environmental evidence, and any near-term adjustment
to their activities.

## Positioning

The product is a general-audience daily-life recommendation assistant that prioritizes
interpretation and action rather than presenting a dashboard of undifferentiated
measurements.

Its differentiating mechanism is a rule-based recommendation layer that turns
normalized weather and environmental conditions—including temperature,
apparent temperature, UV, AQI, wind, precipitation, humidity, and alerts—into
prioritized health/outdoor and clothing guidance.

The Home product hierarchy is:

```text
Brief context → Priority action → Other activity decisions → Upcoming adjustments → Optional weather evidence
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
3. Present a brief location/conditions summary followed immediately by the
   most useful recommendation, its evidence and other supported activity advice.
4. Show near-term activity preparation when fresh forecasts support it.
5. Keep the large weather display, measurements and forecast behind an optional
   “Xem chỉ số & dự báo làm căn cứ” control.

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

### Guidance for the day and available time (historical detail; current scope below)

Home’s “Nên làm ngay” combines current weather precautions with activities
supported by environmental rules and adjusted to the current local daypart.
Generic routines based solely on the clock are not added. Users do not select a daypart. Keep the original SVG assets and neo brutalism with one action heading and its
supporting reason. Highlight the first priority recommendation; remove repeated
metadata and row labels. There are no Done, Undo or 15-minute reminder controls.
Recommendations are read-only and are not hidden by old completion records.
Automatic weather alerts continue without task buttons; old manual reminders
are canceled when the app starts.

Walking appears directly in Do now when weather and the current local daypart
support it; the hamburger menu has no separate walking/guidance entry.
The legacy planning route still compares 30/60/90-minute activities within selected
availability. It supports arbitrary minute starts, including 17:10, and checks
surrounding hourly samples without inventing finer-resolution measurements.
Evening suggestions include explicit route-lighting and visibility preparation.

Authenticated users save activity plans to their account. Legacy on-device guest
storage remains compatible, but product routes require authentication. Plans can
be cancelled, completed after their end time, rescheduled, or deleted. Home recommendations do not track completion. Saved
walking advice remains a snapshot. Notifications are locally scheduled; remote
push and weather monitoring while the app is closed require future infrastructure.

### Operations

Use Supabase Dashboard to manage data and publish immutable walking-policy
versions. No separate ReactJS Web Admin is in the current delivery scope.

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
- Weather, recommendations, manual locations and hour comparisons are public.
  Login is required for personal sync and saving hours (ADR-053 supersedes ADR-044). AQI standard, notification
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
2. **Brief context → Priority action → Other activity decisions → Upcoming adjustments → Optional weather evidence.** On Home, surface the useful action immediately
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

## Initial lifestyle preferences

New accounts created in the app see a separate two-step sliding pop-up after sign-in to select habitual
activities and available dayparts. Nothing is preselected. Users can defer and
edit later in Account → Thói quen sinh hoạt; existing accounts opt in there.
Home uses these choices to filter ordinary laundry/outdoor advice and prioritize
relevant activities during selected dayparts. Weather evidence remains required,
and safety warning/danger advice is preserved. Household chores remain secondary,
with no laundry suggestions at evening/night. Drying needs a dry daylight forecast. This is preference-based ranking, not
a predictive learning model. Time selection currently uses dayparts, not exact
free-time intervals. Rain notification timing is unchanged; wording now prioritizes travel preparation.

Current initial setup is the full “Trước khi bắt đầu” page, with three steps:
needs, travel/outdoor exposure, and exact free-time dropdowns. Users can defer
or edit later in Account. Travel and exposure answers adjust weather-supported
advice, while selected hours govern ordinary outdoor opportunities.

## Access and account

Home, Forecast and environmental activity assessment open without registration.
Account login is offered when saving hours or locations and synchronizing personal
preferences. Signup keeps Gmail API delivery, six-digit OTP confirmation and
isolated password recovery. Profile shows name, email and private avatar images, with choose/change/delete
controls restored at the user's explicit request.

## Environmental activity guidance — current scope (ADR-053)

Home presents environmental precautions first, then optional opportunities,
upcoming changes and weather evidence. Show up to three ordinary precautions by
default, always expose every warning/danger, and allow expanding the rest. Do not
show fixture recommendations as actionable advice before live data is available.

The hour chooser offers walking, running, work/school travel and general outings.
Transport and outdoor exposure affect evaluation; old shopping IDs remain readable
as outings. Choosing an interest does not create a work/school schedule.
Preparation is read-only and weather-driven, without generic shoes/bag tasks.
Results explain the underlying hourly samples rather than imply minute-accurate
forecasts or health probabilities. No numerical score is presented as health advice.

Signed-in users may save a suitable/caution hour, opt into a local pre-start
reminder, inspect its evidence or remove it. No completion tracking, history
management, interactive packing checklist, two-time comparison or rescheduling UI.
Existing rows and repository compatibility remain; no automatic data deletion.

Saved availability is optional in onboarding and fills the hour chooser after
session restoration. It can be changed for each search. Sunlight and visibility
remain useful evidence; phase of the Moon and pressure are omitted from Forecast.
Automatic changes are evaluated only while foregrounded/on app return; remote
background monitoring and server push remain outside the delivered scope.


## Weather-grounded wording and current colors — 2026-10-22

Every recommendation must be supported by fresh measurements or forecast evidence.
Ordinary measured temperature conditions can support gentle clothing advice without
claiming good AQI/UV or a safe outdoor window. When late at the selected location
(22:00–04:59), this comfort advice fits rest, retaining actual temperature/feels-like
values in its reason. Time alone never creates a recommendation. Actual hazards
remain first, and necessary nighttime travel advice stays conditional. No inferred
work/school departure or tomorrow-weather claim from interests/current conditions.

Do now uses white/amber/orange surfaces and neutral or warning badges, with no
blue/green advice fills. Colored primary/secondary buttons remain strong; the
hour chooser entry may use green outside this panel. Preserve avatar editing,
four activity choices and the existing neobrutalist identity.


## Work/school timing — current behavior

Choose a date, intended departure, estimated travel minutes and transport. The
app evaluates conditions during that specific journey and recommends preparation.
This is travel time, not the work/school session. It does not move departure into
a more favorable free-time window. Walking, running and general outings continue
to find windows within the user's chosen availability.
