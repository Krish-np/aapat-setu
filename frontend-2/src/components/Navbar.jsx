import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../store/theme";
import { useAuth } from "../store/auth";
import { Button, Avatar, Badge, IconButton } from "./ui";
import {
  Sun,
  Moon,
  Globe,
  LogOut,
  Shield,
  Bell,
  BookOpen,
  Package,
  BarChart3,
  Home,
  MapPin,
  Megaphone,
  ClipboardList,
  Target,
  AlertTriangle,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

function linkCls({ isActive }) {
  return [
    "h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
    isActive
      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
      : "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-white",
  ].join(" ");
}

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const toggleLang = () =>
    i18n.changeLanguage(i18n.language === "en" ? "ne" : "en");

  // ------------- Public (landing) nav -------------
  if (!user) {
    return (
      <nav className="sticky top-0 z-50 glass-strong border-b border-ink-200/60 dark:border-ink-800/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-extrabold text-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-lg shadow-brand-600/25 ring-1 ring-inset ring-white/20">
              <Shield size={18} />
            </div>
            <span className="hidden sm:block tracking-tight">
              <span className="text-ink-900 dark:text-white">
                {t("brand") || "Aapat Setu"}
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 ml-4">
            <a
              href="#features"
              className="h-9 px-3 inline-flex items-center text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition"
            >
              Features
            </a>
            <a
              href="#how"
              className="h-9 px-3 inline-flex items-center text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition"
            >
              How it works
            </a>
            <a
              href="#ai"
              className="h-9 px-3 inline-flex items-center text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition"
            >
              AI
            </a>
            <a
              href="#roles"
              className="h-9 px-3 inline-flex items-center text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition"
            >
              For Responders
            </a>
            <a
              href="#contact"
              className="h-9 px-3 inline-flex items-center text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition"
            >
              Contact
            </a>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <IconButton
              title={
                i18n.language === "en"
                  ? "Switch to Nepali"
                  : "Switch to English"
              }
              onClick={toggleLang}
            >
              <Globe size={18} />
            </IconButton>
            <IconButton
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              onClick={toggle}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
            <Button size="sm" onClick={() => navigate("/app/login")}>
              {t("nav.signin") || "Sign in"}
            </Button>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden h-10 w-10 rounded-xl grid place-items-center text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
              aria-label="menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t border-ink-200/60 dark:border-ink-800 bg-white/95 dark:bg-ink-950/95 backdrop-blur px-4 py-3 flex flex-col gap-1">
            <a
              href="#features"
              className="px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800"
              onClick={() => setOpen(false)}
            >
              Features
            </a>
            <a
              href="#how"
              className="px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800"
              onClick={() => setOpen(false)}
            >
              How it works
            </a>
            <a
              href="#ai"
              className="px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800"
              onClick={() => setOpen(false)}
            >
              AI
            </a>
            <a
              href="#roles"
              className="px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800"
              onClick={() => setOpen(false)}
            >
              For Responders
            </a>
            <a
              href="#contact"
              className="px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800"
              onClick={() => setOpen(false)}
            >
              Contact
            </a>
          </div>
        )}
      </nav>
    );
  }

  // ------------- Authenticated nav -------------
  const isAgency = [
    "responder",
    "admin",
    "police",
    "fire",
    "municipality",
    "ngo",
    "hospital",
  ].includes(user.role);
  const isVolunteer = user.role === "volunteer";
  const isAdmin = user.role === "admin";

  const roleLabel = user.role.replace("_", " ");

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-ink-200/60 dark:border-ink-800/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-3">
        <Link
          to="/app"
          className="flex items-center gap-2.5 font-extrabold shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-lg shadow-brand-600/25 ring-1 ring-inset ring-white/20">
            <Shield size={18} />
          </div>
          <span className="hidden md:block tracking-tight text-ink-900 dark:text-white">
            {t("brand") || "Aapat Setu"}
          </span>
        </Link>

        {/* Primary desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5 ml-2 overflow-x-auto">
          {isAgency ? (
            <>
              <NavLink to="/app/command" end className={linkCls}>
                <Target size={15} /> Command
              </NavLink>
              <NavLink to="/app/incidents" className={linkCls}>
                <ClipboardList size={15} /> Incidents
              </NavLink>
              <NavLink to="/app/map" className={linkCls}>
                <MapPin size={15} /> Map
              </NavLink>
              <NavLink to="/app/tasks" className={linkCls}>
                <AlertTriangle size={15} /> Tasks
              </NavLink>
              {["ngo", "responder", "admin", "municipality"].includes(
                user.role,
              ) && (
                <NavLink to="/app/resources" className={linkCls}>
                  <Package size={15} /> Resources
                </NavLink>
              )}
              {(isAdmin || user.role === "responder") && (
                <NavLink to="/app/analytics" className={linkCls}>
                  <BarChart3 size={15} /> Analytics
                </NavLink>
              )}
              {isAdmin && (
                <NavLink to="/app/admin" className={linkCls}>
                  <LayoutDashboard size={15} /> Admin
                </NavLink>
              )}
            </>
          ) : isVolunteer ? (
            <>
              <NavLink to="/app/home" end className={linkCls}>
                <Home size={15} /> Home
              </NavLink>
              <NavLink to="/app/tasks" className={linkCls}>
                <AlertTriangle size={15} /> Tasks
              </NavLink>
              <NavLink to="/app/map" className={linkCls}>
                <MapPin size={15} /> Map
              </NavLink>
              <NavLink to="/app/report" className={linkCls}>
                <Megaphone size={15} /> Report
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/app/home" end className={linkCls}>
                <Home size={15} /> Home
              </NavLink>
              <NavLink to="/app/report" className={linkCls}>
                <Megaphone size={15} /> Report
              </NavLink>
              <NavLink to="/app/map" className={linkCls}>
                <MapPin size={15} /> Map
              </NavLink>
              <NavLink to="/app/alerts" className={linkCls}>
                <Megaphone size={15} /> Alerts
              </NavLink>
              <NavLink to="/app/knowledge" className={linkCls}>
                <BookOpen size={15} /> Safety
              </NavLink>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            to="/app/notifications"
            className="relative h-10 w-10 rounded-xl grid place-items-center text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-ink-950 animate-pulse-slow" />
          </Link>
          <IconButton
            title={i18n.language === "en" ? "नेपाली" : "English"}
            onClick={toggleLang}
          >
            <Globe size={18} />
          </IconButton>
          <IconButton
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            onClick={toggle}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>

          <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-ink-200 dark:border-ink-800">
            <Avatar name={user.name} size={32} color="brand" />
            <div className="leading-tight">
              <div className="text-xs font-semibold text-ink-900 dark:text-white max-w-[120px] truncate">
                {user.name}
              </div>
              <Badge
                color="brand"
                className="capitalize !py-0 !px-1.5 !text-[10px]"
              >
                {roleLabel}
              </Badge>
            </div>
          </div>

          <IconButton
            title="Sign out"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut size={18} />
          </IconButton>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden h-10 w-10 rounded-xl grid place-items-center text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
            aria-label="menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-ink-200/60 dark:border-ink-800 bg-white/95 dark:bg-ink-950/95 backdrop-blur px-4 py-3 flex flex-col gap-1">
          {isAgency ? (
            <>
              <NavLink
                to="/app/command"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <Target size={15} /> Command
              </NavLink>
              <NavLink
                to="/app/incidents"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <ClipboardList size={15} /> Incidents
              </NavLink>
              <NavLink
                to="/app/map"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <MapPin size={15} /> Map
              </NavLink>
              <NavLink
                to="/app/tasks"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <AlertTriangle size={15} /> Tasks
              </NavLink>
              {["ngo", "responder", "admin", "municipality"].includes(
                user.role,
              ) && (
                <NavLink
                  to="/app/resources"
                  onClick={() => setOpen(false)}
                  className={linkCls}
                >
                  <Package size={15} /> Resources
                </NavLink>
              )}
              {(isAdmin || user.role === "responder") && (
                <NavLink
                  to="/app/analytics"
                  onClick={() => setOpen(false)}
                  className={linkCls}
                >
                  <BarChart3 size={15} /> Analytics
                </NavLink>
              )}
              {isAdmin && (
                <NavLink
                  to="/app/admin"
                  onClick={() => setOpen(false)}
                  className={linkCls}
                >
                  <LayoutDashboard size={15} /> Admin
                </NavLink>
              )}
            </>
          ) : isVolunteer ? (
            <>
              <NavLink
                to="/app/home"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <Home size={15} /> Home
              </NavLink>
              <NavLink
                to="/app/tasks"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <AlertTriangle size={15} /> Tasks
              </NavLink>
              <NavLink
                to="/app/map"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <MapPin size={15} /> Map
              </NavLink>
              <NavLink
                to="/app/report"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <Megaphone size={15} /> Report
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/app/home"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <Home size={15} /> Home
              </NavLink>
              <NavLink
                to="/app/report"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <Megaphone size={15} /> Report
              </NavLink>
              <NavLink
                to="/app/map"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <MapPin size={15} /> Map
              </NavLink>
              <NavLink
                to="/app/alerts"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <Megaphone size={15} /> Alerts
              </NavLink>
              <NavLink
                to="/app/knowledge"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <BookOpen size={15} /> Safety
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
