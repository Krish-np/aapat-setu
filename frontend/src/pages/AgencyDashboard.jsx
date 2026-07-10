import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import {
  Card,
  StatCard,
  Button,
  Badge,
  Skeleton,
  EmptyState,
} from '../components/ui'
import Map from '../components/Map'
import { useAuth } from '../store/auth'
import RelativeTime from '../components/RelativeTime'
import { useTranslation } from 'react-i18next'
import { wsConnect } from '../lib/api'
import {
  Package,
  Users,
  AlertTriangle,
  HandHeart,
  TrendingUp,
  MapPin,
  Shield,
  Building2,
  Flame,
  Landmark,
  HeartPulse,
} from 'lucide-react'

// ---------- Role config ----------
const ROLE_CONFIG = {
  ngo: {
    title: 'Relief Coordination Center',
    accent: 'purple',
    icon: HandHeart,
    iconColor: 'text-purple-600 dark:text-purple-400',
    focus: ['shelter', 'food', 'water', 'medical', 'clothing'],
    help: 'Coordinate food, shelter, clothing, and supplies across agencies.',
    statDefs: [
      { key: 'active_requests', label: 'Active Requests', color: 'orange', icon: AlertTriangle },
      { key: 'food_deployed', label: 'Food Packs', color: 'amber', icon: Package },
      { key: 'shelter_used', label: 'Shelters Open', color: 'purple', icon: Building2 },
      { key: 'vols', label: 'Volunteers Active', color: 'green', icon: Users },
    ],
  },
  hospital: {
    title: 'Hospital Command',
    accent: 'pink',
    icon: HeartPulse,
    iconColor: 'text-pink-600 dark:text-pink-400',
    focus: ['medical', 'accident', 'building_collapse'],
    help: 'Manage incoming patients, beds, ICU, and blood supply.',
    statDefs: [
      { key: 'incoming', label: 'Incoming Patients', color: 'red', icon: AlertTriangle },
      { key: 'beds', label: 'Available Beds', color: 'green', icon: Shield },
      { key: 'icu', label: 'ICU Free', color: 'blue', icon: HeartPulse },
      { key: 'blood', label: 'Blood Units', color: 'red', icon: HeartPulse },
    ],
  },
  police: {
    title: 'Police Command',
    accent: 'slate',
    icon: Users,
    iconColor: 'text-blue-600 dark:text-blue-400',
    focus: ['accident', 'missing_person', 'crowd', 'security'],
    help: 'Manage missing persons, crowd control, road blocks and security.',
    statDefs: [
      { key: 'active', label: 'Active Cases', color: 'slate', icon: Shield },
      { key: 'missing', label: 'Missing Persons', color: 'orange', icon: Users },
      { key: 'blocks', label: 'Road Blocks', color: 'amber', icon: AlertTriangle },
      { key: 'units', label: 'Units Available', color: 'green', icon: Shield },
    ],
  },
  fire: {
    title: 'Fire Department Command',
    accent: 'orange',
    icon: Flame,
    iconColor: 'text-orange-600 dark:text-orange-400',
    focus: ['fire', 'forest_fire', 'building_collapse'],
    help: 'Manage fire trucks, water resources, and active fire incidents.',
    statDefs: [
      { key: 'fires', label: 'Active Fires', color: 'red', icon: Flame },
      { key: 'trucks', label: 'Trucks Available', color: 'orange', icon: Flame },
      { key: 'water', label: 'Water Tankers', color: 'blue', icon: Package },
      { key: 'crews', label: 'Crews on Duty', color: 'green', icon: Users },
    ],
  },
  municipality: {
    title: 'Municipality Command',
    accent: 'indigo',
    icon: Landmark,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    focus: ['storm', 'power_failure', 'water_issue', 'flood'],
    help: 'City-wide monitoring and civic resource deployment.',
    statDefs: [
      { key: 'total', label: 'Total Incidents', color: 'indigo', icon: AlertTriangle },
      { key: 'crews', label: 'Crews Deployed', color: 'blue', icon: Users },
      { key: 'alerts', label: 'Alerts Sent', color: 'amber', icon: TrendingUp },
      { key: 'power', label: 'Power Issues', color: 'yellow', icon: AlertTriangle },
    ],
  },
  responder: {
    title: 'Emergency Response Command',
    accent: 'brand',
    icon: AlertTriangle,
    iconColor: 'text-brand-600 dark:text-brand-400',
    focus: [],
    help: 'Central command for all live incidents and resource coordination.',
    statDefs: [
      { key: 'total', label: 'All Incidents', color: 'brand', icon: AlertTriangle },
      { key: 'critical', label: 'Critical', color: 'red', icon: AlertTriangle },
      { key: 'active', label: 'In Progress', color: 'orange', icon: TrendingUp },
      { key: 'resolved', label: 'Resolved', color: 'green', icon: Shield },
    ],
  },
  admin: {
    title: 'System Administration',
    accent: 'slate',
    icon: Shield,
    iconColor: 'text-ink-700 dark:text-ink-200',
    focus: [],
    help: 'System-wide monitoring, users, and AI predictions.',
    statDefs: [
      { key: 'users', label: 'Total Users', color: 'blue', icon: Users },
      { key: 'incs', label: 'Incidents', color: 'brand', icon: AlertTriangle },
      { key: 'active', label: 'Active Now', color: 'green', icon: TrendingUp },
      { key: 'res', label: 'Resources', color: 'amber', icon: Package },
    ],
  },
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCard key={i} loading label="" value="" />)}
      </div>
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-ink-200/60 dark:border-ink-800 flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-none" />
        </Card>
        <Card className="space-y-3">
          <Skeleton className="h-5 w-36" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

export default function AgencyDashboard() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.ngo
  const Icon = cfg.icon

  // Role → which incident types belong to this department (for scoping cards).
  // Departments only see incidents matching their focus; responder/admin see all.
  const roleScoped = ['responder', 'admin'].includes(user.role)

  // Only responder + admin + volunteer can *create* incident reports via UI.
  // Fire, police, municipality, hospital, ngo manage incoming feeds only.
  const canReport = ['responder', 'admin'].includes(user.role)

  const [incs, setIncs] = useState([])
  const [pois, setPois] = useState([])
  const [resources, setResources] = useState([])
  const [stats, setStats] = useState(null)
  const [predict, setPredict] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    let active = true
    setLoading(true)
    Promise.all([
      api.get('/api/incidents'),
      api.get('/api/incidents/pois/all'),
      api.get('/api/resources'),
      api.get('/api/incidents/stats/summary'),
      api.get('/api/admin/predict').catch(() => ({ data: null })),
    ])
      .then(([i, p, r, s, pr]) => {
        if (!active) return
        setIncs(i.data)
        setPois(p.data)
        setResources(r.data)
        setStats(s.data)
        setPredict(pr.data)
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  useEffect(() => {
    const cancel = load()
    // Refresh KPIs live when incidents/updates come over WS
    const ws = wsConnect((msg) => {
      if (['incident_created', 'incident_updated', 'task_updated'].includes(msg.event)) {
        load()
      }
    })
    return () => {
      cancel()
      ws.close()
    }
  }, [load])

  if (loading) return <DashboardSkeleton />

  const active = incs.filter((i) => !['resolved', 'rejected'].includes(i.status))
  const critical = active.filter((i) => i.ai_severity === 'critical')
  const relevantFocus =
    cfg.focus.length === 0
      ? active
      : active.filter(
          (i) =>
            cfg.focus.some((f) => i.incident_type?.includes(f)) ||
            (i.ai_required_resources || []).some((r) =>
              cfg.focus.some((f) => r.includes(f)),
            ),
        )

  const demoStats = {
    ngo: {
      active_requests: relevantFocus.length,
      food_deployed: 150,
      shelter_used: 45,
      vols: 23,
    },
    hospital: {
      incoming: critical.filter(
        (c) => c.incident_type === 'medical' || c.incident_type === 'accident',
      ).length,
      beds: 25,
      icu: 8,
      blood: 40,
    },
    police: {
      active: relevantFocus.length,
      missing: active.filter((a) => a.incident_type === 'missing_person').length || 1,
      blocks: 2,
      units: 12,
    },
    fire: {
      fires: active.filter(
        (a) => a.incident_type === 'fire' || a.incident_type === 'forest_fire',
      ).length,
      trucks: 4,
      water: 2,
      crews: 18,
    },
    municipality: {
      total: incs.length,
      crews: 8,
      alerts: 3,
      power: active.filter((a) => a.incident_type === 'power_failure').length,
    },
    responder: {
      total: stats?.total || incs.length,
      critical: critical.length,
      active: active.length,
      resolved: stats?.by_status?.resolved || 0,
    },
    admin: { users: 10, incs: incs.length, active: active.length, res: resources.length },
  }[user.role] || {}

  // Role-title map (i18n-aware)
  const roleTitle = {
    ngo: t('dashboard.relief_center'),
    hospital: t('dashboard.hospital_cmd'),
    police: t('dashboard.police_cmd'),
    fire: t('dashboard.fire_cmd'),
    municipality: t('dashboard.muni_cmd'),
    responder: t('dashboard.responder_cmd'),
    admin: t('dashboard.admin_panel'),
  }[user.role] || cfg.title
  const roleHelp = {
    ngo: t('dashboard.relief_help'),
    hospital: t('dashboard.hospital_help'),
    police: t('dashboard.police_help'),
    fire: t('dashboard.fire_help'),
    municipality: t('dashboard.muni_help'),
    responder: t('dashboard.responder_help'),
    admin: t('dashboard.admin_help'),
  }[user.role] || cfg.help

  // On the map, show ALL active pins for situational awareness,
  // but in the "Relevant Incidents" sidebar card, scope to department focus.
  const mapIncidents = active
  const sidebarIncidents = roleScoped ? active : relevantFocus

  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-ink-100 dark:bg-ink-800 grid place-items-center shrink-0">
            <Icon size={24} className={cfg.iconColor} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white break-words">
              {roleTitle}
            </h1>
            <p className="text-ink-500 dark:text-ink-400 text-sm mt-0.5 leading-relaxed">
              <span className="live-dot inline-block mr-2 align-middle" />
              {roleHelp}
            </p>
          </div>
        </div>
        {canReport && (
          <Link to="/app/report">
            <Button>
              <AlertTriangle size={16} /> {t('nav.report')}
            </Button>
          </Link>
        )}
      </div>

      {/* Critical banner — count reflects currently unresolved criticals, updates live via ws refresh */}
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
              <p className="text-sm text-ink-600 dark:text-ink-300 mt-1 line-clamp-2 leading-relaxed break-words">
                {critical.slice(0, 2).map((c) => c.ai_summary || c.description || c.incident_type).filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cfg.statDefs.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={demoStats[s.key] ?? 0}
            color={s.color}
            icon={<s.icon size={18} />}
          />
        ))}
      </div>

      {predict?.advisory && (
        <Card className="!border-l-4 !border-l-blue-500">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div className="min-w-0">
              <div className="font-bold flex items-center gap-2 text-ink-900 dark:text-white">
{t('incident.ai_prediction', 'AI Prediction')} <Badge color="purple">AI</Badge>
              </div>
              <p className="text-sm text-ink-700 dark:text-ink-300 mt-1 leading-relaxed">
                {predict.advisory}
              </p>
              {predict.hotspot_type && predict.hotspot_type !== 'none' && (
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-2">
                  {t('incident.trend_label', 'Trend')}:{' '}
                  <b className="capitalize">{t(`incident_types.${predict.hotspot_type}`, predict.hotspot_type)}</b> {t('incident.trend_incidents', 'incidents are')} {predict.trend} (
                  {predict.hotspot_count} {t('incident.in_last_24h', 'in last 24h')})
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-ink-200/60 dark:border-ink-800 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-ink-900 dark:text-white">
              <MapPin size={18} className="text-brand-600" /> {t('dashboard.situational_map')}
            </h3>
            <Link
              to="/app/map"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline whitespace-nowrap"
            >
              {t('app.fullscreen')}
            </Link>
          </div>
          <Map incidents={mapIncidents} pois={pois} height={500} selectable />
        </Card>

        <Card>
          <h3 className="font-bold mb-3 flex items-center gap-2 text-ink-900 dark:text-white">
            <AlertTriangle size={18} className="text-brand-600" /> {roleScoped ? t('common.active') + ' ' + t('nav.incidents') : t('dashboard.relevant_incidents')}
          </h3>
          {sidebarIncidents.length === 0 ? (
            <EmptyState
              icon={<Shield size={28} />}
              title={t('dashboard.all_clear')}
              description={roleScoped ? t('app.no_incidents') : t('dashboard.no_focus_incidents')}
            />
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 -mr-1">
              {sidebarIncidents.slice(0, 10).map((i) => (
                <Link
                  key={i.id}
                  to={`/app/incidents/${i.id}`}
                  className="block p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/60 transition group"
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <strong className="text-sm capitalize text-ink-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition break-words">
{t(`incident_types.${i.incident_type}`, (i.incident_type || '').replaceAll('_', ' '))}
                    </strong>
                    <RelativeTime ts={i.created_at} className="text-[11px] text-ink-400 whitespace-nowrap flex-shrink-0 tabular-nums" />
                  </div>
                  <p className="text-xs text-ink-500 dark:text-ink-400 line-clamp-3 leading-relaxed break-words">
                    {i.ai_summary || i.description || '—'}
                  </p>
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {(i.ai_required_resources || []).slice(0, 3).map((r) => (
                      <Badge key={r} color="blue">
                        {r.replaceAll('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
