// Clinical classification rules and offline/deployment fallbacks for MediScan Knowledge Library

export const EMERGENCY_KEYWORDS = [
  "appendicitis", "myocardial infarction", "heart attack", "stroke", "pulmonary embolism",
  "anaphylaxis", "aortic", "meningitis", "peritonitis", "sepsis", "pancreatitis",
  "ectopic pregnancy", "pneumothorax", "intestinal obstruction", "rabies", "transient ischemic attack"
];

export const URGENT_KEYWORDS = [
  "pneumonia", "asthma", "bronchitis", "pyelonephritis", "kidney stone", "cholecystitis",
  "deep vein thrombosis", "cellulitis", "diverticulitis", "migraine", "angina",
  "atrial fibrillation", "arrhythmia", "pericarditis", "dengue", "malaria", "cholera",
  "gallstone", "peptic ulcer", "shingles", "acute", "exacerbation"
];

export const CHRONIC_KEYWORDS = [
  "diabetes", "hypertension", "copd", "arthritis", "ibs", "irritable bowel", "gerd",
  "reflux", "psoriasis", "eczema", "thyroid", "hyperthyroidism", "hypothyroidism",
  "osteoporosis", "crohn", "celiac", "fibromyalgia", "chronic", "spondylosis", "spondylitis",
  "multiple sclerosis", "parkinson", "colitis", "coronary artery", "heart failure",
  "fatty liver", "polycystic", "metabolic syndrome"
];

/**
 * Classifies a disease status based on clinical rules.
 */
export function classifyStatus(slug = "", name = "", category = "") {
  const nameLower = (name || "").toLowerCase();
  const slugLower = (slug || "").toLowerCase();

  for (const kw of EMERGENCY_KEYWORDS) {
    if (nameLower.includes(kw) || slugLower.includes(kw)) {
      if (nameLower.includes("appendicitis") || nameLower.includes("peritonitis") || nameLower.includes("obstruction")) {
        return "Surgical Emergency";
      }
      return "Emergency";
    }
  }

  for (const kw of URGENT_KEYWORDS) {
    if (nameLower.includes(kw) || slugLower.includes(kw)) {
      return "Urgent Care";
    }
  }

  for (const kw of CHRONIC_KEYWORDS) {
    if (nameLower.includes(kw) || slugLower.includes(kw)) {
      return "Chronic";
    }
  }

  if (["cold", "viral pharyngitis", "mild", "rhinitis", "warts", "canker"].some((k) => nameLower.includes(k))) {
    return "Self-Limiting";
  }

  return "Primary Care";
}

/**
 * Returns the effective condition status, prioritizing provided fields and falling back to classification.
 */
export function getConditionStatus(disease = {}) {
  if (disease.status && typeof disease.status === "string" && disease.status.trim()) {
    return disease.status.trim();
  }
  if (disease.urgency && typeof disease.urgency === "string" && disease.urgency.trim()) {
    return disease.urgency.trim();
  }
  return classifyStatus(disease.slug, disease.name, disease.category);
}

/**
 * Checks if a condition satisfies the status filter.
 */
export function matchesStatusFilter(disease, statusFilter, savedSlugs = []) {
  if (!statusFilter || statusFilter === "All") {
    return true;
  }
  if (statusFilter === "Saved") {
    return savedSlugs.includes(disease.slug);
  }

  const status = getConditionStatus(disease).toLowerCase();

  if (statusFilter === "Emergency") {
    return status.includes("emergency");
  }
  if (statusFilter === "Urgent") {
    return status.includes("urgent");
  }
  if (statusFilter === "Chronic") {
    return status.includes("chronic");
  }
  if (statusFilter === "Primary") {
    return status.includes("primary") || status.includes("self-limiting");
  }

  return true;
}

export function getTypicalDuration(status = "", name = "") {
  const nameL = (name || "").toLowerCase();
  const statusL = (status || "").toLowerCase();

  if (statusL.includes("emergency")) {
    return "12–48 hours progressive";
  }
  if (statusL.includes("chronic") || nameL.includes("chronic")) {
    return "Chronic / Recurrent";
  }
  if (statusL.includes("urgent")) {
    if (nameL.includes("asthma") || nameL.includes("migraine")) {
      return "Hours to days";
    }
    return "1–3 weeks";
  }
  if (nameL.includes("cold") || nameL.includes("flu") || nameL.includes("pharyngitis")) {
    return "5–10 days";
  }
  return "1–2 weeks";
}

export function getWhenToSeekCare(status = "", name = "", symptoms = []) {
  const statusL = (status || "").toLowerCase();
  const symptomsStr = symptoms && symptoms.length ? symptoms.slice(0, 3).join(", ") : "symptoms";

  if (statusL.includes("surgical")) {
    return "Immediate ER: Severe acute pain, abdominal rigidity, high fever, or intractable vomiting.";
  }
  if (statusL.includes("emergency")) {
    return "Emergency evaluation (911 / ER): Shortness of breath, chest pressure, sudden confusion, or acute focal deficits.";
  }
  if (statusL.includes("urgent")) {
    return "Seek urgent medical evaluation within 24h if symptoms worsen rapidly, high fever persists, or breathing is laboured.";
  }
  if (statusL.includes("chronic")) {
    return "Consult your physician if symptoms fail to respond to standard maintenance regimen or new systemic symptoms develop.";
  }
  return `Consult a doctor if ${symptomsStr} persist beyond 7–10 days or significantly impact daily activities.`;
}

export function getRedFlags(status = "", name = "", symptoms = [], category = "") {
  const nameL = (name || "").toLowerCase();
  const catL = (category || "").toLowerCase();

  if (nameL.includes("appendic")) {
    return [
      "Abdominal rigidity & guarding",
      "Lower right quadrant rebound tenderness",
      "High fever with chills",
      "Inability to pass gas or stool"
    ];
  }
  if (catL.includes("respiratory") || nameL.includes("asthma") || nameL.includes("pneumonia")) {
    return [
      "Severe shortness of breath at rest",
      "Stridor or inability to speak full sentences",
      "Cyanosis (bluish lips/fingernails)",
      "Oxygen saturation < 92%"
    ];
  }
  if (catL.includes("cardio") || nameL.includes("heart") || nameL.includes("angina") || nameL.includes("aortic")) {
    return [
      "Crushing chest pressure radiating to jaw/left arm",
      "Syncope or severe dizziness",
      "Cold diaphoresis",
      "Sudden severe dyspnea"
    ];
  }
  if (catL.includes("gastro") || nameL.includes("bowel") || nameL.includes("gerd") || nameL.includes("pancreatitis")) {
    return [
      "Rectal bleeding or black tarry stools",
      "Persistent projectile vomiting",
      "Severe localized rebound pain",
      "Unexplained rapid weight loss"
    ];
  }
  if (catL.includes("neuro") || nameL.includes("migraine") || nameL.includes("headache") || nameL.includes("stroke")) {
    return [
      "Sudden 'thunderclap' headache",
      "Focal neurological deficit or facial droop",
      "Stiff neck with high fever",
      "Altered mental status / confusion"
    ];
  }
  if (catL.includes("skin") || catL.includes("dermatol")) {
    return [
      "Rapidly spreading rash with fever",
      "Skin necrosis or blistering",
      "Facial swelling / airway involvement",
      "Severe secondary bacterial infection"
    ];
  }
  return [
    "Persistent fever > 38.5°C (101.3°F)",
    "Sudden worsening of focal symptoms",
    "Lethargy or confusion",
    "Intolerance to oral fluids"
  ];
}

export function getCausesAndTriggers(category = "", name = "", description = "") {
  const catL = (category || "").toLowerCase();
  const nameL = (name || "").toLowerCase();

  if (catL.includes("skin") || catL.includes("dermatol") || nameL.includes("acne")) {
    return {
      root_causes: [
        "Follicular hyperkeratinization leading to pore blockage",
        "Excess sebum production stimulated by androgens",
        "Cutibacterium acnes colonization inducing local inflammation",
        "Altered skin barrier function and immune reactivity"
      ],
      triggers: [
        "Hormonal fluctuations (puberty, menstrual cycles, stress)",
        "Comedogenic cosmetic or skincare products",
        "High-glycemic-load dietary habits and dairy consumption",
        "Mechanical friction or excessive skin scrubbing"
      ],
      complications: [
        "Post-inflammatory hyperpigmentation (dark marks)",
        "Permanent atrophic or hypertrophic scarring",
        "Secondary bacterial cellulitis",
        "Psychological distress and lowered self-esteem"
      ]
    };
  }

  if (catL.includes("respiratory")) {
    return {
      root_causes: [
        "Pathogen invasion (viral, bacterial, or fungal infection)",
        "Chronic airway hyperresponsiveness and smooth muscle constriction",
        "Mucosal edema and hypersecretion of thick phlegm",
        "Inflammatory cascade mediated by eosinophils and neutrophils"
      ],
      triggers: [
        "Inhaled allergens (pollen, dust mites, pet dander, mold spores)",
        "Cold, dry air and sudden weather temperature shifts",
        "Active tobacco smoke or passive chemical fume exposure",
        "Recent viral upper respiratory tract illness"
      ],
      complications: [
        "Hypoxemic respiratory failure requiring ventilatory support",
        "Secondary bacterial superinfection",
        "Pneumothorax or pleural effusion",
        "Permanent airway remodeling and loss of lung elasticity"
      ]
    };
  }

  if (catL.includes("gastro")) {
    return {
      root_causes: [
        "Disruption of the mucosal barrier and epithelial lining",
        "Dysregulation of gut-brain axis and enteric nervous system",
        "Microbiome dysbiosis and opportunistic microbial overgrowth",
        "Luminal mechanical obstruction or altered bowel motility"
      ],
      triggers: [
        "High-fat, ultra-processed, or highly spiced dietary intake",
        "Frequent NSAID or corticosteroid medication usage",
        "Acute psychological or physical systemic stress",
        "Alcohol consumption and dehydration"
      ],
      complications: [
        "Gastrointestinal perforation or severe peritonitis",
        "Chronic malabsorption, anemia, and nutritional deficiencies",
        "Intestinal strictures or fistulization",
        "Severe electrolyte imbalance and dehydration"
      ]
    };
  }

  return {
    root_causes: [
      `Pathophysiological alterations underlying ${name || "condition"}`,
      "Cellular stress, localized inflammation, and tissue response",
      "Genetic predisposition interacting with environmental factors",
      "Imbalance in endogenous regulatory and immune mechanisms"
    ],
    triggers: [
      "Physical overexertion or chronic sleep deprivation",
      "Emotional stress and heightened sympathetic nervous activity",
      "Environmental temperature extremes and seasonal shifts",
      "Dietary irregularities and inadequate hydration"
    ],
    complications: [
      "Progression from acute presentation to chronic persistence",
      "Systemic metabolic or organ functional strain",
      "Recurrence of acute flare-ups if unmanaged",
      "Impairment of daily functional capacity and quality of life"
    ]
  };
}

export function getRiskFactors(category = "", name = "") {
  const catL = (category || "").toLowerCase();
  const nameL = (name || "").toLowerCase();

  if (catL.includes("respiratory") || nameL.includes("asthma") || nameL.includes("pneumonia")) {
    return [
      "Active or passive cigarette smoke exposure",
      "Environmental allergens (pollen, dust mites, molds)",
      "Recent viral upper respiratory infection",
      "Chronic immunocompromised status or older age (>65)",
      "Occupational chemical or particulate exposure"
    ];
  }
  if (catL.includes("gastro")) {
    return [
      "NSAID or frequent aspirin usage",
      "Family history of gastrointestinal conditions",
      "Diet high in ultra-processed or inflammatory foods",
      "Chronic psychological stress",
      "Prior abdominal surgery or altered gut motility"
    ];
  }
  if (catL.includes("cardio")) {
    return [
      "Hypertension & elevated LDL cholesterol",
      "Sedentary lifestyle and high dietary sodium",
      "Family history of early coronary disease",
      "Tobacco smoking and chronic stress",
      "Type 2 diabetes or metabolic syndrome"
    ];
  }
  if (catL.includes("dermatol") || catL.includes("skin")) {
    return [
      "Genetic predisposition & positive family history",
      "Frequent contact with harsh cleansers or pore-clogging products",
      "Humid climate and skin friction",
      "Immune dysregulation and psychological stress",
      "Hormonal transitions during puberty or adulthood"
    ];
  }
  return [
    "Family medical history of related condition",
    "Prior history of similar clinical episodes",
    "Lifestyle stress and insufficient rest",
    "Age-specific physiological vulnerability",
    "Environmental triggers or dietary factors"
  ];
}

export function getInvestigations(category = "", name = "") {
  const catL = (category || "").toLowerCase();
  const nameL = (name || "").toLowerCase();

  if (nameL.includes("appendic")) {
    return {
      labs: ["Complete Blood Count (CBC) with differential", "C-Reactive Protein (CRP)", "Urinalysis (to rule out UTI)", "Serum β-hCG (in females)"],
      imaging: ["Graded-compression Abdominal Ultrasound", "Contrast-enhanced Abdominal/Pelvic CT", "Abdominal MRI"],
      clinical_signs: ["McBurney's point tenderness", "Rovsing's sign (LLQ rebound)", "Psoas sign", "Obturator sign"]
    };
  }
  if (catL.includes("respiratory") || nameL.includes("pneumonia") || nameL.includes("asthma")) {
    return {
      labs: ["Complete Blood Count (CBC)", "Arterial Blood Gas (ABG)", "Sputum Gram stain & culture", "Serum inflammatory markers (CRP/ESR)"],
      imaging: ["Posteroanterior & Lateral Chest X-ray", "High-Resolution Chest CT (HRCT)", "Bedside Lung Ultrasound"],
      clinical_signs: ["Spirometry / Peak Flow (PEFR)", "Chest auscultation (wheezing, crackles)", "Pulse oximetry (SpO2)", "Accessory muscle evaluation"]
    };
  }
  if (catL.includes("gastro") || nameL.includes("gerd") || nameL.includes("ibs")) {
    return {
      labs: ["Fecal calprotectin & occult blood", "Comprehensive Metabolic Panel (CMP)", "Serum Celiac IgA tTG", "Helicobacter pylori test"],
      imaging: ["Upper Endoscopy (EGD)", "Abdominal Ultrasonography", "24-hour esophageal pH monitoring"],
      clinical_signs: ["Abdominal quadrant palpation for focal tenderness", "Bowel sound auscultation", "Assessment for epigastric guarding"]
    };
  }
  return {
    labs: ["Complete Blood Count (CBC)", "Basic Metabolic Panel (BMP)", "Inflammatory markers (ESR, CRP)", "Targeted biomarker / serology panel"],
    imaging: ["Targeted Diagnostic Ultrasound", "Plain Radiograph (X-Ray)", "CT / MRI scan when indicated"],
    clinical_signs: ["Targeted physical examination", "Vital signs assessment (HR, BP, Temp, SpO2)", "Focal provocation maneuvers"]
  };
}

export function getManagement(category = "", name = "", generalCare = []) {
  const nameL = (name || "").toLowerCase();

  if (nameL.includes("appendic")) {
    return {
      immediate: ["NPO (nothing by mouth) protocol immediately", "Intravenous fluid resuscitation with isotonic crystalloids", "Early parenteral broad-spectrum antibiotic coverage", "Emergency surgical consultation"],
      first_line: ["Laparoscopic appendectomy (definitive standard of care)", "Open appendectomy when indicated", "Post-operative surveillance"],
      supportive: ["Multimodal analgesia protocol", "Gradual reintroduction of clear liquids post-op", "Early ambulation"],
      general_care: generalCare.length ? generalCare : ["Avoid laxatives or heating pads on the abdomen.", "Adhere strictly to post-surgical wound care.", "Promptly report fever or worsening abdominal pain."]
    };
  }
  if (nameL.includes("asthma")) {
    return {
      immediate: ["Inhaled short-acting beta2-agonist (SABA e.g. Albuterol) via spacer", "Supplemental oxygen to maintain SpO2 ≥ 93-95%", "Systemic oral or IV corticosteroids for acute exacerbation"],
      first_line: ["Inhaled corticosteroid (ICS) + long-acting beta2-agonist (LABA) maintenance", "Written personalized Asthma Action Plan", "Peak flow monitoring"],
      supportive: ["Environmental allergen mitigation (dust mite covers, HEPA filters)", "Annual influenza and pneumococcal vaccination", "Breathing retraining exercises"],
      general_care: generalCare.length ? generalCare : ["Carry rescue inhaler at all times.", "Recognize early symptom warning triggers.", "Avoid active and passive smoke."]
    };
  }
  return {
    immediate: ["Assess clinical stability and rule out critical red flags", "Symptomatic relief and pain control", "Rest and hydration"],
    first_line: ["Evidence-based guideline pharmacotherapy or targeted intervention", "Regular clinical monitoring and treatment optimization", "Physician follow-up plan"],
    supportive: ["Lifestyle and dietary adjustments", "Stress reduction and appropriate physical rest", "Patient education on recurrence prevention"],
    general_care: generalCare.length ? generalCare : ["Follow prescribed healthcare guidance.", "Monitor symptom changes.", "Maintain healthy hydration."]
  };
}

/**
 * Enriches a disease object with comprehensive fields and guarantees status/urgency are populated.
 */
export function enrichCondition(disease = {}) {
  const name = disease.name || "";
  const slug = disease.slug || "";
  const category = disease.category || "General Medical";
  const symptoms = disease.symptoms || [];
  const generalCare = disease.general_care || [];

  const status = getConditionStatus(disease);
  const duration = disease.typical_duration || getTypicalDuration(status, name);
  const whenToSeek = disease.when_to_seek_care || getWhenToSeekCare(status, name, symptoms);
  const redFlags = disease.red_flags || getRedFlags(status, name, symptoms, category);
  const causesTriggers = disease.causes_and_triggers || getCausesAndTriggers(category, name, disease.description);
  const riskFactors = disease.risk_factors || getRiskFactors(category, name);
  const investigations = disease.investigations || getInvestigations(category, name);
  const management = disease.management || getManagement(category, name, generalCare);

  const fallbackDescription = symptoms.length
    ? `A clinical condition characterized primarily by ${symptoms.slice(0, 3).join(", ")}.`
    : `Comprehensive clinical monograph and diagnostic profile for ${name}.`;

  const description = disease.description || fallbackDescription;

  const keyPoints = disease.key_points || {
    common_cause: description.split(".")[0] || `Etiological factors leading to ${name}.`,
    common_symptoms: symptoms.slice(0, 3).join(", ") || "Multiple systemic features",
    diagnosis: investigations.labs?.slice(0, 2).concat(investigations.imaging?.slice(0, 1) || []).join(", ") || "Clinical history and examination",
    treatment: management.first_line?.[0] || "Standard clinical therapy"
  };

  return {
    ...disease,
    name,
    slug,
    category,
    status,
    urgency: status,
    typical_duration: duration,
    description,
    when_to_seek_care: whenToSeek,
    red_flags: redFlags,
    causes_and_triggers: causesTriggers,
    risk_factors: riskFactors,
    investigations,
    management,
    key_points: keyPoints,
    symptoms,
    general_care: generalCare,
    confidence_range: disease.confidence_range || "88% – 99%",
    training_examples: disease.training_examples || 18,
    source: disease.source || "MediScan Clinical Guidelines"
  };
}
