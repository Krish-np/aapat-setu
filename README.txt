================================================================
  REAL-TIME NOTIFICATION TIMES — FIX
================================================================

Only ONE production file changed:
  frontend/src/lib/useRelativeTime.js

This is the hook used by every "X ago" label in the app:
  • /app/notifications (the page you reported)
  • incident list rows
  • incident detail timeline
  • tasks, alerts, admin lists
  • map popup timestamps

After the fix, each timestamp ticks live automatically:
  "just now" → "1s ago" → "2s ago" → … → "59s ago" → "1m ago" → "2m ago" …
No page refresh or navigation needed.

Install
-------
1. Stop the server (Ctrl+C in run.bat).
2. Extract this ZIP and drop the "frontend" folder into
   C:\Users\Hp\Desktop\git-hub\aapatsetu\ → click REPLACE.
3. Clear stale build cache (critical — prevents blank pages):
       cd /d C:\Users\Hp\Desktop\git-hub\aapatsetu
       rmdir /s /q backend\static
       rmdir /s /q frontend\node_modules\.vite
4. run.bat → wait for "✓ built in Xs".
5. Open http://localhost:8000/app/notifications and Ctrl+Shift+R.

Wait a few seconds and you'll see the times crawl in real time.
================================================================
