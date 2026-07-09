import React from 'react'
import clsx from 'clsx'

export const Card = ({ children, className = '', glass = true, hover = false, ...rest }) => (
  <div
    className={clsx(
      'rounded-2xl p-5 shadow-sm transition-all',
      glass ? 'glass-strong' : 'bg-white dark:bg-ink-900 border border-ink-200/60 dark:border-ink-800',
      hover && 'hover:shadow-xl hover:-translate-y-0.5 cursor-pointer',
      className,
    )}
    {...rest}
  >
    {children}
  </div>
)

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...rest }) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/25',
    secondary: 'bg-ink-100 hover:bg-ink-200 text-ink-900 dark:bg-ink-800 dark:hover:bg-ink-700 dark:text-white',
    ghost: 'border border-ink-200 dark:border-ink-700 hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  }
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export const Input = (props) => (
  <input
    {...props}
    className={clsx(
      'w-full rounded-xl bg-white/70 dark:bg-ink-800/70 border border-ink-200 dark:border-ink-700',
      'px-4 py-2.5 text-sm outline-none transition-colors',
      'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 placeholder:text-ink-400',
      props.className,
    )}
  />
)

export const Select = (props) => (
  <select
    {...props}
    className={clsx(
      'w-full rounded-xl bg-white/70 dark:bg-ink-800/70 border border-ink-200 dark:border-ink-700',
      'px-4 py-2.5 text-sm outline-none transition-colors',
      'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
      props.className,
    )}
  />
)

export const Textarea = (props) => (
  <textarea
    {...props}
    className={clsx(
      'w-full rounded-xl bg-white/70 dark:bg-ink-800/70 border border-ink-200 dark:border-ink-700',
      'px-4 py-3 text-sm outline-none transition-colors resize-none',
      'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 placeholder:text-ink-400',
      props.className,
    )}
  />
)

export const Badge = ({ children, color = 'slate', className = '', pulse }) => {
  const colors = {
    slate: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
    pink: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
  }
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
      colors[color],
      pulse && 'relative',
      className,
    )}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping-slow" />}
      {children}
    </span>
  )
}

export const priorityBadge = (p) => ({
  critical: { label: 'Critical', color: 'red' },
  high: { label: 'High', color: 'orange' },
  moderate: { label: 'Moderate', color: 'amber' },
  low: { label: 'Low', color: 'green' },
}[p] || { label: p || 'Unknown', color: 'slate' })

export const statusBadge = (s) => ({
  submitted: { label: 'Submitted', color: 'slate' },
  ai_processing: { label: 'AI Processing', color: 'purple' },
  verified: { label: 'Verified', color: 'blue' },
  assigned: { label: 'Assigned', color: 'indigo' },
  dispatched: { label: 'Dispatched', color: 'purple' },
  en_route: { label: 'En Route', color: 'amber' },
  on_site: { label: 'On Scene', color: 'orange' },
  rescue_ongoing: { label: 'Rescue Ongoing', color: 'orange' },
  resolved: { label: 'Resolved', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
}[s] || { label: s, color: 'slate' })

export const StatCard = ({ label, value, sub, color = 'slate', icon }) => {
  const textColors = {
    red: 'text-red-600 dark:text-red-400',
    orange: 'text-orange-600 dark:text-orange-400',
    amber: 'text-amber-600 dark:text-amber-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    slate: 'text-ink-900 dark:text-ink-100',
  }
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">{label}</div>
          <div className={clsx('text-3xl font-extrabold mt-1', textColors[color])}>{value}</div>
          {sub && <div className="text-xs text-ink-500 mt-1">{sub}</div>}
        </div>
        {icon && <div className={clsx('w-10 h-10 rounded-xl grid place-items-center', `bg-${color}-100 dark:bg-${color}-500/10`, textColors[color])}>{icon}</div>}
      </div>
    </Card>
  )
}

export const SectionHeading = ({ eyebrow, title, sub }) => (
  <div className="text-center max-w-3xl mx-auto mb-12">
    {eyebrow && <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 mb-3">{eyebrow}</div>}
    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white">{title}</h2>
    {sub && <p className="mt-4 text-ink-500 dark:text-ink-400 text-lg">{sub}</p>}
  </div>
)

export function Spinner({ size = 20 }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
