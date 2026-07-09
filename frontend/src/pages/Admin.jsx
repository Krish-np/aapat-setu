import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api'
import { Card, StatCard, Badge, Skeleton } from '../components/ui'
import BackButton from '../components/BackButton'
import { useTranslation } from 'react-i18next'
import useRelativeTime from '../lib/useRelativeTime'
import { Shield, Users, AlertTriangle, Package, TrendingUp, Cpu } from 'lucide-react'

function AdminSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <StatCard key={i} loading label="—" value="—"/>)}
      </div>
      <Card className="space-y-3">
        <Skeleton className="h-5 w-40"/>
        <Skeleton className="h-16 w-full rounded-xl"/>
      </Card>
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <Card className="space-y-3">
          <Skeleton className="h-5 w-40"/>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[0,1,2,3,4,5].map(i=><Skeleton key={i} className="h-12 rounded-xl"/>)}
          </div>
        </Card>
        <Card className="space-y-3">
          <Skeleton className="h-5 w-28"/>
          <div className="space-y-3">
            {[0,1,2,3,4,5,6,7].map(i=><Skeleton key={i} className="h-4 w-full"/>)}
          </div>
        </Card>
      </div>
      <Card className="space-y-3">
        <Skeleton className="h-5 w-44"/>
        <div className="space-y-3">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full"/>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3"/>
                <Skeleton className="h-3 w-1/2"/>
              </div>
              <Skeleton className="h-5 w-14 rounded-full"/>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function IncRow({ i }) {
  const when = useRelativeTime(i.created_at)
  return (
    <motion.div layout initial={{ opacity:0 }} animate={{ opacity:1 }} className="py-3 flex items-center justify-between gap-3 text-sm border-b border-ink-100 dark:border-ink-800/60 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-xs text-ink-400 flex-shrink-0">#{i.id}</span>
        <strong className="capitalize truncate text-ink-900 dark:text-white">{(i.incident_type||'').replaceAll('_',' ')}</strong>
        <Badge color={i.ai_severity==='critical'?'red':i.ai_severity==='high'?'orange':i.ai_severity==='moderate'?'amber':'green'}>{i.ai_severity}</Badge>
      </div>
      <span className="text-xs text-ink-400 whitespace-nowrap tabular-nums">{when}</span>
    </motion.div>
  )
}

function Row({label,value}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-ink-100 dark:border-ink-800/60 last:border-b-0">
      <span className="text-ink-500 dark:text-ink-400 text-sm">{label}</span>
      <span className="font-semibold text-ink-900 dark:text-white text-sm">{value}</span>
    </div>
  )
}

export default function Admin() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [incs, setIncs] = useState([])
  const [predict, setPredict] = useState(null)
  const [res, setRes] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/full-stats').catch(()=>({data:{total_users:0,total_incidents:0,total_resources:0,by_role:{}}})),
      api.get('/api/incidents').catch(()=>({data:[]})),
      api.get('/api/resources').catch(()=>({data:[]})),
      api.get('/api/admin/predict').catch(()=>({data:{trend:'stable',advisory:'AI prediction engine online'}})),
    ]).then(([s,i,r,p]) => { setStats(s.data); setIncs(i.data); setRes(r.data); setPredict(p.data) })
    api.get('/api/admin/users').then(u=>setUsers(u.data)).catch(()=>{})
  },[])

  const roleColors = { citizen:'blue', volunteer:'green', responder:'red', hospital:'pink', police:'slate', fire:'orange', ngo:'purple', municipality:'indigo', admin:'slate' }
  const roles = stats?.by_role || {}

  return (
    <React.Fragment>
      <BackButton/>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:.3 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 break-words">
            <Shield className="text-slate-700 dark:text-slate-300"/> {t('admin.title', 'Super Admin Panel')}
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">{t('admin.subtitle', 'System-wide monitoring, users, resources, and AI settings')}</p>
        </motion.div>

        {!stats ? <AdminSkeleton/> : (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:.4 }} className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label={t('admin.total_users','Total Users')} value={stats.total_users||users.length||0} color="blue" icon={<Users size={18}/>}/>
              <StatCard label={t('admin.total_incidents','Total Incidents')} value={stats.total_incidents||incs.length} color="red" icon={<AlertTriangle size={18}/>}/>
              <StatCard label={t('admin.resources','Resources')} value={res.length||stats.total_resources||0} color="green" icon={<Package size={18}/>}/>
              <StatCard label={t('admin.ai_online','AI Online')} value="✓" color="purple" icon={<Cpu size={18}/>} sub={predict?.trend||'stable'}/>
            </div>

            {predict?.advisory && (
              <Card className="!border-l-4 !border-l-purple-500">
                <div className="flex items-start gap-3">
                  <TrendingUp className="text-purple-500 flex-shrink-0 mt-0.5"/>
                  <div className="min-w-0">
                    <div className="font-bold flex items-center gap-2 flex-wrap">
                      {t('admin.ai_engine','AI Prediction Engine')}
                      <Badge color="purple" pulse>{t('admin.live','Live')}</Badge>
                    </div>
                    <p className="text-sm mt-1 text-ink-700 dark:text-ink-300 leading-relaxed break-words">{predict.advisory}</p>
                    {predict.predicted_resources?.length>0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="text-xs text-ink-500 dark:text-ink-400 self-center">{t('admin.preposition','Pre-positioning:')}</span>
                        {predict.predicted_resources.map(r=><Badge key={r} color="blue">{r.replaceAll('_',' ')}</Badge>)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
              <Card>
                <h3 className="font-bold mb-3 flex items-center gap-2"><Users size={18}/> {t('admin.users_by_role','Users by Role')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(roles).length === 0 ? (
                    <div className="col-span-full text-sm text-ink-400 py-6 text-center">No data</div>
                  ) : Object.entries(roles).map(([r,c])=>(
                    <div key={r} className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 flex items-center justify-between hover:bg-ink-100 dark:hover:bg-ink-800 transition">
                      <span className="text-sm capitalize text-ink-700 dark:text-ink-200">{r.replaceAll('_',' ')}</span>
                      <Badge color={roleColors[r]||'slate'}>{c}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="font-bold mb-3">⚙️ {t('admin.system','System')}</h3>
                <div>
                  <Row label={t('admin.version','Version')} value="v2.0"/>
                  <Row label={t('admin.auth','Auth')} value="JWT · bcrypt"/>
                  <Row label={t('admin.database','Database')} value="MySQL/XAMPP"/>
                  <Row label={t('admin.realtime','Real-time')} value="WebSockets"/>
                  <Row label={t('admin.maps','Maps')} value="Leaflet + OSM + ORS"/>
                  <Row label={t('admin.ai_label','AI')} value={t('admin.ai_value','Triage + Routing')}/>
                  <Row label={t('admin.languages','Languages')} value="EN · ने"/>
                  <Row label={t('admin.theme','Theme')} value={t('admin.theme_value','Dark / Light')}/>
                </div>
              </Card>
            </div>

            <Card>
              <h3 className="font-bold mb-3 flex items-center gap-2"><AlertTriangle size={18}/> {t('admin.recent','Recent Incidents')}</h3>
              {incs.length === 0 ? (
                <div className="text-sm text-ink-400 py-8 text-center">No incidents yet</div>
              ) : (
                <div>
                  {incs.slice(0,8).map(i=>(<IncRow key={i.id} i={i}/>))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </React.Fragment>
  )
}
