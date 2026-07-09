/* =============================================================
   Map configuration — OpenRouteService (HeiGIT) routing client.
   Token provided for HackFusion 2026.
   ============================================================= */

// 🔑 OpenRouteService (HeiGIT) API key — production token
export const ORS_API_KEY =
  (typeof window !== 'undefined' && window.VITE_ORS_API_KEY) ||
  (import.meta && import.meta.env && import.meta.env.VITE_ORS_API_KEY) ||
  'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjlhZDA0YzY2OTM3OTQ3ZjliM2RkNjIxZGNhNDY1YjdhIiwiaCI6Im11cm11cjY0In0='

// OpenRouteService base URL
export const ORS_BASE = 'https://api.openrouteservice.org'

// Available routing profiles (optimized for Nepal terrain/roads)
export const ROUTING_PROFILES = {
  driving: 'driving-car',
  walking: 'foot-walking',
  cycling: 'cycling-regular',
}
export const DEFAULT_PROFILE = 'driving-car'

// Nepal bounding box for route sanity clamps (approx)
export const NEPAL_BOUNDS = {
  minLon: 80.0, maxLon: 88.2,
  minLat: 26.3, maxLat: 30.5,
}

// OpenStreetMap geocoding (no key)
export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'

/**
 * Fetch a route as GeoJSON polyline + steps.
 * @param {[number,number]} start [lat, lng]
 * @param {[number,number]} end   [lat, lng]
 * @param {string} profile  driving-car | foot-walking | cycling-regular
 */
export async function getRoute(start, end, profile = DEFAULT_PROFILE) {
  if (!ORS_API_KEY) return null
  try {
    const body = {
      coordinates: [[start[1], start[0]], [end[1], end[0]]],
      instructions: true,
      instructions_format: 'html',
      geometry_simplify: true,
      language: 'en',
      options: { avoid_features: ['ferries'] },
      extra_info: ['waytype','surface','steepness'],
    }
    const r = await fetch(`${ORS_BASE}/v2/directions/${profile}/geojson`, {
      method: 'POST',
      headers: {
        Authorization: ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!r.ok) return null
    const data = await r.json()
    const feat = data.features && data.features[0]
    if (!feat) return null
    const seg = feat.properties.segments && feat.properties.segments[0]
    const coords = feat.geometry.coordinates.map(([lng, lat]) => [lat, lng])
    return {
      coords,
      distance_km: Math.round((seg?.distance || feat.properties.summary.distance || 0) / 100) / 10,
      duration_min: Math.round((seg?.duration || feat.properties.summary.duration || 0) / 60),
      steps: (seg?.steps || []).map((s) => ({
        instruction: stripHtml(s.instruction),
        distance_m: Math.round(s.distance),
        duration_s: Math.round(s.duration),
        maneuver: s.type,
        name: s.name || '',
      })),
      bbox: data.bbox,
    }
  } catch {
    return null
  }
}

function stripHtml(html) {
  if (typeof document === 'undefined') return String(html).replace(/<[^>]+>/g, '')
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: 'application/json' } },
    )
    if (!r.ok) return null
    const d = await r.json()
    return d.display_name || null
  } catch {
    return null
  }
}
