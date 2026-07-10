import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../store/theme'
import { useAuth } from '../store/auth'
import { Button, IconButton } from './ui'
import {
  Sun,
  Moon,
  Shield,
  Menu,
  X,
  AlertTriangle,
  Sparkles,
  Users,
  MapPin,
  LifeBuoy,
  Phone,
} from 'lucide-react'

/* Public (landing-page only) navbar.
   Authenticated navigation lives in Sidebar.jsx. */

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { theme, toggle } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')

  // Authenticated state: sidebar handles everything; render nothing here.
  if (user) return null

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-ink-200/60 dark:border-ink-800/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-lg shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-lg shadow-brand-600/25 ring-1 ring-inset ring-white/20">
            <Shield size={18} />
          </div>
          <span className="hidden sm:block tracking-tight">
            <span className="text-ink-900 dark:text-white">
              {t('brand') || 'Aapat Setu'}
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          <a href="#features" className="h-9 px-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition">
            <Sparkles size={15} /> Features
          </a>
          <a href="#how" className="h-9 px-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition">
            <LifeBuoy size={15} /> How it works
          </a>
          <a href="#ai" className="h-9 px-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition">
            <Sparkles size={15} /> AI
          </a>
          <a href="#roles" className="h-9 px-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition">
            <Users size={15} /> For Responders
          </a>
          <a href="#map" className="h-9 px-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition">
            <MapPin size={15} /> Live Map
          </a>
          <a href="#contact" className="h-9 px-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition">
            <Phone size={15} /> Contact
          </a>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Language EN/ने pill */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            onClick={toggleLang}
            title={i18n.language === 'en' ? 'Switch to Nepali / नेपालीमा स्विच' : 'Switch to English'}
            className="h-9 rounded-xl bg-ink-100 dark:bg-ink-800 p-1 flex items-center text-[11px] font-bold transition hover:bg-ink-200 dark:hover:bg-ink-700 cursor-pointer"
          >
            <span className={'px-2 py-1 rounded-lg transition ' + (i18n.language !== 'ne' ? 'bg-white dark:bg-ink-950 shadow-sm text-brand-600 dark:text-brand-300' : 'text-ink-500')}>EN</span>
            <span className={'px-2 py-1 rounded-lg transition ' + (i18n.language === 'ne' ? 'bg-white dark:bg-ink-950 shadow-sm text-brand-600 dark:text-brand-300' : 'text-ink-500')}>ने</span>
          </motion.button>
          <IconButton
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            onClick={toggle}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          <Button size="sm" onClick={() => navigate('/app/login')}>
            {t('nav.signin') || 'Sign in'}
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-ink-200/60 dark:border-ink-800 bg-white/95 dark:bg-ink-950/95 backdrop-blur px-4 py-3 flex flex-col gap-1">
          <a href="#features" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-2"><Sparkles size={15} /> Features</a>
          <a href="#how" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-2"><LifeBuoy size={15} /> How it works</a>
          <a href="#ai" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-2"><Sparkles size={15} /> AI</a>
          <a href="#roles" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-2"><Users size={15} /> For Responders</a>
          <a href="#map" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-2"><MapPin size={15} /> Live Map</a>
          <a href="#contact" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-2"><Phone size={15} /> Contact</a>
        </div>
      )}
    </nav>
  )
}
