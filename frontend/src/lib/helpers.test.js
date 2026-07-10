import { describe, it, expect } from 'vitest'
import { timeAgo, haversine, PRIORITY_COLORS, STATUS_ORDER, EMERGENCY_CATEGORIES } from './helpers'

describe('timeAgo', () => {
  it('returns seconds for just-now dates', () => {
    const out = timeAgo(Date.now() - 5 * 1000)
    expect(out).toMatch(/5s ago/)
  })
  it('returns minutes', () => {
    const out = timeAgo(Date.now() - 3 * 60 * 1000)
    expect(out).toMatch(/3m ago/)
  })
  it('returns hours', () => {
    const out = timeAgo(Date.now() - 2 * 60 * 60 * 1000)
    expect(out).toMatch(/2h ago/)
  })
  it('returns days', () => {
    const out = timeAgo(Date.now() - 5 * 24 * 60 * 60 * 1000)
    expect(out).toMatch(/5d ago/)
  })
  it('handles ISO strings', () => {
    const out = timeAgo(new Date(Date.now() - 60 * 1000).toISOString())
    expect(out).toMatch(/1m ago/)
  })
})

describe('haversine', () => {
  it('returns ~0 for same point', () => {
    expect(haversine(27.7172, 85.3240, 27.7172, 85.3240)).toBeCloseTo(0, 3)
  })
  it('returns ~1.4 km between two Kathmandu points', () => {
    // Thamel (27.7151,85.3120) -> New Road (27.7034,85.3096)
    const d = haversine(27.7151, 85.3120, 27.7034, 85.3096)
    expect(d).toBeGreaterThan(1.2)
    expect(d).toBeLessThan(1.8)
  })
  it('returns non-negative for antipodal points', () => {
    const d = haversine(0, 0, 0, 180)
    expect(d).toBeGreaterThan(20000)
    expect(d).toBeLessThan(20040)
  })
})

describe('constants', () => {
  it('has 4 priority colors', () => {
    expect(Object.keys(PRIORITY_COLORS).sort()).toEqual(['critical','high','low','moderate'])
  })
  it('status order starts with submitted & ends with resolved', () => {
    expect(STATUS_ORDER[0]).toBe('submitted')
    expect(STATUS_ORDER[STATUS_ORDER.length - 1]).toBe('resolved')
  })
  it('emergency categories have unique ids and emojis', () => {
    const ids = EMERGENCY_CATEGORIES.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of EMERGENCY_CATEGORIES) {
      expect(c).toHaveProperty('label')
      expect(c).toHaveProperty('emoji')
      expect(c).toHaveProperty('color')
      expect(c.emoji.length).toBeGreaterThan(0)
    }
  })
})
