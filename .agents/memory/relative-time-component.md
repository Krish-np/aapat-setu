---
name: RelativeTime wrapper component
description: useRelativeTime hook cannot be called inside .map(); use RelativeTime component instead
---

## Rule
Do NOT call `useRelativeTime()` directly inside a `.map()` callback (that would violate React's rules of hooks).
Use `<RelativeTime ts={item.created_at} className="..."/>` instead.

## Why
React hooks must be called at the top level of a component, not inside loops.
The file `frontend/src/components/RelativeTime.jsx` is a tiny functional component that wraps the hook so it can be used in list renders.

## How to apply
```jsx
import RelativeTime from '../components/RelativeTime'
// inside .map():
<RelativeTime ts={inc.created_at} className="text-[11px] text-ink-400 tabular-nums" />
```
