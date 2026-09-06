from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth_router, predict_router, history_router, diseases_router, reports_router, stats_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MEDiScan API",
    description="AI-powered medical text analysis and disease prediction (educational project).",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
