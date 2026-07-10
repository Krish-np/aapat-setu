---
name: UTC timestamp parsing
description: FastAPI/SQLite backend stores UTC datetimes without timezone indicator; JS must treat them as UTC
---

## Rule
When parsing a timestamp string from the Aapat Setu API, if the string matches ISO format (`YYYY-MM-DDTHH:MM...`) and has **no** timezone suffix (no `Z`, no `+HH:MM`), append `Z` before calling `new Date()`.

## Why
`datetime.utcnow()` in Python produces UTC times, but without the `Z` suffix SQLite and FastAPI serialize them as bare ISO strings like `"2026-07-10T03:30:00"`.
JavaScript's `new Date("2026-07-10T03:30:00")` interprets this as **local time**, not UTC.
A user in Nepal (UTC+5:45) would see events as "5h 45m ago" at the moment they happen.

## How to apply
- `useRelativeTime.js` → `parseTimestamp()` function: check regex `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str) && !str.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(str)` → append `Z`
- `helpers.js` → `timeAgo()`: same guard before `new Date(raw)`
- Any new code consuming API timestamps should do the same
