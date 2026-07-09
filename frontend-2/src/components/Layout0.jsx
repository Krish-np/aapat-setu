import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return children;

  const roleLinks =
    {
      citizen: [
        { to: "/", label: "Dashboard", icon: "🏠" },
        { to: "/report", label: "Report Incident", icon: "🚨" },
        { to: "/my-reports", label: "My Reports", icon: "📋" },
        { to: "/alerts", label: "Public Alerts", icon: "📢" },
        { to: "/map", label: "Live Map", icon: "🗺️" },
      ],
      volunteer: [
        { to: "/", label: "Dashboard", icon: "🏠" },
        { to: "/volunteer", label: "Nearby Tasks", icon: "🤝" },
        { to: "/my-tasks", label: "My Tasks", icon: "✅" },
        { to: "/alerts", label: "Alerts", icon: "📢" },
        { to: "/map", label: "Live Map", icon: "🗺️" },
      ],
      responder: [
        { to: "/", label: "Command Center", icon: "🎯" },
        { to: "/incidents", label: "All Incidents", icon: "📋" },
        { to: "/map", label: "Live Map", icon: "🗺️" },
        { to: "/alerts", label: "Send Alerts", icon: "📢" },
        { to: "/analytics", label: "Analytics", icon: "📊" },
      ],
    }[user.role] || [];

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <div className="brand-title">Aapat Setu</div>
            <div className="brand-tag">Emergency Bridge</div>
          </div>
        </div>
        {roleLinks.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </div>
              <span className="role-badge">{user.role}</span>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 10, width: "100%" }}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Log out
          </button>
          <div
            style={{
              textAlign: "center",
              marginTop: 12,
              fontSize: 10,
              color: "var(--text-dim)",
            }}
          >
            Team Zero Day · HackFusion 2026
          </div>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
