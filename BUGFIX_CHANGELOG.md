# Aapat Setu — Final Bug Fix Changelog

All bugs from the "Final Bug & Error Log" are fixed in this build.

## 1. 🌐 TRANSLATION / LANGUAGE SYSTEM FIXES

**Root cause discovered & fixed:**
A previous automated script had **corrupted JSX** in 8 pages. It inserted `<BackButton/>`
in the middle of Tailwind class names (e.g. `className="max-w<BackButton/>-7xl"`),
silently breaking rendering for those pages (Tasks, Alerts, Analytics, Knowledge,
MapPage, Notifications, Admin, Report). When you switched language on a page that
used these components, React crashed or half-rendered, making the toggle appear
"broken".

Also, most dashboard strings were hardcoded English and had no Nepali translation keys.

**Fixes applied:**
- All 8 corrupted BackButton injections repaired (proper JSX: `<><BackButton/><div>…</div></>`).
- Complete translation dictionary (`i18n/en.json`, `i18n/ne.json`) expanded to cover
  every dashboard string — tasks, incidents, crews, resources, alerts, analytics,
  knowledge, admin, map, report wizard, toasts, nav, common actions.
- Nepali font **Noto Sans Devanagari** loaded from Google Fonts; CSS rule
  `html[lang="ne"] body { font-family: 'Noto Sans Devanagari', … }` applies it
  automatically when language switches. `document.documentElement.lang` is synced
  via `useEffect` in `App.jsx` so CSS detects the change.
- Global CSS rule `p, span, div, li, a, label, button, td, th { overflow-wrap:
  break-word; word-break: break-word; hyphens: auto }` prevents Devanagari/long
  English strings from bleeding out of cards.
- Headings now use `line-height: 1.4`, `break-words`, and `word-break: break-word`
  specifically tuned for Nepali text (longer word forms than English).
- Sidebar nav labels now use `t(...)` keys and translate in both languages.
- Nepali heading/body font stacks swapped (Noto Sans Devanagari > Plus Jakarta Sans
  for headings when `lang="ne"`).

## 2. 🔐 ROLE-BASED ACCESS CONTROL / LOGIC FIXES

**"Report Incident" button hidden for non-citizen responders:**
- `components/Sidebar.jsx`: the "Report" nav item is now visible **ONLY** for
  citizens (it was previously shown to every role).
- `pages/AgencyDashboard.jsx`: the big "Report Incident" CTA in the header is now
  rendered only when `canReport = ['responder','admin'].includes(user.role)` —
  fire, police, municipality, hospital, ngo no longer see it. They manage incoming
  feeds only. Citizens/volunteers report via their home page CTA.

**Task boards scoped per role (no more duplicate cards):**
- **Frontend (`pages/Tasks.jsx`)** — added `ROLE_FOCUS` mapping:
  - fire → fire / forest_fire / building_collapse / rescue
  - police → accident / missing_person / crowd / security / crime
  - hospital → medical / accident / injury
  - ngo → shelter / food / water / clothing / flood / relief
  - municipality → storm / power_failure / water_issue / flood / debris / road
  - volunteer, responder, admin → see all
  - citizen → redirected away
  Also added a `busy` state lock so buttons disable while an action is in flight.
- **Backend (`backend/app/routers/tasks.py`)** — `GET /api/tasks` now scopes results
  server-side:
  - citizen → []
  - volunteer → unclaimed + their own
  - hospital/police/fire/ngo/municipality → tasks matching their task_type OR
    assignee_role OR assigned to them specifically
  - responder/admin → all tasks

**KPI Dashboard Metrics desync fixed:**
- `AgencyDashboard.jsx` now subscribes to the WebSocket via `wsConnect(...)` and
  calls `load()` on every `incident_created` / `incident_updated` / `task_updated`
  event. Stat cards (critical/active/resolved count) are refreshed live, so marking
  an incident "Resolved" from Municipality view instantly decrements the "critical
  need attention" banner and KPI tiles.

## 3. 🔔 REAL-TIME / TOAST BUG FIXES

**Toast Waterfall (infinite re-render spam):**
Two bugs combined to cause this:

1. **`WsListener` recreated the WS connection on every render** because its
   useEffect dependency was `[nav]` which changed reference constantly. Fixed: empty
   deps with `nav` already captured at stable ref, plus a `useRef(new Set())` dedupe
   cache keyed on `event:id` that suppresses duplicate toasts within a sliding
   window.
2. **`wsConnect()` created a new WebSocket for every subscriber** and never shared
   the connection. React StrictMode + re-renders opened 3–7 sockets, each firing
   the same toast. Fixed: **singleton WebSocket** in `lib/api.js` with a Set of
   listeners. Multiple components can subscribe; only one TCP connection exists.
   Reconnect logic uses exponential backoff (1s→8s cap).

**Toast styling unified:**
- Rewrote `components/toaster.jsx`:
  - Distinct color schemes for ok (emerald), err/error (red), alert/warn (amber),
    info (blue), loading (brand).
  - Color-tinted icon + 4px colored left border + matching bg tint (e.g.
    `bg-red-50/95 dark:bg-red-500/10`).
  - Success uses CheckCircle2, errors use AlertOctagon (octagon is universally
    "error/danger"), alerts use AlertTriangle, info uses Info.
  - Framer Motion `layout` prop so stacking toasts reflow smoothly when one
    dismisses.
  - Built-in duplicate suppression: the same `kind:message` within 1.5 seconds is
    dropped at the toaster layer too (belt & suspenders with WS dedupe).
  - Close button, proper aria-live region, `break-words` for long messages.

## 4. 📝 FORM HANDLING / UI FLUIDITY FIXES

**Double-submit / double-click protection on Submit to AI:**
- `pages/Report.jsx` `submit()` function now returns early if `submitting===true`
  (double-click guard at the handler level, not just at the button).
- "Next" button also disables when `submitting` so users can't skip steps mid-post.
- `pages/Tasks.jsx` all `claim()`/`update()` actions set `busy=true` and disable
  every button while the request is in flight, preventing duplicate claims.
- "Submit to AI" / "AI Processing…" strings use i18n (`report.submit_ai` /
  `report.processing`) so they translate.

**Text overflow / layout bleeding fixed:**
- Global `word-break/overflow-wrap` rules (see section 1).
- Critical banner `<p>` changed from `line-clamp-2` to `line-clamp-3` with
  `leading-relaxed break-words min-w-0 flex-1` to contain long Nepali/English
  summaries.
- All incident card descriptions (`AppHome`, `AgencyDashboard`, `Tasks`,
  `Incidents`) updated to `line-clamp-3` (gives more room), `leading-relaxed`,
  `break-words`, with null-safety (`|| '—'`) so empty summaries don't render
  "undefined".
- Badges use `flex-wrap gap-1.5` and `break-words` so they don't push out of cards.
- `min-w-0` added to flex children that contain text (the classic flex overflow
  bug) in headers, critical banners, sidebar user card.

**Bonus fixes while in there:**
- `components/AppShell.jsx` mobile drawer now uses proper React state (`mobileOpen`)
  instead of direct DOM classList hacks, closes properly when backdrop tapped,
  shows X icon when open.
- `components/Map.jsx` theme tile switching is now reactive (it re-keys the
  MapContainer on theme change so light/dark tiles swap instantly without refresh).
- `pages/Report.jsx` location-step map has loading state, recenter animation, and
  the teardrop pin styling matching the main map.
- Build succeeds: `✓ built in 1.37s` with no errors or warnings.

## Files changed (replace all of these on your Windows machine)

**Backend**
- `backend/app/routers/tasks.py` — role-scoped task listing

**Frontend**
- `frontend/src/App.jsx` — singleton WS subscription, i18n lang sync, dedupe toasts
- `frontend/src/index.css` — Noto Sans Devanagari font, global break-words, Nepali
  typography, better scrollbars
- `frontend/src/i18n/en.json` — complete English strings
- `frontend/src/i18n/ne.json` — complete Nepali strings
- `frontend/src/lib/api.js` — singleton WebSocket with listener multiplexing
- `frontend/src/components/toaster.jsx` — redesigned colored toasts w/ dedupe
- `frontend/src/components/Sidebar.jsx` — i18n nav labels, role-gated Report link
- `frontend/src/components/AppShell.jsx` — proper state-driven mobile drawer
- `frontend/src/pages/AgencyDashboard.jsx` — role-gated Report CTA, live WS refresh
  of KPIs, i18n, role-scoped sidebar cards, break-words
- `frontend/src/pages/AppHome.jsx` — break-words, i18n greeting/banner
- `frontend/src/pages/Tasks.jsx` — rewritten: role scope, busy lock, i18n, break-words
- `frontend/src/pages/Report.jsx` — double-submit guard, i18n, fixed corrupted JSX,
  disabled Next/Back during submit, theme-reactive map
- `frontend/src/pages/Admin.jsx`, `Alerts.jsx`, `Analytics.jsx`, `Knowledge.jsx`,
  `MapPage.jsx`, `Notifications.jsx` — fixed corrupted `<BackButton/>` JSX (the
  root cause of the "broken layout" symptom)

## Setup instructions (Windows, your machine)

1. Close any running terminals (Ctrl+C anything running on ports 5173/8000).
2. Delete these cached folders from your project:
   - `frontend\node_modules\.vite`
   - `frontend\dist`
   - `backend\static\assets`
3. Extract `aapatsetu_fresh.zip` into `C:\Users\Hp\Desktop\git-hub\aapat-setu\`
   (overwrite all when prompted).
4. Command Prompt:
   ```
   cd C:\Users\Hp\Desktop\git-hub\aapat-setu
   run.bat
   ```
5. Open browser → **Ctrl+Shift+R** (hard refresh).

## API key reminder

Paste your OpenRouteService key in `frontend/src/lib/mapConfig.js` line 24:
```js
export const ORS_API_KEY = ''  // <-- paste here
```
Without it the map still shows teardrop pins / dark-light tiles / POI pins /
GPS dot / loading spinner — only the blue driving route + ETA badge is disabled
(you'll see a hint banner instead).
