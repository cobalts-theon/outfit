---
name: "Hệ thống dự báo thời tiết và hỗ trợ sức khỏe người dùng"
description: "A light-only mobile weather public bulletin that turns conditions into clear risk and action."
colors:
  ink: "#101010"
  ink-muted: "#424242"
  paper: "#FFFDF5"
  field: "#FFFFFF"
  pale-blue-field: "#D6E5FF"
  cobalt: "#1769FF"
  cobalt-muted: "#234F8F"
  sunflower: "#FFD21C"
  attention-surface: "#FFF0A3"
  mint: "#BDF4CF"
  calm: "#137A4B"
  calm-surface: "#C7F6D8"
  coral: "#FF6B5A"
  warning: "#E86D00"
  warning-surface: "#FFD1A8"
  danger: "#D92D27"
  danger-surface: "#FFC5BC"
  unavailable: "#626262"
  unavailable-surface: "#E6E6DF"
typography:
  brand:
    fontFamily: "SyneExtraBold, Syne, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.4px"
  display:
    fontFamily: "BebasNeue, Bebas Neue, sans-serif"
    fontSize: "88px"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0px"
  headline:
    fontFamily: "ArchivoBlack, Archivo, sans-serif"
    fontSize: "21px"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.3px"
  title:
    fontFamily: "ArchivoBlack, Archivo, sans-serif"
    fontSize: "17px"
    fontWeight: 900
    lineHeight: 1.24
    letterSpacing: "0.2px"
  body:
    fontFamily: "JetBrainsMono, JetBrains Mono, monospace"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrainsMonoBold, JetBrains Mono, monospace"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "0.7px"
rounded:
  square: "0px"
  overlay: "0px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  display: "64px"
components:
  action-button:
    backgroundColor: "{colors.sunflower}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.square}"
    padding: "12px 16px"
    height: "48px"
  location-ticket:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.square}"
    padding: "12px"
    height: "82px"
  weather-hero:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.square}"
    padding: "12px 16px 32px"
  risk-advisory:
    backgroundColor: "{colors.attention-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.square}"
    padding: "16px"
  action-section:
    backgroundColor: "{colors.calm-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "24px 16px"
---

# Design System: Weather Public Bulletin

## Overview

**Creative North Star: "The Weather Public Bulletin"**

This is a civic, mobile-native daily guidance bulletin printed on warm paper: bold enough to stop a hurried reader, structured enough to explain changing conditions, and plainspoken enough to support a safe decision. It combines the authority of a public notice with the immediacy of a street poster. Home reads **Now → Action → Why → Next**: weather establishes context, while practical guidance owns the task path.

The identity is light-only. Warm paper, hard black rules, square fields, saturated signal colors, bold poster typography, and structural offset shadows carry the visual voice. Atmospheric decoration is secondary to weather comprehension; provider-normalized readings, severity, timing, and practical guidance remain the content hierarchy.

This specification supersedes the previous dark atmospheric-terminal direction in full. Do not revive dark graphite grounds, terminal simulation, dither fields, glow, neon cyberpunk, ASCII decoration, or night-triggered theming. Night is weather data represented inside the same light bulletin, not an application color scheme.

**Key Characteristics:**

- Warm paper ground with white and pale-blue data fields.
- Hard ink-black outlines, internal rules, and offset print shadows.
- Cobalt for location and navigation, sunflower for attention and action, mint for constructive guidance, and coral/red for hazards.
- Syne for short ASCII masthead/system labels, Archivo Black for Vietnamese poster headlines, JetBrains Mono for ordinary interface text, and Bebas Neue for dominant numeric weather readings.
- Square geometry with zero-radius surfaces, concise section labels, legible comparison rows, and mobile-native interaction behavior.
- Animated amCharts SVG weather art with a synchronized hard-black offset copy in current-weather heroes; cached static counterparts in repeated forecast rows and whenever reduced motion is enabled.

## Colors

The palette behaves like four-color public printing: a quiet paper base, uncompromising black structure, and a small set of saturated semantic signals.

### Primary

- **Civic Cobalt** (`cobalt`): location tickets, navigation emphasis, live context, and selected technical state.

### Secondary

- **Sunflower Signal** (`sunflower`): attention, primary actions, current forecast cells, and high-visibility labels.
- **Public Mint** (`mint`, `calm-surface`): safe or constructive guidance, live indicators, and action sections.

### Tertiary

- **Hazard Coral** (`coral`, `danger`): urgent interruption, hazard marks, and severe risk emphasis.
- **Orange Warning** (`warning`): elevated risk below danger.

### Neutral

- **Warm Bulletin Paper** (`paper`): the light-only application ground.
- **Clean Field** (`field`): primary reading surfaces.
- **Forecast Blue Wash** (`pale-blue-field`): sequential forecast and briefing fields.
- **Printer's Ink** (`ink`): text, borders, geometry, and structural shadows.
- **Muted Ink** (`ink-muted`): secondary descriptions and metadata.
- **Unavailable Gray** (`unavailable`, `unavailable-surface`): explicit missing, partial, offline, and unavailable states.

**The Semantic Signal Rule.** Color identifies a role, not decoration: cobalt is technical/contextual, sunflower is attention/action, mint is calm/constructive, orange is warning, and red/coral is danger.

**The Color-Plus-Language Rule.** Every risk state includes a visible level, title, reason, or action; never communicate AQI, UV, warning, danger, success, or unavailable status by color alone.

## Typography

**Poster headline face:** Archivo Black (Archivo 900)

**Numeric display face:** Bebas Neue (Regular 400)

**Reading and data face:** JetBrains Mono (Regular 400 and Bold 700)

**Masthead/brand face:** Syne (Regular 400 and ExtraBold 800), restricted to
short ASCII-only system labels such as `WEATHER//SYSTEM`, `MENU//01`, and
`ACCOUNT//AUTH`.

**Character:** Archivo Black gives Vietnamese locations, section headings, and warnings the physical weight of a public poster. JetBrains Mono carries natural-case guidance, supporting copy, technical labels, controls, status, and compact measurements. Bebas Neue is deliberately narrow and limited to temperature and other oversized numeric readings. All three shipped cuts include the characters required by their assigned roles; JetBrains Mono Regular/Bold and Archivo 900 have complete Vietnamese coverage.

### Hierarchy

- **Brand:** Syne for short ASCII masthead and overlay labels only.
- **Display:** Bebas Neue for dominant current temperature and compact forecast temperatures; keep the unit visually subordinate.
- **Headline:** uppercase weather conditions, risk titles, and major state titles.
- **Title:** numbered section names, action labels, and compact controls.
- **Body:** JetBrains Mono for natural-case Vietnamese explanations, reasons, recommendations, empty states, and disclaimers.
- **Label:** JetBrains Mono for short uppercase metadata, time, source, status, place accuracy, and units; avoid oversized label text.

**The Language-Coverage Rule.** Vietnamese headlines use Archivo 900 from the Vietnamese-capable Archivo family; normal copy uses JetBrains Mono. Syne is embedded only for confirmed ASCII labels because its bundled files do not cover the complete Vietnamese character range. Never assign Vietnamese copy to Syne or trigger a silent system-font fallback.

**The Display-Restraint Rule.** Bebas Neue is for numeric weather statements, not paragraphs, navigation, warnings, or accessibility-critical instructions. Syne's repeated role is global chrome identity; it does not replace Archivo or JetBrains Mono in customer copy.

**The Vietnamese Fit Rule.** Preserve diacritics and natural wrapping. Reflow the composition or grow a sequence item before shrinking or clipping safety-relevant language.

## Layout

The core surface is a single-column bulletin with a maximum content width of 720 device-independent pixels. On phones it fills the available width inside safe areas; on wider screens it remains centered rather than stretching into a dashboard. The spacing rhythm uses the documented 4–64 scale, with 12–16 for compact internals, 24 for section breathing room, and 32+ around dominant readings.

Home follows **Now → Action → Why → Next**. A cobalt location ticket introduces context, the weather hero summarizes current conditions, and the recommendation field follows immediately. The risk notice explains why the action matters; forecast sequences explain what may change. Detailed measurements and GPS/source diagnostics sit below this decision path. Forecast details use continuous ruled rows and horizontally virtualized hourly items rather than a mosaic of equal cards.

Layouts must respond to width and font scale. Reflow header groups and the weather hero vertically on narrow screens or large text; widen horizontally scrolling forecast cells for larger text; preserve safe-area and system-bar insets. Use native scrolling, Android predictive Back, iOS edge-swipe Back, and platform-appropriate navigation. Touch targets are at least 44 pt on iOS and 48 dp on Android.

**The One Route Rule.** The first scan must answer what is happening now, what the user should do, why it matters, and what changes next; secondary measurements never compete equally with that route.

## Elevation & Depth

Depth is structural, not atmospheric. Important ticket, hero, advisory, location, and grouped-data blocks use a solid ink plate offset 6–7 pixels down and right, paired with a 3-pixel outline. Action controls use a smaller 4-pixel plate and translate 3 pixels toward it while pressed. Individual table cells and ordinary rows stay flat so users can scan values without visual noise.

### Shadow Vocabulary

- **Print Plate** (`6px 6px 0 #101010`): location tickets and compact framed blocks.
- **Hero Plate** (`7px 7px 0 #101010`): dominant weather and risk panels.
- **Panel Plate** (`6px 6px 0 #101010`): grouped metrics, forecast sequences, state panels, and data grids.
- **Control Plate** (`4px 4px 0 #101010`): buttons and actionable controls; compresses to `1px 1px` while pressed.

**The Customer-Elevation Rule.** A shadow communicates either an actionable control or a meaningful grouped surface. Do not shadow every table cell, divider, label, or decorative row; hierarchy and fast comparison take priority over stylistic saturation.

**The No Ambient Shadow Rule.** Do not use soft drop shadows, translucent haze, glass blur, or glow. Every shadow must read as a solid structural offset.

## Shapes

The form language is square and cut-paper direct. Primary surfaces and controls use zero radius, hard 3-pixel outlines, and 2-pixel internal dividers. A 1-pixel hairline is reserved for genuinely secondary separation. No card, control, icon frame, status mark, or transient overlay receives rounded corners.

Simple geometric marks—squares, diamonds, lines, dots, and independent weather glyph parts—may carry status or environmental state. Organic weather imagery must remain subordinate to the data and must not combine day/night, moon, precipitation, wind, UV, AQI, and alert state into one provider-specific mega-icon.

**The Square Means System Rule.** Do not soften the bulletin into rounded cards, oversized pills, bubbles, or generic mobile-SaaS containers.

## Components

### Location Ticket

- A cobalt, 3-pixel-outlined block with a solid offset plate.
- Location is a heavy Archivo Black poster headline; freshness, source, and GPS accuracy use JetBrains Mono at evidence scale.
- Device locations display a reverse-geocoded district/city label when available. Timezone identifiers and raw coordinates are not primary customer-facing copy.
- Reflows vertically when width or text scale makes the two-column composition unsafe.

### Masthead, Drawer, and Account

- A sunflower masthead sits above Home with an authored three-line hamburger
  at the top left and a square initials avatar at the top right.
- The center `WEATHER//SYSTEM` label uses Syne and remains descriptive rather
  than a finalized product brand.
- The drawer uses cobalt as a full structural field and keeps Home, Forecast,
  remote locations, and account within one scan. Vietnamese item names remain
  Archivo; only ASCII indices/system labels use Syne.
- Auth and remote-location tasks use full-screen, square sheets with native
  Back/close behavior, visible loading/error/empty states, and no rounded cards.
- Signed-out users can search and view remote weather. Saving and cloud sync
  explicitly ask for authentication instead of blocking the weather product.

### Weather Hero

- The largest white field and the clearest reading on Home.
- Temperature dominates; condition and feels-like remain directly adjacent.
- Weather art maps normalized domain conditions to the local amCharts SVG set, never provider codes.
- Home and Forecast current-weather heroes render one local animated SVG surface containing both the colored art and its synchronized black offset layer.
- Current-weather and repeated forecast artwork is optically large enough to read at a glance. Repeated hourly and daily items use cached static SVGs with the same black offset treatment; they must not mount a WebView per row.
- Reduced-motion mode switches hero artwork to the local static counterpart; decorative artwork stays out of screen-reader order.

### Recommendation Panel

- The mint recommendation field follows the weather hero immediately.
- The first `LÀM` row is sunflower-backed and appears before suggestion and reason copy.
- Only the highest-priority action receives the sunflower treatment; later recommendations remain ruled and scannable.
- Every panel retains the general-wellness disclaimer and never implies diagnosis or treatment.

### Risk Advisory

- A bordered semantic surface that explains the recommendation after it is shown.
- Always exposes level, title, reason, and immediate action in text.
- Surface and signal color change by calm, attention, warning, danger, or unavailable tone; structure does not.

### System Labels and Ruled Sections

- Short labels establish the reading route: Now, Action, Why, Next.
- Sections begin with a heavy top rule and use internal dividers before creating another container; decorative indices are omitted.

### Forecast Sequences and Rows

- Hourly data uses a pale-blue horizontal sequence with hard vertical rules and a sunflower current cell.
- Daily data uses full-width rows with aligned condition, precipitation, and temperature columns.
- Empty data is named explicitly with dashes and explanatory copy; never invent replacement values.

### Actions

- Primary actions are square sunflower controls with 3-pixel borders and bold uppercase Archivo labels.
- Press state is a 2-pixel mechanical shift or a field-color change; disabled state remains labeled and visibly reduced.
- Preserve platform touch targets, accessibility roles, hints where needed, and visible text labels.

### Weather icon attribution

Weather artwork comes from **amCharts Weather Icons 1.0.0** under **CC BY 4.0**. Preserve `assets/weather.icon/amcharts_weather_icons_1.0.0/LICENSE` and attribution when redistributing the application or icon assets.

## Do's and Don'ts

### Do:

- **Do** keep the application light-only on warm paper, including nighttime weather.
- **Do** preserve the Now → Action → Why → Next hierarchy and keep the highest-priority action immediately discoverable.
- **Do** use exact semantic labels, reasons, and practical actions alongside color.
- **Do** use hard outlines, ruled rows, solid offset shadows, and square controls consistently.
- **Do** support long Vietnamese text, system font scaling, screen readers, reduced motion, safe areas, and small screens.
- **Do** keep location permission denial, loading, offline, partial, empty, error, and unavailable states useful and honest.
- **Do** foreground official alerts and conservative guidance for severe environmental hazards.

### Don't:

- **Don't** restore the superseded dark terminal, dither, ASCII, glow, neon, graphite, or cyberpunk guidance.
- **Don't** interpret night as dark mode or change semantic color meaning to match weather mood.
- **Don't** regress into rounded card stacks, soft gradients, glassmorphism, ambient shadows, or generic SaaS layout.
- **Don't** bury temperature, risk, forecast change, or action beneath secondary measurements or decoration.
- **Don't** rely on color, icons, motion, or geometry alone for severity or status.
- **Don't** clip safety guidance, over-compress long copy, or shrink touch targets to preserve composition.
- **Don't** expose provider-specific weather codes or collapse independent weather dimensions into combinatorial visual states.
