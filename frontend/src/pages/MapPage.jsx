import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Card, Badge, Button, priorityBadge, statusBadge } from '../components/ui'
import Map from '../components/Map'
import { timeAgo } from '../lib/helpers'
import BackButton from '../components/BackButton'
import { Layers, List, AlertTriangle } from 'lucide-react'

export default function MapPage() {
  const nav = useNavigate()
  const [incs, setIncs] = useState([])
  const [pois, setPois] = useState([])
  const [filter, setFilter] = useState('active')
  const [showPois, setShowPois] = useState(true)
  useEffect(()=>{
    Promise.all([api.get('/api/incidents'), api.get('/api/incidents/pois/all')])
      .then(([i,p])=>{setIncs(i.data); setPois(p.data)})
  },[])
  const filtered = incs.filter(i => filter==='all'?true:filter==='active'?i.status!=='resolved':i.status===filter)
  return (
    <>
      <BackButton/>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><Layers className="text-blue-600"/> Live Emergency Map</h1>
          <p className="text-ink-500 text-sm mt-1">{filtered.length} incidents · real-time coordination</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-sm">
            <option value="active">Active incidents</option>
            <option value="all">All incidents</option>
            <option value="critical">Critical only</option>
            <option value="verified">Verified</option>
            <option value="en_route">En route</option>
            <option value="resolved">Resolved</option>
          </select>
          <Button size="sm" variant="ghost" onClick={()=>setShowPois(s=>!s)}>
            {showPois?'Hide':'Show'} POIs
          </Button>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <Card className="!p-0 overflow-hidden">
          <Map incidents={filter==='critical'?filtered.filter(i=>i.ai_severity==='critical'):filtered} pois={showPois?pois:[]} height={620} zoom={13}/>
        </Card>
        <Card>
          <h3 className="font-bold mb-3 flex items-center gap-2"><List size={18}/> Incident list</h3>
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filtered.length===0 && <div className="text-sm text-ink-500 text-center py-10">No incidents</div>}
            {filtered.map(i=>{
              const pb=priorityBadge(i.ai_severity||i.severity), sb=statusBadge(i.status)
              return <div key={i.id} onClick={()=>nav(`/app/incidents/${i.id}`)} className="p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/60 cursor-pointer transition border border-transparent hover:border-ink-200 dark:hover:border-ink-700">
                <div className="flex items-center justify-between mb-1">
                  <strong className="capitalize text-sm flex items-center gap-1"><AlertTriangle size={14} className="text-red-500"/>{i.incident_type.replace('_',' ')}</strong>
                  <Badge color={pb.color}>{pb.label}</Badge>
                </div>
                <p className="text-xs text-ink-500 dark:text-ink-400 line-clamp-2 mb-2">{i.ai_summary}</p>
                <div className="flex justify-between items-center">
                  <Badge color={sb.color}>{sb.label.replace('_',' ')}</Badge>
                  <span className="text-[10px] text-ink-400">{timeAgo(i.created_at)}</span>
                </div>
              </div>
            })}
          </div>
        </Card>
      </div>
    </div>
    </>
  )
}
