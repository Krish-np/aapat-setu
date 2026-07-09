import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Button, Textarea, Input, Badge, Spinner } from '../components/ui'
import { EMERGENCY_CATEGORIES, getLocation } from '../lib/helpers'
import api from '../lib/api'
import { toast } from '../components/toaster'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import BackButton from '../components/BackButton'
import { useTheme } from '../store/theme'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle, MapPin, Mic, Image as ImageIcon, Camera, CheckCircle2,
  Users, Phone, ChevronRight, ChevronLeft, Cpu, Loader2, Sparkles, Upload, Send
} from 'lucide-react'

function PickPin() {
  return L.divIcon({
    className:'pin-drop',
    html:`<div style="position:relative;transform:translate(-50%,-100%)">
      <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs><filter id="psh" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.3"/></filter></defs>
        <path filter="url(#psh)" d="M20 0C8.95 0 0 8.95 0 20c0 13.7 20 32 20 32s20-18.3 20-32C40 8.95 31.05 0 20 0z" fill="#ef4444" stroke="#fff" stroke-width="2"/>
        <circle cx="20" cy="19" r="6" fill="#fff"/>
      </svg></div>`,
    iconSize:[40,52], iconAnchor:[20,52],
  })
}
function Pick({ setPos }) {
  useMapEvents({ click(e){ setPos({lat:e.latlng.lat, lng:e.latlng.lng}) } })
  return null
}
function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, Math.max(map.getZoom(), 16), { duration: 0.6 })
  }, [center?.lat, center?.lng])
  return null
}

const STEPS = ['Details', 'Media', 'Location', 'Review']

export default function Report() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [cat, setCat] = useState('fire')
  const [desc, setDesc] = useState('')
  const [people, setPeople] = useState(1)
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')
  const [pos, setPos] = useState(null)
  const [locating, setLocating] = useState(false)
  const [images, setImages] = useState([])
  const [recording, setRecording] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [recTimer, setRecTimer] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const fileRef = useRef(), recInterval = useRef()
  const { theme } = useTheme()

  useEffect(() => {
    setLocating(true)
    getLocation().then(setPos).catch(()=>setPos({lat:27.7172,lng:85.3240})).finally(()=>setLocating(false))
  },[])

  useEffect(() => {
    if (recording) {
      recInterval.current = setInterval(() => setRecTimer(t => t+1), 1000)
    } else {
      clearInterval(recInterval.current); setRecTimer(0)
    }
    return () => clearInterval(recInterval.current)
  }, [recording])

  const onFiles = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = () => setImages(x => [...x, reader.result])
      reader.readAsDataURL(f)
    })
  }

  const simulateVoice = () => {
    setRecording(r => !r)
    if (recording) {
      // simulate transcript
      const samples = {
        flood: "Help, flood water is rising, we are trapped on the roof with children.",
        fire: "Fire has broken out in the building, smoke everywhere, people are screaming.",
        medical: "There's been an accident, someone is badly injured and bleeding, please send help.",
        accident: "Two cars crashed badly on the main road, people are trapped inside.",
        default: "Please send help immediately, this is an emergency situation."
      }
      const extra = desc ? ` ${desc}` : ''
      setVoiceTranscript((samples[cat] || samples.default) + extra)
      toast("Voice recorded & transcribed", 'ok')
    }
  }

  const submit = async () => {
    if (submitting) return // double-click guard
    if (!desc.trim() && !voiceTranscript) { toast(t('report.need_desc'), 'err'); return }
    if (!pos) { toast(t('report.need_loc'), 'err'); return }
    setSubmitting(true)
    try {
      const finalDesc = desc + (voiceTranscript ? `\n\n[Voice note]: ${voiceTranscript}` : '')
      const { data } = await api.post('/api/incidents', {
        incident_type: cat, description: finalDesc, lat: pos.lat, lng: pos.lng,
        people_affected: people, contact_number: contact||undefined, address,
        photo_urls: images.length ? images.map((_,i) => `upload_${i+1}.jpg`) : undefined,
        voice_transcript: voiceTranscript || undefined,
      })
      setResult(data)
      setStep(4)
      toast("🚨 Report submitted. AI is analyzing.", 'ok')
    } catch(e) {
      toast(e.response?.data?.detail || 'Failed to submit', 'err')
    } finally { setSubmitting(false) }
  }

  if (step === 4 && result) return <ResultCard result={result} onClose={()=>nav('/app')}/>

  const canNext =
    (step === 0 && desc.trim().length > 4) ||
    (step === 1) ||
    (step === 2 && pos) ||
    (step === 3)

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <BackButton />
      <div className="mb-6 mt-2">
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><AlertTriangle className="text-red-500"/> Report Emergency</h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Share what's happening — AI will triage instantly.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s,i) => (
          <React.Fragment key={s}>
            <button onClick={()=>setStep(i)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition ${i===step?'bg-brand-600 text-white shadow-lg shadow-brand-600/30':i<step?'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300':'bg-ink-100 dark:bg-ink-800 text-ink-500'}`}>
              {i<step?<CheckCircle2 size={14}/>:i+1} {s}
            </button>
            {i<STEPS.length-1 && <div className={`flex-1 h-0.5 ${i<step?'bg-emerald-500':'bg-ink-200 dark:bg-ink-800'}`}/>}
          </React.Fragment>
        ))}
      </div>

      <Card>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold mb-2 block">What's happening? <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {EMERGENCY_CATEGORIES.map(c => (
                      <button key={c.id} onClick={()=>setCat(c.id)}
                        className={`p-3 rounded-xl text-left text-sm font-semibold border-2 transition-all ${cat===c.id?'border-brand-500 bg-brand-50 dark:bg-brand-500/10':'border-transparent bg-ink-50 dark:bg-ink-800/60 hover:border-ink-200 dark:hover:border-ink-700'}`}>
                        <span className="text-2xl block mb-1">{c.emoji}</span>
                        <span className="text-xs leading-tight block">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Describe the situation</label>
                  <Textarea rows={5} placeholder="Describe what you see, any injuries, the location, urgency..." value={desc} onChange={e=>setDesc(e.target.value)}/>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-semibold mb-2 block flex items-center gap-1"><Users size={14}/> People affected</label>
                    <Input type="number" min={0} value={people} onChange={e=>setPeople(parseInt(e.target.value||0))}/>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block flex items-center gap-1"><Phone size={14}/> Contact (optional)</label>
                    <Input placeholder="Your number" value={contact} onChange={e=>setContact(e.target.value)}/>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Address / landmark</label>
                    <Input placeholder="Near..." value={address} onChange={e=>setAddress(e.target.value)}/>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold mb-2 block flex items-center gap-2"><ImageIcon size={16}/> Upload photos/videos (optional — AI will analyze them)</label>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles}/>
                  <button onClick={()=>fileRef.current?.click()} className="w-full p-6 rounded-xl border-2 border-dashed border-ink-300 dark:border-ink-700 hover:border-brand-500 transition flex flex-col items-center gap-2 text-ink-500">
                    <Upload size={28}/>
                    <span className="text-sm font-semibold">Click to upload photos</span>
                    <span className="text-xs">AI will detect fire, smoke, flood, damage, injuries</span>
                  </button>
                  {images.length>0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {images.map((src,i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-ink-100 dark:bg-ink-800">
                          <img src={src} alt="" className="w-full h-full object-cover"/>
                          <button onClick={()=>setImages(x=>x.filter((_,j)=>j!==i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block flex items-center gap-2"><Mic size={16}/> Record voice note (optional — auto-transcribed)</label>
                  <button onClick={simulateVoice}
                    className={`w-full p-6 rounded-xl border-2 transition flex items-center justify-center gap-3 ${recording?'border-red-500 bg-red-50 dark:bg-red-500/10 animate-pulse':'border-dashed border-ink-300 dark:border-ink-700 hover:border-brand-500'}`}>
                    <div className={`w-12 h-12 rounded-full grid place-items-center ${recording?'bg-red-500 text-white':'bg-ink-100 dark:bg-ink-800'}`}>
                      {recording?<span className="text-sm font-bold">{recTimer}s</span>:<Mic size={22}/>}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">{recording?'Recording... tap to stop':'Tap to start recording'}</div>
                      <div className="text-xs text-ink-500">Speech-to-text · Language detection · Auto-translate</div>
                    </div>
                  </button>
                  {voiceTranscript && (
                    <div className="mt-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 mb-1"><Mic size={12}/> TRANSCRIPT</div>
                      <p className="text-sm">{voiceTranscript}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="text-sm font-semibold mb-2 block flex items-center gap-2"><MapPin size={16}/> Pin the exact location <span className="text-red-500">*</span></label>
                <div className="h-96 rounded-xl overflow-hidden border border-ink-200 dark:border-ink-800 relative">
                  {!pos && (
                    <div className="absolute inset-0 grid place-items-center bg-ink-50 dark:bg-ink-900 text-ink-400">
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size={22} className="text-brand-600" />
                        <span className="text-xs">Getting location…</span>
                      </div>
                    </div>
                  )}
                  {pos && (
                    <MapContainer
                      center={[pos.lat,pos.lng]}
                      zoom={16}
                      style={{height:'100%',width:'100%'}}
                      scrollWheelZoom
                      key={`${theme}-${pos.lat}-${pos.lng}`}
                      whenReady={()=>setMapReady(true)}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url={theme==='dark'
                          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
                      />
                      <Pick setPos={setPos}/>
                      <RecenterMap center={pos}/>
                      <Marker position={[pos.lat,pos.lng]} icon={PickPin()}/>
                    </MapContainer>
                  )}
                  {!mapReady && pos && (
                    <div className="absolute inset-0 grid place-items-center bg-white/70 dark:bg-ink-900/70 backdrop-blur-sm z-[400]">
                      <div className="flex flex-col items-center gap-2 text-ink-500 dark:text-ink-400">
                        <Spinner size={22} className="text-brand-600" />
                        <span className="text-xs font-medium">Loading map…</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-ink-500">
                  <span>Click on the map to place pin · Drag to pan · Scroll to zoom</span>
                  <button onClick={()=>{setLocating(true); setMapReady(false); getLocation().then(setPos).finally(()=>setLocating(false))}} className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                    {locating?<Loader2 className="animate-spin" size={14}/>:<MapPin size={14}/>} Use my location
                  </button>
                </div>
                {pos && <div className="mt-2 text-xs font-mono text-ink-400">📍 {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}</div>}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10 border border-purple-200 dark:border-purple-500/20 flex items-start gap-3">
                  <Cpu className="text-purple-600 flex-shrink-0 mt-0.5" size={22}/>
                  <div>
                    <div className="font-bold text-sm text-purple-900 dark:text-purple-200">Ready to submit — AI will analyze instantly</div>
                    <div className="text-xs text-ink-600 dark:text-ink-400 mt-1">After submission, our AI verifies, summarizes, prioritizes, checks for duplicates, and dispatches to nearest responders.</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <Review label="Type">{EMERGENCY_CATEGORIES.find(c=>c.id===cat)?.emoji} {EMERGENCY_CATEGORIES.find(c=>c.id===cat)?.label}</Review>
                  <Review label="People affected">{people}</Review>
                  <Review label="Contact">{contact||'—'}</Review>
                  <Review label="Address">{address||'—'}</Review>
                  <Review label="Photos">{images.length||'None'}</Review>
                  <Review label="Voice note">{voiceTranscript?'Yes':'None'}</Review>
                  <Review label="Location" span2>{pos?`${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`:'Not set'}</Review>
                  <Review label="Description" span2>{desc||voiceTranscript}</Review>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-ink-200 dark:border-ink-800">
          <Button variant="ghost" onClick={()=>nav(-1)} disabled={submitting}>Cancel</Button>
          <div className="flex gap-2">
            {step>0 && <Button variant="ghost" onClick={()=>setStep(s=>s-1)} disabled={submitting}><ChevronLeft size={16}/> {t('report.back')}</Button>}
            {step<3 && <Button onClick={()=>canNext && !submitting && setStep(s=>s+1)} disabled={!canNext || submitting}>{t('report.next')} <ChevronRight size={16}/></Button>}
            {step===3 && <Button onClick={submit} disabled={submitting||!pos}>
              {submitting?<><Loader2 className="animate-spin" size={16}/> {t('report.processing')}</>:<><Send size={16}/> {t('report.submit_ai')}</>}
            </Button>}
          </div>
        </div>
      </Card>
    </div>
  )
}

function Review({ label, children, span2 }) {
  return (
    <div className={`p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 ${span2?'md:col-span-2':''}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-1">{label}</div>
      <div className="text-sm font-medium capitalize">{children}</div>
    </div>
  )
}

function ResultCard({ result, onClose }) {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <motion.div initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}}>
        <Card className="!p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white grid place-items-center shadow-2xl shadow-emerald-500/30 mb-4">
            <CheckCircle2 size={42}/>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Report received!</h2>
          <p className="text-ink-500 mt-2">AI has analyzed your report and responders have been notified.</p>

          <div className="mt-6 text-left space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10 border border-purple-200 dark:border-purple-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 mb-2"><Sparkles size={14}/> AI SUMMARY</div>
              <p className="font-semibold">{result.ai_summary}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Mini label="Severity"><Badge color={{critical:'red',high:'orange',moderate:'amber',low:'green'}[result.ai_severity]||'slate'}>{result.ai_severity?.toUpperCase()}</Badge></Mini>
              <Mini label="Confidence">{Math.round((result.ai_confidence||0)*100)}%</Mini>
              <Mini label="ETA">{result.ai_response_time_min}m</Mini>
              <Mini label="Victims (est.)">{result.ai_estimated_victims}</Mini>
            </div>

            {result.ai_safety_instructions && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">⚠️ SAFETY INSTRUCTIONS</div>
                <p className="text-sm">{result.ai_safety_instructions}</p>
              </div>
            )}

            {result.ai_required_resources?.length>0 && (
              <div>
                <div className="text-xs font-bold text-ink-500 mb-2">Dispatched resources</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.ai_required_resources.map(r => <Badge key={r} color="blue">{r.replace('_',' ')}</Badge>)}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-2 justify-center">
            <Button onClick={()=>window.open(`/app/incidents/${result.id}`,'_blank')}>Track Status →</Button>
            <Button variant="ghost" onClick={onClose}>Go Home</Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

function Mini({label,children}){return <div className="p-2 rounded-lg bg-ink-50 dark:bg-ink-800/50 text-center"><div className="text-[10px] font-bold text-ink-500 uppercase">{label}</div><div className="mt-1 text-sm font-bold flex items-center justify-center gap-1">{children}</div></div>}
