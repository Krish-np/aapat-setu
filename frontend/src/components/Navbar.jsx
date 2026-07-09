import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../store/theme'
import { useAuth } from '../store/auth'
import { Button } from './ui'
import { Sun, Moon, Globe, LogOut, Shield, Bell, BookOpen, Package, BarChart3 } from 'lucide-react'

const linkCls = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
    isActive
      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
      : 'text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-ink-800'
  }`

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { theme, toggle } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')

  if (!user) {
    return (
      <nav className="sticky top-0 z-50 glass-strong border-b border-ink-200/60 dark:border-ink-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-lg shadow-brand-600/30"><Shield size={20}/></div>
            <span className="hidden sm:block">{t('brand')}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggleLang} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-ink-100 dark:hover:bg-ink-800"><Globe size={18}/></button>
            <button onClick={toggle} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-ink-100 dark:hover:bg-ink-800">{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
            <Button size="sm" onClick={()=>navigate('/app/login')}>{t('nav.signin')}</Button>
          </div>
        </div>
      </nav>
    )
  }

  const isAgency = ['responder','admin','police','fire','municipality','ngo','hospital'].includes(user.role)
  const initials = user.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-ink-200/60 dark:border-ink-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
        <Link to="/app" className="flex items-center gap-2 font-extrabold">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-lg shadow-brand-600/30"><Shield size={20}/></div>
          <span className="hidden md:block">{t('brand')}</span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto flex-1 -mx-1 px-1">
          {isAgency ? (
            <>
              <NavLink to="/app/command" end className={linkCls}>🎯 Command</NavLink>
              <NavLink to="/app/incidents" className={linkCls}>📋 Incidents</NavLink>
              <NavLink to="/app/map" className={linkCls}>🗺️ Map</NavLink>
              {['ngo','responder','admin','municipality'].includes(user.role) && <NavLink to="/app/resources" className={linkCls}><Package size={14} className="inline -mt-0.5"/> Resources</NavLink>}
              {(user.role==='admin'||user.role==='responder') && <NavLink to="/app/analytics" className={linkCls}><BarChart3 size={14} className="inline -mt-0.5"/> Analytics</NavLink>}
              {user.role==='volunteer' && <NavLink to="/app/tasks" className={linkCls}>🤝 Tasks</NavLink>}
            </>
          ) : user.role === 'volunteer' ? (
            <>
              <NavLink to="/app/home" end className={linkCls}>🏠 Home</NavLink>
              <NavLink to="/app/tasks" className={linkCls}>🤝 Tasks</NavLink>
              <NavLink to="/app/map" className={linkCls}>🗺️ Map</NavLink>
              <NavLink to="/app/report" className={linkCls}>🚨 Report</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/app/home" end className={linkCls}>🏠 Home</NavLink>
              <NavLink to="/app/report" className={linkCls}>🚨 Report</NavLink>
              <NavLink to="/app/map" className={linkCls}>🗺️ Map</NavLink>
              <NavLink to="/app/alerts" className={linkCls}>📢 Alerts</NavLink>
              <NavLink to="/app/knowledge" className={linkCls}><BookOpen size={14} className="inline -mt-0.5"/> Safety</NavLink>
            </>
          )}
          <NavLink to="/app/alerts" className={linkCls}>📢</NavLink>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/app/notifications" className="w-9 h-9 rounded-lg grid place-items-center hover:bg-ink-100 dark:hover:bg-ink-800 relative">
            <Bell size={18}/>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/>
          </Link>
          <button onClick={toggleLang} title="Language" className="w-9 h-9 rounded-lg grid place-items-center hover:bg-ink-100 dark:hover:bg-ink-800">
            <Globe size={18}/>
          </button>
          <button onClick={toggle} title={theme==='dark'?'Light mode':'Dark mode'} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-ink-100 dark:hover:bg-ink-800">
            {theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}
          </button>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-100 dark:bg-ink-800">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white grid place-items-center text-xs font-bold">{initials}</div>
            <div className="text-xs font-semibold capitalize">{user.role}</div>
          </div>
          <button onClick={()=>{logout();navigate('/')}} className="w-9 h-9 rounded-lg grid place-items-center hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400"><LogOut size={18}/></button>
        </div>
      </div>
    </nav>
  )
}
