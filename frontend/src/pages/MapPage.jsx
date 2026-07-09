import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Card, Badge, Button, Skeleton } from '../components/ui'
import Map from '../components/Map'
import PageHeader from '../components/PageHeader'
import useRelativeTime from '../lib/useRelativeTime'
import { useTranslation } from 'react-i18next'
import { Layers, List, AlertTriangle, X, MapPin } from 'lucide-react'

const FILTERS = ['active','all','critical','resolved']
const FILTER_LABEL = { active:'Active', all:'All', critical:'Critical', resolved:'Resolved' }

function IncidentRow({ i, onClick, idx }) {
  const pb = {critical:{color:'red'},high:{color:'orange'},moderate:{color:'amber'},low:{color:'green'}}[i.ai_severity||i.severity]||{color:'slate'}
  const sb = {submitted:{color:'slate',l:'Submitted'},verified:{color:'blue',l:'Verified'},assigned:{color:'purple',l:'Assigned'},dispatched:{color:'amber',l:'Dispatched'},en_route:{color:'orange',l:'En route'},on_site:{color:'pink',l:'On scene'},rescue_ongoing:{color:'red',l:'Rescue'},resolved:{color:'green',l:'Resolved'},rejected:{color:'red',l:'Rejected'}}[i.status]||{color:'slate',l:i.status}
  const when = useRelativeTime(i.created_at)
  return (
    <motion.div layout initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
      transition={{duration:.2, delay:Math.min(idx*0.03,0.3)}}
      whileHover={{y:-1,transition:{duration:.15}}}
      onClick={onClick}
      className="p-3 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800/60 cursor-pointer border border-transparent hover:border-ink-200 dark:hover:border-ink-700 transition">
      <div className="flex items-center justify-between mb-1 gap-2">
        <strong className="capitalize text-[13px] flex items-center gap-1.5 min-w-0 text-ink-900 dark:text-white">
          <AlertTriangle size={13} className={(pb.color==='red'?'text-red-500':pb.color==='orange'?'text-orange-500':pb.color==='amber'?'text-amber-500':'text-emerald-500')} flexShrink={0}/>
          <span className="truncate">{(i.incident_type||'').replaceAll('_',' ')}</span>
        </strong>
        <Badge color={pb.color}>{(i.ai_severity||'—').toUpperCase()}</Badge>
      </div>
      <p className="text-[12px] text-ink-500 dark:text-ink-400 line-clamp-2 mb-2 leading-relaxed break-words">
        {i.ai_summary||i.description||'—'}
      </p>
      <div className="flex justify-between items-center">
        <Badge color={sb.color}>{sb.l.replaceAll('_',' ')}</Badge>
        <span className="text-[10px] text-ink-400 tabular-nums">{when}</span>
      </div>
    </motion.div>
  )
}

function MapSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        <Skeleton className="h-[560px] rounded-lg"/>
        <Card className="space-y-3 !p-4">
          <Skeleton className="h-5 w-28"/>
          {Array.from({length:5}).map((_,i)=>(
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-40"/><Skeleton className="h-3 w-full"/><Skeleton className="h-5 w-20 rounded-full"/>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

export default function MapPage() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [incs,setIncs] = useState(null)
  const [pois,setPois] = useState([])
  const [filter,setFilter] = useState('active')
  const [showPois,setShowPois] = useState(true)
  const [showListMobile,setShowListMobile] = useState(false)

  useEffect(()=>{
    Promise.all([api.get('/api/incidents'), api.get('/api/incidents/pois/all')])
      .then(([i,p])=>{ setIncs(i.data||[]); setPois(p.data||[]) })
      .catch(()=>setIncs([]))
  },[])

  const filtered = (incs||[]).filter(i=> filter==='all'?true : filter==='active'?i.status!=='resolved' : filter==='critical'?i.ai_severity==='critical' : i.status===filter)

  return (
    <div>
      <PageHeader icon={Layers} iconColor="text-blue-500"
        title={t('map_page.title','Live Operations Map')}
        subtitle={`${filtered.length} ${t('map_page.subtitle_suffix','incidents on the network')}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-lg bg-ink-100 dark:bg-ink-800 p-1 text-[12px] font-semibold">
              {FILTERS.map(k=>(
                <motion.button key={k} whileTap={{scale:0.95}} onClick={()=>setFilter(k)}
                  className={'h-7 px-3 rounded-md capitalize transition ' +
                    (filter===k?'bg-white dark:bg-ink-950 shadow text-brand-600 dark:text-brand-300':'text-ink-600 dark:text-ink-400')}>
                  {FILTER_LABEL[k]}
                </motion.button>
              ))}
            </div>
            <Button size="sm" variant="ghost" onClick={()=>setShowPois(s=>!s)}>
              <MapPin size={14}/> {showPois?'Hide':'Show'} POIs
            </Button>
            <Button size="sm" variant="subtle" className="lg:hidden" onClick={()=>setShowListMobile(true)}>
              <List size={14}/> List
            </Button>
          </div>
        }/>

      {incs===null ? <MapSkeleton/> : (
        <div className="grid lg:grid-cols-[1fr_340px] gap-4">
          <Card className="!p-0 overflow-hidden">
            <Map incidents={filtered} pois={showPois?pois:[]} height={560} zoom={13} selectable onSelect={(i)=>nav(`/app/incidents/${i.id}`)}/>
          </Card>
          <Card className="hidden lg:block !p-4">
            <h3 className="font-semibold text-[14px] mb-3 flex items-center gap-2 text-ink-900 dark:text-white">
              <List size={16}/> Incident list
              <Badge color="slate" className="ml-auto">{filtered.length}</Badge>
            </h3>
            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1 -mr-1">
              {filtered.length===0
                ? <div className="text-sm text-ink-400 text-center py-10">No incidents</div>
                : <AnimatePresence>{filtered.map((i,idx)=><IncidentRow key={i.id} i={i} idx={idx} onClick={()=>nav(`/app/incidents/${i.id}`)}/>)}</AnimatePresence>}
            </div>
          </Card>
        </div>
      )}

      <AnimatePresence>
        {showListMobile && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={()=>setShowListMobile(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"/>
            <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:30,stiffness:300}}
              className="fixed right-0 top-0 bottom-0 w-[88%] max-w-md bg-white dark:bg-ink-950 z-50 p-4 overflow-y-auto lg:hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><List size={18}/> Incidents</h3>
                <button onClick={()=>setShowListMobile(false)} className="h-9 w-9 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 grid place-items-center"><X size={18}/></button>
              </div>
              <div className="space-y-2">
                {filtered.map((i,idx)=>(<IncidentRow key={i.id} i={i} idx={idx} onClick={()=>{nav(`/app/incidents/${i.id}`);setShowListMobile(false)}}/>))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
