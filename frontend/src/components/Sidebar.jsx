import React from 'react'
import { motion } from 'framer-motion'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { Avatar, IconButton } from './ui'
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
  Target,
  LayoutDashboard,
  Sun,
  Moon,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useTheme } from '../store/theme'
import { useTranslation } from 'react-i18next'

/* --------------------------------------------------------------
   Sidebar — Phoenix-style app navigation.
   - Fixed desktop / slide-drawer mobile
   - Uppercase section headers: OVERVIEW · OPERATIONS · RESOURCES · INSIGHTS · SAFETY
   - Active item: bg-brand-50 + left accent bar
----------------------------------------------------------------*/

const SECTIONS = {
  overview: 'Overview',
  operations: 'Operations',
  resources: 'Resources',
  insights: 'Insights',
  safety: 'Safety',
}

function NavItem({ to, icon: Icon, label, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-lg h-9 px-3 text-[13px] font-medium transition-all select-none',
          'active:scale-[0.98]',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
            : 'text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800/70 hover:text-ink-900 dark:hover:text-white',
          collapsed ? 'justify-center px-0 w-9 mx-auto' : '',
        ].join(' ')
      }
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-active-bar"
              className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-brand-600 dark:bg-brand-400"
            />
          )}
          <Icon size={17} className="shrink-0" strokeWidth={2}/>
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  )
}

function NavSection({ label, children, collapsed }) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <div className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
          {label}
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

  const isAgency = ['responder', 'admin', 'police', 'fire', 'municipality', 'ngo', 'hospital'].includes(user.role)
  const isVolunteer = user.role === 'volunteer'
  const isCitizen = user.role === 'citizen'
  const isAdmin = user.role === 'admin'
  const isMunicipality = user.role === 'municipality'
  const roleLabel = (user.role || '').replaceAll('_', ' ')

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden" onClick={onCloseMobile}/>
      )}

      <aside
        className={[
          'fixed md:sticky top-0 left-0 z-40 h-screen shrink-0',
          'bg-white dark:bg-ink-950',
          'border-r border-ink-200/80 dark:border-ink-800/80',
          'flex flex-col transition-[width,transform] duration-200 ease-out',
          collapsed ? 'w-16' : 'w-64',
          // Mobile slide drawer
          'max-md:w-72 max-md:shadow-2xl max-md:transition-transform',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-ink-200/70 dark:border-ink-800/70 shrink-0">
          <Link to="/app" className="flex items-center gap-2.5 min-w-0" onClick={onCloseMobile}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-md shadow-brand-600/25 shrink-0">
              <Shield size={18}/>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-extrabold text-ink-900 dark:text-white tracking-tight truncate">
                  {t('brand')}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 -mt-0.5">
                  {t('brand_sub')}
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
          <NavSection label={t('nav.overview')} collapsed={collapsed}>
            {(isCitizen || isVolunteer) && (
              <NavItem to="/app/home" icon={Home} label={t('nav.home')} collapsed={collapsed} onClick={onCloseMobile}/>
            )}
            {isAgency && (
              <NavItem to="/app/command" icon={Target} label={t('nav.command')} collapsed={collapsed} onClick={onCloseMobile}/>
            )}
            {isAdmin && (
              <NavItem to="/app/admin" icon={LayoutDashboard} label={t('nav.admin')} collapsed={collapsed} onClick={onCloseMobile}/>
            )}
          </NavSection>

          <NavSection label={t('nav.response')} collapsed={collapsed}>
            <NavItem to="/app/incidents" icon={ClipboardList} label={t('nav.incidents')} collapsed={collapsed} onClick={onCloseMobile}/>
            <NavItem to="/app/map" icon={MapPin} label={t('nav.map')} collapsed={collapsed} onClick={onCloseMobile}/>
            {isCitizen && (
              <NavItem to="/app/report" icon={AlertTriangle} label={t('nav.report')} collapsed={collapsed} onClick={onCloseMobile}/>
            )}
            {isCitizen && (
              <NavItem to="/app/my-reports" icon={ClipboardList} label={t('app.my_reports')} collapsed={collapsed} onClick={onCloseMobile}/>
            )}
            {!isCitizen && (
              <NavItem to="/app/tasks" icon={Megaphone} label={t('nav.tasks')} collapsed={collapsed} onClick={onCloseMobile}/>
            )}
            <NavItem to="/app/alerts" icon={Megaphone} label={t('nav.alerts')} collapsed={collapsed} onClick={onCloseMobile}/>
          </NavSection>

          {(isAgency || isVolunteer) && (
            <NavSection label={t('nav.resources')} collapsed={collapsed}>
              <NavItem to="/app/resources" icon={Package} label={t('nav.resources')} collapsed={collapsed} onClick={onCloseMobile}/>
              {(isMunicipality || isAdmin || user.role === 'responder') && (
                <NavItem to="/app/crews" icon={Users} label={t('nav.crews')} collapsed={collapsed} onClick={onCloseMobile}/>
              )}
            </NavSection>
          )}

          {(isAdmin || user.role === 'responder' || isMunicipality) && (
            <NavSection label={t('nav.insights')} collapsed={collapsed}>
              <NavItem to="/app/analytics" icon={BarChart3} label={t('nav.analytics')} collapsed={collapsed} onClick={onCloseMobile}/>
            </NavSection>
          )}

          <NavSection label={t('nav.safety')} collapsed={collapsed}>
            <NavItem to="/app/knowledge" icon={BookOpen} label={t('nav.knowledge')} collapsed={collapsed} onClick={onCloseMobile}/>
          </NavSection>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-ink-200/70 dark:border-ink-800/70 shrink-0 space-y-1">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1 py-1">
              <motion.button
                whileTap={{ scale:0.92 }}
                onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')}
                title={i18n.language === 'en' ? 'Switch to Nepali' : 'Switch to English'}
                className="h-9 w-9 rounded-lg bg-ink-50 dark:bg-ink-800 grid place-items-center text-[11px] font-bold hover:bg-ink-100 dark:hover:bg-ink-700 text-brand-600 dark:text-brand-300 cursor-pointer"
              >
                {i18n.language === 'ne' ? 'ने' : 'EN'}
              </motion.button>
              <IconButton title={theme === 'dark' ? t('nav.light_mode') : t('nav.dark_mode')} onClick={toggle}>
                {theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}
              </IconButton>
              <IconButton title={t('nav.logout')} onClick={() => { logout(); navigate('/') }}
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                <LogOut size={16}/>
              </IconButton>
              <div className="w-6 h-px bg-ink-200 dark:bg-ink-800 my-0.5"/>
              <IconButton title={t('sidebar.expand')} onClick={onToggle}>
                <PanelLeftOpen size={17}/>
              </IconButton>
            </div>
          ) : (
            <>
              {/* Controls row */}
              <div className="flex items-center gap-1 px-1">
                <motion.button
                  whileTap={{ scale:0.94 }}
                  onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')}
                  title={i18n.language === 'en' ? 'Switch to Nepali' : 'Switch to English'}
                  className="h-9 rounded-lg bg-ink-50 dark:bg-ink-800 px-1 flex items-center text-[11px] font-bold hover:bg-ink-100 dark:hover:bg-ink-700 cursor-pointer"
                >
                  <span className={'px-2 py-1 rounded-md transition ' + (i18n.language !== 'ne' ? 'bg-white dark:bg-ink-950 shadow-sm text-brand-600 dark:text-brand-300' : 'text-ink-400')}>EN</span>
                  <span className={'px-2 py-1 rounded-md transition ' + (i18n.language === 'ne' ? 'bg-white dark:bg-ink-950 shadow-sm text-brand-600 dark:text-brand-300' : 'text-ink-400')}>ने</span>
                </motion.button>
                <IconButton title={theme === 'dark' ? t('nav.light_mode') : t('nav.dark_mode')} onClick={toggle}>
                  {theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}
                </IconButton>
                <IconButton title={t('sidebar.collapse')} onClick={onToggle} className="ml-auto">
                  <PanelLeftClose size={17}/>
                </IconButton>
              </div>

              {/* User card */}
              <div className="flex items-center gap-2 rounded-lg p-2 mt-1 bg-ink-50 dark:bg-ink-900/60">
                <Avatar name={user.name} size={32} color="brand"/>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-ink-900 dark:text-white truncate leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-ink-500 capitalize truncate">{roleLabel}</div>
                </div>
                <IconButton title={t('nav.logout')} onClick={() => { logout(); navigate('/') }}
                  className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                  <LogOut size={15}/>
                </IconButton>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
