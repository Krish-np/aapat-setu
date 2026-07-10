import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  ScaleControl,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bike,
  Car,
  Clock,
  Crosshair,
  Footprints,
  Minus,
  Navigation,
  Plus,
} from "lucide-react";
import "./map-ui.css";

import { Spinner } from "./ui";
import "./map-ui.css";
import useRelativeTime from "../lib/useRelativeTime";
import { getRoute, ORS_API_KEY, ROUTING_PROFILES } from "../lib/mapConfig";
import { useTheme } from "../store/theme";

const DEFAULT_CENTER = [27.7172, 85.324];

const PIN_COLORS = {
  critical: "#dc2626",
  high: "#ea580c",
  moderate: "#d97706",
  low: "#059669",
};

const SEVERITY_ICONS = {
  critical: `
    <path d="M12 3 2.7 20.2c-.5.9.2 1.8 1.2 1.8h16.2c1 0 1.7-.9 1.2-1.8L12 3Z"
      fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>
    <path d="M12 8v6" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="12" cy="18" r="1.25" fill="white"/>
  `,
  high: `
    <path d="M13.2 2.5c.7 3.1-.8 4.5-2.2 6.1-1.1 1.2-2 2.4-1.3 4.2.6-1.2 1.5-2 2.8-2.8-.1 2.2 1.5 3.1 1.5 5.3 0 1.6-1 2.8-2.4 3.3 3.1.3 6-2 6-5.7 0-3.7-2.3-6.6-4.4-10.4Z" fill="white"/>
    <path d="M8.5 10.4c-1.8 1.8-3 3.6-3 5.8 0 3.3 2.7 5.8 6 5.8 1.1 0 2.1-.3 3-.8-3.6.2-6.2-2.2-6.2-5.2 0-1.7.7-3.4.2-5.6Z" fill="white" opacity=".88"/>
  `,
  moderate: `
    <path d="M12 3 2.7 20.2c-.5.9.2 1.8 1.2 1.8h16.2c1 0 1.7-.9 1.2-1.8L12 3Z"
      fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>
    <path d="M12 9v5" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="12" cy="18" r="1.2" fill="white"/>
  `,
  low: `
    <path d="m5 12.5 4.2 4.2L19.5 6.5" fill="none" stroke="white" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round"/>
  `,
};

const POI_STYLES = {
  hospital: {
    color: "#db2777",
    label: "Hospital",
    icon: '<path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5V3Z" fill="white"/>',
  },
  police: {
    color: "#2563eb",
    label: "Police",
    icon: '<path d="M12 2.5 20 6v5.5c0 5.2-3.3 8.5-8 10.3-4.7-1.8-8-5.1-8-10.3V6l8-3.5Z" fill="white"/><path d="m8.5 12 2.2 2.2 4.8-5" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  fire: {
    color: "#dc2626",
    label: "Fire station",
    icon: '<path d="M13.4 2.2c.5 3-.8 4.4-2.1 5.9-1.2 1.3-2.2 2.6-1.5 4.7.8-1.4 1.8-2.3 3.1-3.1-.1 2.4 1.7 3.4 1.7 5.7 0 1.8-1 3.2-2.6 3.8 3.6.2 6.6-2.3 6.6-6.2 0-4.1-2.7-7.3-5.2-10.8ZM8.2 10c-2 1.9-3.2 4-3.2 6.1 0 3.3 2.6 5.9 6 5.9 1.1 0 2.1-.3 3-.8-3.8.1-6.4-2.4-6.4-5.5 0-1.8.8-3.6.6-5.7Z" fill="white"/>',
  },
  ngo: {
    color: "#7c3aed",
    label: "NGO",
    icon: '<path d="M12 20.5 4.3 13A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 7.7 7l-7.7 7.5Z" fill="white"/>',
  },
  shelter: {
    color: "#059669",
    label: "Shelter",
    icon: '<path d="m2.5 11.5 9.5-8 9.5 8-1.8 2.1-1.7-1.5V21h-5v-6H9v6H6v-8.9l-1.7 1.5-1.8-2.1Z" fill="white"/>',
  },
  supply: {
    color: "#d97706",
    label: "Supply point",
    icon: '<path d="m12 2.5 9 4.8v9.4l-9 4.8-9-4.8V7.3l9-4.8Zm0 2.8L6.3 8.4l5.7 3.1 5.7-3.1L12 5.3Zm-6.5 5.2v4.8l5.2 2.8v-4.8l-5.2-2.8Zm7.8 7.6 5.2-2.8v-4.8l-5.2 2.8v4.8Z" fill="white"/>',
  },
  municipality: {
    color: "#4f46e5",
    label: "Municipality",
    icon: '<path d="M4 21V7h4V3h8v4h4v14h-6v-4h-4v4H4Zm7-15v3h2V6h-2Zm0 5v3h2v-3h-2ZM6.5 10v3h2v-3h-2Zm9 0v3h2v-3h-2Z" fill="white"/>',
  },
  default: {
    color: "#475569",
    label: "Location",
    icon: '<path d="M12 2.5a7.5 7.5 0 0 0-7.5 7.5c0 5.6 7.5 11.5 7.5 11.5s7.5-5.9 7.5-11.5A7.5 7.5 0 0 0 12 2.5Zm0 10.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" fill="white"/>',
  },
};

const iconCache = new globalThis.Map();

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function toPosition(value) {
  if (
    Array.isArray(value) &&
    isFiniteNumber(value[0]) &&
    isFiniteNumber(value[1])
  ) {
    return [Number(value[0]), Number(value[1])];
  }

  if (value && isFiniteNumber(value.lat) && isFiniteNumber(value.lng)) {
    return [Number(value.lat), Number(value.lng)];
  }

  return null;
}

function normalizeSeverity(value) {
  const severity = String(value || "").toLowerCase();
  return Object.hasOwn(PIN_COLORS, severity) ? severity : "low";
}

function formatToken(value, fallback = "Unknown") {
  if (!value) return fallback;
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getIncidentIcon(severity, size = 42) {
  const sev = normalizeSeverity(severity);
  const key = `incident-${sev}-${size}`;
  if (iconCache.has(key)) return iconCache.get(key);

  const color = PIN_COLORS[sev];
  const height = Math.round(size * 1.28);
  const isCritical = sev === "critical";
  const html = `
    <div class="crisis-marker crisis-marker--incident ${isCritical ? "is-critical" : ""}"
      style="--marker-color:${color};width:${size}px;height:${height}px">
      ${isCritical ? '<span class="crisis-marker__pulse" aria-hidden="true"></span>' : ""}
      <svg class="crisis-marker__svg" viewBox="0 0 44 56" width="${size}" height="${height}" aria-hidden="true">
        <path d="M22 1.5C10.7 1.5 2 10.1 2 21.2 2 34.7 22 54 22 54s20-19.3 20-32.8C42 10.1 33.3 1.5 22 1.5Z"
          fill="${color}" stroke="white" stroke-width="2.5"/>
        <circle cx="22" cy="21" r="14" fill="white" opacity=".14"/>
        <g transform="translate(10 9)">${SEVERITY_ICONS[sev]}</g>
      </svg>
    </div>
  `;

  const icon = L.divIcon({
    className: "crisis-leaflet-icon",
    html,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 6],
    tooltipAnchor: [0, -height / 2],
  });

  iconCache.set(key, icon);
  return icon;
}

function getPoiIcon(kind) {
  const normalizedKind = Object.hasOwn(POI_STYLES, kind) ? kind : "default";
  const key = `poi-${normalizedKind}`;
  if (iconCache.has(key)) return iconCache.get(key);

  const style = POI_STYLES[normalizedKind];
  const html = `
    <div class="crisis-marker crisis-marker--poi" style="--marker-color:${style.color};width:40px;height:50px">
      <svg class="crisis-marker__svg" viewBox="0 0 44 56" width="40" height="50" aria-hidden="true">
        <path d="M22 1.5C10.7 1.5 2 10.1 2 21.2 2 34.7 22 54 22 54s20-19.3 20-32.8C42 10.1 33.3 1.5 22 1.5Z"
          fill="${style.color}" stroke="white" stroke-width="2.5"/>
        <circle cx="22" cy="21" r="15" fill="white" opacity=".13"/>
        <g transform="translate(10 9)">${style.icon}</g>
      </svg>
    </div>
  `;

  const icon = L.divIcon({
    className: "crisis-leaflet-icon",
    html,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -45],
    tooltipAnchor: [0, -24],
  });

  iconCache.set(key, icon);
  return icon;
}

function getUserIcon() {
  const key = "user-location";
  if (iconCache.has(key)) return iconCache.get(key);

  const icon = L.divIcon({
    className: "crisis-leaflet-icon",
    html: `
      <div class="crisis-user-location" aria-hidden="true">
        <span class="crisis-user-location__halo"></span>
        <span class="crisis-user-location__dot"></span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });

  iconCache.set(key, icon);
  return icon;
}

function getRouteStartIcon() {
  const key = "route-start";
  if (iconCache.has(key)) return iconCache.get(key);

  const icon = L.divIcon({
    className: "crisis-leaflet-icon",
    html: `
      <div class="crisis-route-start" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9l2-4h12l2 4v6a2 2 0 0 1-2 2M7 17v2m10-2v2M6 9h12M7 13h2m6 0h2"
            fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -24],
  });

  iconCache.set(key, icon);
  return icon;
}

function getRouteEndIcon() {
  const key = "route-end";
  if (iconCache.has(key)) return iconCache.get(key);

  const icon = L.divIcon({
    className: "crisis-leaflet-icon",
    html: `
      <div class="crisis-route-end" aria-hidden="true">
        <svg class="crisis-marker__svg" viewBox="0 0 44 56" width="42" height="53">
          <path d="M22 1.5C10.7 1.5 2 10.1 2 21.2 2 34.7 22 54 22 54s20-19.3 20-32.8C42 10.1 33.3 1.5 22 1.5Z"
            fill="#059669" stroke="white" stroke-width="2.5"/>
          <circle cx="22" cy="21" r="12" fill="white" opacity=".18"/>
          <circle cx="22" cy="21" r="6" fill="white"/>
          <circle cx="22" cy="21" r="2.5" fill="#059669"/>
        </svg>
      </div>
    `,
    iconSize: [42, 53],
    iconAnchor: [21, 53],
    popupAnchor: [0, -48],
  });

  iconCache.set(key, icon);
  return icon;
}

function MapLifecycle({ onReady }) {
  const map = useMap();

  useEffect(() => {
    map.whenReady(() => onReady(map));
  }, [map, onReady]);

  return null;
}

function Recenter({ center, zoom }) {
  const map = useMap();
  const latitude = center?.[0];
  const longitude = center?.[1];

  useEffect(() => {
    if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) return;
    map.flyTo(
      [Number(latitude), Number(longitude)],
      zoom || map.getZoom() || 13,
      {
        animate: true,
        duration: 0.7,
      },
    );
  }, [latitude, longitude, map, zoom]);

  return null;
}

function RouteLayer({ start, end, profile, onInfo }) {
  const map = useMap();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const startLat = start?.[0];
  const startLng = start?.[1];
  const endLat = end?.[0];
  const endLng = end?.[1];

  useEffect(() => {
    let active = true;

    if (
      !isFiniteNumber(startLat) ||
      !isFiniteNumber(startLng) ||
      !isFiniteNumber(endLat) ||
      !isFiniteNumber(endLng) ||
      !ORS_API_KEY
    ) {
      setRoute(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setRoute(null);

    getRoute([startLat, startLng], [endLat, endLng], profile)
      .then((result) => {
        if (active) setRoute(result);
      })
      .catch(() => {
        if (active) setRoute(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [endLat, endLng, profile, startLat, startLng]);

  useEffect(() => {
    onInfo(route, loading);
  }, [loading, onInfo, route]);

  useEffect(() => {
    if (!route?.coords?.length) return;
    map.fitBounds(route.coords, {
      animate: true,
      duration: 0.7,
      maxZoom: 15,
      padding: [48, 48],
    });
  }, [map, route]);

  if (!start || !end) return null;

  return (
    <>
      {route?.coords?.length > 0 && (
        <>
          <Polyline
            positions={route.coords}
            pathOptions={{
              color: "#0f172a",
              lineCap: "round",
              lineJoin: "round",
              opacity: 0.22,
              weight: 11,
            }}
          />
          <Polyline
            positions={route.coords}
            pathOptions={{
              color: "#2563eb",
              lineCap: "round",
              lineJoin: "round",
              opacity: 1,
              weight: 6,
            }}
          />
          <Polyline
            positions={route.coords}
            pathOptions={{
              color: "#bfdbfe",
              dashArray: "1 11",
              lineCap: "round",
              opacity: 0.95,
              weight: 2.5,
            }}
          />
        </>
      )}

      <Marker
        position={start}
        icon={getRouteStartIcon()}
        interactive={false}
        zIndexOffset={2100}
      />
      <Marker
        position={end}
        icon={getRouteEndIcon()}
        interactive={false}
        zIndexOffset={2200}
      />
    </>
  );
}

function RouteModeIcon({ profile }) {
  if (profile === "foot-walking") return <Footprints size={17} />;
  if (profile === "cycling-regular") return <Bike size={17} />;
  return <Car size={17} />;
}

function routeModeLabel(profile) {
  if (profile === "foot-walking") return "Walking";
  if (profile === "cycling-regular") return "Cycling";
  return "Driving";
}

function formatDistance(meters) {
  const distance = Number(meters);
  if (!Number.isFinite(distance)) return "";
  return distance < 1000
    ? `${Math.round(distance)} m`
    : `${(distance / 1000).toFixed(1)} km`;
}

export default function CrisisMap({
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
  showLegend = true,
  profile = ROUTING_PROFILES.driving,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [ready, setReady] = useState(false);
  const [map, setMap] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const tr = useCallback(
    (key, fallback) => t(key, { defaultValue: fallback }),
    [t],
  );

  const isDark = theme === "dark";
  const normalizedCenter = toPosition(center);
  const defaultCenter = normalizedCenter || DEFAULT_CENTER;
  const userPosition = useMemo(() => toPosition(userLoc), [userLoc]);
  const destinationPosition = useMemo(() => toPosition(routeTo), [routeTo]);
  const normalizedRadiusCenter = toPosition(radiusCenter);

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const validPois = useMemo(
    () => pois.filter((poi) => toPosition(poi)),
    [pois],
  );
  const validIncidents = useMemo(
    () => incidents.filter((incident) => toPosition(incident)),
    [incidents],
  );

  const handleMapReady = useCallback((instance) => {
    setMap(instance);
    setReady(true);
  }, []);

  const handleRouteInfo = useCallback((result, loading) => {
    setRouteInfo(result);
    setRouteLoading(loading);
    if (!result) setShowSteps(false);
  }, []);

  const zoomIn = useCallback(() => map?.zoomIn(), [map]);
  const zoomOut = useCallback(() => map?.zoomOut(), [map]);

  const recenter = useCallback(() => {
    if (!map) return;
    const target = userPosition || normalizedCenter || DEFAULT_CENTER;
    map.flyTo(target, userPosition ? 15 : zoom, {
      animate: true,
      duration: 0.7,
    });
  }, [map, normalizedCenter, userPosition, zoom]);

  return (
    <div
      className="crisis-map-shell relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      style={{
        height,
        boxShadow:
          "0 1px 2px rgba(15,23,42,.05), 0 18px 45px -26px rgba(15,23,42,.35)",
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer key={tileUrl} url={tileUrl} attribution="" />
        <MapLifecycle onReady={handleMapReady} />
        <Recenter center={normalizedCenter} zoom={zoom} />
        <ScaleControl position="bottomleft" imperial={false} />

        {normalizedRadiusCenter && Number(radiusKm) > 0 && (
          <Circle
            center={normalizedRadiusCenter}
            radius={Number(radiusKm) * 1000}
            pathOptions={{
              color: "#dc2626",
              dashArray: "6 7",
              fillColor: "#ef4444",
              fillOpacity: 0.08,
              opacity: 0.9,
              weight: 2,
            }}
          />
        )}

        {userPosition && (
          <Marker
            position={userPosition}
            icon={getUserIcon()}
            title={tr("map.you_are_here", "You are here")}
            zIndexOffset={3000}
          >
            <Popup>
              <div className="min-w-[180px] px-1 py-0.5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                    <Navigation size={14} aria-hidden="true" />
                  </span>
                  {tr("map.you_are_here", "You are here")}
                </div>
                <div className="mt-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {userPosition[0].toFixed(4)}, {userPosition[1].toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {ready &&
          validPois.map((poi) => {
            const position = toPosition(poi);
            const kind = Object.hasOwn(POI_STYLES, poi.kind || poi.type)
              ? poi.kind || poi.type
              : "default";
            const poiStyle = POI_STYLES[kind];

            return (
              <Marker
                key={`poi-${poi.id ?? `${position[0]}-${position[1]}`}`}
                position={position}
                icon={getPoiIcon(kind)}
                title={poi.name || poiStyle.label}
                zIndexOffset={500}
              >
                <Popup>
                  <div className="min-w-[230px] max-w-[290px] p-1">
                    <div className="flex items-start gap-3">
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black text-white shadow-sm"
                        style={{ background: poiStyle.color }}
                      >
                        {(poi.name || poiStyle.label).slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {poi.name || poiStyle.label}
                        </div>
                        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {poiStyle.label}
                        </div>
                      </div>
                    </div>

                    {poi.address && (
                      <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {poi.address}
                      </p>
                    )}

                    {poi.phone && (
                      <a
                        href={`tel:${poi.phone}`}
                        className="mt-3 inline-flex min-h-8 items-center rounded-lg bg-slate-100 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        {tr("map.call", "Call")} {poi.phone}
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {ready &&
          validIncidents.map((incident) => {
            const position = toPosition(incident);
            const severity = normalizeSeverity(
              incident.ai_severity || incident.severity,
            );
            const summary =
              incident.ai_summary ||
              incident.description ||
              "No summary available.";
            const incidentType = formatToken(
              incident.incident_type,
              "Incident",
            );
            const status = formatToken(incident.status, "Reported");

            return (
              <Marker
                key={incident.id ?? `${position[0]}-${position[1]}`}
                position={position}
                icon={getIncidentIcon(severity)}
                title={`${incidentType} — ${formatToken(severity)}`}
                zIndexOffset={
                  severity === "critical"
                    ? 2000
                    : severity === "high"
                      ? 1200
                      : 800
                }
                eventHandlers={
                  selectable ? { click: () => onSelect?.(incident) } : undefined
                }
              >
                <Popup>
                  <article className="min-w-[270px] max-w-[320px] p-1">
                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          {tr("map.incident", "Incident")}
                        </div>
                        <h3 className="mt-0.5 truncate text-sm font-extrabold text-slate-950 dark:text-white">
                          {incidentType}
                        </h3>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white"
                        style={{ background: PIN_COLORS[severity] }}
                      >
                        {severity}
                      </span>
                    </header>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {summary}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <Clock size={12} aria-hidden="true" />
                        <RelativeTime ts={incident.created_at} />
                      </span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 font-semibold dark:bg-slate-800">
                        {status}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/app/incidents/${incident.id}`)}
                      className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus:ring-offset-slate-900"
                    >
                      {tr("map.view_details", "View details")}
                      <ArrowRight size={15} aria-hidden="true" />
                    </button>
                  </article>
                </Popup>
              </Marker>
            );
          })}

        {userPosition && destinationPosition && (
          <RouteLayer
            start={userPosition}
            end={destinationPosition}
            profile={profile}
            onInfo={handleRouteInfo}
          />
        )}
      </MapContainer>

      <AnimatePresence>
        {showLegend && ready && !destinationPosition && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="absolute left-3 top-3 z-[400] hidden rounded-xl border border-white/60 bg-white/90 p-2.5 shadow-lg backdrop-blur-xl sm:block dark:border-slate-700/70 dark:bg-slate-900/90"
          >
            <div className="mb-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
              {tr("map.severity", "Severity")}
            </div>
            <div className="flex items-center gap-3">
              {Object.entries(PIN_COLORS).map(([severity, color]) => (
                <span
                  key={severity}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold capitalize text-slate-600 dark:text-slate-300"
                >
                  <span
                    className="h-2 w-2 rounded-full ring-2 ring-white dark:ring-slate-900"
                    style={{ background: color }}
                  />
                  {severity}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && ready && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="absolute bottom-5 right-3 z-[400] flex flex-col gap-2"
          >
            <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-lg backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95">
              <button
                type="button"
                title={tr("map.zoom_in", "Zoom in")}
                aria-label={tr("map.zoom_in", "Zoom in")}
                onClick={zoomIn}
                className="grid h-10 w-10 place-items-center border-b border-slate-100 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Plus size={17} />
              </button>
              <button
                type="button"
                title={tr("map.zoom_out", "Zoom out")}
                aria-label={tr("map.zoom_out", "Zoom out")}
                onClick={zoomOut}
                className="grid h-10 w-10 place-items-center text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Minus size={17} />
              </button>
            </div>
            <button
              type="button"
              title={tr("map.recenter", "Recenter map")}
              aria-label={tr("map.recenter", "Recenter map")}
              onClick={recenter}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200/80 bg-white/95 text-blue-600 shadow-lg backdrop-blur-xl transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-blue-400 dark:hover:bg-blue-500/10"
            >
              <Crosshair size={17} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRouteBadge &&
          userPosition &&
          destinationPosition &&
          ORS_API_KEY &&
          (routeLoading || routeInfo) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-3 right-3 top-3 z-[400] max-w-md md:right-auto"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-2.5 shadow-xl backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                  {routeLoading ? (
                    <Spinner size={17} />
                  ) : (
                    <RouteModeIcon profile={profile} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {routeModeLabel(profile)} ·{" "}
                    {tr("map.fastest_route", "Fastest route")}
                  </div>
                  {routeLoading ? (
                    <div className="mt-0.5 text-sm font-bold text-slate-700 dark:text-slate-200">
                      {tr("map.calculating", "Calculating route…")}
                    </div>
                  ) : (
                    <div className="mt-0.5 flex items-baseline gap-2 text-slate-950 dark:text-white">
                      <strong className="text-base">
                        {routeInfo.duration_min} min
                      </strong>
                      <span className="text-xs font-semibold text-slate-500">
                        {routeInfo.distance_km} km
                      </span>
                    </div>
                  )}
                </div>

                {routeInfo?.steps?.length > 0 && (
                  <button
                    type="button"
                    aria-expanded={showSteps}
                    onClick={() => setShowSteps((current) => !current)}
                    className="min-h-9 shrink-0 rounded-lg px-2.5 text-xs font-bold text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  >
                    {showSteps
                      ? tr("map.hide", "Hide")
                      : tr("map.steps", "Steps")}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showSteps && routeInfo?.steps?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 max-h-64 overflow-y-auto rounded-2xl border border-white/70 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95"
                  >
                    <ol className="space-y-1">
                      {routeInfo.steps.slice(0, 10).map((step, index) => (
                        <li
                          key={`${index}-${step.instruction}`}
                          className="flex items-start gap-2.5 rounded-xl p-2 text-xs leading-relaxed text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/80"
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-[10px] font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            {step.instruction}
                            {Number(step.distance_m) > 20 && (
                              <span className="ml-1.5 whitespace-nowrap font-semibold text-slate-400">
                                · {formatDistance(step.distance_m)}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
      </AnimatePresence>

      {showRouteBadge &&
        userPosition &&
        destinationPosition &&
        !ORS_API_KEY && (
          <div className="absolute bottom-3 left-3 z-[400] max-w-[320px] rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs leading-relaxed text-amber-900 shadow-md backdrop-blur dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Add your <strong>OpenRouteService</strong> API key in{" "}
            <code className="font-mono text-[10px]">
              frontend/src/lib/mapConfig.js
            </code>{" "}
            to enable routing.
          </div>
        )}

      <div className="absolute bottom-0 right-0 z-[300] rounded-tl-md bg-white/75 px-1.5 py-0.5 text-[9px] leading-tight text-slate-500 backdrop-blur-sm dark:bg-slate-950/70 dark:text-slate-400">
        ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          OSM
        </a>{" "}
        ·{" "}
        <a
          href="https://carto.com/attributions"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          CARTO
        </a>{" "}
        ·{" "}
        <a
          href="https://openrouteservice.org/"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          ORS
        </a>
      </div>

      <AnimatePresence>
        {!ready && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[500] grid place-items-center bg-white/85 backdrop-blur-sm dark:bg-slate-900/85"
          >
            <div className="flex flex-col items-center gap-2.5 text-slate-500 dark:text-slate-400">
              <Spinner size={26} className="text-blue-600" />
              <span className="text-xs font-semibold">
                {tr("map.loading", "Loading map…")}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RelativeTime({ ts }) {
  const value = useRelativeTime(ts);
  return <>{value}</>;
}
