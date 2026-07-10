import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Live relative-time hook — zero external dependencies.
 *
 * Returns a short "X ago" string for an ISO timestamp / Date / number.
 * Uses a SINGLE global interval (via subscribe/notify pattern) so even
 * if 50 notifications mount on screen, there's only one timer running.
 *
 * Ticking auto-scales:
 *   -   0–60s  : tick every 1s
 *   -   1–60m  : tick every 30s
 *   -   1–24h  : tick every 60s
 *   -   >24h   : tick every 10 minutes
 *
 * When the current locale is Nepali (ne), outputs Devanagari digits + Nepali unit words.
 *
 * IMPORTANT: Backend timestamps are stored as UTC without timezone indicator.
 * parseTimestamp adds 'Z' to bare ISO strings so JS doesn't misinterpret them
 * as local time — otherwise Nepal users (UTC+5:45) would see all times as
 * "5 hours ago" the moment they happen.
 */

const SEC = 1000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY  = 24 * HOUR

function toDevanagari(str) {
  return String(str).replace(/[0-9]/g, (d) => String.fromCharCode(0x966 + Number(d)))
}

// Nepali unit words (singular — no need for plural in Nepali grammar for this use)
const NE_UNITS = {
  s:  'सेकेन्ड',
  m:  'मिनेट',
  h:  'घण्टा',
  d:  'दिन',
  w:  'हप्ता',
  mo: 'महिना',
  y:  'वर्ष',
}

function formatAgo(deltaMs, isNe) {
  const abs = Math.abs(deltaMs)
  let n, unit
  if      (abs < 5 * SEC)  { n = null; unit = 'now' }
  else if (abs < MIN)      { n = Math.floor(abs / SEC);        unit = 's' }
  else if (abs < HOUR)     { n = Math.floor(abs / MIN);        unit = 'm' }
  else if (abs < DAY)      { n = Math.floor(abs / HOUR);       unit = 'h' }
  else if (abs < 7*DAY)    { n = Math.floor(abs / DAY);        unit = 'd' }
  else if (abs < 30*DAY)   { n = Math.floor(abs / (7 * DAY));  unit = 'w' }
  else if (abs < 365*DAY)  { n = Math.floor(abs / (30 * DAY)); unit = 'mo' }
  else                     { n = Math.floor(abs / (365 * DAY)); unit = 'y' }

  if (isNe) {
    if (unit === 'now') return 'भर्खरै'
    const neUnit = NE_UNITS[unit] || unit
    const neN    = toDevanagari(n)
    return deltaMs < 0
      ? neN + ' ' + neUnit + ' पछि'
      : neN + ' ' + neUnit + ' अघि'
  }

  // English
  if (unit === 'now') return 'just now'
  const out = n + unit
  return deltaMs < 0 ? 'in ' + out : out + ' ago'
}

/**
 * Parse a timestamp value to epoch ms.
 *
 * Key fix: if the string is an ISO datetime with NO timezone indicator
 * (e.g. "2026-07-10T03:30:00"), append 'Z' so JavaScript treats it as
 * UTC instead of local time.  The FastAPI/SQLite backend stores all
 * datetimes in UTC without the 'Z' suffix, which would otherwise make
 * JS interpret them as local time — causing large "time ago" errors for
 * users in any timezone other than UTC.
 */
function parseTimestamp(ts) {
  if (ts == null) return null
  if (ts instanceof Date) return ts.getTime()
  if (typeof ts === 'number') return ts
  let str = ts
  if (
    typeof str === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str) &&
    !str.endsWith('Z') &&
    !/[+-]\d{2}:\d{2}$/.test(str)
  ) {
    str = str + 'Z'
  }
  const d = new Date(str)
  const t = d.getTime()
  return Number.isFinite(t) ? t : null
}

/* ------- global tick bus (single interval for whole app) ------- */
const _listeners = new Set()
let _intervalId = null
let _intervalMs = 1000

function tickInterval(ts) {
  if (ts == null) return 1000
  const age = Math.abs(Date.now() - ts)
  if (age < MIN)  return 1000
  if (age < HOUR) return 30_000
  if (age < DAY)  return 60_000
  return 10 * 60_000
}

function ensureClock() {
  if (_intervalId) return
  const beat = () => {
    for (const l of _listeners) {
      try { l() } catch { /* ignore listener errors */ }
    }
  }
  _intervalId = setInterval(beat, _intervalMs)
  // Re-evaluate fastest needed interval every 15s so when all mounted
  // timestamps are old we slow the clock down automatically.
  setInterval(() => {
    let fastest = 60_000
    for (const l of _listeners) {
      const iv = tickInterval(l.ts)
      if (iv < fastest) fastest = iv
    }
    if (fastest !== _intervalMs) {
      clearInterval(_intervalId)
      _intervalMs = fastest
      _intervalId = setInterval(beat, _intervalMs)
    }
  }, 15_000)
}

function subscribe(fn) {
  _listeners.add(fn)
  ensureClock()
  return () => {
    _listeners.delete(fn)
    if (_listeners.size === 0 && _intervalId) {
      clearInterval(_intervalId)
      _intervalId = null
    }
  }
}

/* ------- the hook ------- */
export default function useRelativeTime(ts) {
  const { i18n } = useTranslation()
  const [, setTick] = useState(0)

  const parsedTs = parseTimestamp(ts)

  useEffect(() => {
    if (parsedTs == null) return undefined
    const listener = () => setTick(x => (x + 1) % 1_000_000)
    listener.ts = parsedTs
    // Immediately show correct value on mount / ts change
    setTick(x => (x + 1) % 1_000_000)
    return subscribe(listener)
  }, [parsedTs])

  if (parsedTs == null) return ''
  const isNe = (i18n.language || 'en').startsWith('ne')
  return formatAgo(Date.now() - parsedTs, isNe)
}
