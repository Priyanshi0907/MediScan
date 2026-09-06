import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Prediction
from ..schemas import PredictRequest
from ..auth import get_current_user
from ..ml.predict import predict as run_prediction
from ..ml.symptom_extractor import extract_symptoms

router = APIRouter(prefix="/api", tags=["predict"])


@router.post("/predict")
def predict_endpoint(
    payload: PredictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = run_prediction(payload.text)

    record = Prediction(
        user_id=current_user.id,
        input_text=payload.text,
        top_disease=result["top_prediction"]["disease"],
        confidence=result["top_prediction"]["confidence"],
        detected_symptoms=json.dumps(result["detected_symptoms"]),
        other_predictions=json.dumps(result["other_predictions"]),
        explanation=result["explanation"],
        risk_level=result["risk_level"],
        emergency_warning=result["emergency_warning"],
        model_used=result["model_used"],
    )
    db.add(record)
    db.commit()

    return result


@router.post("/extract-symptoms")
def extract_symptoms_endpoint(
    payload: PredictRequest,
    current_user: User = Depends(get_current_user),
):
    return {"detected_symptoms": extract_symptoms(payload.text)}
