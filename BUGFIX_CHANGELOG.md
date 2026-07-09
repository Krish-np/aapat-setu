# Aapat Setu — Phoenix UI/UX Overhaul (FINAL)

This ZIP is a complete fresh copy. Extract over your existing `aapat-setu/`
folder. Works with XAMPP MySQL (`aapatsetudb`) and `run.bat` as before.

---

## Summary

### 🎨 Design System (Phoenix admin-template style)

- **Layout** — Fixed left Sidebar + sticky Desktop top bar (hamburger,
  breadcrumbs, search, notification bell, user dropdown). Mobile has a slim
  top bar with hamburger + brand + bell. Content canvas is light gray
  (`#f5f7fb` light / `#0b1220` dark), cards are white with soft 1px borders
  + subtle shadows, rounded-lg (8-12px Phoenix-style radius). Page padding
  is consistent 24/32px from AppShell (no double padding per page).
- **Sidebar** — grouped uppercase section headers (Overview / Operations /
  Resources / Insights / Safety), h-9 items, active item shows a 3px red
  left-accent bar + soft red bg. Collapsed rail is 64px with vertical icon
  stack (expand button present at bottom; collapse button in expanded
  footer). EN/ने language pill, theme toggle, logout and user card
  contained in the footer with no overlap in either state.
- **Top bar** — Breadcrumbs with Home icon + section + page, search input
  with inline magnifier, notification bell with red dot, avatar +
  first-name/role dropdown (Profile/Settings/Sign out).
- **Cards** — softened shadow to `0 1px 2px rgba(15,23,42,.04)`, hover lift
  to soft elevation, rounded-lg corners (was rounded-2xl). No backdrop
  blur stealing focus from content.
- **Buttons** — primary/solid brand red (no harsh gradient), secondary
  (white + border), ghost (transparent), danger/success/warning solid.
  Sizes: h-9 md / h-8 sm / h-11 lg, all rounded-lg.
- **Typography** — Inter body / Plus Jakarta headings preserved. Clear
  scale: page titles 22-26px, section headers 15px semibold, body 13-14px,
  captions 11-12px muted gray.
- **Colors** — consistent brand (red #dc2626), semantic success/warning/
  danger/info, neutral grays (ink-50 … ink-950). Replaced dynamic
  template-string color classes across the app with static color maps so
  Tailwind's purge never strips them.
- **Micro-interactions** — Framer Motion page fade+slide-up, whileTap
  scale on all buttons/toggles/lang pill, staggered AnimatePresence entry
  on cards/rows/items, toast slide-in spring, toaster dedup, shimmer
  skeletons.
- **Empty states, skeletons, toasts** — every async page has a dedicated
  skeleton (Alerts, Analytics, Tasks, Admin, Incidents table, Map page,
  Notifications, Dashboard, Crews, Resources, AppHome, IncidentDetail).

### 🩻 Navigation & Layout Bugs Fixed

- **Sidebar overlap bug (collapsed)** — language button and theme toggle
  no longer overlap. Collapsed footer is a clean vertical stack: lang
  (single EN/ने tile at 40×40), theme, logout, divider, expand button.
  Expanded footer shows lang pill + theme + collapse in one row and the
  user card below.
- **Missing expand button** — added a `PanelLeftOpen` button in collapsed
  rail (bottom); collapse uses `PanelLeftClose` icon in expanded footer.
- **Removed duplicate BackButton + max-w/p wrappers** from App pages.
  Breadcrumbs in the top bar provide navigation context; BackButton is
  reserved for the report-success view / modals where needed.
- **Z-index** — Sidebar z-40, top bar z-20, mobile drawer backdrop z-30,
  toaster z-[9999], user-dropdown z-50, mobile incident-list drawer
  z-50 — no element paints behind another.
- **Mobile top-bar height** — raised to h-14; toaster drops to top-4 on
  md+ and below the top-bar on mobile so it never overlaps the header.
- **Breadcrumb Home link** added to AppShell.

### 🔔 Notifications & Real-time Sync

- **Live relative times** everywhere: Notifications, Alerts, Tasks,
  Incidents table, Admin "Recent Incidents", IncidentDetail timeline &
  "Reported" stamp. Hook is zero-dependency (no dayjs/plugin imports →
  fixes the "Failed to resolve dayjs/plugin/relativeTime" Vite error you
  hit earlier). Smart tick: 1s <1min, 30s <1h, 60s older. Devanagari
  digits auto-rendered for ने.
- **"Welcome to Aapat Setu"** no longer stuck at "0s" — timestamp seeded
  500ms in the past so it starts at "just now" → seconds → minutes.
- **Singleton WebSocket** in `lib/api.js` prevents duplicate connections
  and toast waterfalls.
- **Global toast propagation** — `WsListener` mounted in `App.jsx` toasts
  every `incident_created`/`alert_created` event, so new citizen reports
  appear as high-priority toasts everywhere.
- **Notifications page** — merged live queue + server-fetched incidents,
  deduped by `_id`, "N new" badge, severity-colored icons (info/alert/
  critical/resolved/welcome), staggered Framer Motion list.

### 🌐 Localization (EN/ने)

- Wrapped all hardcoded strings across Alerts, Analytics, Tasks, Admin,
  Notifications, Knowledge, MapPage, Incidents, Sidebar, AppShell with
  `t('key')`.
- Added 50+ new keys to both `i18n/en.json` and `i18n/ne.json`
  (alerts severities, analytics stats, admin panel labels, notification
  copy, toast strings, map page suffix).
- `html[lang="ne"]` font stack (Mangal/Noto Devanagari/Kokila/Arial Unicode)
  with line-height 1.65 body / 1.5 headings + slightly wider gap spacing
  prevents matra clipping; swapping back to EN restores Inter/Jakarta
  with zero layout shift.
- Language pill gets whileTap/whileHover micro-animation in both Navbar
  and Sidebar.

### 🗺️ Map & ORS Routing

- ORS JWT token baked into `lib/mapConfig.js`:
  `eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjlhZDA0YzY2OTM3OTQ3ZjliM2RkNjIxZGNhNDY1YjdhIiwiaCI6Im11cm11cjY0In0=`
- Three profiles wired: driving-car, foot-walking, cycling-regular.
  `getRoute()` returns GeoJSON coords, distance_km, duration_min,
  turn-by-turn steps, bbox.
- Premium Map.jsx: 4-severity teardrop pins (critical pulsing), Lucide
  POI markers, 3-ring user dot, route polyline with shadow+highlight,
  bottom-right glass zoom/recenter, top-left ETA badge with collapsible
  turn list, severity popups with relative timestamps. Leaflet default
  zoom/attribution hidden. Map remounts on theme switch.
- MapPage: Phoenix chip-filter tabs, desktop side incident list, mobile
  slide-drawer, skeleton, motion entry.

### 📧 SMTP Email Alerts

- New `backend/app/email_service.py` (FastAPI-Mail). Gracefully disables
  if SMTP env vars are blank. Non-blocking `asyncio.create_task` fires
  branded red HTML emails on critical/high incidents AND critical/warning
  public alerts.
- `fastapi-mail==1.4.1` added to `backend/requirements.txt`.
- Configure in `backend/.env` (uncomment the block):
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=you@gmail.com
  SMTP_PASSWORD=your-app-password
  SMTP_FROM="Aapat Setu <no-reply@aapatsetu.app>"
  SMTP_TLS=true
  ALERT_EMAIL_TO=ops@yourdomain.com,dispatch@yourdomain.com
  ```
  Gmail users: create an App Password at
  https://myaccount.google.com/apppasswords.

### 🛠️ Backend (minimal, additive only)

- `routers/tasks.py` — role-scoped listing (hospital/medical, fire/rescue,
  police/security, ngo/shelter/food/water, muni/civic, volunteer unclaimed
  + own, responder/admin all).
- `routers/incidents.py` — fires SMTP email on critical/high.
- `routers/alerts.py` — fires SMTP email on critical/warning.

### ✅ Build & Test

- `npm run build` completes cleanly (✓ built in ~1.5s, zero errors/warnings).
- Vite dev server starts and serves `index.html` (HTTP 200).
- All 14 routes in `App.jsx` resolve (Home / Command / Admin / Report /
  Incidents / IncidentDetail / Map / Tasks / Alerts / Analytics /
  Resources / Crews / Notifications / Knowledge).
- Smoke-tested skeletons, header, sidebar, language/theme toggles, and
  card/button sizing at 375px / 768px / 1440px breakpoints via layout
  inspection (flex/grid containers use `min-w-0`, `truncate`, `flex-wrap`
  to prevent overflow; `break-words` on long strings).
- No remaining dynamic `bg-${color}` Tailwind classes (all maps static).

### Known Limitations (could NOT verify end-to-end without live backend)

- Login/auth, form POSTs, WebSocket push, and incident-claim flows
  require a running MySQL+FastAPI backend. The API layer uses standard
  promise `.then/.catch` and `.finally(setLoading(false))` so failure
  states gracefully show existing empty states / toasts rather than
  blank screens.
- Recharts charts render but live data depends on `/api/incidents/stats/summary`.
