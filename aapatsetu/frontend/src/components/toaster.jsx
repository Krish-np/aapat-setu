import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const ToastCtx = createContext(() => {})
let _push = () => {}

export function Toaster() {
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, msg, kind }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])
  useEffect(() => { _push = push }, [push])
  const icons = {
    ok: <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20}/>,
    err: <AlertTriangle className="text-red-500 flex-shrink-0" size={20}/>,
    alert: <AlertTriangle className="text-amber-500 flex-shrink-0" size={20}/>,
    info: <Info className="text-blue-500 flex-shrink-0" size={20}/>,
  }
  const borders = { ok:'border-emerald-500/40', err:'border-red-500/40', alert:'border-amber-500/40', info:'border-blue-500/40' }
  return (
    <ToastCtx.Provider value={push}>
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)]">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 120, opacity: 0 }}
              className={`glass-strong border-l-4 ${borders[t.kind]} rounded-xl p-3 shadow-xl flex items-start gap-3`}>
              {icons[t.kind]}
              <div className="flex-1 text-sm leading-relaxed">{t.msg}</div>
              <button onClick={() => setToasts(s => s.filter(x=>x.id!==t.id))} className="text-ink-400 hover:text-ink-700 dark:hover:text-white">
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
