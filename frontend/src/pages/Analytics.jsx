import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api'
import { Card, StatCard, Skeleton } from '../components/ui'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
  Legend,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import BackButton from '../components/BackButton'
import { BarChart3 } from 'lucide-react'

const COLORS = ['#ef4444','#f59e0b','#3b82f6','#10b981','#a855f7','#ec4899','#14b8a6','#f97316','#6366f1']
const SEV_COLOR = { critical:'#ef4444', high:'#f97316', moderate:'#f59e0b', low:'#10b981' }

function AnalyticsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <StatCard key={i} loading label="—" value="—"/>)}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <Skeleton className="h-5 w-40"/>
          <Skeleton className="h-72 w-full rounded-xl"/>
        </Card>
        <Card className="space-y-3">
          <Skeleton className="h-5 w-44"/>
          <Skeleton className="h-72 w-full rounded-full"/>
        </Card>
        <Card className="md:col-span-2 space-y-3">
          <Skeleton className="h-5 w-40"/>
          <Skeleton className="h-64 w-full rounded-xl"/>
        </Card>
      </div>
    </div>
  )
}

const tooltipStyle = { background:'rgba(15,23,42,.92)', border:'1px solid rgba(255,255,255,.08)', borderRadius:10, color:'#fff', fontSize:12, boxShadow:'0 8px 30px rgba(0,0,0,.35)' }

export default function Analytics() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [incs, setIncs] = useState([])
  useEffect(() => {
    Promise.all([
      api.get('/api/incidents/stats/summary').catch(() => ({ data: { total:0, by_type:{}, by_severity:{}, by_status:{} } })),
      api.get('/api/incidents').catch(() => ({ data: [] })),
    ]).then(([s,i]) => { setStats(s.data); setIncs(i.data) })
  }, [])

  const typeData = Object.entries(stats?.by_type||{}).map(([k,v])=>({name:k.replaceAll('_',' '), count:v})).sort((a,b)=>b.count-a.count)
  const sevData = Object.entries(stats?.by_severity||{}).map(([k,v])=>({name:k, value:v}))
  const statusData = Object.entries(stats?.by_status||{}).map(([k,v])=>({name:k.replaceAll('_',' '), value:v}))
  const active = (stats?.by_status?.submitted||0)+(stats?.by_status?.verified||0)+(stats?.by_status?.assigned||0)+(stats?.by_status?.dispatched||0)+(stats?.by_status?.en_route||0)+(stats?.by_status?.on_site||0)+(stats?.by_status?.rescue_ongoing||0)

  return (
    <React.Fragment>
      <BackButton/>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:.3 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 break-words">
            <BarChart3 className="text-indigo-500"/> {t('analytics.title', 'Intelligence Analytics')}
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">{t('analytics.subtitle', 'Real-time emergency intelligence for decision makers')}</p>
        </motion.div>

        {!stats ? (
          <AnalyticsSkeleton/>
        ) : (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:.4 }} className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label={t('analytics.total','Total')} value={stats.total||0} color="blue"/>
              <StatCard label={t('analytics.active','Active')} value={active} color="orange"/>
              <StatCard label={t('analytics.critical','Critical')} value={stats.by_severity?.critical||0} color="red"/>
              <StatCard label={t('analytics.resolved','Resolved')} value={stats.by_status?.resolved||0} color="green"/>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <h3 className="font-bold mb-3">{t('analytics.by_type','Incidents by Type')}</h3>
                <div className="h-72">
                  <ResponsiveContainer>
                    <BarChart data={typeData} margin={{top:10,bottom:40}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.15)"/>
                      <XAxis dataKey="name" fontSize={11} angle={-30} textAnchor="end" height={60} stroke="#94a3b8"/>
                      <YAxis fontSize={11} stroke="#94a3b8"/>
                      <Tooltip contentStyle={tooltipStyle}/>
                      <Bar dataKey="count" radius={[6,6,0,0]}>
                        {typeData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <h3 className="font-bold mb-3">{t('analytics.by_severity','Incidents by Severity')}</h3>
                <div className="h-72">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={sevData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label fontSize={11}>
                        {sevData.map((e,i)=><Cell key={i} fill={SEV_COLOR[e.name]||COLORS[i]}/>)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle}/>
                      <Legend wrapperStyle={{fontSize:12}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="md:col-span-2">
                <h3 className="font-bold mb-3">{t('analytics.by_status','Status Breakdown')}</h3>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={statusData} layout="vertical" margin={{left:80}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.15)"/>
                      <XAxis type="number" fontSize={11} stroke="#94a3b8"/>
                      <YAxis dataKey="name" type="category" fontSize={11} stroke="#94a3b8" width={110}/>
                      <Tooltip contentStyle={tooltipStyle}/>
                      <Bar dataKey="value" fill="#3b82f6" radius={[0,6,6,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </React.Fragment>
  )
}
