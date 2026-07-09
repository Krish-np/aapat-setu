import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { Card, Button, Badge } from '../components/ui'
import { useAuth } from '../store/auth'
import { toast } from '../components/toaster'
import { timeAgo, haversine } from '../lib/helpers'
import { Navigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { HandHeart, MapPin, CheckCircle2, Clock } from 'lucide-react'

const TASK_STATUSES = ['pending','claimed','en_route','on_site','in_progress','completed']

export default function Tasks() {
  const { user } = useAuth()
  if (user.role === 'citizen') return <Navigate to="/app"/>
  const [tasks, setTasks] = useState([])
  const [incs, setIncs] = useState([])
  const [tab, setTab] = useState('available')

  const load = () => Promise.all([api.get('/api/tasks'), api.get('/api/incidents')]).then(([t,i])=>{setTasks(t.data);setIncs(i.data)})
  useEffect(()=>{load()},[])

  const incMap = Object.fromEntries(incs.map(i=>[i.id,i]))
  const available = tasks.filter(t => !t.assignee_id && t.status==='pending').map(t => ({ ...t, inc: incMap[t.incident_id] })).filter(t=>t.inc)
  const mine = tasks.filter(t => t.assignee_id === user.id).map(t=>({...t, inc: incMap[t.incident_id]})).filter(t=>t.inc)
  const all = tasks.map(t=>({...t, inc: incMap[t.incident_id]})).filter(t=>t.inc)

  const show = tab==='available'?available : tab==='mine'?mine : all

  const claim = async (id) => { await api.post(`/api/tasks/${id}/claim`); toast('Claimed!','ok'); load() }
  const update = async (id, status) => { await api.patch(`/api/tasks/${id}`, { status }); toast(`Marked ${status}`,'ok'); load() }

  return (
    <div className="max-w<BackButton/>
    -7xl mx-auto p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><HandHeart className="text-emerald-500"/> Task Board</h1>
        <p className="text-ink-500 text-sm mt-1">Browse and accept rescue missions near you</p>
      </div>

      <div className="flex gap-1 flex-wrap">
        {[
          ['available', `Available (${available.length})`],
          ['mine', `My missions (${mine.length})`],
          ['all', `All tasks (${all.length})`],
        ].map(([k,l]) => (
          <button key={k} onClick={()=>setTab(k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab===k?'bg-brand-600 text-white shadow':'bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {show.length===0 && <Card><div className="text-center py-10 text-ink-500">No missions {tab==='available'?'available':'yet'}.</div></Card>}
        {show.map(t => {
          const d = (user.lat && t.inc) ? haversine(user.lat,user.lng,t.inc.lat,t.inc.lng).toFixed(2) : null
          return (
            <Card key={t.id}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="capitalize text-lg">{t.task_type.replace('_',' ')}</strong>
                  <Badge color={t.status==='completed'?'green':t.status==='pending'?'blue':'amber'}>{t.status.replace('_',' ')}</Badge>
                  <Badge color="purple">for {t.assignee_role||'responder'}</Badge>
                </div>
                {d && <span className="text-xs text-ink-500 flex items-center gap-1"><MapPin size={12}/>{d} km</span>}
              </div>
              <p className="text-sm text-ink-600 dark:text-ink-300 line-clamp-2 mb-3">{t.inc.ai_summary}</p>
              <div className="text-xs text-ink-500 mb-3 flex items-center gap-1"><Clock size={12}/> Posted {timeAgo(t.created_at)}</div>
              <div className="flex gap-2 flex-wrap">
                {t.status==='pending' && !t.assignee_id && <Button size="sm" onClick={()=>claim(t.id)}>✋ Accept</Button>}
                {t.assignee_id === user.id && t.status !== 'completed' && (
                  <>
                    {t.status==='claimed' && <Button size="sm" onClick={()=>update(t.id,'en_route')}>🚗 En Route</Button>}
                    {t.status==='en_route' && <Button size="sm" variant="warning" onClick={()=>update(t.id,'on_site')}>📍 On Scene</Button>}
                    {(t.status==='on_site'||t.status==='in_progress') && <Button size="sm" variant="secondary" onClick={()=>update(t.id,'in_progress')}>⚡ Working</Button>}
                    <Button size="sm" variant="success" onClick={()=>update(t.id,'completed')}><CheckCircle2 size={14}/> Complete</Button>
                  </>
                )}
                <Link to={`/app/incidents/${t.incident_id}`}><Button size="sm" variant="ghost">Details →</Button></Link>
              </div>
              {t.notes && <div className="mt-3 p-2 rounded-lg bg-ink-50 dark:bg-ink-800/60 text-xs whitespace-pre-wrap">{t.notes}</div>}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
