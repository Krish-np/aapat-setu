import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/ui'
import PageHeader from '../components/PageHeader'
import { useTranslation } from 'react-i18next'
import { BookOpen, AlertTriangle, Heart, Flame, Waves, Mountain, Building2, Car, Zap } from 'lucide-react'

const CLR = {
  red:'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  blue:'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  orange:'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  amber:'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  pink:'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400',
  slate:'bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-300',
  yellow:'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
}

const GUIDES = [
  { icon:Flame, title:'Fire Safety', color:'red', items:['Evacuate immediately using stairs, not elevators','Stay low to avoid smoke inhalation','Close doors behind you to slow spread','Call 101 once you are safe']},
  { icon:Waves, title:'Flood Safety', color:'blue', items:['Move to higher ground immediately','Do not walk or drive through flood water','Avoid contact with electrical equipment','Listen to official evacuation orders']},
  { icon:Mountain, title:'Earthquake', color:'orange', items:['Drop, Cover, and Hold On','Stay away from windows and heavy furniture','If outdoors, move to open space away from buildings','After shaking stops, evacuate carefully']},
  { icon:Mountain, title:'Landslide', color:'amber', items:['Move away from the slope immediately','Listen for unusual sounds (trees cracking, boulders)','Avoid river valleys and steep slopes during heavy rain','Warn neighbors and alert authorities']},
  { icon:Heart, title:'First Aid (Medical)', color:'pink', items:['Call for ambulance immediately','Keep the person calm and still','Apply firm pressure to bleeding','Do not move someone with suspected spinal injury']},
  { icon:Car, title:'Road Accident', color:'slate', items:['Turn on hazard lights to warn others','Do not move seriously injured people','Call police (100) and ambulance (102)','Provide first aid only if trained']},
  { icon:Building2, title:'Building Collapse', color:'slate', items:['Evacuate surrounding buildings immediately','Do not enter unstable structures','If trapped, conserve phone battery; tap on pipes','Cover your mouth with cloth to avoid dust']},
  { icon:Zap, title:'Power Failure', color:'yellow', items:['Unplug sensitive electronics','Use flashlights, avoid candles','Keep refrigerator closed to preserve food','Stay away from downed power lines']},
]

export default function Knowledge() {
  const { t } = useTranslation()
  return (
    <div>
      <PageHeader icon={BookOpen} iconColor="text-blue-500"
        title={t('knowledge.title','First Aid & Safety Guide')}
        subtitle={t('knowledge.subtitle','Quick reference for common emergencies')}/>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GUIDES.map((g,i)=>{
          const Icon = g.icon
          return (
            <motion.div key={i}
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              transition={{duration:.35, delay:Math.min(i*0.05,0.4)}}>
              <Card hover className="!p-5 h-full">
                <div className={'w-11 h-11 rounded-lg grid place-items-center mb-3 '+CLR[g.color]}>
                  <Icon size={20}/>
                </div>
                <h3 className="font-semibold text-[15px] mb-3 text-ink-900 dark:text-white">{g.title}</h3>
                <ul className="space-y-2">
                  {g.items.map((it,j)=>(
                    <li key={j} className="flex items-start gap-2 text-[13px] text-ink-600 dark:text-ink-300 leading-relaxed">
                      <AlertTriangle size={13} className="text-amber-500 mt-1 flex-shrink-0"/>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
