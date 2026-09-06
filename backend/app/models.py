import datetime
import json

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Member")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    input_text = Column(Text, nullable=False)
    top_disease = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    detected_symptoms = Column(Text, nullable=False)   # JSON-encoded list
    other_predictions = Column(Text, nullable=False)   # JSON-encoded list of dicts
    explanation = Column(Text, nullable=False)
    risk_level = Column(String, nullable=False)
    emergency_warning = Column(Text, nullable=True)
    model_used = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="predictions")

    def to_dict(self):
        from .ml.predict import _generate_recommendations, DISEASE_BY_NAME
        symptoms = json.loads(self.detected_symptoms)
        try:
            others = json.loads(self.other_predictions)
        except Exception:
            others = []
        recommendations = _generate_recommendations(self.top_disease, symptoms, self.risk_level)

        # Calculate affected body systems breakdown
        category_counts = {}
        top_info = DISEASE_BY_NAME.get(self.top_disease, {})
        top_cat = top_info.get("category", "General")
        category_counts[top_cat] = category_counts.get(top_cat, 0) + (self.confidence / 100.0)

        for o in others:
            o_info = DISEASE_BY_NAME.get(o.get("disease"), {})
            o_cat = o_info.get("category", "General")
            category_counts[o_cat] = category_counts.get(o_cat, 0) + (o.get("confidence", 10) / 100.0)

        total_score = sum(category_counts.values()) if category_counts else 1.0
        affected_systems = [
            {"system": cat, "percentage": max(10, round((score / total_score) * 100))}
            for cat, score in sorted(category_counts.items(), key=lambda x: -x[1])
        ]

        return {
            "id": self.id,
            "input_text": self.input_text,
            "top_disease": self.top_disease,
            "confidence": self.confidence,
            "detected_symptoms": symptoms,
            "other_predictions": others,
            "explanation": self.explanation,
            "risk_level": self.risk_level,
            "emergency_warning": self.emergency_warning,
            "model_used": self.model_used,
            "recommendations": recommendations,
            "affected_systems": affected_systems,
            "created_at": self.created_at.isoformat(),
        }

