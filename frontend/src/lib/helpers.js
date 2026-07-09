export const PRIORITY_COLORS = {
  critical: '#dc2626', high: '#f59e0b', medium: '#3b82f6', low: '#10b981',
}
export const PRIORITY_LABELS = {
  critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low',
}
export const STATUS_LABELS = {
  reported: 'Reported', verified: 'Verified', assigned: 'Assigned',
  in_progress: 'In Progress', resolved: 'Resolved',
}
export const STATUS_COLORS = {
  reported: '#9ca3af', verified: '#3b82f6', assigned: '#a855f7',
  in_progress: '#f59e0b', resolved: '#10b981',
}
export const INCIDENT_TYPES = [
  'flood', 'fire', 'medical', 'accident', 'landslide',
  'earthquake', 'building collapse', 'gas leak', 'other',
]

export function timeAgo(date) {
  const d = new Date(date)
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return `${days}d ago`
}

export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error('Geolocation not supported'))
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => reject(e),
      { timeout: 8000 }
    )
  })
}
