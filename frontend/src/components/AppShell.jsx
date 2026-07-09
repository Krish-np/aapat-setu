import React, { useState } from 'react'
import Sidebar from './Sidebar'
import { IconButton } from './ui'
import { Menu, X } from 'lucide-react'
import Navbar from './Navbar'
import { useAuth } from '../store/auth'
import { useTranslation } from 'react-i18next'

/* -------------------------------------------------------------
   AppShell wraps the app pages.
   - Public pages (landing) get the Navbar (top-only).
   - Authenticated pages get Sidebar (left nav) + scrollable main.
-------------------------------------------------------------- */
export default function AppShell({ children }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-900 dark:text-ink-100">
        <Navbar />
        <main className="fade-in">{children}</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50/60 dark:bg-[#0b1220] text-ink-900 dark:text-ink-100 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-20 h-14 px-4 flex items-center gap-3 bg-white/90 dark:bg-ink-950/90 backdrop-blur border-b border-ink-200/60 dark:border-ink-800/60">
        <button
          className="h-9 w-9 rounded-lg grid place-items-center hover:bg-ink-100 dark:hover:bg-ink-800"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div className="font-extrabold tracking-tight truncate">{t('brand')}</div>
      </div>

      <div className="flex-1 min-w-0">
        <main className="fade-in pb-20 md:pb-8">{children}</main>
      </div>
    </div>
  )
}
