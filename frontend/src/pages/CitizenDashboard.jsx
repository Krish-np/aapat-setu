import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import IncidentMap from '../components/IncidentMap'
import { PRIORITY_LABELS, STATUS_LABELS, timeAgo, getLocation } from '../lib/helpers'
import { useAuth } from '../store/auth'

export default function CitizenDashboard() {
  const { user } = useAuth()
  const [myReports, setMyReports] = useState([])
  const [nearby, setNearby] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loc, setLoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLocation().then(setLoc).catch(() => setLoc({ lat: 27.7172, lng: 85.3240 }))
  }, [])

  useEffect(() => {
    Promise.all([
      api.get('/api/incidents', { params: { mine: true } }),
      api.get('/api/incidents', { params: { status: 'verified,assigned,in_progress' } }),
      api.get('/api/alerts'),
    ]).then(([mine, near, al]) => {
      setMyReports(mine.data)
      setNearby(near.data)
      setAlerts(al.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-dim">Loading…</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Namaste, {user.name.split(' ')[0]} 👋</h1>
          <div className="page-subtitle">Stay safe. Aapat Setu is here to help you in emergencies.</div>
        </div>
        <Link to="/report" className="btn btn-primary">🚨 Report Emergency</Link>
      </div>

      <div className="hero-banner">
        <div className="hero-icon">🚨</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Need to report an emergency?</div>
          <div className="text-dim" style={{ fontSize: 13 }}>Tap "Report Emergency" to instantly share your location and situation. Our AI will triage it and connect you with responders and volunteers within seconds.</div>
        </div>
        <Link to="/report" className="btn btn-primary">Report Now</Link>
      </div>

      <div className="grid grid-3 mb-m">
        <div className="stat-card">
          <div className="stat-value">{myReports.length}</div>
          <div className="stat-label">My Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{myReports.filter(r => r.status === 'resolved').length}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{nearby.length}</div>
          <div className="stat-label">Active Nearby Incidents</div>
        </div>
      </div>

      {alerts.slice(0,2).map(a => (
        <div key={a.id} className={`alert-banner ${a.title.toLowerCase().includes('critical') || a.title.toLowerCase().includes('urgent') ? 'critical' : ''}`}>
          <strong>📢 {a.title}</strong><br />
          <span className="text-dim text-sm">{a.message}</span>
        </div>
      ))}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h3 className="card-title">📍 Incidents near you</h3>
          <IncidentMap incidents={nearby} center={loc ? [loc.lat, loc.lng] : null} userLocation={loc} height={340} />
        </div>
        <div className="card">
          <h3 className="card-title">📋 Your recent reports</h3>
          {myReports.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div>You haven't reported any incidents yet.</div>
              <Link to="/report" className="btn btn-primary mt-m">Report your first incident</Link>
            </div>
          )}
          {myReports.slice(0,6).map(r => (
            <Link to={`/incidents/${r.id}`} key={r.id} className="incident-card" style={{ marginBottom: 10, display: 'block' }}>
              <div className="incident-card-title">
                {r.incident_type?.toUpperCase()}
                <span className={`badge badge-priority-${r.ai_priority || r.severity}`}>{PRIORITY_LABELS[r.ai_priority||r.severity]}</span>
                <span style={{ marginLeft: 'auto' }} className={`badge badge-status-${r.status}`}>{STATUS_LABELS[r.status]}</span>
              </div>
              <div className="incident-card-desc">{r.ai_summary || r.description?.slice(0,120)}</div>
              <div className="incident-card-meta">
                <span>{timeAgo(r.created_at)}</span>
                <span>#{r.id}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
