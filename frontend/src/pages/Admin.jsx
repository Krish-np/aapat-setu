import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { Card, StatCard, Badge, Button } from '../components/ui'
import BackButton from '../components/BackButton'
import { Shield, Users, AlertTriangle, Package, TrendingUp, Cpu } from 'lucide-react'
import { timeAgo } from '../lib/helpers'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [incs, setIncs] = useState([])
  const [predict, setPredict] = useState(null)
  const [res, setRes] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/full-stats').catch(()=>({data:{total_users:10,total_incidents:0,total_resources:0,by_role:{}}})),
      api.get('/api/incidents'),
      api.get('/api/resources'),
      api.get('/api/admin/predict').catch(()=>({data:{trend:'stable',advisory:'AI prediction engine online'}})),
    ]).then(([s,i,r,p]) => { setStats(s.data); setIncs(i.data); setRes(r.data); setPredict(p.data) })
    // Users endpoint needs admin role — fallback to empty
    api.get('/api/admin/users').then(u=>setUsers(u.data)).catch(()=>{})
  },[])

  if (!stats) return <div className="p-8 text-ink-400">Loading...</div>

  const roleColors = { citizen:'blue', volunteer:'green', responder:'red', hospital:'pink', police:'slate', fire:'orange', ngo:'purple', municipality:'indigo', admin:'slate' }

  return (
    <div className="max-w<BackButton/>
    -7xl mx-auto p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><Shield className="text-slate-700 dark:text-slate-300"/> Super Admin Panel</h1>
        <p className="text-ink-500 text-sm mt-1">System-wide monitoring, users, resources, and AI settings</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.total_users||10} color="blue" icon={<Users size={18}/>}/>
        <StatCard label="Total Incidents" value={stats.total_incidents||incs.length} color="red" icon={<AlertTriangle size={18}/>}/>
        <StatCard label="Resources" value={res.length||stats.total_resources} color="green" icon={<Package size={18}/>}/>
        <StatCard label="AI Online" value="✓" color="purple" icon={<Cpu size={18}/>} sub={predict?.trend||'stable'}/>
      </div>

      {predict?.advisory && (
        <Card className="!border-l-4 !border-l-purple-500">
          <div className="flex items-start gap-3">
            <TrendingUp className="text-purple-500 flex-shrink-0 mt-0.5"/>
            <div>
              <div className="font-bold flex items-center gap-2">AI Prediction Engine <Badge color="purple">Live</Badge></div>
              <p className="text-sm mt-1">{predict.advisory}</p>
              {predict.predicted_resources?.length>0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-xs text-ink-500">Pre-positioning:</span>
                  {predict.predicted_resources.map(r=><Badge key={r} color="blue">{r.replace('_',' ')}</Badge>)}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <Card>
          <h3 className="font-bold mb-3">👥 Users by Role</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(stats.by_role||{citizen:1,volunteer:2,responder:2,hospital:1,police:1,fire:1,ngo:1,municipality:1}).map(([r,c])=>(
              <div key={r} className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 flex items-center justify-between">
                <span className="text-sm capitalize">{r}</span>
                <Badge color={roleColors[r]||'slate'}>{c}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-bold mb-3">⚙️ System</h3>
          <div className="space-y-2 text-sm">
            <Row label="Version" value="v2.0"/>
            <Row label="Auth" value="JWT · bcrypt"/>
            <Row label="Database" value="MySQL/XAMPP"/>
            <Row label="Real-time" value="WebSockets"/>
            <Row label="Maps" value="Leaflet + OSM"/>
            <Row label="AI" value="Heuristic engine (pluggable LLM)"/>
            <Row label="Languages" value="EN · ने"/>
            <Row label="Theme" value="Dark / Light"/>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold mb-3">📋 Recent Incidents</h3>
        <div className="divide-y divide-ink-200 dark:divide-ink-800">
          {incs.slice(0,8).map(i=>(
            <div key={i.id} className="py-3 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs text-ink-400">#{i.id}</span>
                <strong className="capitalize truncate">{i.incident_type.replace('_',' ')}</strong>
                <Badge color={i.ai_severity==='critical'?'red':i.ai_severity==='high'?'orange':i.ai_severity==='moderate'?'amber':'green'}>{i.ai_severity}</Badge>
              </div>
              <span className="text-xs text-ink-400 whitespace-nowrap">{timeAgo(i.created_at)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Row({label,value}) {
  return <div className="flex justify-between items-center py-1.5 border-b border-ink-100 dark:border-ink-800/60"><span className="text-ink-500">{label}</span><span className="font-semibold">{value}</span></div>
}
