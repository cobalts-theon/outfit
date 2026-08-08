---
name: "Hệ thống dự báo thời tiết và hỗ trợ sức khỏe người dùng"
description: "A practical adaptive weather assistant shaped as a restrained environmental field terminal."
---

<!-- SEED: established with the user before implementation; re-run $impeccable document once there's code to capture the actual tokens and components. -->

# Design System: Atmospheric Field Terminal

## Overview

### Creative North Star

**The Atmospheric Field Terminal**

The product should feel like a personal environmental instrument: immediate enough for a glance before going outdoors, atmospheric enough to make changing conditions tangible, and calm enough to support practical decisions. It borrows the discipline of field equipment, terminal readouts, scientific monitoring, and dithered raster graphics without becoming a literal hardware replica or a role-playing interface.

The primary product surface is one adaptive React Native / Expo application for Android and iOS. Expo web may support development, testing, or secondary compatibility, but it does not define the visual system.

The interface must preserve the product hierarchy:

**Now → Risk → Next → Action**

Current conditions establish the scene. The most important environmental risk interrupts that scene clearly. Near-term change gives the user temporal context. Recommendations turn the reading into an understandable next action.

### Visual World

- Near-black, graphite, and charcoal create a dry instrument-panel foundation rather than a glossy luxury surface.
- Dithered atmospheric fields make weather, daylight, particulate density, and uncertainty feel physical.
- Restrained ASCII marks, ruled lines, coordinates, timestamps, and system labels provide technical rhythm.
- Composed weather imagery treats sky, celestial state, precipitation, wind, atmosphere, and alerts as independent dimensions.
- Sparse technical accents indicate state, focus, or a meaningful data change; they are not decoration.
- Motion is controlled, mechanical, and atmospheric: measured sweeps, stepped reveals, gentle drift, and precise state transitions.

KPRverse-like and other experimental interfaces may inform atmosphere, typography, and craft. They are reference inspiration only. No screen, composition, branding device, proprietary asset, or distinctive interaction should be cloned.

### Product Principles

1. **Usability is the instrument's purpose.** Atmosphere must strengthen comprehension, never compete with it.
2. **Meaning precedes ornament.** Temperature, risk, timing, and action remain legible before texture or motion is considered.
3. **Environmental dimensions stay independent.** Day/night, moon, wind, AQI, UV, precipitation, and alerts compose a scene; they do not collapse into combinatorial visual states.
4. **Native behavior earns trust.** Platform navigation, safe areas, accessibility, permissions, text scaling, and touch behavior should feel correct on both Android and iOS.
5. **Texture supports hierarchy.** Dither and ASCII create identity at the edges of attention, not in the path of essential reading.

## Colors

### Foundation

The palette is dark, restrained, and materially dry. Exact color values are **[to be resolved during implementation]** after contrast testing on real Android and iOS displays.

- **Instrument Black** — primary application ground; near-black without crushing detail.
- **Graphite Field** — broad atmospheric and secondary regions.
- **Charcoal Surface** — grouped information and interactive zones.
- **Signal White** — primary text and high-value readings.
- **Muted Ink** — supporting labels, timestamps, units, and dividers.
- **Technical Accent** — one restrained non-semantic accent for focus, selection, and live-system cues.

### Semantic Color

AQI, UV, warning, danger, success, and provider or official alert states retain their domain meaning. Their exact mapping and the selected AQI standard are **[to be resolved during implementation]** with the weather domain documentation. Semantic colors must not be recolored merely to harmonize with the identity palette.

Severity must never rely on color alone. Pair color with a label, symbol, placement, pattern, or explicit action.

### Color Rules

- **Signal Budget:** use the technical accent only for interactive focus, live status, selected data, or a meaningful change.
- **Meaning Before Mood:** semantic risk colors override decorative color preferences.
- **Night Is Data, Not Theme:** nighttime weather changes the environmental scene; it does not silently switch the application theme.
- Tonal transitions must be weather-driven or structurally useful. Avoid soft decorative gradients and generic AI-style color washes.
- Dither may bridge tones or suggest particulate density, but it must not reduce text or chart contrast.

## Typography

### Primary Identity Typeface

**JetBrains Mono** is the primary identity and display typeface. Use it for major environmental readings, metric values, compact section labels, timestamps, coordinates, system status, and short technical phrases.

A complementary body and native-control type strategy is **[to be resolved during implementation]**. Long Vietnamese guidance may use the platform system face when it improves reading comfort, text scaling, or native control trust.

### Type Roles

- **Environmental Display** — current temperature and the single dominant reading; large, calm, and immediately scannable.
- **Metric Value** — AQI, UV, precipitation, wind, and forecast values; tabular numerals where supported.
- **Screen Title** — concise location or task context.
- **System Label** — compact metadata and section identifiers; uppercase only when the text remains short.
- **Body Guidance** — natural Vietnamese sentences for risks and recommendations.
- **Annotation** — units, timestamps, source state, and secondary context.

Exact font sizes, weights, tracking, and line heights are **[to be resolved during implementation]** through device testing and Dynamic Type validation.

### Typography Rules

- **Numbers Lead:** value, unit, and label form one readable measurement, with the value visually dominant.
- **Labels Do Not Shout:** technical uppercase is a navigational texture, not the default voice.
- Preserve Vietnamese diacritics, comfortable line length, and natural wrapping at large accessibility sizes.
- Avoid fake seven-segment, novelty pixel, or terminal fonts for body copy.
- Do not compress warning or recommendation language to preserve a decorative layout.

## Layout

### Structure

The default structure is a ruled, single-column information feed with strong vertical sequencing. Use spacing, alignment, dividers, tonal fields, and deliberate density before introducing container chrome.

Global order follows **Now → Risk → Next → Action**. Secondary readings and deeper environmental detail follow only after the user can answer: What is happening? What matters? What changes soon? What should I do?

Exact spacing units, breakpoints, and density tiers are **[to be resolved during implementation]**.

### Alignment and Density

- Establish a consistent measurement grid for labels, values, units, timestamps, and dividers.
- Allow atmospheric artwork to bleed or layer behind content only when a protected reading zone preserves contrast.
- Prefer a few strong regions over a mosaic of equal cards.
- Use horizontal scrolling only for naturally sequential data such as hourly time steps, with clear position and accessible alternatives.
- Dense technical detail belongs in progressive disclosure, not the first glance.

### Adaptive Native Behavior

- Respect iOS safe areas, edge-swipe navigation expectations, Dynamic Type, and a minimum 44-point touch target.
- Respect Android edge-to-edge insets, system and predictive back behavior, font scaling, and a minimum 48 dp touch target.
- Treat small Android screens and long Vietnamese text as baseline cases, not later exceptions.
- On wider layouts, adapt information relationships instead of stretching a phone column indefinitely.
- Keyboard, permission, loading, offline, and error states must preserve the same hierarchy as the successful state.

## Elevation & Depth

The system is flat by default. Depth comes primarily from tonal separation, ruled borders, dither density, atmospheric layering, and controlled occlusion inside weather imagery.

- Use borders and contrast before shadows.
- Reserve elevation for transient or platform-native layers such as sheets, menus, and critical overlays.
- Use native material behavior where it improves platform comprehension; do not apply glass treatment across the interface.
- Any glow must communicate an active signal or severe state and remain restrained enough to preserve text clarity.
- Exact border, shadow, and overlay values are **[to be resolved during implementation]**.

## Shapes

- Favor rectangular and gently clipped geometry with crisp alignment.
- Use small, restrained corner radii only where they improve grouping, touch affordance, or native consistency.
- Preserve native control shape and behavior when a custom shape would reduce familiarity or accessibility.
- Atmospheric weather forms may be organic and dithered; interface chrome remains geometric and disciplined.
- Avoid excessive rounded cards, oversized pills, ornamental notches, and decorative cyberpunk framing.
- Exact radii, stroke weights, and clipping language are **[to be resolved during implementation]**.

## Do's and Don'ts

### Do

- Make current conditions, the primary risk, near-term change, and recommended action understandable in that order.
- Use dither, ASCII, noise, coordinates, and system labels as restrained supporting motifs.
- Keep semantic AQI, UV, warning, and danger colors meaningful and accessible.
- Compose day/night, moon, wind, precipitation, AQI, UV, and alerts as independent dimensions.
- Use native Android and iOS navigation, permissions, feedback, and accessibility patterns.
- Test long Vietnamese text, screen readers, text scaling, reduced motion, color contrast, and small screens.
- Keep motion measured, purposeful, interruptible, and replaceable with a clear reduced-motion state.
- Give severe hazards and official alerts conservative, unmistakable treatment.

### Don't

- Do not clone KPRverse, an oscilloscope, an early desktop GUI, or any single visual reference.
- Do not regress into a generic SaaS dashboard or a grid of interchangeable cards.
- Do not use glassmorphism everywhere, pastel weather-app styling, generic AI gradients, or excessive neon cyberpunk.
- Do not bury the primary temperature, risk, or action under decorative data density.
- Do not let dither, ASCII, noise, animation, or atmospheric imagery impair reading or touch.
- Do not rely on color alone for status or severity.
- Do not force terminal language into Vietnamese copy when plain language is clearer.
- Do not equate nighttime weather with dark mode or combine independent weather dimensions into provider-specific visual enums.
