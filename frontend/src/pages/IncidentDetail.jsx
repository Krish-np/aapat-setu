import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import IncidentMap from '../components/IncidentMap'
import { PRIORITY_LABELS, STATUS_LABELS, timeAgo } from '../lib/helpers'
import { useAuth } from '../store/auth'
import { toast } from '../lib/toast'

export default function IncidentDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [incident, setIncident] = useState(null)
  const [tasks, setTasks] = useState([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [inc, ts] = await Promise.all([
      api.get(`/api/incidents/${id}`),
      api.get('/api/tasks'),
    ])
    setIncident(inc.data)
    setTasks(ts.data.filter(t => t.incident_id === Number(id)))
    setLoading(false)
  }
  useEffect(() => { load() }, [id])

  if (loading || !incident) return <div className="text-dim">Loading…</div>

  const myTask = tasks.find(t => t.volunteer_id === user.id)
  const openTask = tasks.find(t => !t.volunteer_id)

  const claim = async () => {
    if (!openTask) { toast('No open task for this incident', 'err'); return }
    await api.post(`/api/tasks/${openTask.id}/claim`)
    toast('Task claimed!', 'ok'); load()
  }

  const updateTask = async (status) => {
    if (!myTask) return
    await api.patch(`/api/tasks/${myTask.id}`, { status, notes: note || undefined })
    setNote('')
    toast(`Task marked ${status}`, 'ok'); load()
  }

  const changeStatus = async (status) => {
    await api.patch(`/api/incidents/${id}`, { status })
    toast(`Status: ${status}`, 'ok'); load()
  }

  const isOwner = incident.reporter_id === user.id

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/incidents" className="text-dim text-sm">← Back to incidents</Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ textTransform: 'capitalize' }}>
            {incident.incident_type}
            <span className={`badge badge-priority-${incident.ai_priority || incident.severity}`} style={{ marginLeft: 12, fontSize: 12 }}>
              {PRIORITY_LABELS[incident.ai_priority || incident.severity]} Priority
            </span>
          </h1>
          <div className="page-subtitle">
            Reported {timeAgo(incident.created_at)} by {incident.reporter?.name || 'anonymous'} ·
            <span className={`badge badge-status-${incident.status}`} style={{ marginLeft: 8 }}>{STATUS_LABELS[incident.status]}</span>
          </div>
        </div>
        {user.role === 'responder' && (
          <div className="flex gap-s">
            {incident.status === 'reported' && <button className="btn btn-primary" onClick={() => changeStatus('verified')}>✓ Verify</button>}
            {incident.status !== 'resolved' && <button className="btn btn-ok" onClick={() => changeStatus('resolved')}>Mark Resolved</button>}
          </div>
        )}
      </div>

      {incident.ai_summary && (
        <div className="card mb-m" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <span className="ai-pill mb-s">🤖 AI Summary</span>
          <div style={{ fontSize: 16, marginTop: 10 }}>{incident.ai_summary}</div>
          <div className="flex gap-s mt-s" style={{ flexWrap: 'wrap' }}>
            {incident.ai_verified
              ? <span style={{ color: 'var(--ok)', fontSize: 13 }}>✓ Report passes AI plausibility checks</span>
              : <span style={{ color: 'var(--warn)', fontSize: 13 }}>⚠️ Flagged: {incident.ai_flag_reason}</span>}
            {incident.is_duplicate_of && <span style={{ color: 'var(--warn)', fontSize: 13 }}>🔁 Possible duplicate of #{incident.is_duplicate_of}</span>}
          </div>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div>
          <div className="card mb-m">
            <h3 className="card-title">📍 Location</h3>
            <IncidentMap incidents={[incident]} center={[incident.lat, incident.lng]} height={320} />
            {incident.address && <div className="text-sm mt-s text-dim">📍 {incident.address}</div>}
            <div className="mono text-dim text-sm mt-s">{incident.lat.toFixed(5)}, {incident.lng.toFixed(5)}</div>
          </div>

          <div className="card mb-m">
            <h3 className="card-title">📝 Original Report</h3>
            <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{incident.description}</p>
            {incident.reporter && (
              <div className="text-dim text-sm mt-m">
                Reported by: <strong>{incident.reporter.name}</strong> · {incident.reporter.phone}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card mb-m">
            <h3 className="card-title">📊 Status Timeline</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-time">{new Date(incident.created_at).toLocaleString()}</div>
                <div className="timeline-status">Report Submitted</div>
                <div className="text-dim text-sm">AI analysis completed</div>
              </div>
              {incident.history.map(h => (
                <div key={h.id} className="timeline-item">
                  <div className="timeline-time">{new Date(h.created_at).toLocaleString()}</div>
                  <div className="timeline-status" style={{ textTransform: 'capitalize' }}>
                    {h.from_status && <>{h.from_status} → </>}{h.to_status}
                  </div>
                  {h.note && <div className="text-dim text-sm">{h.note}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Volunteer actions */}
          {user.role === 'volunteer' && (
            <div className="card mb-m">
              <h3 className="card-title">🤝 Volunteer Actions</h3>
              {!myTask && openTask ? (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={claim}>✋ Claim this Task</button>
              ) : myTask ? (
                <>
                  <div className="text-sm mb-s">You claimed this task · Status: <strong>{myTask.status}</strong></div>
                  <div className="form-group">
                    <label className="form-label">Update note</label>
                    <textarea className="form-textarea form-input" value={note} onChange={e => setNote(e.target.value)}
                      placeholder="e.g. Reached the location, starting evacuation..." rows={3} />
                  </div>
                  <div className="flex gap-s" style={{ flexWrap: 'wrap' }}>
                    {myTask.status !== 'in_progress' && myTask.status !== 'completed' && (
                      <button className="btn btn-primary btn-sm" onClick={() => updateTask('in_progress')}>On Scene / In Progress</button>
                    )}
                    <button className="btn btn-ok btn-sm" onClick={() => updateTask('completed')}>✓ Mark Complete</button>
                  </div>
                  {myTask.notes && (
                    <div className="mt-m text-sm" style={{ padding: 10, background: 'var(--bg-elev)', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
                      {myTask.notes}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-dim text-sm">No open tasks for this incident.</div>
              )}
            </div>
          )}

          {isOwner && (
            <div className="card">
              <h3 className="card-title">📱 Your Report</h3>
              <div className="text-sm">This is your report. You'll see updates here as responders and volunteers act on it.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
