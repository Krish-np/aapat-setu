import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Card, Badge, Button, Skeleton } from '../components/ui'
import Map from '../components/Map'
import BackButton from '../components/BackButton'
import useRelativeTime from '../lib/useRelativeTime'
import { Layers, List, AlertTriangle, Map as MapIcon, X } from 'lucide-react'

function IncidentRow({ i, onClick, idx }) {
  const pb = {
    critical:{color:'red',label:'CRITICAL'},
    high:{color:'orange',label:'HIGH'},
    moderate:{color:'amber',label:'MODERATE'},
    low:{color:'green',label:'LOW'},
  }[i.ai_severity || i.severity] || {color:'slate',label:'—'}
  const sb = {
    submitted:{color:'slate',label:'Submitted'},
    verified:{color:'blue',label:'Verified'},
    assigned:{color:'purple',label:'Assigned'},
    dispatched:{color:'amber',label:'Dispatched'},
    en_route:{color:'orange',label:'En route'},
    on_site:{color:'pink',label:'On scene'},
    rescue_ongoing:{color:'red',label:'Rescue'},
    resolved:{color:'green',label:'Resolved'},
    rejected:{color:'slate',label:'Rejected'},
  }[i.status] || {color:'slate',label:i.status}
  const when = useRelativeTime(i.created_at)
  return (
    <motion.div
      layout
      initial={{ opacity:0, y:6 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:.25, delay: Math.min(idx*0.03, 0.3) }}
      whileHover={{ y:-1, transition:{ duration:.15 } }}
      onClick={onClick}
      className="p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/60 cursor-pointer border border-transparent hover:border-ink-200 dark:hover:border-ink-700 transition group"
    >
      <div className="flex items-center justify-between mb-1 gap-2">
        <strong className="capitalize text-sm flex items-center gap-1.5 min-w-0 text-ink-900 dark:text-white">
          <AlertTriangle size={14} className={pb.color==='red'?'text-red-500':pb.color==='orange'?'text-orange-500':pb.color==='amber'?'text-amber-500':'text-emerald-500'} flexShrink={0}/>
          <span className="truncate">{(i.incident_type||'').replaceAll('_',' ')}</span>
        </strong>
        <Badge color={pb.color}>{pb.label}</Badge>
      </div>
      <p className="text-xs text-ink-500 dark:text-ink-400 line-clamp-2 mb-2 leading-relaxed break-words">
        {i.ai_summary || i.description || '—'}
      </p>
      <div className="flex justify-between items-center">
        <Badge color={sb.color}>{sb.label.replace('_',' ')}</Badge>
        <span className="text-[10px] text-ink-400 tabular-nums">{when}</span>
      </div>
    </motion.div>
  )
}

function MapPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <Skeleton className="h-[620px] rounded-2xl" />
        <Card className="space-y-3">
          <Skeleton className="h-5 w-28" />
          {Array.from({length:5}).map((_,i)=>(
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

export default function MapPage() {
  const nav = useNavigate()
  const [incs, setIncs] = useState(null)
  const [pois, setPois] = useState([])
  const [filter, setFilter] = useState('active')
  const [showPois, setShowPois] = useState(true)
  const [showListMobile, setShowListMobile] = useState(false)

  useEffect(()=>{
    Promise.all([api.get('/api/incidents'), api.get('/api/incidents/pois/all')])
      .then(([i,p])=>{ setIncs(i.data); setPois(p.data) })
  },[])

  if (incs === null) return (
    <>
      <BackButton/>
      <MapPageSkeleton/>
    </>
  )

  const filtered = incs.filter(i => filter==='all'?true:filter==='active'?i.status!=='resolved':filter==='critical'?i.ai_severity==='critical':i.status===filter)
  const shown = filter==='critical' ? filtered.filter(i=>i.ai_severity==='critical') : filtered

  return (
    <>
      <BackButton/>
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.3}}
        className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 break-words">
              <Layers className="text-blue-600"/> Live Emergency Map
            </h1>
            <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
              {filtered.length} incidents · real-time coordination
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-xl bg-ink-100 dark:bg-ink-800 p-1 text-xs font-semibold">
              {['active','all','critical','resolved'].map(k=>(
                <button key={k} onClick={()=>setFilter(k)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition ${filter===k?'bg-white dark:bg-ink-950 shadow text-brand-600 dark:text-brand-300':'text-ink-600 dark:text-ink-400'}`}>
                  {k==='active'?'Active':k==='all'?'All':k==='critical'?'Critical':'Resolved'}
                </button>
              ))}
            </div>
            <Button size="sm" variant="ghost" onClick={()=>setShowPois(s=>!s)}>
              {showPois?'Hide':'Show'} Facilities
            </Button>
            <Button size="sm" variant="subtle" className="lg:hidden" onClick={()=>setShowListMobile(true)}>
              <List size={14}/> List
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-4">
          <Card className="!p-0 overflow-hidden">
            <Map incidents={shown} pois={showPois?pois:[]} height={620} zoom={13} selectable onSelect={(i)=>nav(`/app/incidents/${i.id}`)}/>
          </Card>

          {/* Desktop list */}
          <Card className="hidden lg:block">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-ink-900 dark:text-white">
              <List size={18}/> Incident list
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-ink-400">{filtered.length}</span>
            </h3>
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 -mr-1">
              {filtered.length===0 && (
                <div className="text-sm text-ink-500 text-center py-10">No incidents in this view.</div>
              )}
              <AnimatePresence>
                {filtered.map((i,idx) => (
                  <IncidentRow key={i.id} i={i} idx={idx} onClick={()=>nav(`/app/incidents/${i.id}`)}/>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Mobile list drawer */}
      <AnimatePresence>
        {showListMobile && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={()=>setShowListMobile(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"/>
            <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:30,stiffness:300}}
              className="fixed right-0 top-0 bottom-0 w-[88%] max-w-md bg-white dark:bg-ink-950 z-50 p-4 overflow-y-auto lg:hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><List size={18}/> Incidents</h3>
                <button onClick={()=>setShowListMobile(false)} className="h-9 w-9 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 grid place-items-center"><X size={18}/></button>
              </div>
              <div className="space-y-2">
                {filtered.map((i,idx) => (
                  <IncidentRow key={i.id} i={i} idx={idx} onClick={()=>{nav(`/app/incidents/${i.id}`);setShowListMobile(false)}}/>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
