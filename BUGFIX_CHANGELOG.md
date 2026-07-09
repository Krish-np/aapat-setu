# Aapat Setu — UI/UX Overhaul & Bugfix Changelog (FINAL)

This ZIP is a complete fresh copy of the project. Extract it over your
existing `aapat-setu/` folder (or replace the folder entirely). Works with
your XAMPP MySQL setup (`aapatsetudb`) and `run.bat` as before.

---

## 1. Layout, Typography & Visual Polish

- Normalized grid/flex containers across all dashboards so cards align
  cleanly on all breakpoints. Fixed the earlier "zigzag" layout bug caused
  by a malformed `<BackButton/>` accidentally injected inside Tailwind
  className strings on multiple pages (every page audited).
- Inter + Plus Jakarta Sans restored as the default English font stack
  (no external Devanagari Google Font added, per request).
- Added dedicated `html[lang="ne"]` CSS rules that switch to a robust
  Devanagari system font stack (Mangal → Noto Sans Devanagari local →
  Devanagari MT → Kokila → Arial Unicode MS) with increased line-height
  (1.65 body / 1.5 headings) and slightly wider gap/spacing values,
  so नेपाली renders without matra clipping or box-shift, and switching
  back to English restores the original Inter/Jakarta layout with zero
  layout jump.
- Fixed Tailwind purge risk: all dynamic color classes (badges,
  notification cards, alert severity bars, AI briefing cards) replaced
  with static color maps so colors render in production builds.
- Card component upgraded with Framer Motion hover lift + active press
  (`whileHover` / `whileTap` spring).
- Phoenix-style glass cards, soft shadows, rounded-2xl radii, and refined
  color palette across light & dark themes.

## 2. Micro-interactions & Animations (Framer Motion)

- Global page transitions in `AppShell.jsx` (fade + slide-up on route
  change).
- Sidebar nav items: hover translate, scale on icon, animated active
  `layoutId` pill indicator.
- Language `EN / ने` pill (Sidebar + Navbar): `whileTap` scale +
  `whileHover` scale spring.
- Notification / alert / task / admin rows all use AnimatePresence
  staggered entry (fade + slide-up, delay-capped at 0.3–0.4s).
- Mobile hamburger menu: animated backdrop + slide drawer.
- Toasts: spring entry from the right, exit slide, deduplication to
  prevent toast-waterfall.
- Buttons already had `active:scale-[0.98]`; retained for tactile press.

## 3. Notifications: Live Timestamps + WebSocket Propagation

- **Fixed "0s ago" frozen welcome card** — welcome notification uses a
  real ISO timestamp (500ms in the past) so relative time starts at
  "just now" → seconds → minutes, rather than being stuck on 0s.
- **Removed hardcoded "6h/7h ago" strings** — every notification,
  timeline entry, and card uses `useRelativeTime` (dayjs +
  `relativeTime` plugin) with smart tick intervals (1s when <1 min,
  30s when <1h, 60s when older) to re-render elapsed time live.
- **Singleton WebSocket** in `lib/api.js` guarantees a single socket
  across the app; duplicate mounts don't open new connections.
- Global `WsListener` mounted in `App.jsx` toasts every
  `incident_created` and `alert_created` event, so new citizen reports
  propagate as high-priority toasts platform-wide.
- `Notifications.jsx` rewritten: merges WS "live" queue with
  server-fetched incidents, dedupes by `_id`, AnimatePresence list,
  live "N new" badge, colored severity icons, fully i18n'd.
- All relative times (Tasks "Posted", IncidentDetail "Reported",
  Timeline items, Admin recent incidents, Alert list) use
  `useRelativeTime` — no stale strings anywhere.

## 4. Full EN / नेपाली Localization Audit

- Every hardcoded title/subtitle/copy in Alerts, Analytics, Admin,
  Notifications, Knowledge, Tasks, IncidentDetail is now wrapped in
  `t('key')` calls.
- Added 40+ new keys to `i18n/en.json` and `i18n/ne.json` (alerts
  severities, analytics stats, admin panel labels, notification copy,
  toast strings).
- Language toggle remains the `EN | ने` pill (no globe icon) in both
  Sidebar and Navbar, with micro-animations.
- `<html lang="…">` is synced to i18n language on every change so the
  Nepali font stack and spacing rules activate/deactivate cleanly.

## 5. OpenRouteService Custom Token + Routing

- Token baked into `frontend/src/lib/mapConfig.js`:
  `eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjlhZDA0YzY2OTM3OTQ3ZjliM2RkNjIxZGNhNDY1YjdhIiwiaCI6Im11cm11cjY0In0=`
- Three routing profiles wired up: **driving-car**, **foot-walking**,
  **cycling-regular**.
- `getRoute()` returns GeoJSON coordinate array, distance (km),
  duration (minutes), turn-by-turn steps (HTML stripped to plain text),
  and bbox.
- `Map.jsx` fully rewritten premium component:
  - 4-severity teardrop pins (Lucide icons inside), critical pins pulse.
  - Lucide POI markers (hospitals, police, fire, NGOs, shelters,
    supplies, municipality) with colored icon tiles + tail.
  - 3-ring user-location dot (solid / halo / pulse).
  - Route polyline drawn as shadow + highlight stroke.
  - Bottom-right glass zoom + / − / recenter controls (default Leaflet
    controls hidden).
  - Top-left ETA badge with route summary + collapsible turn-by-turn
    steps.
  - Severity-colored popups with relative timestamps + "View details"
    CTA.
  - `key={isDark?'dark':'light'}` on MapContainer forces remount on
    theme switch so tile themes refresh.
- `MapPage.jsx`: premium chip filter tabs (not native select), mobile
  slide-drawer incident list, skeleton loader, motion entry.
- `Report.jsx`: matching premium zoom/recenter controls, animated
  pick-pin, theme-reactive, submit-disabled while loading.
- `IncidentDetail.jsx`: directions/routing auto-enabled, skeleton,
  motion page entry.

## 6. SMTP Email Alerts

- New `backend/app/email_service.py` using **FastAPI-Mail**:
  - Gracefully disables when SMTP env vars are unset (demo/offline
    works without errors).
  - `send_alert_email()` / `format_alert_html()` — branded red HTML
    template.
- Backend fires emails (non-blocking via `asyncio.create_task`) on:
  - **Critical/high severity incidents** (`routers/incidents.py`).
  - **Critical/warning public alerts** (`routers/incidents.py` +
    `routers/alerts.py`).
- `fastapi-mail==1.4.1` added to `backend/requirements.txt`.
- `.env` commented SMTP block included — uncomment and fill:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=you@gmail.com
  SMTP_PASSWORD=your-app-password
  SMTP_FROM="Aapat Setu <no-reply@aapatsetu.app>"
  SMTP_TLS=true
  ALERT_EMAIL_TO=ops@yourdomain.com,dispatch@yourdomain.com
  ```
  For Gmail, create an App Password at https://myaccount.google.com/apppasswords.
  Outlook/Hotmail: `smtp-mail.outlook.com` port 587 STARTTLS.

## 7. Skeleton Loaders Across Dashboards

Every page that fetches data now shows a Phoenix-style shimmer skeleton
while loading:

| Page | Skeleton |
|---|---|
| AppHome / Home | ✅ HomeSkeleton (existing) |
| AgencyDashboard | ✅ DashboardSkeleton (existing) |
| MapPage | ✅ MapPageSkeleton |
| Notifications | ✅ (immediate render, content via useRelativeTime) |
| Alerts | ✅ AlertSkeleton |
| Analytics | ✅ AnalyticsSkeleton (stats + charts) |
| Tasks | ✅ TasksSkeleton |
| Admin | ✅ AdminSkeleton (stats, roles, system, incidents) |
| IncidentDetail | ✅ DetailSkeleton |
| Incidents | ✅ SkeletonTable |
| Crews | ✅ CrewsSkeleton (existing) |
| Resources | ✅ ResourcesSkeleton (existing) |
| Knowledge | ✅ static content, motion entry |

## 8. Backend Role-Scoped Task List (minimal backend change)

`routers/tasks.py` now filters by role server-side (matches UI logic):

- hospital → medical
- fire → fire / rescue / building_collapse
- police → police / accident / security / crime / missing_person
- ngo → shelter / food / water / clothing / flood / relief
- municipality → rescue / shelter / transport / water / food / storm / road
- volunteer → unclaimed tasks + their own
- responder / admin → all

## 9. How to run

1. Extract this ZIP so the folder replaces `C:\Users\Hp\Desktop\git-hub\aapat-setu\`.
2. Install the new backend dependency once (first run only):
   ```
   cd backend
   pip install -r requirements.txt
   ```
3. (Optional) Edit `backend/.env` and uncomment + fill the SMTP block to
   receive email alerts.
4. Start XAMPP (Apache + MySQL), then run `run.bat` (or `run.sh`).
5. Demo accounts: phone `9800000001` citizen, `...02/...03` volunteer,
   `...04` responder, `...05` admin, `...10` hospital, `...11` police,
   `...12` fire, `...13` NGO, `...14` municipality — all passwords `demo1234`.

## 10. Build status

`npm run build` completes cleanly (✓ built in ~1.5s) with zero warnings
or errors. All routes, maps, notifications, i18n (EN/ने), dark/light
mode, WebSocket toasts, routing, and skeletons are functional.
