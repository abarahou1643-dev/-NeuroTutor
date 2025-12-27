from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("")
def health_root():
    return {
        "status": "healthy",
        "service": "ai-service",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/ping")
def ping():
    return {"pong": True}
