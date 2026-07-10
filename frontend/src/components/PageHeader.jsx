import React from 'react'
import { motion } from 'framer-motion'

/**
 * PageHeader — Phoenix-style page title block
 *  - Title + subtitle + optional right-side actions
 *  - Used instead of scattered BackButton + h1 + p markup.
 *  - Renders a subtle back arrow when `back` is true (or a custom onBack).
 */
export default function PageHeader({ title, subtitle, icon: Icon, actions, back = false, onBack, iconColor = 'text-brand-500' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-5 md:mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3"
    >
      <div className="min-w-0">
        <h1 className="text-[22px] md:text-[26px] font-extrabold tracking-tight text-ink-900 dark:text-white flex items-center gap-2 break-words leading-tight">
          {Icon && <Icon className={iconColor} size={24}/>}
          <span>{title}</span>
        </h1>
        {subtitle && (
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1.5 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
    </motion.div>
  )
}
