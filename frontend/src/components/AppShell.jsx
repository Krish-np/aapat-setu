import React, { useState } from 'react'
import Sidebar from './Sidebar'
import { IconButton } from './ui'
import { Menu } from 'lucide-react'
import Navbar from './Navbar'
import { useAuth } from '../store/auth'

/* -------------------------------------------------------------
   AppShell wraps the app pages.
   - Public pages (landing) get the Navbar (top-only).
   - Authenticated pages get Sidebar (left nav) + scrollable main.
   The Navbar for authenticated pages is hidden (sidebar has
   all the controls: theme/lang/notifications/logout), but on
   mobile the top bar shows a hamburger to open the sidebar.
-------------------------------------------------------------- */
export default function AppShell({ children }) {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  if (!user) {
    // Public view — simple top navbar
    return (
      <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-900 dark:text-ink-100">
        <Navbar />
        <main className="fade-in">{children}</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50/60 dark:bg-[#0b1220] text-ink-900 dark:text-ink-100 flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 h-14 px-4 flex items-center gap-3 bg-white/90 dark:bg-ink-950/90 backdrop-blur border-b border-ink-200/60 dark:border-ink-800/60">
        <button
          className="h-9 w-9 rounded-lg grid place-items-center hover:bg-ink-100 dark:hover:bg-ink-800"
          onClick={() => {
            // On mobile, toggle by removing collapsed (since sidebar hides off-canvas)
            const sb = document.querySelector('aside')
            const bd = document.getElementById('sidebar-backdrop')
            if (sb) sb.classList.toggle('max-md:translate-x-0')
            if (bd) bd.style.display = bd.style.display === 'block' ? 'none' : 'block'
          }}
        >
          <Menu size={18} />
        </button>
        <div className="font-extrabold tracking-tight">Aapat Setu</div>
      </div>

      <div className="flex-1 min-w-0">
        <main className="fade-in pb-20">{children}</main>
      </div>
    </div>
  )
}
