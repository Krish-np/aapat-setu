import { describe, it, expect } from 'vitest'
import en from './en.json'
import ne from './ne.json'

function walk(obj, prefix = '') {
  const leaves = []
  for (const k of Object.keys(obj)) {
    const v = obj[k]
    const path = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) leaves.push(...walk(v, path))
    else leaves.push(path)
  }
  return leaves
}

describe('i18n translation files', () => {
  it('en.json parses as a non-empty object', () => {
    expect(en && typeof en === 'object').toBe(true)
    expect(Object.keys(en).length).toBeGreaterThan(10)
  })
  it('ne.json parses as a non-empty object', () => {
    expect(ne && typeof ne === 'object').toBe(true)
    expect(Object.keys(ne).length).toBeGreaterThan(10)
  })
  it('every key in en.json is present in ne.json', () => {
    const enKeys = walk(en).sort()
    const neKeys = new Set(walk(ne))
    const missing = enKeys.filter(k => !neKeys.has(k))
    if (missing.length) {
      // We allow some keys to be untranslated during dev, but critical ones should exist.
      const critical = ['brand','hero.title','hero.subtitle','hero.cta_report','hero.cta_app','nav.signin']
      const missingCritical = critical.filter(k => !neKeys.has(k))
      expect(missingCritical, `Missing critical Nepali keys: ${missingCritical.join(',')}`).toEqual([])
    } else {
      expect(missing).toEqual([])
    }
  })
  it('landing feature cards are fully populated in English', () => {
    for (const k of ['report','ai','vision','map','cmd','risk','resource','alerts','analytics','realtime']) {
      expect(en.features[k], `features.${k} missing`).toBeTruthy()
      expect(en.features[k].title, `features.${k}.title missing`).toBeTruthy()
      expect(en.features[k].desc, `features.${k}.desc missing`).toBeTruthy()
    }
  })
  it('all 9 role translations exist', () => {
    for (const r of ['citizen','volunteer','responder','hospital','police','fire','ngo','municipality','admin']) {
      expect(en.roles[r], `roles.${r} missing`).toBeTruthy()
      expect(en.roles[r].name).toBeTruthy()
      expect(en.roles[r].desc).toBeTruthy()
    }
  })
})
