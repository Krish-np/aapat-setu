import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Live relative-time hook — zero external dependencies.
 *
 * Returns a short "X ago" string for an ISO timestamp / Date / number.
 * Re-renders on a smart interval (every 1s for <1min, 30s for <1h, 60s for older)
 * so timestamps stay live without polling 60x/min forever.
 *
 * Output format intentionally compact to match the Phoenix-style UI:
 *   just now · 5s · 1m · 12m · 3h · 2d · 1mo · 1y
 *
 * When the current locale is Nepali (ne), outputs Devanagari digits.
 */

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function toDevanagari(str) {
  // 0-9 → ०-९
  return String(str).replace(/[0-9]/g, (d) =>
    String.fromCharCode(0x966 + Number(d)),
  );
}

function formatAgo(deltaMs, isNe) {
  const abs = Math.abs(deltaMs);
  let n, unit;
  if (abs < 5 * SEC) {
    n = null;
    unit = "now";
  } else if (abs < MIN) {
    n = Math.floor(abs / SEC);
    unit = "s";
  } else if (abs < HOUR) {
    n = Math.floor(abs / MIN);
    unit = "m";
  } else if (abs < DAY) {
    n = Math.floor(abs / HOUR);
    unit = "h";
  } else if (abs < MONTH) {
    n = Math.floor(abs / DAY);
    unit = "d";
  } else if (abs < YEAR) {
    n = Math.floor(abs / MONTH);
    unit = "mo";
  } else {
    n = Math.floor(abs / YEAR);
    unit = "y";
  }

  let out;
  if (unit === "now") out = isNe ? "भर्खरै" : "just now";
  else out = (isNe ? toDevanagari(n) : n) + unit;

  return deltaMs < 0
    ? isNe
      ? out + "पछि"
      : "in " + out
    : out + (isNe ? " अघि" : " ago");
}

function parseTimestamp(ts) {
  if (!ts) return null;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "number") return ts;
  const d = new Date(ts);
  const t = d.getTime();
  return Number.isFinite(t) ? t : null;
}

export default function useRelativeTime(ts) {
  const { i18n } = useTranslation();
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = parseTimestamp(ts);
    if (t == null) return undefined;
    let interval = 1000;
    const age = Date.now() - t;
    if (age > HOUR) interval = 60_000;
    else if (age > MIN) interval = 30_000;
    const id = setInterval(() => setTick((x) => x + 1), interval);
    return () => clearInterval(id);
  }, [ts]);

  const t = parseTimestamp(ts);
  if (t == null) return "";
  const isNe = (i18n.language || "en").startsWith("ne");
  return formatAgo(Date.now() - t, isNe);
}
