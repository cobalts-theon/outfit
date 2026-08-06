# DESIGN.md

## 1. Product Design Goal

The application is a **weather and outdoor decision assistant** with a strong retro-futuristic visual identity.

It should combine:

- practical weather usability;
- high information clarity;
- atmospheric visual storytelling;
- terminal / system-interface aesthetics;
- dither and ASCII-inspired graphics;
- monospace typography;
- technical and data-driven presentation.

The product must remain easy to use even when the visual language is experimental.

The primary UX promise is:

> Understand current conditions, identify environmental risk, see what happens next, and know what to do within a few seconds.

---

## 2. Core Visual Direction

The application should follow a:

**retro-futuristic / terminal / dither / ASCII-inspired / technical interface aesthetic.**

Primary visual influences include:

- terminal interfaces;
- scientific monitoring systems;
- system consoles;
- encrypted protocol interfaces;
- retro computer graphics;
- dithering;
- ASCII graphics;
- raster/pixel texture;
- monochrome technical displays;
- sci-fi archive interfaces;
- atmospheric interactive websites such as KPRverse.

KPRverse and similar references are **visual inspiration only**.

Do not directly clone layouts, assets, branding, interactions, or unique compositions from any single reference.

Instead extract principles such as:

- atmosphere;
- information density;
- typography;
- technical labeling;
- visual tension;
- interface hierarchy;
- motion language.

---

## 3. Desired Personality

The interface should feel:

- technical;
- mysterious;
- precise;
- atmospheric;
- data-driven;
- slightly futuristic;
- intentionally designed;
- restrained;
- immersive;
- distinctive.

It should NOT feel:

- generic;
- corporate;
- like a SaaS dashboard;
- like a cryptocurrency dashboard;
- soft/pastel by default;
- excessively rounded;
- full of generic cards;
- like an AI-generated mobile template.

---

## 4. Product Usability Comes First

Visual experimentation must never damage essential weather usability.

For every major screen, users must quickly understand:

1. What is happening now?
2. Is anything dangerous or uncomfortable?
3. What will happen soon?
4. What should I do?

Never sacrifice:

- readability;
- contrast;
- touch usability;
- information hierarchy;
- accessibility;
- forecast comparability;

for visual effects.

The visual style is an **atmospheric layer around a practical weather product**.

---

## 5. Typography

### Primary Typeface

Use **JetBrains Mono** as the primary visual type direction.

JetBrains Mono should be strongly represented in:

- weather metrics;
- temperatures;
- timestamps;
- coordinates;
- navigation labels;
- section labels;
- system messages;
- AQI values;
- UV values;
- wind values;
- weather metadata;
- technical annotations.

Examples:

```text
CURRENT CONDITIONS
29°C

AQI // 042
UV // 08
WIND // 14 KM/H NE

FORECAST // NEXT 06H
```

### Typography Roles

Recommended semantic typography roles:

```text
displayTemperature
displayMetric

screenLabel
sectionLabel

title
body
bodyStrong

metricValue
metricLabel

caption
metadata
systemText
```

Temperature should remain one of the largest visual elements on the Home screen.

Avoid giant marketing-style headings.

### Long Text

JetBrains Mono may be used throughout the product if readability remains strong.

If long recommendation paragraphs become difficult to read, a secondary highly-readable sans-serif may be introduced later.

If a secondary font is introduced:

- JetBrains Mono remains the identity/display font;
- the secondary font is only for longer explanatory text.

This requires a new entry in `DECISIONS.md`.

---

## 6. ASCII Language

ASCII is a **visual motif**, not the primary method for rendering all information.

Good uses:

```text
[ CURRENT CONDITIONS ]

// ENVIRONMENT FEED

--------------------------------

:: FORECAST STREAM ::

[ AQI STATUS // GOOD ]

> NEXT UPDATE 14:32
```

Decorative examples:

```text
+----------------------------+
| ENVIRONMENT STATUS         |
+----------------------------+
```

or:

```text
[ WEATHER // LOCAL NODE ]

:::::: DATA STREAM ::::::
```

ASCII should be used selectively.

Do NOT fill every screen with decorative characters.

Decorative ASCII must be hidden from screen readers when it carries no semantic meaning.

---

## 7. Dither Language

Dithering is one of the main visual signatures of the application.

Possible uses:

- weather hero backgrounds;
- sun/moon textures;
- cloud shading;
- precipitation atmosphere;
- gradients converted into dither patterns;
- loading graphics;
- splash/onboarding;
- empty states;
- atmospheric separators.

Dither must NOT reduce legibility of:

- temperature;
- AQI;
- UV;
- warnings;
- forecast values;
- recommendations.

Rule:

> Texture supports information. Texture never competes with information.

---

## 8. Weather Scene System

The current-weather hero should be treated as a composed scene rather than one static icon.

Conceptually:

```text
Weather Scene
│
├── Sky
│   ├── dawn
│   ├── day
│   ├── sunset
│   ├── twilight
│   └── night
│
├── Celestial
│   ├── sun
│   ├── moon
│   ├── moon phase
│   └── stars
│
├── Atmosphere
│   ├── clouds
│   ├── fog
│   ├── haze
│   └── dust
│
├── Precipitation
│   ├── drizzle
│   ├── rain
│   ├── snow
│   └── hail
│
└── Effects
    ├── lightning
    └── wind
```

The scene may use:

- dither layers;
- subtle animation;
- simple geometric forms;
- weather icons;
- raster-like masks;
- monochrome textures.

Avoid extremely heavy animation.

---

## 9. Weather Icon System

Main weather conditions should use the normalized weather model defined in `WEATHER.md`.

Current preferred direction:

**Meteocons**

Use approximately:

```text
30–35 semantic conditions
+
day/night variants
+
8 moon phases
```

Do not import the entire icon library into runtime bundles unless required.

Use:

- richer weather visual for current-weather hero;
- static/lightweight SVG for hourly forecast;
- static/lightweight SVG for daily forecast.

General application icons should use one separate consistent UI icon family.

---

## 10. Color Philosophy

The application should primarily use a restrained palette.

Base direction:

```text
near black
graphite
charcoal
off-white
muted grey
```

Potential technical accents:

```text
acid green
muted cyan
amber
cold blue
```

Accent usage should remain restrained.

The app should not become a fully neon cyberpunk interface.

---

## 11. Semantic Colors

Weather/environmental data has semantic meaning.

Semantic color always overrides brand aesthetics where needed.

Examples:

```text
AQI
UV
weather warning
danger
severe alert
success
```

Do NOT force every state into the same terminal-green palette.

AQI colors must follow the AQI standard selected for the project.

UV colors must consistently communicate severity.

Alert colors must remain recognizable.

---

## 12. Surface System

Prefer structured layouts and restrained panels.

Use:

- borders;
- separators;
- spacing;
- alignment;
- hierarchy;

before using cards.

Possible component appearance:

```text
+------------------------------+
| UV EXPOSURE                  |
|                              |
| 08 // VERY HIGH              |
|                              |
| Avoid prolonged exposure.    |
+------------------------------+
```

But not every section needs a box.

---

## 13. Avoid Card-Heavy UI

Do not build Home as:

```text
Card
Card
Card
Card
Card
Card
```

Avoid:

- nested cards;
- excessive floating containers;
- excessive shadows;
- glossy panels;
- glassmorphism everywhere;
- huge rounded corners.

Prefer:

```text
strong hierarchy
+
spacing
+
borders
+
typography
+
controlled surfaces
```

---

## 14. Radius

Use restrained corner radii.

The interface may include:

- rectangular panels;
- slightly rounded controls;
- clipped/angular decorative elements.

Avoid turning every component into a large rounded pill.

---

## 15. Home Screen Hierarchy

The Home screen follows:

```text
NOW
 ↓
RISK
 ↓
NEXT
 ↓
ACTION
```

Recommended structure:

```text
[ LOCATION // LOCAL NODE ]

CURRENT WEATHER HERO

29°
PARTLY CLOUDY
FEELS LIKE 32°

--------------------------------

[ PRIMARY ADVISORY ]

UV // 08
VERY HIGH

Avoid prolonged direct sunlight.

--------------------------------

[ ENVIRONMENT ]

AQI       UV       WIND
042       08       14 KM/H

--------------------------------

[ FORECAST // NEXT 06H ]

20:00  21:00  22:00  23:00
 28°    27°    27°    26°

--------------------------------

[ FIELD RECOMMENDATION ]

> LIGHT BREATHABLE CLOTHING
> USE SUN PROTECTION
> STAY HYDRATED
```

The exact wording may be localized naturally into Vietnamese.

Do not force English terminal wording into all user-facing content if Vietnamese is clearer.

---

## 16. Current Weather Hero

The hero should contain:

- location context;
- weather scene;
- temperature;
- condition;
- feels-like value.

Optional subtle technical metadata may appear.

Do not put every environmental metric inside the hero.

Hero visual complexity must not overwhelm the temperature.

---

## 17. Weather Risk

Important risks include:

- extreme UV;
- unhealthy AQI;
- thunderstorms;
- heavy rain;
- high heat;
- strong wind;
- severe weather alerts.

When risk is active it should become visually prominent.

Use severity through:

- position;
- typography;
- borders;
- semantic color;
- concise language.

Do not rely only on color.

---

## 18. Metrics

Possible compact environmental metrics:

```text
AQI
UV
Wind
Humidity
Visibility
Pressure
```

Examples:

```text
AQI // 042
GOOD
```

```text
WIND // 14 KM/H
NE
```

Icons may support these values but should not replace clear labels.

---

## 19. Hourly Forecast

Prioritize:

- time;
- weather icon;
- temperature;
- precipitation chance when relevant.

Example:

```text
20:00   21:00   22:00   23:00
 🌤       ☁       ☾☁       ☾
 28°      27°      27°      26°
```

The current hour should be visually identifiable.

Day/night icon transitions must be correct.

Avoid complex animated icons in every row.

---

## 20. Daily Forecast

Prioritize:

- date/day;
- condition;
- min/max temperature;
- rain probability where useful.

Additional data belongs on detailed forecast screens.

---

## 21. Moon and Night Design

Night weather scenes should support the eight moon phases defined in `WEATHER.md`.

Moon visuals may include:

- dithered moon surface;
- crescent shapes;
- subtle halo;
- limited stars.

Example:

```text
[ NIGHT CONDITIONS ]

       ░░████░░
     ░████████░
       ██████

MOON // WAXING GIBBOUS
ILLUMINATION // 73%
```

Moon phase is environmental data and visual atmosphere.

Do not create separate domain weather conditions for moon/weather combinations.

---

## 22. Recommendations

Recommendations should answer:

```text
WHAT?
WHY?
WHAT SHOULD I DO?
```

Example:

```text
[ UV EXPOSURE ]

STATUS // VERY HIGH
INDEX  // 09

Direct sun exposure is intense.

> USE SUN PROTECTION
> LIMIT PROLONGED MIDDAY EXPOSURE
```

Long paragraphs should not dominate Home.

---

## 23. Clothing Recommendations

Clothing guidance should remain practical.

Possible outputs:

```text
LIGHT CLOTHING
RAIN PROTECTION
SUN PROTECTION
WARM LAYER
WIND-RESISTANT LAYER
```

Do not position clothing recommendations as fashion advice.

---

## 24. Loading States

Loading states are a good place for stronger system-interface aesthetics.

Examples:

```text
// INITIALIZING WEATHER FEED

LOCATION ........ OK
WEATHER API ..... CONNECTING
AIR QUALITY ..... WAITING
```

or:

```text
[ ENVIRONMENT LINK ]

FETCHING CONDITIONS...
```

Do not create artificial long loading sequences.

Animation must reflect real loading state.

---

## 25. Error States

Error copy should remain useful.

Example:

```text
[ CONNECTION ERROR ]

Weather data could not be retrieved.

> RETRY
```

Avoid cryptic terminal language when users need a clear recovery action.

---

## 26. Permission States

Location permission screens may use the technical visual language, but must clearly explain:

- why location is requested;
- what happens if permission is denied;
- that manual location selection remains available.

Never trap users behind GPS permission.

---

## 27. Motion

Motion should feel:

- controlled;
- mechanical;
- atmospheric;
- deliberate.

Good examples:

- subtle dither movement;
- slow cloud movement;
- gentle rain;
- small data-state transitions;
- subtle cursor/system feedback.

Avoid:

- constant glitch effects;
- aggressive screen shaking;
- rapid flashing;
- looping intense lightning;
- animations on every metric.

Respect reduced-motion preferences where practical.

---

## 28. General UI Icons

Use one consistent general-purpose icon family for:

- navigation;
- settings;
- search;
- location;
- notifications;
- back;
- menu.

Do not mix many unrelated icon libraries.

Weather icons and general UI icons are separate systems.

---

## 29. Dark Mode vs Weather Night

These are different concepts.

```text
APP THEME:
light / dark

WEATHER TIME:
day / night
```

Do not automatically make the entire application dark solely because current weather is nighttime.

Weather hero atmosphere may reflect night while app surfaces respect user theme preference.

---

## 30. Accessibility

Minimum requirements:

- sufficient contrast;
- readable weather values;
- semantic labels;
- touch targets appropriate for mobile;
- do not rely only on color;
- meaningful accessibility labels;
- avoid flashing/glitch effects;
- support reduced motion where practical;
- support common system font scaling.

Decorative ASCII should not pollute screen-reader output.

---

## 31. Small Screen Requirement

Always review screens on a smaller Android viewport.

Check:

- clipped text;
- long Vietnamese labels;
- temperature sizing;
- forecast width;
- recommendation wrapping;
- safe areas;
- touch targets.

A layout is not complete because it looks good on one emulator.

---

## 32. UI Research Workflow

Before implementing a significant new screen:

1. Read this file.
2. Read `PRODUCT.md`.
3. Read relevant feature documentation.
4. Study multiple relevant UI references if tools are available.
5. Analyze:
   - hierarchy;
   - typography;
   - information density;
   - interaction;
   - spacing.
6. Extract patterns.
7. Do not clone one reference.
8. Adapt findings to this product's visual language.

Reference research may include:

- weather apps;
- environmental monitoring interfaces;
- health/outdoor apps;
- editorial interfaces;
- experimental digital experiences;
- terminal-inspired interfaces.

---

## 33. Visual Review Workflow

A substantial UI implementation is not complete after writing code.

Required workflow where tooling permits:

```text
implement
 ↓
run app
 ↓
open emulator/device
 ↓
capture screen
 ↓
visual critique
 ↓
fix
 ↓
capture again
```

Critique:

- hierarchy;
- alignment;
- spacing;
- typography;
- contrast;
- clipping;
- information density;
- consistency;
- visual identity;
- small-screen usability.

Use Impeccable when appropriate.

---

## 34. Anti-Generic Checklist

Before accepting a screen, ask:

- Does this look like our product?
- Does it express the terminal/dither identity?
- Is JetBrains Mono being used intentionally?
- Is there too much card UI?
- Are radii too soft/generic?
- Are gradients being used without reason?
- Could this screen belong to any random weather app?
- Is the information hierarchy still clear?
- Has visual experimentation hurt readability?

If the screen looks polished but generic, it is not finished.

---

## 35. Final Design Principle

The application should feel like:

> a sophisticated environmental monitoring interface transformed into a practical personal weather companion.

Not:

> a generic weather dashboard with a terminal font placed on top.
