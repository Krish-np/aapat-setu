import React from 'react'
import { motion } from 'framer-motion'
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
          'group flex items-center gap-3 rounded-xl h-10 px-3 text-sm font-medium transition-all select-none',
          'active:scale-[0.97]',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 shadow-sm'
            : 'text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-white hover:translate-x-0.5',
          collapsed ? 'justify-center px-0 w-10' : '',
        ].join(' ')
      }
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
          {!collapsed && <span className="truncate">{label}</span>}
          {isActive && !collapsed && (
            <motion.span layoutId="nav-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500"/>
          )}
        </>
      )}
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

export default function Sidebar({ collapsed, onToggle, mobileOpen = false, onCloseMobile }) {
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
          'bg-white/95 dark:bg-ink-950/90 backdrop-blur-2xl',
          'border-r border-ink-200/70 dark:border-ink-800/80',
          'flex flex-col transition-all duration-200',
          collapsed ? 'w-[72px]' : 'w-64',
          // Mobile: slide drawer — open when mobileOpen=true
          mobileOpen
            ? 'max-md:translate-x-0 max-md:shadow-2xl max-md:w-72'
            : 'max-md:-translate-x-full max-md:shadow-2xl max-md:w-72',
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
          <NavSection title={t('nav.overview')} collapsed={collapsed}>
            {(isCitizen || isVolunteer) && <NavItem to="/app/home" icon={Home} label={t('nav.home')} collapsed={collapsed} />}
            {isAgency && <NavItem to="/app/command" icon={Target} label={t('nav.command')} collapsed={collapsed} />}
            {isAdmin && <NavItem to="/app/admin" icon={LayoutDashboard} label={t('nav.admin')} collapsed={collapsed} />}
          </NavSection>

          <NavSection title={t('nav.response')} collapsed={collapsed}>
            <NavItem to="/app/incidents" icon={ClipboardList} label={t('nav.incidents')} collapsed={collapsed} />
            <NavItem to="/app/map" icon={MapPin} label={t('nav.map')} collapsed={collapsed} />
            {user.role === 'citizen' && <NavItem to="/app/report" icon={AlertTriangle} label={t('nav.report')} collapsed={collapsed} />}
            <NavItem to="/app/tasks" icon={Megaphone} label={t('nav.tasks')} collapsed={collapsed} />
            <NavItem to="/app/alerts" icon={Megaphone} label={t('nav.alerts')} collapsed={collapsed} />
          </NavSection>

          {(isAgency || isVolunteer) && (
            <NavSection title={t('nav.resources')} collapsed={collapsed}>
              <NavItem to="/app/resources" icon={Package} label={t('nav.resources')} collapsed={collapsed} />
              {(isMunicipality || isAdmin || user.role === 'responder') && (
                <NavItem to="/app/crews" icon={Users} label={t('nav.crews')} collapsed={collapsed} />
              )}
            </NavSection>
          )}

          {(isAdmin || user.role === 'responder' || isMunicipality) && (
            <NavSection title={t('nav.insights')} collapsed={collapsed}>
              <NavItem to="/app/analytics" icon={BarChart3} label={t('nav.analytics')} collapsed={collapsed} />
            </NavSection>
          )}

          <NavSection title={t('nav.safety')} collapsed={collapsed}>
            <NavItem to="/app/knowledge" icon={BookOpen} label={t('nav.knowledge')} collapsed={collapsed} />
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
            title={collapsed ? t('nav.notifications') : undefined}
          >
            <div className="relative flex-shrink-0">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-ink-950 animate-pulse-slow" />
            </div>
            {!collapsed && <span className="truncate">{t('nav.notifications')}</span>}
          </Link>

          <div className={['flex items-center gap-1', collapsed ? 'justify-center' : ''].join(' ')}>
            {/* Language pill toggle */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')}
              title={i18n.language === 'en' ? 'Switch to Nepali / नेपालीमा स्विच गर्नुहोस्' : 'Switch to English'}
              className="h-9 rounded-xl bg-ink-100 dark:bg-ink-800 p-1 flex items-center text-[11px] font-bold transition hover:bg-ink-200 dark:hover:bg-ink-700 shrink-0 cursor-pointer"
            >
              <span className={'px-2 py-1 rounded-lg transition ' + (i18n.language !== 'ne' ? 'bg-white dark:bg-ink-950 shadow-sm text-brand-600 dark:text-brand-300' : 'text-ink-500')}>EN</span>
              <span className={'px-2 py-1 rounded-lg transition ' + (i18n.language === 'ne' ? 'bg-white dark:bg-ink-950 shadow-sm text-brand-600 dark:text-brand-300' : 'text-ink-500')}>ने</span>
            </motion.button>
            <IconButton title={theme === 'dark' ? t('nav.light_mode') : t('nav.dark_mode')} onClick={toggle}>
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

      {/* Nav items close mobile drawer on click */}
      <div
        className="hidden"
        onClick={onCloseMobile}
        id="sidebar-mobile-close-trigger"
      />
    </>
  )
}
