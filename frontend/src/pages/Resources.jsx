import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  EmptyState,
  Skeleton,
} from '../components/ui'
import BackButton from '../components/BackButton'
import { toast } from '../components/toaster'
import { useAuth } from '../store/auth'
import { Package, Plus, MapPin, Trash2, Pencil, CheckCircle2 } from 'lucide-react'
import { getLocation } from '../lib/helpers'

const TYPES = [
  { id: 'ambulance', label: 'Ambulance', color: 'red' },
  { id: 'fire_truck', label: 'Fire Truck', color: 'orange' },
  { id: 'police', label: 'Police Unit', color: 'blue' },
  { id: 'rescue_boat', label: 'Rescue Boat', color: 'blue' },
  { id: 'food', label: 'Food Supplies', color: 'amber' },
  { id: 'water', label: 'Water Supply', color: 'cyan' },
  { id: 'medicine', label: 'Medicine', color: 'green' },
  { id: 'shelter', label: 'Shelter', color: 'purple' },
  { id: 'blood', label: 'Blood Units', color: 'red' },
  { id: 'crew', label: 'Response Crew', color: 'brand' },
  { id: 'electric_crew', label: 'Electric Crew', color: 'yellow' },
]

const emptyForm = { resource_type: 'ambulance', name: '', quantity: 1, lat: '', lng: '' }

function ResourceCard({ r, onDelete, onToggle }) {
  const t = TYPES.find((x) => x.id === r.resource_type) || {
    label: r.resource_type.replace('_', ' '),
    color: 'slate',
  }
  return (
    <Card hover>
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <Badge color={t.color}>{t.label}</Badge>
          <h3 className="font-bold mt-1.5 text-ink-900 dark:text-white truncate">
            {r.name || t.label}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(r)}
            className="h-8 w-8 rounded-lg grid place-items-center text-ink-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition"
            title={r.available ? 'Mark deployed' : 'Mark available'}
          >
            {r.available ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Pencil size={14} />}
          </button>
          <button
            onClick={() => onDelete(r.id)}
            className="h-8 w-8 rounded-lg grid place-items-center text-ink-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-ink-500 dark:text-ink-400">
        <span>Qty: <b className="text-ink-900 dark:text-white">{r.quantity}</b></span>
        {r.lat ? (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> Tracked
          </span>
        ) : null}
        <span
          className={[
            'ml-auto text-[11px] font-semibold',
            r.available ? 'text-emerald-600' : 'text-ink-400',
          ].join(' ')}
        >
          {r.available ? 'Available' : 'Deployed'}
        </span>
      </div>
    </Card>
  )
}

function ResourcesSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="space-y-3">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-20" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function Resources() {
  const { user } = useAuth()
  const [res, setRes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [adding, setAdding] = useState(false)
  const [locating, setLocating] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () =>
    api
      .get('/api/resources')
      .then((r) => setRes(r.data))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const add = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await api.post('/api/resources', {
        resource_type: form.resource_type,
        name: form.name || null,
        quantity: Number(form.quantity) || 1,
        lat: form.lat ? Number(form.lat) : user?.lat,
        lng: form.lng ? Number(form.lng) : user?.lng,
        available: true,
      })
      toast('Resource added', 'ok')
      setForm(emptyForm)
      load()
    } catch {
      toast('Failed to add resource', 'err')
    } finally {
      setAdding(false)
    }
  }

  const del = async (id) => {
    try {
      await api.delete(`/api/resources/${id}`)
      toast('Resource removed', 'ok')
      load()
    } catch {
      toast('Delete failed', 'err')
    }
  }

  const toggle = async (r) => {
    try {
      await api.patch(`/api/resources/${r.id}`, {
        resource_type: r.resource_type,
        name: r.name,
        quantity: r.quantity,
        lat: r.lat,
        lng: r.lng,
        available: !r.available,
      })
      load()
    } catch {
      toast('Update failed', 'err')
    }
  }

  const useMyLoc = async () => {
    setLocating(true)
    try {
      const loc = await getLocation()
      f('lat', loc.lat)
      f('lng', loc.lng)
      toast('Location captured', 'ok')
    } catch {
      toast('Location unavailable', 'err')
    } finally {
      setLocating(false)
    }
  }

  const backTo = user?.role === 'municipality' || user?.role === 'admin' || user?.role === 'responder'
    ? '/app/command'
    : '/app/home'

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5 fade-in">
      <BackButton to={backTo} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Package className="text-emerald-500" /> Resource Management
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
            Track ambulances, fire trucks, supplies, shelters, and equipment in real time.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        <div>
          {loading ? (
            <ResourcesSkeleton />
          ) : res.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Package size={28} />}
                title="No resources yet"
                description="Add your first resource on the right."
              />
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {res.map((r) => (
                <ResourceCard key={r.id} r={r} onDelete={del} onToggle={toggle} />
              ))}
            </div>
          )}
        </div>

        <Card className="lg:sticky lg:top-20">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Plus size={18} className="text-brand-600" /> Add Resource
          </h3>
          <form onSubmit={add} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block uppercase tracking-wide">Type</label>
              <Select value={form.resource_type} onChange={(e) => f('resource_type', e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block uppercase tracking-wide">Name / ID</label>
              <Input value={form.name} onChange={(e) => f('name', e.target.value)} placeholder="e.g. Ambulance KA-1234" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block uppercase tracking-wide">Quantity</label>
              <Input type="number" min={1} value={form.quantity} onChange={(e) => f('quantity', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block uppercase tracking-wide">Location</label>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input placeholder="lat" value={form.lat} onChange={(e) => f('lat', e.target.value)} />
                <Input placeholder="lng" value={form.lng} onChange={(e) => f('lng', e.target.value)} />
                <Button type="button" variant="secondary" size="icon" onClick={useMyLoc} disabled={locating}>
                  {locating ? <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" /> : <MapPin size={16} />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" loading={adding}>
              <Plus size={16} /> Add Resource
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
