import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { PRIORITY_LABELS, STATUS_LABELS, timeAgo } from '../lib/helpers'

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/incidents', { params: { mine: true } }).then(r => { setReports(r.data); setLoading(false) })
  }, [])

  if (loading) return <div className="text-dim">Loading…</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 My Reports</h1>
          <div className="page-subtitle">Track the status of emergencies you've reported</div>
        </div>
        <Link to="/report" className="btn btn-primary">🚨 New Report</Link>
      </div>

      {reports.length === 0 && (
        <div className="card empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No reports yet</h3>
          <div className="text-dim mb-m">When you report an emergency, you'll see live updates here.</div>
          <Link to="/report" className="btn btn-primary">Report an emergency</Link>
        </div>
      )}

      <div className="grid">
        {reports.map(r => (
          <Link to={`/incidents/${r.id}`} key={r.id} className="incident-card">
            <div className="incident-card-title">
              {r.incident_type?.toUpperCase()}
              <span className={`badge badge-priority-${r.ai_priority || r.severity}`}>{PRIORITY_LABELS[r.ai_priority||r.severity]}</span>
              <span style={{ marginLeft: 'auto' }} className={`badge badge-status-${r.status}`}>{STATUS_LABELS[r.status]}</span>
            </div>
            <div className="incident-card-desc">{r.ai_summary || r.description?.slice(0,140)}</div>
            {r.ai_summary && <div className="text-sm text-dim mt-s"><span className="ai-pill">AI</span> Auto-summarized</div>}
            <div className="incident-card-meta">
              <span>Reported {timeAgo(r.created_at)}</span>
              <span>#{r.id} · View updates →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
