# Aapat Setu — Map Fix Instructions (MUST READ)

## I found the bug
There was a **broken `<BackButton/>` tag** inside the middle of a className string in
`frontend/src/pages/Report.jsx` that was breaking JSX (the `max-w<BackButton/>-4xl` bug).
The Report page also had its **own separate inline map** that wasn't using the new
teardrop pins or theme switching, so it still looked "old" no matter what you did to
`Map.jsx`. I've fixed BOTH.

I also removed the OLD dead files that were left over:
- frontend/src/components/IncidentMap.jsx (old circle-pin map)
- frontend/src/components/Layout.jsx (old top-bar layout, replaced by Sidebar+AppShell)
- frontend/src/pages/CitizenDashboard.jsx, ResponderDashboard.jsx, VolunteerDashboard.jsx
  (replaced by AppHome.jsx and AgencyDashboard.jsx)
- frontend/src/pages/IncidentsList.jsx, MyReports.jsx, MyTasks.jsx, ReportIncident.jsx
  (dead duplicates)

If you leave those files on disk they won't break anything (they aren't imported), but
they are confusing clutter — delete them from your project.

## How to apply the fix (Windows, your machine)

### OPTION A — download the fresh zip (RECOMMENDED, 1 minute)
1. Close any running terminals (Ctrl+C the Vite dev server and uvicorn if running).
2. Go to your project folder: `C:\Users\Hp\Desktop\git-hub\aapat-setu\`
3. Delete these folders (safe — they get regenerated):
   - `frontend\node_modules\.vite`   ← Vite's HMR cache (this is the #1 reason you see old code!)
   - `frontend\dist`
   - `backend\static\assets`
4. Extract the contents of `aapatsetu_fresh.zip` straight into your project folder,
   overwriting existing files when prompted.
5. Open Command Prompt and run:
   ```
   cd C:\Users\Hp\Desktop\git-hub\aapat-setu
   run.bat
   ```
   (or `frontend\npm install && frontend\npm run build` if you prefer)
6. Open your browser, press **Ctrl+Shift+Delete**, clear cached images/files for
   "All time", then visit http://localhost:8000 and hard-refresh with **Ctrl+Shift+R**.

### OPTION B — if you insist on copy-pasting individual files
You MUST replace ALL of these files (not just the Map one):

**Replace (overwrite) these:**
- frontend/src/components/Map.jsx
- frontend/src/components/Sidebar.jsx
- frontend/src/components/AppShell.jsx
- frontend/src/components/Navbar.jsx
- frontend/src/components/ui.jsx
- frontend/src/components/BackButton.jsx         ← new file
- frontend/src/lib/mapConfig.js
- frontend/src/pages/AppHome.jsx
- frontend/src/pages/AgencyDashboard.jsx
- frontend/src/pages/IncidentDetail.jsx
- frontend/src/pages/Incidents.jsx
- frontend/src/pages/Resources.jsx
- frontend/src/pages/Crews.jsx                 ← new file
- frontend/src/pages/Report.jsx                ← BUG FIXED + new map picker
- frontend/src/pages/MapPage.jsx
- frontend/src/pages/Alerts.jsx
- frontend/src/pages/Analytics.jsx
- frontend/src/pages/Notifications.jsx
- frontend/src/pages/Knowledge.jsx
- frontend/src/pages/Tasks.jsx
- frontend/src/pages/Admin.jsx
- frontend/src/index.css
- frontend/src/App.jsx
- backend/app/routers/resources.js
- backend/.env
- run.bat, run.sh

**DELETE these (old, unused):**
- frontend/src/components/IncidentMap.jsx
- frontend/src/components/Layout.jsx
- frontend/src/pages/CitizenDashboard.jsx
- frontend/src/pages/ResponderDashboard.jsx
- frontend/src/pages/VolunteerDashboard.jsx
- frontend/src/pages/IncidentsList.jsx
- frontend/src/pages/MyReports.jsx
- frontend/src/pages/MyTasks.jsx
- frontend/src/pages/ReportIncident.jsx

Then:
```
cd C:\Users\Hp\Desktop\git-hub\aapat-setu\frontend
rmdir /s /q node_modules\.vite
npm run build
cd ..
run.bat
```
And **Ctrl+Shift+R** in the browser.

## Where to put YOUR OpenRouteService (HeiGIT) API key
Edit: `frontend/src/lib/mapConfig.js`, line ~24:
```js
export const ORS_API_KEY = ''   // <-- paste your key between the quotes
```
Get a free key: https://openrouteservice.org/dev/#/signup

Without the key:
- The teardrop pins, dark/light tiles, POI pins, user GPS dot, recenter button,
  loading spinner ALL still work.
- The driving-route blue dashed line + "X min · Y km" ETA badge on Incident Detail
  will instead show a small banner: "Add ORS API key to enable routes".

## What you should see when it's working
1. **Left sidebar** (not top nav) with logo, sections (Overview, Response,
   Resources, Insights, Safety), theme/lang toggles, user avatar at the bottom.
2. **Teardrop/balloon-shaped pins** (like Google Maps red pins — pointed bottom,
   rounded top, drop shadow, white dot in the middle) colored by severity:
   red=critical, orange=high, amber=moderate, green=low. Critical pins have a
   pulsing ring.
3. **POI pins** are rounded squares with emoji (🏥 🚓 🚒 🤝 🏠 📦) and a little
   pointed tail.
4. **Blue pulsing dot** for your location.
5. **Dark mode** uses Carto DarkAll tiles; **light mode** uses Carto Voyager
   tiles (pale/cream).
6. **On Incident Detail**: a "Loading map…" spinner overlay while tiles load, a
   [+] crosshair recenter button top-right, and if ORS key set: blue dashed
   driving route + "X min · Y km" badge bottom-left.
7. **Report → Location step**: a proper teardrop picker pin, theme-aware tiles,
   loading spinner, and recenter on "Use my location".

If you still see the old round circle-pulse pins after this, that means your
browser is serving the old bundle. Hard-refresh (Ctrl+Shift+R) and verify the
JS file names in DevTools Network tab start with "Map-P2WPhn3W" and
"Report-x7EeS6ZJ" — if they show older names (like Map-LjVe9CEd) your build
didn't replace the assets or Vite is caching.
