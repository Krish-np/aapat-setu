import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'
import { Card, Button, Input, Textarea, Select, EmptyState } from '../components/ui'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../store/auth'
import { toast } from '../components/toaster'
import useRelativeTime from '../lib/useRelativeTime'
import { useTranslation } from 'react-i18next'
import { Radio, Send, Megaphone, AlertTriangle, Info, Siren } from 'lucide-react'

const SEV = {
  info:     { label: 'Info',     color: 'blue',  Icon: Info,         bg: 'bg-blue-50 dark:bg-blue-500/10',  text: 'text-blue-600 dark:text-blue-400',  border: '!border-l-blue-500' },
  warning:  { label: 'Warning',  color: 'amber', Icon: AlertTriangle,bg: 'bg-amber-50 dark:bg-amber-500/10',text: 'text-amber-600 dark:text-amber-400',border: '!border-l-amber-500' },
  critical: { label: 'Critical', color: 'red',   Icon: Siren,        bg: 'bg-red-50 dark:bg-red-500/10',    text: 'text-red-600 dark:text-red-400',    border: '!border-l-red-500' },
}

function AlertItem({ a, idx }) {
  const when = useRelativeTime(a.created_at)
  const s = SEV[a.severity] || SEV.info
  const Icon = s.Icon
  return (
    <motion.div
      layout
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:.3, delay: Math.min(idx*0.04, 0.3) }}
    >
      <Card className={'!border-l-4 !p-4 ' + s.border}>
        <div className="flex items-start gap-3">
          <div className={'w-10 h-10 rounded-lg grid place-items-center flex-shrink-0 ' + s.bg + ' ' + s.text}>
            <Icon size={18}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-semibold text-[14px] text-ink-900 dark:text-white leading-snug break-words">{a.title}</h4>
              <span className="text-[11px] text-ink-400 whitespace-nowrap flex-shrink-0 tabular-nums">{when}</span>
            </div>
            <p className="mt-1 text-[13px] text-ink-600 dark:text-ink-300 leading-relaxed break-words">{a.message}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function AlertSkeleton() {
  return (
    <div className="space-y-3">
      {[0,1,2,3].map(i => (
        <Card key={i} className="!p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-ink-100 dark:bg-ink-800 animate-pulse"/>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-ink-100 dark:bg-ink-800 rounded animate-pulse"/>
              <div className="h-3 w-3/4 bg-ink-100 dark:bg-ink-800 rounded animate-pulse"/>
              <div className="h-3 w-1/2 bg-ink-100 dark:bg-ink-800 rounded animate-pulse"/>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function Alerts() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const canBroadcast = ['responder','admin','municipality','police','fire'].includes(user?.role)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title:'', message:'', severity:'info' })
  const [sending, setSending] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/api/alerts').then(r => setAlerts(r.data || [])).catch(()=>{}).finally(()=>setLoading(false))
  }
  useEffect(() => { load() }, [])

  const send = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim() || sending) return
    setSending(true)
    try {
      await api.post('/api/alerts', form)
      toast(t('toast.alert_sent','Alert broadcast to all users'), 'ok')
      setForm({ title:'', message:'', severity:'info' })
      load()
    } catch {
      toast(t('toast.error_generic'), 'err')
    } finally { setSending(false) }
  }

  return (
    <div>
      <PageHeader
        icon={Radio}
        iconColor="text-amber-500"
        title={t('alerts.title','Public Alerts')}
        subtitle={t('alerts.subtitle','Safety broadcasts from emergency agencies')}
      />

      <AnimatePresence>
        {canBroadcast && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:.3 }} className="mb-5">
            <Card>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-[15px]"><Megaphone size={17}/> {t('alerts.broadcast','Broadcast new alert')}</h3>
              <form onSubmit={send} className="space-y-3">
                <div className="grid md:grid-cols-[2fr_1fr] gap-3">
                  <Input placeholder={t('alerts.title_ph','Alert title (e.g. Heavy Rain Warning)')} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
                  <Select value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})}>
                    <option value="info">{t('alerts.severity_info','Info')}</option>
                    <option value="warning">{t('alerts.severity_warning','Warning')}</option>
                    <option value="critical">{t('alerts.severity_critical','Critical')}</option>
                  </Select>
                </div>
                <Textarea placeholder={t('alerts.message_ph','Message with safety instructions...')} rows={3} value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/>
                <Button type="submit" loading={sending}><Send size={15}/> {t('alerts.send','Broadcast to all users')}</Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <AlertSkeleton/>
       : alerts.length === 0
         ? <Card><EmptyState icon={<Radio size={28}/>} title={t('alerts.none','No alerts yet')} description={t('alerts.none_desc','When agencies broadcast safety alerts, they will appear here.')}/></Card>
         : <div className="space-y-3">
             <AnimatePresence>
               {alerts.map((a,i) => <AlertItem key={a.id} a={a} idx={i}/>)}
             </AnimatePresence>
           </div>}
    </div>
  )
}
