import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../store/auth'
import { PRIORITY_LABELS, STATUS_LABELS, timeAgo } from '../lib/helpers'
import { toast } from '../lib/toast'

export default function MyTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState({})

  const load = async () => {
    const { data } = await api.get('/api/tasks')
    setTasks(data.filter(t => t.volunteer_id === user.id))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const update = async (id, status) => {
    await api.patch(`/api/tasks/${id}`, { status, notes: note[id] || undefined })
    setNote(n => ({ ...n, [id]: '' }))
    toast(`Task ${status}`, 'ok')
    load()
  }

  if (loading) return <div className="text-dim">Loading…</div>

  const active = tasks.filter(t => t.status !== 'completed')
  const done = tasks.filter(t => t.status === 'completed')

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">✅ My Tasks</h1>
          <div className="page-subtitle">{active.length} active · {done.length} completed</div>
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="card empty-state">
          <div className="empty-state-icon">🤝</div>
          <h3>No tasks yet</h3>
          <div className="text-dim mb-m">Head to the Volunteer Dashboard to browse and claim tasks near you.</div>
          <Link to="/volunteer" className="btn btn-primary">Browse Tasks</Link>
        </div>
      )}

      <div className="grid">
        {[...active, ...done].map(t => (
          <div key={t.id} className="card">
            <div className="flex-between mb-s">
              <strong style={{ textTransform: 'capitalize' }}>{t.incident?.incident_type}</strong>
              <div className="flex gap-s">
                <span className={`badge badge-priority-${t.incident?.severity}`}>{PRIORITY_LABELS[t.incident?.severity]}</span>
                <span className={`badge badge-status-${t.incident?.status}`}>{STATUS_LABELS[t.incident?.status]}</span>
              </div>
            </div>
            <div className="text-sm text-dim mb-m">{t.incident?.ai_summary}</div>

            {t.status !== 'completed' && (
              <>
                <div className="form-group">
                  <label className="form-label">Progress note</label>
                  <textarea className="form-textarea form-input" value={note[t.id] || ''}
                    onChange={e => setNote(n => ({ ...n, [t.id]: e.target.value }))}
                    placeholder="Share an update..." rows={2} />
                </div>
                <div className="flex gap-s">
                  {t.status !== 'in_progress' && (
                    <button className="btn btn-primary btn-sm" onClick={() => update(t.id, 'in_progress')}>Start Work</button>
                  )}
                  <button className="btn btn-ok btn-sm" onClick={() => update(t.id, 'completed')}>✓ Complete Task</button>
                  <Link to={`/incidents/${t.incident_id}`} className="btn btn-ghost btn-sm">View Details</Link>
                </div>
              </>
            )}
            {t.status === 'completed' && (
              <div className="text-sm" style={{ color: 'var(--ok)' }}>✓ Completed {timeAgo(t.updated_at)}</div>
            )}
            {t.notes && <div className="mt-m text-sm" style={{ padding: 10, background: 'var(--bg-elev)', borderRadius: 8, whiteSpace: 'pre-wrap' }}>{t.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
