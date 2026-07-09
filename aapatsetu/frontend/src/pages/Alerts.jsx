import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { Card, Button, Input, Textarea, Select } from '../components/ui'
import { useAuth } from '../store/auth'
import { toast } from '../components/toaster'
import { timeAgo } from '../lib/helpers'
import { Radio, Send, Megaphone } from 'lucide-react'

export default function Alerts() {
  const { user } = useAuth()
  const canBroadcast = ['responder','admin','municipality','police','fire'].includes(user.role)
  const [alerts, setAlerts] = useState([])
  const [form, setForm] = useState({ title:'', message:'', severity:'info' })

  const load = () => api.get('/api/alerts').then(r => setAlerts(r.data))
  useEffect(()=>{load()},[])

  const send = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return
    try { await api.post('/api/alerts', form); toast('Alert broadcast to all users','ok'); setForm({title:'',message:'',severity:'info'}); load() }
    catch(e){ toast('Failed','err') }
  }

  const color = { info:'blue', warning:'amber', critical:'red', success:'green' }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><Radio className="text-amber-500"/> Public Alerts</h1>
        <p className="text-ink-500 text-sm mt-1">Safety broadcasts from emergency agencies</p>
      </div>

      {canBroadcast && (
        <Card>
          <h3 className="font-bold mb-3 flex items-center gap-2"><Megaphone size={18}/> Broadcast new alert</h3>
          <form onSubmit={send} className="space-y-3">
            <div className="grid md:grid-cols-[2fr_1fr] gap-3">
              <Input placeholder="Alert title (e.g. Heavy Rain Warning)" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
              <Select value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </Select>
            </div>
            <Textarea placeholder="Message with safety instructions..." rows={3} value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/>
            <Button type="submit"><Send size={16}/> Broadcast to all users</Button>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {alerts.length===0 && <Card><div className="text-center py-10 text-ink-500">No alerts at this time</div></Card>}
        {alerts.map(a => (
          <Card key={a.id} className={`!border-l-4 ${
            a.severity==='critical'?'!border-l-red-500':
            a.severity==='warning'?'!border-l-amber-500':'!border-l-blue-500'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold flex items-center gap-2">📢 {a.title}</h4>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{a.message}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-${color[a.severity]||'blue'}-100 dark:bg-${color[a.severity]||'blue'}-500/20 text-${color[a.severity]||'blue'}-700 dark:text-${color[a.severity]||'blue'}-300 uppercase`}>{a.severity}</span>
                  <span className="text-xs text-ink-400">{timeAgo(a.created_at)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
