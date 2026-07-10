import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import useRelativeTime from './useRelativeTime'

// Set up a tiny i18next instance for the hook
i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: {} }, ne: { translation: {} } },
  interpolation: { escapeValue: false },
})

function Wrapper({ children }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

describe('useRelativeTime', () => {
  afterEach(() => { vi.useRealTimers() })

  it('returns "just now" for recent timestamps in English', () => {
    const { result } = renderHook(() => useRelativeTime(Date.now()), { wrapper: Wrapper })
    expect(result.current).toMatch(/just now|ago/)
  })

  it('returns "in X" for future timestamps', () => {
    const { result } = renderHook(() => useRelativeTime(Date.now() + 5000), { wrapper: Wrapper })
    expect(result.current).toMatch(/in|पछि/)
  })

  it('returns an empty string for null/undefined', () => {
    const { result } = renderHook(() => useRelativeTime(null), { wrapper: Wrapper })
    expect(result.current).toBe('')
  })

  it('updates as time passes', () => {
    vi.useFakeTimers()
    const fixed = Date.now() - 10 * 1000 // 10s ago
    const { result } = renderHook(() => useRelativeTime(fixed), { wrapper: Wrapper })
    const v1 = result.current
    act(() => { vi.advanceTimersByTime(60_000) })
    // After 1 minute the string should be different.
    expect(result.current).not.toBe(v1)
  })
})
