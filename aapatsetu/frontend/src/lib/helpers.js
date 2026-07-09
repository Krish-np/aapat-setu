export const PRIORITY_COLORS = { critical:'red', high:'orange', moderate:'amber', low:'green' }
export const STATUS_ORDER = ['submitted','ai_processing','verified','assigned','dispatched','en_route','on_site','rescue_ongoing','resolved']

export function timeAgo(date) {
  const d = new Date(date)
  const s = Math.floor((Date.now() - d.getTime())/1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s/60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

export function haversine(lat1,lng1,lat2,lng2) {
  const R=6371, toRad=x=>x*Math.PI/180
  const dLat=toRad(lat2-lat1), dLng=toRad(lng2-lng1)
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2
  return 2*R*Math.asin(Math.sqrt(a))
}

export function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('geolocation not supported'))
    navigator.geolocation.getCurrentPosition(p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }), reject, { timeout: 8000 })
  })
}

export const EMERGENCY_CATEGORIES = [
  { id:'fire', label:'Fire', emoji:'🔥', color:'red' },
  { id:'earthquake', label:'Earthquake', emoji:'🌋', color:'orange' },
  { id:'flood', label:'Flood', emoji:'🌊', color:'blue' },
  { id:'landslide', label:'Landslide', emoji:'⛰️', color:'amber' },
  { id:'medical', label:'Medical Emergency', emoji:'🚑', color:'pink' },
  { id:'accident', label:'Road Accident', emoji:'🚗', color:'red' },
  { id:'building_collapse', label:'Building Collapse', emoji:'🏚️', color:'slate' },
  { id:'missing_person', label:'Missing Person', emoji:'🧍', color:'purple' },
  { id:'forest_fire', label:'Forest Fire', emoji:'🌲', color:'orange' },
  { id:'storm', label:'Storm', emoji:'🌪️', color:'indigo' },
  { id:'power_failure', label:'Power Failure', emoji:'💡', color:'yellow' },
  { id:'water_issue', label:'Water Supply', emoji:'💧', color:'cyan' },
  { id:'other', label:'Other', emoji:'⚠️', color:'slate' },
]
