import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

/* =========================================================
   Phoenix-inspired UI primitives for Aapat Setu
   - Soft shadows, rounded-xl/2xl, refined typography
   - Skeleton loaders, Spinner (spinner), proper Buttons/Cards
   - Works in both light and dark mode
   ========================================================= */

// ---------- Card ----------
export const Card = ({
  children,
  className = '',
  hover = false,
  padded = true,
  onClick,
  as: Tag = onClick ? 'button' : 'div',
  ...rest
}) => {
  const baseCls = clsx(
    'relative bg-white dark:bg-ink-900 text-left',
    'border border-ink-100 dark:border-ink-800/80',
    'rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200',
    padded && 'p-5 md:p-6',
    hover &&
      'hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.15)] hover:-translate-y-0.5 hover:border-ink-200 dark:hover:border-ink-700 cursor-pointer',
    onClick && 'cursor-pointer',
    className,
  )
  if (onClick) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type:'spring', stiffness:400, damping:25 }}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onClick(e)
          }
        }}
        className={baseCls}
        {...rest}
      >
        {children}
      </motion.div>
    )
  }
  return (
    <div className={baseCls} {...rest}>{children}</div>
  )
}

// ---------- Glass Card ----------
export const GlassCard = ({ children, className = '', ...rest }) => (
  <div
    className={clsx(
      'rounded-2xl p-5 md:p-6',
      'bg-white/65 dark:bg-ink-900/60',
      'backdrop-blur-2xl saturate-150',
      'border border-white/60 dark:border-white/10',
      'shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
      className,
    )}
    {...rest}
  >
    {children}
  </div>
)

// ---------- Button ----------
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...rest
}) => {
  const sizes = {
    xs: 'h-7 px-2.5 text-xs rounded-md gap-1',
    sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
    md: 'h-9 px-4 text-sm rounded-lg gap-2',
    lg: 'h-11 px-6 text-base rounded-lg gap-2',
    icon: 'h-9 w-9 rounded-lg grid place-items-center',
    iconSm: 'h-8 w-8 rounded-md grid place-items-center',
  }
  const variants = {
    primary:
      'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/20 active:shadow-none',
    secondary:
      'bg-white border border-ink-200 hover:bg-ink-50 text-ink-800 dark:bg-ink-900 dark:border-ink-700 dark:hover:bg-ink-800 dark:text-white shadow-sm',
    ghost:
      'bg-transparent hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-200',
    subtle:
      'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20',
    warning:
      'bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-sm shadow-amber-500/20',
    outline:
      'border border-brand-500/60 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 bg-transparent',
  }
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-semibold select-none',
        'transition-all duration-150 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ink-900',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner size={14} className="!border-white/30 !border-t-white" />}
      {children}
    </button>
  )
}

// ---------- Icon Button ----------
export const IconButton = ({ children, className = '', active = false, ...rest }) => (
  <button
    className={clsx(
      'h-9 w-9 rounded-lg grid place-items-center transition-colors',
      'text-ink-500 dark:text-ink-300',
      'hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-white',
      active && 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60',
      className,
    )}
    {...rest}
  >
    {children}
  </button>
)

// ---------- Input ----------
export const Input = React.forwardRef(function Input(
  { className = '', icon, ...props },
  ref,
) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        {...props}
        className={clsx(
          'w-full bg-white dark:bg-ink-900/70',
          'border border-ink-200 dark:border-ink-700',
          'rounded-xl px-4 py-2.5 text-sm',
          'placeholder:text-ink-400 text-ink-900 dark:text-white',
          'outline-none transition-all duration-150',
          'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
          icon && 'pl-10',
          className,
        )}
      />
    </div>
  )
})

// ---------- Select ----------
export const Select = React.forwardRef(function Select(
  { className = '', ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      {...props}
      className={clsx(
        'w-full bg-white dark:bg-ink-900/70 border border-ink-200 dark:border-ink-700',
        'rounded-xl px-4 py-2.5 text-sm outline-none transition-colors appearance-none',
        'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
        'bg-no-repeat bg-[right_0.75rem_center] pr-9',
        "[background-image:url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")]",
        className,
      )}
    />
  )
})

// ---------- Textarea ----------
export const Textarea = React.forwardRef(function Textarea(
  { className = '', ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      {...props}
      className={clsx(
        'w-full bg-white dark:bg-ink-900/70 border border-ink-200 dark:border-ink-700',
        'rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-y',
        'placeholder:text-ink-400',
        'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
        className,
      )}
    />
  )
})

// ---------- Badge ----------
export const Badge = ({ children, color = 'slate', className = '', pulse, dot }) => {
  const colors = {
    slate:
      'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-300 ring-1 ring-inset ring-ink-200 dark:ring-ink-700',
    red: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300 ring-1 ring-inset ring-red-200 dark:ring-red-500/20',
    orange:
      'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300 ring-1 ring-inset ring-orange-200 dark:ring-orange-500/20',
    amber:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-500/20',
    yellow:
      'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300 ring-1 ring-inset ring-yellow-200 dark:ring-yellow-500/20',
    green:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-500/20',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-200 dark:ring-blue-500/20',
    indigo:
      'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-200 dark:ring-indigo-500/20',
    purple:
      'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 ring-1 ring-inset ring-purple-200 dark:ring-purple-500/20',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300 ring-1 ring-inset ring-pink-200 dark:ring-pink-500/20',
    brand:
      'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 ring-1 ring-inset ring-brand-200 dark:ring-brand-500/20',
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        colors[color],
        className,
      )}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-slow" />}
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

// ---------- Helpers for priority/status ----------
export const priorityBadge = (p) =>
  ({
    critical: { label: 'Critical', color: 'red' },
    high: { label: 'High', color: 'orange' },
    moderate: { label: 'Moderate', color: 'amber' },
    low: { label: 'Low', color: 'green' },
  }[p] || { label: p || 'Unknown', color: 'slate' })

export const statusBadge = (s) =>
  ({
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
    claimed: { label: 'Claimed', color: 'blue' },
  }[s] || { label: s, color: 'slate' })

// ---------- Spinner ----------
export function Spinner({ size = 20, className = '' }) {
  return (
    <svg
      className={clsx('animate-spin', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

// A full-area spinner centered (good for page loading)
export function FullLoader({ label = 'Loading…' }) {
  return (
    <div className="min-h-[50vh] w-full grid place-items-center">
      <div className="flex flex-col items-center gap-3 text-ink-500 dark:text-ink-400">
        <Spinner size={32} className="text-brand-600 dark:text-brand-500" />
        {label && <div className="text-sm font-medium">{label}</div>}
      </div>
    </div>
  )
}

// Button-like inline loader for submit actions
export function MiniLoader({ className = '' }) {
  return (
    <span
      className={clsx(
        'inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin align-middle',
        className,
      )}
    />
  )
}

// ---------- Skeleton ----------
export function Skeleton({ className = '', rounded = 'md' }) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-ink-100 dark:bg-ink-800',
        rounded === 'full' && 'rounded-full',
        rounded === 'lg' && 'rounded-lg',
        rounded === 'xl' && 'rounded-xl',
        rounded === 'md' && 'rounded-md',
        rounded === 'circle' && 'rounded-full',
        className,
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 dark:before:via-white/10 before:to-transparent',
      )}
    />
  )
}

// Page-level skeleton grid — good for dashboards/tables/lists
export function SkeletonPage({ rows = 6, cards = 3 }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Card key={i} className="flex-1 min-w-[200px] space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
      <Card className="space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// Skeleton table
export function SkeletonTable({ cols = 4, rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 dark:border-ink-800">
      <div className="divide-y divide-ink-100 dark:divide-ink-800">
        <div className="flex gap-4 p-4 bg-ink-50/60 dark:bg-ink-900/40">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className={`h-3 ${i === 0 ? 'w-10' : 'flex-1'}`} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 p-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={`h-4 ${c === 0 ? 'w-10' : 'flex-1'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- StatCard ----------
export const StatCard = ({ label, value, sub, color = 'brand', icon, trend, loading }) => {
  const tones = {
    red: {
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-600 dark:text-red-400',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
    },
    brand: {
      bg: 'bg-brand-50 dark:bg-brand-500/10',
      text: 'text-brand-600 dark:text-brand-400',
    },
    slate: {
      bg: 'bg-ink-100 dark:bg-ink-800',
      text: 'text-ink-700 dark:text-ink-200',
    },
  }[color] || {
    bg: 'bg-brand-50 dark:bg-brand-500/10',
    text: 'text-brand-600 dark:text-brand-400',
  }

  if (loading) {
    return (
      <Card className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </Card>
    )
  }

  return (
    <Card hover className="group">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500 dark:text-ink-400">
            {label}
          </div>
          <div
            className={clsx(
              'text-3xl font-extrabold tracking-tight mt-1 tabular-nums',
              'text-ink-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors',
            )}
          >
            {value}
          </div>
          {(sub || trend) && (
            <div className="mt-1 flex items-center gap-2 text-xs">
              {trend && (
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 font-semibold',
                    trend > 0 ? 'text-emerald-600' : 'text-red-600',
                  )}
                >
                  {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
                </span>
              )}
              {sub && <span className="text-ink-500 dark:text-ink-400 truncate">{sub}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={clsx(
              'w-11 h-11 rounded-xl grid place-items-center shrink-0',
              tones.bg,
              tones.text,
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

// ---------- Section Heading ----------
export const SectionHeading = ({ eyebrow, title, sub, actions }) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
    <div className="max-w-3xl">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400 mb-2">
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
        {title}
      </h2>
      {sub && (
        <p className="mt-2 text-ink-500 dark:text-ink-400 text-base leading-relaxed">
          {sub}
        </p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
)

// ---------- Empty State ----------
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="py-14 flex flex-col items-center text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-ink-100 dark:bg-ink-800 text-ink-400 grid place-items-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-ink-900 dark:text-white">{title}</h3>
      {description && (
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ---------- Divider ----------
export const Divider = ({ className = '' }) => (
  <div className={clsx('h-px w-full bg-ink-200 dark:bg-ink-800', className)} />
)

// ---------- Avatar ----------
export function Avatar({ name = '', size = 36, src, color = 'brand' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const colorMap = {
    brand: 'from-brand-500 to-brand-700',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-fuchsia-600',
    green: 'from-emerald-500 to-teal-600',
    orange: 'from-orange-500 to-red-500',
  }
  return (
    <div
      className={clsx(
        'rounded-full bg-gradient-to-br text-white grid place-items-center font-bold shrink-0 select-none ring-2 ring-white dark:ring-ink-900',
        colorMap[color] || colorMap.brand,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  )
}

// ---------- Progress Bar ----------
export function Progress({ value = 0, color = 'brand', className = '' }) {
  const colors = {
    brand: 'bg-brand-500',
    red: 'bg-red-500',
    green: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
  }
  return (
    <div
      className={clsx(
        'h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800',
        className,
      )}
    >
      <div
        className={clsx('h-full rounded-full transition-all duration-500', colors[color])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}
