import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../store/auth'
import { timeAgo } from '../lib/helpers'
import { toast } from '../lib/toast'

export default function Alerts() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const load = async () => {
    const { data } = await api.get('/api/alerts')
    setAlerts(data)
  }
  useEffect(() => { load() }, [])

  const broadcast = async (e) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return
    setSending(true)
    try {
      await api.post('/api/alerts', { title, message })
      toast('Alert broadcast to all users!', 'ok')
      setTitle(''); setMessage('')
      load()
    } catch (e) { toast(e.response?.data?.detail || 'Failed', 'err') }
    finally { setSending(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📢 Public Alerts</h1>
          <div className="page-subtitle">Safety broadcasts from emergency agencies</div>
        </div>
      </div>

      {user.role === 'responder' && (
        <div className="card mb-m">
          <h3 className="card-title">📣 Broadcast New Alert</h3>
          <form onSubmit={broadcast}>
            <div className="form-group">
              <label className="form-label">Alert title</label>
              <input className="form-input" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Heavy Rain Warning - avoid Bagmati banks" required />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-textarea form-input" value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Describe the alert, affected areas, and safety instructions..." rows={3} required />
            </div>
            <button className="btn btn-primary" disabled={sending}>
              {sending ? 'Broadcasting...' : '📢 Send to all users'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">Recent Alerts</h3>
        {alerts.length === 0 && <div className="empty-state">No alerts at this time</div>}
        {alerts.map(a => (
          <div key={a.id} className="alert-banner" style={{ marginBottom: 10 }}>
            <div className="flex-between">
              <strong style={{ fontSize: 15 }}>📢 {a.title}</strong>
              <span className="text-dim text-sm">{timeAgo(a.created_at)}</span>
            </div>
            <div className="text-sm mt-s">{a.message}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
