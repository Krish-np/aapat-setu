import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import IncidentMap from '../components/IncidentMap'
import { PRIORITY_LABELS, STATUS_LABELS, timeAgo } from '../lib/helpers'

export default function MapPage() {
  const [incidents, setIncidents] = useState([])
  const [selected, setSelected] = useState(null)
  const [statusFilter, setStatusFilter] = useState('active')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/incidents').then(r => setIncidents(r.data))
  }, [])

  const filtered = incidents.filter(i => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'active') return i.status !== 'resolved'
    return i.status === statusFilter
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🗺️ Live Incident Map</h1>
          <div className="page-subtitle"><span className="live-dot"></span> Real-time view · {filtered.length} incidents shown</div>
        </div>
        <select className="form-select" style={{ width: 200 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="active">Active incidents</option>
          <option value="all">All incidents</option>
          <option value="reported">Reported only</option>
          <option value="verified">Verified only</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 340px' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <IncidentMap incidents={filtered} height={600} onSelect={setSelected} />
        </div>
        <div className="card">
          <h3 className="card-title">Incident List</h3>
          <div style={{ maxHeight: 560, overflowY: 'auto', paddingRight: 4 }}>
            {filtered.length === 0 && <div className="empty-state">No incidents match filter</div>}
            {filtered.map(inc => (
              <div key={inc.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => navigate(`/incidents/${inc.id}`)}>
                <div className="flex-between mb-s">
                  <strong style={{ textTransform: 'capitalize', fontSize: 13 }}>{inc.incident_type}</strong>
                  <span className={`badge badge-priority-${inc.ai_priority || inc.severity}`}>{PRIORITY_LABELS[inc.ai_priority||inc.severity]}</span>
                </div>
                <div className="text-sm text-dim" style={{ marginBottom: 4 }}>{(inc.ai_summary || inc.description).slice(0,90)}</div>
                <div className="flex-between">
                  <span className={`badge badge-status-${inc.status}`}>{STATUS_LABELS[inc.status]}</span>
                  <span className="text-sm text-dim">{timeAgo(inc.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
