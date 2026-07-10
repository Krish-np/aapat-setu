import React from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { IconButton, Input } from './ui'
import {
  Menu, X, Search, Bell, LogOut, User as UserIcon,
  Settings, Home,
} from 'lucide-react'
import Navbar from './Navbar'
import { useAuth } from '../store/auth'
import { useTranslation } from 'react-i18next'

/**
 * AppShell — Phoenix admin-template layout.
 *  - Fixed left Sidebar (desktop sticky / mobile slide drawer)
 *  - Desktop top bar: hamburger, breadcrumbs, search, bell, user menu
 *  - Mobile top bar: hamburger + brand + bell
 *  - Consistent 24/32px content padding via <main>
 */

const ROUTE_LABELS = {
  '/app/home':          { section: 'Overview',   label: 'Home' },
  '/app/command':       { section: 'Overview',   label: 'Command Center' },
  '/app/admin':         { section: 'Overview',   label: 'Super Admin' },
  '/app/incidents':     { section: 'Operations', label: 'Incidents' },
  '/app/report':        { section: 'Operations', label: 'Report Emergency' },
  '/app/map':           { section: 'Operations', label: 'Live Map' },
  '/app/tasks':         { section: 'Operations', label: 'Tasks' },
  '/app/alerts':        { section: 'Operations', label: 'Public Alerts' },
  '/app/resources':     { section: 'Resources',  label: 'Resources' },
  '/app/crews':         { section: 'Resources',  label: 'Crews' },
  '/app/analytics':     { section: 'Insights',   label: 'Analytics' },
  '/app/notifications': { section: 'Overview',   label: 'Notifications' },
  '/app/knowledge':     { section: 'Safety',     label: 'Safety Guide' },
}

function Breadcrumbs() {
  const { pathname } = useLocation()
  const c = ROUTE_LABELS[pathname]
  if (!c) return null
  return (
    <nav className="flex items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
      <Link to="/app/home" className="text-ink-400 hover:text-ink-700 dark:hover:text-white transition"><Home size={13}/></Link>
      <span className="text-ink-300">/</span>
      <span className="text-ink-400">{c.section}</span>
      <span className="text-ink-300">/</span>
      <span className="font-semibold text-ink-900 dark:text-white">{c.label}</span>
    </nav>
  )
}

function UserMenu({ user, logout }) {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    setTimeout(() => document.addEventListener('click', close, 0))
    return () => document.removeEventListener('click', close)
  }, [open])
  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <motion.button
        whileTap={{ scale:0.97 }}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-[11px] font-bold ring-2 ring-white dark:ring-ink-950 shrink-0">
          {(user.name||'U').slice(0,1).toUpperCase()}
        </div>
        <div className="hidden lg:block text-left leading-tight">
          <div className="text-xs font-semibold text-ink-900 dark:text-white max-w-[120px] truncate">{user.name}</div>
          <div className="text-[10px] text-ink-500 capitalize">{(user.role||'').replaceAll('_',' ')}</div>
        </div>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:-4, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-4, scale:0.98 }}
            transition={{ duration:.12 }}
            className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-ink-100 dark:border-ink-800">
              <div className="text-sm font-semibold text-ink-900 dark:text-white truncate">{user.name}</div>
              <div className="text-xs text-ink-500 truncate">{user.phone || user.email || ''}</div>
            </div>
            <button className="w-full px-3 py-2 text-left text-[13px] flex items-center gap-2 hover:bg-ink-50 dark:hover:bg-ink-800">
              <UserIcon size={14}/> Profile
            </button>
            <button className="w-full px-3 py-2 text-left text-[13px] flex items-center gap-2 hover:bg-ink-50 dark:hover:bg-ink-800">
              <Settings size={14}/> Settings
            </button>
            <div className="h-px bg-ink-100 dark:bg-ink-800"/>
            <button onClick={() => { logout(); setOpen(false) }}
              className="w-full px-3 py-2 text-left text-[13px] flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
              <LogOut size={14}/> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Need AnimatePresence import
import { AnimatePresence } from 'framer-motion'

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [searchQ, setSearchQ] = React.useState('')

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-900 dark:text-ink-100">
        <Navbar />
        <motion.main
          initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:.35, ease:[0.2,0.8,0.2,1] }}
        >
          {children}
        </motion.main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-[#0b1220] text-ink-900 dark:text-ink-100 flex">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 h-14 px-4 flex items-center gap-3 bg-white dark:bg-ink-950 border-b border-ink-200/70 dark:border-ink-800/70">
          <motion.button whileTap={{ scale:0.9 }}
            onClick={() => setMobileOpen(v => !v)}
            className="h-9 w-9 rounded-lg grid place-items-center hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Toggle menu">
            {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
          </motion.button>
          <div className="font-extrabold tracking-tight truncate">{t('brand')}</div>
          <div className="ml-auto flex items-center gap-1">
            <Link to="/app/notifications"><IconButton><Bell size={18}/></IconButton></Link>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden md:flex sticky top-0 z-20 h-14 items-center gap-4 px-6 bg-white dark:bg-ink-950 border-b border-ink-200/70 dark:border-ink-800/70">
          <motion.button whileTap={{ scale:0.9 }}
            onClick={() => setCollapsed(v => !v)}
            className="h-9 w-9 rounded-lg grid place-items-center text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-white"
            title={collapsed ? 'Expand' : 'Collapse'}>
            <Menu size={18}/>
          </motion.button>
          <Breadcrumbs/>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-60 lg:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
              <Input placeholder={t('common.search','Search…')} value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="pl-9 h-9 bg-ink-50 dark:bg-ink-900/60 border-transparent focus:bg-white dark:focus:bg-ink-900 rounded-lg"/>
            </div>
            <Link to="/app/notifications">
              <IconButton>
                <span className="relative">
                  <Bell size={17}/>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-ink-950"/>
                </span>
              </IconButton>
            </Link>
            <UserMenu user={user} logout={logout}/>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <motion.div
            key={typeof window !== 'undefined' ? window.location.pathname : 'app'}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            transition={{ duration:.25, ease:[0.2,0.8,0.2,1] }}
            className="p-4 md:p-6 lg:p-8 pb-20 md:pb-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
