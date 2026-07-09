/* =============================================================
   Map configuration — here's where to add your own API keys.
   =============================================================
   OpenRouteService (HeiGIT) is the routing/directions service
   from Heidelberg University (heigit.org). It's free (fair-use)
   for non-commercial/hackathon projects.

   1. Get a free key: https://openrouteservice.org/dev/#/signup
   2. Paste it below as ORS_API_KEY = 'your-key-here'
   3. Restart the dev server / rebuild the frontend.

   If no key is set, routing silently disables and a message is
   shown ("Add ORS key to enable routing").

   You can also override at runtime by setting window.ORS_API_KEY
   before the app loads, or via env var VITE_ORS_API_KEY.
   ============================================================= */

// 👇 PASTE YOUR OPENROUTESERVICE (HEIGIT) API KEY HERE
export const ORS_API_KEY =
  (typeof window !== "undefined" && window.VITE_ORS_API_KEY) ||
  (import.meta && import.meta.env && import.meta.env.VITE_ORS_API_KEY) ||
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjlhZDA0YzY2OTM3OTQ3ZjliM2RkNjIxZGNhNDY1YjdhIiwiaCI6Im11cm11cjY0In0="; // <-- paste your key inside these quotes, e.g. '5b3...'

// OpenRouteService base URL (official HeiGIT endpoint).
export const ORS_BASE = "https://api.openrouteservice.org";

// Routing profile to use for emergency response vehicles.
// Options: 'driving-car', 'cycling-regular', 'foot-walking'
export const ROUTING_PROFILE = "driving-car";

// OpenStreetMap geocoding (Nominatim) — no key required.
export const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

/* Helper: get a driving route as GeoJSON polyline [lat,lng][]
   Usage:
     import { getRoute } from '../lib/mapConfig'
     const geo = await getRoute([[27.71,85.32],[27.72,85.33]])
   Returns null if no key or error.
*/
export async function getRoute(start, end) {
  if (!ORS_API_KEY) return null;
  try {
    // ORS expects [lng,lat]
    const body = {
      coordinates: [
        [start[1], start[0]],
        [end[1], end[0]],
      ],
      instructions: false,
      geometry_simplify: true,
    };
    const r = await fetch(
      `${ORS_BASE}/v2/directions/${ROUTING_PROFILE}/geojson`,
      {
        method: "POST",
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    if (!r.ok) return null;
    const data = await r.json();
    const feat = data.features && data.features[0];
    if (!feat) return null;
    // ORS returns coords as [lng,lat]; convert to Leaflet [lat,lng]
    const coords = feat.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    return {
      coords,
      distance_km:
        Math.round((feat.properties.segments[0].distance || 0) / 100) / 10,
      duration_min: Math.round(
        (feat.properties.segments[0].duration || 0) / 60,
      ),
    };
  } catch {
    return null;
  }
}

/* Reverse-geocode lat/lng to an address (no API key needed).
   Usage: const addr = await reverseGeocode(27.717, 85.324) */
export async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!r.ok) return null;
    const d = await r.json();
    return d.display_name || null;
  } catch {
    return null;
  }
}
