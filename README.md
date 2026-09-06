# MEDiScan — AI-Powered Disease Analysis System

MEDiScan turns a plain-language description of symptoms into a ranked list of
possible conditions, using a real NLP + machine learning pipeline. It's built
as an educational NLP/ML + full-stack project — **not** a medical diagnostic
device.

```
User text → NLP preprocessing → Symptom extraction → TF-IDF + ML classifier
          → Top-3 disease predictions → Explanation → Safety disclaimer
```

## What's inside

- **`frontend/`** — React 19 + Vite + Tailwind CSS v4 app. Public marketing
  site (Home / Features / How It Works / About) with Login/Signup, and a
  protected dashboard (Analysis, History, Patients, Disease Library, Reports,
  Settings).
- **`backend/`** — FastAPI + SQLite service. JWT auth, a trained
  scikit-learn text classifier, rule-based symptom extraction, and a
  rule-based emergency-symptom safety layer.

## Quick start

You'll need **Python 3.10+** and **Node.js 18+**.

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# The trained model is already included at app/ml/data/model.pkl.
# To regenerate the dataset and retrain from scratch:
python -m app.ml.build_dataset
python -m app.ml.train_model

uvicorn app.main:app --reload --port 8000
```

The API is now running at `http://localhost:8000` (interactive docs at
`http://localhost:8000/docs`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend expects the API at
`http://localhost:8000` by default (configurable via `frontend/.env`,
`VITE_API_URL`).

Sign up for a new account on `/signup` — auth is fully self-contained
(SQLite + JWT), no external services required.

## How the ML pipeline works

1. **Dataset** (`backend/app/ml/build_dataset.py`) — a hand-authored,
   educational dataset covering **40 conditions**, generated from curated
   symptom lists with natural-language phrasing variety (680 training rows
   total). This is intentionally *not* real clinical data — see
   `Disclaimers` below.
2. **Preprocessing** (`app/ml/preprocess.py`) — lowercasing, punctuation
   stripping, tokenization, stop-word removal, and light suffix-based
   lemmatization (no heavyweight NLP downloads required).
3. **Feature extraction** — `TfidfVectorizer` with unigrams + bigrams.
4. **Model selection** (`app/ml/train_model.py`) — trains and compares
   **Naive Bayes**, **Logistic Regression**, and a calibrated **Linear
   SVM** on a held-out split, and keeps the best performer. On the shipped
   dataset, Naive Bayes wins at **~85% held-out accuracy** — rerun the
   script to see current numbers, they are computed live, not hardcoded.
5. **Symptom extraction** (`app/ml/symptom_extractor.py`) — phrase-matching
   against a curated symptom vocabulary with a small synonym table (e.g.
   "can't breathe" → "difficulty breathing"), plus a rule-based emergency
   pattern list (e.g. chest pain, difficulty breathing) that surfaces a
   "seek immediate medical attention" warning — it never claims to detect
   an emergency condition itself.
6. **Prediction & explanation** (`app/ml/predict.py`) — returns the top 3
   predictions with confidence scores (via temperature-scaled softmax over
   the model's own probabilities — a standard calibration technique, not
   fabricated numbers), the overlapping symptoms driving the top prediction,
   and a plain-language explanation.

## API overview

| Method | Endpoint                  | Description                          |
|--------|----------------------------|---------------------------------------|
| POST   | `/api/auth/signup`         | Create an account                     |
| POST   | `/api/auth/login`          | Log in, get a JWT                     |
| GET    | `/api/auth/me`             | Current user                          |
| POST   | `/api/predict`             | Analyze symptom text, save to history |
| POST   | `/api/extract-symptoms`    | Symptom extraction only               |
| GET    | `/api/history`             | List past analyses (supports `?q=`)   |
| GET    | `/api/history/{id}`        | Single analysis                       |
| DELETE | `/api/history/{id}`        | Delete an analysis                    |
| GET    | `/api/diseases`            | Disease library                       |
| GET    | `/api/diseases/{slug}`     | Disease detail + general care info    |
| GET    | `/api/reports`             | List reports (same records as history)|
| GET    | `/api/reports/{id}`        | Report detail                         |
| GET    | `/api/stats`                | Basic usage stats for the current user|

All routes except `/api/auth/*` require `Authorization: Bearer <token>`.

## Tech stack

- **ML/NLP:** Python, scikit-learn, pandas, NumPy
- **Backend:** FastAPI, SQLAlchemy, SQLite, python-jose (JWT), bcrypt
- **Frontend:** React, Vite, Tailwind CSS v4, React Router, lucide-react

## Disclaimers (built into the product, not just this README)

- MEDiScan is a **prediction and learning tool**, not a diagnostic device.
  Every analysis screen shows an "AI-generated prediction, not a medical
  diagnosis" notice.
- The Disease Library's "General care information" is high-level,
  non-prescriptive educational content (e.g. "stay hydrated", "see a
  doctor if symptoms persist") sourced from named public health
  organizations (CDC, WHO, Mayo Clinic, etc. — see the `source` field per
  disease). It intentionally does **not** include drug names, dosages, or
  prescriptions — treatment decisions should always involve a licensed
  healthcare professional.
- The emergency-symptom layer is a simple rule-based keyword check. It
  surfaces a generic "seek immediate medical attention" message and never
  claims to detect or confirm an emergency.
- The training dataset is synthetic/educational, authored for this
  project — it is not derived from real patient records.

## Project structure

```
mediscan/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app + CORS + routers
│   │   ├── database.py            # SQLAlchemy engine/session
│   │   ├── models.py              # User, Prediction ORM models
│   │   ├── schemas.py             # Pydantic request/response models
│   │   ├── auth.py                # bcrypt hashing + JWT
│   │   ├── routers/               # auth, predict, history, diseases, reports, stats
│   │   └── ml/
│   │       ├── build_dataset.py   # generates dataset.csv + disease_info.json
│   │       ├── train_model.py     # trains + compares NB / LogReg / SVM
│   │       ├── preprocess.py      # text cleaning pipeline
│   │       ├── symptom_extractor.py
│   │       ├── predict.py         # inference + explanation
│   │       └── data/              # dataset.csv, disease_info.json, model.pkl
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/                 # Landing, Login, Signup, dashboard/*
        ├── components/            # Sidebar/Topbar, cards, illustrations
        ├── context/AuthContext.jsx
        └── api/client.js
```
