import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, AlertTriangle, Info, X, AlertOctagon, Loader2,
} from 'lucide-react'

const ToastCtx = createContext(() => {})
let _push = () => {}

// Dedupe: prevent the same message+kind from stacking within 1.5s
const _recent = new Map() // key -> timestamp

export function Toaster() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)
  const push = useCallback((msg, kind = 'ok') => {
    const key = `${kind}:${String(msg).slice(0,80)}`
    const now = Date.now()
    const last = _recent.get(key)
    if (last && now - last < 1500) return // suppress duplicate burst
    _recent.set(key, now)
    // Prune recent map
    if (_recent.size > 200) {
      for (const [k, ts] of _recent) { if (now - ts > 10000) _recent.delete(k) }
    }
    const id = ++idRef.current
    setToasts(t => [...t, { id, msg, kind }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  useEffect(() => { _push = push }, [push])

  const icons = {
    ok:     <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20}/>,
    success:<CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20}/>,
    err:    <AlertOctagon className="text-red-500 flex-shrink-0" size={20}/>,
    error:  <AlertOctagon className="text-red-500 flex-shrink-0" size={20}/>,
    alert:  <AlertTriangle className="text-amber-500 flex-shrink-0" size={20}/>,
    warn:   <AlertTriangle className="text-amber-500 flex-shrink-0" size={20}/>,
    info:   <Info className="text-blue-500 flex-shrink-0" size={20}/>,
    loading:<Loader2 className="text-brand-600 flex-shrink-0 animate-spin" size={20}/>,
  }
  const styles = {
    ok:     'border-emerald-500/40 bg-emerald-50/95 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200',
    success:'border-emerald-500/40 bg-emerald-50/95 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200',
    err:    'border-red-500/40 bg-red-50/95 dark:bg-red-500/10 dark:border-red-500/30 text-red-900 dark:text-red-200',
    error:  'border-red-500/40 bg-red-50/95 dark:bg-red-500/10 dark:border-red-500/30 text-red-900 dark:text-red-200',
    alert:  'border-amber-500/40 bg-amber-50/95 dark:bg-amber-500/10 dark:border-amber-500/30 text-amber-900 dark:text-amber-200',
    warn:   'border-amber-500/40 bg-amber-50/95 dark:bg-amber-500/10 dark:border-amber-500/30 text-amber-900 dark:text-amber-200',
    info:   'border-blue-500/40 bg-blue-50/95 dark:bg-blue-500/10 dark:border-blue-500/30 text-blue-900 dark:text-blue-200',
    loading:'border-brand-500/40 bg-white/95 dark:bg-ink-900/95 dark:border-brand-500/30 text-ink-900 dark:text-ink-100',
  }

  return (
    <ToastCtx.Provider value={push}>
      <div className="fixed top-[4.5rem] md:top-4 right-4 left-4 md:left-auto z-[9999] flex flex-col gap-2 max-w-sm md:w-auto">
        <AnimatePresence initial={false}>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ x: 80, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 120, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`glass-strong border-l-4 ${styles[t.kind] || styles.info} rounded-xl p-3 shadow-xl flex items-start gap-3 break-words`}
              role="status"
              aria-live="polite"
            >
              {icons[t.kind] || icons.info}
              <div className="flex-1 text-sm leading-relaxed break-words">{t.msg}</div>
              <button
                onClick={() => setToasts(s => s.filter(x => x.id !== t.id))}
                className="text-ink-400 hover:text-ink-700 dark:hover:text-white flex-shrink-0 -mt-0.5 -mr-0.5"
                aria-label="Close notification"
              >
                <X size={14}/>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

export const toast = (msg, kind) => _push(msg, kind)
export function useToast() { return useContext(ToastCtx) }
