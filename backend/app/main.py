from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth_router, predict_router, history_router, diseases_router, reports_router, stats_router

import os

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MEDiScan API",
    description="AI-powered medical text analysis and disease prediction (educational project).",
    version="1.0.0",
)

cors_origins_env = os.environ.get("CORS_ORIGINS", "")
if cors_origins_env:
    allow_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
else:
    allow_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(predict_router.router)
app.include_router(history_router.router)
app.include_router(diseases_router.router)
app.include_router(reports_router.router)
app.include_router(stats_router.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "MEDiScan API"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
