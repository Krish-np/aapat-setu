import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button, Card, SectionHeading } from '../components/ui'
import {
  AlertTriangle, Shield, Mic, Image as ImageIcon, Map, Brain, Radio,
  Hospital, Building2, Users, Flame, Landmark, HandHeart, UserCog,
  Gauge, Workflow, Languages, Cloud, Eye, Bell, BarChart3,
  Zap, CheckCircle2, ChevronRight, Phone, Send, Cpu, Bot,
} from 'lucide-react'

const FeatureIcon = ({ children, className = '' }) => (
  <div className={`w-12 h-12 rounded-2xl grid place-items-center bg-gradient-to-br from-brand-500/20 to-amber-500/20 text-brand-600 dark:text-brand-400 ${className}`}>{children}</div>
)

const roleIcons = {
  citizen: Users, volunteer: HandHeart, responder: Shield,
  hospital: Hospital, police: Landmark, fire: Flame,
  ngo: HeartIcon(), municipality: Building2, admin: UserCog,
}

function HeartIcon() { return <HandHeart /> }

export default function Landing() {
  const { t } = useTranslation()

  const features = [
    { icon: <Send size={22}/>, k: 'report' },
    { icon: <Bot size={22}/>, k: 'ai' },
    { icon: <Eye size={22}/>, k: 'vision' },
    { icon: <Map size={22}/>, k: 'map' },
    { icon: <Gauge size={22}/>, k: 'cmd' },
    { icon: <Cpu size={22}/>, k: 'risk' },
    { icon: <Workflow size={22}/>, k: 'resource' },
    { icon: <Radio size={22}/>, k: 'alerts' },
    { icon: <BarChart3 size={22}/>, k: 'analytics' },
    { icon: <Bell size={22}/>, k: 'realtime' },
  ]

  const roles = ['citizen','volunteer','responder','hospital','police','fire','ngo','municipality','admin']
  const roleIcon = (r) => ({
    citizen: <Users size={26}/>, volunteer: <HandHeart size={26}/>, responder: <Shield size={26}/>,
    hospital: <Hospital size={26}/>, police: <Landmark size={26}/>, fire: <Flame size={26}/>,
    ngo: <HandHeart size={26}/>, municipality: <Building2 size={26}/>, admin: <UserCog size={26}/>,
  }[r])
  const roleColor = (r) => ({
    citizen:'from-blue-500/20 to-cyan-500/20 text-blue-600',
    volunteer:'from-emerald-500/20 to-teal-500/20 text-emerald-600',
    responder:'from-red-500/20 to-orange-500/20 text-red-600',
    hospital:'from-pink-500/20 to-rose-500/20 text-pink-600',
    police:'from-slate-500/20 to-ink-500/20 text-ink-700',
    fire:'from-orange-500/20 to-red-500/20 text-orange-600',
    ngo:'from-purple-500/20 to-violet-500/20 text-purple-600',
    municipality:'from-indigo-500/20 to-blue-500/20 text-indigo-600',
    admin:'from-gray-500/20 to-slate-500/20 text-gray-700',
  }[r])

  const benefits = t('benefits.items', { returnObjects: true }) || []
  const futureItems = t('future.items', { returnObjects: true }) || []

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-28">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"/>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl"/>

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold mb-6">
              <span className="live-dot"/> {t('hero.pill_live')}
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] text-ink-900 dark:text-white">
              {t('hero.title')}<br/>
              <span className="gradient-text">{t('hero.title_gradient')}</span>
            </h1>
            <p className="mt-6 text-lg text-ink-600 dark:text-ink-300 max-w-xl leading-relaxed">{t('hero.subtitle')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/app/report">
                <Button size="lg" className="text-base">
                  <AlertTriangle size={20}/> {t('hero.cta_report')}
                </Button>
              </Link>
              <Link to="/app/login">
                <Button size="lg" variant="ghost" className="text-base">{t('hero.cta_app')} <ChevronRight size={18}/></Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {['bg-red-500','bg-orange-500','bg-blue-500','bg-emerald-500','bg-purple-500'].map((c,i)=>(
                  <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-white dark:border-ink-900 grid place-items-center text-white text-xs font-bold`}>
                    {['👤','🤝','🚑','🚒','👮'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold">9 roles, 1 network</div>
                <div className="text-xs text-ink-500">Citizens to command centers</div>
              </div>
            </div>
          </motion.div>

          {/* Hero Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/30 to-amber-500/30 rounded-[2rem] blur-2xl"/>
            <Card className="relative !p-0 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-ink-200/60 dark:border-ink-800 flex items-center gap-2">
                <div className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"/><span className="w-3 h-3 rounded-full bg-amber-500"/><span className="w-3 h-3 rounded-full bg-emerald-500"/></div>
                <div className="ml-3 text-xs font-semibold text-ink-500">Command Center · LIVE</div>
              </div>
              <div className="p-5 grid grid-cols-3 gap-3">
                {[
                  {v:'3', l:'Critical', c:'text-red-600'},
                  {v:'12', l:'Active', c:'text-orange-600'},
                  {v:'47', l:'Resolved', c:'text-emerald-600'},
                ].map(s => (
                  <div key={s.l} className="rounded-xl bg-ink-50 dark:bg-ink-800/60 p-3 text-center">
                    <div className={`text-2xl font-extrabold ${s.c}`}>{s.v}</div>
                    <div className="text-[10px] font-semibold text-ink-500 uppercase tracking-wide">{s.l}</div>
                  </div>
                ))}
              </div>
              {/* fake map */}
              <div className="px-5 pb-5">
                <div className="relative rounded-xl overflow-hidden h-64 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-ink-800 dark:to-ink-900">
                  <div className="absolute inset-0 opacity-40" style={{backgroundImage:'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),linear-gradient(90deg,rgba(0,0,0,.1) 1px, transparent 1px)', backgroundSize:'24px 24px'}}/>
                  {/* fake roads */}
                  <div className="absolute left-0 right-0 top-1/2 h-2 bg-white/60 dark:bg-ink-700/60 -translate-y-1/2"/>
                  <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-white/60 dark:bg-ink-700/60"/>
                  {/* pins */}
                  {[
                    {top:'22%', left:'28%', color:'bg-red-500', pulse:true},
                    {top:'55%', left:'55%', color:'bg-red-500', pulse:true},
                    {top:'40%', left:'72%', color:'bg-orange-500', pulse:true},
                    {top:'70%', left:'25%', color:'bg-amber-500'},
                    {top:'30%', left:'80%', color:'bg-emerald-500'},
                  ].map((p,i) => (
                    <div key={i} className={`absolute ${p.color} w-4 h-4 rounded-full border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2 ${p.pulse?'pulse-dot text-red-500':''}`} style={{top:p.top, left:p.left}}/>
                  ))}
                  {/* hospital icon */}
                  <div className="absolute top-[15%] right-[12%] w-8 h-8 rounded-lg bg-pink-500 text-white grid place-items-center text-sm font-bold">H</div>
                  <div className="absolute bottom-[18%] left-[15%] w-8 h-8 rounded-lg bg-blue-500 text-white grid place-items-center text-sm font-bold">🚓</div>
                  {/* AI card */}
                  <div className="absolute bottom-3 left-3 right-3 glass rounded-xl p-2.5 flex items-center gap-2 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white grid place-items-center">🤖</div>
                    <div>
                      <div className="font-semibold">AI Triage Complete</div>
                      <div className="text-ink-500 text-[10px]">Flood reported · Critical · 3 responders dispatched</div>
                    </div>
                    <div className="ml-auto text-emerald-600 font-bold text-[10px]">ETA 4m</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeading eyebrow={t('problem.eyebrow')} title={t('problem.title')} sub={t('problem.sub')}/>
          <Card className="!bg-gradient-to-r from-red-50/80 to-amber-50/80 dark:from-red-500/10 dark:to-amber-500/5 !border-red-200 dark:!border-red-500/20">
            <h3 className="font-bold text-lg flex items-center gap-2 text-red-700 dark:text-red-400 mb-2"><AlertTriangle size={22}/> {t('problem.banner_title')}</h3>
            <p className="text-ink-700 dark:text-ink-300">{t('problem.banner_body')}</p>
          </Card>
        </div>
      </section>

      {/* SOLUTION / FEATURES */}
      <section id="features" className="py-20 bg-ink-50/50 dark:bg-ink-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow={t('solution.eyebrow')} title={t('solution.title')} sub={t('solution.sub')}/>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.k} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay: i*0.05}}>
                <Card className="h-full">
                  <FeatureIcon>{f.icon}</FeatureIcon>
                  <h3 className="mt-4 font-bold text-base">{t(`features.${f.k}.title`)}</h3>
                  <p className="mt-2 text-sm text-ink-500 dark:text-ink-400 leading-relaxed">{t(`features.${f.k}.desc`)}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow={t('workflow.eyebrow')} title={t('workflow.title')}/>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(t('workflow.steps', { returnObjects: true }) || []).map((s, i) => (
              <Card key={i} className="relative">
                <div className="absolute -top-3 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-sm grid place-items-center shadow-lg shadow-brand-600/30">{i+1}</div>
                <div className="pt-3">
                  <div className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-2">Step {i+1}</div>
                  <h4 className="font-bold mb-1">{s.title}</h4>
                  <p className="text-sm text-ink-500 dark:text-ink-400">{s.desc}</p>
                  {(i === 1 || i === 2 || i === 3 || i === 4) && <div className="mt-2"><span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">AI</span></div>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-20 bg-ink-50/50 dark:bg-ink-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow={t('roles.eyebrow')} title={t('roles.title')}/>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {roles.map((r, i) => (
              <motion.div key={r} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.04}}>
                <Card className="h-full">
                  <div className={`w-12 h-12 rounded-2xl grid place-items-center bg-gradient-to-br ${roleColor(r)} mb-4`}>{roleIcon(r)}</div>
                  <h4 className="font-bold text-base">{t(`roles.${r}.name`)}</h4>
                  <p className="mt-2 text-sm text-ink-500 dark:text-ink-400 leading-relaxed">{t(`roles.${r}.desc`)}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading eyebrow={t('benefits.eyebrow')} title={t('benefits.title')}/>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b,i) => (
              <motion.div key={i} initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.05}}>
                <Card className="h-full flex gap-3">
                  <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={22}/>
                  <div>
                    <h4 className="font-bold">{b.title}</h4>
                    <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{b.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI CAPABILITIES HIGHLIGHT */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-purple-500/10"/>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 mb-3">AI Intelligence Engine</div>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                6 AI models working in parallel — <span className="gradient-text">before a human sees the report.</span>
              </h2>
              <ul className="mt-6 space-y-3">
                {[
                  {icon:<Mic size={18}/>, t:'Speech-to-Text + language detection + Nepali translation'},
                  {icon:<ImageIcon size={18}/>, t:'Image analysis for fire/flood/damage/casualties'},
                  {icon:<Brain size={18}/>, t:'Severity + risk score + confidence scoring'},
                  {icon:<Workflow size={18}/>, t:'Resource recommendation (ambulance/fire/police/NGO)'},
                  {icon:<Languages size={18}/>, t:'English ↔ Nepali instant translation'},
                  {icon:<Eye size={18}/>, t:'Duplicate detection by location + semantic similarity'},
                ].map((x,i) => (
                  <li key={i} className="flex items-start gap-3 glass-strong rounded-xl p-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white grid place-items-center flex-shrink-0">{x.icon}</div>
                    <span>{x.t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="!p-6 !bg-gradient-to-br from-ink-900 to-ink-800 !text-white !border-0 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 grid place-items-center">🤖</div>
                <div className="font-bold">AI Incident Briefing</div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-ink-400">Type</span><b className="capitalize">Flood</b></div>
                <div className="flex justify-between"><span className="text-ink-400">Severity</span><span className="text-red-400 font-bold">CRITICAL · 92%</span></div>
                <div className="flex justify-between"><span className="text-ink-400">Victims (est.)</span><b>8 – 15</b></div>
                <div className="flex justify-between"><span className="text-ink-400">ETA responders</span><b>4 minutes</b></div>
                <div className="flex justify-between"><span className="text-ink-400">Rescue difficulty</span><b className="text-amber-400">High</b></div>
                <div className="border-t border-white/10 pt-3">
                  <div className="text-xs text-ink-400 mb-2">Required resources</div>
                  <div className="flex flex-wrap gap-1.5">
                    {['rescue boat','ambulance','volunteers','shelter','food','water'].map(r => (
                      <span key={r} className="px-2 py-0.5 rounded-md bg-white/10 text-xs">{r}</span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="text-xs text-ink-400 mb-1">Safety instruction</div>
                  <div className="text-xs leading-relaxed">Move to higher ground immediately. Do not walk or drive through flood water...</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FUTURE */}
      <section id="future" className="py-20 bg-ink-50/50 dark:bg-ink-900/30">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeading eyebrow={t('future.eyebrow')} title={t('future.title')}/>
          <div className="grid sm:grid-cols-2 gap-3">
            {futureItems.map((f,i) => (
              <div key={i} className="flex items-center gap-3 glass rounded-xl p-3">
                <Zap className="text-amber-500 flex-shrink-0" size={18}/>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="relative overflow-hidden !bg-gradient-to-br from-brand-600 via-brand-500 to-amber-500 !text-white !border-0 shadow-2xl shadow-brand-600/30 text-center !p-12">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"/>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"/>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold">Ready to bridge the response gap?</h2>
              <p className="mt-3 opacity-90">Report an emergency, or explore the live platform with a demo account.</p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Link to="/app/report">
                  <Button size="lg" variant="secondary" className="!text-brand-700"><AlertTriangle size={18}/> Report Emergency</Button>
                </Link>
                <Link to="/app/login">
                  <Button size="lg" className="!bg-white !text-brand-700 hover:!bg-ink-50">Launch Platform →</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink-200 dark:border-ink-800 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white"><Shield size={16}/></div>
            <div>
              <div className="font-extrabold">{t('brand')}</div>
              <div className="text-xs text-ink-500">{t('footer.tagline')}</div>
            </div>
          </div>
          <div className="text-xs text-ink-500 text-center">{t('footer.made_by')}</div>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <Languages size={14}/> EN · ने
          </div>
        </div>
      </footer>
    </div>
  )
}
