import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  PRIORITY_COLORS,
  STATUS_LABELS,
  PRIORITY_LABELS,
  timeAgo,
} from "../lib/helpers";
import { useNavigate } from "react-router-dom";

// Use colored divIcons for clean, theme-matched markers without external assets
function makeIcon(priority, size = 20) {
  const color = PRIORITY_COLORS[priority] || "#9ca3af";
  return L.divIcon({
    className: "custom-pin",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 0 0 3px ${color}55, 0 2px 8px rgba(0,0,0,0.5);
      position:relative;
    "><div style="
      position:absolute;inset:-6px;border-radius:50%;border:3px solid ${color};opacity:0.5;
      animation:pulse-key 1.5s ease-out infinite;
    "></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function UserDot({ lat, lng }) {
  if (lat == null || lng == null) return null;
  return (
    <CircleMarker
      center={[lat, lng]}
      radius={8}
      pathOptions={{
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 1,
        weight: 3,
      }}
    >
      <Popup>
        <b>You are here</b>
      </Popup>
    </CircleMarker>
  );
}

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center)
      map.flyTo(center, Math.max(map.getZoom(), 13), { duration: 0.8 });
  }, [center, map]);
  return null;
}

export default function IncidentMap({
  incidents,
  center,
  height = 500,
  onSelect,
  userLocation,
}) {
  const navigate = useNavigate();
  // Kathmandu default
  const defaultCenter = useMemo(() => center || [27.7172, 85.324], [center]);

  return (
    <div className="map-wrap" style={{ height }}>
      <style>{`@keyframes pulse-key { 0%{transform:scale(0.8);opacity:0.8;} 100%{transform:scale(2);opacity:0;} }`}</style>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Recenter center={center} />
        <UserDot lat={userLocation?.lat} lng={userLocation?.lng} />
        {incidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.lat, inc.lng]}
            icon={makeIcon(
              inc.severity || inc.ai_priority,
              inc.status === "reported" ? 18 : 22,
            )}
            eventHandlers={{ click: () => onSelect && onSelect(inc) }}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <div
                  style={{ fontWeight: 700, color: "#ef4444", marginBottom: 4 }}
                >
                  {inc.incident_type?.toUpperCase()}
                  <span
                    className={`badge badge-priority-${inc.severity || inc.ai_priority}`}
                    style={{ marginLeft: 8 }}
                  >
                    {PRIORITY_LABELS[inc.severity || inc.ai_priority] || ""}
                  </span>
                </div>
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  {inc.ai_summary || inc.description?.slice(0, 120)}
                </div>
                <div
                  style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}
                >
                  {STATUS_LABELS[inc.status]} · {timeAgo(inc.created_at)}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                >
                  View Details →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
