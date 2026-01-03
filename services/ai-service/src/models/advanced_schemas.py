from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class AdvancedProblemRequest(BaseModel):
    topic: str = Field(..., description="ex: 'geometric_sequence'")
    u1: float = Field(..., description="Premier terme u1")
    n: int = Field(..., ge=1, description="n pour la somme Sn")
    relation: str = Field(..., description="ex: 'u2+u3=2u1'")


class AdvancedProblemResponse(BaseModel):
    success: bool = True
    topic: str
    results: Dict[str, Any]
    explanation_steps: List[str] = []
    warnings: List[str] = []
