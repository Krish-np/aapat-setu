import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api, { wsConnect } from '../lib/api'
import { Card, EmptyState } from '../components/ui'
import BackButton from '../components/BackButton'
import { useAuth } from '../store/auth'
import useRelativeTime from '../lib/useRelativeTime'
import { useTranslation } from 'react-i18next'
import { Bell, AlertTriangle, CheckCircle2, Info, PartyPopper, Flame, Shield } from 'lucide-react'

const ICON = {
  info: Info, alert: AlertTriangle, ok: CheckCircle2, update: Bell,
  welcome: PartyPopper, critical: Flame, resolved: Shield,
}
// Static color classes (Tailwind cannot purge/safelist dynamic template strings)
const COLOR_STYLES = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-500/10',  text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/40' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-500/10',text: 'text-amber-600 dark:text-amber-400',border: 'border-amber-500/40' },
  green:  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text:'text-emerald-600 dark:text-emerald-400', border:'border-emerald-500/40' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', text:'text-purple-600 dark:text-purple-400', border:'border-purple-500/40' },
  red:    { bg: 'bg-red-50 dark:bg-red-500/10',   text: 'text-red-600 dark:text-red-400',  border: 'border-red-500/40' },
}

function NotifItem({ n, idx }) {
  const when = useRelativeTime(n.time)
  const style = COLOR_STYLES[n.color] || COLOR_STYLES.blue
  const Icon = ICON[n.kind] || Info
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.35, delay: Math.min(idx*0.04, 0.4), type:'spring', stiffness:260, damping:24 }}
    >
      <Card className={'!border-l-4 ' + style.border}>
        <div className="flex items-start gap-3">
          <div className={'w-10 h-10 rounded-xl grid place-items-center flex-shrink-0 ' + style.bg + ' ' + style.text}>
            <Icon size={20}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-ink-900 dark:text-white leading-snug break-words">{n.title}</h3>
              <span className="text-[11px] text-ink-400 whitespace-nowrap flex-shrink-0 tabular-nums">{when}</span>
            </div>
            {n.message && (
              <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 leading-relaxed break-words">{n.message}</p>
            )}
            {n.meta && (
              <div className="mt-2 flex gap-2 flex-wrap">{n.meta}</div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function generateFromIncidents(incidents, user, t) {
  const out = []
  const mine = incidents.filter(i => user && i.reporter_id === user.id).slice(0, 5)
  const critical = incidents.filter(i => i.ai_severity === 'critical' && i.status !== 'resolved').slice(0, 5)
  const recent = incidents.slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0, 8)

  mine.forEach(i => out.push({
    kind: 'update',
    color: 'purple',
    title: 'Your ' + (i.incident_type||'').replaceAll('_',' ') + ' report is ' + (i.status||'').replaceAll('_',' '),
    message: i.ai_summary || i.description,
    time: i.updated_at || i.created_at,
  }))
  critical.forEach(i => out.push({
    kind: 'critical',
    color: 'red',
    title: 'Critical: ' + (i.incident_type||'incident').replaceAll('_',' '),
    message: i.ai_summary || i.description,
    time: i.created_at,
  }))
  // Avoid duplicate entries between my-reports and critical
  const seen = new Set(out.map(n => n.title + n.time))
  recent.forEach(i => {
    const key = 'Recent: ' + i.incident_type + ' @ ' + i.created_at
    if (seen.has(key)) return
    seen.add(key)
    if (i.status !== 'resolved' && i.ai_severity !== 'critical') {
      out.push({
        kind: 'info',
        color: 'blue',
        title: 'New ' + (i.incident_type||'').replaceAll('_',' ') + ' report',
        message: i.ai_summary,
        time: i.created_at,
      })
    }
    if (i.status === 'resolved') {
      out.push({
        kind: 'resolved',
        color: 'green',
        title: (i.incident_type||'incident').replaceAll('_',' ') + ' resolved',
        message: i.ai_summary,
        time: i.updated_at || i.created_at,
      })
    }
  })

  out.push({
    kind: 'welcome',
    color: 'purple',
    title: t('notifications.welcome', 'Welcome to Aapat Setu'),
    message: t('notifications.welcome_msg', 'AI triage engine online. You will receive real-time alerts for new incidents and updates on your reports.'),
    time: new Date(Date.now() - 500).toISOString(),
    _id: '__welcome',
  })

  return out
    .sort((a,b) => new Date(b.time) - new Date(a.time))
    .filter((n,i,arr) => arr.findIndex(x => x.title===n.title && x.time===n.time) === i)
}

export default function Notifications() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [incs, setIncs] = useState([])
  const [live, setLive] = useState([])

  useEffect(() => {
    api.get('/api/incidents').then(r => setIncs(r.data)).catch(()=>{})
    const ws = wsConnect((msg) => {
      if (msg.event === 'incident_created') {
        setLive(prev => [{
          kind: msg.data.ai_severity === 'critical' ? 'critical' : 'alert',
          color: msg.data.ai_severity === 'critical' ? 'red' : 'amber',
          title: 'New ' + (msg.data.incident_type||'incident').replaceAll('_',' ') + ' · ' + (msg.data.ai_severity||''),
          message: msg.data.ai_summary,
          time: new Date().toISOString(),
          _id: msg.data.id,
        }].concat(prev).slice(0, 15))
        setIncs(prev => [msg.data].concat(prev))
      }
      if (msg.event === 'incident_updated') {
        setIncs(prev => prev.map(x => x.id === msg.data.id ? Object.assign({}, x, msg.data) : x))
      }
    })
    return () => ws.close()
  }, [])

  const notifs = useMemo(() => {
    const base = generateFromIncidents(incs, user, t)
    const seen = new Set()
    const merged = []
    const all = live.concat(base)
    for (let i = 0; i < all.length; i++) {
      const n = all[i]
      const k = n._id ? ('id:' + n._id) : (n.kind + ':' + n.title + ':' + n.time)
      if (seen.has(k)) continue
      seen.add(k)
      merged.push(n)
    }
    return merged
  }, [incs, live, user])

  return (
    <React.Fragment>
      <BackButton/>
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:.3 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 break-words">
            <Bell className="text-purple-500"/> {t('notifications.title', 'Notifications')}
            {live.length > 0 && (
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">{live.length} {t('notifications.new_badge', 'new')}</span>
            )}
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{t('notifications.subtitle', 'Live updates from across the network.')}</p>
        </motion.div>

        {notifs.length === 0 ? (
          <EmptyState icon={<Bell size={28}/>} title={t('notifications.all_caught_up', 'All caught up')} description={t('notifications.none_right_now', 'No notifications right now.')}/>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {notifs.map((n, i) => (
                <NotifItem key={(n._id||'')+n.kind+n.title+n.time} n={n} idx={i}/>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </React.Fragment>
  )
}
