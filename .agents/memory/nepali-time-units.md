---
name: Nepali relative time units
description: Nepali locale needs full unit words, not English abbreviations, in useRelativeTime
---

## Rule
In Nepali (`isNe = true`), format relative time as `{devanagari_digits} {nepali_unit} अघि/पछि`.

## Why
The original code produced `"५m अघि"` — the `m` is the English abbreviation, which is incorrect.
Correct output: `"५ मिनेट अघि"`.

## Nepali unit map (in useRelativeTime.js)
```js
const NE_UNITS = {
  s:  'सेकेन्ड',
  m:  'मिनेट',
  h:  'घण्टा',
  d:  'दिन',
  w:  'हप्ता',
  mo: 'महिना',
  y:  'वर्ष',
}
```
"just now" → `'भर्खरै'`
Future: `n unit पछि`; Past: `n unit अघि`
