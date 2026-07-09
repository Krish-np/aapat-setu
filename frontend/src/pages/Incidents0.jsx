import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { Card, Button, Badge, priorityBadge, statusBadge, Input } from '../components/ui'
import { timeAgo } from '../lib/helpers'
import { Search, Filter, Clock, AlertTriangle } from 'lucide-react'

export default function Incidents() {
  const [incs, setIncs] = useState([])
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => api.get('/api/incidents', { params: filter !== 'all' ? { status: filter } : {} }).then(r => { setIncs(r.data); setLoading(false) })
  useEffect(() => { load() }, [filter])

  const setStatus = async (id, status) => {
    await api.patch(`/api/incidents/${id}`, { status })
    load()
  }

  const filtered = incs.filter(i =>
    !q || (i.ai_summary || i.description).toLowerCase().includes(q.toLowerCase()) || i.incident_type.includes(q.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><AlertTriangle className="text-red-500"/> Incident Command</h1>
          <p className="text-ink-500 text-sm mt-1">{incs.length} incidents · monitor, verify, and dispatch</p>
        </div>
        <Link to="/app/report"><Button>+ New Report</Button></Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={16}/>
            <Input className="pl-9" placeholder="Search incidents..." value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
          <div className="flex gap-1 flex-wrap">
            {['all','submitted','verified','assigned','dispatched','en_route','on_site','rescue_ongoing','resolved'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${filter===f?'bg-brand-600 text-white':'bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700'}`}>{f.replace('_',' ')}</button>
            ))}
          </div>
        </div>

        {loading ? <div className="text-center py-10 text-ink-400">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-ink-500 border-b border-ink-200 dark:border-ink-800">
                  <th className="py-3 px-2">ID</th><th>Type</th><th>AI Summary</th><th>Priority</th><th>Status</th><th>ETA</th><th>Reported</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => {
                  const pb = priorityBadge(i.ai_severity||i.severity); const sb = statusBadge(i.status)
                  const canAdvance = {
                    submitted:'verified', verified:'assigned', assigned:'dispatched',
                    dispatched:'en_route', en_route:'on_site', on_site:'rescue_ongoing',
                    rescue_ongoing:'resolved',
                  }
                  return (
                    <tr key={i.id} className="border-b border-ink-100 dark:border-ink-800/60 hover:bg-ink-50 dark:hover:bg-ink-800/40">
                      <td className="py-3 px-2 font-mono text-xs">#{i.id}</td>
                      <td className="capitalize font-semibold">{i.incident_type.replace('_',' ')}</td>
                      <td className="max-w-md"><Link to={`/app/incidents/${i.id}`} className="hover:text-brand-600">{i.ai_summary||i.description?.slice(0,100)}</Link>
                        {i.ai_duplicate_of && <div className="text-xs text-amber-600">🔁 possible duplicate #{i.ai_duplicate_of}</div>}
                      </td>
                      <td><Badge color={pb.color}>{pb.label}</Badge></td>
                      <td><Badge color={sb.color}>{sb.label.replace('_',' ')}</Badge></td>
                      <td className="text-xs">{i.eta_minutes}m</td>
                      <td className="text-xs text-ink-500">{timeAgo(i.created_at)}</td>
                      <td>
                        <div className="flex gap-1">
                          {canAdvance[i.status] && (
                            <Button size="sm" onClick={()=>setStatus(i.id, canAdvance[i.status])}>
                              {canAdvance[i.status]==='verified'?'Verify':canAdvance[i.status].replace('_',' ')}
                            </Button>
                          )}
                          <Link to={`/app/incidents/${i.id}`}><Button size="sm" variant="ghost">Open</Button></Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
