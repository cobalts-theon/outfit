---
name: "Hệ thống dự báo thời tiết và hỗ trợ sức khỏe người dùng"
description: "A light-only mobile weather public bulletin that turns conditions into clear risk and action."
colors:
  ink: "#07111E"
  ink-muted: "#1D3557"
  paper: "#F1FAEE"
  field: "#F1FAEE"
  pale-blue-field: "#A8DADC"
  cobalt: "#457B9D"
  navy: "#1D3557"
  cobalt-muted: "#1D3557"
  sunflower: "#F9C74F"
  selection: "#F1C40F"
  attention-surface: "#F9C74F"
  mint: "#2A9D8F"
  calm: "#2A9D8F"
  calm-surface: "#2A9D8F"
  coral: "#E63946"
  warning: "#F3722C"
  warning-surface: "#F9C74F"
  danger: "#E63946"
  danger-surface: "#E63946"
  unavailable: "#457B9D"
  unavailable-surface: "#D8E2DC"
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
  soft: "12px"
  overlay: "0px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "112px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  display: "64px"
components:
  action-button:
    backgroundColor: "{colors.sunflower}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.soft}"
    padding: "12px 112px"
    height: "48px"
  location-ticket:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.soft}"
    padding: "12px"
    height: "82px"
  weather-hero:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.soft}"
    padding: "12px 112px 32px"
  risk-advisory:
    backgroundColor: "{colors.attention-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.soft}"
    padding: "112px"
  action-section:
    backgroundColor: "{colors.calm-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.soft}"
    padding: "24px 112px"
---

# Design System: Weather Public Bulletin

## Overview

**Creative North Star: "The Weather Public Bulletin"**

This is a civic, mobile-native daily guidance bulletin printed on warm paper: bold enough to stop a hurried reader, structured enough to explain changing conditions, and plainspoken enough to support a safe decision. It combines the authority of a public notice with the immediacy of a street poster. Home reads **Context → Action → Why → Upcoming adjustments → Optional weather details**: weather establishes context, while practical guidance owns the task path.

The identity is light-only. Concrete gray and white, hard black rules, slightly rounded fields, saturated signal colors, bold poster typography, and structural offset shadows carry the visual voice. Atmospheric decoration is secondary to weather comprehension; provider-normalized readings, severity, timing, and practical guidance remain the content hierarchy.

This specification supersedes the previous dark atmospheric-terminal direction in full. Do not revive dark graphite grounds, terminal simulation, dither fields, glow, neon cyberpunk, ASCII decoration, or night-triggered theming. Night is weather data represented inside the same light bulletin, not an application color scheme.

**Key Characteristics:**

- Concrete gray and white ground with white and pale-blue data fields.
- Hard ink-black outlines, internal rules, and offset print shadows.
- Cobalt for location and navigation, sunflower for attention and action, mint for constructive guidance, and coral/red for hazards.
- Syne for short ASCII masthead/system labels, Archivo Black for Vietnamese poster headlines, JetBrains Mono for ordinary interface text, and Bebas Neue for dominant numeric weather readings.
- Lightly rounded geometry with 12-pixel surface corners, concise section labels, legible comparison rows, and mobile-native interaction behavior.
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

Home follows **Context → Action → Why → Upcoming adjustments → Optional weather details**. A cobalt location ticket introduces context, the weather hero summarizes current conditions, and the recommendation field follows immediately. The risk notice explains why the action matters; forecast sequences explain what may change. Detailed measurements and GPS/source diagnostics sit below this decision path. Forecast details use continuous ruled rows and horizontally virtualized hourly items rather than a mosaic of equal cards.

Layouts must respond to width and font scale. Reflow header groups and the weather hero vertically on narrow screens or large text; widen horizontally scrolling forecast cells for larger text; preserve safe-area and system-bar insets. Use native scrolling, Android predictive Back, iOS edge-swipe Back, and platform-appropriate navigation. Touch targets are at least 44 pt on iOS and 48 dp on Android.

**The One Route Rule.** The first scan must answer what is happening now, what the user should do, why it matters, and what changes next; secondary measurements never compete equally with that route.

## Elevation & Depth

Depth is structural, not atmospheric. Important ticket, hero, advisory, location, and grouped-data blocks use a solid ink plate offset 6–7 pixels down and right, paired with a 3-pixel outline. Action controls use a smaller 4-pixel plate and translate 3 pixels toward it while pressed. Individual table cells and ordinary rows stay flat so users can scan values without visual noise.

### Shadow Vocabulary

- **Print Plate** (`12px 12px 0 #212121`): location tickets and compact framed blocks.
- **Hero Plate** (`7px 7px 0 #212121`): dominant weather and risk panels.
- **Panel Plate** (`12px 12px 0 #212121`): grouped metrics, forecast sequences, state panels, and data grids.
- **Control Plate** (`4px 4px 0 #212121`): buttons and actionable controls; compresses to `1px 1px` while pressed.

**The Customer-Elevation Rule.** A shadow communicates either an actionable control or a meaningful grouped surface. Do not shadow every table cell, divider, label, or decorative row; hierarchy and fast comparison take priority over stylistic saturation.

**The No Ambient Shadow Rule.** Do not use soft drop shadows, translucent haze, glass blur, or glow. Every shadow must read as a solid structural offset.

## Shapes

The form language stays bold and cut-paper direct. Primary surfaces and controls use a subtle 12-pixel radius, hard 3-pixel outlines, and 2-pixel internal dividers. A 1-pixel hairline is reserved for genuinely secondary separation. Match offset shadow plates to the surface radius. Overlays may use an 12-pixel radius; avoid pill-shaped cards or heavily rounded controls.

Simple geometric marks—squares, diamonds, lines, dots, and independent weather glyph parts—may carry status or environmental state. Organic weather imagery must remain subordinate to the data and must not combine day/night, moon, precipitation, wind, UV, AQI, and alert state into one provider-specific mega-icon.

**Concrete Jungle geometry.** Use 12px corners consistently with hard outlines and offset shadows; avoid pills and soft ambient shadows.

## Components

### Location Ticket

- A cobalt, 3-pixel-outlined block with a solid offset plate.
- Location is a heavy Archivo Black poster headline; freshness, source, and GPS accuracy use JetBrains Mono at evidence scale.
- Device locations display a reverse-geocoded district/city label when available. Timezone identifiers and raw coordinates are not primary customer-facing copy.
- Reflows vertically when width or text scale makes the two-column composition unsafe.

### Masthead, Drawer, and Account

- A sunflower masthead sits above Home with an authored three-line hamburger
  at the top left and a slightly rounded initials avatar at the top right.
- The center `WEATHER//SYSTEM` label uses Syne and remains descriptive rather
  than a finalized product brand.
- The drawer uses cobalt as a full structural field and keeps Home, Forecast,
  remote locations, and account within one scan. Vietnamese item names remain
  Archivo; only ASCII indices/system labels use Syne.
- Auth and remote-location tasks use full-screen sheets with subtly rounded controls with native
  Back/close behavior, visible loading/error/empty states, and consistent 12px cards.
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

- Primary actions are lightly rounded sunflower controls with 3-pixel borders and bold uppercase Archivo labels.
- Press state is a 2-pixel mechanical shift or a field-color change; disabled state remains labeled and visibly reduced.
- Preserve platform touch targets, accessibility roles, hints where needed, and visible text labels.

### Weather icon attribution

Weather artwork comes from **amCharts Weather Icons 1.0.0** under **CC BY 4.0**. Preserve `assets/weather.icon/amcharts_weather_icons_1.0.0/LICENSE` and attribution when redistributing the application or icon assets.

## Do's and Don'ts

### Do:

- **Do** keep the application light-only on warm paper, including nighttime weather.
- **Do** preserve the Context → Action → Why → Upcoming adjustments → Optional weather details hierarchy and keep the highest-priority action immediately discoverable.
- **Do** use exact semantic labels, reasons, and practical actions alongside color.
- **Do** use hard outlines, ruled rows, solid offset shadows, and lightly rounded controls consistently.
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

### Recommendation-first Home — 2026-09-11

The first viewport prioritizes a daily-life decision. Use a compact location
and weather summary, then the primary SVG-led action and its evidence. Follow
with secondary activity guidance and forecast-backed preparation. The large
weather hero, metric grid and forecast are available through an explicit
expand/collapse control. Keep 12px corners, black outlines and hard shadows.
Do not add generic routines solely because a clock crossed a daypart boundary.

### Concrete Jungle palette and motion — 2026-09-11

Use only #7D7D7D, #B3B3B3, #FF5722, #2196F3, #4CAF50, #FFFFFF,
#212121, #F5F5F5, #FFC107 and #9E9E9E for interface colors. Backgrounds
use concrete gray/white; interactive secondary buttons are blue, priority is
amber, active forecast tabs orange, and positive signals green. Use dark text
on bright fills. All surface/control/icon-frame radii are 12px.

Drawer opens with a 240ms horizontal slide; entry and expanded weather details
use a 200ms vertical slide. Honor system Reduce Motion and stop interrupted
animations. Forecast separates hourly and seven-day modes with colored tabs,
rounded comparison cards and optional detailed measurements.

### Navigation and expanded-content spacing

Hamburger and back controls share orange fill, 3px ink border, 12px radius and
solid offset shadow. Back hit area is 48px; forecast title uses ink. Expanded
weather blocks have 24px gaps so rules cannot touch a preceding panel shadow.
Route changes slide horizontally, details slide on opening/closing, both forecast
modes have entry motion, and system Reduce Motion disables these transitions.

## Lifestyle setup

Account contains a prominent colored entry for editing lifestyle preferences.
The setup uses unselected checkbox rows, green selected activities, blue selected
dayparts, an amber introduction and shared save/cancel buttons. All controls
retain 12px corners, heavy outlines, native scrolling and reduced-motion-aware
entry. Checkbox roles expose checked and disabled states. Native Redmi review
confirms Vietnamese labels fit and rows remain readable.

The first-run welcome is distinct from Account: a dimmed backdrop and a bottom
pop-up, blue welcome header, compact progress label and two horizontal slide steps.
The Account editor remains a directly editable form without the welcome banner.
Laundry cards never receive the yellow priority background by default.

“Trước khi bắt đầu” now uses a full-page amber header, three-step body, SVG
selection rows and dropdown time controls. The prior welcome modal is retired.
Time options use a scrollable native overlay and 48px+ touch targets; selected
values are shown directly in the controls. Shared 12px corners, solid outlines,
Concrete Jungle colors and reduced-motion-aware transitions remain.

Before-start color hierarchy (2026-09-12): white header/choice surfaces over
F5F5F5 background; FF5722 main CTA and small introductory label; 2196F3 active
progress; 4CAF50 checks/completed progress; FFC107 selected icon plates and time
summary; B3B3B3 inactive tracks/secondary menu control; 212121 text and outlines.
Back buttons are white and defer is an underlined 48px text action. These roles
replace the previous large amber welcome header and full green selection rows.
Native review confirms the original SVG vocabulary and 12px frames remain.

## Application-wide color roles — 2026-09-12

Use white/F5F5F5 for reading surfaces and 212121 for text and outlines.
FF5722 is the default primary button/navigation trigger; 2196F3 is secondary
navigation, active tabs and compact context labels. 4CAF50 marks account success,
saved locations and selected/completed states; FFC107 highlights priority advice
and the current forecast sample. Gray denotes unavailable/neutral states with
legible dark text. Do not use white body text on blue panels.

Drawer actions use white bodies and colored category strips. Shared sheets use
white headers with blue labels; content remains in 12px outlined panels. Account
identity and location rows are white, allowing actions and success markers to
stand out. Forecast order is context → tabs/data → preparation → optional details.
Notifications put their enable/disable/test actions immediately after status.
Native review verified all six principal surfaces on Redmi.

Small status/category labels use NeoBadge rather than colored Text backgrounds:
a View owns the 12px/2px ink frame and 3px hard shadow, with space reserved below
and right. Blue is contextual, green is signed-in/success and orange is caution
or introductory emphasis. Labels remain non-interactive and wrap at large fonts.

## Authentication entry

Use the existing Concrete Jungle Neo-brutalism components as a full page, with
12px corners, coral primary action and blue secondary actions. No close/skip
button on the required entry screen. Lead with registration, allow switching
to login and accessing forgotten password. Keep technical backend copy out.

## Welcome carousel (2026-09-15)

Public auth entry is a separate illustration-led welcome screen: three original
SVG scenes for wellbeing, preparation outside and personal routine. Manual
horizontal paging and accessible page buttons; no timed rotation. Register and
Login remain prominent below slides. Registration/login reuse Auth logic with
friendlier headings and a back arrow to welcome. OTP has individual 12px cells,
yellow focus and a single native input preserving paste/autofill/accessibility.

Carousel frames share one aspect ratio, 3px ink outline and 12px radius across
photos and SVG. Title/body slots use the tallest measured text so paging keeps
labels, copy and controls aligned without truncating larger text.

## Activity planner

Home has one blue planning action; individual advice keeps explanations and
feedback behind disclosures. Activity picks use existing SVG icons with yellow
selection. Free hours and comparison times use TimeDropdown, not typed fields.
Cards show time, concise summary, Why evidence, relevant checklist and save.
Comparison columns reflow on narrow screens. Saved plans collapse secondary
controls. All frames keep ink borders, 12px corners and Concrete Jungle colors.

Home advice explanations are short inline text, not Why buttons. Warning badge
precedes the SVG/title row at the left edge; feedback is a compact text action.
Plans header is part of the scroll content, with at least 116px height and a
coral X button. It is not pinned; retain 12px corners and hard shadows.

Upcoming plan uses one white Neo-brutalism card after immediate advice, with
a blue label, existing activity SVG and one blue detail action (coral when
conditions warrant reconsideration). Saved-plan details expose live preparation
and a sliding reschedule section with date choices/free-time dropdowns. Specific
replacement actions are coral; corners remain 12px and shadows retain clearance.
Android review covered the card, checklist, dropdown and alternative results
using an authenticated temporary review route; the route was removed afterward.


## Environmental focus refinement — 2026-10-22

Retain the existing light neobrutalist palette, fonts, borders, SVGs and native
sheets. Home prioritizes immediate environmental precautions before optional
opportunities and the hour chooser. Three visible activity choices replace five;
preparation is explanatory text rather than a task checklist. Saved hours show
only evidence, reminder and remove controls. Account uses initials, without photo
editing. Public viewing precedes account creation; personal save/sync requests
login inline. Preserve all warning/danger recommendations when ordinary advice
is collapsed. See ADR-053 for the scope change.


## User-approved color correction — 2026-10-22 (ADR-054)

Supersedes the temporary pale-surface experiment. Keep strong orange primary,
blue secondary and amber selected controls, with the original outlined shadows.
Use warm white (#FFF8EC) as the canvas. Do now uses white/amber for ordinary advice,
amber warning surfaces and orange danger; its badges are white or orange. No
blue/green fill in that panel. Green may identify the separate hour-chooser entry.
Text stays dark with contrast checked at 4.5:1 or higher. Restore account avatars.


## Activity assessment inputs and result — 2026-10-22

Date and duration use amber expandable boxes, blue quick choices and editable
values. Preserve the existing borders, typography and coral save controls.
At widths below 700 the environmental result follows inputs; from 700 it sits
alongside. The result includes the chosen activity/date/duration, environmental
measurements, preparation and an optional save action. Do not repeat measurements
behind a second detail toggle. Preserve explicit loading/error/unavailable states.


### Work/school clarification (ADR-056)

For work/school, label boxes “Ngày đi” and “Thời gian di chuyển”; show one “Giờ
xuất phát” selector in place of the From/To availability pair. Explain that travel
minutes end at arrival. Result times represent departure → estimated arrival,
with conditions and preparation. No ranked alternative hours appear in this mode.


## Current palette — user supplied (ADR-058)

Use the ten supplied swatches as stable roles: red `#E63946` primary actions and
serious risk; cream `#F1FAEE` reading surfaces; yellow `#F1C40F` selection; mist
`#D8E2DC` inactive/supporting surfaces; cyan `#A8DADC` information; blue `#457B9D`
technical accents; navy `#1D3557` borders and shadows; gold
`#F9C74F` ordinary advice/input boxes; orange `#F3722C` warning signals; teal
`#2A9D8F` favorable states and the activity entry.

Keep the existing layout, type, corners and neobrutalist offset shadows. Darken
navy to `#07111E` for small text on red/orange/teal; supplied navy on red does not
meet normal-copy contrast. Secondary buttons use cyan #A8DADC with dark copy, distinct from navy borders and shadows. Blue accents
are not small-copy filled surfaces; cyan fills those roles. Do now retains
cream/gold/warm alert surfaces, with no blue/green fills. Weather illustration
colors retain their condition meaning. Native shell and notification accents
use the same palette on subsequent app builds.


### Compact Do now (ADR-059)

Show one panel, with at most three preview rows plus all important warnings.
Ordinary rows have no repeated info badges. The first action keeps emphasis;
secondary rows use compact icons/type and action copy. One expand control reveals
remaining suggestions and full weather evidence. Preserve warm palette roles.
