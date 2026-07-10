import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom doesn't have IntersectionObserver — polyfill a stub
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom doesn't have matchMedia
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// scrollIntoView stub
if (typeof window !== 'undefined' && !window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {}
}

// Leaflet expects browser globals that jsdom partially provides — stub just enough for imports
if (typeof window !== 'undefined') {
  // These are already defined in jsdom; guard just in case.
  if (!window.L) window.L = {}
}

// Silence any console.error/warn that is just React act() noise in tests
const origError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && /act\(/.test(args[0])) return
    origError(...args)
  }
})
afterAll(() => { console.error = origError })
