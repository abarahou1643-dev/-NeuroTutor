from fastapi import APIRouter
from src.models.schemas import EvaluationRequest, EvaluationResponse, DifficultyLevel
from src.services.math_evaluator import math_evaluator
from src.services.nlp_processor import nlp_processor

router = APIRouter()

def build_detailed_explanation(student: str, expected: str, eval_result: dict):
    """
    Fabrique une explication détaillée (pédagogique) + étapes simples.
    """
    steps = []
    explanation = ""

    # Cas correct
    if eval_result.get("is_correct"):
        explanation = "✅ Bonne réponse ! Ton résultat est correct."
        steps = [
            "Tu as appliqué la bonne méthode.",
            "Ton calcul final correspond à la réponse attendue."
        ]
        return explanation, steps

    # Cas incorrect
    explanation = "❌ Réponse incorrecte. Voici la correction étape par étape :"
    steps = [
        "1) Reprends l’expression et simplifie-la.",
        "2) Vérifie les priorités opératoires (parenthèses, puissances, multiplications...).",
        "3) Compare ton résultat avec la solution attendue.",
        "4) Corrige l’étape où tu as divergé."
    ]

    # Ajouter des indices de ton evaluator si existants
    hints = eval_result.get("hints", [])
    if hints:
        steps += [f"Indice : {h}" for h in hints]

    return explanation, steps


@router.post("/evaluate", response_model=EvaluationResponse)
def evaluate(req: EvaluationRequest):
    """
    Évalue une réponse : math / text / code (MVP : math + text)
    Renvoie : correct/score + feedback + hints + correct_answer + explication détaillée
    """
    answer_type = (req.answer_type or "math").lower()

    # 1) Évaluation math (SymPy)
    if answer_type == "math":
        eval_result = math_evaluator.evaluate(req.student_answer, req.expected_answer)

        explanation, steps = build_detailed_explanation(
            req.student_answer, req.expected_answer, eval_result
        )

        # Feedback final = feedback + explication détaillée (propre pour UI)
        feedback = (
            f"{eval_result.get('feedback','')}\n\n"
            f"{explanation}\n"
            + "\n".join(steps)
        )

        return EvaluationResponse(
            is_correct=eval_result.get("is_correct", False),
            score=float(eval_result.get("score", 0.0)),
            feedback=feedback,
            hints=eval_result.get("hints", []),
            correct_answer=eval_result.get("correct_answer", req.expected_answer),
            next_difficulty=None,  # optionnel
            confidence=0.85 if eval_result.get("is_correct") else 0.70,
            metadata={
                "type": "math",
                "steps": steps
            }
        )

    # 2) Évaluation texte (NLP)
    if answer_type == "text":
        # Similarité simple (si tu fournis expected_answer en texte)
        similarity = 0.0
        if req.expected_answer:
            similarity = nlp_processor.calculate_similarity(req.student_answer, req.expected_answer)

        is_correct = similarity >= 0.65  # seuil MVP
        feedback = nlp_processor.generate_feedback(req.student_answer, req.expected_answer)

        detailed = (
            f"{'✅ Réponse acceptable' if is_correct else '❌ Réponse insuffisante'}\n"
            f"Similarité estimée : {round(similarity,2)}\n\n"
            f"{feedback}"
        )

        return EvaluationResponse(
            is_correct=is_correct,
            score=float(similarity),
            feedback=detailed,
            hints=[
                "Ajoute des étapes de raisonnement (donc, car, alors…).",
                "Utilise du vocabulaire mathématique précis."
            ],
            correct_answer=req.expected_answer,
            next_difficulty=None,
            confidence=0.70,
            metadata={
                "type": "text",
                "similarity": similarity
            }
        )

    # 3) Autres types pas encore activés
    return EvaluationResponse(
        is_correct=False,
        score=0.0,
        feedback="Type de réponse non supporté pour le moment (MVP).",
        hints=["Utilise answer_type = 'math' ou 'text'"],
        correct_answer=req.expected_answer,
        next_difficulty=None,
        confidence=0.3,
        metadata={"type": answer_type}
    )
