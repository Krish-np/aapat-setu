import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { PRIORITY_LABELS, STATUS_LABELS, timeAgo } from '../lib/helpers'
import { toast } from '../lib/toast'
import { useAuth } from '../store/auth'

export default function IncidentsList() {
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await api.get('/api/incidents', { params: statusFilter ? { status: statusFilter } : {} })
    setIncidents(data); setLoading(false)
  }
  useEffect(() => { load() }, [statusFilter])

  const setStatus = async (id, status) => {
    await api.patch(`/api/incidents/${id}`, { status, notes: `Status set to ${status}` })
    toast(`Status updated to ${status}`, 'ok')
    load()
  }

  if (loading) return <div className="text-dim">Loading…</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 All Incidents</h1>
          <div className="page-subtitle">{incidents.length} incidents total</div>
        </div>
        <select className="form-select" style={{ width: 200 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="reported">Reported</option>
          <option value="verified">Verified</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Type</th><th>AI Summary</th><th>Priority</th><th>Status</th><th>Reported</th>{user.role === 'responder' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id}>
                  <td className="mono">#{inc.id}</td>
                  <td><strong style={{ textTransform: 'capitalize' }}>{inc.incident_type}</strong></td>
                  <td style={{ maxWidth: 320 }}>
                    <Link to={`/incidents/${inc.id}`} style={{ color: 'var(--text)' }}>
                      {inc.ai_summary || inc.description?.slice(0, 100)}
                    </Link>
                    {inc.is_duplicate_of && <div className="text-dim text-sm">🔁 Duplicate of #{inc.is_duplicate_of}</div>}
                    {inc.ai_flag_reason && <div className="text-dim text-sm">⚠️ {inc.ai_flag_reason}</div>}
                  </td>
                  <td><span className={`badge badge-priority-${inc.ai_priority || inc.severity}`}>{PRIORITY_LABELS[inc.ai_priority||inc.severity]}</span></td>
                  <td><span className={`badge badge-status-${inc.status}`}>{STATUS_LABELS[inc.status]}</span></td>
                  <td className="text-dim text-sm">{timeAgo(inc.created_at)}</td>
                  {user.role === 'responder' && (
                    <td>
                      <div className="flex gap-s" style={{ flexWrap: 'wrap' }}>
                        {inc.status === 'reported' && <button className="btn btn-sm btn-primary" onClick={() => setStatus(inc.id, 'verified')}>Verify</button>}
                        {inc.status === 'verified' && <button className="btn btn-sm btn-ghost" onClick={() => setStatus(inc.id, 'assigned')}>Mark Assigned</button>}
                        {inc.status === 'assigned' && <button className="btn btn-sm btn-ghost" onClick={() => setStatus(inc.id, 'in_progress')}>Start</button>}
                        {inc.status !== 'resolved' && inc.status !== 'reported' && <button className="btn btn-sm btn-ok" onClick={() => setStatus(inc.id, 'resolved')}>Resolve</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
