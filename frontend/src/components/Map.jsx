import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Spinner } from "./ui";
import { timeAgo } from "../lib/helpers";
import {
  Navigation,
  Crosshair,
  Plus,
  Minus,
  AlertTriangle,
  Flame,
  Car,
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
} from "lucide-react";
import { useTheme } from "../store/theme";
import { getRoute, ORS_API_KEY } from "../lib/mapConfig";

/* ------------------------------------------------------------------
   PIN COLORS & ICONS — severity-coded teardrops with lucide SVGs inside
-------------------------------------------------------------------*/
const PIN_COLORS = {
  critical: "#dc2626",
  high: "#ea580c",
  moderate: "#d97706",
  low: "#059669",
};

// SVG icons inside the teardrop bubble (small, 14x14 area)
const SEVERITY_ICON_SVG = {
  critical:
    '<path d="M12 2L2 21h20L12 2zm0 6v6m0 2v.01" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>',
  high: '<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" fill="#fff"/>',
  moderate:
    '<path d="M12 9v4m0 4v.01M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  low: '<path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
};

/* ------------------------------------------------------------------
   POI config — use small inline SVG pins (lucide-style) not emoji.
   Each is a rounded-square marker with a pointed tail and a color-coded icon.
-------------------------------------------------------------------*/
const POI_STYLES = {
  hospital: { color: "#ec4899", bg: "#fdf2f8", icon: HeartPulse },
  police: { color: "#2563eb", bg: "#eff6ff", icon: Shield },
  fire: { color: "#dc2626", bg: "#fef2f2", icon: Flame },
  ngo: { color: "#7c3aed", bg: "#f5f3ff", icon: HandHeart },
  shelter: { color: "#059669", bg: "#ecfdf5", icon: Home },
  supply: { color: "#d97706", bg: "#fffbeb", icon: Package },
  municipality: { color: "#4f46e5", bg: "#eef2ff", icon: Building2 },
  default: { color: "#475569", bg: "#f1f5f9", icon: MapPin },
};

/* ------------------------------------------------------------------
   INCIDENT TEARDROP PIN
   - Google-Maps style: round top, tapered point, inner icon, drop shadow
-------------------------------------------------------------------*/
function makeIncidentIcon(severity, isCritical = false, size = 36) {
  const color = PIN_COLORS[severity] || PIN_COLORS.low;
  const icon = SEVERITY_ICON_SVG[severity] || SEVERITY_ICON_SVG.low;
  const ring = isCritical
    ? `<span style="position:absolute;inset:-10px;border-radius:9999px;border:2px solid ${color};opacity:.55;animation:pinPulse 1.8s ease-out infinite;pointer-events:none"></span>`
    : "";
  const html = `
    <div class="pin-drop" style="position:relative;width:${size}px;height:${Math.round(size * 1.35)}px;">
      ${ring}
      <svg viewBox="0 0 36 48" width="${size}" height="${Math.round(size * 1.35)}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="ds-${severity}${size}" x="-40%" y="-40%" width="180%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.32"/>
          </filter>
        </defs>
        <path filter="url(#ds-${severity}${size})"
          d="M18 1.5C8.7 1.5 1.5 8.7 1.5 18c0 11 16.5 28.5 16.5 28.5S34.5 29 34.5 18C34.5 8.7 27.3 1.5 18 1.5z"
          fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="18" cy="17" r="10" fill="rgba(255,255,255,0.2)"/>
        <g transform="translate(10,9) scale(0.65)">${icon}</g>
      </svg>
    </div>`;
  return L.divIcon({
    className: "custom-pin",
    html,
    iconSize: [size, Math.round(size * 1.35)],
    iconAnchor: [size / 2, Math.round(size * 1.35)],
    popupAnchor: [0, -Math.round(size * 1.35) - 6],
  });
}

/* ------------------------------------------------------------------
   POI PIN — rounded tile with icon, small pointed tail
-------------------------------------------------------------------*/
function makePOIIcon(kind) {
  const s = POI_STYLES[kind] || POI_STYLES.default;
  // Map lucide icon name → inline SVG path (kept small; hand-picked to avoid bundling all icons in marker HTML)
  const iconMap = {
    HeartPulse:
      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.29 1.51 4.04 3 5.5l7 7 7-7z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    Shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    Flame:
      '<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>',
    HandHeart:
      '<path d="M11 14h2a2 2 0 010 4h-2m-4-4H4l1-8a2 2 0 014 0v3m10 5l1-6a2 2 0 00-4 0l1 8c0 1.7-1.3 3-3 3H8l-4-4"/>',
    Home: '<path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0v-6h6v6"/>',
    Package:
      '<path d="M16.5 9.4L7.5 4.2M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.3 7L12 12l8.7-5M12 22V12"/>',
    Building2:
      '<path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18M6 22h12M10 6h4M10 10h4M10 14h4M10 18h4M3 22h18"/>',
    MapPin:
      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/>',
  };
  const IconName = (s.icon || MapPin).name || "MapPin";
  const path = iconMap[IconName] || iconMap.MapPin;

  const html = `
    <div class="pin-drop" style="position:relative;width:34px;height:42px;">
      <svg viewBox="0 0 34 42" width="34" height="42" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="poi-ds" x="-40%" y="-40%" width="180%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.25"/>
          </filter>
        </defs>
        <rect x="2" y="2" width="30" height="30" rx="8" fill="${s.color}" filter="url(#poi-ds)" stroke="#fff" stroke-width="2"/>
        <g transform="translate(9,9)" fill="#fff">
          <svg viewBox="0 0 24 24" width="16" height="16">${path}</svg>
        </g>
        <path d="M17 30l-4 8-4-8z" fill="${s.color}"/>
      </svg>
    </div>`;
  return L.divIcon({
    className: "poi-pin",
    html,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36],
  });
}

/* ------------------------------------------------------------------
   USER LOCATION PIN — pulsing blue dot with accuracy halo
-------------------------------------------------------------------*/
function makeUserIcon() {
  const html = `
    <div class="user-dot" style="position:relative;width:18px;height:18px;">
      <span style="position:absolute;inset:-10px;border-radius:9999px;background:#3b82f6;opacity:.15;animation:userHaloPulse 2s ease-out infinite"></span>
      <span style="position:absolute;inset:-3px;border-radius:9999px;background:#3b82f6;opacity:.28"></span>
      <span style="position:absolute;inset:0;border-radius:9999px;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,.5)"></span>
    </div>`;
  return L.divIcon({
    className: "user-pin",
    html,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

/* ------------------------------------------------------------------
   ROUTE START (car/icon) & END (target pin) markers
-------------------------------------------------------------------*/
function makeRouteStartIcon() {
  const html = `
    <div style="position:relative;width:36px;height:36px;transform:translate(-50%,-100%)">
      <div style="width:36px;height:36px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 4px 12px rgba(59,130,246,.45);display:grid;place-items:center;">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M5 17h14M5 17a2 2 0 01-2-2V9l2-4h12l2 4v6a2 2 0 01-2 2M5 17a2 2 0 002 2 2 2 0 002-2m8 0a2 2 0 002 2 2 2 0 002-2M7 7h10M7 11h4"/></svg>
      </div>
    </div>`;
  return L.divIcon({
    className: "route-start",
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}
function makeRouteEndIcon() {
  const html = `
    <div style="position:relative;width:38px;height:50px;transform:translate(-50%,-100%)">
      <svg viewBox="0 0 38 50" width="38" height="50">
        <defs><filter id="rds" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity=".3"/></filter></defs>
        <path filter="url(#rds)" d="M19 1C9.5 1 2 8.5 2 18c0 12 17 30 17 30s17-18 17-30C36 8.5 28.5 1 19 1z" fill="#059669" stroke="#fff" stroke-width="2"/>
        <circle cx="19" cy="17" r="8" fill="rgba(255,255,255,.25)"/>
        <g transform="translate(11,10)" fill="#fff"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="#059669"/><circle cx="12" cy="10" r="1.5" fill="#fff"/></svg></g>
      </svg>
    </div>`;
  return L.divIcon({
    className: "route-end",
    html,
    iconSize: [38, 50],
    iconAnchor: [19, 50],
  });
}

/* ------------------------------------------------------------------
   Map hooks
-------------------------------------------------------------------*/
function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (
      center &&
      Array.isArray(center) &&
      !isNaN(center[0]) &&
      !isNaN(center[1])
    ) {
      map.flyTo(center, zoom || map.getZoom() || 13, {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [center && center[0], center && center[1], zoom]);
  return null;
}

function MapController({ onReady }) {
  const map = useMap();
  useEffect(() => {
    onReady?.(map);
  }, [map, onReady]);
  return null;
}

function RouteLayer({ start, end, onInfo }) {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!start || !end || !ORS_API_KEY) {
      setRoute(null);
      return;
    }
    setLoading(true);
    getRoute([start[0], start[1]], [end[0], end[1]])
      .then((r) => {
        if (active) setRoute(r);
      })
      .catch(() => {
        if (active) setRoute(null);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [start?.[0], start?.[1], end?.[0], end?.[1]]);

  useEffect(() => {
    onInfo?.(route, loading);
  }, [route, loading, onInfo]);
  if (!route) return null;
  return (
    <>
      {/* Shadow */}
      <Polyline
        positions={route.coords}
        pathOptions={{
          color: "#000",
          weight: 8,
          opacity: 0.12,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      {/* Main route */}
      <Polyline
        positions={route.coords}
        pathOptions={{
          color: "#2563eb",
          weight: 5,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      {/* Highlight */}
      <Polyline
        positions={route.coords}
        pathOptions={{
          color: "#93c5fd",
          weight: 2,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
          dashArray: "1 8",
        }}
      />
      {/* Start marker (user position) */}
      <Marker
        position={start}
        icon={makeRouteStartIcon()}
        interactive={false}
      />
      {/* End marker */}
      <Marker position={end} icon={makeRouteEndIcon()} interactive={false} />
    </>
  );
}

/* ------------------------------------------------------------------
   Main Map component
-------------------------------------------------------------------*/
export default function Map({
  incidents = [],
  pois = [],
  center,
  userLoc,
  height = 500,
  zoom = 13,
  onSelect,
  radiusKm,
  radiusCenter,
  selectable = false,
  routeTo = null,
  showRouteBadge = true,
  showControls = true,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [mapReady, setMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const isDark = theme === "dark";
  const defaultCenter = useMemo(
    () => (center && !isNaN(center[0]) ? center : [27.7172, 85.324]),
    [center],
  );
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const zoomIn = useCallback(() => mapInstance?.zoomIn(), [mapInstance]);
  const zoomOut = useCallback(() => mapInstance?.zoomOut(), [mapInstance]);
  const recenter = useCallback(() => {
    if (!mapInstance) return;
    if (userLoc)
      mapInstance.flyTo([userLoc.lat, userLoc.lng], 15, { duration: 0.7 });
    else if (center) mapInstance.flyTo(center, zoom, { duration: 0.7 });
  }, [mapInstance, userLoc, center, zoom]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900"
      style={{
        height,
        boxShadow:
          "0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.15)",
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        zoomControl={false} /* we render our own premium zoom controls */
        attributionControl={false} /* we render a cleaner attribution */
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        whenReady={() => setMapReady(true)}
        key={
          isDark ? "dark" : "light"
        } /* remount on theme so tiles swap cleanly */
      >
        <TileLayer url={tileUrl} attribution="" />

        <Recenter center={center} zoom={zoom} />
        <MapController onReady={setMapInstance} />

        {/* Radius circle */}
        {radiusCenter && radiusKm > 0 && (
          <Circle
            center={radiusCenter}
            radius={radiusKm * 1000}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.08,
              weight: 2,
              dashArray: "5 6",
            }}
          />
        )}

        {/* User dot */}
        {userLoc && (
          <Marker
            position={[userLoc.lat, userLoc.lng]}
            icon={makeUserIcon()}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="px-2 py-1">
                <div className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white text-sm">
                  <Navigation size={14} className="text-blue-500" /> You are
                  here
                </div>
                <div className="text-[11px] text-ink-500 mt-0.5 font-mono">
                  {userLoc.lat?.toFixed(4)}, {userLoc.lng?.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* POIs */}
        {mapReady &&
          pois.map((p) => (
            <Marker
              key={`poi-${p.id}`}
              position={[p.lat, p.lng]}
              icon={makePOIIcon(p.kind || p.type)}
            >
              <Popup>
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-center gap-2 font-bold text-ink-900 dark:text-white">
                    <span
                      className="inline-block w-6 h-6 rounded-md grid place-items-center text-white text-[11px]"
                      style={{
                        background: (
                          POI_STYLES[p.kind || p.type] || POI_STYLES.default
                        ).color,
                      }}
                    >
                      {(p.kind || p.type || "").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  {p.address && (
                    <div className="text-xs text-ink-500 dark:text-ink-400 mt-1.5 leading-relaxed">
                      {p.address}
                    </div>
                  )}
                  {p.phone && (
                    <a
                      href={`tel:${p.phone}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      📞 {p.phone}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Incident pins */}
        {mapReady &&
          incidents.map((inc) => {
            const sev = inc.ai_severity || inc.severity || "low";
            const isCritical = sev === "critical";
            return (
              <Marker
                key={inc.id}
                position={[inc.lat, inc.lng]}
                icon={makeIncidentIcon(sev, isCritical, 36)}
                zIndexOffset={isCritical ? 2000 : sev === "high" ? 1000 : 0}
                eventHandlers={
                  selectable ? { click: () => onSelect?.(inc) } : undefined
                }
              >
                <Popup>
                  <div className="p-3 min-w-[260px] max-w-[300px]">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
                          style={{
                            background: PIN_COLORS[sev] || PIN_COLORS.low,
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="15"
                            height="15"
                            dangerouslySetInnerHTML={{
                              __html: `<g transform="translate(4,4) scale(0.65)">${
                                sev === "critical"
                                  ? '<path d="M12 2L2 21h20L12 2zm0 6v6m0 2v.01" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/>'
                                  : sev === "high"
                                    ? '<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" fill="#fff"/>'
                                    : sev === "moderate"
                                      ? '<path d="M12 9v4m0 4v.01M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
                                      : '<path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
                              }</g>`,
                            }}
                          />
                        </span>
                        <strong className="capitalize text-ink-900 dark:text-white text-sm truncate leading-snug">
                          {(inc.incident_type || "").replaceAll("_", " ")}
                        </strong>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 text-white"
                        style={{
                          background: PIN_COLORS[sev] || PIN_COLORS.low,
                        }}
                      >
                        {(sev || "").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-ink-700 dark:text-ink-300 leading-snug line-clamp-3 mb-2 break-words">
                      {inc.ai_summary ||
                        inc.description ||
                        "No description available."}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-ink-500 dark:text-ink-400 mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} /> {timeAgo(inc.created_at)}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 font-medium">
                        {(inc.status || "").replaceAll("_", " ")}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/app/incidents/${inc.id}`)}
                      className="w-full h-9 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-1 transition"
                    >
                      View details <ArrowRight size={14} />
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Route */}
        {userLoc && routeTo && (
          <RouteLayer
            start={[userLoc.lat, userLoc.lng]}
            end={routeTo}
            onInfo={(r, l) => {
              setRouteInfo(r);
              setRouteLoading(l);
            }}
          />
        )}
      </MapContainer>

      {/* ---------- FLOATING MAP CONTROLS ---------- */}
      {showControls && mapReady && (
        <div className="absolute right-3 bottom-3 z-[400] flex flex-col gap-1.5">
          {/* Zoom group */}
          <div className="flex flex-col rounded-xl overflow-hidden bg-white/95 dark:bg-ink-900/95 backdrop-blur border border-ink-200/80 dark:border-ink-700/80 shadow-lg">
            <button
              title="Zoom in"
              onClick={zoomIn}
              className="h-9 w-9 grid place-items-center hover:bg-ink-50 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-200 transition border-b border-ink-100 dark:border-ink-800"
            >
              <Plus size={16} />
            </button>
            <button
              title="Zoom out"
              onClick={zoomOut}
              className="h-9 w-9 grid place-items-center hover:bg-ink-50 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-200 transition"
            >
              <Minus size={16} />
            </button>
          </div>
          {/* Recenter */}
          <button
            title="Recenter to my location"
            onClick={recenter}
            className="h-9 w-9 grid place-items-center rounded-xl bg-white/95 dark:bg-ink-900/95 backdrop-blur border border-ink-200/80 dark:border-ink-700/80 shadow-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition"
          >
            <Crosshair size={16} />
          </button>
        </div>
      )}

      {/* ---------- ROUTE ETA BADGE ---------- */}
      {showRouteBadge &&
        userLoc &&
        routeTo &&
        ORS_API_KEY &&
        (routeLoading || routeInfo) && (
          <div className="absolute top-3 left-3 z-[400] bg-white/95 dark:bg-ink-900/95 backdrop-blur-xl rounded-xl px-3 py-2.5 shadow-xl border border-ink-200/80 dark:border-ink-800 flex items-center gap-2.5 min-w-[180px]">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white grid place-items-center shadow-md shadow-blue-500/30">
              {routeLoading ? <Spinner size={16} /> : <RouteIcon size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                Fastest route
              </div>
              {routeLoading ? (
                <div className="text-sm font-semibold text-ink-700 dark:text-ink-200">
                  Calculating…
                </div>
              ) : routeInfo ? (
                <div className="text-sm font-bold text-ink-900 dark:text-white leading-tight">
                  {routeInfo.duration_min} min{" "}
                  <span className="text-ink-400 font-medium">·</span>{" "}
                  {routeInfo.distance_km} km
                </div>
              ) : null}
            </div>
          </div>
        )}
      {showRouteBadge && userLoc && routeTo && !ORS_API_KEY && (
        <div className="absolute bottom-3 left-3 z-[400] bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl px-3 py-2 shadow-md text-xs text-amber-800 dark:text-amber-300 max-w-[300px] leading-relaxed">
          Add your <b>OpenRouteService</b> API key in{" "}
          <code className="font-mono text-[10px]">
            frontend/src/lib/mapConfig.js
          </code>{" "}
          to see driving routes & ETA.
        </div>
      )}

      {/* ---------- CLEAN ATTRIBUTION (bottom right, subtle) ---------- */}
      <div className="absolute bottom-0 right-0 z-[300] px-1.5 py-0.5 text-[9px] leading-tight text-ink-500 dark:text-ink-500 bg-white/70 dark:bg-ink-950/60 backdrop-blur-sm rounded-tl-md">
        ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          className="hover:underline"
        >
          OSM
        </a>{" "}
        ·{" "}
        <a href="https://carto.com/attributions" className="hover:underline">
          CARTO
        </a>
      </div>

      {/* ---------- LOADING OVERLAY ---------- */}
      {!mapReady && (
        <div className="absolute inset-0 z-[500] grid place-items-center bg-white/80 dark:bg-ink-900/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-ink-500 dark:text-ink-400">
            <Spinner size={24} className="text-brand-600" />
            <span className="text-xs font-medium">Loading map…</span>
          </div>
        </div>
      )}
    </div>
  );
}
