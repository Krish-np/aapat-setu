import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import api from '../lib/api'
import { INCIDENT_TYPES, getLocation } from '../lib/helpers'
import { toast } from '../lib/toast'

function PickLocation({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition({ lat: e.latlng.lat, lng: e.latlng.lng }) },
  })
  return null
}

function FlyTo({ position }) {
  const map = useMap()
  useEffect(() => { if (position) map.flyTo([position.lat, position.lng], 15) }, [position, map])
  return null
}

export default function ReportIncident() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [incident_type, setType] = useState('flood')
  const [description, setDesc] = useState('')
  const [severity, setSeverity] = useState('')
  const [position, setPosition] = useState(null)
  const [address, setAddress] = useState('')
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const descRef = useRef(null)

  useEffect(() => {
    setLocating(true)
    getLocation()
      .then(p => setPosition(p))
      .catch(() => setPosition({ lat: 27.7172, lng: 85.3240 }))
      .finally(() => setLocating(false))
  }, [])

  const pinIcon = L.divIcon({
    className: 'report-pin',
    html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:#ef4444;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.5);display:grid;place-items:center;"><div style="transform:rotate(45deg);color:white;font-size:16px;">📍</div></div>`,
    iconSize: [32, 32], iconAnchor: [16, 32],
  })

  const detect = () => { setLocating(true); getLocation().then(setPosition).finally(() => setLocating(false)) }

  const submit = async () => {
    if (!description.trim()) { toast('Please describe the situation', 'err'); descRef.current?.focus(); return }
    if (!position) { toast('Please mark the location on the map', 'err'); return }
    setSubmitting(true)
    try {
      const { data } = await api.post('/api/incidents', {
        incident_type, description,
        lat: position.lat, lng: position.lng,
        severity: severity || undefined, address,
      })
      setResult(data)
      setStep(3)
      if (data.is_duplicate_of) {
        toast('⚠️ Possible duplicate detected — flagged for review', 'err')
      } else if (!data.ai_verified) {
        toast(`Submitted, but flagged: ${data.ai_flag_reason}`, 'err')
      } else {
        toast(`🚨 Report submitted! AI assigned ${data.ai_priority} priority.`, 'ok')
      }
    } catch (e) {
      toast(e.response?.data?.detail || 'Failed to submit report', 'err')
    } finally { setSubmitting(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🚨 Report an Emergency</h1>
          <div className="page-subtitle">Tell us what's happening — AI will instantly triage and notify the right responders.</div>
        </div>
      </div>

      {/* Progress stepper */}
      <div className="flex gap-s mb-m" style={{ maxWidth: 700 }}>
        {['Details', 'Location', 'Done'].map((label, i) => (
          <React.Fragment key={i}>
            <div className={`flex-center gap-s`} style={{ fontSize: 13, fontWeight: 600, color: step > i ? 'var(--ok)' : step === i+1 ? 'var(--brand)' : 'var(--text-dim)' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: step > i ? 'var(--ok)' : step === i+1 ? 'var(--brand)' : 'var(--border)', color: 'white', display:'grid',placeItems:'center', fontSize:12, fontWeight:800 }}>{i+1}</div>
              {label}
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: 'var(--border)', alignSelf: 'center' }}></div>}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
          <div className="card">
            <h3 className="card-title">What's happening?</h3>

            <div className="form-group">
              <label className="form-label">Type of emergency</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {INCIDENT_TYPES.map(t => (
                  <button key={t} type="button" className={incident_type === t ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                    onClick={() => setType(t)} style={{ textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Describe what you see <span className="text-dim" style={{ fontWeight: 400 }}>(as much detail as possible — AI will analyze this)</span></label>
              <textarea ref={descRef} className="form-textarea form-input" value={description}
                onChange={e => setDesc(e.target.value)}
                placeholder="e.g. Flood water has entered ground floor, people trapped on the roof, water rising fast..."
                rows={5} />
              <div className="text-sm text-dim mt-s">💡 Tip: mention injuries, urgency, and landmarks to get a faster response.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Severity (optional — AI will auto-assess)</label>
              <select className="form-select" value={severity} onChange={e => setSeverity(e.target.value)}>
                <option value="">Let AI decide</option>
                <option value="low">Low — no immediate danger</option>
                <option value="medium">Medium — needs attention</option>
                <option value="high">High — urgent help needed</option>
                <option value="critical">Critical — lives at risk</option>
              </select>
            </div>

            <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!description.trim()}>
              Next: Pin Location →
            </button>
          </div>

          <div className="card">
            <h3 className="card-title">💡 What happens next?</h3>
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              <div className="flex gap-s mb-s"><span className="ai-pill">AI</span> Your description is verified &amp; summarized</div>
              <div className="flex gap-s mb-s"><span className="ai-pill">AI</span> Priority score assigned instantly</div>
              <div className="flex gap-s mb-s"><span className="ai-pill">AI</span> Duplicate reports are merged</div>
              <div className="flex gap-s mb-s"><span>🎯</span> Nearest responders are notified</div>
              <div className="flex gap-s mb-s"><span>🤝</span> Nearby volunteers receive the task</div>
              <div className="flex gap-s"><span>📱</span> You get live status updates here</div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && position && (
        <div className="card">
          <div className="flex-between mb-m">
            <h3 className="card-title" style={{ margin: 0 }}>📍 Pin the exact location</h3>
            <button className="btn btn-ghost btn-sm" onClick={detect} disabled={locating}>
              📡 {locating ? 'Detecting...' : 'Use my location'}
            </button>
          </div>
          <div className="text-sm text-dim mb-s">Click on the map to adjust the pin. Be as precise as possible.</div>
          <div className="map-wrap" style={{ height: 400 }}>
            <MapContainer center={[position.lat, position.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <PickLocation position={position} setPosition={setPosition} />
              <FlyTo position={position} />
              <Marker position={[position.lat, position.lng]} icon={pinIcon} />
            </MapContainer>
          </div>
          <div className="form-group mt-m">
            <label className="form-label">Address / landmark (optional)</label>
            <input className="form-input" value={address} onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Near New Road Gate, opposite Bishal Bazaar" />
          </div>
          <div className="flex gap-s">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? '🤖 AI is processing...' : '🚨 Submit Report'}
            </button>
          </div>
          <div className="mono text-dim mt-s">Coordinates: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}</div>
        </div>
      )}

      {step === 3 && result && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
          <h2 style={{ marginTop: 0 }}>Report Submitted!</h2>
          <div className="text-dim mb-m">Your report has been sent to responders and volunteers.</div>

          <div className="card" style={{ textAlign: 'left', background: 'var(--bg-elev)', maxWidth: 520, margin: '0 auto' }}>
            <div style={{ marginBottom: 10 }}>
              <span className="ai-pill">🤖 AI Summary</span>
            </div>
            <div style={{ fontSize: 15, marginBottom: 14 }}>{result.ai_summary}</div>
            <div className="flex gap-s" style={{ flexWrap: 'wrap' }}>
              <span className={`badge badge-priority-${result.ai_priority}`}>Priority: {result.ai_priority}</span>
              <span className={`badge badge-status-${result.status}`}>Status: {result.status}</span>
              {result.ai_verified && <span className="badge" style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.4)' }}>✓ Verified by AI</span>}
              {result.is_duplicate_of && <span className="badge" style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.4)' }}>🔁 Possible Duplicate</span>}
            </div>
          </div>

          <div className="flex gap-s mt-l" style={{ justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => { setStep(1); setDesc(''); setResult(null); setAddress('') }}>Report Another</button>
            <button className="btn btn-primary" onClick={() => navigate(`/incidents/${result.id}`)}>Track Report Status →</button>
          </div>
        </div>
      )}
    </div>
  )
}
