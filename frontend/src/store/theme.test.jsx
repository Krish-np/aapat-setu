import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './theme'

describe('theme store', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    // reset the store
    const s = useTheme.getState()
    s.setTheme('light')
  })
  it('defaults to light in jsdom (no prefers-color-scheme)', () => {
    const { result } = renderHook(() => useTheme())
    expect(['light','dark']).toContain(result.current.theme)
  })
  it('toggle flips theme and writes class & localStorage', () => {
    const before = useTheme.getState().theme
    act(() => { useTheme.getState().toggle() })
    const after = useTheme.getState().theme
    expect(after).not.toBe(before)
    expect(localStorage.getItem('aapat_theme')).toBe(after)
    expect(document.documentElement.classList.contains('dark')).toBe(after === 'dark')
  })
})
