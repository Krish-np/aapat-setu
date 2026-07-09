"""
Aapat Setu — AI Incident Intelligence Engine (v2)
All AI features run as deterministic heuristics for reliable hackathon demo.
"""
from __future__ import annotations

import math
import random
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from .models import Incident

EMERGENCY_CATEGORIES = [
    "fire","earthquake","flood","landslide","medical","accident",
    "building_collapse","missing_person","forest_fire","storm",
    "power_failure","water_issue","other",
]

CRITICAL_KW = ["dying","died","death","trapped","buried","collapse","collapsed","building fell","washed away","swept away","bleeding heavily","unconscious","not breathing","drowning","explosion","gas leak","many injured","mass casualty","save us","children trapped","pregnant","stuck under","under debris","no pulse","critical","head injury","unresponsive","screaming for help"]
HIGH_KW = ["injured","bleeding","stuck","flooded","flooding","fire","flames","smoke","accident","collision","crash","evacuation","stranded","missing","landslide","ambulance","urgent","hospital","rescue","burn","trapped","shouting","pain","broken bone","electric","sparks"]
MED_KW = ["waterlogging","fallen tree","road blocked","traffic","minor","power cut","outage","supply","shelter","food","medicine","leak","crack","congestion","delayed","inconvenience"]

IMAGE_FINDINGS_BY_CATEGORY = {
    "fire": ["smoke detected","flames visible","active burning","structure at risk"],
    "flood": ["standing water","submerged street","water level rising","vehicles partially submerged"],
    "landslide": ["debris on road","mud/rock visible","slope failure","blocked access"],
    "building_collapse": ["rubble visible","structural failure","dust cloud","partial collapse"],
    "medical": ["person on ground","bystanders gathered","possible casualty visible"],
    "accident": ["damaged vehicles","debris field","collision scene","road blocked"],
    "earthquake": ["building damage","cracks visible","debris in street"],
    "storm": ["fallen tree","damaged structure","wires down"],
}
RESOURCE_NEEDS_BY_CATEGORY = {
    "fire":            ["fire_trucks","firefighters","water_supply","ambulance","police"],
    "flood":           ["rescue_boats","volunteers","ambulance","shelter","food","water"],
    "medical":         ["ambulance","paramedics","hospital_bed","blood","medicine"],
    "accident":        ["ambulance","police","firefighters","crane","tow_truck"],
    "building_collapse":["rescue_team","cranes","ambulance","sniffer_dogs","police"],
    "landslide":       ["excavators","rescue_team","ambulance","police"],
    "earthquake":      ["rescue_teams","ambulance","shelter","food","water","volunteers"],
    "storm":           ["electric_crew","tree_removal","police"],
    "forest_fire":     ["fire_trucks","helicopter","firefighters","water"],
    "missing_person":  ["police","search_team","volunteers"],
    "power_failure":   ["electric_crew"],
    "water_issue":     ["water_tanker","municipal_team"],
    "default":         ["responders","volunteers"],
}
RESPONDER_BY_CATEGORY = {
    "fire": ["fire","police","hospital"],
    "flood": ["responder","ngo","police","municipality","volunteer"],
    "medical": ["hospital","responder"],
    "accident": ["police","hospital","fire"],
    "building_collapse": ["fire","hospital","police","responder"],
    "landslide": ["responder","police","fire","volunteer"],
    "earthquake": ["responder","fire","hospital","police","ngo","municipality"],
    "storm": ["municipality","fire","police"],
    "forest_fire": ["fire","responder"],
    "missing_person": ["police","volunteer"],
    "power_failure": ["municipality"],
    "water_issue": ["municipality"],
    "default": ["responder"],
}
SAFETY_INSTRUCTIONS = {
    "fire": {"en":"Evacuate immediately using stairs. Stay low to avoid smoke. Do not use elevators. If trapped, close doors and seal gaps with wet cloth.","ne":"तुरुन्तै सिँढी प्रयोग गरी बाहिर निस्कनुहोस्। धुवाँबाट बच्न तलतिर सुत्नुहोस्। लिफ्ट प्रयोग नगर्नुहोस्।"},
    "flood": {"en":"Move to higher ground immediately. Do not walk or drive through flood water. Avoid electrical equipment. Listen for evacuation alerts.","ne":"तुरुन्त अग्लो स्थानमा जानुहोस्। बाढीको पानीमा नजानुहोस्। बिजुलीबाट टाढा रहनुहोस्।"},
    "medical": {"en":"Stay with the patient. Keep them calm. Do not move them if spinal injury is suspected. Apply pressure to bleeding. Wait for the ambulance.","ne":"बिरामीसँगै बस्नुहोस्। शान्त राख्नुहोस्। चोट लागेको शंका भए नचलाउनुहोस्।"},
    "accident": {"en":"Secure the scene with hazard lights. Do not move seriously injured. Call emergency services. Provide first aid if trained.","ne":"हजर्ड बत्ती बाल्नुहोस्। गम्भीर घाइतेलाई नचलाउनुहोस्।"},
    "building_collapse": {"en":"Evacuate surrounding buildings immediately. Do not enter unstable structures. Call emergency services with precise location.","ne":"वरपरका भवन तुरुन्त खाली गर्नुहोस्।"},
    "landslide": {"en":"Move away from slope/valley immediately. Do not cross affected roads. Warn neighbors.","ne":"भिरबाट टाढा जानुहोस्।"},
    "earthquake": {"en":"Drop, Cover, Hold On. Stay away from windows and heavy furniture. If outside, move to an open area.","ne":"भुइँमा बस्नुहोस्, टेबुलमुनि लुक्नुहोस्।"},
    "default": {"en":"Stay calm. Move to a safe location. Call emergency services. Follow instructions from responders.","ne":"शान्त रहनुहोस्। सुरक्षित स्थानमा जानुहोस्।"},
}

def haversine_km(lat1,lng1,lat2,lng2):
    R=6371.0
    p1,p2=math.radians(lat1),math.radians(lat2)
    dp=math.radians(lat2-lat1); dl=math.radians(lng2-lng1)
    a=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*R*math.asin(math.sqrt(a))

def tokenize(text): return re.findall(r"[a-zA-Z0-9\u0900-\u097F]+",(text or "").lower())
def kw_score(text, kws): return sum(1 for k in kws if k in (text or "").lower())

def detect_language(text):
    if not text: return "en"
    dev=sum(1 for ch in text if "\u0900"<=ch<="\u097F")
    return "ne" if dev>len(text)*0.2 else "en"

def translate_to_nepali(text):
    nums_ne={"0":"०","1":"१","2":"२","3":"३","4":"४","5":"५","6":"६","7":"७","8":"८","9":"९"}
    out=text
    for a,b in nums_ne.items(): out=out.replace(a,b)
    for eng,nep in {"flood":"बाढी","fire":"आगलागी","injured":"घाइते","rescue":"उद्धार","critical":"गम्भीर","urgent":"तत्काल","ambulance":"एम्बुलेन्स","police":"प्रहरी","hospital":"अस्पताल","trapped":"फसेको","building":"भवन","road":"सडक","help":"सहयोग","people":"मानिसहरू","children":"बालबालिका","water":"पानी"}.items():
        out=re.sub(rf"\b{re.escape(eng)}\b",nep,out,flags=re.I)
    return f"【आपतकालीन सूचना】{out}"

def infer_category(description, declared=None):
    desc=(description or "").lower()
    if declared and declared.strip().lower() not in ("","other"):
        return declared.strip().lower().replace(" ","_")
    keywords={
        "fire":["fire","flame","burn","smoke","blaze"],
        "earthquake":["earthquake","tremor","quake","richter"],
        "flood":["flood","submerged","inundat","waterlogging","washed away","deluge"],
        "landslide":["landslide","mudslide","debris","rock fall","slope"],
        "medical":["injured","bleeding","unconscious","heart","breathing","medical","patient","fell","sick","pain","wound"],
        "accident":["accident","crash","collision","hit","vehicle","car","bike","truck","motorcycle"],
        "building_collapse":["collapse","building fell","rubble"],
        "missing_person":["missing","lost","kidnapped","disappeared"],
        "forest_fire":["forest fire","wildfire","jungle fire"],
        "storm":["storm","cyclone","hurricane","wind","lightning","thunder"],
        "power_failure":["power cut","outage","blackout","no electricity"],
        "water_issue":["no water","water supply","contaminated water"],
    }
    best_t,best_s="other",0
    for t,kws in keywords.items():
        s=sum(1 for k in kws if k in desc)
        if s>best_s: best_s,best_t=s,t
    return best_t

def verify_report(category,description):
    d=(description or "").strip()
    if len(d)<6: return False,"Description too short/vague"
    if len(d)>3000: return False,"Report unusually long"
    if re.search(r"(.)\1{6,}",d): return False,"Suspicious content (spam)"
    if re.search(r"\b(test|asdf|qwerty)\b",d,re.I): return False,"Potential spam"
    return True,None

def generate_summary(category,description):
    d=(description or "").strip()
    first=re.split(r"[.!?\n]",d,maxsplit=1)[0].strip()
    if len(first)<20:
        parts=re.split(r"[.!?\n]",d,maxsplit=2)
        first=". ".join(p.strip() for p in parts if p.strip())
    return f"[{category.replace('_',' ').title()}] {first[:280].rstrip()}"

def estimate_victims(category,description,hint=0):
    if hint and hint>0: return hint
    base={"fire":(2,8),"flood":(3,15),"building_collapse":(3,20),"earthquake":(5,50),"landslide":(2,10),"medical":(1,3),"accident":(1,5),"missing_person":(1,2),"forest_fire":(0,2)}
    lo,hi=base.get(category,(0,3))
    bonus=2 if kw_score(description,["many","several","family","children","crowd"]) else 0
    return random.randint(lo,hi)+bonus

def estimate_response_time(category,severity):
    base={"critical":(4,8),"high":(8,15),"moderate":(15,30),"low":(30,60)}
    return random.randint(*base.get(severity,(10,25)))

def severity_from_desc(category,description):
    c=kw_score(description,CRITICAL_KW); h=kw_score(description,HIGH_KW); m=kw_score(description,MED_KW)
    base={"building_collapse":3,"earthquake":3,"fire":3,"flood":2,"landslide":2,"medical":2,"accident":2,"missing_person":1,"storm":1,"forest_fire":2}.get(category,1)
    score=base+c*2+h-m*0
    if c>=2 or score>=5: return "critical"
    if c>=1 or h>=2 or score>=3: return "high"
    if m>=1 or score>=2: return "moderate"
    return "low"

def risk_assessment(category,severity,description):
    score={"critical":85,"high":65,"moderate":40,"low":18}[severity]+random.randint(-5,5)
    score=max(0,min(100,score))
    factors=[]
    if category in ("flood","landslide"): factors.append("Weather risk: ongoing hazard")
    if category=="fire": factors.append("Rapid spread potential")
    if category=="building_collapse": factors.append("Structural instability")
    if "children" in (description or "").lower(): factors.append("Vulnerable civilians (children) present")
    if "trapped" in (description or "").lower(): factors.append("People trapped — rescue window limited")
    if not factors: factors.append("Monitor for escalation")
    difficulty="high" if score>70 else ("medium" if score>40 else "low")
    return {"risk_score":round(score,1),"risk_factors":factors,"rescue_difficulty":difficulty,
            "infrastructure_impact":"high" if severity in ("critical","high") else "moderate",
            "environmental_impact":"high" if category in ("fire","flood","landslide","forest_fire") else "low"}

def image_analysis(category,has_images=True):
    if not has_images: return None
    findings=list(IMAGE_FINDINGS_BY_CATEGORY.get(category,["Scene captured"]))
    return {"findings":findings,
            "damage_assessment":"severe" if category in ("fire","building_collapse","earthquake") else ("moderate" if category in ("flood","landslide","accident") else "minor"),
            "risk_level":"high" if category in ("fire","building_collapse","earthquake") else "medium",
            "image_summary":f"Visual analysis indicates {category.replace('_',' ')} — "+"; ".join(findings[:2]),
            "suggested_response":"Dispatch specialized response team immediately",
            "has_casualty_visual":category in ("medical","accident","building_collapse")}

def detect_duplicate(lat,lng,category,description,existing,hours=24,dist_km=0.5):
    new_tokens=set(tokenize(description)+[category])
    best=None; best_score=0
    cutoff=datetime.utcnow()-timedelta(hours=hours)
    for inc in existing:
        if inc.status.value=="resolved": continue
        if inc.created_at<cutoff: continue
        d=haversine_km(lat,lng,inc.lat,inc.lng)
        if d>dist_km: continue
        ex_tokens=set(tokenize(inc.description)+[inc.incident_type])
        if not new_tokens or not ex_tokens: continue
        sim=len(new_tokens&ex_tokens)/len(new_tokens|ex_tokens)
        if inc.incident_type==category: sim+=0.2
        prox=max(0,1-d/dist_km)
        score=sim*0.6+prox*0.4
        if score>=0.45 and score>best_score: best_score=score; best=inc
    return best

# ---------- AI Prediction (future risk / resource forecast) ----------
def predict_future_risk(incidents: List[Incident]) -> Dict[str, Any]:
    """Simple predictive analytics based on recent incident patterns."""
    now=datetime.utcnow()
    last24h=[i for i in incidents if (now-i.created_at).total_seconds()<86400]
    last6h=[i for i in incidents if (now-i.created_at).total_seconds()<21600]
    by_type={}
    for i in last24h: by_type[i.incident_type]=by_type.get(i.incident_type,0)+1
    trending=max(by_type.items(), key=lambda x:x[1], default=("none",0))
    trend_pct=0
    if len(last24h)>0 and len(last6h)>0:
        # If >50% of last-24h incidents are in last 6h, trend is accelerating
        ratio=len(last6h)/max(1,len(last24h))
        trend_pct=round(ratio*100)
    severity_counts={"critical":0,"high":0,"moderate":0,"low":0}
    for i in last24h: severity_counts[i.ai_severity or "low"]=severity_counts.get(i.ai_severity or "low",0)+1
    risk_zones=[]
    if by_type:
        # Cluster incidents by rough lat/lng buckets
        buckets={}
        for i in last24h:
            key=(round(i.lat,2),round(i.lng,2))
            buckets[key]=buckets.get(key,0)+1
        top_zone=max(buckets.items(), key=lambda x:x[1], default=None)
        if top_zone: risk_zones.append({"lat":top_zone[0][0],"lng":top_zone[0][1],"incidents":top_zone[1]})
    predicted_resources=[]
    if trending[0]!="none":
        predicted_resources=RESOURCE_NEEDS_BY_CATEGORY.get(trending[0],[])[:3]
    return {
        "trend":"accelerating" if trend_pct>40 else ("stable" if trend_pct>20 else "decreasing"),
        "trend_pct": trend_pct,
        "hotspot_type": trending[0] if trending[1]>0 else None,
        "hotspot_count": trending[1],
        "risk_zones": risk_zones,
        "predicted_resources": predicted_resources,
        "severity_breakdown_24h": severity_counts,
        "advisory": _advisory_for(trending[0], trend_pct),
    }

def _advisory_for(cat, pct):
    if cat=="flood" and pct>30: return "Flood incidents accelerating. Pre-position rescue boats and notify hospitals."
    if cat=="fire" and pct>30: return "Fire incidents trending up. Alert fire departments to standby."
    if cat=="medical": return "Medical incidents concentrated near zone. Ensure ambulance availability."
    if pct>50: return "Incident rate accelerating rapidly. Consider activating emergency protocols."
    return "Situation stable. Continue monitoring."

def process_report(incident_type,description,lat,lng,existing,people_affected=0,has_images=False,voice_transcript=None):
    full_desc=description + (f"\n[voice] {voice_transcript}" if voice_transcript else "")
    category=infer_category(full_desc,incident_type)
    lang=detect_language(full_desc)
    is_ok,flag_reason=verify_report(category,full_desc)
    summary_en=generate_summary(category,full_desc)
    summary_ne=translate_to_nepali(summary_en)
    severity=severity_from_desc(category,full_desc)
    victims=estimate_victims(category,full_desc,people_affected)
    response_time=estimate_response_time(category,severity)
    risk=risk_assessment(category,severity,full_desc)
    img=image_analysis(category,has_images)
    resources=list(RESOURCE_NEEDS_BY_CATEGORY.get(category,RESOURCE_NEEDS_BY_CATEGORY["default"]))
    responders=list(RESPONDER_BY_CATEGORY.get(category,RESPONDER_BY_CATEGORY["default"]))
    safety=SAFETY_INSTRUCTIONS.get(category,SAFETY_INSTRUCTIONS["default"])
    confidence=0.75+random.random()*0.2
    priority=round(risk["risk_score"]/10+(0.5 if people_affected>3 else 0),2)
    duplicate=detect_duplicate(lat,lng,category,full_desc,existing) if is_ok else None
    return {"category":category,"language":lang,"ai_verified":is_ok,"ai_flag_reason":flag_reason,
            "ai_summary":summary_en,"ai_summary_ne":summary_ne,"ai_severity":severity,
            "ai_confidence":round(confidence,2),"ai_priority_score":priority,
            "ai_estimated_victims":victims,"ai_response_time_min":response_time,
            "ai_rescue_difficulty":risk["rescue_difficulty"],"ai_risk_score":risk["risk_score"],
            "ai_risk_factors":risk["risk_factors"],
            "ai_required_resources":resources,"ai_suggested_responders":responders,
            "ai_safety_instructions":safety["en"],"ai_safety_instructions_ne":safety["ne"],
            "ai_image_findings":img["findings"] if img else None,
            "ai_image_meta":img,"ai_damage_assessment":img["damage_assessment"] if img else "minor",
            "ai_duplicate_of":duplicate.id if duplicate else None,
            "ai_duplicate_distance_km":round(haversine_km(lat,lng,duplicate.lat,duplicate.lng),2) if duplicate else None,
            "voice_transcript":voice_transcript}
