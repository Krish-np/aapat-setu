import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/ui'
import BackButton from '../components/BackButton'
import { useTranslation } from 'react-i18next'
import { BookOpen, AlertTriangle, Heart, Flame, Waves, Mountain, Building2, Car, Zap } from 'lucide-react'

const CLR = {
  red:    'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400',
  blue:   'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400',
  orange: 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400',
  amber:  'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
  pink:   'bg-pink-50 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400',
  slate:  'bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-300',
  yellow: 'bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
}

const GUIDES = [
  { icon:Flame, title:'Fire Safety', color:'red', items:['Evacuate immediately using stairs, not elevators','Stay low to avoid smoke inhalation','Close doors behind you to slow spread','Call 101 once you are safe'] },
  { icon:Waves, title:'Flood Safety', color:'blue', items:['Move to higher ground immediately','Do not walk or drive through flood water','Avoid contact with electrical equipment','Listen to official evacuation orders'] },
  { icon:Mountain, title:'Earthquake', color:'orange', items:['Drop, Cover, and Hold On','Stay away from windows and heavy furniture','If outdoors, move to open space away from buildings','After shaking stops, evacuate carefully'] },
  { icon:Mountain, title:'Landslide', color:'amber', items:['Move away from the slope immediately','Listen for unusual sounds (trees cracking, boulders)','Avoid river valleys and steep slopes during heavy rain','Warn neighbors and alert authorities'] },
  { icon:Heart, title:'First Aid (Medical)', color:'pink', items:['Call for ambulance immediately','Keep the person calm and still','Apply firm pressure to bleeding','Do not move someone with suspected spinal injury'] },
  { icon:Car, title:'Road Accident', color:'slate', items:['Turn on hazard lights to warn others','Do not move seriously injured people','Call police (100) and ambulance (102)','Provide first aid only if trained'] },
  { icon:Building2, title:'Building Collapse', color:'slate', items:['Evacuate surrounding buildings immediately','Do not enter unstable structures','If trapped, conserve phone battery; tap on pipes','Cover your mouth with cloth to avoid dust'] },
  { icon:Zap, title:'Power Failure', color:'yellow', items:['Unplug sensitive electronics','Use flashlights, avoid candles','Keep refrigerator closed to preserve food','Stay away from downed power lines'] },
]

function GuideCard({ g, i }) {
  const Icon = g.icon
  return (
    <motion.div
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:.35, delay: Math.min(i*0.05, 0.4) }}
    >
      <Card hover>
        <div className={'w-12 h-12 rounded-xl grid place-items-center mb-3 ' + (CLR[g.color] || CLR.slate)}>
          <Icon size={22}/>
        </div>
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">{g.title}</h3>
        <ul className="space-y-2">
          {g.items.map((it,j)=>(
            <li key={j} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
              <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0"/>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  )
}

export default function Knowledge() {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <BackButton/>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:.3 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 break-words">
            <BookOpen className="text-blue-500"/> {t('knowledge.title', 'First Aid & Safety Guide')}
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">{t('knowledge.subtitle', 'Quick reference for common emergencies')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDES.map((g,i) => <GuideCard key={i} g={g} i={i}/>)}
        </div>
      </div>
    </React.Fragment>
  )
}
