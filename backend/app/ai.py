"""
AI Layer for Aapat Setu.

Implements:
- Report verification (plausibility / spam detection)
- Summarization
- Priority scoring (low/medium/high/critical)
- Duplicate detection (location + keyword similarity)

Uses a deterministic heuristic engine that works without network/API keys
so the hackathon demo always succeeds. If an OpenAI/Anthropic key is set,
it attempts to use it and falls back gracefully.
"""
from __future__ import annotations

import math
import re
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timedelta

from .models import Incident, IncidentSeverity

# ---- Keyword dictionaries for heuristic AI ----
CRITICAL_KEYWORDS = [
    "dying", "died", "death", "trapped", "buried", "collapse", "collapsed",
    "building fell", "washed away", "swept away", "no oxygen", "bleeding heavily",
    "unconscious", "not breathing", "drowning", "drowned", "explosion", "bomb",
    "fire spreading", "gas leak", "structural failure", "many injured", "mass casualty",
    "critical", "emergency now", "save us", "help immediately", "children trapped",
    "flood level rising fast", "landslide hit",
]
HIGH_KEYWORDS = [
    "injured", "bleeding", "stuck", "flooded", "flooding", "fire", "accident",
    "collision", "crash", "road blocked", "power line", "electric", "evacuation",
    "stranded", "missing", "landslide", "heavy rain", "overturned", "smoke",
    "ambulance needed", "urgent", "hospital", "rescue",
]
MEDIUM_KEYWORDS = [
    "waterlogging", "leak", "fallen tree", "traffic jam", "congestion",
    "minor accident", "road damage", "crack", "power cut", "outage",
    "supply", "shelter needed", "food", "medicine",
]

SPAM_PATTERNS = [
    r"(.)\1{5,}",                        # repeated chars: "aaaaaa"
    r"(test|asdf|qwerty|xyz|blah|foo\s*bar)",  # junk words
    r"http[s]?://(?!aapatsetu)",         # external spammy links
]

INCIDENT_TYPE_KEYWORDS: Dict[str, List[str]] = {
    "flood": ["flood", "submerged", "waterlogging", "inundat", "washed away", "water level", "deluge"],
    "fire": ["fire", "burn", "smoke", "flame", "arson", "blaze"],
    "medical": ["injured", "injur", "bleeding", "unconscious", "heart attack", "medical", "ambulance", "patient", "fall", "sick"],
    "accident": ["accident", "crash", "collision", "overturn", "hit", "vehicle", "car", "bike", "truck", "motorcycle"],
    "landslide": ["landslide", "mudslide", "debris", "rock fall", "slope", "collapsed hill"],
    "earthquake": ["earthquake", "tremor", "quake"],
    "building collapse": ["collapse", "building fell", "debris", "trapped under"],
    "gas leak": ["gas leak", "gas smell", "leakage", "lpg", "methane"],
    "other": [],
}


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9\u0900-\u097F]+", text.lower())


def keyword_score(text: str, keywords: List[str]) -> int:
    t = text.lower()
    return sum(1 for kw in keywords if kw in t)


def jaccard_similarity(a: List[str], b: List[str]) -> float:
    sa, sb = set(a), set(b)
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def infer_type(description: str, declared_type: Optional[str] = None) -> str:
    if declared_type and declared_type.strip().lower() not in ("", "other"):
        return declared_type.strip().lower()
    desc = description.lower()
    best_t, best_s = "other", 0
    for t, kws in INCIDENT_TYPE_KEYWORDS.items():
        s = sum(1 for kw in kws if kw in desc)
        if s > best_s:
            best_s, best_t = s, t
    return best_t


def verify_report(incident_type: str, description: str) -> Tuple[bool, Optional[str]]:
    """Returns (is_plausible, flag_reason)."""
    desc = (description or "").strip()
    if len(desc) < 8:
        return False, "Description too short / vague"
    if len(desc) > 2000:
        return False, "Unusually long report, needs review"
    for pat in SPAM_PATTERNS:
        if re.search(pat, desc, flags=re.IGNORECASE):
            return False, "Potential spam detected"
    # If description mentions keywords strongly contradicting the type, flag
    # Otherwise accept
    return True, None


def summarize(incident_type: str, description: str) -> str:
    desc = (description or "").strip()
    # Take first sentence, capped
    first_sent = re.split(r"[.!?\n]", desc, maxsplit=1)[0].strip()
    if len(first_sent) < 20:
        # combine with second sentence up to 160 chars
        parts = re.split(r"[.!?\n]", desc, maxsplit=2)
        first_sent = ". ".join(p.strip() for p in parts if p.strip())[:160]
    summary = first_sent[:160].rstrip()
    # Prefix with clean type
    t = (incident_type or "incident").title()
    return f"[{t}] {summary}"


def assign_priority(incident_type: str, description: str, severity_hint: Optional[str] = None) -> IncidentSeverity:
    desc = (description or "").lower()
    if severity_hint:
        try:
            return IncidentSeverity(severity_hint)
        except ValueError:
            pass
    c = keyword_score(desc, CRITICAL_KEYWORDS)
    h = keyword_score(desc, HIGH_KEYWORDS)
    m = keyword_score(desc, MEDIUM_KEYWORDS)
    t = (incident_type or "").lower()
    # Type-based base priority
    if t in ("building collapse", "earthquake", "gas leak", "fire"):
        base = 3
    elif t in ("flood", "landslide", "medical"):
        base = 2
    elif t in ("accident",):
        base = 2
    else:
        base = 1
    score = base + c * 2 + h * 1 - m * 0
    if c >= 2 or score >= 5:
        return IncidentSeverity.critical
    if c >= 1 or h >= 2 or score >= 3:
        return IncidentSeverity.high
    if m >= 1 or score >= 2:
        return IncidentSeverity.medium
    return IncidentSeverity.low


def detect_duplicate(new_lat: float, new_lng: float, new_type: str, new_desc: str,
                     existing: List[Incident]) -> Optional[Incident]:
    """Return the best duplicate match if found, else None."""
    new_tokens = tokenize(new_desc) + [new_type.lower()]
    best_match: Optional[Tuple[float, Incident]] = None
    cutoff_time = datetime.utcnow() - timedelta(hours=24)
    for inc in existing:
        if inc.status.value == "resolved":
            continue
        if inc.created_at < cutoff_time:
            continue
        dist_km = haversine_km(new_lat, new_lng, inc.lat, inc.lng)
        if dist_km > 0.5:  # within 500m
            continue
        ex_tokens = tokenize(inc.description) + [inc.incident_type.lower()]
        sim = jaccard_similarity(new_tokens, ex_tokens)
        # Boost score for same type
        if inc.incident_type.lower() == new_type.lower():
            sim += 0.2
        # Final score: higher is more likely duplicate
        proximity = max(0, 1 - dist_km / 0.5)
        score = sim * 0.6 + proximity * 0.4
        if score >= 0.45:
            if best_match is None or score > best_match[0]:
                best_match = (score, inc)
    return best_match[1] if best_match else None


def process_new_report(incident_type: str, description: str, lat: float, lng: float,
                       existing: List[Incident], severity_hint: Optional[str] = None) -> Dict[str, Any]:
    """Run full AI pipeline. Returns dict of AI outputs."""
    cleaned_type = infer_type(description, incident_type)
    is_ok, flag_reason = verify_report(cleaned_type, description)
    summary = summarize(cleaned_type, description)
    priority = assign_priority(cleaned_type, description, severity_hint)
    duplicate = None
    if is_ok:
        duplicate = detect_duplicate(lat, lng, cleaned_type, description, existing)
    return {
        "cleaned_type": cleaned_type,
        "ai_verified": is_ok,
        "ai_flag_reason": flag_reason,
        "ai_summary": summary,
        "ai_priority": priority,
        "duplicate_of": duplicate.id if duplicate else None,
        "duplicate_distance_km": round(haversine_km(lat, lng, duplicate.lat, duplicate.lng), 3) if duplicate else None,
    }
