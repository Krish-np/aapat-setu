import React from 'react'
import { Card } from '../components/ui'
import BackButton from '../components/BackButton'
import { BookOpen, AlertTriangle, Heart, Flame, Waves, Mountain, Building2, Car, Zap } from 'lucide-react'

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

export default function Knowledge() {
  return (
    <div className="max-w<BackButton/>
    -6xl mx-auto p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><BookOpen className="text-blue-500"/> Emergency Safety Guide</h1>
        <p className="text-ink-500 text-sm mt-1">Quick reference for common emergencies</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GUIDES.map((g,i)=>(
          <Card key={i}>
            <div className={`w-12 h-12 rounded-xl bg-${g.color}-100 dark:bg-${g.color}-500/15 text-${g.color}-600 dark:text-${g.color}-400 grid place-items-center mb-3`}>
              <g.icon size={22}/>
            </div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">{g.title}</h3>
            <ul className="space-y-2">
              {g.items.map((it,j)=>(
                <li key={j} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0"/>
                  {it}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="!bg-gradient-to-r from-red-50 to-amber-50 dark:!from-red-500/10 dark:!to-amber-500/10 !border-red-200 dark:!border-red-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-500 flex-shrink-0 mt-1"/>
          <div>
            <h3 className="font-bold text-red-700 dark:text-red-400">Emergency Numbers (Nepal)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-sm">
              <div><b>Police:</b> 100</div>
              <div><b>Fire:</b> 101</div>
              <div><b>Ambulance:</b> 102</div>
              <div><b>Disaster:</b> 1149</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
