import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { Card, Button, Badge, EmptyState } from '../components/ui'
import { useAuth } from '../store/auth'
import { toast } from '../components/toaster'
import { timeAgo, haversine } from '../lib/helpers'
import { Navigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useTranslation } from 'react-i18next'
import { HandHeart, MapPin, CheckCircle2, Clock } from 'lucide-react'

// Role → which incident_types / task_types belong to this role.
// Tasks whose `assignee_role` matches OR whose parent incident_type matches a focus
// keyword are shown to that department. Responder/admin see all.
const ROLE_FOCUS = {
  fire:        { roles: ['fire'],       keywords: ['fire', 'forest_fire', 'building_collapse', 'rescue'] },
  police:      { roles: ['police'],     keywords: ['accident', 'missing_person', 'crowd', 'security', 'crime'] },
  hospital:    { roles: ['hospital','medical'], keywords: ['medical', 'accident', 'injury'] },
  ngo:         { roles: ['ngo','volunteer'], keywords: ['shelter', 'food', 'water', 'clothing', 'flood', 'relief'] },
  municipality:{ roles: ['municipality','civic'], keywords: ['storm', 'power_failure', 'water_issue', 'flood', 'debris', 'road'] },
  volunteer:   { roles: ['volunteer'],  keywords: [] }, // volunteers see all available
  responder:   { roles: [],            keywords: [] }, // sees all
  admin:       { roles: [],            keywords: [] }, // sees all
}

function taskMatchesRole(task, inc, role) {
  const cfg = ROLE_FOCUS[role]
  if (!cfg) return true
  // If role has no focus restriction (responder/admin), see everything
  if (cfg.roles.length === 0 && cfg.keywords.length === 0) return true
  // Match by explicit assignee_role on the task
  if (task.assignee_role && cfg.roles.includes(task.assignee_role)) return true
  // If no role assigned to the task, match by incident-type keywords
  const t = (inc?.incident_type || '') + ' ' + (inc?.ai_required_resources?.join(' ') || '') + ' ' + (task.task_type || '')
  return cfg.keywords.some((k) => t.includes(k))
}

export default function Tasks() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [tasks, setTasks] = useState([])
  const [incs, setIncs] = useState([])
  const [tab, setTab] = useState('available')
  const [busy, setBusy] = useState(false) // prevent double-click / double-submit

  const load = useCallback(() =>
    Promise.all([api.get('/api/tasks'), api.get('/api/incidents')])
      .then(([tt, ii]) => { setTasks(tt.data); setIncs(ii.data) }),
  [])

  useEffect(() => { load() }, [load])

  if (user.role === 'citizen') return <Navigate to="/app" replace/>

  const incMap = Object.fromEntries(incs.map((i) => [i.id, i]))

  const allScoped = tasks
    .map((tt) => ({ ...tt, inc: incMap[tt.incident_id] }))
    .filter((tt) => tt.inc && taskMatchesRole(tt, tt.inc, user.role))

  const available = allScoped.filter((tt) => !tt.assignee_id && tt.status === 'pending')
  const mine = allScoped.filter((tt) => tt.assignee_id === user.id)
  const show = tab === 'available' ? available : tab === 'mine' ? mine : allScoped

  const claim = async (id) => {
    if (busy) return
    setBusy(true)
    try {
      await api.post(`/api/tasks/${id}/claim`)
      toast(t('tasks.claimed'), 'ok')
      await load()
    } catch (e) {
      toast(e.response?.data?.detail || t('tasks.could_not_claim'), 'err')
    } finally { setBusy(false) }
  }

  const update = async (id, status) => {
    if (busy) return
    setBusy(true)
    try {
      await api.patch(`/api/tasks/${id}`, { status })
      toast(`${t('tasks.marked_status')} ${status}`, 'ok')
      await load()
    } catch (e) {
      toast(e.response?.data?.detail || t('toast.error_generic'), 'err')
    } finally { setBusy(false) }
  }

  return (
    <>
    <BackButton/>
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 break-words">
          <HandHeart className="text-emerald-500"/> {t('tasks.title')}
        </h1>
        <p className="text-ink-500 text-sm mt-1">{t('tasks.subtitle')}</p>
      </div>

      <div className="flex gap-1 flex-wrap">
        {[
          ['available', `${t('tasks.available')} (${available.length})`],
          ['mine', `${t('tasks.my_missions')} (${mine.length})`],
          ['all', `${t('tasks.all_tasks')} (${allScoped.length})`],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab===k?'bg-brand-600 text-white shadow':'bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {show.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CheckCircle2 size={28} />}
            title={t('tasks.no_missions')}
            description={`${t('tasks.no_missions')} — ${tab === 'available' ? t('tasks.available_yet') : t('tasks.none_yet')}.`}
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {show.map((tt) => {
            const d = user.lat && tt.inc
              ? haversine(user.lat, user.lng, tt.inc.lat, tt.inc.lng).toFixed(2)
              : null
            return (
              <Card key={tt.id}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="capitalize text-lg break-words">{(tt.task_type || '').replaceAll('_',' ')}</strong>
                    <Badge color={tt.status==='completed'?'green':tt.status==='pending'?'blue':'amber'}>
                      {(tt.status || '').replaceAll('_',' ')}
                    </Badge>
                    {tt.assignee_role && (
                      <Badge color="purple">{t('tasks.for_role')} {(tt.assignee_role||'').replaceAll('_',' ')}</Badge>
                    )}
                  </div>
                  {d && <span className="text-xs text-ink-500 flex items-center gap-1 flex-shrink-0"><MapPin size={12}/>{d} km</span>}
                </div>
                <p className="text-sm text-ink-600 dark:text-ink-300 line-clamp-3 mb-3 leading-relaxed break-words">
                  {tt.inc.ai_summary || tt.inc.description || '—'}
                </p>
                <div className="text-xs text-ink-500 mb-3 flex items-center gap-1">
                  <Clock size={12}/> {t('tasks.posted')} {timeAgo(tt.created_at)}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tt.status === 'pending' && !tt.assignee_id && (
                    <Button size="sm" onClick={() => claim(tt.id)} disabled={busy}>{t('tasks.claim')}</Button>
                  )}
                  {tt.assignee_id === user.id && tt.status !== 'completed' && (
                    <>
                      {tt.status === 'claimed' && <Button size="sm" onClick={() => update(tt.id,'en_route')} disabled={busy}>{t('tasks.en_route')}</Button>}
                      {tt.status === 'en_route' && <Button size="sm" variant="warning" onClick={() => update(tt.id,'on_site')} disabled={busy}>{t('tasks.on_scene')}</Button>}
                      {(tt.status === 'on_site' || tt.status === 'in_progress') && <Button size="sm" variant="secondary" onClick={() => update(tt.id,'in_progress')} disabled={busy}>{t('tasks.working')}</Button>}
                      <Button size="sm" variant="success" onClick={() => update(tt.id,'completed')} disabled={busy}>
                        <CheckCircle2 size={14}/> {t('tasks.complete')}
                      </Button>
                    </>
                  )}
                  <Link to={`/app/incidents/${tt.incident_id}`}><Button size="sm" variant="ghost">{t('tasks.details')}</Button></Link>
                </div>
                {tt.notes && (
                  <div className="mt-3 p-2 rounded-lg bg-ink-50 dark:bg-ink-800/60 text-xs whitespace-pre-wrap break-words">
                    {tt.notes}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
    </>
  )
}
