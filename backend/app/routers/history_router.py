from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Prediction
from ..auth import get_current_user

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
def list_history(
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Prediction).filter(Prediction.user_id == current_user.id)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (Prediction.top_disease.ilike(like)) | (Prediction.input_text.ilike(like))
        )
    items = query.order_by(Prediction.created_at.desc()).all()
    return {"items": [p.to_dict() for p in items]}


@router.get("/{item_id}")
def get_history_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Prediction).filter(Prediction.id == item_id, Prediction.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return item.to_dict()


@router.delete("")
def delete_all_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Prediction).filter(Prediction.user_id == current_user.id).delete()
    db.commit()
    return {"deleted": True, "message": "All history cleared."}


@router.delete("/{item_id}")
def delete_history_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Prediction).filter(Prediction.id == item_id, Prediction.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    db.delete(item)
    db.commit()
    return {"deleted": True}

