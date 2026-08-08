---
version: 1
slug: "src-app-index-tsx"
primary_target: "src/app/index.tsx"
related_targets: ["src/app/_layout.tsx"]
---

# Home Surface Brief

## Scope

- **Target:** `src/app/index.tsx`
- **Related shell:** `src/app/_layout.tsx`
- **Mode:** Operate
- **Surface:** Primary mobile Home screen for the adaptive Android and iOS application
- **Status:** Pre-implementation design context; this brief does not authorize UI or feature changes

## User Job

Help a general-audience user decide what conditions are like now, which environmental risk deserves attention, what changes next, and what practical health/outdoor or clothing action to take before going outside.

The surface provides general wellness and safety guidance only. It must not imply diagnosis, treatment, or a replacement for professional or official advice.

## Information Contract

The Home hierarchy is fixed:

1. **Now** — location context, current time/state, dominant temperature, normalized condition, and feels-like context.
2. **Risk** — one primary environmental or official-alert concern with severity, reason, and immediate relevance.
3. **Next** — the most decision-relevant near-term change, followed by an accessible hourly sequence.
4. **Action** — practical recommendations for outdoor activity, health precautions, and clothing using a clear WHAT / WHY / DO structure.

Secondary details such as humidity, pressure, visibility, sunrise, sunset, moon phase, pollutant breakdown, and extended context follow the first decision path. They must not compete equally in the opening viewport.

## First Expression

The first viewport should read as a live environmental field terminal, not a dashboard:

- A compact safe-area header establishes location, freshness, and system state.
- A dominant weather scene carries the current temperature and normalized condition. Sky, celestial state, precipitation, wind, atmosphere, and particulate cues remain independently composable.
- A single risk rail or advisory interrupts the scene with the highest-priority concern and an explicit next action.
- The beginning of the near-term sequence makes change over time visible without pushing the primary action out of reach.

The memorable moment is the contrast between a living dithered environmental field and one concise, sharply legible risk/action signal. Atmosphere surrounds the decision; it does not obscure it.

## Visual and Interaction Direction

- Apply the **Atmospheric Field Terminal** system from `docs/DESIGN.md`.
- Use JetBrains Mono for identity, readings, labels, timestamps, and concise system language.
- Prefer ruled sections, aligned measurements, dry tonal fields, and sparse ASCII markers over rounded card stacks.
- Use a compact `LABEL // VALUE` grammar only where it improves scanning.
- Keep decorative ASCII hidden from assistive technology.
- Use semantic AQI, UV, warning, and danger treatments with text or symbols, never color alone.
- Reserve accent and animation for current selection, live status, state change, or risk.
- Avoid an animated icon in every hourly item; repeated motion would dilute hierarchy and waste attention.

## Home Content Guidance

### Current Conditions

- Temperature is the dominant reading.
- Condition text uses normalized domain conditions, never raw provider codes.
- Feels-like, locality, observation freshness, and day/night context remain visible but subordinate.
- Weather illustration is compositional rather than a combinatorial icon enum.

### Primary Risk

- Select the highest-priority relevant risk across official alerts, AQI, UV, heat/cold, wind, precipitation, and related conditions.
- Communicate severity with label, structure, and action in addition to color.
- If no elevated risk exists, show a calm all-clear state without inventing urgency.
- Severe conditions emphasize official alerts and conservative safety guidance.

### Near-Term Forecast

- Show time, normalized condition, temperature, and decision-relevant precipitation or risk context.
- Mark the current hour clearly.
- Make daylight transitions understandable without equating them to application theme.
- Keep the sequence usable with screen readers and large text; horizontal scroll is not the only carrier of meaning.

### Recommendations

- Use plain Vietnamese and the sequence **WHAT / WHY / DO**.
- Prioritize a small number of specific actions over a long generic checklist.
- Clothing advice must be practical and connected to current or near-term conditions.
- Medical diagnosis, treatment instructions, and unsupported certainty are out of scope.

## Required States

- Initial loading with real progress or skeleton structure, not a fake completed reading.
- Refreshing while preserving the last trustworthy reading.
- Stale or offline data with a visible observation timestamp and retry path.
- Location permission not requested, denied, restricted, or unavailable, with a manual-location alternative.
- GPS timeout or imprecise location.
- Partial weather/environmental provider data without collapsing the entire screen.
- No active elevated risk.
- Severe official alert or dangerous environmental condition.
- Day, night, sunrise/sunset transition, and reduced-motion alternatives.
- Long Vietnamese copy, large accessibility text, screen reader navigation, and high-contrast needs.
- Compact Android screens, display cutouts, gesture navigation, and iOS safe areas.

## Native Constraints

- Minimum interactive target: 44 points on iOS and 48 dp on Android.
- Preserve iOS edge-swipe expectations and Android system/predictive back behavior.
- Respect safe areas and edge-to-edge insets without wasting the first viewport.
- Prefer native controls and feedback when customization does not add product meaning.
- Do not make drag, hover, long-press, color, animation, or spatial memory the only way to reach essential information.
- Reduced motion replaces continuous drift, sweeps, and transitions with stable state changes.

## Avoid

- An equal-weight grid of weather metric cards.
- A hero that contains every available measurement.
- Glass panels, soft pastel gradients, large pill containers, or indiscriminate neon glow.
- Literal imitation of hardware bezels, desktop windows, command consoles, or KPRverse compositions.
- Terminal jargon that makes Vietnamese guidance less natural.
- Provider-specific weather codes or combined visual enums in the UI.
- Decorative texture crossing essential readings or touch targets.

## Decisions Deferred to Implementation

- Exact color values and semantic mappings.
- Secondary body typeface and native control type strategy.
- Spacing scale, responsive breakpoints, radii, border weights, and density tiers.
- Dither rendering technique and performance budget.
- Weather icon/scene asset family and animation implementation.
- AQI standard and provider-specific normalization details.
- Final navigation structure and any reusable Home components.

These decisions must be resolved from real implementation constraints, device testing, accessibility validation, and the weather/database domain documents. They must not be inferred from the Expo starter.
