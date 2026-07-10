import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import IncidentMap from '../components/IncidentMap'
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_LABELS, timeAgo } from '../lib/helpers'
import { toast } from '../lib/toast'

export default function ResponderDashboard() {
  const [incidents, setIncidents] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [inc, st] = await Promise.all([
      api.get('/api/incidents'),
      api.get('/api/incidents/stats/summary'),
    ])
    setIncidents(inc.data)
    setStats(st.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = incidents.filter(i => filter === 'all' || i.status === filter)
  const critical = incidents.filter(i => i.ai_priority === 'critical' && i.status !== 'resolved')
  const reported_unverified = incidents.filter(i => i.status === 'reported')
  const in_progress = incidents.filter(i => i.status === 'in_progress')

  const verifyIncident = async (id, e) => {
    e.stopPropagation()
    await api.patch(`/api/incidents/${id}`, { status: 'verified', notes: 'Verified by responder' })
    toast('Incident verified', 'ok')
    load()
  }

  if (loading) return <div className="text-dim">Loading…</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎯 Command Center</h1>
          <div className="page-subtitle"><span className="live-dot"></span> Live incidents across the network · {incidents.length} total</div>
        </div>
        <Link to="/alerts" className="btn btn-primary">📢 Broadcast Alert</Link>
      </div>

      {critical.length > 0 && (
        <div className="alert-banner critical" style={{ marginBottom: 18 }}>
          <strong>🚨 {critical.length} critical incident{critical.length>1?'s':''} needs attention:</strong>{' '}
          {critical.slice(0,3).map(c => c.ai_summary || c.incident_type).join(' · ')}
        </div>
      )}

      <div className="grid grid-4 mb-m">
        <div className="stat-card">
          <div className="stat-value stat-accent critical">{stats.by_priority.critical || 0}</div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-accent high">{stats.by_priority.high || 0}</div>
          <div className="stat-label">High Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{reported_unverified.length}</div>
          <div className="stat-label">Awaiting Verification</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-accent low">{in_progress.length}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="card-title" style={{ margin: 0 }}>🗺️ Live Situation Map</div>
          </div>
          <IncidentMap incidents={filtered} height={460} />
        </div>
        <div className="card">
          <div className="flex-between mb-m">
            <h3 className="card-title" style={{ margin: 0 }}>Incoming Reports</h3>
            <select className="form-select" style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
              value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="reported">Reported</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div style={{ maxHeight: 460, overflowY: 'auto', paddingRight: 4 }}>
            {filtered.length === 0 && <div className="empty-state">No incidents match filter</div>}
            {filtered.slice(0, 20).map((inc) => (
              <div key={inc.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="flex-between mb-s">
                  <div className="flex-center gap-s">
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: PRIORITY_COLORS[inc.ai_priority || inc.severity] }}></span>
                    <strong style={{ fontSize: 14 }}>{inc.incident_type?.toUpperCase()}</strong>
                    <span className={`badge badge-priority-${inc.ai_priority || inc.severity}`}>
                      {PRIORITY_LABELS[inc.ai_priority || inc.severity]}
                    </span>
                  </div>
                  <span className="text-dim text-sm">{timeAgo(inc.created_at)}</span>
                </div>
                {inc.ai_summary && <div className="text-sm" style={{ marginBottom: 8 }}>{inc.ai_summary}</div>}
                <div className="flex-between">
                  <span className={`badge badge-status-${inc.status}`}>{STATUS_LABELS[inc.status]}</span>
                  <div className="flex gap-s">
                    {inc.status === 'reported' && (
                      <button className="btn btn-primary btn-sm" onClick={(e) => verifyIncident(inc.id, e)}>Verify</button>
                    )}
                    <Link to={`/incidents/${inc.id}`} className="btn btn-ghost btn-sm">Open →</Link>
                  </div>
                </div>
                {inc.ai_flag_reason && (
                  <div className="text-sm text-dim mt-s">⚠️ Flagged: {inc.ai_flag_reason}</div>
                )}
                {inc.is_duplicate_of && (
                  <div className="text-sm text-dim mt-s">🔁 Possible duplicate of #{inc.is_duplicate_of}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
