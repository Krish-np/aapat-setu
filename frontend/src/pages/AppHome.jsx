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
import { timeAgo } from '../lib/helpers'
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
  { icon: AlertTriangle, label: 'Report Emergency', to: '/app/report', color: 'red' },
  { icon: MapPin, label: 'Live Map', to: '/app/map', color: 'blue' },
  { icon: Users, label: 'Tasks', to: '/app/tasks', color: 'green', roles: ['volunteer', 'responder', 'admin'] },
  { icon: Radio, label: 'Alerts', to: '/app/alerts', color: 'amber' },
  { icon: BarChart3, label: 'Analytics', to: '/app/analytics', color: 'purple', roles: ['responder', 'municipality', 'admin'] },
  { icon: Clock, label: 'My Reports', to: '/app/map', color: 'indigo', roles: ['citizen'] },
]

const ACTION_COLORS = {
  red:    'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 ring-red-100 dark:ring-red-500/20',
  blue:   'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 ring-blue-100 dark:ring-blue-500/20',
  green:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-500/20',
  amber:  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 ring-amber-100 dark:ring-amber-500/20',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 ring-purple-100 dark:ring-purple-500/20',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 ring-indigo-100 dark:ring-indigo-500/20',
}

function QuickAction({ icon: Icon, label, to, color }) {
  return (
    <Link to={to}>
      <Card hover className="h-full">
        <div className={`w-11 h-11 rounded-xl grid place-items-center mb-3 ring-1 ring-inset ${ACTION_COLORS[color]}`}>
          <Icon size={20} />
        </div>
        <div className="font-semibold text-sm text-ink-900 dark:text-white">{label}</div>
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
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
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
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            Namaste, {user.name.split(' ')[0]} <span role="img" aria-label="namaste">🙏</span>
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1 flex items-center gap-3">
            <span className="inline-flex items-center gap-2">
              <span className="live-dot" /> Live
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
              <div className="font-bold text-red-700 dark:text-red-300">
                {critical.length} critical incident{critical.length > 1 ? 's' : ''} require immediate attention
              </div>
              <p className="text-sm text-ink-600 dark:text-ink-300 mt-1 line-clamp-2">
                {critical
                  .slice(0, 2)
                  .map((c) => c.ai_summary)
                  .join(' · ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active" value={active.length} color="orange" sub="In progress" icon={<Activity size={18} />} />
        <StatCard label="Critical" value={critical.length} color="red" sub="Need attention now" icon={<AlertTriangle size={18} />} />
        <StatCard label="Resolved" value={stats?.by_status?.resolved || 0} color="green" sub="Completed" icon={<Shield size={18} />} />
        <StatCard label="Total" value={stats?.total || 0} color="blue" sub="All incidents" icon={<Radio size={18} />} />
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
              <MapPin size={18} className="text-brand-600" /> Live Situation Map
            </h3>
            <Link
              to="/app/map"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Fullscreen →
            </Link>
          </div>
          <Map incidents={active} pois={pois} height={500} zoom={13} selectable />
          <div className="px-5 py-3 border-t border-ink-200/60 dark:border-ink-800 flex gap-4 flex-wrap text-xs">
            <Legend color="#dc2626" label="Critical" />
            <Legend color="#ea580c" label="High" />
            <Legend color="#d97706" label="Moderate" />
            <Legend color="#059669" label="Low" />
            <Legend color="#db2777" label="Hospital" />
            <Legend color="#dc2626" label="Fire" />
            <Legend color="#1d4ed8" label="Police" />
          </div>
        </Card>

        <Card>
          <h3 className="font-bold mb-4 flex items-center gap-2 text-ink-900 dark:text-white">
            <Radio className="text-brand-600" size={18} /> Recent Activity
          </h3>
          {incidents.length === 0 ? (
            <EmptyState
              icon={<Radio size={28} />}
              title="No activity yet"
              description="When incidents are reported, they will appear here in real time."
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
                          {inc.incident_type?.replaceAll('_', ' ')}
                        </strong>
                        <Badge color={pb.color}>{pb.label}</Badge>
                      </div>
                      <span className="text-[11px] text-ink-400 whitespace-nowrap">
                        {timeAgo(inc.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 dark:text-ink-400 line-clamp-2 mb-2 leading-relaxed">
                      {inc.ai_summary || inc.description}
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
