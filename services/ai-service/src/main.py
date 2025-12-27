from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings

# Routers
from src.api.endpoints.health import router as health_router
from src.api.endpoints.evaluation import router as evaluation_router
from src.api.endpoints.ocr import router as ocr_router
from src.api.endpoints.adaptive import router as adaptive_router

app = FastAPI(
    title=settings.app_name,
    version=settings.version
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(evaluation_router, prefix="/evaluation", tags=["evaluation"])
app.include_router(ocr_router, prefix="/ocr", tags=["ocr"])
app.include_router(adaptive_router, prefix="/adaptive", tags=["adaptive"])

@app.get("/")
def root():
    return {"service": "NeuroTutor AI", "status": "running"}
