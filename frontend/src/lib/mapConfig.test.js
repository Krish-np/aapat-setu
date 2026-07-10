import { describe, it, expect } from 'vitest'
import { ORS_API_KEY, ROUTING_PROFILES, NEPAL_BOUNDS, getRoute } from './mapConfig'

describe('mapConfig', () => {
  it('has routing profiles', () => {
    expect(ROUTING_PROFILES).toHaveProperty('driving')
    expect(ROUTING_PROFILES).toHaveProperty('walking')
    expect(ROUTING_PROFILES).toHaveProperty('cycling')
  })
  it('has a Nepal bounding box', () => {
    expect(NEPAL_BOUNDS.minLon).toBeLessThan(NEPAL_BOUNDS.maxLon)
    expect(NEPAL_BOUNDS.minLat).toBeLessThan(NEPAL_BOUNDS.maxLat)
    expect(NEPAL_BOUNDS.maxLat).toBeLessThan(31)
    expect(NEPAL_BOUNDS.minLat).toBeGreaterThan(25)
  })
  it('has an ORS API key (dev token for HackFusion)', () => {
    expect(typeof ORS_API_KEY).toBe('string')
    expect(ORS_API_KEY.length).toBeGreaterThan(20)
  })
})

describe('getRoute', () => {
  it('returns null gracefully when API fails (no network in test)', async () => {
    // 0,0 -> 1,1 — fetch will fail because there is no network.
    // The function catches and returns null.
    const r = await getRoute([0,0],[1,1],'driving-car')
    expect(r).toBeNull()
  })
})
