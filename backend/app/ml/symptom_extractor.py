"""
Enhanced Rule-based symptom extraction and emergency safety layer.
Features a comprehensive synonym mapping and lemmatization dictionary
to handle colloquial patient descriptions with high precision.
"""
import json
import re
from pathlib import Path
from .preprocess import clean_text

DATA_DIR = Path(__file__).parent / "data"

try:
    with open(DATA_DIR / "disease_info.json", encoding="utf-8") as f:
        DISEASE_INFO = json.load(f)
except Exception:
    DISEASE_INFO = {}

# Build de-duplicated symptom list sorted by phrase length (longest first)
ALL_SYMPTOMS = sorted(
    {s for info in DISEASE_INFO.values() for s in info.get("symptoms", [])},
    key=lambda s: -len(s),
)

# Rich colloquial & medical synonym dictionary -> canonical symptom phrase
SYNONYMS = {
    # Nausea / Vomiting
    "nauseous": "nausea",
    "nauseated": "nausea",
    "feeling nauseous": "nausea",
    "feel like throwing up": "nausea",
    "feel like vomiting": "nausea",
    "queasy": "nausea",
    "queasiness": "nausea",
    "sick to stomach": "nausea",
    "throwing up": "vomiting",
    "throw up": "vomiting",
    "threw up": "vomiting",
    "puking": "vomiting",
    "puked": "vomiting",
    "vomited": "vomiting",
    "emesis": "vomiting",

    # Fever / Temperature
    "fever": "high fever",
    "feverish": "high fever",
    "high fever": "high fever",
    "high temp": "high fever",
    "high temperature": "high fever",
    "temperature": "fever",
    "running a temperature": "high fever",
    "running a fever": "high fever",
    "chills": "chills",
    "shivering": "shivering chills",
    "sweating": "sweating",
    "night sweats": "profuse sweating",

    # Headache / Head pain
    "headache": "headache",
    "head ache": "headache",
    "head is hurting": "headache",
    "head hurts": "headache",
    "pain in head": "headache",
    "pounding head": "severe headache",
    "throbbing head": "throbbing pain",
    "throbbing headache": "throbbing pain",
    "severe headache": "severe headache",
    "migraine": "severe headache",
    "eye pain": "pain behind eyes",
    "pain behind my eyes": "pain behind eyes",

    # Stomach / Digestion
    "stomach pain": "abdominal pain",
    "stomach ache": "abdominal pain",
    "stomach cramps": "abdominal cramps",
    "tummy ache": "abdominal pain",
    "tummy pain": "abdominal pain",
    "belly pain": "abdominal pain",
    "belly ache": "abdominal pain",
    "abdominal pain": "abdominal pain",
    "lower right abdominal pain": "sharp lower right abdominal pain",
    "pain near navel": "pain near navel",
    "heartburn": "heartburn",
    "acid reflux": "acid regurgitation",
    "acidity": "heartburn",
    "sour taste": "sour taste in mouth",
    "indigestion": "indigestion",
    "bloating": "bloating",
    "bloated": "bloating",
    "gassy": "gas",
    "flatulence": "gas",
    "loose motions": "diarrhea",
    "loose stools": "watery diarrhea",
    "diarrhea": "diarrhea",
    "diarrhoea": "diarrhea",
    "constipated": "constipation",
    "constipation": "constipation",
    "burning stomach": "burning stomach",

    # Respiratory / Cold / Throat
    "cough": "mild cough",
    "coughing": "persistent cough",
    "dry cough": "dry cough",
    "wet cough": "cough with phlegm",
    "cough with mucus": "cough with phlegm",
    "phlegm": "mucus production",
    "sore throat": "sore throat",
    "throat pain": "sore throat",
    "throat is sore": "sore throat",
    "scratchy throat": "scratchy throat",
    "pain swallowing": "pain swallowing",
    "painful swallowing": "difficulty swallowing",
    "difficulty swallowing": "difficulty swallowing",
    "runny nose": "runny nose",
    "running nose": "runny nose",
    "sneezing": "sneezing",
    "sneeze": "sneezing",
    "blocked nose": "nasal congestion",
    "stuffy nose": "nasal congestion",
    "congested nose": "nasal congestion",
    "congestion": "nasal congestion",
    "sinus pressure": "pressure around eyes",
    "loss of smell": "loss of smell",
    "can't smell": "loss of smell",
    "lost smell": "loss of smell",
    "loss of taste": "loss of taste",
    "can't taste": "loss of taste",
    "lost taste": "loss of taste",
    "short of breath": "shortness of breath",
    "shortness of breath": "shortness of breath",
    "breathless": "shortness of breath",
    "breathlessness": "shortness of breath",
    "out of breath": "shortness of breath",
    "trouble breathing": "difficulty breathing",
    "cant breathe": "difficulty breathing",
    "can't breathe": "difficulty breathing",
    "difficulty breathing": "difficulty breathing",
    "wheezing": "wheezing",
    "chest tightness": "chest tightness",
    "tight chest": "chest tightness",

    # Pain / Muscles / Joints
    "body pain": "body ache",
    "body ache": "body ache",
    "aching body": "body ache",
    "body aches": "body ache",
    "muscle pain": "muscle pain",
    "muscle ache": "muscle aches",
    "aching muscles": "muscle pain",
    "joint pain": "joint pain",
    "joints hurt": "joint pain",
    "aching joints": "joint pain",
    "swollen joints": "joint swelling",
    "joint swelling": "joint swelling",
    "stiff joints": "joint stiffness",
    "morning stiffness": "morning joint stiffness",
    "neck stiffness": "neck stiffness",
    "stiff neck": "neck stiffness",
    "neck pain": "neck pain",
    "back pain": "lower back ache",
    "back ache": "lower back ache",
    "lower back pain": "lower back ache",
    "big toe pain": "intense big toe pain",

    # Energy / Fatigue / Sleep
    "tired": "fatigue",
    "tiredness": "fatigue",
    "fatigue": "fatigue",
    "exhausted": "fatigue",
    "exhaustion": "fatigue",
    "weak": "weakness",
    "weakness": "weakness",
    "low energy": "fatigue",
    "lethargic": "fatigue",
    "drowsy": "fatigue",
    "can't sleep": "difficulty falling asleep",
    "cant sleep": "difficulty falling asleep",
    "trouble sleeping": "difficulty falling asleep",
    "insomnia": "difficulty falling asleep",
    "waking up in night": "frequent night waking",

    # Skin / Eyes / Allergies
    "itching": "itching",
    "itchy": "itching",
    "itchy skin": "dry itchy skin",
    "rash": "skin rash",
    "skin rash": "skin rash",
    "red spots": "skin rash",
    "hives": "raised itchy welts",
    "redness": "skin redness",
    "red eyes": "red eyes",
    "pink eye": "red eyes",
    "watery eyes": "watery eyes",
    "itchy eyes": "eye itching",

    # Urinary / Metabolic
    "burning pee": "burning urination",
    "burning urination": "burning urination",
    "painful urination": "burning urination",
    "peeing a lot": "frequent urination",
    "frequent urination": "frequent urination",
    "urinating frequently": "frequent urination",
    "excessive thirst": "excessive thirst",
    "always thirsty": "excessive thirst",
    "weight loss": "unexplained weight loss",
    "losing weight": "unexplained weight loss",
    "weight gain": "unexplained weight gain",
    "lost appetite": "loss of appetite",
    "no appetite": "loss of appetite",
    "loss of appetite": "loss of appetite",
    "dizzy": "dizziness",
    "dizziness": "dizziness",
    "lightheaded": "dizziness",
    "spinning": "spinning sensation",
}

EMERGENCY_PATTERNS = [
    r"\bdifficulty breathing\b", r"\bcan'?t breathe\b", r"\btrouble breathing\b",
    r"\bsevere chest pain\b", r"\bchest pressure\b", r"\bheart attack\b",
    r"\bcoughing (up )?blood\b", r"\bvomiting blood\b", r"\bblack (tarry )?stool\b",
    r"\bunconscious\b", r"\bfainted\b", r"\bfainting\b", r"\bsevere bleeding\b",
    r"\bblue lips\b", r"\bbluish lips\b", r"\bseizure\b", r"\bconvuls",
    r"\bsevere abdominal pain\b", r"\bsharp lower right abdominal pain\b",
    r"\bparalysis\b", r"\bslurred speech\b", r"\bface drooping\b",
    r"\bsevere allergic reaction\b", r"\banaphylaxis\b", r"\bswelling of (the )?(throat|tongue)\b",
]

EMERGENCY_MESSAGE = (
    "The symptoms described may indicate a medical emergency requiring immediate attention. "
    "Please call emergency medical services or go to the nearest emergency room immediately."
)


def extract_symptoms(raw_text: str) -> list[str]:
    clean = clean_text(raw_text).lower()
    text = f" {clean} "
    found = []

    # 1. Match specific multi-word / colloquial phrases from SYNONYMS first (longest phrases first)
    sorted_synonyms = sorted(SYNONYMS.items(), key=lambda x: -len(x[0]))
    for phrase, canonical in sorted_synonyms:
        pattern = r"\b" + re.escape(phrase) + r"\b"
        if re.search(pattern, text):
            if canonical not in found:
                found.append(canonical)

    # 2. Match exact known canonical symptoms from database
    for symptom in ALL_SYMPTOMS:
        pattern = r"\b" + re.escape(clean_text(symptom).lower()) + r"\b"
        if re.search(pattern, text) and symptom not in found:
            found.append(symptom)

    return found


def check_emergency(raw_text: str) -> str | None:
    text = raw_text.lower()
    for pattern in EMERGENCY_PATTERNS:
        if re.search(pattern, text):
            return EMERGENCY_MESSAGE
    return None
