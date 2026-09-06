from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Prediction
from ..auth import get_current_user

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = db.query(Prediction).filter(Prediction.user_id == current_user.id).count()
    high_risk = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id, Prediction.risk_level == "High")
        .count()
    )
    return {"total_analyses": total, "high_risk_analyses": high_risk}
