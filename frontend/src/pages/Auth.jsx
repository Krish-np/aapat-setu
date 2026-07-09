import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { toast } from '../lib/toast'

const DEMO_ACCOUNTS = [
  { phone: '9800000004', password: 'demo1234', label: 'Responder (Agency)', icon: '🎯' },
  { phone: '9800000002', password: 'demo1234', label: 'Volunteer', icon: '🤝' },
  { phone: '9800000001', password: 'demo1234', label: 'Citizen', icon: '👤' },
]

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('citizen')
  const { login, register, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const doSubmit = async (e) => {
    e.preventDefault()
    try {
      if (mode === 'login') {
        await login(phone, password)
      } else {
        await register({ name, phone, password, role })
      }
      toast('Welcome to Aapat Setu', 'ok')
      const redir = location.state?.from || '/'
      navigate(redir, { replace: true })
    } catch (err) {
      toast(err.response?.data?.detail || 'Something went wrong', 'err')
    }
  }

  const quickLogin = async (acc) => {
    setPhone(acc.phone); setPassword(acc.password)
    try {
      await login(acc.phone, acc.password)
      toast(`Logged in as ${acc.label}`, 'ok')
      navigate('/', { replace: true })
    } catch (err) { toast(err.response?.data?.detail || 'Login failed', 'err') }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-grid', placeItems: 'center', width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg,#ef4444,#b91c1c)', fontSize: 28, fontWeight: 800, color: 'white', boxShadow: '0 4px 16px rgba(239,68,68,0.4)' }}>S</div>
          <h1 style={{ margin: '14px 0 4px' }}>Aapat Setu</h1>
          <div className="text-dim" style={{ fontSize: 13 }}>AI-powered emergency coordination network</div>
          <a href="/" className="text-dim" style={{ fontSize: 12, marginTop: 6, display: 'inline-block' }}>← Back to project website</a>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Log in</div>
          <div className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</div>
        </div>

        <form onSubmit={doSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">I am a</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="citizen">Citizen (report incidents)</option>
                  <option value="volunteer">Volunteer (respond to tasks)</option>
                  <option value="responder">Responder / Agency (command center)</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label">Phone number</label>
            <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="e.g. 9800000001" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Log in' : 'Create account')}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div className="text-dim" style={{ fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
            ⚡ Demo accounts — click to enter instantly
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO_ACCOUNTS.map((a) => (
              <button key={a.phone} type="button" className="btn btn-ghost btn-sm"
                onClick={() => quickLogin(a)} style={{ justifyContent: 'flex-start' }}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                {a.label} <span className="mono text-dim" style={{ marginLeft: 'auto' }}>{a.phone}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
