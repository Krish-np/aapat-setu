import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import IncidentMap from '../components/IncidentMap'
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_LABELS, timeAgo, getLocation, haversine } from '../lib/helpers'
import { useAuth } from '../store/auth'
import { toast } from '../lib/toast'

export default function VolunteerDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loc, setLoc] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await api.get('/api/tasks')
    setTasks(data)
    setLoading(false)
  }

  useEffect(() => {
    getLocation().then(setLoc).catch(() => setLoc({ lat: user.lat || 27.71, lng: user.lng || 85.32 }))
    load()
  }, [])

  const claim = async (taskId) => {
    try {
      await api.post(`/api/tasks/${taskId}/claim`)
      toast('Task claimed — head to the location!', 'ok')
      load()
    } catch (e) { toast(e.response?.data?.detail || 'Could not claim', 'err') }
  }

  if (loading) return <div className="text-dim">Loading…</div>

  const available = tasks.filter(t => t.status === 'pending' && !t.volunteer_id)
  const mine = tasks.filter(t => t.volunteer_id === user.id && t.status !== 'completed')

  // Compute distances for available tasks
  const availableSorted = [...available].map(t => ({
    ...t,
    distance: loc && t.incident ? haversine(loc.lat, loc.lng, t.incident.lat, t.incident.lng) : null,
  })).sort((a,b) => (a.distance||99) - (b.distance||99))

  const mapIncidents = tasks
    .filter(t => t.incident)
    .map(t => ({ ...t.incident, task_id: t.id, task_status: t.status, volunteer_id: t.volunteer_id }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🤝 Volunteer Task Board</h1>
          <div className="page-subtitle"><span className="live-dot"></span> {available.length} open tasks near you · Thank you for helping!</div>
        </div>
      </div>

      <div className="grid grid-3 mb-m">
        <div className="stat-card">
          <div className="stat-value stat-accent high">{available.length}</div>
          <div className="stat-label">Open Tasks Nearby</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{mine.length}</div>
          <div className="stat-label">My Active Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-accent low">{tasks.filter(t => t.status === 'completed').length}</div>
          <div className="stat-label">Completed (network-wide)</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="card-title" style={{ margin: 0 }}>🗺️ Incidents Near You</div>
          </div>
          <IncidentMap incidents={mapIncidents} center={loc ? [loc.lat, loc.lng] : null} userLocation={loc} height={480} />
        </div>
        <div className="card">
          <h3 className="card-title">🔥 Tasks to Claim</h3>
          {availableSorted.length === 0 && <div className="empty-state"><div className="empty-state-icon">✅</div>All clear — no open tasks near you right now.</div>}
          <div style={{ maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
            {availableSorted.map(t => (
              <div key={t.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="flex-between mb-s">
                  <div className="flex-center gap-s">
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: PRIORITY_COLORS[t.incident?.severity] }}></span>
                    <strong>{t.incident?.incident_type?.toUpperCase()}</strong>
                    <span className={`badge badge-priority-${t.incident?.severity}`}>{PRIORITY_LABELS[t.incident?.severity]}</span>
                  </div>
                  {t.distance != null && <span className="text-sm text-dim">{t.distance.toFixed(2)} km away</span>}
                </div>
                <div className="text-sm" style={{ marginBottom: 10 }}>{t.incident?.ai_summary}</div>
                <div className="flex-between">
                  <span className="text-dim text-sm">{timeAgo(t.created_at)}</span>
                  <div className="flex gap-s">
                    <Link to={`/incidents/${t.incident_id}`} className="btn btn-ghost btn-sm">Details</Link>
                    <button className="btn btn-primary btn-sm" onClick={() => claim(t.id)}>✋ Claim Task</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {mine.length > 0 && (
        <div className="card mt-m">
          <h3 className="card-title">✅ My Active Tasks</h3>
          <div className="grid grid-2">
            {mine.map(t => (
              <Link to={`/incidents/${t.incident_id}`} key={t.id} className="incident-card">
                <div className="incident-card-title">
                  {t.incident?.incident_type?.toUpperCase()}
                  <span className={`badge badge-status-${t.incident?.status}`}>{STATUS_LABELS[t.incident?.status]}</span>
                </div>
                <div className="incident-card-desc">{t.incident?.ai_summary}</div>
                <div className="incident-card-meta">
                  <span>Task: {t.status}</span>
                  <span>{timeAgo(t.updated_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
