import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import {
  Card,
  StatCard,
  Button,
  Badge,
  Skeleton,
  priorityBadge,
  statusBadge,
  EmptyState,
} from '../components/ui'
import Map from '../components/Map'
import { useAuth } from '../store/auth'
import RelativeTime from '../components/RelativeTime'
import {
  AlertTriangle,
  Clock,
  Activity,
  Users,
  Radio,
  Shield,
  BarChart3,
  MapPin,
} from 'lucide-react'

const QUICK_ACTIONS = [
  { icon: AlertTriangle, labelKey: 'nav.report',    to: '/app/report',     color: 'red' },
  { icon: MapPin,        labelKey: 'nav.map',        to: '/app/map',        color: 'blue' },
  { icon: Users,         labelKey: 'nav.tasks',      to: '/app/tasks',      color: 'green',  roles: ['volunteer', 'responder', 'admin'] },
  { icon: Radio,         labelKey: 'nav.alerts',     to: '/app/alerts',     color: 'amber' },
  { icon: BarChart3,     labelKey: 'nav.analytics',  to: '/app/analytics',  color: 'purple', roles: ['responder', 'municipality', 'admin'] },
  { icon: Clock,         labelKey: 'app.my_reports', to: '/app/my-reports', color: 'indigo', roles: ['citizen'] },
]

const ACTION_COLORS = {
  red:    'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 ring-red-100 dark:ring-red-500/20',
  blue:   'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 ring-blue-100 dark:ring-blue-500/20',
  green:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-500/20',
  amber:  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 ring-amber-100 dark:ring-amber-500/20',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 ring-purple-100 dark:ring-purple-500/20',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 ring-indigo-100 dark:ring-indigo-500/20',
}

function QuickAction({ icon: Icon, labelKey, to, color }) {
  const { t } = useTranslation()
  return (
    <Link to={to}>
      <Card hover className="h-full">
        <div className={`w-11 h-11 rounded-xl grid place-items-center mb-3 ring-1 ring-inset ${ACTION_COLORS[color]}`}>
          <Icon size={20} />
        </div>
        <div className="font-semibold text-sm text-ink-900 dark:text-white">{t(labelKey)}</div>
      </Card>
    </Link>
  )
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-500 dark:text-ink-400">
      <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-ink-900" style={{ background: color }} />
      {label}
    </span>
  )
}

function HomeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCard key={i} loading label="" value="" />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="space-y-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-4 w-28" />
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-ink-200/60 dark:border-ink-800 flex items-center justify-between">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-none" />
        </Card>
        <Card className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function AppHome() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [stats, setStats] = useState(null)
  const [pois, setPois] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([
      api.get('/api/incidents'),
      api.get('/api/incidents/stats/summary'),
      api.get('/api/incidents/pois/all'),
    ])
      .then(([i, s, p]) => {
        if (!active) return
        setIncidents(i.data)
        setStats(s.data)
        setPois(p.data)
      })
      .catch((e) => setErr(e.message || 'Failed to load dashboard'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  if (loading) return <HomeSkeleton />

  const critical = incidents.filter(
    (i) => i.ai_severity === 'critical' && i.status !== 'resolved',
  )
  const active = incidents.filter((i) => !['resolved', 'rejected'].includes(i.status))
  const mine = incidents.filter((i) => i.reporter_id === user.id)

  const roleWelcome = {
    citizen: "Here's your safety overview",
    volunteer: 'Thank you for helping — missions near you',
    responder: 'Command center online — stay alert for new incidents',
    hospital: 'Emergency coordination for your facility',
    police: 'Police command overview',
    fire: 'Fire brigade dispatch overview',
    ngo: 'Relief coordination center',
    municipality: 'City-wide emergency status',
    admin: 'System administration',
  }[user.role]

  const actions = QUICK_ACTIONS.filter(
    (a) => !a.roles || a.roles.includes(user.role),
  )

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white break-words">
            {t('app.greeting_citizen')}, {user.name.split(' ')[0]} <span role="img" aria-label="namaste">🙏</span>
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1 flex items-center gap-3 flex-wrap break-words">
            <span className="inline-flex items-center gap-2">
              <span className="live-dot" /> {t('common.active')}
            </span>
            {roleWelcome}
          </p>
        </div>
        <Link to="/app/report">
          <Button size="lg">
            <AlertTriangle size={18} /> {t('hero.cta_report')}
          </Button>
        </Link>
      </div>

      {err && (
        <Card className="!bg-red-50 dark:!bg-red-500/10 !border-red-200 dark:!border-red-500/20 text-red-700 dark:text-red-300 text-sm">
          {err}
        </Card>
      )}

      {critical.length > 0 && (
        <Card className="!bg-gradient-to-r from-red-50 to-amber-50 dark:!from-red-500/10 dark:!to-amber-500/5 !border-red-200 dark:!border-red-500/20">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-500 text-white grid place-items-center shrink-0 shadow-md shadow-red-500/30">
              <AlertTriangle size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-red-700 dark:text-red-300 break-words">
                {critical.length} {t('dashboard.critical_banner')}
              </div>
              <p className="text-sm text-ink-600 dark:text-ink-300 mt-1 line-clamp-3 leading-relaxed break-words">
                {critical
                  .slice(0, 2)
                  .map((c) => c.ai_summary || c.description || c.incident_type)
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('common.active')} value={active.length} color="orange" sub={t('common.in_progress')} icon={<Activity size={18} />} />
        <StatCard label={t('common.critical')} value={critical.length} color="red" sub={t('common.need_attention')} icon={<AlertTriangle size={18} />} />
        <StatCard label={t('common.resolved')} value={stats?.by_status?.resolved || 0} color="green" sub={t('common.completed')} icon={<Shield size={18} />} />
        <StatCard label={t('analytics.total')} value={stats?.total || 0} color="blue" sub={t('common.all_incidents')} icon={<Radio size={18} />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((a) => (
          <QuickAction key={a.to} {...a} />
        ))}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-ink-200/60 dark:border-ink-800 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-ink-900 dark:text-white">
              <MapPin size={18} className="text-brand-600" /> {t('app.live_map')}
            </h3>
            <Link
              to="/app/map"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              {t('app.fullscreen')}
            </Link>
          </div>
          <Map incidents={active} pois={pois} height={500} zoom={13} selectable />
          <div className="px-5 py-3 border-t border-ink-200/60 dark:border-ink-800 flex gap-4 flex-wrap text-xs">
            <Legend color="#dc2626" label={t('priority.critical')} />
            <Legend color="#ea580c" label={t('priority.high')} />
            <Legend color="#d97706" label={t('priority.moderate')} />
            <Legend color="#059669" label={t('priority.low')} />
            <Legend color="#db2777" label={t('incident_types.medical')} />
            <Legend color="#dc2626" label={t('incident_types.fire')} />
            <Legend color="#1d4ed8" label={t('map.police')} />
          </div>
        </Card>

        <Card>
          <h3 className="font-bold mb-4 flex items-center gap-2 text-ink-900 dark:text-white">
            <Radio className="text-brand-600" size={18} /> {t('app.recent_activity')}
          </h3>
          {incidents.length === 0 ? (
            <EmptyState
              icon={<Radio size={28} />}
              title={t('incident.no_activity_yet')}
              description={t('incident.no_activity_desc')}
            />
          ) : (
            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1 -mr-1">
              {incidents.slice(0, 8).map((inc) => {
                const pb = priorityBadge(inc.ai_severity || inc.severity)
                const sb = statusBadge(inc.status)
                return (
                  <Link
                    key={inc.id}
                    to={`/app/incidents/${inc.id}`}
                    className="block p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/60 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="capitalize text-sm text-ink-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {t(`incident_types.${inc.incident_type}`, (inc.incident_type || '').replaceAll('_', ' '))}
                        </strong>
                        <Badge color={pb.color}>{pb.label}</Badge>
                      </div>
                      <RelativeTime ts={inc.created_at} className="text-[11px] text-ink-400 whitespace-nowrap tabular-nums" />
                    </div>
                    <p className="text-xs text-ink-500 dark:text-ink-400 line-clamp-3 mb-2 leading-relaxed break-words">
                      {inc.ai_summary || inc.description || '—'}
                    </p>
                    <Badge color={sb.color} dot>
                      {sb.label}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
