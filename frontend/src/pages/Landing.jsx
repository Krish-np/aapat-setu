import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button, Card, SectionHeading } from '../components/ui'
import logoImg from '../assets/logo.png'
import {
  AlertTriangle, Shield, Mic, Image as ImageIcon, Map, Brain, Radio,
  Hospital, Building2, Users, Flame, Landmark, HandHeart, UserCog,
  Gauge, Workflow, Languages, Eye, Bell, BarChart3,
  Zap, CheckCircle2, ChevronRight, Phone, Cpu, Bot,
  Sparkles, LifeBuoy, ArrowRight,
} from 'lucide-react'

/* ------------------------------------------------------------------
 * Small presentational helpers (local to Landing; do NOT leak globally)
 * ------------------------------------------------------------------ */
const FeatureIcon = ({ children, tone = 'brand' }) => {
  const tones = {
    brand:   'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
    purple:  'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300',
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  }
  return (
    <div className={`w-11 h-11 rounded-xl grid place-items-center ${tones[tone] || tones.brand}`}>
      {children}
    </div>
  )
}

const roleStyles = {
  citizen:      { Icon: Users,       gradient: 'from-blue-500/20 to-cyan-500/20',    text: 'text-blue-600 dark:text-blue-400'         },
  volunteer:    { Icon: HandHeart,   gradient: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-600 dark:text-emerald-400'   },
  responder:    { Icon: AlertTriangle, gradient: 'from-red-500/20 to-orange-500/20',   text: 'text-red-600 dark:text-red-400'           },
  hospital:     { Icon: Hospital,    gradient: 'from-pink-500/20 to-rose-500/20',    text: 'text-pink-600 dark:text-pink-400'         },
  police:       { Icon: Landmark,    gradient: 'from-slate-500/20 to-ink-500/20',    text: 'text-slate-700 dark:text-slate-300'       },
  fire:         { Icon: Flame,       gradient: 'from-orange-500/20 to-red-500/20',   text: 'text-orange-600 dark:text-orange-400'     },
  ngo:          { Icon: HandHeart,   gradient: 'from-purple-500/20 to-violet-500/20',text: 'text-purple-600 dark:text-purple-400'     },
  municipality: { Icon: Building2,   gradient: 'from-indigo-500/20 to-blue-500/20',  text: 'text-indigo-600 dark:text-indigo-400'     },
  admin:        { Icon: UserCog,     gradient: 'from-gray-500/20 to-slate-500/20',   text: 'text-gray-700 dark:text-gray-300'         },
}

const containerClass = 'max-w-7xl mx-auto px-4 sm:px-6'

/* Section wrapper — keeps vertical rhythm consistent */
const Section = ({ id, className = '', children, bg = 'plain' }) => {
  const bgs = {
    plain: '',
    muted: 'bg-ink-50/60 dark:bg-ink-900/30',
    red:   'bg-gradient-to-b from-brand-50/70 to-transparent dark:from-brand-500/5 dark:to-transparent',
    ai:    'relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50/60 dark:from-purple-500/5 dark:via-ink-950 dark:to-blue-500/5',
  }
  return (
    <section id={id} className={`py-16 md:py-24 ${bgs[bg] || ''} ${className}`}>
      <div className={containerClass}>{children}</div>
    </section>
  )
}

export default function Landing() {
  const { t } = useTranslation()

  const features = [
    { icon: <AlertTriangle size={22}/>, k: 'report',    tone: 'brand'   },
    { icon: <Bot size={22}/>,          k: 'ai',        tone: 'purple'  },
    { icon: <ImageIcon size={22}/>,    k: 'vision',    tone: 'blue'    },
    { icon: <Map size={22}/>,          k: 'map',       tone: 'emerald' },
    { icon: <Gauge size={22}/>,        k: 'cmd',       tone: 'brand'   },
    { icon: <Cpu size={22}/>,          k: 'risk',      tone: 'amber'   },
    { icon: <Workflow size={22}/>,     k: 'resource',  tone: 'blue'    },
    { icon: <Radio size={22}/>,        k: 'alerts',    tone: 'purple'  },
    { icon: <BarChart3 size={22}/>,    k: 'analytics', tone: 'emerald' },
    { icon: <Bell size={22}/>,         k: 'realtime',  tone: 'amber'   },
  ]

  const roles = ['citizen','volunteer','responder','hospital','police','fire','ngo','municipality','admin']
  const benefits = t('benefits.items', { returnObjects: true }) || []
  const futureItems = t('future.items', { returnObjects: true }) || []
  const steps = t('workflow.steps', { returnObjects: true }) || []

  const aiCaps = [
    { icon:<Mic size={18}/>,       label:'Speech-to-text, language detection, and instant Nepali translation' },
    { icon:<ImageIcon size={18}/>, label:'Image & video analysis — detects fire, flood, damage, and casualties' },
    { icon:<Brain size={18}/>,     label:'Severity, risk score, and confidence estimates within seconds' },
    { icon:<Workflow size={18}/>,  label:'Resource recommendation — ambulance, fire, police, NGO, shelter' },
    { icon:<Languages size={18}/>, label:'English ↔ Nepali translation for voice, text, and public alerts' },
    { icon:<Eye size={18}/>,       label:'Duplicate detection via location + semantic similarity' },
  ]

  return (
    <div className="min-h-screen">
      {/* ================================================================ HERO */}
      <section className="relative overflow-hidden pt-16 md:pt-24 pb-20 md:pb-28 landing-hero">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" aria-hidden/>
        <div aria-hidden className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-brand-500/15 rounded-full blur-3xl"/>
        <div aria-hidden className="absolute -bottom-40 -left-40 w-[520px] h-[520px] bg-amber-500/10 rounded-full blur-3xl"/>

        <div className={`${containerClass} relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-center`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold mb-6">
              <span className="live-dot" aria-hidden/>
              <span className="text-ink-700 dark:text-ink-200">{t('hero.pill_live')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-ink-900 dark:text-white">
              {t('hero.title')}{' '}
              <span className="gradient-text">{t('hero.title_gradient')}</span>
            </h1>

            <p className="mt-5 md:mt-6 text-base md:text-lg text-ink-600 dark:text-ink-300 max-w-xl leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="mt-7 md:mt-8 flex flex-wrap gap-3">
              <Link to="/app/report">
                <Button size="lg" className="text-base h-12 px-6 shadow-lg shadow-brand-600/25">
                  <AlertTriangle size={19}/> {t('hero.cta_report')}
                </Button>
              </Link>
              <Link to="/app/login">
                <Button size="lg" variant="secondary" className="text-base h-12 px-6">
                  {t('hero.cta_app')} <ChevronRight size={18}/>
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-8 md:mt-10 flex items-center gap-5">
              <div className="flex -space-x-2.5">
                {['bg-red-500','bg-orange-500','bg-blue-500','bg-emerald-500','bg-purple-500'].map((c, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full ${c} ring-2 ring-white dark:ring-ink-900 grid place-items-center text-white text-xs font-bold`}>
                    {['👤','🤝','🚑','🚒','👮'][i]}
                  </div>
                ))}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-ink-900 dark:text-white">9 roles · 1 network</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">From citizens to command centers</div>
              </div>
            </div>

            {/* Quick trust strip */}
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              {[
                { v: '< 30s', l: 'AI triage' },
                { v: '9',     l: 'stakeholder roles' },
                { v: '24/7',  l: 'real-time alerts' },
              ].map(s => (
                <div key={s.l} className="rounded-xl glass px-3 py-2.5">
                  <div className="text-lg font-black text-brand-600 dark:text-brand-400 leading-none">{s.v}</div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero: Command Center Preview */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="relative"
          >
            <div aria-hidden className="absolute -inset-6 bg-gradient-to-br from-brand-500/25 to-amber-500/20 rounded-[2rem] blur-2xl"/>
            <Card className="relative !p-0 overflow-hidden shadow-card-lg">
              {/* Window chrome */}
              <div className="p-3.5 md:p-4 border-b border-ink-100 dark:border-ink-800 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400"/>
                  <span className="w-3 h-3 rounded-full bg-amber-400"/>
                  <span className="w-3 h-3 rounded-full bg-emerald-400"/>
                </div>
                <div className="ml-3 text-xs font-semibold text-ink-500 dark:text-ink-400 flex items-center gap-1.5">
                  <Shield size={12}/> Command Center · <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>LIVE</span>
                </div>
              </div>

              {/* KPI row */}
              <div className="p-4 md:p-5 grid grid-cols-3 gap-2.5 md:gap-3">
                {[
                  { v:'3',  l:'Critical', c:'text-red-600 dark:text-red-400' },
                  { v:'12', l:'Active',   c:'text-orange-600 dark:text-orange-400' },
                  { v:'47', l:'Resolved', c:'text-emerald-600 dark:text-emerald-400' },
                ].map(s => (
                  <div key={s.l} className="rounded-xl bg-ink-50 dark:bg-ink-800/60 p-3 text-center">
                    <div className={`text-2xl md:text-3xl font-black ${s.c} leading-none`}>{s.v}</div>
                    <div className="mt-1 text-[10px] font-bold text-ink-500 dark:text-ink-400 uppercase tracking-widest">{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Fake map preview */}
              <div className="px-4 md:px-5 pb-4 md:pb-5">
                <div className="relative rounded-xl overflow-hidden h-56 md:h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-ink-800 dark:to-ink-900 border border-ink-100 dark:border-ink-800">
                  <div className="absolute inset-0 opacity-50"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(15,23,42,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,.06) 1px,transparent 1px)',
                      backgroundSize: '24px 24px',
                    }} aria-hidden/>
                  {/* Roads */}
                  <div aria-hidden className="absolute left-0 right-0 top-[45%] h-2 bg-white/80 dark:bg-ink-700/70 rounded-full -translate-y-1/2"/>
                  <div aria-hidden className="absolute top-0 bottom-0 left-[36%] w-2 bg-white/80 dark:bg-ink-700/70 rounded-full"/>
                  {/* Curved road */}
                  <div aria-hidden
                    className="absolute left-[10%] right-[10%] top-[70%] h-2 bg-white/70 dark:bg-ink-700/50 rounded-full"
                    style={{ transform:'rotate(-6deg)' }}/>
                  {/* Pins */}
                  {[
                    { top:'22%', left:'28%', color:'bg-red-500', pulse:true },
                    { top:'50%', left:'56%', color:'bg-red-500', pulse:true },
                    { top:'38%', left:'72%', color:'bg-orange-500', pulse:true },
                    { top:'68%', left:'24%', color:'bg-amber-500' },
                    { top:'26%', left:'82%', color:'bg-emerald-500' },
                  ].map((p, i) => (
                    <div key={i}
                      className={`absolute ${p.color} w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-ink-900 shadow-md -translate-x-1/2 -translate-y-full ${p.pulse ? 'pulse-dot text-red-500' : ''}`}
                      style={{ top: p.top, left: p.left }}/>
                  ))}
                  {/* POIs */}
                  <div className="absolute top-[14%] right-[10%] w-8 h-8 rounded-lg bg-pink-500 text-white grid place-items-center text-sm font-bold shadow-lg" aria-hidden>H</div>
                  <div className="absolute bottom-[14%] left-[12%] w-8 h-8 rounded-lg bg-blue-500 text-white grid place-items-center text-sm font-bold shadow-lg" aria-hidden>🚓</div>

                  {/* AI triage toast */}
                  <div className="absolute bottom-3 left-3 right-3 glass-strong rounded-xl p-2.5 flex items-center gap-2.5 shadow-card">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white grid place-items-center shadow-md shrink-0">
                      <Bot size={16}/>
                    </div>
                    <div className="min-w-0 leading-tight">
                      <div className="text-xs font-bold text-ink-900 dark:text-white">AI Triage Complete</div>
                      <div className="text-[10.5px] text-ink-500 dark:text-ink-400 truncate">
                        Flood · Critical · 3 responders dispatched
                      </div>
                    </div>
                    <div className="ml-auto text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">ETA 4m</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ================================================================ PROBLEM */}
      <Section id="problem" bg="red">
        <SectionHeading eyebrow={t('problem.eyebrow')} title={t('problem.title')} sub={t('problem.sub')}/>
        <Card className="mt-8 !bg-gradient-to-r from-red-50/90 to-amber-50/90 dark:!from-red-500/10 dark:!to-amber-500/5 !border-red-200/80 dark:!border-red-500/20">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500 text-white grid place-items-center shadow-lg shadow-red-500/25 shrink-0">
              <AlertTriangle size={22}/>
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                {t('problem.banner_title')}
              </h3>
              <p className="mt-1.5 text-ink-700 dark:text-ink-300 leading-relaxed">
                {t('problem.banner_body')}
              </p>
            </div>
          </div>
        </Card>
      </Section>

      {/* ================================================================ FEATURES */}
      <Section id="features" bg="muted">
        <SectionHeading eyebrow={t('solution.eyebrow')} title={t('solution.title')} sub={t('solution.sub')}/>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.k}
              initial={{ opacity:0, y: 16 }}
              whileInView={{ opacity:1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration:.4, delay: i * 0.04 }}>
              <Card hover className="h-full flex flex-col">
                <FeatureIcon tone={f.tone}>{f.icon}</FeatureIcon>
                <h3 className="mt-4 font-bold text-[15px] text-ink-900 dark:text-white leading-snug">
                  {t(`features.${f.k}.title`)}
                </h3>
                <p className="mt-1.5 text-[13px] text-ink-500 dark:text-ink-400 leading-relaxed flex-1">
                  {t(`features.${f.k}.desc`)}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ================================================================ HOW IT WORKS */}
      <Section id="how">
        <SectionHeading eyebrow={t('workflow.eyebrow')} title={t('workflow.title')}/>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <Card className="h-full relative overflow-hidden">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-black text-sm grid place-items-center shadow-lg shadow-brand-600/25 ring-4 ring-white dark:ring-ink-900">
                  {i + 1}
                </div>
                <div className="pt-4">
                  <div className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-[0.18em] mb-2">
                    Step {i + 1}
                  </div>
                  <h4 className="font-bold text-[15px] text-ink-900 dark:text-white leading-snug mb-1">{s.title}</h4>
                  <p className="text-[13px] text-ink-500 dark:text-ink-400 leading-relaxed">{s.desc}</p>
                  {i > 0 && i < steps.length - 1 && (
                    <span className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                      <Sparkles size={10}/> AI
                    </span>
                  )}
                </div>
              </Card>
              {/* Connector between cards on desktop */}
              {i < steps.length - 1 && (
                <div aria-hidden className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-gradient-to-r from-ink-200 to-transparent dark:from-ink-700"/>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ================================================================ ROLES */}
      <Section id="roles" bg="muted">
        <SectionHeading eyebrow={t('roles.eyebrow')} title={t('roles.title')}
          sub="Each stakeholder sees a purpose-built dashboard — no noise, no training required."/>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {roles.map((r, i) => {
            const { Icon, gradient, text } = roleStyles[r]
            return (
              <motion.div key={r}
                initial={{ opacity:0, y: 16 }}
                whileInView={{ opacity:1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration:.35, delay: i * 0.04 }}>
                <Card hover className="h-full">
                  <div className={`w-12 h-12 rounded-2xl grid place-items-center bg-gradient-to-br ${gradient} mb-4`}>
                    <Icon size={24} className={text}/>
                  </div>
                  <h4 className="font-bold text-[15px] text-ink-900 dark:text-white">{t(`roles.${r}.name`)}</h4>
                  <p className="mt-1.5 text-[13px] text-ink-500 dark:text-ink-400 leading-relaxed">
                    {t(`roles.${r}.desc`)}
                  </p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </Section>

      {/* ================================================================ AI */}
      <Section id="ai" bg="ai" className="relative">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"/>
        <div className="relative grid md:grid-cols-2 gap-8 lg:gap-14 items-center">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-1.5">
              <Sparkles size={13}/> AI Intelligence Engine
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold leading-[1.15] text-ink-900 dark:text-white">
              6 AI models, working in parallel —{' '}
              <span className="gradient-text">before a human sees the report.</span>
            </h2>
            <p className="mt-4 text-ink-600 dark:text-ink-300 leading-relaxed max-w-xl">
              Every incoming report is processed end-to-end in seconds — transcribed,
              translated, analyzed for hazards, scored for severity, deduplicated, and routed
              to the right responder.
            </p>
            <ul className="mt-6 space-y-2.5">
              {aiCaps.map((x, i) => (
                <li key={i} className="flex items-start gap-3 glass-strong rounded-xl p-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white grid place-items-center shrink-0 shadow-md">
                    {x.icon}
                  </div>
                  <span className="text-ink-700 dark:text-ink-200 leading-relaxed pt-0.5">{x.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI briefing mock card */}
          <Card className="!p-6 !bg-gradient-to-br from-ink-900 to-ink-800 !text-white !border-0 shadow-card-lg">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 grid place-items-center shadow-lg">
                <Bot size={18}/>
              </div>
              <div>
                <div className="font-bold text-[15px]">AI Incident Briefing</div>
                <div className="text-[11px] text-ink-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> Generated in 2.4s
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <Row k="Type" v={<b className="capitalize">Flood</b>}/>
              <Row k="Severity" v={<span className="text-red-400 font-bold">CRITICAL · 92%</span>}/>
              <Row k="Victims (est.)" v={<b>8 – 15</b>}/>
              <Row k="ETA responders" v={<b>4 minutes</b>}/>
              <Row k="Rescue difficulty" v={<b className="text-amber-400">High</b>}/>
              <div className="border-t border-white/10 pt-3">
                <div className="text-[11px] uppercase tracking-wider text-ink-400 font-bold mb-2">Required resources</div>
                <div className="flex flex-wrap gap-1.5">
                  {['rescue boat','ambulance','volunteers','shelter','food','water'].map(r => (
                    <span key={r} className="px-2 py-1 rounded-md bg-white/10 text-xs font-medium">{r}</span>
                  ))}
                </div>
              </div>
              <div className="border-t border-white/10 pt-3">
                <div className="text-[11px] uppercase tracking-wider text-ink-400 font-bold mb-1.5">Safety instruction</div>
                <div className="text-xs leading-relaxed text-ink-200">
                  Move to higher ground immediately. Do not walk or drive through flood water.
                  Stay tuned to local alerts for evacuation routes.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* ================================================================ BENEFITS */}
      <Section id="benefits">
        <SectionHeading eyebrow={t('benefits.eyebrow')} title={t('benefits.title')}/>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <motion.div key={i}
              initial={{ opacity:0, x: -16 }}
              whileInView={{ opacity:1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration:.35, delay: i * 0.05 }}>
              <Card hover className="h-full flex gap-3.5">
                <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={22}/>
                <div className="min-w-0">
                  <h4 className="font-bold text-[15px] text-ink-900 dark:text-white">{b.title}</h4>
                  <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-400 leading-relaxed">{b.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ================================================================ MAP / TRUST */}
      <Section id="map" bg="muted">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400 mb-3 flex items-center gap-1.5">
              <Map size={13}/> Live Shared Map
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-[1.15] text-ink-900 dark:text-white">
              One map. Every incident, every resource — updated live.
            </h2>
            <p className="mt-4 text-ink-600 dark:text-ink-300 leading-relaxed max-w-lg">
              Color-coded severity pins, POIs for hospitals/police/fire/shelters, ETA-based routing
              for driving, walking, and cycling, and real-time WebSocket updates — no refresh needed.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                { icon:<AlertTriangle size={15} className="text-red-500"/>, t:'Critical / High / Moderate / Low severity coding' },
                { icon:<LifeBuoy size={15} className="text-blue-500"/>,    t:'One-tap routing from your location to any incident' },
                { icon:<Shield size={15} className="text-purple-500"/>,    t:'Responder, hospital, shelter, and supply POIs' },
                { icon:<Eye size={15} className="text-emerald-500"/>,     t:'Public alerts & evacuation radius overlays' },
              ].map((x, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-ink-700 dark:text-ink-200">
                  <span className="w-7 h-7 rounded-lg bg-white dark:bg-ink-900 shadow-sm border border-ink-100 dark:border-ink-800 grid place-items-center shrink-0">{x.icon}</span>
                  {x.t}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/app/login"><Button size="lg"><Map size={18}/> Open Live Map <ArrowRight size={16}/></Button></Link>
              <Link to="/app/report"><Button size="lg" variant="secondary">Report Emergency</Button></Link>
            </div>
          </div>

          {/* Static map illustration card */}
          <Card className="relative !p-0 overflow-hidden shadow-card-lg">
            <div className="relative h-80 md:h-[400px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-ink-800 dark:to-ink-900">
              <div className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(15,23,42,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,.06) 1px,transparent 1px)',
                  backgroundSize: '28px 28px',
                }}/>
              {/* Road network */}
              <div aria-hidden className="absolute left-0 right-0 top-1/2 h-2.5 bg-white/80 dark:bg-ink-700/60 -translate-y-1/2 rounded-full"/>
              <div aria-hidden className="absolute top-0 bottom-0 left-[30%] w-2.5 bg-white/80 dark:bg-ink-700/60 rounded-full"/>
              <div aria-hidden className="absolute top-0 bottom-0 right-[22%] w-2 bg-white/60 dark:bg-ink-700/40 rounded-full"/>
              <div aria-hidden className="absolute left-[10%] right-[10%] bottom-[20%] h-2 bg-white/70 dark:bg-ink-700/50 rounded-full" style={{transform:'rotate(-4deg)'}}/>
              {/* Radius ring */}
              <div aria-hidden className="absolute left-[52%] top-[45%] -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-dashed border-red-400/60 bg-red-500/5"/>
              {/* Pins */}
              {[
                { top:'32%', left:'30%', c:'#dc2626', big:true,  pulse:true  },
                { top:'45%', left:'52%', c:'#dc2626', big:true,  pulse:true  },
                { top:'28%', left:'70%', c:'#ea580c', big:true,  pulse:false },
                { top:'60%', left:'38%', c:'#d97706', big:false, pulse:false },
                { top:'20%', left:'80%', c:'#059669', big:false, pulse:false },
                { top:'72%', left:'62%', c:'#059669', big:false, pulse:false },
              ].map((p, i) => (
                <div key={i} className="absolute" style={{ top: p.top, left: p.left, transform: 'translate(-50%,-100%)' }}>
                  <div className="relative">
                    {p.pulse && (
                      <span aria-hidden className="absolute left-1/2 -translate-x-1/2 top-[50%] w-5 h-5 rounded-full"
                        style={{ background: p.c, opacity: .25, animation: 'pinRing 1.8s cubic-bezier(.22,1,.36,1) infinite' }}/>
                    )}
                    <svg viewBox="0 0 32 42" width={p.big ? 38 : 30} height={p.big ? 50 : 40}
                      style={{ filter:'drop-shadow(0 4px 6px rgba(15,23,42,.25))' }}>
                      <path d="M16 2C8 2 2 8 2 16c0 11 14 24 14 24s14-13 14-24c0-8-6-14-14-14z"
                        fill={p.c} stroke="#fff" strokeWidth="2"/>
                      <circle cx="16" cy="16" r="7" fill="rgba(255,255,255,.22)"/>
                      <circle cx="16" cy="16" r="2.5" fill="#fff"/>
                    </svg>
                  </div>
                </div>
              ))}
              {/* Legend */}
              <div className="absolute bottom-3 left-3 glass-strong rounded-xl p-2.5 text-[11px] font-semibold space-y-1.5 shadow-card">
                {[
                  { c:'#dc2626', l:'Critical' }, { c:'#ea580c', l:'High' },
                  { c:'#d97706', l:'Moderate' }, { c:'#059669', l:'Low' },
                ].map(x => (
                  <div key={x.l} className="flex items-center gap-2 text-ink-700 dark:text-ink-200">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: x.c }}/>{x.l}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* ================================================================ FUTURE */}
      <Section id="future">
        <SectionHeading eyebrow={t('future.eyebrow')} title={t('future.title')}
          sub="A platform built to evolve with Nepal's emergency-response ecosystem."/>
        <div className="mt-10 grid sm:grid-cols-2 gap-3">
          {futureItems.map((f, i) => (
            <div key={i} className="flex items-center gap-3 glass rounded-xl p-3.5 hover:shadow-card transition-shadow">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 grid place-items-center shrink-0">
                <Zap size={16}/>
              </div>
              <span className="text-sm text-ink-700 dark:text-ink-200 leading-relaxed">{f}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ================================================================ CONTACT / CTA */}
      <Section id="contact" bg="muted">
        <Card className="relative overflow-hidden !bg-gradient-to-br from-brand-600 via-brand-500 to-amber-500 !text-white !border-0 shadow-card-lg text-center !p-10 md:!p-14">
          <div aria-hidden className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl"/>
          <div aria-hidden className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl"/>
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-widest mb-5">
              <Phone size={12}/> Get in touch
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">Ready to bridge the response gap?</h2>
            <p className="mt-3 text-white/85 max-w-xl mx-auto leading-relaxed">
              Report an emergency, or explore the live platform with a demo account.
              Built by Team Zero Day for HackFusion 2026.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link to="/app/report">
                <Button size="lg" variant="secondary" className="!text-brand-700 h-12 px-6 font-bold">
                  <AlertTriangle size={18}/> Report Emergency
                </Button>
              </Link>
              <Link to="/app/login">
                <Button size="lg" className="!bg-white !text-brand-700 hover:!bg-ink-50 h-12 px-6 font-bold">
                  Launch Platform <ArrowRight size={18}/>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </Section>

      {/* ================================================================ FOOTER */}
      <footer className="border-t border-ink-200 dark:border-ink-800 py-10 bg-white dark:bg-ink-950">
        <div className={`${containerClass} flex flex-col md:flex-row items-center justify-between gap-6`}>
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Aapat Setu" className="w-9 h-9 rounded-xl object-contain bg-white p-0.5 shadow-lg shadow-brand-600/25" />
            <div>
              <div className="font-extrabold text-ink-900 dark:text-white leading-tight">{t('brand')}</div>
              <div className="text-xs text-ink-500 dark:text-ink-400">{t('footer.tagline')}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-500 dark:text-ink-400">
            <a href="#features" className="hover:text-ink-900 dark:hover:text-white transition">Features</a>
            <a href="#how"      className="hover:text-ink-900 dark:hover:text-white transition">How it works</a>
            <a href="#ai"       className="hover:text-ink-900 dark:hover:text-white transition">AI</a>
            <a href="#roles"    className="hover:text-ink-900 dark:hover:text-white transition">For Responders</a>
            <a href="#map"      className="hover:text-ink-900 dark:hover:text-white transition">Live Map</a>
            <a href="#contact"  className="hover:text-ink-900 dark:hover:text-white transition">Contact</a>
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-500 dark:text-ink-400">
            <Languages size={14}/> <span>EN · ने</span>
          </div>
        </div>
        <div className={`${containerClass} mt-6 pt-6 border-t border-ink-100 dark:border-ink-800 text-center text-xs text-ink-400 dark:text-ink-500`}>
          {t('footer.made_by')}
        </div>
      </footer>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-ink-400 text-[13px]">{k}</span>
      <span className="text-[13px] text-right">{v}</span>
    </div>
  )
}
