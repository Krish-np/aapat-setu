import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
  ScaleControl,
} from 'react-leaflet'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Spinner } from './ui'
import useRelativeTime from '../lib/useRelativeTime'
import {
  Plus,
  Minus,
  Crosshair,
  AlertTriangle,
  Flame,
  HeartPulse,
  Shield,
  HandHeart,
  Home,
  Package,
  Building2,
  MapPin,
  Route as RouteIcon,
  Clock,
  ArrowRight,
  Navigation,
  Car,
  Footprints,
  Bike,
  X,
} from 'lucide-react'
import { useTheme } from '../store/theme'
import { getRoute, ORS_API_KEY, ROUTING_PROFILES } from '../lib/mapConfig'

const PIN_COLORS = {
  critical: '#dc2626',
  high:     '#ea580c',
  moderate: '#d97706',
  low:      '#059669',
}

/* Lucide SVG path data for inline marker icons (so we don't bundle React inside markers) */
const SEVERITY_ICONS = {
  critical: '<path d="M12 2L2 21h20L12 2zm0 5v6m0 3v.01" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/>',
  high:     '<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.15.43-2.3 1-3a2.5 2.5 0 002.5 2.5z" fill="#fff"/>',
  moderate: '<path d="M12 9v4m0 4v.01M10.3 3.86L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  low:      '<path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
}

const POI_STYLES = {
  hospital:    { color: '#ec4899', iconPath: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0016.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4 3 5.5l7 7 7-7z" fill="#fff"/>' },
  police:      { color: '#2563eb', iconPath: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#fff"/>' },
  fire:        { color: '#dc2626', iconPath: '<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.15.43-2.3 1-3a2.5 2.5 0 002.5 2.5z" fill="#fff"/>' },
  ngo:         { color: '#7c3aed', iconPath: '<path d="M11 14h2a2 2 0 010 4h-2m-4-4H4l1-8a2 2 0 014 0v3m10 5l1-6a2 2 0 00-4 0l1 8c0 1.7-1.3 3-3 3H8l-4-4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' },
  shelter:     { color: '#059669', iconPath: '<path d="M3 12l9-9 9 9M5 10v10h14V10" stroke="#fff" stroke-width="2" stroke-linejoin="round" fill="none"/>' },
  supply:      { color: '#d97706', iconPath: '<path d="M16.5 9.4L7.5 4.2M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.3 7L12 12l8.7-5M12 22V12" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" fill="none"/>' },
  municipality:{ color: '#4f46e5', iconPath: '<path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18M10 6h4M10 10h4M10 14h4M3 22h18" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' },
  default:     { color: '#475569', iconPath: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" fill="#fff"/><circle cx="12" cy="10" r="3" fill="#475569"/>' },
}

/* ------- Incident teardrop ------- */
function incidentIcon(sev, critical, size = 38) {
  const color = PIN_COLORS[sev] || PIN_COLORS.low
  const icon = SEVERITY_ICONS[sev] || SEVERITY_ICONS.low
  const ring = critical ? `<span style="position:absolute;inset:-10px;border-radius:9999px;border:2px solid ${color};opacity:.5;animation:pinPulse 1.8s ease-out infinite;pointer-events:none"></span>` : ''
  const html = `
    <div class="pin-drop" style="position:relative;width:${size}px;height:${Math.round(size*1.35)}px;">
      ${ring}
      <svg viewBox="0 0 36 48" width="${size}" height="${Math.round(size*1.35)}">
        <defs><filter id="ids-${sev}${size}" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#0f172a" flood-opacity=".32"/>
        </filter></defs>
        <path filter="url(#ids-${sev}${size})"
          d="M18 1.5C8.7 1.5 1.5 8.7 1.5 18c0 11 16.5 28.5 16.5 28.5S34.5 29 34.5 18C34.5 8.7 27.3 1.5 18 1.5z"
          fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="18" cy="17" r="10" fill="rgba(255,255,255,.18)"/>
        <g transform="translate(10,9) scale(.67)">${icon}</g>
      </svg>
    </div>`
  return L.divIcon({ className:'custom-pin', html, iconSize:[size, Math.round(size*1.35)], iconAnchor:[size/2, Math.round(size*1.35)], popupAnchor:[0, -Math.round(size*1.35)-8] })
}

/* ------- POI rounded tile pin ------- */
function poiIcon(kind) {
  const s = POI_STYLES[kind] || POI_STYLES.default
  const html = `
    <div class="pin-drop" style="position:relative;width:34px;height:42px;">
      <svg viewBox="0 0 34 42" width="34" height="42">
        <defs><filter id="poi-ds" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity=".24"/></filter></defs>
        <rect x="2" y="2" width="30" height="30" rx="8" fill="${s.color}" filter="url(#poi-ds)" stroke="#fff" stroke-width="2"/>
        <g transform="translate(9,9)">${s.iconPath}</g>
        <path d="M17 30l-4 8-4-8z" fill="${s.color}"/>
      </svg>
    </div>`
  return L.divIcon({ className:'poi-pin', html, iconSize:[34,42], iconAnchor:[17,40], popupAnchor:[0,-36] })
}

/* ------- User dot ------- */
function userIcon() {
  const html = `
    <div style="position:relative;width:20px;height:20px;">
      <span style="position:absolute;inset:-14px;border-radius:9999px;background:#3b82f6;opacity:.15;animation:userHaloPulse 2s ease-out infinite"></span>
      <span style="position:absolute;inset:-4px;border-radius:9999px;background:#3b82f6;opacity:.28"></span>
      <span style="position:absolute;inset:0;border-radius:9999px;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 10px rgba(59,130,246,.5)"></span>
    </div>`
  return L.divIcon({ className:'user-pin', html, iconSize:[20,20], iconAnchor:[10,10] })
}

/* ------- Route markers ------- */
function startIcon() {
  const html = `<div style="position:relative;width:36px;height:36px;transform:translate(-50%,-100%)">
    <div style="width:36px;height:36px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 6px 16px rgba(37,99,235,.45);display:grid;place-items:center">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M5 17h14M5 17a2 2 0 01-2-2V9l2-4h12l2 4v6a2 2 0 01-2 2M5 17a2 2 0 002 2 2 2 0 002-2m8 0a2 2 0 002 2 2 2 0 002-2M7 7h10M7 11h4"/></svg>
    </div></div>`
  return L.divIcon({ className:'route-start', html, iconSize:[36,36], iconAnchor:[18,36] })
}
function endIcon() {
  const html = `<div style="position:relative;width:40px;height:54px;transform:translate(-50%,-100%)">
    <svg viewBox="0 0 40 54" width="40" height="54">
      <defs><filter id="rends" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#0f172a" flood-opacity=".3"/></filter></defs>
      <path filter="url(#rends)" d="M20 2C9.7 2 1.5 10 1.5 20c0 13 18.5 32 18.5 32S38.5 33 38.5 20C38.5 10 30.3 2 20 2z" fill="#059669" stroke="#fff" stroke-width="2"/>
      <circle cx="20" cy="19" r="10" fill="rgba(255,255,255,.2)"/>
      <circle cx="20" cy="19" r="4" fill="#fff"/>
      <circle cx="20" cy="19" r="1.7" fill="#059669"/>
    </svg></div>`
  return L.divIcon({ className:'route-end', html, iconSize:[40,54], iconAnchor:[20,54] })
}

/* ------- Map hooks ------- */
function Recenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center && !isNaN(center[0])) map.flyTo(center, zoom || map.getZoom() || 13, { duration: 0.8 })
  }, [center?.[0], center?.[1], zoom])
  return null
}
function Hook({ onReady }) {
  const map = useMap()
  useEffect(() => { onReady?.(map) }, [map, onReady])
  return null
}

function RouteLayer({ start, end, profile, onInfo }) {
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    let ok = true
    if (!start || !end || !ORS_API_KEY) { setRoute(null); return }
    setLoading(true)
    getRoute([start[0],start[1]], [end[0],end[1]], profile)
      .then(r => { if (ok) setRoute(r) })
      .catch(() => { if (ok) setRoute(null) })
      .finally(() => ok && setLoading(false))
    return () => { ok = false }
  }, [start?.[0], start?.[1], end?.[0], end?.[1], profile])
  useEffect(() => { onInfo?.(route, loading) }, [route, loading, onInfo])
  if (!route) return null
  return (
    <>
      <Polyline positions={route.coords} pathOptions={{ color:'#000', weight:9, opacity:.12, lineCap:'round', lineJoin:'round' }}/>
      <Polyline positions={route.coords} pathOptions={{ color:'#2563eb', weight:5, opacity:.95, lineCap:'round', lineJoin:'round' }}/>
      <Polyline positions={route.coords} pathOptions={{ color:'#93c5fd', weight:2, opacity:.85, lineCap:'round', lineJoin:'round', dashArray:'1 9' }}/>
      <Marker position={start} icon={startIcon()} interactive={false}/>
      <Marker position={end} icon={endIcon()} interactive={false}/>
    </>
  )
}

/* ------- Main Map component ------- */
export default function Map({
  incidents = [], pois = [], center, userLoc, height = 500, zoom = 13,
  onSelect, radiusKm, radiusCenter, selectable = false, routeTo = null,
  showRouteBadge = true, showControls = true, profile = ROUTING_PROFILES.driving,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [ready, setReady] = useState(false)
  const [map, setMap] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [showSteps, setShowSteps] = useState(false)

  const isDark = theme === 'dark'
  const defCenter = useMemo(() => (center && !isNaN(center[0]) ? center : [27.7172,85.324]), [center])
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  const inFn = useCallback(() => map?.zoomIn(), [map])
  const outFn = useCallback(() => map?.zoomOut(), [map])
  const recenter = useCallback(() => {
    if (!map) return
    if (userLoc) map.flyTo([userLoc.lat,userLoc.lng], 15, { duration:.7 })
    else if (center) map.flyTo(center, zoom, { duration:.7 })
  }, [map, userLoc, center, zoom])

  return (
    <div className="relative rounded-2xl overflow-hidden border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900"
         style={{ height, boxShadow:'0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.12)' }}>
      <MapContainer center={defCenter} zoom={zoom} zoomControl={false} attributionControl={false}
        scrollWheelZoom style={{ height:'100%', width:'100%' }}
        whenReady={() => setReady(true)} key={isDark ? 'dark' : 'light'}>
        <TileLayer url={tileUrl} attribution=''/>
        <Recenter center={center} zoom={zoom}/>
        <Hook onReady={setMap}/>
        {radiusCenter && radiusKm > 0 && (
          <Circle center={radiusCenter} radius={radiusKm*1000}
            pathOptions={{ color:'#ef4444', fillColor:'#ef4444', fillOpacity:.08, weight:2, dashArray:'5 6' }}/>
        )}
        {userLoc && (
          <Marker position={[userLoc.lat,userLoc.lng]} icon={userIcon()} zIndexOffset={1000}>
            <Popup>
              <div className="px-2 py-1">
                <div className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white text-sm">
                  <Navigation size={14} className="text-blue-500"/>You are here
                </div>
                <div className="text-[11px] text-ink-500 mt-0.5 font-mono">{userLoc.lat?.toFixed(4)}, {userLoc.lng?.toFixed(4)}</div>
              </div>
            </Popup>
          </Marker>
        )}
        {ready && pois.map(p => (
          <Marker key={`poi-${p.id}`} position={[p.lat,p.lng]} icon={poiIcon(p.kind||p.type)}>
            <Popup>
              <div className="p-2 min-w-[230px]">
                <div className="flex items-center gap-2 font-bold text-ink-900 dark:text-white">
                  <span className="inline-block w-7 h-7 rounded-lg grid place-items-center text-white text-[11px]"
                    style={{background:(POI_STYLES[p.kind||p.type]||POI_STYLES.default).color}}>
                    {(p.kind||p.type||'').slice(0,1).toUpperCase()}
                  </span>
                  <span className="truncate">{p.name}</span>
                </div>
                {p.address && <div className="text-xs text-ink-500 dark:text-ink-400 mt-1.5 leading-relaxed break-words">{p.address}</div>}
                {p.phone && <a href={`tel:${p.phone}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">📞 {p.phone}</a>}
              </div>
            </Popup>
          </Marker>
        ))}
        {ready && incidents.map(inc => {
          const sev = inc.ai_severity || inc.severity || 'low'
          const critical = sev === 'critical'
          return (
            <Marker key={inc.id} position={[inc.lat,inc.lng]} icon={incidentIcon(sev,critical,38)}
              zIndexOffset={critical ? 2000 : sev==='high' ? 1000 : 0}
              eventHandlers={selectable ? { click: () => onSelect?.(inc) } : undefined}>
              <Popup>
                <div className="p-3 min-w-[280px] max-w-[320px]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{background: PIN_COLORS[sev]||PIN_COLORS.low}}>
                        <svg viewBox="0 0 24 24" width="16" height="16"
                          dangerouslySetInnerHTML={{__html: `<g transform="translate(5,5) scale(.6)">${SEVERITY_ICONS[sev]||SEVERITY_ICONS.low}</g>`}}/>
                      </span>
                      <strong className="capitalize text-ink-900 dark:text-white text-sm truncate leading-snug">{(inc.incident_type||'').replaceAll('_',' ')}</strong>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 text-white" style={{background:PIN_COLORS[sev]||PIN_COLORS.low}}>{(sev||'').toUpperCase()}</span>
                  </div>
                  <p className="text-sm text-ink-700 dark:text-ink-300 leading-snug line-clamp-3 mb-2 break-words">{inc.ai_summary || inc.description || '—'}</p>
                  <div className="flex items-center justify-between text-[11px] text-ink-500 dark:text-ink-400 mb-3">
                    <span className="inline-flex items-center gap-1"><Clock size={11}/> <RelativeTime ts={inc.created_at}/></span>
                    <span className="capitalize px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 font-medium">{(inc.status||'').replaceAll('_',' ')}</span>
                  </div>
                  <button onClick={() => navigate(`/app/incidents/${inc.id}`)}
                    className="w-full h-9 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-1 transition">
                    View details <ArrowRight size={14}/>
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
        {userLoc && routeTo && (
          <RouteLayer start={[userLoc.lat,userLoc.lng]} end={routeTo} profile={profile}
            onInfo={(r,l)=>{setRouteInfo(r);setRouteLoading(l)}}/>
        )}
      </MapContainer>

      {/* Controls */}
      <AnimatePresence>
        {showControls && ready && (
          <motion.div initial={{ opacity:0, x:20, y:10 }} animate={{ opacity:1, x:0, y:0 }} exit={{ opacity:0, x:10 }}
            transition={{ duration:.25, delay:.1 }}
            className="absolute right-3 bottom-3 z-[400] flex flex-col gap-1.5">
            <div className="flex flex-col rounded-xl overflow-hidden bg-white/95 dark:bg-ink-900/95 backdrop-blur-xl border border-ink-200/80 dark:border-ink-700/80 shadow-lg">
              <button title="Zoom in" onClick={inFn} className="h-9 w-9 grid place-items-center hover:bg-ink-50 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-200 transition border-b border-ink-100 dark:border-ink-800"><Plus size={16}/></button>
              <button title="Zoom out" onClick={outFn} className="h-9 w-9 grid place-items-center hover:bg-ink-50 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-200 transition"><Minus size={16}/></button>
            </div>
            <button title="Recenter" onClick={recenter}
              className="h-9 w-9 grid place-items-center rounded-xl bg-white/95 dark:bg-ink-900/95 backdrop-blur-xl border border-ink-200/80 dark:border-ink-700/80 shadow-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition">
              <Crosshair size={16}/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ETA badge */}
      <AnimatePresence>
        {showRouteBadge && userLoc && routeTo && ORS_API_KEY && (routeLoading || routeInfo) && (
          <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
            className="absolute top-3 left-3 right-3 md:right-auto z-[400] max-w-md">
            <div className="bg-white/95 dark:bg-ink-900/95 backdrop-blur-xl rounded-xl px-3 py-2.5 shadow-xl border border-ink-200/80 dark:border-ink-800 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-500 text-white grid place-items-center shadow-md shadow-blue-500/30 shrink-0">
                {routeLoading ? <Spinner size={16}/> : <RouteIcon size={16}/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Fastest route · {profile==='foot-walking'?'Walking':profile==='cycling-regular'?'Cycling':'Driving'}</div>
                {routeLoading ? (
                  <div className="text-sm font-semibold text-ink-700 dark:text-ink-200">Calculating…</div>
                ) : routeInfo ? (
                  <div className="text-sm font-bold text-ink-900 dark:text-white leading-tight">
                    {routeInfo.duration_min} min <span className="text-ink-400 font-medium">·</span> {routeInfo.distance_km} km
                  </div>
                ) : null}
              </div>
              {routeInfo?.steps?.length > 0 && (
                <button onClick={() => setShowSteps(s => !s)}
                  className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 px-2 py-1 rounded-md hover:bg-brand-50 dark:hover:bg-brand-500/10 shrink-0">
                  {showSteps ? 'Hide' : 'Steps'}
                </button>
              )}
            </div>
            {showSteps && routeInfo?.steps?.length > 0 && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                className="mt-2 bg-white/95 dark:bg-ink-900/95 backdrop-blur-xl rounded-xl shadow-xl border border-ink-200/80 dark:border-ink-800 p-2 max-h-56 overflow-y-auto text-xs">
                <ol className="space-y-1.5">
                  {routeInfo.steps.slice(0,8).map((s,i) => (
                    <li key={i} className="flex items-start gap-2 text-ink-700 dark:text-ink-300 leading-snug">
                      <span className="text-[10px] font-bold w-5 h-5 rounded-full bg-ink-100 dark:bg-ink-800 grid place-items-center shrink-0 mt-0.5">{i+1}</span>
                      <span className="flex-1 break-words" dangerouslySetInnerHTML={{__html:s.instruction + (s.distance_m>20?` · <span class="text-ink-400">${s.distance_m<1000?s.distance_m+'m':(s.distance_m/1000).toFixed(1)+'km'}</span>`:'')}}/>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showRouteBadge && userLoc && routeTo && !ORS_API_KEY && (
        <div className="absolute bottom-3 left-3 z-[400] bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl px-3 py-2 shadow-md text-xs text-amber-800 dark:text-amber-300 max-w-[320px] leading-relaxed">
          Add your <b>OpenRouteService</b> API key in <code className="font-mono text-[10px]">frontend/src/lib/mapConfig.js</code> for routing.
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-0 right-0 z-[300] px-1.5 py-0.5 text-[9px] leading-tight text-ink-500 bg-white/70 dark:bg-ink-950/60 backdrop-blur-sm rounded-tl-md">
        © <a href="https://www.openstreetmap.org/copyright" className="hover:underline">OSM</a> · <a href="https://carto.com/attributions" className="hover:underline">CARTO</a> · <a href="https://openrouteservice.org/" className="hover:underline">ORS</a>
      </div>

      {/* Loading */}
      <AnimatePresence>
        {!ready && (
          <motion.div initial={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 z-[500] grid place-items-center bg-white/80 dark:bg-ink-900/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-ink-500 dark:text-ink-400">
              <Spinner size={26} className="text-brand-600"/>
              <span className="text-xs font-medium">Loading map…</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* Small helper component for relative timestamps inside popups */
function RelativeTime({ ts }) {
  const str = useRelativeTime(ts)
  return <>{str}</>
}
