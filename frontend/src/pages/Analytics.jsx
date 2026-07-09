import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, CartesianGrid } from 'recharts'
import { PRIORITY_COLORS } from '../lib/helpers'

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#14b8a6', '#f97316']

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [incidents, setIncidents] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/api/incidents/stats/summary'),
      api.get('/api/incidents'),
    ]).then(([s, i]) => { setStats(s.data); setIncidents(i.data) })
  }, [])

  if (!stats) return <div className="text-dim">Loading…</div>

  const statusData = Object.entries(stats.by_status).map(([k, v]) => ({ name: k, value: v }))
  const priorityData = Object.entries(stats.by_priority).map(([k, v]) => ({ name: k, value: v }))
  const typeData = Object.entries(stats.by_type).map(([k, v]) => ({ name: k, count: v })).sort((a,b) => b.count - a.count)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Analytics Dashboard</h1>
          <div className="page-subtitle">Overview of all incident data across the network</div>
        </div>
      </div>

      <div className="grid grid-4 mb-m">
        <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Incidents</div></div>
        <div className="stat-card"><div className="stat-value stat-accent critical">{stats.by_status.reported || 0}</div><div className="stat-label">Open Reports</div></div>
        <div className="stat-card"><div className="stat-value stat-accent high">{stats.by_priority.critical || 0}</div><div className="stat-label">Critical</div></div>
        <div className="stat-card"><div className="stat-value stat-accent low">{stats.by_status.resolved || 0}</div><div className="stat-label">Resolved</div></div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="card-title">Incidents by Type</h3>
          <div className="chart-wrap">
            <ResponsiveContainer>
              <BarChart data={typeData} margin={{ top: 10, right: 20, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-20} textAnchor="end" fontSize={12} interval={0} />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Incidents by Priority</h3>
          <div className="chart-wrap">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label>
                  {priorityData.map((e) => <Cell key={e.name} fill={PRIORITY_COLORS[e.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-m">
        <h3 className="card-title">Status Breakdown</h3>
        <div className="chart-wrap">
          <ResponsiveContainer>
            <BarChart data={statusData} layout="vertical" margin={{ top: 10, right: 30, bottom: 10, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={13} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
