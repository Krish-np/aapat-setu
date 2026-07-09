import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { Card, StatCard } from '../components/ui'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
  Legend,
} from 'recharts'

import BackButton from '../components/BackButton'

const COLORS = ['#ef4444','#f59e0b','#3b82f6','#10b981','#a855f7','#ec4899','#14b8a6','#f97316','#6366f1']

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [incs, setIncs] = useState([])
  useEffect(()=>{
    Promise.all([api.get('/api/incidents/stats/summary'), api.get('/api/incidents')])
      .then(([s,i])=>{setStats(s.data); setIncs(i.data)})
  },[])

  if (!stats) return <div className="p-8 text-ink-400">Loading...</div>

  const typeData = Object.entries(stats.by_type||{}).map(([k,v])=>({name:k.replace('_',' '), count:v})).sort((a,b)=>b.count-a.count)
  const sevData = Object.entries(stats.by_severity||{}).map(([k,v])=>({name:k, value:v}))
  const statusData = Object.entries(stats.by_status||{}).map(([k,v])=>({name:k.replace('_',' '), value:v}))

  return (
    <div className="max-w<BackButton/>
    -7xl mx-auto p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold">📊 Intelligence Analytics</h1>
        <p className="text-ink-500 text-sm mt-1">Real-time emergency intelligence for decision makers</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} color="blue"/>
        <StatCard label="Active" value={(stats.by_status.submitted||0)+(stats.by_status.verified||0)+(stats.by_status.assigned||0)+(stats.by_status.dispatched||0)+(stats.by_status.en_route||0)+(stats.by_status.on_site||0)+(stats.by_status.rescue_ongoing||0)} color="orange"/>
        <StatCard label="Critical" value={stats.by_severity?.critical||0} color="red"/>
        <StatCard label="Resolved" value={stats.by_status?.resolved||0} color="green"/>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold mb-3">Incidents by Type</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={typeData} margin={{top:10,bottom:40}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.15)"/>
                <XAxis dataKey="name" fontSize={11} angle={-30} textAnchor="end" height={60} stroke="#94a3b8"/>
                <YAxis fontSize={11} stroke="#94a3b8"/>
                <Tooltip contentStyle={{background:'rgba(15,23,42,.9)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,color:'#fff',fontSize:12}}/>
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {typeData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold mb-3">Incidents by Severity</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={sevData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                  {sevData.map((e,i)=><Cell key={i} fill={{critical:'#ef4444',high:'#f97316',moderate:'#f59e0b',low:'#10b981'}[e.name]||COLORS[i]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'rgba(15,23,42,.9)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,color:'#fff',fontSize:12}}/>
                <Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="md:col-span-2">
          <h3 className="font-bold mb-3">Status Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={statusData} layout="vertical" margin={{left:80}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.15)"/>
                <XAxis type="number" fontSize={11} stroke="#94a3b8"/>
                <YAxis dataKey="name" type="category" fontSize={11} stroke="#94a3b8" width={100}/>
                <Tooltip contentStyle={{background:'rgba(15,23,42,.9)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,color:'#fff',fontSize:12}}/>
                <Bar dataKey="value" fill="#3b82f6" radius={[0,6,6,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
