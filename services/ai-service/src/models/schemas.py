from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


# =========================
# Evaluation classique
# =========================
class EvaluationRequest(BaseModel):
    exercise_id: str = Field(..., description="ID de l'exercice")
    student_answer: str = Field(..., description="Réponse de l'étudiant")
    expected_answer: str = Field(..., description="Réponse attendue")
    student_id: str = Field(..., description="ID de l'étudiant")
    answer_type: str = Field("math", description="Type de réponse: math, text, code")

    @validator("answer_type")
    def validate_answer_type(cls, v):
        valid_types = ["math", "text", "code"]
        if v not in valid_types:
            raise ValueError(f"answer_type doit être l'un des suivants: {', '.join(valid_types)}")
        return v


class EvaluationResponse(BaseModel):
    is_correct: bool = Field(..., description="Si la réponse est correcte")
    score: float = Field(..., ge=0, le=1, description="Score entre 0 et 1")
    feedback: str = Field(..., description="Feedback personnalisé")
    hints: List[str] = Field(default_factory=list, description="Indices pour amélioration")
    correct_answer: Optional[str] = Field(None, description="Réponse correcte si fausse")
    next_difficulty: Optional[DifficultyLevel] = Field(None, description="Difficulté suivante recommandée")
    confidence: float = Field(..., ge=0, le=1, description="Confiance de l'évaluation")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Métadonnées supplémentaires")


# =========================
# OCR
# =========================
class OCRRequest(BaseModel):
    text: str = Field(..., description="Texte à analyser")
    image_base64: Optional[str] = Field(None, description="Image en base64 (pour OCR complet)")

    @validator("image_base64")
    def validate_image_data(cls, v, values):
        if not v and not values.get("text"):
            raise ValueError("Au moins un des champs 'text' ou 'image_base64' doit être fourni")
        return v


class OCRResponse(BaseModel):
    text: str = Field(..., description="Texte traité")
    latex: Optional[str] = Field(None, description="Représentation LaTeX")
    is_math: bool = Field(False, description="Si le contenu est mathématique")
    confidence: float = Field(..., ge=0, le=1, description="Score de confiance")
    success: bool = Field(..., description="Si le traitement a réussi")


# =========================
# Adaptive
# =========================
class AdaptiveRequest(BaseModel):
    student_id: str = Field(..., description="ID de l'étudiant")
    exercise_id: str = Field(..., description="ID de l'exercice")
    performance: float = Field(..., ge=0, le=1, description="Score de performance")
    time_taken: int = Field(0, ge=0, description="Temps pris en secondes")
    attempts: int = Field(1, ge=1, description="Nombre de tentatives")


class AdaptiveResponse(BaseModel):
    next_difficulty: DifficultyLevel = Field(..., description="Difficulté recommandée")
    feedback: str = Field(..., description="Feedback adaptatif")
    confidence: float = Field(..., ge=0, le=1, description="Confiance de la recommandation")
    suggested_topics: List[str] = Field(default_factory=list, description="Sujets suggérés")


# =========================
# Health / Error
# =========================
class HealthResponse(BaseModel):
    status: str = Field(..., description="Statut du service")
    version: str = Field(..., description="Version du service")
    timestamp: datetime = Field(default_factory=datetime.now)
    components: Dict[str, str] = Field(..., description="Santé des composants")


class ErrorResponse(BaseModel):
    error: str = Field(..., description="Message d'erreur")
    details: Optional[Dict[str, Any]] = Field(None, description="Détails de l'erreur")
    timestamp: datetime = Field(default_factory=datetime.now)


# =========================
# Test
# =========================
class TestRequest(BaseModel):
    expression: str = Field(..., description="Expression mathématique à tester")
    expected: Optional[str] = Field(None, description="Résultat attendu")


class TestResponse(BaseModel):
    parsed: str = Field(..., description="Expression parsée")
    simplified: str = Field(..., description="Expression simplifiée")
    is_valid: bool = Field(..., description="Si l'expression est valide")
    result: Optional[float] = Field(None, description="Résultat numérique si applicable")


# ============================================================
# ✅ Step-by-step evaluation (nouveau)
# ============================================================
class StepEvaluationRequest(BaseModel):
    exercise_id: str = Field(..., description="ID de l'exercice")
    student_id: str = Field(..., description="ID de l'étudiant")
    expected_answer: str = Field(..., description="Réponse attendue")
    expected_steps: Optional[List[str]] = Field(None, description="Étapes attendues (optionnel)")  # ✅ AJOUT
    steps: List[str] = Field(..., description="Liste des étapes")
    final_answer: Optional[str] = Field(None, description="Réponse finale (optionnel)")


class StepFeedback(BaseModel):
    index: int = Field(..., description="Index de l'étape")
    step: str = Field(..., description="Contenu de l'étape")
    is_correct: bool = Field(..., description="Si l'étape est correcte")
    hint: Optional[str] = Field(None, description="Indice si incorrect")
    corrected_step: Optional[str] = Field(None, description="Suggestion de correction")


class StepEvaluationResponse(BaseModel):
    global_score: float = Field(..., ge=0, le=1, description="Score global entre 0 et 1")
    steps_feedback: List[StepFeedback] = Field(default_factory=list, description="Feedback par étape")
    generated_solution_steps: List[str] = Field(default_factory=list, description="Solution modèle proposée")
    correct_answer: Optional[str] = Field(None, description="Réponse correcte (référence)")
