# PROGRESS.md

## Current milestone

Defense study guide refresh — 2026-10-23:
- Rewrote docs/ON-BAO-VE.md as a staged study guide: 10-minute essentials,
  six file-by-file feature flows, spoken answers, a worked rule-merging example,
  code-reading vocabulary, UI/logic edit targets and a two-hour rehearsal plan.
- Included current css folder paths, the complete Gmail/OTP flow and Supabase
  responsibilities, implementation limits and test evidence without live claims.
- Verified local links, named function references and Markdown structure.
  Documentation-only change; no application code or hosted configuration changed.

Compact source formatting — 2026-10-23:
- Reformatted imports, destructuring, simple parameters/arguments and short
  arrays/objects in 70 source files. The supplied account model example is now
  one line. Long identifier lists wrap in groups rather than one name per line.
- Removed 2,456 formatting-only lines. Vietnamese comments, shared styles,
  literals and generated database types are preserved. Updated formatting rules.
- Verified identical TypeScript/JSX AST for all changes; TypeScript passes.

Short Vietnamese function comments — 2026-10-23:
- Added one-line // descriptions before 471 named functions/components/callbacks
  and 46 style groups. Comments cover UI, hooks, services, rules and style helpers;
  generated database declarations remain untouched.
- Verified identical TypeScript/JSX AST before/after annotation; TypeScript passes.
  No executable code, behavior, filenames or imports changed.

Central CSS folder — 2026-10-23 (ADR-062):
- Moved all 23 unchanged style modules into src/css/components (17), screens (5)
  and context (1). Updated source imports/re-exports and the UI-edit guide links.
- Source count stays 81; style files no longer share folders with UI source.
- Verification: TypeScript, all 357 tests/40 suites, Android and web exports pass.

Separate styles for defense editing — 2026-10-23 (ADR-061):
- Extracted 23 matching `.styles.ts` files for components, screens and root UI.
  No StyleSheet.create blocks or inline style object literals remain in TSX.
  Responsive/state/animation helpers and embedded artwork CSS live in style files.
- Added Ctrl/Cmd-click import hints and docs/SUA-GIAO-DIEN.md with links for each
  UI section and common feature changes. Shared tokens remain in theme.ts.
- Source count: 81 (58 application + 23 style); all files remain below 700 lines.
  Compared 72 moved declaration initializers without changes.
- TypeScript, all 357 tests/40 suites, Android export and web export pass.
  No physical-device/iOS visual smoke was performed for this extraction.

Smaller source modules — 2026-10-23 (ADR-060):
- Split all seven source files exceeding 700 lines into focused modules, keeping
  existing exports and all behavior. Source count is now 58; largest file is 653.
- Home advice 864→372 lines, locations 818→380, demo scenarios 820→483,
  weather adapters 805→427, recommendations 748→605, rules 730→538,
  planning 712→385. New modules retain concise Vietnamese explanations.
- TypeScript, all 357 tests across 40 suites and Android export pass. No new
  visual device/iOS review; this change only moves existing declarations.

Student readability — 2026-10-23:
- Added concise Vietnamese role comments to all 50 application source files;
  generated database type declarations remain unchanged beneath the header.
- Explained the Home, weather loading, recommendation merging/ordering and
  activity assessment flows. Expanded nested assessment branches and grouped
  declarations; replaced abbreviated forecast mapping variables with readable names.
- Linked the defense study guide and source-reading order from README.
- Verification: TypeScript and all 357 tests across 40 suites pass. No UI behavior,
  API contract, database schema or source-file count change.

Everyday advice and compact Do now — 2026-10-23 (ADR-059):
- Added measured comfort rules for moderate warmth (28–<35°C measured/feels-like),
  conditional indoor comfort in warm/cold weather, humid-weather damp items and
  dry-air discomfort. Humidity evidence is explicit; never assume indoor readings.
- Selected-location nighttime language focuses on rest. No inferred commute and
  no favorable outdoor claim from missing AQI/UV. Informational advice does not
  create new push alerts. Weather hazards retain priority.
- Do now is one panel: no repeated “Gợi ý sinh hoạt” badges, smaller secondary
  icons/titles, three preview rows including optional tasks; warnings stay visible.
  Expand for more suggestions and full evidence. Secondary preview copy gives the
  action without repeating the same weather measurements on every row.
- TypeScript and 357 tests across 40 suites pass. Android export passes before
  final compact presentation; native Redmi 7 review shows new daily advice for
  actual 28°C / feels-like 34°C and no repeated info badges. Source remains 50.
  iOS remains unverified.

### Previous palette milestone

User palette rollout — 2026-10-22 (ADR-058):
- All ten supplied colors are centralized in theme.ts and applied to shared
  controls, Home, Forecast, planning, account, locations, notifications and welcome.
  Native shell backgrounds/notification accent are configured for the next build.
- Cream canvas, navy depth, red primary actions, cyan secondary actions, cyan
  information, teal favorable states and gold/yellow advice/selection. Preserve
  warm Do now surfaces. Deeper navy small copy preserves contrast on saturated fills.
- Follow-up: secondary fills now use cyan with dark copy, separating them from
  navy borders/shadows across shared buttons. Corrected custom GPS button copy.
- TypeScript and all 352 tests pass, including normal-copy contrast checks on
  colored surfaces and both button roles. Physical Redmi 7 review confirms Home
  and planning inputs/results at 360dp. No layout/function changes or source files
  added. iOS remains unverified.

### Previous notification milestone

Expo Go notification delivery — 2026-10-22 (ADR-057):
- Use Expo Go's native default channel for weather alerts and saved-hour reminders,
  rather than referencing an unavailable project channel. Real builds retain the
  high-priority project channel. Repair persisted schedules once on channel change.
- Test notifications present immediately, check permission and do not depend on a
  future alarm or task-action category. First opt-in sends a confirmation; the UI
  explains Expo Go naming and links to system notification settings.
- Saved-hour reminders due within 15 minutes now send once immediately instead of
  being skipped. Scheduling failures appear as feedback.
- Physical Redmi 7: confirmed a new test notification in Android's notification
  tray under Expo Go, importance 4. System zen_mode=1 explains possible suppressed
  sound/banner; no system preference changed. iOS remains unverified.
- TypeScript and all 352 tests across 40 suites pass. Source remains 50 files.
  Remote server push remains outside
  Expo Go's Android capabilities; no EAS/FCM/backend schema changes were made.

### Previous commute milestone

Commute timing clarity — 2026-10-22 (ADR-056):
- Work/school uses an explicit departure and travel duration, with date/transport.
  It does not reuse free-time bounds, rank a replacement departure or show
  alternative hours. Reminders also keep the saved departure.
- Results explain environmental conditions during that exact trip and preparation.
  Severe, missing and stale conditions remain visible; unsafe/unknown results
  cannot be saved. Forecast coverage is required throughout travel.
- Walking/running/outings retain the availability-based window finder.
- Verified TypeScript and 348 tests across 40 suites. Native Redmi 7 review shows
  date/travel-duration boxes, one departure selector and transport, with no From/To
  range in work/school. Follow-up native review confirms quick choices at 06:00,
  06:30 and 07:00. Departures before 06:00 are excluded in UI and domain checks;
  midnight is no longer selectable. iOS remains unverified. Source stays 50 files.

### Previous weather-context milestone

Weather context, work/school and avatar correction — 2026-10-22 (ADR-054):
- Four activities: walking, running, work/school travel and general outings.
- Measured ordinary-temperature clothing advice fills the former empty gap;
  AQI/UV/future outdoor suitability are never inferred from those temperatures.
- Selected-location 22:00–04:59 wording fits rest, keeps weather evidence and
  hazard priority, and never infers a work/school departure from preferences.
- Evaluate all candidates before Home filtering. Foreground refresh every 10
  minutes; missing/stale/failed data remain explicit and recoverable.
- User rejected pale controls and blue-on-blue advice. Strong button colors
  restored; Do now uses white/amber/orange without blue/green rows or badges.
- Restored private avatar rendering, picker, upload/remove, dependency/plugin and
  original tests. Existing images remain intact. Application source stays 50 files.
- Verification: TypeScript and all 340 Jest tests across 40 suites pass.
  Android export passes; Home visually reviewed on the physical 360dp device.
  At 22:33 it showed rest/comfort advice with actual 25°C / feels-like 31°C,
  an amber/white panel and colored controls. iOS and a real avatar replacement
  upload were not exercised; restored repository tests cover the upload contract.

### Previous simplification milestone

Environmental recommendation focus — 2026-10-22 (ADR-053):
- Public Home/Forecast/activity assessment; personal save/sync still requires auth.
- Three visible activities: walking, running, travel/outings; transport/exposure
  change assessment and are retained in saved policy variants. Old IDs still read.
- Saved future hours retain evidence/reminder/remove only; retired checklist,
  completion/history management, rescheduling UI and manual two-time comparison.
- Preparation comes from weather evidence; removed generic shopping bags/shoes.
- Home leads with precautions, then optional opportunities and the hour chooser;
  all warning/danger advice remains visible. No fixture-based live recommendations.
- Optional saved availability fills the chooser after auth restoration.
- Initials replace photo editing; removed image picker dependency/plugin. Existing
  Storage objects and all existing account/plan rows remain untouched.
- Forecast retains daylight/visibility, omits Moon phase/pressure presentation.
- Validation: TypeScript, 317 Jest tests in 39 suites and Android export pass.
  Retired avatar tests with their feature; added exposure/policy compatibility tests.
- Android Home and hour chooser rendered and visually reviewed on a physical
  360dp device (system volume overlay obscured part of the right side). Full
  guest save/login, saved reminder lifecycle and iOS smoke remain unverified.
- Application src remains 50 files; no schema/RLS/Gmail OTP configuration changes.

Email OTP length — 2026-10-22:
- Hosted Auth now generates exactly 6 digits (mailer_otp_length=6 verified by GET).
- Input renders six cells and accepts six digits; signup/recovery validate six
  digits and retain leading zeroes. Gmail hook remains enabled.
- TypeScript, 16 OTP repository tests and 24 mail/setup tests pass.
- Request a fresh OTP after this change; older longer codes are not truncated.

50-file application structure — 2026-10-22:
- Reduced application source from 120 to exactly 50 TypeScript files; all 120
  original modules' declarations are retained in related groups.
- Count includes six routes, the web-specific artwork file and generated types.
- Source has 11 directories including src. Components no longer have subfolders.
- Kept component functions, UI/styles, business rules, storage and query contracts.
- Applied readable formatting with target width 100; generated database types
  remain byte-for-byte identical. No dependency or backend migration.
- Added Jest-only mocks for native SQLite installation and WebView imports.
- Validation: TypeScript passes; all existing 319 tests in 40 suites pass;
  Android export passes. Runtime statement comparison covers 622 declarations/
  statements, accounting for scoped renames, import moves and JSX whitespace.
- Native device/iOS visual smoke tests have not been rerun for this refactor.

### Previous milestones

Upcoming plans and rescheduling — 2026-09-15: Home shows the nearest future
saved activity, current assessment and unfinished preparation below immediate
advice. Home and plan notifications open the selected owned plan at page top.
Users can expand a reschedule section, choose date/free hours and replace the
existing time after fresh forecast evaluation. Checklist checks are reconciled;
reminder opt-in is retained and local reminder scheduling follows the new time.
A move within 15 minutes cancels the obsolete trigger. Migration 20260915141808
also fixes missing UPDATE grants for existing checklist/reminder controls.
Transactional SQL tests passed for owner updates, stale writes and isolation;
all test data rolled back. Generated types unchanged, no new advisor findings.
Android visual review completed for card, preparation, dropdowns and alternative
cards; temporary authenticated review route removed. TypeScript, all 327 tests across 40 suites and the final Android export passed.
No background weather monitoring service or closed-app change push was added.

Three-option feedback — 2026-09-15: removed Busy from all feedback menus and
stopped applying legacy busy rows to suggestions. Helpful feedback promotes
optional advice within equivalent priority, Dislike suppresses optional advice
and moves that activity down the picker, Inaccurate lowers similar optional
advice and invalidates weather/AQI caches for a refresh. Contextual inaccurate
reports affect their recorded part of day. Latest walking preference is shared
between planning and Home. Warnings/precautions always precede optional advice;
no feedback changes measured conditions or makes unsafe windows eligible.
Feedback remains account-scoped, editable via subsequent responses and reset.

Home/action layout refinement — 2026-09-15: warning badge sits above the SVG
on the left of priority advice. Home Why buttons removed; concise reasons are
inline and feedback uses a small text action. Plans uses a taller scrolling
header with a coral X returning Home, not a sticky native back toolbar.

Activity planning — 2026-09-15: Home now links to a multi-activity planner
(walking, running, commute, outing, shopping). Users choose date/duration/free
hours, compare any two covered times, see evidence and a condition-specific
checklist, and save plans to their account. Reminder opt-in and checklist state
are per plan. Saved-plan details stay collapsed for readability. Home advice
has a Why disclosure with actual rule triggers and feedback. Helpful/busy/
dislike/inaccurate feedback is stored per account; busy periods and disliked
optional advice influence future suggestions without hiding warnings. Users
can reset feedback from Plans.
Supabase migration 20260915040840_expand_activity_planning applied; types
regenerated, RLS/advisors checked, cross-account read and reassignment tests
passed in a rolled-back transaction. All 312 tests passed; subsequent notification/feedback checks, TypeScript and
Android export passed after refinements. Reviewed the live authenticated planner
on Android, selected free hours, expanded forecast evidence and toggled checklist
items. Temporary preview route removed. No real notification sent during review.
Notifications: local 15-minute pre-plan reminders and deduplicated deterioration
alerts after foreground forecast refresh; monitoring uses saved coordinates.
No server background weather monitoring/push is deployed. App explicitly says
changes are checked while open/on return; closed-app reminders use OS schedules.

Welcome and OTP UI — 2026-09-15: authentication now opens a dedicated three-slide
product introduction with separate Register and Login actions. The first two
slides use user-provided start-image/running-on-good-day.jpg and rainy-day.jpeg;
the third retains the routine SVG. Photos use 12px ink-bordered frames. Forms open
only after choosing; their back action returns to introduction, never Home.
The in-app account sheet retains its layout. Email OTP uses per-digit visual
cells over a single native input for keyboard, paste and autofill compatibility;
6 cells initially, expanding for supported 7–10 digit server codes. Reviewed
welcome and OTP input on Android. No live email sent.
All slides now share one image frame/aspect ratio and measured title/body heights;
removed SVG inner margins. Reviewed all three pages, swipe pagination and signup
entry on Android. Native OTP preserves leading zeroes and supports backspace.
TypeScript, 15 auth tests and final Android export pass. Hosted email setup
remains pending as documented in EMAIL_OTP.md.

Mandatory authentication — 2026-09-15: added registration-first auth page and
Stack.Protected guards for all product routes. No guest/close action. Session
restoration blocks content; logout returns to authentication. Existing signup
OTP, recovery and post-signup onboarding are reused.
Validation: TypeScript, all 297 tests and Android export passed. Reviewed the
registration entry on Android and verified a direct /forecast link stays on
authentication while signed out. Live signup/email delivery remains untested
pending the hosted email-template setup documented below.

Email OTP — 2026-09-15: scope corrected to new-account confirmation and
forgotten-password recovery only. Removed passwordless login. Recovery uses an
isolated nonpersistent Auth client: request code → verify recovery OTP → enter
and confirm new password → return to password login. The application's stored
session is unaffected. Errors, resend cooldown and cancellation are handled.
Hosted configuration remains incomplete: MCP cannot update Auth templates and
no management token is available. Apply confirmation.html to Confirm signup and
recovery.html to Reset password (not Magic Link); see docs/EMAIL_OTP.md.
No actual email delivery or password change on hosted accounts was tested.
Validation: TypeScript, 15 OTP/recovery tests and Android export passed. Reviewed
the forgotten-password entry on the connected Android device; no email sent.


Neo label consistency — 2026-09-12: shared NeoBadge uses a View frame with
2px ink border, 3px hard shadow, 12px corners and reserved shadow spacing.
Applied to Home daypart/upcoming times, all sheet category labels, account
signed-in status, warning badges and the before-start introduction. Blue,
green and orange roles are preserved. TypeScript passes; native review confirms
Home and Account labels render with complete outlines/shadows.


Application-wide UI refinement — 2026-09-12: applied Concrete Jungle color roles
across Home, Forecast, drawer, shared sheets/buttons, Account, Locations,
Notifications and legacy planner controls. White/gray reading surfaces; orange
primary actions; blue navigation/active tabs; green success; amber priority
advice/current forecast sample. Drawer colors are confined to category strips.
Fixed white-on-blue text in account/location panels. Shared headers and Home
spacing are tighter; Forecast shows tabs/data before upcoming advice; notification
actions sit directly below status. Original SVGs, 12px frames and hard shadows
remain. Native Redmi review covers Home, drawer, forecast, account, locations
and notifications. TypeScript, full test suite and Android export pass.


Before-start palette/layout refinement — 2026-09-12: white header and neutral
surfaces, compact three-segment progress, blue active / green completed states,
white SVG choice rows with amber icon plates and green checks when selected.
Orange primary CTA, white back action and understated defer link establish
clear hierarchy. Dropdown states use blue/amber and a gray close control.
Shared Account fields inherit the treatment. TypeScript and diff checks pass;
native Redmi screenshot verifies the final layout. No recommendation logic changed.


Before-start page — 2026-09-12: dedicated /before-start route replaces the
welcome modal. Three steps, SVG pick rows, transport and outdoor-exposure
questions, and start/end dropdowns at 30-minute increments. Answers persist in
Auth metadata and affect Home wording/timing; older profiles remain compatible.
TypeScript and 282 tests pass; Android export succeeds. Native Redmi review
verifies all three steps, SVG choices and time controls. Test answers were not
saved to the signed-in account.


Onboarding / relevance correction — 2026-09-12: separate two-step sliding
welcome pop-up from the Account editor. Add wellbeing among personal priorities;
laundry is optional and ranked below health/travel/ordinary activities. Drying
requires dry daylight forecasts; evening/night omits laundry. Rain notifications
and upcoming preparation no longer assume washing outside. TypeScript and 277
tests pass; Android export passes. Native Redmi review confirms both welcome
slides and that the popup remains separate from Account. No test preferences
were saved to the device account.


Lifestyle onboarding — 2026-09-12: new app accounts receive activity/daypart
setup after authentication, with defer and later editing in Account. Preferences
persist through Auth metadata and adjust Home advice; warnings remain intact.
Existing accounts opt in without an automatic prompt. Native Redmi review
confirms the account entry and selection form; exact-hour availability and
notification personalization are outside this implementation.
Validation: TypeScript and all 270 tests pass; Android export passes. Native
review covers the account entry and editor layout; new-account registration
and a real Auth save were not exercised end to end on the device.


Header/avatar clipping fix — 2026-09-11: reserve a 56px header slot around
the 48px back button and its separate 4px-offset shadow plate (native toolbar
clips boxShadow at the button edge). Clip avatar images to the inner 9px
curve of their 12px/3px frames on Home and the account sheet.

Navigation/spacing polish — 2026-09-11: space the expanded weather blocks
apart so dividers clear the hero shadow; orange hamburger and matching 48px
neo back button; dark forecast title; slide navigation, detail open/close and
both forecast modes and auth mode switching, respecting Reduce Motion.
TypeScript, 261 tests and Android export pass. Native review verifies the new
back button and dark title; shared reveal content retains spacing while sliding.

Concrete Jungle refresh — 2026-09-11: ten-color palette, consistent 12px
corners, colored buttons, reduced-motion-aware drawer/detail slides, and
hourly/seven-day forecast modes. TypeScript, 261 tests and Android export pass.
Native Redmi review verifies both forecast tabs, 12px cards and the opened
colored drawer. App/splash/adaptive-icon backgrounds and notification accent
are also aligned; native configuration changes take effect in a rebuilt app.

Recommendation-first Home — 2026-09-11.

- Compact, tappable location/conditions summary replaces the large weather hero
  at entry. Priority advice is visible in the first viewport. Original SVGs,
  6px corners, black outlines, poster typography and hard shadows are retained.
- Home order: context → priority action → other activity decisions → upcoming
  preparation → optional measurements/forecasts. Large weather components are
  kept behind “Xem chỉ số & dự báo làm căn cứ”. No chore completion buttons.
- Removed unconditional daypart routines. Existing weather rules remain the
  evidence for advice. Outdoor activity adjustments reuse rain/heat/AQI/shelter
  evidence; missing data never produces an invented favorable walking window.
- Near-term preparation uses fresh future forecast samples within six hours,
  local times and explicit rain probability. Absent/stale evidence omits it.
- Reduced repeated Home source/debug wording and duplicate risk summaries.
- TypeScript and all 261 tests in 33 suites pass; Android export succeeds.
  Native screenshot confirms recommendation prominence on Redmi. Pull-to-refresh
  remains available; GPS/source diagnostics are inside the optional details.

## Project status

### Completed

- Private account profile images:
  - added the Expo SDK 57 system image picker with square editing and no camera
    or microphone permission;
  - validates common raster formats and a 5 MiB maximum before uploading the
    React Native `ArrayBuffer`;
  - added remote migration `20260902105227_add_private_profile_images_bucket`
    with a private bucket and owner-UUID-folder Storage RLS;
  - stores only the object path in `profiles.avatar_url`, serves one-hour signed
    URLs, removes replaced images, and falls back to account initials;
  - account-sheet choose/change/delete controls expose loading, success, file,
    network, and Storage error states;
  - the new helper tests and strict TypeScript pass; full regression and native
    visual review are tracked below.

- Action icon and device-notification pass:
  - recommendation headings now compose one or two semantic SVGs for the
    actual preparation kit: umbrella/shoes, hanger/cover, temperature-only
    sun/heat protection, light clothing, cold/warm layer, or outdoor footwear;
  - sun/heat/hydration actions no longer repeat a shirt icon; shirt artwork is
    reserved for explicit light-clothing recommendations;
  - clothing and daily-life artwork resolves from `assets/weather-cloths`,
    while AQI and shelter retain their specialist symbols;
  - compact labels explain each icon kit without relying on imagery alone;
  - local notifications cover current/near-term rain, the highest warning or
    danger risk, and one primary attention-level action, with stable signatures
    preventing repeated scheduling after every weather refresh;
  - tapping an app notification returns to Home, and Android uses a dedicated
    high-priority channel plus a valid white 96×96 notification icon in
    development/release builds;
  - device scheduling is serialized across weather refreshes, failed native
    replacements remain retryable, disabling waits for in-flight work before
    cancellation, and permission state is rechecked when the app returns to
    the foreground;
  - Expo Go falls back to its host notification channel when project-owned
    channel creation is unavailable instead of failing the opt-in flow;
  - strict TypeScript, 200 tests across 26 suites, Expo SDK 57 public config,
    Android production export, and physical Redmi 7 visual review passed;
  - Redmi 7 confirmed the local notification was posted at high importance;
    Android correctly suppressed it while Do Not Disturb was active, then
    displayed it after Do Not Disturb was disabled, and tapping it returned to
    Home.
  - authenticated notification opt-in now upserts to the owner-scoped Supabase
    `notification_preferences` table while device permission and native
    schedules remain local; guests retain the existing local-only flow;
  - remote migration `20260902102854_add_notification_preferences`, generated
    TypeScript types, RLS/grants, retry-safe client repository, and repository
    tests are committed with the mobile integration.

- Manual place search hardening and daily-life recommendation expansion:
  - same-query submissions now refetch instead of becoming a no-op;
  - search dismisses the keyboard, exposes timeout/network/rate-limit/provider
    states in Vietnamese, and uses a 20-second bounded remote timeout;
  - Android devices with existing foreground permission use the bounded system
    forward geocoder before Open-Meteo, fixing the reproduced Redmi 7 TLS stall
    without prompting for additional permission;
  - physical Redmi 7 verification passed from `Paris` search result through
    normalized manual selection and a location-driven Home refresh;
  - Rule Engine now recommends protecting outdoor laundry during current or
    near-term rain and suggests light outdoor activity only during a verified
    dry, comfortable, low-UV, good-US-AQI window;
  - near-term rules now start at the first forecast timestamp at or after the
    current observation instead of accidentally evaluating past hours;
  - strict TypeScript, 183 tests across 22 suites, Impeccable detector, Android
    production export, and physical Redmi 7 visual review passed.

- Project topic defined: weather forecasting and user health support.
- Mobile technology direction: React Native.
- Operations: Supabase Dashboard; separate ReactJS Web Admin deferred (ADR-032).
- Backend direction: Supabase.
- Open-Meteo selected for initial MVP weather, astronomy, AQI, and pollutants;
  earlier OpenWeatherMap/AirVisual references remain historical scope context.
- Real-time GPS requirement identified.
- Rule Engine requirement identified.
- Health and clothing recommendation requirement identified.
- Push notification requirement identified.
- Project-local Agent Skills installed for:
  - React Native;
  - React best practices;
  - composition patterns;
  - Impeccable;
  - Supabase;
  - Supabase/Postgres best practices.
- Optional authentication and remote saved-location flow completed:
  - square sunflower masthead with hamburger left and account avatar right;
  - neobrutalist drawer for Home, Forecast, Locations, and Account;
  - Supabase email/password sign-up, sign-in, sign-out, Expo SQLite session
    persistence, and native AppState token-refresh lifecycle;
  - Open-Meteo Geocoding parser/adapter/query boundary for remote place search;
  - manual `SelectedAppLocation` selection without changing device GPS;
  - guest remote viewing plus authenticated list/save/delete against the
    existing owner-scoped `saved_locations` schema;
  - Syne Regular/ExtraBold restricted to ASCII chrome labels, preserving
    Archivo/JetBrains Mono Vietnamese coverage and Bebas numeric display;
  - strict TypeScript, 176 tests across 21 suites, Android production export,
    and two-pass native Redmi 7 visual review.
- Initial weather-condition/icon architecture defined:
  - normalized internal conditions;
  - day/night separation;
  - moon phases;
  - local amCharts animated/static asset direction.
- Visual identity replaced with **Weather Public Bulletin**:
  - light-only warm-paper canvas;
  - neobrutalist square geometry and thick black rules;
  - structural offset shadows;
  - cobalt, sunflower, mint, and coral/red accents;
  - Vietnamese-capable Archivo Black for poster headings, JetBrains Mono
    Regular/Bold for normal copy and technical labels, and Bebas Neue for
    oversized numeric weather readings;
  - no rounded surfaces or controls;
  - one local animated amCharts SVG surface with synchronized black offset
artwork per current-weather hero, plus cached static forecast-row artwork
and reduced-motion fallbacks;
  - consistent customer-facing depth tokens: 4px interactive control plates,
    compressed pressed states, and 6px grouped panel/table plates while
    individual data cells remain flat for scanability;
  - simplified section and recommendation language without ASCII weather art.
- Weather artwork performance pass completed:
  - current-weather artwork reduced from two WebViews to one WebView containing
    both foreground and black offset layers;
  - repeated hourly/daily weather artwork moved to `expo-image`, eliminating
    per-row WebViews while retaining the square neo-brutalist treatment;
  - image sizing reserves the hard-shadow offset so artwork is not clipped.
- Customer-facing location and hierarchy pass completed:
  - one timeout-bounded reverse-geocode request after successful GPS
    acquisition, with weather/GPS fallback preserved when naming fails;
  - district/city labels replace raw coordinates and `Asia/Ho_Chi_Minh` on
    Home, Forecast, and ready-location surfaces;
  - larger current, hourly, and daily SVG artwork while repeated icons remain
    static and cacheable;
  - Action/recommendation content now has a complete square border and hard
    black panel shadow.
  - native Android capture confirmed the resolved “Đà Nẵng” label without the
    geocoder's numeric street placemark, readable large SVGs, and a two-tier
    daily row that does not vertically fragment the date.
- Recommendation-first Home pass completed:
  - the primary path is now `Now → Action → Why → Next`;
  - the Rule Engine panel follows the current-weather hero instead of appearing
    after GPS, metrics, and forecast surfaces;
  - `LÀM` appears first, with one sunflower emphasis for the highest-priority
    recommendation;
  - the risk panel is reframed as the reason behind the guidance, while
    environmental metrics and technical location/data status remain below the
    decision path.
- Typography/performance verification passed:
  - TypeScript strict check;
  - full 171-test repository suite;
  - Android production export with Archivo Black, Bebas Neue, JetBrains Mono
    Regular/Bold, and the local animated/static weather SVG assets;
  - Impeccable typography detector with no findings;
  - source audit confirms one WebView implementation path and zero WebViews in
    repeated forecast artwork.
- UI implementation workflow now requires visual review when rendering tools are available.
- Existing remote Supabase schema captured as an MCP-derived idempotent
  baseline after the official CLI `db pull` workflow was found impractical in
  the sandbox.
- Remote migration history established for the baseline and two hardening
  migrations.
- Existing four-table schema hardened without adding future tables or changing
  the `recommendation_rules` shape:
  - least-privilege grants;
  - owner-scoped RLS;
  - temporary admin authorization through
    `app_metadata.app_role = "admin"`;
  - integrity constraints and foreign-key delete behavior;
  - supporting ownership, foreign-key, default-location, and active-rule
    indexes.
- `handle_new_user()` hardened with an empty fixed search path and restricted
  execute privileges.
- Hosted Auth signup verified to create exactly one profile row.
- Complete two-user RLS matrix passed, including cross-user denial, admin rule
  CRUD, anonymous denial, and integrity checks.
- Supabase security advisors passed with zero findings.
- Supabase performance advisors passed with zero warnings; only a new-index
  usage INFO notice remains.
- TypeScript database types generated at `src/types/database.ts` after all
  database tests passed.
- Existing Expo SDK 57 starter converted into the Phase 1 mobile foundation
  without recreating the project:
  - stable Expo Router native Stack; unstable native tabs removed;
  - composed safe-area, query/cache, theme, and global-error providers;
  - TanStack Query cache with native focus and connectivity integration;
  - typed Supabase client using generated database types and Expo SQLite
    session persistence;
  - validated `EXPO_PUBLIC_SUPABASE_URL` and publishable-key configuration,
    with secret-key rejection and a boot-safe unconfigured state;
  - light-only design tokens aligned with the current visual direction;
  - Archivo regular/bold/black and Bebas Neue loading through Expo Font;
  - Jest/`jest-expo` test foundation.
- Phase 1 verification passed:
  - TypeScript strict check;
  - 6 foundation unit tests;
  - Expo public configuration resolution;
  - successful Android, iOS, and static web production bundles.
- Provider-independent weather domain foundation implemented:
  - the canonical 33-value `WeatherCondition` vocabulary from `WEATHER.md`;
  - a normalized `CurrentWeather` contract with explicit SI-style units and
    timezone-aware observation/environmental timestamps;
  - independent condition, day/night, moon, precipitation, wind, UV, AQI, and
    alert dimensions;
  - explicit partial-data semantics: an omitted optional dimension is
    unavailable, while values such as precipitation `none` and `alerts: []`
    represent known empty states;
  - adapter-boundary validation for canonical values, physical ranges,
    chronology, time zones, and cross-field consistency, without selecting
    provider-specific UV or AQI thresholds.
- Eleven typed Vietnamese weather fixtures added for clear day, clear night,
  partly cloudy, rainy night, heavy rain, thunderstorm, fog/haze, high UV,
  unhealthy AQI, severe alert, and partial/missing-data scenarios.
- Phase 2A verification passed:
  - TypeScript strict check;
  - 13 weather-domain unit tests covering invariants, canonical conditions,
    optional data, independent environmental dimensions, and invalid values;
  - full 19-test repository suite.
- Open-Meteo provider boundary implemented without changing Phase 2A:
  - centralized Forecast and Air Quality endpoints, exact request variables,
    `timezone=auto`, Unix timestamps, and normalized unit parameters;
  - native Fetch-compatible transport with injected transport support and no
    `openmeteo` NPM dependency;
  - runtime-parsed REST JSON DTOs for current, hourly, daily, AQI, pollutants,
    UV, and astronomy data;
  - centralized documented WMO-code mapping with safe `unknown` fallback;
  - current-weather adaptation for daylight, temperature, precipitation,
    pressure, cloud cover, wind, UV, AQI, pollutants, sun, and moon data;
  - explicit European/U.S. AQI scale selection without a global standard;
  - static provider fixtures and entirely offline adapter tests;
  - severe alerts explicitly left unavailable because the selected endpoints
    do not provide an authoritative alert feed.
- Phase 2B verification passed:
  - TypeScript strict check;
  - 56 Open-Meteo request/parser/adapter/mapping tests;
  - full 75-test repository suite.
- Phase 3A Home visual prototype implemented without changing the weather
  domain or Open-Meteo provider boundary:
  - fixed `Now → Risk → Next → Action` decision path with a restrained
    environment-reading row;
  - normalized current-weather hero with temperature, feels-like, condition,
    daylight, location, and observation time;
  - independently composed geometric day/night, moon phase, wind, AQI
    particulates, cloud, precipitation, storm, visibility, and dither cues
    using domain semantics only;
  - fixture-authored primary risk rail with calm, UV, AQI, rain, storm,
    severe-alert, and unavailable-data treatments;
  - explicit UI-only typed hourly preview, kept separate from
    `CurrentWeather` until a forecast domain contract is introduced;
  - explicit fixture-backed `WHAT / WHY / DO` copy, kept separate from the
    future recommendation rule engine;
  - nine-state in-app prototype selector covering normal, night, high UV,
    unhealthy AQI, rainy night, heavy rain, thunderstorm, severe alert, and
    partial-data scenarios;
  - flat ruled sections, JetBrains Mono identity type, restrained native
    geometric weather imagery, dry semantic fields, and accessibility-hidden
    dither details;
  - full safe-area protection, compact/large-text reflow, native minimum touch
    targets, screen-reader labels, long Vietnamese wrapping, and a stable
    no-motion presentation that inherently respects reduced-motion settings.
- Phase 3A verification passed:
  - TypeScript strict check;
  - 8 new Home presentation/composition tests;
  - full 83-test repository suite;
  - successful Android production bundle including JetBrains Mono assets;
  - static Impeccable detector pass with no findings;
  - independent source-level Impeccable finish review reached `ship` after
    correcting decision-path order, independent scene cues, bottom insets,
    and compact/large-text reflow.
- Android native screenshot review completed on the connected compact WayDroid
  surface (Android 13, 576x1024 at 180 dpi). The live Home hierarchy, safe-area
  handling, Vietnamese wrapping, current-weather hero, horizontal hourly rows,
  and fixture boundary for Action rendered without clipping or a blocking
  visual defect. Physical Android hardware and iOS visual review remain
  separate platform-validation tasks.
- Phase 3B.1 Location Capability implemented without changing Supabase, the
  Open-Meteo boundary, the weather domain, or the Home composition:
  - Expo SDK 57-compatible `expo-location` with a foreground-only config-plugin
    permission explanation;
  - project-owned coordinates, device-position, permission, capability-state,
    and selected-location contracts;
  - explicit idle, permission-checking, permission-required,
    permission-requesting, position-acquiring, ready, permission-denied,
    permission-unavailable, services-unavailable, and acquisition-error states;
  - balanced one-shot position request with a 12-second application timeout;
  - bounded last-known fallback limited to 15 minutes and 5-kilometre accuracy;
  - invalid-coordinate and invalid-timestamp rejection before values reach
    application state;
  - application-owned capability provider, separate from TanStack Query;
  - selected-location boundary supports future `device` and `manual` sources;
  - minimal ruled Home status/action strip for explanation, permission request,
    progress, retry, settings recovery, fallback disclosure, and denial without
    blocking fixture weather;
  - no reverse geocoding, background permission, continuous tracking,
    application-level coordinate persistence, history, Supabase writes, or
    weather requests.
- Phase 3B.1 verification passed:
  - TypeScript strict check;
  - 21 new location domain/service tests with Expo Location fully mocked;
  - full 104-test repository suite;
  - Expo dependency and public native-permission configuration checks;
  - successful Android production bundle;
  - successful Expo development-server bootstrap.
- Phase 3B.2 Live Current Weather + Air Quality integration implemented without
  changing Supabase, the location state machine, or hourly forecast scope:
  - application-owned selected-location → query → provider → adapter → domain
    orchestration boundary;
  - three-decimal coordinate normalization for requests and stable query keys;
  - minimal concurrent Forecast current/astronomy and Air Quality current
    requests, without hourly arrays;
  - required Forecast versus optional environmental composition, with
    project-owned complete, partial, malformed, and transient error semantics;
  - no fabricated AQI/UV zeroes, safe categories, alerts, or moon illumination;
  - explicit configurable `us_aqi` live-slice default while the final product
    AQI standard remains open;
  - ten-minute staleness, focus/reconnect refetch, no polling, and bounded
    transient-only retry;
  - live Home `Now`/environment data with loading, offline-paused, retry,
    partial, stale, and background-refresh-error presentation;
  - explicit fixed fixture boundaries for `Next` and `Action`; live `Risk`
    remains an observation/availability notice rather than a fake rule result.
- Phase 3B.2 verification passed:
  - strict TypeScript check;
  - 17 new automated tests and full 121-test repository suite;
  - Expo SDK 57 dependency check against the locally bundled version map and
    successful public config resolution;
  - successful Android production bundle;
  - successful Expo/Metro development-server boot;
  - fixed-coordinate TP.HCM live smoke through minimal Open-Meteo responses,
    DTO parsing, existing adapters, and application `CurrentWeather`
    composition.
- Phase 3B.3 normalized hourly integration implemented without changing
  Supabase, the location state machine, or recommendation-engine scope:
  - one live Forecast request shared by separate normalized current and hourly
    domain adapters;
  - ordered absolute hourly timestamps with provider IANA timezone context;
  - canonical condition, independent daylight, Celsius temperature, optional
    apparent temperature, precipitation, wind, and UV per hourly entry;
  - independently degradable hourly parsing/adaptation that preserves valid
    current weather and reports an explicit partial-data issue;
  - six-entry near-term Home presentation selected above the domain layer;
  - Home `Next` uses live hourly data when available and never falls back to a
    fixture during a live partial result.
- Phase 3B.3 automated verification passed before native testing:
  - 138/138 Jest tests across 17 suites;
  - strict TypeScript check;
  - Expo SDK 57 public configuration resolution;
  - dependency compatibility against the local SDK 57 bundled map;
  - successful Android production bundle;
  - successful Expo/Metro development-server boot.
- Phase 3B.3 Android native verification passed on ADB device
  `192.168.240.112:5555` (`WayDroid x86_64 Device`, Android 13, Expo Go 57.0.3):
  - Expo Go opened the SDK 57 project and Metro delivered the Android bundle;
  - Android displayed the native foreground-location dialog and granted
    while-in-use fine/coarse permission;
  - the location-disabled state kept Home usable with fixture data and exposed
    a retry action;
  - a temporary Android GPS test provider supplied TP.HCM and Hanoi fixes; the
    WayDroid/Google location stack resolved them through the bounded
    last-known fallback, then the application exposed normalized
    `SelectedAppLocation` coordinates;
  - TP.HCM produced live Open-Meteo current weather, AQI/UV, and a normalized
    six-entry hourly `Next` sequence in `Asia/Ho_Chi_Minh`;
  - changing the test fix to Hanoi changed the rounded query coordinates and
    produced a distinct live current observation, proving location-driven
    query refresh;
  - a live hourly-malformed response exercised the partial-data UI: valid
    current/AQI/UV stayed visible while `Next` became explicitly unavailable;
  - native Home captures are archived in `artifacts/native-verification.zip`,
    including `gps-after-accuracy-choice.png`, `home-live-next-tphcm.png`, and
    `location-disabled-result.png`;
  - no implementation defect was found and no source fix was required.
- Light neobrutalist redesign implemented without changing product logic
  (historical ordering later superseded by ADR-026):
  - app configuration, splash, status bar, navigation, and error fallback are
    light-only;
  - Home originally used `Now → Risk → Next → Action`, with location failure kept
    compact and non-blocking after the primary decision path;
  - Forecast uses the same visual language and a single truthful location
    recovery state;
  - generated concept imagery remains reference-only; weather artwork ships as
    accessible native geometry composed from normalized domain dimensions;
  - all reviewed user-facing metadata is at least 11 pt and recovery copy is
    plain Vietnamese rather than internal English/error codes;
  - strict TypeScript, 165 Jest tests across 20 suites, Android production
    export, and native WayDroid visual review passed;
  - Impeccable finish review reached `ship` after two focused correction passes.

### Documentation created / updated

- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/WEATHER.md`
- `docs/DESIGN.md`
- `docs/DATABASE.md`
- `docs/DECISIONS.md`
- `docs/PROGRESS.md`

---

## In progress

Complete native verification of public assessment, inline login/save, saved-hour
reminders and the remaining platform/network matrix. The initial walking flow is
implemented; automated backend monitoring and remote push are not implemented.

---

## Next recommended tasks

### 1. Complete the native platform matrix

Complete the verified location-to-live-weather flow on Android with real GNSS
and perform the visual/behavior pass on iOS. Cover approximate-only permission, user denial,
blocked permission/settings recovery, TalkBack/VoiceOver order, large text,
and the remaining severe-risk/night visual states.

### 2. Verify cache and network edge states natively

Exercise stale-cache display, offline-paused loading, background-refresh error,
and complete Forecast failure on a controllable native network. The live
partial-data path has already been observed on Android.

### 3. Broaden daily-life recommendations without weakening evidence

Add time-window-aware rules for commute timing, laundry drying windows,
hydration, ventilation, exercise, umbrella/rainwear, and outfit layers. Keep
each action explainable from normalized current/hourly inputs and resolve
conflicts through priority. Extend the accepted clothing/activity SVG kit only
when a new action has a concrete customer role.

### 4. Continue the visual review loop

For the Home screen:

```text
research references
→ implement
→ run emulator
→ capture screenshot
→ Impeccable critique
→ fix
→ review again
```

Home is the reference surface for the Weather Public Bulletin visual language.

### First UI validation goals

Validate:

- Archivo Vietnamese readability across guidance, data, navigation, and controls;
- Archivo Black poster hierarchy and Bebas Neue numeric display fit;
- large temperature display;
- technical labels at a native-readable size;
- square outlines and structural shadows without clipping;
- bounded animated hero compatibility, static forecast icon caching, black offset synchronization, and reduced motion;
- day/night scene;
- AQI presentation;
- UV presentation;
- forecast readability;
- recommendation readability;
- Vietnamese text;
- small Android screen behavior.

---

## MVP roadmap

### Phase 1 — App shell

- [x] React Native + TypeScript baseline
- [x] Navigation
- [x] Theme/design tokens
- [x] App providers
- [x] Query/cache layer
- [x] Error handling foundation

### Phase 2 — Weather core

- [x] Location permission (Android WayDroid smoke passed; iOS/physical coverage pending)
- [x] Manual-location fallback and remote search
- [x] GPS acquisition capability (Android test-provider/fallback smoke passed;
  physical GNSS and iOS coverage pending)
- [x] Weather provider interface
- [x] Provider adapter
- [x] Current weather domain model
- [x] Weather normalization tests

### Phase 3 — Home MVP

- [x] Current weather hero (live after selected-location query success)
- [x] Day/night visual (live after selected-location query success)
- [x] Temperature
- [x] Feels like
- [x] Main condition
- [x] Wind
- [x] AQI
- [x] UV
- [x] Hourly preview (live normalized `HourlyForecast` after query success)
- [x] Loading/error/offline-aware current-weather states

### Phase 4 — Forecast

- [x] Hourly forecast screen/detail
- [x] Daily forecast
- [x] Precipitation in hourly/daily forecast
- [ ] Sunrise/sunset
- [ ] Moon phase
- [ ] Visibility/pressure as secondary details

### Phase 5 — Recommendations

- [x] Recommendation domain model
- [x] UV rules
- [x] AQI rules
- [x] Heat rules
- [x] Rain and laundry-protection rules
- [x] Clothing rules
- [x] Positive outdoor-window rule
- [x] Prioritization
- [x] Explanation/reason display
- [ ] Time-window planner and conflict-aware daily routine bundles
- [ ] Consistent vector pictograms for clothing and daily-life actions

### Phase 6 — Supabase

- [x] Existing remote project/schema baseline
- [x] Temporary admin authorization decision
- [x] Profiles schema and auth trigger hardening
- [x] Saved locations schema hardening
- [x] Mobile email/password authentication
- [x] Mobile saved-location list/save/delete integration
- [x] Private profile-image Storage and mobile editing
- [x] Notification preferences
- [x] Existing recommendation rules access hardening
- [x] RLS tests
- [x] Generated types

### Phase 7 — Dashboard operations and walking plans

- [x] Use Supabase Dashboard; defer separate Web Admin
- [x] Versioned walking policies and immutable releases
- [x] Date/custom start-end/duration selection and explained alternatives
- [x] Time-aware daily-life guidance on Home and the planning screen
- [x] Guest storage and owner-scoped cloud plans
- [x] Cancellation and completion controls (feedback retired in ADR-047)
- [ ] Native account plan lifecycle verification
- [ ] Automatic plan re-evaluation and push delivery

### Phase 8 — Notifications

- [ ] Device push registration
- [ ] User categories/preferences
- [ ] Severe-weather triggers
- [ ] UV/AQI triggers
- [ ] Delivery testing

### Phase 9 — Quality

- [ ] Small-screen Android review
- [ ] iOS review
- [ ] Accessibility
- [ ] Performance
- [ ] Offline behavior
- [ ] E2E mobile flows
- [ ] Security review
- [ ] UI polish

---

## Known open questions

- Which AQI standard will the UI normalize to?
- Which remote push backend will own token lifecycle, weather evaluation, Expo
  push receipts, and retries?
- Will rule evaluation run client-side, server-side, or hybrid?
- Which app icon library will be used for non-weather UI?
- Which authoritative provider will supply severe-weather alerts?

---

## Known issues

- Gmail API OTP (2026-10-22): gmail-otp Edge Function v3 deployed; Google OAuth
  refresh and signed connection probe now pass. Send Email Hook enabled and GET
  readback confirms the expected endpoint, no custom Supabase SMTP and email
  confirmations still required. Real recovery OTP request at 21:09 UTC+7 returns 200; Auth logs confirm
  Hook ran successfully and gmail-otp returns 200 after Gmail API accepts delivery.
  Inbox receipt remains user-verified. Last default Supabase email at 21:03
  predates hook activation at 21:06; no app/transport defect found. TypeScript and 24 mail
  tests pass; app src remains unchanged. See ADR-051 and docs/EMAIL_OTP.md.

- `recommendation_rules_active_priority_idx` is new and therefore appears as an
  unused-index INFO notice until real application queries generate statistics.
- Local Supabase public environment values are not committed. The app boots in
  an explicit unconfigured state until a developer creates a local `.env` from
  `.env.example`.
- `npm audit --omit=dev` reports 11 moderate transitive advisories in the Expo
  CLI/config-plugin toolchain and its `xcode`/`uuid` dependency chain. It reports
  no high or critical findings; the suggested automatic fix would downgrade
  Expo to SDK 46, so it was not applied. Monitor compatible Expo 57 updates.

---

## Blockers

- No blocker remains for the Phase 3B.3 Android smoke test.
- Still unverified: physical-hardware GNSS returning a `current` rather than
  `last_known` fix; approximate-only, explicit deny/blocked, and settings-return
  permission paths; iOS behavior; TalkBack/VoiceOver and large-text passes; and
  stale/offline/background-refresh/complete-error transitions on a controllable
  native network.
- Remote push remains blocked on an EAS `projectId`, Android FCM v1/iOS APNs
  credentials, a protected token registry, and a server sender. Local scheduled
  notifications are implemented and do not require those services.

---

## Next concrete action

Verify public assessment and authenticated saved-hour/reminder flows on Android and iOS. Then configure the
EAS project and FCM/APNs credentials, implement protected device registration,
backend re-evaluation and push delivery/receipts. Saved plans currently retain
the original forecast explanation and do not update automatically.

A native refresh briefly rejected malformed hourly provider data; a subsequent
refresh recovered the full hourly forecast. This recovery was observed without
weakening adapter validation. Keep this scenario in the provider regression matrix.

---

## Update policy

After meaningful work:

- move completed work into `Completed`;
- update `In progress`;
- update `Next recommended tasks`;
- add blockers/issues;
- keep this file concise.

Do not append chat/session transcripts.


## Activity assessment — current state (2026-10-22)

- Outdoor timing now evaluates an explicitly selected activity, location, date,
  duration and availability against environmental forecasts. Date/duration use
  expandable boxes with custom values; the live result sits alongside on wide
  screens and below on phones. App source remains 50 files.
- Whole-minute durations from 1 to 1440 are supported in assessment, save validation
  and the live database constraint. Only fully covered future windows qualify.
- Results show environmental measurements directly, preparation and alternatives.
  Adverse conditions explain why to change time. Past availability and dates
  outside forecast coverage have explicit messages; no invented future forecast.
- Verified: TypeScript, 344 tests / 40 suites and Android export; Redmi 7 review
  of closed/open date boxes and next-day result with actual UV/AQI/rain/heat.
  iOS and wide-screen rendering remain unverified. Existing Auth password advisory
  is unchanged; this migration adds no new security findings.


## Internship report deliverable — 2026-10-23

Created BC_Intership_Co_san_pham.docx and matching PDF from the school template.
Preserved the four chapter titles and company research; replaced idea-only
sections with actual analysis/design, six diagrams, three native screenshots,
357-test evidence and explicit unverified limitations. Original Word files stay
intact. Cover retains the student identity; the unit supervisor and signed
company review remain for the student to supply.
