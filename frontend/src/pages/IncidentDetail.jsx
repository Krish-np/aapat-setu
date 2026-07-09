import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Card, Button, Badge, priorityBadge, statusBadge } from '../components/ui'
import Map from '../components/Map'
import BackButton from '../components/BackButton'
import { useAuth } from '../store/auth'
import { toast } from '../components/toaster'
import { Clock, Users, MapPin, Shield, AlertTriangle, Sparkles, CheckCircle2, Mic, Image as ImageIcon, FileText, Send } from 'lucide-react'

export default function IncidentDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const [inc, setInc] = useState(null)
  const [tasks, setTasks] = useState([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [myLoc, setMyLoc] = useState(null)
  const [locStatus, setLocStatus] = useState('idle')

  const load = () => Promise.all([
    api.get(`/api/incidents/${id}`), api.get('/api/tasks')
  ]).then(([i,t])=>{ setInc(i.data); setTasks(t.data.filter(x=>x.incident_id===Number(id))); setLoading(false) })
  useEffect(()=>{load()},[id])

  // Get browser geolocation for routing
  useEffect(() => {
    if (!inc) return
    // Start with user's stored profile location as fallback
    if (user?.lat && user?.lng) {
      setMyLoc({ lat: Number(user.lat), lng: Number(user.lng) })
    }
    if (!navigator.geolocation) return
    setLocStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (p) => { setMyLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocStatus('ok') },
      () => { setLocStatus('denied') },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [inc && inc.id])

  if (loading || !inc) return <div className="grid place-items-center min-h-[40vh] text-ink-400">Loading...</div>

  const pb = priorityBadge(inc.ai_severity||inc.severity); const sb = statusBadge(inc.status)
  const myTask = tasks.find(t => t.assignee_id === user.id)
  const openTask = tasks.find(t => !t.assignee_id)

  const claim = async () => {
    if (!openTask) return toast('No open task', 'err')
    await api.post(`/api/tasks/${openTask.id}/claim`)
    toast('Task claimed!', 'ok'); load()
  }
  const update = async (status) => {
    if (!myTask) return
    await api.patch(`/api/tasks/${myTask.id}`, { status, notes: note||undefined })
    setNote(''); toast(`Marked ${status}`, 'ok'); load()
  }
  const isResponder = ['responder','admin','police','fire','hospital','municipality','ngo'].includes(user.role)

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
      <BackButton label="Back to incidents" />

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold capitalize flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={26}/>
                {inc.incident_type.replace('_',' ')}
              </h1>
              <Badge color={pb.color}>{pb.label}</Badge>
              <Badge color={sb.color}>{sb.label.replace('_',' ')}</Badge>
            </div>
            <p className="text-ink-500 text-sm mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><Clock size={14}/> Reported {new Date(inc.created_at).toLocaleString()}</span>
              {inc.people_affected>0 && <span className="flex items-center gap-1"><Users size={14}/> ~{inc.people_affected} people affected</span>}
              {inc.address && <span className="flex items-center gap-1"><MapPin size={14}/> {inc.address}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            {isResponder && inc.status !== 'resolved' && (
              <Button size="sm" variant="success" onClick={async () => { await api.patch(`/api/incidents/${id}`,{status:'resolved'}); toast('Resolved','ok'); load() }}>
                <CheckCircle2 size={16}/> Mark Resolved
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <div className="space-y-5">
          {inc.ai_summary && (
            <Card className="!border-l-4 !border-l-purple-500">
              <div className="flex items-center gap-2 mb-2"><Sparkles className="text-purple-500" size={18}/> <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">AI Briefing</span></div>
              <p className="text-base font-semibold leading-relaxed">{inc.ai_summary}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                <AIStat label="Severity" value={inc.ai_severity?.toUpperCase()} color="red"/>
                <AIStat label="Confidence" value={`${Math.round((inc.ai_confidence||0)*100)}%`} color="blue"/>
                <AIStat label="ETA" value={`${inc.ai_response_time_min}m`} color="amber"/>
                <AIStat label="Est. victims" value={inc.ai_estimated_victims} color="purple"/>
              </div>
              {inc.ai_required_resources?.length>0 && (
                <div className="mt-4">
                  <div className="text-xs font-bold text-ink-500 mb-2">Required Resources</div>
                  <div className="flex flex-wrap gap-1.5">{inc.ai_required_resources.map(r=><Badge key={r} color="blue">{r.replace('_',' ')}</Badge>)}</div>
                </div>
              )}
              {inc.ai_safety_instructions && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-sm">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">⚠️ Safety Instructions</div>
                  {inc.ai_safety_instructions}
                </div>
              )}
            </Card>
          )}

          <Card className="!p-0 overflow-hidden">
            <div className="p-5 border-b border-ink-200 dark:border-ink-800 font-bold flex items-center justify-between">
              <div className="flex items-center gap-2"><MapPin size={18}/> Location</div>
              <button
                onClick={() => {
                  if (!navigator.geolocation) return
                  setLocStatus('requesting')
                  navigator.geolocation.getCurrentPosition(
                    (p) => { setMyLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocStatus('ok') },
                    () => setLocStatus('denied'),
                    { enableHighAccuracy: true, timeout: 8000 }
                  )
                }}
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
              >
                {locStatus === 'requesting' ? 'Locating…' : locStatus === 'denied' ? 'Location blocked — retry' : myLoc ? 'Recenter on me' : 'Use my location'}
              </button>
            </div>
            <Map
              incidents={[inc]}
              height={350}
              zoom={16}
              center={[inc.lat,inc.lng]}
              userLoc={myLoc}
              routeTo={[inc.lat, inc.lng]}
            />
          </Card>

          <Card>
            <h3 className="font-bold mb-3 flex items-center gap-2"><FileText size={18}/> Original Report</h3>
            <p className="leading-relaxed whitespace-pre-wrap">{inc.description}</p>
            {inc.contact_number && <p className="text-sm text-ink-500 mt-3">📞 Contact: {inc.contact_number}</p>}
            {inc.photo_urls?.length>0 && (
              <div className="mt-4">
                <div className="text-xs font-bold text-ink-500 mb-2 flex items-center gap-1"><ImageIcon size={14}/> Photos ({inc.photo_urls.length})</div>
                <div className="grid grid-cols-3 gap-2">
                  {inc.photo_urls.map((u,i)=><div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-ink-200 to-ink-300 dark:from-ink-800 dark:to-ink-700 grid place-items-center text-ink-400"><ImageIcon size={32}/></div>)}
                </div>
                {inc.ai_image_findings && (
                  <div className="mt-3 p-3 rounded-lg bg-ink-50 dark:bg-ink-800/60">
                    <div className="text-xs font-bold text-purple-600 mb-1 flex items-center gap-1"><Sparkles size={12}/> AI Image Analysis</div>
                    <ul className="text-sm list-disc list-inside text-ink-600 dark:text-ink-300">{inc.ai_image_findings.map((f,i)=><li key={i}>{f}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <h3 className="font-bold mb-4 flex items-center gap-2"><Clock size={18}/> Status Timeline</h3>
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-ink-200 dark:bg-ink-700"/>
              <TimelineItem label="Report submitted" time={inc.created_at} active/>
              {inc.history.map(h => <TimelineItem key={h.id} label={`${h.from_status?h.from_status.replace('_',' ')+' → ':''}${h.to_status.replace('_',' ')}`} note={h.note} time={h.created_at} active/>)}
            </div>
          </Card>

          {user.role === 'volunteer' && (
            <Card>
              <h3 className="font-bold mb-3 flex items-center gap-2"><Shield size={18}/> Volunteer Actions</h3>
              {!myTask && openTask ? (
                <Button className="w-full" onClick={claim}>✋ Claim this Mission</Button>
              ) : myTask ? (
                <>
                  <div className="text-sm mb-3">Status: <b className="capitalize">{myTask.status.replace('_',' ')}</b></div>
                  <textarea className="w-full rounded-xl bg-white/70 dark:bg-ink-800/70 border border-ink-200 dark:border-ink-700 p-3 text-sm mb-3" rows={3} placeholder="Share update..." value={note} onChange={e=>setNote(e.target.value)}/>
                  <div className="flex flex-wrap gap-2">
                    {myTask.status !== 'en_route' && myTask.status !== 'completed' && <Button size="sm" onClick={()=>update('en_route')}>🚗 En Route</Button>}
                    {myTask.status !== 'on_site' && myTask.status !== 'completed' && <Button size="sm" variant="warning" onClick={()=>update('on_site')}>📍 On Scene</Button>}
                    {myTask.status !== 'in_progress' && myTask.status !== 'completed' && <Button size="sm" variant="secondary" onClick={()=>update('in_progress')}>⚡ Rescue Ongoing</Button>}
                    <Button size="sm" variant="success" onClick={()=>update('completed')}>✓ Complete</Button>
                  </div>
                  {myTask.notes && <div className="mt-3 p-3 rounded-lg bg-ink-50 dark:bg-ink-800/60 text-sm whitespace-pre-wrap">{myTask.notes}</div>}
                </>
              ) : <div className="text-sm text-ink-500">No open tasks.</div>}
            </Card>
          )}

          {isResponder && (
            <Card>
              <h3 className="font-bold mb-3">Response Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {['verified','assigned','dispatched','en_route','on_site','rescue_ongoing','resolved'].map(s=>(
                  <Button key={s} size="sm" variant="ghost" onClick={async ()=>{await api.patch(`/api/incidents/${id}`,{status:s}); load()}} className="capitalize justify-start">{s.replace('_',' ')}</Button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function AIStat({ label, value, color }) {
  const colors = { red:'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10',
                   blue:'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10',
                   amber:'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10',
                   purple:'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10',
                   green:'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10' }
  return <div className={`p-2 rounded-lg text-center ${colors[color]||''}`}>
    <div className="text-[10px] font-bold uppercase opacity-80">{label}</div>
    <div className="text-lg font-extrabold capitalize">{value}</div>
  </div>
}

function TimelineItem({ label, note, time, active }) {
  return <div className="relative">
    <div className={`absolute -left-[22px] top-1 w-4 h-4 rounded-full border-2 ${active?'bg-brand-500 border-brand-600':'bg-ink-300 dark:bg-ink-600 border-ink-200 dark:border-ink-500'}`}/>
    <div className="font-semibold text-sm capitalize">{label.replace('_',' ')}</div>
    {note && <div className="text-xs text-ink-500">{note}</div>}
    {time && <div className="text-[10px] text-ink-400">{new Date(time).toLocaleString()}</div>}
  </div>
}
