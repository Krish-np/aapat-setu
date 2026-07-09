import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { Card } from '../components/ui'
import BackButton from '../components/BackButton'
import { Bell, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { timeAgo } from '../lib/helpers'

const ICON = { info:Info, alert:AlertTriangle, ok:CheckCircle2, update:Bell }
const COLOR = { info:'blue', alert:'amber', ok:'green', update:'purple' }

// Generate demo notifications based on recent incidents (since backend notifications are per-user)
function generateDemoNotifications(incidents, user) {
  const out = []
  const mine = incidents.filter(i => i.reporter_id === user.id).slice(0,3)
  const critical = incidents.filter(i => i.ai_severity==='critical' && i.status!=='resolved').slice(0,3)
  mine.forEach(i => out.push({ kind:'update', title:`Your ${i.incident_type.replace('_',' ')} report is ${i.status.replace('_',' ')}`, message:i.ai_summary, time:i.updated_at }))
  critical.forEach(i => out.push({ kind:'alert', title:`Critical ${i.incident_type.replace('_',' ')} incident`, message:i.ai_summary, time:i.created_at }))
  out.push({ kind:'info', title:'Welcome to Aapat Setu', message:'AI triage engine is online. Stay safe.', time:new Date() })
  return out.sort((a,b) => new Date(b.time)-new Date(a.time))
}

export default function Notifications() {
  const [incs, setIncs] = useState([])
  const [user] = [null,null]
  const u = JSON.parse(localStorage.getItem('aapat_user')||'null')
  useEffect(()=>{ api.get('/api/incidents').then(r=>setIncs(r.data)) },[])
  const notifs = generateDemoNotifications(incs, u)
  return (
    <>
      <BackButton/>
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
      <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><Bell className="text-purple-500"/> Notifications</h1>
      <div className="space-y-3">
        {notifs.map((n,i) => {
          const Icon = ICON[n.kind]||Info
          return (
            <Card key={i} className="!border-l-4 !border-l-transparent"
              style={{borderLeftColor:{blue:'#3b82f6',amber:'#f59e0b',green:'#10b981',purple:'#8b5cf6',red:'#ef4444'}[COLOR[n.kind]]}}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl grid place-items-center bg-${COLOR[n.kind]}-100 dark:bg-${COLOR[n.kind]}-500/20 text-${COLOR[n.kind]}-600 dark:text-${COLOR[n.kind]}-400 flex-shrink-0`}>
                  <Icon size={20}/>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold">{n.title}</h3>
                    <span className="text-xs text-ink-400 whitespace-nowrap">{timeAgo(n.time)}</span>
                  </div>
                  <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{n.message}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
    </>
  )
}
