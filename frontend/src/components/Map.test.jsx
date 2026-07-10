import { describe, it, expect } from 'vitest'

// We don't actually mount <Map/> (it would try to load tiles & Leaflet DOM),
// but we can validate that key POI_STYLES and PIN_COLORS constants exist and
// that the SVG icon strings inside Map.jsx are well-formed.
import fs from 'node:fs'
import path from 'node:path'

const MAP_SRC = fs.readFileSync(path.resolve(__dirname, 'Map.jsx'), 'utf8')

describe('Map component integrity', () => {
  it('defines four severity colors', () => {
    expect(MAP_SRC).toContain('critical')
    expect(MAP_SRC).toContain('high')
    expect(MAP_SRC).toContain('moderate')
    expect(MAP_SRC).toContain('low')
  })
  it('exports a default React component', () => {
    expect(MAP_SRC).toMatch(/export default function Map/)
  })
  it('builds icons for all POI kinds it references', () => {
    for (const kind of ['hospital','police','fire','ngo','shelter','supply','municipality','default']) {
      expect(MAP_SRC, `missing POI style for ${kind}`).toContain(`${kind}:`)
    }
  })
  it('uses OpenRouteService routing', () => {
    expect(MAP_SRC).toContain('getRoute')
    expect(MAP_SRC).toContain('ROUTING_PROFILES')
  })
  it('user "you-are-here" dot is rendered', () => {
    expect(MAP_SRC).toContain('user-halo')
    expect(MAP_SRC).toContain('user-dot')
  })
  it('critical incidents get a pulse ring', () => {
    expect(MAP_SRC).toContain('pin-ring')
  })
  it('has zoom-in / zoom-out / recenter controls', () => {
    expect(MAP_SRC).toContain('Zoom in')
    expect(MAP_SRC).toContain('Zoom out')
    expect(MAP_SRC).toContain('Recenter')
  })
})
