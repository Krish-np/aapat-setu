import React, { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { priorityBadge, statusBadge } from './ui'
import { timeAgo } from '../lib/helpers'

function pinColor(priority) {
  return { critical: '#dc2626', high: '#f97316', moderate: '#f59e0b', low: '#10b981' }[priority] || '#64748b'
}

function makeIcon(priority, size = 22, pulse = false) {
  const c = pinColor(priority)
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:${c};border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.4);"></div>
      ${pulse ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:3px solid ${c};opacity:.6;animation:ping 2s cubic-bezier(0,0,.2,1) infinite;"></div>` : ''}
    </div>`,
    iconSize: [size, size], iconAnchor: [size/2, size/2], popupAnchor: [0, -size/2],
  })
}

function POIIcon({ emoji, color }) {
  return L.divIcon({
    className: 'poi-pin',
    html: `<div style="width:30px;height:30px;border-radius:8px;background:${color};color:#fff;display:grid;place-items:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,.3);border:2px solid #fff;">${emoji}</div>`,
    iconSize: [30,30], iconAnchor: [15,15],
  })
}

function Recenter({ center, zoom }) {
  const map = useMap()
  React.useEffect(() => {
    if (center) map.flyTo(center, zoom || map.getZoom() || 13, { duration: 0.7 })
  }, [center, zoom, map])
  return null
}

export default function Map({
  incidents = [], pois = [], center, userLoc, height = 500, zoom = 13,
  onSelect, radiusKm, radiusCenter, dark = false,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const defaultCenter = useMemo(() => center || [27.7172, 85.3240], [center])

  return (
    <div className="rounded-2xl overflow-hidden border border-ink-200 dark:border-ink-800" style={{ height }}>
      <style>{`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
      <MapContainer center={defaultCenter} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url={dark || document.documentElement.classList.contains('dark')
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
        />
        <Recenter center={center} zoom={zoom} />
        {radiusCenter && radiusKm && (
          <Circle center={radiusCenter} radius={radiusKm*1000} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: .1 }} />
        )}
        {userLoc && (
          <CircleMarker center={[userLoc.lat, userLoc.lng]} radius={8} pathOptions={{ color:'#3b82f6', fillColor:'#3b82f6', fillOpacity:1, weight:3 }}>
            <Popup><b>You are here</b></Popup>
          </CircleMarker>
        )}
        {pois.map(p => (
          <Marker key={`poi-${p.id}`} position={[p.lat, p.lng]} icon={POIIcon(p)}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 700 }}>{p.emoji} {p.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{p.address}</div>
                {p.phone && <div style={{ fontSize: 12, marginTop: 4 }}>📞 {p.phone}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
        {incidents.map(inc => {
          const pb = priorityBadge(inc.ai_severity || inc.severity)
          const sb = statusBadge(inc.status)
          return (
            <Marker
              key={inc.id}
              position={[inc.lat, inc.lng]}
              icon={makeIcon(inc.ai_severity || inc.severity, inc.status === 'submitted' ? 18 : 24, inc.ai_severity === 'critical')}
              eventHandlers={{ click: () => onSelect?.(inc) }}
            >
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="capitalize">{inc.incident_type?.replace('_',' ')}</strong>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-${pb.color}-100 text-${pb.color}-700`}>{pb.label}</span>
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>{inc.ai_summary || (inc.description||'').slice(0,120)}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>{sb.label} · {timeAgo(inc.created_at)}</div>
                  <button
                    onClick={() => navigate(`/app/incidents/${inc.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold border-0 cursor-pointer">
                    View Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
