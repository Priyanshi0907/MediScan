from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Prediction
from ..auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("")
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
    return {"items": [p.to_dict() for p in items]}


@router.get("/{report_id}")
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Prediction).filter(Prediction.id == report_id, Prediction.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Report not found.")
    return item.to_dict()
