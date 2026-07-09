import React from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { Avatar, Badge, IconButton } from './ui'
import {
  Shield,
  Home,
  AlertTriangle,
  MapPin,
  ClipboardList,
  Package,
  Users,
  BarChart3,
  Megaphone,
  BookOpen,
  Bell,
  LogOut,
  Target,
  LayoutDashboard,
  Sun,
  Moon,
  Globe,
  ChevronLeft,
} from 'lucide-react'
import { useTheme } from '../store/theme'
import { useTranslation } from 'react-i18next'

/* --------------------------------------------------------------
   Sidebar — app navigation for authenticated users.
   Public landing page still uses the top-only navbar.
---------------------------------------------------------------*/

function NavItem({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-xl h-10 px-3 text-sm font-medium transition-all',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 shadow-sm'
            : 'text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-white',
          collapsed ? 'justify-center px-0 w-10' : '',
        ].join(' ')
      }
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}

function NavSection({ title, children, collapsed }) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <div className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  if (!user) return null

  const isAgency = ['responder', 'admin', 'police', 'fire', 'municipality', 'ngo', 'hospital'].includes(
    user.role,
  )
  const isVolunteer = user.role === 'volunteer'
  const isCitizen = user.role === 'citizen'
  const isAdmin = user.role === 'admin'
  const isMunicipality = user.role === 'municipality'

  const roleLabel = user.role.replace('_', ' ')

  return (
    <>
      {/* Sidebar */}
      <aside
        className={[
          'fixed md:sticky top-0 left-0 z-40 h-screen shrink-0',
          'bg-white/90 dark:bg-ink-950/80 backdrop-blur-2xl',
          'border-r border-ink-200/70 dark:border-ink-800/80',
          'flex flex-col transition-all duration-200',
          collapsed ? 'w-[72px]' : 'w-64',
          // Mobile: slide drawer
          'max-md:-translate-x-full max-md:shadow-2xl max-md:w-72',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-ink-200/60 dark:border-ink-800/60 shrink-0">
          <Link to="/app" className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-lg shadow-brand-600/25 ring-1 ring-inset ring-white/20 shrink-0">
              <Shield size={18} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-extrabold text-ink-900 dark:text-white tracking-tight truncate">
                  {t('brand') || 'Aapat Setu'}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 -mt-0.5">
                  Emergency Coordination
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <NavSection title="Overview" collapsed={collapsed}>
            {isCitizen && <NavItem to="/app/home" icon={Home} label="Home" collapsed={collapsed} />}
            {isVolunteer && <NavItem to="/app/home" icon={Home} label="Home" collapsed={collapsed} />}
            {isAgency && <NavItem to="/app/command" icon={Target} label="Command" collapsed={collapsed} />}
            {isAdmin && <NavItem to="/app/admin" icon={LayoutDashboard} label="Admin" collapsed={collapsed} />}
          </NavSection>

          <NavSection title="Response" collapsed={collapsed}>
            <NavItem to="/app/incidents" icon={ClipboardList} label="Incidents" collapsed={collapsed} />
            <NavItem to="/app/map" icon={MapPin} label="Live Map" collapsed={collapsed} />
            <NavItem to="/app/report" icon={AlertTriangle} label="Report" collapsed={collapsed} />
            <NavItem to="/app/tasks" icon={Megaphone} label="Tasks" collapsed={collapsed} />
            <NavItem to="/app/alerts" icon={Megaphone} label="Alerts" collapsed={collapsed} />
          </NavSection>

          {(isAgency || isVolunteer) && (
            <NavSection title="Resources" collapsed={collapsed}>
              <NavItem to="/app/resources" icon={Package} label="Resources" collapsed={collapsed} />
              {(isMunicipality || isAdmin || user.role === 'responder') && (
                <NavItem to="/app/crews" icon={Users} label="Crews" collapsed={collapsed} />
              )}
            </NavSection>
          )}

          {(isAdmin || user.role === 'responder' || isMunicipality) && (
            <NavSection title="Insights" collapsed={collapsed}>
              <NavItem to="/app/analytics" icon={BarChart3} label="Analytics" collapsed={collapsed} />
            </NavSection>
          )}

          <NavSection title="Safety" collapsed={collapsed}>
            <NavItem to="/app/knowledge" icon={BookOpen} label="First Aid" collapsed={collapsed} />
          </NavSection>
        </div>

        {/* Footer: theme/lang/notifications/user */}
        <div className="p-3 border-t border-ink-200/60 dark:border-ink-800/60 space-y-2 shrink-0">
          <Link
            to="/app/notifications"
            className={[
              'flex items-center gap-3 h-10 rounded-xl px-3 text-sm font-medium transition',
              'text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800',
              collapsed ? 'justify-center px-0 w-10 mx-auto' : '',
            ].join(' ')}
            title={collapsed ? 'Notifications' : undefined}
          >
            <div className="relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-ink-950 animate-pulse-slow" />
            </div>
            {!collapsed && <span>Notifications</span>}
          </Link>

          <div className={['flex items-center gap-1', collapsed ? 'justify-center' : ''].join(' ')}>
            <IconButton title={i18n.language === 'en' ? 'नेपाली' : 'English'} onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')}>
              <Globe size={18} />
            </IconButton>
            <IconButton title={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={toggle}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
            {!collapsed && (
              <IconButton
                title="Collapse sidebar"
                onClick={onToggle}
                className="ml-auto"
              >
                <ChevronLeft size={18} />
              </IconButton>
            )}
          </div>

          {/* User card */}
          <div
            className={[
              'flex items-center gap-2 rounded-xl p-2',
              'bg-ink-50 dark:bg-ink-900/60',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
            title={collapsed ? user.name : undefined}
          >
            <Avatar name={user.name} size={34} color="brand" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-ink-900 dark:text-white truncate">
                  {user.name}
                </div>
                <Badge color="brand" className="capitalize !py-0 !px-1.5 !text-[9px]">
                  {roleLabel}
                </Badge>
              </div>
            )}
            {!collapsed && (
              <IconButton
                size="sm"
                title="Sign out"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <LogOut size={16} />
              </IconButton>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      <div
        className={[
          'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden',
        ].join(' ')}
        onClick={onToggle}
        style={{ display: 'none' }}
        id="sidebar-backdrop"
      />
    </>
  )
}
