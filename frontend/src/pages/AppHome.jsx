import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import { Card, StatCard, Button, Badge, priorityBadge, statusBadge } from '../components/ui'
import Map from '../components/Map'
import { useAuth } from '../store/auth'
import { timeAgo } from '../lib/helpers'
import { AlertTriangle, Clock, CheckCircle2, Activity, Users, Radio, Shield, Flame, Building2, HandHeart, Hospital, Landmark } from 'lucide-react'

function QuickAction({ icon:Icon, label, to, color }) {
  return (
    <Link to={to}>
      <Card className="h-full hover:border-brand-500/50 hover:shadow-lg transition-all">
        <div className={`w-10 h-10 rounded-xl grid place-items-center mb-3 bg-${color}-100 dark:bg-${color}-500/15 text-${color}-600 dark:text-${color}-400`}>
          <Icon size={22}/>
        </div>
        <div className="font-bold text-sm">{label}</div>
      </Card>
    </Link>
  )
}

export default function AppHome() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [stats, setStats] = useState(null)
  const [pois, setPois] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/incidents'),
      api.get('/api/incidents/stats/summary'),
      api.get('/api/incidents/pois/all'),
    ]).then(([i,s,p])=>{
      setIncidents(i.data); setStats(s.data); setPois(p.data); setLoading(false)
    })
  }, [])

  if (loading) return <div className="grid place-items-center min-h-[40vh] text-ink-400">Loading…</div>

  const critical = incidents.filter(i => i.ai_severity === 'critical' && i.status !== 'resolved')
  const active = incidents.filter(i => !['resolved','rejected'].includes(i.status))
  const mine = incidents.filter(i => i.reporter_id === user.id)

  const roleWelcome = {
    citizen: "Here's your safety overview",
    volunteer: "Thank you for helping — here are missions near you",
    responder: "Command center online — stay alert for new incidents",
    hospital: "Emergency coordination for your facility",
    police: "Police command overview",
    fire: "Fire brigade dispatch overview",
    ngo: "Relief coordination center",
    municipality: "City-wide emergency status",
    admin: "System administration",
  }[user.role]

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">
            Namaste, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
            <span className="inline-flex items-center gap-2 mr-2"><span className="live-dot"/> Live</span>
            {roleWelcome}
          </p>
        </div>
        <Link to="/app/report"><Button size="lg"><AlertTriangle size={18}/> {t('hero.cta_report')}</Button></Link>
      </div>

      {critical.length > 0 && (
        <Card className="!bg-gradient-to-r from-red-50 to-amber-50 dark:!from-red-500/10 dark:!to-amber-500/5 !border-red-200 dark:!border-red-500/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 text-white grid place-items-center flex-shrink-0"><AlertTriangle size={20}/></div>
            <div className="flex-1">
              <div className="font-bold text-red-700 dark:text-red-400">⚠️ {critical.length} critical incident{critical.length>1?'s':''} require immediate attention</div>
              <div className="text-sm text-ink-600 dark:text-ink-300 mt-1 line-clamp-2">{critical.slice(0,2).map(c => c.ai_summary).join(' · ')}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active" value={active.length} color="orange" sub="Currently in progress"/>
        <StatCard label="Critical" value={critical.length} color="red" sub="Need attention now"/>
        <StatCard label="Resolved" value={stats?.by_status?.resolved || 0} color="green" sub="Completed"/>
        <StatCard label="Total" value={stats?.total || 0} color="blue" sub="All incidents"/>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <QuickAction icon={AlertTriangle} label="Report Emergency" to="/app/report" color="red"/>
        <QuickAction icon={Activity} label="Live Map" to="/app/map" color="blue"/>
        {(user.role==='volunteer'||user.role==='responder'||user.role==='admin')&&<QuickAction icon={Users} label="Tasks" to="/app/tasks" color="emerald"/>}
        <QuickAction icon={Radio} label="Alerts" to="/app/alerts" color="amber"/>
        {(user.role==='responder'||user.role==='municipality'||user.role==='admin')&&<QuickAction icon={BarIcon3} label="Analytics" to="/app/analytics" color="purple"/>}
        {user.role==='citizen'&&<QuickAction icon={Clock} label="My Reports" to="/app/map" color="indigo"/>}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-ink-200/60 dark:border-ink-800 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">🗺️ Live Situation Map</h3>
            <Link to="/app/map" className="text-xs font-semibold text-brand-600 hover:underline">Open fullscreen →</Link>
          </div>
          <Map incidents={active} pois={pois} height={500} zoom={13} radiusKm={0.5}/>
          <div className="px-5 py-3 border-t border-ink-200/60 dark:border-ink-800 flex gap-4 flex-wrap text-xs text-ink-500">
            <Legend color="#dc2626" label="Critical"/>
            <Legend color="#f97316" label="High"/>
            <Legend color="#f59e0b" label="Moderate"/>
            <Legend color="#10b981" label="Low"/>
            <Legend color="#ec4899" label="Hospital"/>
            <Legend color="#f97316" label="Fire"/>
            <Legend color="#64748b" label="Police"/>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="font-bold mb-3 flex items-center gap-2"><Radio className="text-brand-600" size={18}/> Recent Activity</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {incidents.slice(0,8).map(inc => {
                const pb = priorityBadge(inc.ai_severity||inc.severity);
                const sb = statusBadge(inc.status);
                return (
                  <Link key={inc.id} to={`/app/incidents/${inc.id}`} className="block p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/60 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="capitalize text-sm">{inc.incident_type.replace('_',' ')}</strong>
                        <Badge color={pb.color}>{pb.label}</Badge>
                      </div>
                      <span className="text-[10px] text-ink-400 whitespace-nowrap">{timeAgo(inc.created_at)}</span>
                    </div>
                    <div className="text-xs text-ink-500 dark:text-ink-400 line-clamp-2 mb-2">{inc.ai_summary}</div>
                    <Badge color={sb.color}>{sb.label}</Badge>
                  </Link>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function BarIcon3(props){return <svg {...props} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18M7 16v-6M12 16V8M17 16v-4"/></svg>}
function Legend({ color, label }) {
  return <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{background:color}}/> {label}</span>
}
