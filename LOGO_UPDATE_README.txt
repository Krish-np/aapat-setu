================================================================
  AAPAT SETU — LOGO + FAVICON UPDATE
================================================================

What's included
---------------
Web frontend (already in the workspace under aapatsetu/):
  - frontend/public/favicon-16x16.png
  - frontend/public/favicon-32x32.png
  - frontend/public/apple-touch-icon.png
  - frontend/public/android-chrome-192x192.png
  - frontend/public/android-chrome-512x512.png
  - frontend/public/site.webmanifest       (NEW — PWA manifest)
  - frontend/src/assets/logo.png           (NEW — 192px logo used in navbars)
  - frontend/index.html                    (link tags updated)
  - frontend/src/components/Navbar.jsx     (public landing navbar uses logo)
  - frontend/src/components/Sidebar.jsx    (authed sidebar uses logo)
  - frontend/src/pages/Auth.jsx            (login/register hero uses logo)
  - frontend/src/pages/Landing.jsx         (footer + brand uses logo)

Mobile app (in aapatsetu-mobile/):
  - src/assets/icon.png       (app icon, 192)
  - src/assets/splash.png     (splash screen, 512)
  - src/assets/adaptive-icon.png (Android adaptive)
  - src/assets/favicon.png    (web favicon)
  - LandingScreen, AuthScreen, Header all use the real logo.

Install for the WEB app
-----------------------
1. Stop run.bat (Ctrl+C).
2. Copy the files in this patch over into
     C:\Users\Hp\Desktop\git-hub\aapatsetu\
   (merge/overwrite when prompted — the only new files are
   logo.png, site.webmanifest, and the favicon PNGs).
3. Clear stale build cache (CRITICAL — prevents blank page):
       cd /d C:\Users\Hp\Desktop\git-hub\aapatsetu
       rmdir /s /q backend\static
       rmdir /s /q frontend\node_modules\.vite
4. run.bat → wait for "✓ built in Xs".
5. Hard refresh in the browser: Ctrl+Shift+R.
   - Tab title will now say "Aapat Setu — Nepal Emergency Coordination".
   - Browser tab shows the real red logo favicon.
   - Public landing navbar, login page, authed sidebar, footer all show the
     real Aapat Setu logo mark instead of the placeholder Shield icon.
   - PWA manifest + apple-touch-icon + 192/512 PNGs are in place for
     "Add to home screen" on Android/iOS. The browser theme color is set to
     the emergency red #dc2626.

Install for the MOBILE app
--------------------------
The mobile app is a new Expo project at aapatsetu-mobile/.
See aapatsetu-mobile/README.md for full instructions.
Quick start:
    cd aapatsetu-mobile
    npm install
    npm start                 # scan QR with Expo Go, or:
    npm run android           # Android emulator (backend must be running on 10.0.2.2:8000)

================================================================
