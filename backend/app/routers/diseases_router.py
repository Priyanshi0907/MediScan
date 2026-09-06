from fastapi import APIRouter, Depends, HTTPException
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


@router.get("")
def list_diseases(current_user: User = Depends(get_current_user)):
    disease_info = _get_disease_info()
    items = [
        {
            "slug": info["slug"],
            "name": info["name"],
            "category": info["category"],
            "symptoms": info["symptoms"],
        }
        for info in disease_info.values()
    ]
    items.sort(key=lambda d: d["name"])
    return {"items": items}


@router.get("/{slug}")
def disease_detail(slug: str, current_user: User = Depends(get_current_user)):
    disease_info = _get_disease_info()
    info = disease_info.get(slug)
    if not info:
        raise HTTPException(status_code=404, detail="Disease not found.")

    counts = _get_counts()
    return {
        **info,
        "training_examples": counts.get(info["name"], 0),
        "confidence_range": "55% – 98%",
    }
