---
version: 1
slug: "src-app-forecast-tsx"
primary_target: "src/app/forecast.tsx"
related_targets: ["src/features/forecast/screens/forecast-screen.tsx"]
---

# Forecast Surface Brief

## User Job

Help a user compare how weather changes over the next day and week, with
temperature and precipitation first and environmental/astronomy details kept
available without crowding the decision path.

## Durable Structure

Use a compact field-log sequence: live briefing, horizontal 24-hour rail,
vertical seven-day ledger, then subordinate sunrise/sunset, moon phase,
visibility, and pressure. Preserve the Atmospheric Field Terminal language
through flat ruled sections, monospace readings, restrained accents, and native
Stack navigation.

## Data and State Contract

- Render normalized `CurrentWeather`, `HourlyForecast`, and `DailyForecast`
  only; never parse provider data in React.
- Missing hourly or daily collections remain explicitly unavailable while
  other valid slices stay visible.
- Do not fabricate timestamps, forecast gaps, astronomy, visibility, pressure,
  precipitation, or moon illumination.
- Keep loading, paused/offline, retry, location-unavailable, and partial states
  reachable and truthful.

## Native Constraints

- The vertical daily ledger and horizontal hourly rail remain virtualized.
- Essential navigation and refresh targets meet native touch sizes.
- Long Vietnamese copy, large text, Android gesture navigation, and compact
  576x1024 rendering must not create blocking clipping.
