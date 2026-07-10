import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Skeleton,
  EmptyState,
} from '../components/ui'
import { toast } from '../components/toaster'
import { useAuth } from '../store/auth'
import {
  Users,
  Plus,
  MapPin,
  Phone,
  UserPlus,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { getLocation } from '../lib/helpers'

const CREW_TYPES = [
  { id: 'rescue', label: 'Rescue Team', color: 'red' },
  { id: 'medical', label: 'Medical Team', color: 'pink' },
  { id: 'fire', label: 'Fire Crew', color: 'orange' },
  { id: 'police', label: 'Police Unit', color: 'blue' },
  { id: 'electric', label: 'Electric Crew', color: 'yellow' },
  { id: 'water', label: 'Water/Sanitation', color: 'cyan' },
  { id: 'debris', label: 'Debris Clearance', color: 'slate' },
  { id: 'volunteer', label: 'Volunteers', color: 'green' },
  { id: 'ngo', label: 'NGO Team', color: 'purple' },
  { id: 'other', label: 'Other', color: 'slate' },
]

const emptyForm = {
  crew_type: 'rescue',
  lead_name: '',
  phone: '',
  size: 5,
  vehicle: '',
  lat: '',
  lng: '',
  available: true,
}

function CrewCard({ crew, onDelete }) {
  const meta = CREW_TYPES.find((c) => c.id === crew.resource_type) || {
    label: crew.resource_type,
    color: 'slate',
  }
  return (
    <Card hover>
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge color={meta.color} dot>{meta.label}</Badge>
            <Badge color={crew.available ? 'green' : 'slate'}>
              {crew.available ? 'Available' : 'Deployed'}
            </Badge>
          </div>
          <h3 className="font-bold text-ink-900 dark:text-white truncate">
            {crew.name || `${meta.label} #${crew.id}`}
          </h3>
        </div>
        <button
          onClick={() => onDelete(crew.id)}
          className="h-8 w-8 grid place-items-center rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          title="Remove crew"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-ink-600 dark:text-ink-300">
          <Users size={14} className="text-ink-400" />
          <span>
            <b className="text-ink-900 dark:text-white">{crew.quantity || 0}</b> members
          </span>
        </div>
        {crew.name && (
          <div className="flex items-center gap-2 text-ink-600 dark:text-ink-300">
            <UserPlus size={14} className="text-ink-400" />
            <span>Lead: <b className="text-ink-900 dark:text-white">{crew.name}</b></span>
          </div>
        )}
        {crew.lat && crew.lng && (
          <div className="flex items-center gap-2 text-ink-600 dark:text-ink-300">
            <MapPin size={14} className="text-ink-400" />
            <span className="text-xs font-mono">{Number(crew.lat).toFixed(4)}, {Number(crew.lng).toFixed(4)}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

function CrewForm({ onAdded }) {
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [locating, setLocating] = useState(false)

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const useMyLocation = async () => {
    setLocating(true)
    try {
      const loc = await getLocation()
      f('lat', loc.lat)
      f('lng', loc.lng)
      toast('Location captured', 'ok')
    } catch {
      toast('Could not get location — enter manually', 'err')
    } finally {
      setLocating(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.lead_name.trim()) {
      toast('Please enter a lead/crew name', 'err')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/api/resources', {
        resource_type: form.crew_type,
        name: [form.lead_name, form.vehicle].filter(Boolean).join(' · '),
        quantity: Number(form.size) || 1,
        lat: form.lat ? Number(form.lat) : user?.lat,
        lng: form.lng ? Number(form.lng) : user?.lng,
        available: form.available,
      })
      toast('Crew added successfully', 'ok')
      setForm(emptyForm)
      onAdded?.()
    } catch {
      toast('Failed to add crew', 'err')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <h3 className="font-bold mb-4 flex items-center gap-2 text-ink-900 dark:text-white">
        <Plus size={18} className="text-brand-600" /> Add New Crew
      </h3>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-ink-500 mb-1 block uppercase tracking-wide">
            Crew Type
          </label>
          <Select value={form.crew_type} onChange={(e) => f('crew_type', e.target.value)}>
            {CREW_TYPES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-500 mb-1 block uppercase tracking-wide">
            Lead Name / Crew ID *
          </label>
          <Input
            icon={<UserPlus size={15} />}
            value={form.lead_name}
            onChange={(e) => f('lead_name', e.target.value)}
            placeholder="e.g. Rescue Team Alpha"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-ink-500 mb-1 block uppercase tracking-wide">
              Team Size
            </label>
            <Input
              type="number"
              min={1}
              value={form.size}
              onChange={(e) => f('size', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-500 mb-1 block uppercase tracking-wide">
              Vehicle / Callsign
            </label>
            <Input
              value={form.vehicle}
              onChange={(e) => f('vehicle', e.target.value)}
              placeholder="e.g. KA-1234"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-500 mb-1 block uppercase tracking-wide">
            Location (lat, lng)
          </label>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              placeholder="lat"
              value={form.lat}
              onChange={(e) => f('lat', e.target.value)}
            />
            <Input
              placeholder="lng"
              value={form.lng}
              onChange={(e) => f('lng', e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={useMyLocation}
              disabled={locating}
              title="Use my location"
            >
              {locating ? <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" /> : <MapPin size={16} />}
            </Button>
          </div>
          {user?.lat && !form.lat && (
            <p className="text-[11px] text-ink-400 mt-1">Defaults to your station location.</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => f('available', e.target.checked)}
            className="rounded border-ink-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
          />
          Available for dispatch right now
        </label>

        <Button type="submit" className="w-full" loading={submitting}>
          <Plus size={16} /> Add Crew
        </Button>
      </form>
    </Card>
  )
}

function CrewsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </Card>
      ))}
    </div>
  )
}

export default function Crews() {
  const [crews, setCrews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get('/api/resources')
      // Filter to crew-type resources only.
      const crewTypes = CREW_TYPES.map((c) => c.id).concat(['crew'])
      const all = r.data.filter((r) => crewTypes.includes(r.resource_type))
      setCrews(all)
    } catch {
      toast('Failed to load crews', 'err')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const remove = async (id) => {
    // Note: MVP has no DELETE endpoint; use PATCH to mark unavailable as a soft delete.
    try {
      await api.delete?.(`/api/resources/${id}`)
    } catch {
      // fallback: no delete endpoint, just reload
    }
    setCrews((c) => c.filter((x) => x.id !== id))
    toast('Crew removed', 'ok')
  }

  const availableCount = crews.filter((c) => c.available).length
  const deployedCount = crews.length - availableCount

  const shown =
    filter === 'all' ? crews : crews.filter((c) => c.resource_type === filter)

  return (
    <div className="space-y-5 fade-in">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white flex items-center gap-2">
            <Users className="text-brand-600" size={24} /> Crew Management
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
            Add, track, and dispatch response teams across the city.
          </p>
        </div>
        <div className="flex gap-2">
          <Card padded={false} className="!px-4 !py-2 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <div className="text-xs">
              <div className="font-bold text-emerald-600 dark:text-emerald-400">
                {availableCount} available
              </div>
            </div>
          </Card>
          <Card padded={false} className="!px-4 !py-2 flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            <div className="text-xs">
              <div className="font-bold text-amber-600 dark:text-amber-400">
                {deployedCount} deployed
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={[
            'h-8 px-3 rounded-lg text-xs font-semibold transition',
            filter === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700',
          ].join(' ')}
        >
          All ({crews.length})
        </button>
        {CREW_TYPES.map((c) => {
          const n = crews.filter((x) => x.resource_type === c.id).length
          if (n === 0 && filter !== c.id) return null
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={[
                'h-8 px-3 rounded-lg text-xs font-semibold capitalize transition',
                filter === c.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700',
              ].join(' ')}
            >
              {c.label} ({n})
            </button>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        <div>
          {loading ? (
            <CrewsSkeleton />
          ) : shown.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Users size={28} />}
                title="No crews yet"
                description="Add your first response crew on the right to start dispatching teams."
              />
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {shown.map((c) => (
                <CrewCard key={c.id} crew={c} onDelete={remove} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-20">
          <CrewForm onAdded={load} />
        </div>
      </div>
    </div>
  )
}
