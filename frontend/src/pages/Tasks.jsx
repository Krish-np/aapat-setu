import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'
import { Card, Button, Badge, EmptyState, Skeleton } from '../components/ui'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../store/auth'
import { toast } from '../components/toaster'
import useRelativeTime from '../lib/useRelativeTime'
import { haversine } from '../lib/helpers'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HandHeart, MapPin, CheckCircle2, Clock } from 'lucide-react'

const ROLE_FOCUS = {
  fire:        { roles:['fire'],       keywords:['fire','forest_fire','building_collapse','rescue'] },
  police:      { roles:['police'],     keywords:['accident','missing_person','crowd','security','crime'] },
  hospital:    { roles:['hospital','medical'], keywords:['medical','accident','injury'] },
  ngo:         { roles:['ngo','volunteer'], keywords:['shelter','food','water','clothing','flood','relief'] },
  municipality:{ roles:['municipality','civic'], keywords:['storm','power_failure','water_issue','flood','debris','road'] },
  volunteer:   { roles:[], keywords:[] },
  responder:   { roles:[], keywords:[] },
  admin:       { roles:[], keywords:[] },
}
function taskMatchesRole(task, inc, role) {
  const cfg = ROLE_FOCUS[role]
  if (!cfg) return true
  if (cfg.roles.length===0 && cfg.keywords.length===0) return true
  if (task.assignee_role && cfg.roles.includes(task.assignee_role)) return true
  const t = (inc?.incident_type||'') + ' ' + (inc?.ai_required_resources?.join(' ')||'') + ' ' + (task.task_type||'')
  return cfg.keywords.some(k => t.includes(k))
}

function TasksSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {[0,1,2,3].map(i=>(
        <Card key={i} className="space-y-3 !p-4">
          <div className="flex items-center gap-2"><Skeleton className="h-6 w-32"/><Skeleton className="h-5 w-16 rounded-full"/></div>
          <Skeleton className="h-3 w-full"/><Skeleton className="h-3 w-5/6"/><Skeleton className="h-3 w-2/3"/>
          <div className="flex gap-2 pt-1"><Skeleton className="h-8 w-20 rounded-lg"/><Skeleton className="h-8 w-24 rounded-lg"/></div>
        </Card>
      ))}
    </div>
  )
}

function TaskRow({ tt, idx, user, t, claim, update, busy }) {
  const when = useRelativeTime(tt.created_at)
  const d = user.lat && tt.inc ? haversine(user.lat, user.lng, tt.inc.lat, tt.inc.lng).toFixed(2) : null
  return (
    <motion.div layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
      transition={{duration:.3, delay:Math.min(idx*0.04,0.3)}}>
      <Card hover className="!p-4">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <strong className="capitalize text-[15px] font-semibold break-words">{(tt.task_type||'').replaceAll('_',' ')}</strong>
            <Badge color={tt.status==='completed'?'green':tt.status==='pending'?'blue':'amber'}>
              {(tt.status||'').replaceAll('_',' ')}
            </Badge>
            {tt.assignee_role && <Badge color="purple">{t('tasks.for_role')} {(tt.assignee_role||'').replaceAll('_',' ')}</Badge>}
          </div>
          {d && <span className="text-xs text-ink-500 flex items-center gap-1 flex-shrink-0"><MapPin size={12}/>{d} km</span>}
        </div>
        <p className="text-[13px] text-ink-600 dark:text-ink-300 line-clamp-3 mb-3 leading-relaxed break-words">
          {tt.inc.ai_summary || tt.inc.description || '—'}
        </p>
        <div className="text-xs text-ink-500 mb-3 flex items-center gap-1"><Clock size={12}/> {t('tasks.posted')} {when}</div>
        <div className="flex gap-2 flex-wrap">
          {tt.status==='pending' && !tt.assignee_id && (
            <Button size="sm" onClick={()=>claim(tt.id)} disabled={busy}>{t('tasks.claim')}</Button>
          )}
          {tt.assignee_id===user.id && tt.status!=='completed' && (
            <>
              {tt.status==='claimed' && <Button size="sm" onClick={()=>update(tt.id,'en_route')} disabled={busy}>{t('tasks.en_route')}</Button>}
              {tt.status==='en_route' && <Button size="sm" variant="warning" onClick={()=>update(tt.id,'on_site')} disabled={busy}>{t('tasks.on_scene')}</Button>}
              {(tt.status==='on_site'||tt.status==='in_progress') && <Button size="sm" variant="secondary" onClick={()=>update(tt.id,'in_progress')} disabled={busy}>{t('tasks.working')}</Button>}
              <Button size="sm" variant="success" onClick={()=>update(tt.id,'completed')} disabled={busy}>
                <CheckCircle2 size={13}/> {t('tasks.complete')}
              </Button>
            </>
          )}
          <Link to={`/app/incidents/${tt.incident_id}`}><Button size="sm" variant="ghost">{t('tasks.details')}</Button></Link>
        </div>
        {tt.notes && <div className="mt-3 p-2 rounded-lg bg-ink-50 dark:bg-ink-800/60 text-xs whitespace-pre-wrap break-words">{tt.notes}</div>}
      </Card>
    </motion.div>
  )
}

export default function Tasks() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [tasks, setTasks] = useState([])
  const [incs, setIncs] = useState([])
  const [tab, setTab] = useState('available')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    return Promise.all([api.get('/api/tasks'), api.get('/api/incidents')])
      .then(([tt,ii])=>{ setTasks(tt.data); setIncs(ii.data) })
      .catch(()=>{})
      .finally(()=>setLoading(false))
  }, [])
  useEffect(()=>{ load() },[load])

  if (user.role==='citizen') return <Navigate to="/app" replace/>

  const incMap = Object.fromEntries(incs.map(i=>[i.id,i]))
  const allScoped = tasks.map(tt=>({...tt, inc:incMap[tt.incident_id]}))
    .filter(tt=>tt.inc && taskMatchesRole(tt, tt.inc, user.role))
  const available = allScoped.filter(tt=>!tt.assignee_id && tt.status==='pending')
  const mine = allScoped.filter(tt=>tt.assignee_id===user.id)
  const show = tab==='available'?available:tab==='mine'?mine:allScoped

  const claim = async (id) => {
    if (busy) return; setBusy(true)
    try { await api.post(`/api/tasks/${id}/claim`); toast(t('tasks.claimed','Claimed!'),'ok'); await load() }
    catch(e){ toast(e.response?.data?.detail || t('tasks.could_not_claim'),'err') }
    finally { setBusy(false) }
  }
  const update = async (id,status) => {
    if (busy) return; setBusy(true)
    try { await api.patch(`/api/tasks/${id}`,{status}); toast(t('toast.success_resource_add','Updated'),'ok'); await load() }
    catch(e){ toast(e.response?.data?.detail || t('toast.error_generic'),'err') }
    finally { setBusy(false) }
  }

  const TABS = [
    ['available', `${t('tasks.available')} (${available.length})`],
    ['mine', `${t('tasks.my_missions')} (${mine.length})`],
    ['all', `${t('tasks.all_tasks')} (${allScoped.length})`],
  ]

  return (
    <div>
      <PageHeader icon={HandHeart} iconColor="text-emerald-500" title={t('tasks.title')} subtitle={t('tasks.subtitle')}
        actions={
          <div className="flex gap-1 rounded-lg bg-ink-100 dark:bg-ink-800 p-1">
            {TABS.map(([k,l])=>(
              <motion.button key={k} whileTap={{scale:0.95}} onClick={()=>setTab(k)}
                className={'px-3 h-8 text-[13px] font-semibold rounded-md transition ' +
                  (tab===k?'bg-white dark:bg-ink-950 shadow text-brand-600 dark:text-brand-300':'text-ink-600 dark:text-ink-300')}>
                {l}
              </motion.button>
            ))}
          </div>
        }/>

      {loading ? <TasksSkeleton/>
       : show.length===0
         ? <Card><EmptyState icon={<CheckCircle2 size={28}/>} title={t('tasks.no_missions')} description={tab==='available'?t('tasks.available_yet'):t('tasks.none_yet')}/></Card>
         : <div className="grid md:grid-cols-2 gap-4">
             <AnimatePresence>
               {show.map((tt,i)=> <TaskRow key={tt.id} tt={tt} idx={i} user={user} t={t} claim={claim} update={update} busy={busy}/>)}
             </AnimatePresence>
           </div>}
    </div>
  )
}
