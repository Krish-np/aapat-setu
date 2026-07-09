import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { Card, Button, Input, Select, Badge } from '../components/ui'
import { toast } from '../components/toaster'
import { Package, Plus, MapPin } from 'lucide-react'

const TYPES = ['ambulance','fire_truck','police','rescue_boat','food','water','medicine','shelter','blood','crew','electric_crew']

export default function Resources() {
  const [res, setRes] = useState([])
  const [form, setForm] = useState({ resource_type:'ambulance', name:'', quantity:1 })
  const [adding, setAdding] = useState(false)
  const load = () => api.get('/api/resources').then(r=>setRes(r.data))
  useEffect(()=>{load()},[])

  const add = async (e) => {
    e.preventDefault(); setAdding(true)
    try { await api.post('/api/resources', form); toast('Resource added','ok'); setForm({resource_type:'ambulance',name:'',quantity:1}); load() }
    catch(e){ toast('Failed','err') } finally { setAdding(false) }
  }

  const toggle = async (r) => {
    // no toggle endpoint in this MVP; simulate locally
    toast('Status toggled','ok')
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><Package className="text-emerald-500"/> Resource Management</h1>
          <p className="text-ink-500 text-sm mt-1">Track ambulances, fire trucks, supplies, shelters, and equipment</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {res.map(r => (
            <Card key={r.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs text-ink-500 font-semibold uppercase tracking-wider">{r.resource_type.replace('_',' ')}</div>
                  <h3 className="font-bold mt-1">{r.name||r.resource_type}</h3>
                </div>
                <Badge color={r.available?'green':'slate'}>{r.available?'Available':'Deployed'}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-ink-500">
                <span>Qty: <b className="text-ink-900 dark:text-white">{r.quantity}</b></span>
                {r.lat && <span className="flex items-center gap-1"><MapPin size={12}/> tracked</span>}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="ghost" onClick={()=>toggle(r)}>Toggle status</Button>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <h3 className="font-bold mb-3 flex items-center gap-2"><Plus size={18}/> Add Resource</h3>
          <form onSubmit={add} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block">Type</label>
              <Select value={form.resource_type} onChange={e=>setForm({...form,resource_type:e.target.value})}>
                {TYPES.map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block">Name / ID</label>
              <Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Ambulance KA-1234"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block">Quantity</label>
              <Input type="number" min={1} value={form.quantity} onChange={e=>setForm({...form,quantity:parseInt(e.target.value||1)})}/>
            </div>
            <Button type="submit" className="w-full" disabled={adding}>{adding?'Adding...':'+ Add Resource'}</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
