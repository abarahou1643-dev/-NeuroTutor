from fastapi import APIRouter
from src.models.schemas import AdaptiveRequest, AdaptiveResponse, DifficultyLevel
import logging
import random

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/adaptive/recommend", response_model=AdaptiveResponse)
async def recommend_difficulty(request: AdaptiveRequest):
    """
    Recommande une difficulté adaptée basée sur la performance
    """
    try:
        logger.info(f"Recommandation adaptative pour l'étudiant {request.student_id}")

        # Logique adaptative simple
        performance = request.performance
        time_factor = min(1.0, 300 / max(1, request.time_taken))  # Normaliser le temps
        attempts_factor = 1.0 / request.attempts  # Moins de tentatives = mieux

        # Score composite
        composite_score = (
            performance * 0.6 +
            time_factor * 0.2 +
            attempts_factor * 0.2
        )

        # Déterminer la difficulté
        if composite_score > 0.8:
            next_level = DifficultyLevel.ADVANCED
            feedback = "🌟 Excellent travail ! Tu maîtrises parfaitement ce concept. Passons à un niveau plus avancé."
            confidence = min(0.95, composite_score)
            topics = ["problèmes complexes", "applications avancées", "raisonnement critique"]

        elif composite_score > 0.6:
            next_level = DifficultyLevel.INTERMEDIATE
            feedback = "👍 Bon travail ! Tu as une bonne compréhension. Consolidons avec des exercices intermédiaires."
            confidence = 0.7
            topics = ["applications pratiques", "problèmes à étapes multiples", "raisonnement déductif"]

        elif composite_score > 0.4:
            next_level = DifficultyLevel.INTERMEDIATE
            feedback = "📚 Tu progresses bien ! Continuons avec des exercices de niveau intermédiaire pour renforcer tes compétences."
            confidence = 0.6
            topics = ["renforcement des bases", "applications simples", "résolution guidée"]

        else:
            next_level = DifficultyLevel.BEGINNER
            feedback = "🔍 Revoyons les bases ensemble. Prends ton temps pour bien comprendre chaque étape."
            confidence = 0.8  # Haute confiance pour recommander les bases
            topics = ["concepts fondamentaux", "exercices guidés", "révision des prérequis"]

        # Ajouter des suggestions basées sur le temps
        if request.time_taken > 600:  # Plus de 10 minutes
            feedback += " Prends ton temps, la compréhension est plus importante que la vitesse."
        elif request.time_taken < 60:  # Moins d'une minute
            feedback += " Rapide ! Assure-toi de bien comprendre avant de passer à la suite."

        # Ajouter des suggestions basées sur les tentatives
        if request.attempts > 3:
            feedback += " Plusieurs tentatives montrent de la persévérance ! N'hésite pas à revoir la théorie."

        return AdaptiveResponse(
            next_difficulty=next_level,
            feedback=feedback,
            confidence=round(confidence, 2),
            suggested_topics=topics
        )

    except Exception as e:
        logger.error(f"Erreur de recommandation adaptative: {e}")

        # Fallback en cas d'erreur
        return AdaptiveResponse(
            next_difficulty=DifficultyLevel.BEGINNER,
            feedback="Utilisation du mode par défaut. Recommandation: commencer par les bases.",
            confidence=0.5,
            suggested_topics=["révision générale", "exercices fondamentaux"]
        )

@router.post("/adaptive/analyze-performance")
async def analyze_performance(request: AdaptiveRequest):
    """
    Analyse détaillée de la performance
    """
    try:
        # Catégoriser la performance
        if request.performance > 0.9:
            category = "excellente"
            color = "green"
            icon = "🏆"
        elif request.performance > 0.7:
            category = "bonne"
            color = "blue"
            icon = "👍"
        elif request.performance > 0.5:
            category = "moyenne"
            color = "yellow"
            icon = "📊"
        elif request.performance > 0.3:
            category = "à améliorer"
            color = "orange"
            icon = "📝"
        else:
            category = "faible"
            color = "red"
            icon = "🔍"

        # Analyser le temps
        time_category = "optimal"
        if request.time_taken > 900:  # > 15 minutes
            time_category = "long"
        elif request.time_taken < 120:  # < 2 minutes
            time_category = "rapide"

        # Analyser les tentatives
        attempts_category = "efficace"
        if request.attempts > 5:
            attempts_category = "persévérant"
        elif request.attempts == 1 and request.performance > 0.8:
            attempts_category = "excellent"

        # Générer des insights
        insights = []

        if request.performance < 0.5:
            insights.append("Des révisions sur les concepts de base seraient bénéfiques.")

        if request.time_taken > 600 and request.performance < 0.7:
            insights.append("Prends le temps de bien comprendre avant de répondre.")

        if request.attempts > 3 and request.performance > 0.7:
            insights.append("Ta persévérance porte ses fruits !")

        if not insights:
            insights.append("Continue sur cette lancée !")

        return {
            "student_id": request.student_id,
            "exercise_id": request.exercise_id,
            "summary": {
                "performance_score": round(request.performance, 2),
                "performance_category": f"{icon} {category}",
                "time_taken_seconds": request.time_taken,
                "time_category": time_category,
                "attempts": request.attempts,
                "attempts_category": attempts_category,
                "overall_assessment": f"{category.capitalize()} performance"
            },
            "analysis": {
                "strengths": self._identify_strengths(request),
                "areas_for_improvement": self._identify_improvements(request),
                "learning_style_insights": self._infer_learning_style(request)
            },
            "recommendations": {
                "immediate_action": insights[0] if insights else "Continuer les exercices",
                "study_strategy": self._suggest_study_strategy(request),
                "practice_focus": self._suggest_practice_focus(request)
            },
            "metadata": {
                "analysis_timestamp": "now",
                "algorithm_version": "1.0",
                "confidence": 0.8
            }
        }

    except Exception as e:
        logger.error(f"Erreur d'analyse de performance: {e}")
        return {
            "error": f"Erreur d'analyse: {str(e)}",
            "fallback_summary": {
                "performance_score": request.performance,
                "recommendation": "Continuer la pratique"
            }
        }

def _identify_strengths(self, request):
    """Identifier les forces de l'étudiant"""
    strengths = []

    if request.performance > 0.8:
        strengths.append("Maîtrise des concepts")

    if request.attempts == 1 and request.performance > 0.7:
        strengths.append("Efficacité dans la résolution")

    if request.time_taken < 300 and request.performance > 0.6:
        strengths.append("Rapidité de compréhension")

    if not strengths:
        strengths.append("Persévérance dans l'apprentissage")

    return strengths

def _identify_improvements(self, request):
    """Identifier les axes d'amélioration"""
    improvements = []

    if request.performance < 0.5:
        improvements.append("Renforcer les bases conceptuelles")

    if request.time_taken > 600:
        improvements.append("Améliorer la gestion du temps")

    if request.attempts > 3:
        improvements.append("Développer des stratégies de résolution")

    if not improvements:
        improvements.append("Maintenir et consolider les acquis")

    return improvements

def _infer_learning_style(self, request):
    """Inférer le style d'apprentissage"""
    if request.attempts > 3 and request.performance > 0.7:
        return "Apprentissage par essai-erreur"
    elif request.time_taken > 600 and request.performance > 0.8:
        return "Apprentissage méthodique et approfondi"
    elif request.time_taken < 300 and request.performance > 0.7:
        return "Apprentissage rapide et intuitif"
    else:
        return "Style d'apprentissage équilibré"

def _suggest_study_strategy(self, request):
    """Suggérer une stratégie d'étude"""
    if request.performance < 0.5:
        return "Étudier les concepts fondamentaux avant de faire des exercices"
    elif request.performance < 0.7:
        return "Pratiquer régulièrement avec des exercices variés"
    else:
        return "Se challenger avec des problèmes complexes"

def _suggest_practice_focus(self, request):
    """Suggérer un focus de pratique"""
    if request.performance < 0.5:
        return "Exercices guidés avec solutions détaillées"
    elif request.performance < 0.8:
        return "Problèmes progressifs avec feedback immédiat"
    else:
        return "Défis complexes et applications réelles"