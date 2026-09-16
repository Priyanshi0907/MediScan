"""
Groq AI Clinical Diagnostic Engine for MediScan.
Provides high-accuracy disease prediction, differential diagnosis,
clinical symptom extraction, and personalized healthcare recommendations.
"""
import os
import json
import logging
import httpx

logger = logging.getLogger("mediscan.groq")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "qwen/qwen3.8-27b"
FALLBACK_MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are MediScan AI, an expert clinical diagnostic and symptom analysis engine.
Your task is to analyze patient symptom descriptions and provide:
1. Highly accurate symptom extraction (canonical medical terms and symptoms described).
2. Primary disease diagnosis with calibrated confidence score (70-96%).
3. 2-3 differential diagnoses with realistic, descending confidence percentages.
4. Comprehensive, evidence-based clinical reasoning explaining the pathophysiological link between the patient's symptoms and the diagnosed condition.
5. Emergency triage assessment: identify any red-flag emergency symptoms (such as acute chest pain, anaphylaxis, severe dyspnea, stroke signs, uncontrollable hemorrhage, acute severe abdomen).
6. Risk level: strictly one of "Low", "Moderate", or "High".
7. Detailed, personalized recommendations:
   - immediate_care: 2-3 practical, actionable self-care or supportive measures.
   - doctor_consult: actionable advice on consulting the proper physician, questions to ask, and symptom timeline tracking.
   - specialist: exact medical specialist (e.g. Cardiologist, Pulmonologist, Neurologist, Gastroenterologist, Dermatologist, ENT Specialist, Rheumatologist, Endocrinologist, Nephrologist, General Physician).
   - diet_lifestyle: condition-specific nutrition, hydration, resting, and lifestyle modifications.
   - red_flags: specific warning signs that require immediate emergency room care.
8. Affected body systems with percentage contribution summing to approximately 100% (e.g., Respiratory, Neurological, Digestive, Cardiovascular, Musculoskeletal, Dermatologic, General).

You must respond ONLY with a valid JSON object matching this exact schema:
{
  "detected_symptoms": ["string"],
  "top_prediction": {
    "disease": "string",
    "confidence": integer
  },
  "other_predictions": [
    {"disease": "string", "confidence": integer}
  ],
  "explanation": "string",
  "emergency_warning": null or "string with critical warning",
  "risk_level": "Low" | "Moderate" | "High",
  "recommendations": {
    "immediate_care": ["string", "string"],
    "doctor_consult": "string",
    "specialist": "string",
    "diet_lifestyle": "string",
    "red_flags": "string"
  },
  "affected_systems": [
    {"system": "string", "percentage": integer}
  ]
}
"""


def _get_api_key() -> str:
    return os.environ.get("GROQ_API_KEY", "").strip()


def groq_predict(raw_text: str) -> dict | None:
    """
    Calls the Groq API to perform deep clinical diagnosis and symptom analysis.
    Returns a normalized prediction dictionary, or None if Groq is unavailable.
    """
    api_key = _get_api_key()
    if not api_key:
        logger.info("No GROQ_API_KEY configured; skipping Groq AI.")
        return None

    model = os.environ.get("GROQ_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
    user_prompt = f"Analyze the following patient presentation and provide clinical diagnosis and personalized recommendations:\n\n\"{raw_text.strip()}\""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MediScan/1.0",
    }

    # Attempt with primary model, then fallback model if needed
    candidate_models = [model]
    if FALLBACK_MODEL not in candidate_models:
        candidate_models.append(FALLBACK_MODEL)

    for target_model in candidate_models:
        payload = {
            "model": target_model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
            "max_tokens": 1200,
        }

        try:
            with httpx.Client(timeout=25.0) as client:
                response = client.post(GROQ_API_URL, headers=headers, json=payload)
                if response.status_code != 200:
                    logger.warning(
                        "Groq API error with model %s (status %d): %s",
                        target_model,
                        response.status_code,
                        response.text,
                    )
                    continue

                data = response.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)

                # Validate and normalize output
                top_pred = parsed.get("top_prediction", {})
                disease = top_pred.get("disease", "Undetermined Condition")
                confidence = int(top_pred.get("confidence", 85))
                confidence = max(50, min(98, confidence))

                raw_others = parsed.get("other_predictions", [])
                others = []
                for o in raw_others[:3]:
                    if isinstance(o, dict) and "disease" in o:
                        others.append({
                            "disease": str(o["disease"]),
                            "confidence": max(5, min(confidence - 5, int(o.get("confidence", 30))))
                        })

                detected_symptoms = [
                    str(s) for s in parsed.get("detected_symptoms", []) if str(s).strip()
                ]

                explanation = str(parsed.get("explanation", "")).strip()
                if not explanation:
                    explanation = f"Analysis identified correlation with {disease} based on clinical presentation."

                emergency_warning = parsed.get("emergency_warning")
                if emergency_warning and not str(emergency_warning).strip():
                    emergency_warning = None
                elif emergency_warning:
                    emergency_warning = str(emergency_warning).strip()

                risk_level = str(parsed.get("risk_level", "Moderate")).capitalize()
                if risk_level not in ["Low", "Moderate", "High"]:
                    risk_level = "Moderate"

                raw_recs = parsed.get("recommendations", {})
                immediate_care = raw_recs.get("immediate_care", [
                    "Rest comfortably and maintain adequate hydration.",
                    "Monitor for any changes or symptom progression over the next 24 hours."
                ])
                if isinstance(immediate_care, str):
                    immediate_care = [immediate_care]

                specialist = str(raw_recs.get("specialist", "General Physician")).strip()
                doctor_consult = str(raw_recs.get(
                    "doctor_consult",
                    f"Consult a {specialist} for complete diagnostic evaluation."
                )).strip()
                diet_lifestyle = str(raw_recs.get(
                    "diet_lifestyle",
                    "Maintain clean hydration, light nutrition, and restorative rest."
                )).strip()
                red_flags = str(raw_recs.get(
                    "red_flags",
                    "Seek emergency care if severe pain, shortness of breath, or high fever occurs."
                )).strip()

                recommendations = {
                    "immediate_care": immediate_care,
                    "doctor_consult": doctor_consult,
                    "specialist": specialist,
                    "diet_lifestyle": diet_lifestyle,
                    "red_flags": red_flags,
                }

                affected_systems = parsed.get("affected_systems", [])
                if not affected_systems or not isinstance(affected_systems, list):
                    affected_systems = [{"system": "General", "percentage": 100}]

                word_count = len(raw_text.strip().split()) if raw_text.strip() else 0
                model_label = f"Groq AI ({target_model})"

                return {
                    "top_prediction": {"disease": disease, "confidence": confidence},
                    "other_predictions": others,
                    "detected_symptoms": detected_symptoms,
                    "explanation": explanation,
                    "emergency_warning": emergency_warning,
                    "risk_level": risk_level,
                    "total_conditions_matched": max(len(others) + 1, 4),
                    "word_count": word_count,
                    "model_used": model_label,
                    "recommendations": recommendations,
                    "affected_systems": affected_systems,
                }

        except Exception as err:
            logger.error("Exception invoking Groq API with model %s: %s", target_model, err)
            continue

    return None
