import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Polyline,
  useMap,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Spinner, priorityBadge, statusBadge } from "./ui";
import { timeAgo } from "../lib/helpers";
import {
  Navigation,
  Crosshair,
  AlertTriangle,
  Route as RouteIcon,
} from "lucide-react";
import { useTheme } from "../store/theme";
import { getRoute, ORS_API_KEY } from "../lib/mapConfig";

// ---------- Colors ----------
const PIN_COLORS = {
  critical: "#dc2626",
  high: "#ea580c",
  moderate: "#d97706",
  low: "#059669",
};
const POI_STYLES = {
  hospital: { emoji: "🏥", color: "#db2777" },
  police: { emoji: "🚓", color: "#1d4ed8" },
  fire: { emoji: "🚒", color: "#dc2626" },
  ngo: { emoji: "🤝", color: "#7c3aed" },
  shelter: { emoji: "🏠", color: "#059669" },
  supply: { emoji: "📦", color: "#d97706" },
  default: { emoji: "📍", color: "#475569" },
};

// ---------- Teardrop incident pin ----------
function makeIncidentIcon(severity, isCritical = false, size = 34) {
  const color = PIN_COLORS[severity] || PIN_COLORS.low;
  const html = `
    <div class="pin-drop" style="position:relative;width:${size}px;height:${size * 1.3}px;${isCritical ? "color:" + color : ""}">
      <svg viewBox="0 0 32 42" width="${size}" height="${size * 1.3}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow-${severity}-${size}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path filter="url(#shadow-${severity}-${size})"
          d="M16 0 C7.16 0 0 7.16 0 16 c0 11 16 26 16 26 s16-15 16-26 C32 7.16 24.84 0 16 0 z"
          fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="16" cy="15" r="5.5" fill="#fff"/>
      </svg>
      ${isCritical ? `<span style="position:absolute;inset:-8px;border-radius:9999px;border:2px solid ${color};opacity:.6;animation:pinPulse 2s ease-out infinite"></span>` : ""}
    </div>`;
  return L.divIcon({
    className: "custom-pin",
    html,
    iconSize: [size, size * 1.3],
    iconAnchor: [size / 2, size * 1.3],
    popupAnchor: [0, -(size * 1.3) - 4],
  });
}

// ---------- POI pin ----------
function makePOIIcon(kind) {
  const s = POI_STYLES[kind] || POI_STYLES.default;
  const html = `
    <div class="pin-drop" style="position:relative;">
      <div style="width:34px;height:34px;border-radius:10px;background:${s.color};color:#fff;display:grid;place-items:center;font-size:17px;border:2.5px solid #fff;box-shadow:0 4px 10px rgba(15,23,42,0.25);">${s.emoji}</div>
      <div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid ${s.color};"></div>
    </div>`;
  return L.divIcon({
    className: "poi-pin",
    html,
    iconSize: [34, 40],
    iconAnchor: [17, 38],
    popupAnchor: [0, -34],
  });
}

// ---------- User pin ----------
function makeUserIcon() {
  const html = `
    <div class="user-dot" style="position:relative;width:18px;height:18px;">
      <div style="position:absolute;inset:0;border-radius:9999px;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,0.6);"></div>
    </div>`;
  return L.divIcon({
    className: "user-pin",
    html,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center)
      map.flyTo(center, zoom || map.getZoom() || 13, {
        duration: 0.8,
        easeLinearity: 0.25,
      });
  }, [center, zoom, map]);
  return null;
}

function RouteLayer({ start, end, onInfo }) {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!start || !end) {
      setRoute(null);
      return;
    }
    if (!ORS_API_KEY) {
      setRoute(null);
      return;
    }
    setLoading(true);
    getRoute([start[0], start[1]], [end[0], end[1]])
      .then((r) => {
        if (active) setRoute(r);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [start && start[0], start && start[1], end && end[0], end && end[1]]);

  useEffect(() => {
    onInfo?.(route, loading);
  }, [route, loading, onInfo]);

  if (!route) return null;
  return (
    <>
      <Polyline
        positions={route.coords}
        pathOptions={{
          color: "#3b82f6",
          weight: 6,
          opacity: 0.25,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      <Polyline
        positions={route.coords}
        pathOptions={{
          color: "#ffffff",
          weight: 2,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
          dashArray: "1 0",
        }}
      />
      <Polyline
        positions={route.coords}
        pathOptions={{
          color: "#3b82f6",
          weight: 2,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
          dashArray: "8 10",
        }}
      />
    </>
  );
}

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
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [mapReady, setMapReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const isDark =
    theme === "dark" || document.documentElement.classList.contains("dark");

  const defaultCenter = useMemo(() => center || [27.7172, 85.324], [center]);
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-ink-200 dark:border-ink-800 shadow-sm bg-white dark:bg-ink-900"
      style={{ height }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        <Recenter center={center} zoom={zoom} />

        {radiusCenter && radiusKm && (
          <Circle
            center={radiusCenter}
            radius={radiusKm * 1000}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.08,
              weight: 2,
              dashArray: "6 6",
            }}
          />
        )}

        {userLoc && (
          <Marker position={[userLoc.lat, userLoc.lng]} icon={makeUserIcon()}>
            <Popup>
              <div className="px-1 py-1">
                <div className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white">
                  <Navigation size={14} className="text-blue-500" />
                  You are here
                </div>
                <div className="text-[11px] text-ink-500 mt-0.5">
                  {userLoc.lat?.toFixed(4)}, {userLoc.lng?.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {mapReady &&
          pois.map((p) => (
            <Marker
              key={`poi-${p.id}`}
              position={[p.lat, p.lng]}
              icon={makePOIIcon(p.kind || p.type)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 font-bold text-ink-900 dark:text-white">
                    <span className="text-lg">
                      {
                        (POI_STYLES[p.kind || p.type] || POI_STYLES.default)
                          .emoji
                      }
                    </span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  {p.address && (
                    <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">
                      {p.address}
                    </div>
                  )}
                  {p.phone && (
                    <div className="text-xs mt-1 text-ink-700 dark:text-ink-300">
                      📞{" "}
                      <a href={`tel:${p.phone}`} className="underline">
                        {p.phone}
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {mapReady &&
          incidents.map((inc) => {
            const sev = inc.ai_severity || inc.severity || "low";
            const pb = priorityBadge(sev);
            const sb = statusBadge(inc.status);
            const isCritical = sev === "critical";
            return (
              <Marker
                key={inc.id}
                position={[inc.lat, inc.lng]}
                icon={makeIncidentIcon(sev, isCritical, 32)}
                eventHandlers={{
                  click: () => selectable && onSelect?.(inc),
                }}
              >
                <Popup>
                  <div className="p-3 min-w-[260px] max-w-[300px]">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertTriangle
                          size={16}
                          className={
                            sev === "critical"
                              ? "text-red-600 shrink-0"
                              : sev === "high"
                                ? "text-orange-600 shrink-0"
                                : "text-amber-600 shrink-0"
                          }
                        />
                        <strong className="capitalize truncate text-ink-900 dark:text-white">
                          {(inc.incident_type || "").replaceAll("_", " ")}
                        </strong>
                      </div>
                      <Badge color={pb.color}>{pb.label}</Badge>
                    </div>
                    <p className="text-sm text-ink-700 dark:text-ink-300 leading-snug line-clamp-3 mb-2">
                      {inc.ai_summary || inc.description || ""}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-ink-500 dark:text-ink-400 mb-3">
                      <Badge color={sb.color} dot>
                        {sb.label}
                      </Badge>
                      <span>{timeAgo(inc.created_at)}</span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/app/incidents/${inc.id}`)}
                    >
                      View Details →
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {userLoc && routeTo && (
          <RouteLayer
            start={[userLoc.lat, userLoc.lng]}
            end={routeTo}
            onInfo={(r, loading) => {
              setRouteInfo(r);
              setRouteLoading(loading);
            }}
          />
        )}
      </MapContainer>

      {/* Floating controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          title="Recenter to my location"
          className="h-10 w-10 grid place-items-center rounded-xl bg-white/90 dark:bg-ink-900/90 backdrop-blur border border-ink-200 dark:border-ink-700 shadow-sm hover:bg-white dark:hover:bg-ink-800 text-ink-700 dark:text-ink-200 transition"
          onClick={() => {
            const el = document.querySelector(".leaflet-container");
            const map = el?._leaflet_map;
            if (map && userLoc)
              map.flyTo([userLoc.lat, userLoc.lng], 15, { duration: 0.7 });
          }}
        >
          <Crosshair size={16} />
        </button>
      </div>

      {/* Route info badge */}
      {showRouteBadge &&
        userLoc &&
        routeTo &&
        ORS_API_KEY &&
        (routeLoading || routeInfo) && (
          <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-ink-900/95 backdrop-blur rounded-xl px-3 py-2 shadow-lg border border-ink-200 dark:border-ink-800 text-xs flex items-center gap-2">
            <RouteIcon size={14} className="text-blue-500" />
            {routeLoading ? (
              <span className="text-ink-500">Calculating route…</span>
            ) : routeInfo ? (
              <span className="text-ink-700 dark:text-ink-200 font-semibold">
                {routeInfo.duration_min} min · {routeInfo.distance_km} km
              </span>
            ) : null}
          </div>
        )}
      {showRouteBadge && userLoc && routeTo && !ORS_API_KEY && (
        <div className="absolute bottom-3 left-3 z-[400] bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-3 py-2 shadow-md text-xs text-amber-800 dark:text-amber-300 max-w-[300px]">
          Add your <b>OpenRouteService (HeiGIT)</b> API key in{" "}
          <code>frontend/src/lib/mapConfig.js</code> to see driving routes &
          ETA.
        </div>
      )}

      {/* Loader overlay */}
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
