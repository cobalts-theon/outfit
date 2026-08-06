# PRODUCT.md

## 1. Product name

**Hệ thống dự báo thời tiết và hỗ trợ sức khỏe người dùng**

Working product description:

> A mobile weather and outdoor-assistance application that combines weather, air-quality, UV, location, and rule-based recommendations so users can quickly understand current conditions and decide what to wear and how to protect their health when going outside.

---

## 2. Problem

Traditional weather applications often present many measurements but leave the user to interpret them.

This product aims to answer four practical questions:

1. **What is the weather now?**
2. **Is there an environmental risk?**
3. **How will conditions change soon?**
4. **What should I do or wear?**

The system transforms weather/environmental indicators, especially:

- temperature;
- apparent temperature;
- UV;
- AQI;
- precipitation;
- wind;
- humidity;
- severe-weather alerts;

into understandable, actionable recommendations.

---

## 3. Target users

Primary users:

- People checking local weather before commuting, studying, exercising, travelling locally, or going outdoors.
- Users who want simple guidance rather than interpreting raw environmental measurements.
- Users sensitive to strong sun, poor air quality, heat, rain, or rapidly changing weather.

The application should remain useful to a general audience and must not assume specialist meteorological knowledge.

---

## 4. Product surfaces

### 4.1 Mobile app — primary

Technology: React Native.

Primary responsibilities:

- Read device location with user permission.
- Show current weather.
- Show hourly and daily forecasts.
- Show AQI and pollutants where available.
- Show UV.
- Show wind and precipitation.
- Show weather/environmental alerts.
- Show health/outdoor recommendations.
- Show clothing recommendations.
- Manage saved locations and preferences.
- Receive push notifications.

### 4.2 Web Admin — secondary

Technology: ReactJS.

Primary responsibilities:

- Manage recommendation scenarios/rules.
- Enable/disable rules.
- Edit recommendation text/content.
- Manage thresholds when the rule model allows it.
- Inspect rule metadata and lifecycle.
- Support controlled changes without requiring a new mobile release for every content/rule adjustment.

The Web Admin is not the first implementation priority unless required by the current milestone.

---

## 5. Core value proposition

The application should not behave like:

> "Here are 20 weather numbers."

It should behave like:

> "It is 31°C, feels like 37°C, UV is very high, and the next two hours are dry. Wear light clothing, use sun protection, and avoid prolonged direct sun around midday."

The application adds value through **interpretation and prioritization**.

---

## 6. MVP

### Must have

- Current location permission and GPS.
- Current weather.
- Temperature and feels-like temperature.
- Main weather condition.
- Day/night-aware weather visual.
- Hourly forecast.
- Daily forecast.
- Wind speed/direction; gust when available.
- Humidity.
- Precipitation probability/intensity where available.
- UV.
- AQI.
- Basic weather alerts.
- Health/outdoor recommendations.
- Clothing recommendations.
- Saved/default location behavior.
- Loading, error, permission-denied, and offline-aware states.
- Push-notification foundation/preferences.
- Supabase-backed user/preferences/rules architecture where needed.

### Should have

- Sunrise and sunset.
- Moon phase and illumination.
- Moonrise/moonset when the selected provider supports it.
- Visibility.
- Pressure.
- Dew point.
- Pollutant breakdown such as PM2.5 and PM10.
- Multiple saved locations.
- Recommendation explanation/reason.
- Alert history or recent important notifications.

### Not required for initial MVP

- Social features.
- Chat/community.
- Complex AI-generated medical advice.
- Full climate-history analytics.
- Arbitrary global meteorological research tools.
- Hundreds of hand-authored weather-condition combinations.
- Highly elaborate 3D weather scenes.

---

## 7. Core user flows

### Flow A — Open app

1. App obtains or recalls location.
2. Current weather loads.
3. User immediately sees:
   - temperature;
   - main condition;
   - primary risk;
   - next-hours preview.
4. User can expand for details.

### Flow B — First location permission

1. Explain why location is useful.
2. Request OS permission.
3. If allowed: load local weather.
4. If denied: provide manual location search/selection.
5. Do not block the whole product permanently because GPS permission is denied.

### Flow C — Check risk

1. User sees a prioritized risk summary.
2. The app explains the important indicator.
3. The app provides an actionable recommendation.
4. Severe conditions should direct attention to official alerts.

### Flow D — Plan next hours

1. User checks hourly forecast.
2. User sees rain/temperature/weather transition.
3. User can decide when to leave, carry rain protection, or change clothing.

### Flow E — Manage preferences

User can configure relevant preferences such as:

- units;
- default/saved locations;
- notification categories;
- notification quiet behavior if implemented.

---

## 8. Home screen information hierarchy

The Home screen should follow:

### Level 1 — Now

- Location
- Main weather visual
- Temperature
- Main condition
- Feels like

### Level 2 — Risk

Examples:

- UV very high
- AQI unhealthy
- Heavy rain
- Thunderstorm
- Strong wind
- Heat stress risk

Only the most important risks should dominate.

### Level 3 — Next few hours

Compact hourly timeline.

### Level 4 — Action

Examples:

- Clothing recommendation
- Sun protection
- Rain protection
- Outdoor activity caution

### Level 5 — Secondary details

- Humidity
- Pressure
- Visibility
- Sunrise/sunset
- Moon
- Pollutants

Do not give all data equal hierarchy.

---

## 9. Recommendation principles

Recommendations must be:

- concise;
- explainable;
- tied to input conditions;
- conservative for high-risk conditions;
- understandable without meteorological expertise;
- configurable through a Rule Engine where appropriate.

Each recommendation should be able to carry:

- title;
- message;
- category;
- severity;
- reason;
- triggering measurements/rules;
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

---

## 10. Health scope and safety

The application provides **general environmental health/outdoor guidance**.

It is not intended to:

- diagnose disease;
- prescribe treatment;
- replace a doctor;
- infer medical conditions from weather data.

If personal health profiles are introduced later, they require a separate privacy and safety review.

---

## 11. Success criteria

The MVP is successful when a user can open the app and, within a few seconds, understand:

- current conditions;
- the most important environmental risk;
- near-term forecast;
- a useful action/recommendation.

Engineering success also requires:

- reliable weather normalization;
- responsive mobile UI;
- robust permission/network handling;
- secure Supabase use;
- maintainable rules;
- acceptable performance on common Android/iOS devices.

---

## 12. Product non-goals

The product must not become:

- a data-dump dashboard;
- a generic AI-styled UI;
- a medical-diagnosis app;
- a weather-provider-specific frontend;
- a system where every possible combination is hard-coded;
- an admin-heavy platform before the mobile core experience works.
