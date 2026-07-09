import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { Card, StatCard, Button, Badge } from '../components/ui'
import Map from '../components/Map'
import { useAuth } from '../store/auth'
import { timeAgo } from '../lib/helpers'
import { Package, Users, AlertTriangle, Clock, HandHeart, TrendingUp, CheckCircle2 } from 'lucide-react'

// Generic agency dashboard that adapts to NGO/Hospital/Police/Fire/Municipality
const ROLE_CONFIG = {
  ngo: {
    title: 'Relief Coordination Center',
    accent: 'purple',
    icon: HandHeart,
    focus: ['shelter','food','water','medical','clothing'],
    stats: [['Active Requests','active_requests','orange'],['Food Packs Deployed','food_deployed','amber'],['Shelters Used','shelter_used','purple'],['Volunteers Active','vols','green']],
    help: 'Coordinate food, shelter, clothing, and supplies.',
  },
  hospital: {
    title: 'Hospital Command',
    accent: 'pink',
    icon: Package,
    focus: ['medical','accident','building_collapse'],
    stats: [['Incoming Patients','incoming','red'],['Available Beds','beds','green'],['ICU Free','icu','blue'],['Blood Units','blood','red']],
    help: 'Manage incoming patients, beds, ICU, blood supply.',
  },
  police: {
    title: 'Police Command',
    accent: 'slate',
    icon: Users,
    focus: ['accident','missing_person','crowd','security'],
    stats: [['Active Cases','active','slate'],['Missing Persons','missing','orange'],['Road Blocks','blocks','amber'],['Units Available','units','green']],
    help: 'Manage missing persons, crowd control, road blocks, security.',
  },
  fire: {
    title: 'Fire Department Command',
    accent: 'orange',
    icon: AlertTriangle,
    focus: ['fire','forest_fire','building_collapse'],
    stats: [['Active Fires','fires','red'],['Trucks Available','trucks','orange'],['Water Tankers','water','blue'],['Crews on Duty','crews','green']],
    help: 'Manage fire trucks, water resources, active fires.',
  },
  municipality: {
    title: 'Municipality Command',
    accent: 'indigo',
    icon: Package,
    focus: ['storm','power_failure','water_issue','flood'],
    stats: [['Total Incidents','total','indigo'],['Crews Deployed','crews','blue'],['Alerts Sent','alerts','amber'],['Power Issues','power','yellow']],
    help: 'City-wide monitoring and civic resource deployment.',
  },
  admin: {
    title: 'System Administration',
    accent: 'slate',
    icon: Users,
    focus: [],
    stats: [['Total Users','users','blue'],['Total Incidents','incs','red'],['Active Now','active','green'],['Resources','res','amber']],
    help: 'System-wide management.',
  },
}

export default function AgencyDashboard() {
  const { user } = useAuth()
  const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.ngo
  const [incs, setIncs] = useState([])
  const [pois, setPois] = useState([])
  const [resources, setResources] = useState([])
  const [stats, setStats] = useState(null)
  const [predict, setPredict] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/incidents'),
      api.get('/api/incidents/pois/all'),
      api.get('/api/resources'),
      api.get('/api/incidents/stats/summary'),
      api.get('/api/admin/predict').catch(()=>({data:{}})),
    ]).then(([i,p,r,s,pr]) => {
      setIncs(i.data); setPois(p.data); setResources(r.data); setStats(s.data); setPredict(pr.data)
    })
  }, [])

  const active = incs.filter(i => !['resolved','rejected'].includes(i.status))
  const critical = active.filter(i => i.ai_severity === 'critical')
  const relevantFocus = active.filter(i => cfg.focus.some(f => i.incident_type.includes(f) || (i.ai_required_resources||[]).some(r=>r.includes(f))))

  // Generate demo stats numbers
  const demoStats = {
    ngo: { active_requests: relevantFocus.length, food_deployed: 150, shelter_used: 45, vols: 23 },
    hospital: { incoming: critical.filter(c=>c.incident_type==='medical'||c.incident_type==='accident').length, beds: 25, icu: 8, blood: 40 },
    police: { active: relevantFocus.length, missing: active.filter(a=>a.incident_type==='missing_person').length||1, blocks: 2, units: 12 },
    fire: { fires: active.filter(a=>a.incident_type==='fire'||a.incident_type==='forest_fire').length, trucks: 4, water: 2, crews: 18 },
    municipality: { total: incs.length, crews: 8, alerts: 3, power: active.filter(a=>a.incident_type==='power_failure').length },
    admin: { users: 10, incs: incs.length, active: active.length, res: resources.length },
  }[user.role] || {}

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <cfg.icon className={`text-${cfg.accent}-500`} size={26}/> {cfg.title}
          </h1>
          <p className="text-ink-500 text-sm mt-1">{cfg.help}</p>
        </div>
        <Link to="/app/report"><Button>+ Report Incident</Button></Link>
      </div>

      {critical.length > 0 && (
        <Card className="!bg-gradient-to-r from-red-50 to-amber-50 dark:!from-red-500/10 dark:!to-amber-500/5 !border-red-200 dark:!border-red-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5"/>
            <div>
              <div className="font-bold text-red-700 dark:text-red-400">⚠️ {critical.length} critical incident{critical.length>1?'s':''} need attention</div>
              <div className="text-sm text-ink-600 dark:text-ink-300 mt-1 line-clamp-2">{critical.slice(0,2).map(c=>c.ai_summary).join(' · ')}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cfg.stats.map(([label,k,color]) => (
          <StatCard key={k} label={label} value={demoStats[k] ?? 0} color={color}/>
        ))}
      </div>

      {predict?.advisory && (
        <Card className="!border-l-4 !border-l-blue-500">
          <div className="flex items-start gap-3">
            <TrendingUp className="text-blue-500 flex-shrink-0 mt-0.5"/>
            <div>
              <div className="font-bold flex items-center gap-2">AI Prediction <Badge color="purple">AI</Badge></div>
              <p className="text-sm mt-1">{predict.advisory}</p>
              {predict.hotspot_type && predict.hotspot_type !== 'none' && (
                <p className="text-xs text-ink-500 mt-2">Trend: <b className="capitalize">{predict.hotspot_type}</b> incidents are {predict.trend} ({predict.hotspot_count} in last 24h)</p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-ink-200/60 dark:border-ink-800 flex justify-between items-center">
            <h3 className="font-bold">🗺️ Situational Map</h3>
            <Link to="/app/map" className="text-xs font-semibold text-brand-600">Fullscreen →</Link>
          </div>
          <Map incidents={active} pois={pois} height={500}/>
        </Card>

        <Card>
          <h3 className="font-bold mb-3">📋 Relevant Incidents</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {relevantFocus.length===0 && <div className="text-sm text-ink-500 py-6 text-center">No relevant incidents right now</div>}
            {relevantFocus.slice(0,10).map(i => (
              <Link key={i.id} to={`/app/incidents/${i.id}`} className="block p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
                <div className="flex items-start justify-between mb-1">
                  <strong className="text-sm capitalize flex items-center gap-1">{i.incident_type.replace('_',' ')}</strong>
                  <span className="text-xs text-ink-400">{timeAgo(i.created_at)}</span>
                </div>
                <p className="text-xs text-ink-500 dark:text-ink-400 line-clamp-2">{i.ai_summary}</p>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {(i.ai_required_resources||[]).slice(0,3).map(r=><Badge key={r} color="blue">{r.replace('_',' ')}</Badge>)}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
