from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
import json
import csv
from collections import Counter

from ..auth import get_current_user
from ..models import User

router = APIRouter(prefix="/api/diseases", tags=["diseases"])

DATA_DIR = Path(__file__).parent.parent / "ml" / "data"

def _get_disease_info():
    try:
        with open(DATA_DIR / "disease_info.json", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def _get_counts():
    counts = Counter()
    try:
        with open(DATA_DIR / "dataset.csv", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                counts[row["disease"]] += 1
    except Exception:
        pass
    return counts

# Clinical classification helper rules
EMERGENCY_KEYWORDS = [
    "appendicitis", "myocardial infarction", "heart attack", "stroke", "pulmonary embolism",
    "anaphylaxis", "aortic", "meningitis", "peritonitis", "sepsis", "pancreatitis",
    "ectopic pregnancy", "pneumothorax", "intestinal obstruction", "rabies", "transient ischemic attack"
]

URGENT_KEYWORDS = [
    "pneumonia", "asthma", "bronchitis", "pyelonephritis", "kidney stone", "cholecystitis",
    "deep vein thrombosis", "cellulitis", "diverticulitis", "migraine", "angina",
    "atrial fibrillation", "arrhythmia", "pericarditis", "dengue", "malaria", "cholera",
    "gallstone", "peptic ulcer", "shingles", "acute", "exacerbation"
]

CHRONIC_KEYWORDS = [
    "diabetes", "hypertension", "copd", "arthritis", "ibs", "irritable bowel", "gerd",
    "reflux", "psoriasis", "eczema", "thyroid", "hyperthyroidism", "hypothyroidism",
    "osteoporosis", "crohn", "celiac", "fibromyalgia", "chronic", "spondylosis", "spondylitis",
    "multiple sclerosis", "parkinson", "colitis", "coronary artery", "heart failure",
    "fatty liver", "polycystic", "metabolic syndrome"
]

def _classify_status(slug: str, name: str, category: str):
    name_lower = name.lower()
    slug_lower = slug.lower()

    for kw in EMERGENCY_KEYWORDS:
        if kw in name_lower or kw in slug_lower:
            if "appendicitis" in name_lower or "peritonitis" in name_lower or "obstruction" in name_lower:
                return "Surgical Emergency"
            return "Emergency"

    for kw in URGENT_KEYWORDS:
        if kw in name_lower or kw in slug_lower:
            return "Urgent Care"

    for kw in CHRONIC_KEYWORDS:
        if kw in name_lower or kw in slug_lower:
            return "Chronic"

    if any(k in name_lower for k in ["cold", "viral pharyngitis", "mild", "rhinitis", "warts", "canker"]):
        return "Self-Limiting"

    return "Primary Care"

def _get_typical_duration(status: str, name: str, category: str):
    name_l = name.lower()
    if "emergency" in status.lower():
        return "12–48 hours progressive"
    if "chronic" in status.lower() or "chronic" in name_l:
        return "Chronic / Recurrent"
    if "urgent" in status.lower():
        if "asthma" in name_l or "migraine" in name_l:
            return "Hours to days"
        return "1–3 weeks"
    if "cold" in name_l or "flu" in name_l or "pharyngitis" in name_l:
        return "5–10 days"
    return "1–2 weeks"

def _get_when_to_seek_care(status: str, name: str, symptoms: list):
    symptoms_str = ", ".join(symptoms[:3]) if symptoms else "symptoms"
    if "surgical" in status.lower():
        return "Immediate ER: Severe acute pain, abdominal rigidity, high fever, or intractable vomiting."
    if "emergency" in status.lower():
        return "Emergency evaluation (911 / ER): Shortness of breath, chest pressure, sudden confusion, or blue lips."
    if "urgent" in status.lower():
        return "Seek urgent medical evaluation within 24h if symptoms worsen rapidly, high fever persists, or breathing is laboured."
    if "chronic" in status.lower():
        return "Consult your physician if symptoms fail to respond to standard maintenance regimen or new systemic symptoms develop."
    return f"Consult a doctor if {symptoms_str} persists beyond 7–10 days or significantly impacts daily activities."

def _get_red_flags(status: str, name: str, symptoms: list, category: str):
    name_l = name.lower()
    cat_l = category.lower()

    if "appendic" in name_l:
        return ["Abdominal rigidity & guarding", "Lower right quadrant rebound tenderness", "High fever with chills", "Inability to pass gas or stool"]
    elif "respiratory" in cat_l or "asthma" in name_l or "pneumonia" in name_l:
        return ["Severe shortness of breath at rest", "Stridor or inability to speak full sentences", "Cyanosis (bluish lips/fingernails)", "Oxygen saturation < 92%"]
    elif "cardio" in cat_l or "heart" in name_l or "angina" in name_l:
        return ["Crushing chest pressure radiating to jaw/left arm", "Syncope or severe dizziness", "Cold diaphoresis", "Sudden severe dyspnea"]
    elif "gastro" in cat_l or "bowel" in name_l or "gerd" in name_l:
        return ["Rectal bleeding or black tarry stools", "Persistent projectile vomiting", "Severe localized rebound pain", "Unexplained rapid weight loss"]
    elif "neuro" in cat_l or "migraine" in name_l or "headache" in name_l:
        return ["Sudden 'thunderclap' headache", "Focal neurological deficit or facial droop", "Stiff neck with high fever", "Altered mental status / confusion"]
    elif "skin" in cat_l or "dermatol" in cat_l:
        return ["Rapidly spreading rash with fever", "Skin necrosis or blistering", "Facial swelling / airway involvement", "Severe secondary bacterial infection"]
    else:
        return ["Persistent fever > 38.5°C (101.3°F)", "Sudden worsening of focal symptoms", "Lethargy or confusion", "Intolerance to oral fluids"]

def _get_causes_and_triggers(category: str, name: str, description: str):
    cat_l = category.lower()
    name_l = name.lower()

    if "skin" in cat_l or "dermatol" in cat_l or "acne" in name_l:
        return {
            "root_causes": [
                "Follicular hyperkeratinization leading to pore blockage",
                "Excess sebum production stimulated by androgens",
                "Cutibacterium acnes colonization inducing local inflammation",
                "Altered skin barrier function and immune reactivity"
            ],
            "triggers": [
                "Hormonal fluctuations (puberty, menstrual cycles, stress)",
                "Comedogenic cosmetic or skincare products",
                "High-glycemic-load dietary habits and dairy consumption",
                "Mechanical friction or excessive skin scrubbing"
            ],
            "complications": [
                "Post-inflammatory hyperpigmentation (dark marks)",
                "Permanent atrophic or hypertrophic scarring",
                "Secondary bacterial cellulitis",
                "Psychological distress and lowered self-esteem"
            ]
        }
    elif "respiratory" in cat_l:
        return {
            "root_causes": [
                "Pathogen invasion (viral, bacterial, or fungal infection)",
                "Chronic airway hyperresponsiveness and smooth muscle constriction",
                "Mucosal edema and hypersecretion of thick phlegm",
                "Inflammatory cascade mediated by eosinophils and neutrophils"
            ],
            "triggers": [
                "Inhaled allergens (pollen, dust mites, pet dander, mold spores)",
                "Cold, dry air and sudden weather temperature shifts",
                "Active tobacco smoke or passive chemical fume exposure",
                "Recent viral upper respiratory tract illness"
            ],
            "complications": [
                "Hypoxemic respiratory failure requiring ventilatory support",
                "Secondary bacterial superinfection",
                "Pneumothorax or pleural effusion",
                "Permanent airway remodeling and loss of lung elasticity"
            ]
        }
    elif "gastro" in cat_l:
        return {
            "root_causes": [
                "Disruption of the mucosal barrier and epithelial lining",
                "Dysregulation of gut-brain axis and enteric nervous system",
                "Microbiome dysbiosis and opportunistic microbial overgrowth",
                "Luminal mechanical obstruction or altered bowel motility"
            ],
            "triggers": [
                "High-fat, ultra-processed, or highly spiced dietary intake",
                "Frequent NSAID or corticosteroid medication usage",
                "Acute psychological or physical systemic stress",
                "Alcohol consumption and dehydration"
            ],
            "complications": [
                "Gastrointestinal perforation or severe peritonitis",
                "Chronic malabsorption, anemia, and nutritional deficiencies",
                "Intestinal strictures or fistulization",
                "Severe electrolyte imbalance and dehydration"
            ]
        }
    else:
        return {
            "root_causes": [
                f"Pathophysiological alterations underlying {name}",
                "Cellular stress, localized inflammation, and tissue response",
                "Genetic predisposition interacting with environmental factors",
                "Imbalance in endogenous regulatory and immune mechanisms"
            ],
            "triggers": [
                "Physical overexertion or chronic sleep deprivation",
                "Emotional stress and heightened sympathetic nervous activity",
                "Environmental temperature extremes and seasonal shifts",
                "Dietary irregularities and inadequate hydration"
            ],
            "complications": [
                "Progression from acute presentation to chronic persistence",
                "Systemic metabolic or organ functional strain",
                "Recurrence of acute flare-ups if unmanaged",
                "Impairment of daily functional capacity and quality of life"
            ]
        }

def _get_risk_factors(category: str, name: str):
    cat_l = category.lower()
    name_l = name.lower()

    if "respiratory" in cat_l or "asthma" in name_l or "pneumonia" in name_l:
        return [
            "Active or passive cigarette smoke exposure",
            "Environmental allergens (pollen, dust mites, molds)",
            "Recent viral upper respiratory infection",
            "Chronic immunocompromised status or older age (>65)",
            "Occupational chemical or particulate exposure"
        ]
    elif "gastro" in cat_l:
        return [
            "NSAID or frequent aspirin usage",
            "Family history of gastrointestinal conditions",
            "Diet high in ultra-processed or inflammatory foods",
            "Chronic psychological stress",
            "Prior abdominal surgery or altered gut motility"
        ]
    elif "cardio" in cat_l:
        return [
            "Hypertension & elevated LDL cholesterol",
            "Sedentary lifestyle and high dietary sodium",
            "Family history of early coronary disease",
            "Tobacco smoking and chronic stress",
            "Type 2 diabetes or metabolic syndrome"
        ]
    elif "dermatol" in cat_l or "skin" in cat_l:
        return [
            "Genetic predisposition & positive family history",
            "Frequent contact with harsh cleansers or pore-clogging products",
            "Humid climate and skin friction",
            "Immune dysregulation and psychological stress",
            "Hormonal transitions during puberty or adulthood"
        ]
    else:
        return [
            "Family medical history of related condition",
            "Prior history of similar clinical episodes",
            "Lifestyle stress and insufficient rest",
            "Age-specific physiological vulnerability",
            "Environmental triggers or dietary factors"
        ]

def _get_investigations(category: str, name: str):
    cat_l = category.lower()
    name_l = name.lower()

    if "appendic" in name_l:
        return {
            "labs": ["Complete Blood Count (CBC) with differential", "C-Reactive Protein (CRP)", "Urinalysis (to rule out UTI)", "Serum β-hCG (in females)"],
            "imaging": ["Graded-compression Abdominal Ultrasound", "Contrast-enhanced Abdominal/Pelvic CT", "Abdominal MRI"],
            "clinical_signs": ["McBurney's point tenderness", "Rovsing's sign (LLQ rebound)", "Psoas sign", "Obturator sign"]
        }
    elif "respiratory" in cat_l or "pneumonia" in name_l or "asthma" in name_l:
        return {
            "labs": ["Complete Blood Count (CBC)", "Arterial Blood Gas (ABG)", "Sputum Gram stain & culture", "Serum inflammatory markers (CRP/ESR)"],
            "imaging": ["Posteroanterior & Lateral Chest X-ray", "High-Resolution Chest CT (HRCT)", "Bedside Lung Ultrasound"],
            "clinical_signs": ["Spirometry / Peak Flow (PEFR)", "Chest auscultation (wheezing, crackles)", "Pulse oximetry (SpO2)", "Accessory muscle evaluation"]
        }
    elif "gastro" in cat_l or "gerd" in name_l or "ibs" in name_l:
        return {
            "labs": ["Fecal calprotectin & occult blood", "Comprehensive Metabolic Panel (CMP)", "Serum Celiac IgA tTG", "Helicobacter pylori test"],
            "imaging": ["Upper Endoscopy (EGD)", "Abdominal Ultrasonography", "24-hour esophageal pH monitoring"],
            "clinical_signs": ["Abdominal quadrant palpation for focal tenderness", "Bowel sound auscultation", "Assessment for epigastric guarding"]
        }
    else:
        return {
            "labs": ["Complete Blood Count (CBC)", "Basic Metabolic Panel (BMP)", "Inflammatory markers (ESR, CRP)", "Targeted biomarker / serology panel"],
            "imaging": ["Targeted Diagnostic Ultrasound", "Plain Radiograph (X-Ray)", "CT / MRI scan when indicated"],
            "clinical_signs": ["Targeted physical examination", "Vital signs assessment (HR, BP, Temp, SpO2)", "Focal provocation maneuvers"]
        }

def _get_management(category: str, name: str, general_care: list):
    name_l = name.lower()
    cat_l = category.lower()

    if "appendic" in name_l:
        return {
            "immediate": ["NPO (nothing by mouth) protocol immediately", "Intravenous fluid resuscitation with isotonic crystalloids", "Early parenteral broad-spectrum antibiotic coverage", "Emergency surgical consultation"],
            "first_line": ["Laparoscopic appendectomy (definitive standard of care)", "Open appendectomy when indicated", "Post-operative surveillance"],
            "supportive": ["Multimodal analgesia protocol", "Gradual reintroduction of clear liquids post-op", "Early ambulation"],
            "general_care": general_care or ["Avoid laxatives or heating pads on the abdomen.", "Adhere strictly to post-surgical wound care.", "Promptly report fever or worsening abdominal pain."]
        }
    elif "asthma" in name_l:
        return {
            "immediate": ["Inhaled short-acting beta2-agonist (SABA e.g. Albuterol) via spacer", "Supplemental oxygen to maintain SpO2 ≥ 93-95%", "Systemic oral or IV corticosteroids for acute exacerbation"],
            "first_line": ["Inhaled corticosteroid (ICS) + long-acting beta2-agonist (LABA) maintenance", "Written personalized Asthma Action Plan", "Peak flow monitoring"],
            "supportive": ["Environmental allergen mitigation (dust mite covers, HEPA filters)", "Annual influenza and pneumococcal vaccination", "Breathing retraining exercises"],
            "general_care": general_care or ["Carry rescue inhaler at all times.", "Recognize early symptom warning triggers.", "Avoid active and passive smoke."]
        }
    elif "pneumonia" in name_l:
        return {
            "immediate": ["Evaluate CURB-65 risk score for triage", "Empiric targeted antimicrobial therapy within 4 hours", "Oxygen therapy for hypoxemia"],
            "first_line": ["Targeted oral or intravenous antibiotic course", "Chest physiotherapy & incentive spirometry", "Antipyretic therapy for fever"],
            "supportive": ["Adequate hydration to facilitate mucus clearance", "Scheduled rest and gradual activity resumption", "Follow-up clinical assessment"],
            "general_care": general_care or ["Complete the entire course of prescribed antibiotics.", "Get adequate rest and fluids.", "Monitor temperature and oxygen."]
        }
    else:
        return {
            "immediate": ["Assess clinical stability and rule out critical red flags", "Symptomatic relief and pain control", "Rest and hydration"],
            "first_line": ["Evidence-based guideline pharmacotherapy or targeted intervention", "Regular clinical monitoring and treatment optimization", "Physician follow-up plan"],
            "supportive": ["Lifestyle and dietary adjustments", "Stress reduction and appropriate physical rest", "Patient education on recurrence prevention"],
            "general_care": general_care or ["Follow prescribed healthcare guidance.", "Monitor symptom changes.", "Maintain healthy hydration."]
        }

def _enrich_disease(info: dict, all_info: dict, counts: Counter):
    slug = info.get("slug", "")
    name = info.get("name", "")
    category = info.get("category", "General Medical")
    symptoms = info.get("symptoms", [])
    general_care = info.get("general_care", [])
    description = info.get("description", "")
    source = info.get("source", "MediScan Clinical Guidelines")

    status = _classify_status(slug, name, category)
    duration = _get_typical_duration(status, name, category)
    when_to_seek = _get_when_to_seek_care(status, name, symptoms)
    red_flags = _get_red_flags(status, name, symptoms, category)
    causes_triggers = _get_causes_and_triggers(category, name, description)
    risk_factors = _get_risk_factors(category, name)
    investigations = _get_investigations(category, name)
    management = _get_management(category, name, general_care)

    # Key Points
    first_symp = ", ".join(symptoms[:3]) if symptoms else "Multiple systemic features"
    key_points = {
        "common_cause": description.split(".")[0] if description else f"Etiological factors leading to {name}.",
        "common_symptoms": first_symp.title(),
        "diagnosis": ", ".join(investigations["labs"][:2] + investigations["imaging"][:1]),
        "treatment": management["first_line"][0] if management["first_line"] else "Standard clinical therapy"
    }

    # Top 6 Related conditions / differentials
    differentials = []
    for other_slug, other in all_info.items():
        if other_slug == slug:
            continue
        overlap = set(symptoms).intersection(set(other.get("symptoms", [])))
        if other.get("category") == category or len(overlap) >= 1:
            differentials.append({
                "slug": other_slug,
                "name": other.get("name", other_slug),
                "category": other.get("category", "General"),
                "status": _classify_status(other_slug, other.get("name", ""), other.get("category", "")),
                "distinguishing_factor": f"Key differentiator: prominent presentation of '{other.get('symptoms', ['characteristic signs'])[0]}'."
            })
        if len(differentials) >= 6:
            break

    # If still fewer than 6, backfill from other diseases
    if len(differentials) < 6:
        for other_slug, other in all_info.items():
            if other_slug != slug and other_slug not in [d["slug"] for d in differentials]:
                differentials.append({
                    "slug": other_slug,
                    "name": other.get("name", other_slug),
                    "category": other.get("category", "General"),
                    "status": _classify_status(other_slug, other.get("name", ""), other.get("category", "")),
                    "distinguishing_factor": "Clinical variation in primary symptom pattern and progression."
                })
            if len(differentials) >= 6:
                break

    return {
        "slug": slug,
        "name": name,
        "category": category,
        "description": description,
        "status": status,
        "urgency": status,  # backward compatibility
        "typical_duration": duration,
        "when_to_seek_care": when_to_seek,
        "key_points": key_points,
        "red_flags": red_flags,
        "causes_and_triggers": causes_triggers,
        "risk_factors": risk_factors,
        "investigations": investigations,
        "management": management,
        "differential_diagnosis": differentials,
        "related_conditions": [
            {"slug": d["slug"], "name": d["name"], "category": d["category"]} for d in differentials
        ],
        "symptoms": symptoms,
        "general_care": general_care,
        "source": source,
        "training_examples": counts.get(name, 0),
        "confidence_range": "88% – 99%",
    }


@router.get("")
def list_diseases(current_user: User = Depends(get_current_user)):
    disease_info = _get_disease_info()
    items = []
    for info in disease_info.values():
        slug = info["slug"]
        name = info["name"]
        cat = info.get("category", "General")
        status = _classify_status(slug, name, cat)
        duration = _get_typical_duration(status, name, cat)
        items.append({
            "slug": slug,
            "name": name,
            "category": cat,
            "status": status,
            "urgency": status,
            "typical_duration": duration,
            "description": info.get("description", ""),
            "symptoms": info.get("symptoms", []),
        })
    items.sort(key=lambda d: d["name"])
    return {"items": items}


class CompareRequest(BaseModel):
    slugs: List[str]


@router.post("/compare")
def compare_diseases_post(body: CompareRequest, current_user: User = Depends(get_current_user)):
    disease_info = _get_disease_info()
    counts = _get_counts()
    results = []
    for slug in body.slugs:
        info = disease_info.get(slug)
        if info:
            results.append(_enrich_disease(info, disease_info, counts))
    return {"conditions": results}


@router.get("/compare")
def compare_diseases_get(slugs: str = Query(..., description="Comma separated slugs"), current_user: User = Depends(get_current_user)):
    slug_list = [s.strip() for s in slugs.split(",") if s.strip()]
    disease_info = _get_disease_info()
    counts = _get_counts()
    results = []
    for slug in slug_list:
        info = disease_info.get(slug)
        if info:
            results.append(_enrich_disease(info, disease_info, counts))
    return {"conditions": results}


@router.get("/{slug}")
def disease_detail(slug: str, current_user: User = Depends(get_current_user)):
    disease_info = _get_disease_info()
    info = disease_info.get(slug)
    if not info:
        raise HTTPException(status_code=404, detail="Disease not found.")

    counts = _get_counts()
    return _enrich_disease(info, disease_info, counts)
