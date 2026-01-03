from fastapi import APIRouter
from src.models.schemas import (
    EvaluationRequest,
    EvaluationResponse,
    StepEvaluationRequest,
    StepEvaluationResponse,
    StepFeedback
)
from src.services.math_evaluator import math_evaluator
from src.services.nlp_processor import nlp_processor

router = APIRouter()


def build_detailed_explanation(student: str, expected: str, eval_result: dict):
    steps = []
    explanation = ""

    if eval_result.get("is_correct"):
        explanation = "✅ Bonne réponse ! Ton résultat est correct."
        steps = [
            "Tu as appliqué la bonne méthode.",
            "Ton calcul final correspond à la réponse attendue."
        ]
        return explanation, steps

    explanation = "❌ Réponse incorrecte. Voici la correction étape par étape :"
    steps = [
        "1) Reprends l’expression et simplifie-la.",
        "2) Vérifie les priorités opératoires (parenthèses, puissances, multiplications…).",
        "3) Compare ton résultat avec la solution attendue.",
        "4) Corrige l’étape où tu as divergé."
    ]

    hints = eval_result.get("hints", [])
    if hints:
        steps += [f"Indice : {h}" for h in hints]

    return explanation, steps


@router.post("/evaluate", response_model=EvaluationResponse)
def evaluate(req: EvaluationRequest):
    answer_type = (req.answer_type or "math").lower()

    # ---------- MATH ----------
    if answer_type == "math":
        eval_result = math_evaluator.evaluate(req.student_answer, req.expected_answer)

        explanation, steps = build_detailed_explanation(
            req.student_answer,
            req.expected_answer,
            eval_result
        )

        feedback = (
            f"{eval_result.get('feedback', '')}\n\n"
            f"{explanation}\n"
            + "\n".join(steps)
        )

        return EvaluationResponse(
            is_correct=eval_result.get("is_correct", False),
            score=float(eval_result.get("score", 0.0)),
            feedback=feedback,
            hints=eval_result.get("hints", []),
            correct_answer=eval_result.get("correct_answer", req.expected_answer),
            next_difficulty=None,
            confidence=0.85 if eval_result.get("is_correct") else 0.70,
            metadata={"type": "math", "steps": steps}
        )

    # ---------- TEXT ----------
    if answer_type == "text":
        similarity = 0.0
        if req.expected_answer:
            similarity = nlp_processor.calculate_similarity(req.student_answer, req.expected_answer)

        is_correct = similarity >= 0.65
        fb = nlp_processor.generate_feedback(req.student_answer, req.expected_answer)

        detailed = (
            f"{'✅ Réponse acceptable' if is_correct else '❌ Réponse insuffisante'}\n"
            f"Similarité estimée : {round(similarity, 2)}\n\n"
            f"{fb}"
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
            metadata={"type": "text", "similarity": similarity}
        )

    return EvaluationResponse(
        is_correct=False,
        score=0.0,
        feedback="Type de réponse non supporté pour le moment.",
        hints=["Utilise answer_type = 'math' ou 'text'"],
        correct_answer=req.expected_answer,
        next_difficulty=None,
        confidence=0.3,
        metadata={"type": answer_type}
    )


@router.post("/evaluate-steps", response_model=StepEvaluationResponse)
def evaluate_steps(req: StepEvaluationRequest):
    """
    ✅ Compare chaque étape avec expected_steps[i] si fourni
    sinon fallback compare avec expected_answer.
    """
    steps_feedback = []
    total_score = 0.0

    # normaliser expected_answer : "x=4" -> "4"
    expected_norm = req.expected_answer
    if expected_norm and "=" in expected_norm:
        expected_norm = expected_norm.split("=")[-1].strip()

    expected_steps = req.expected_steps or []

    for i, step in enumerate(req.steps):

        # ✅ reference par étape si disponible
        if i < len(expected_steps) and expected_steps[i]:
            ref = expected_steps[i]
        else:
            ref = expected_norm

        # normaliser ref : "x=5" -> "5"
        ref_norm = ref
        if ref_norm and "=" in ref_norm:
            ref_norm = ref_norm.split("=")[-1].strip()

        # éviter blocage sur "x=..."
        step_to_eval = step
        if "=" in step_to_eval:
            step_to_eval = step_to_eval.split("=")[-1].strip()

        result = math_evaluator.evaluate(step_to_eval, ref_norm)

        is_correct = bool(result.get("is_correct", False))
        score = float(result.get("score", 0.0))
        total_score += score

        hint = None
        corrected = None
        if not is_correct:
            hints = result.get("hints", [])
            hint = hints[0] if hints else "Vérifie cette étape."
            corrected = result.get("correct_answer", ref_norm)

        steps_feedback.append(
            StepFeedback(
                index=i,
                step=step,
                is_correct=is_correct,
                hint=hint,
                corrected_step=corrected
            )
        )

    global_score = total_score / max(1, len(req.steps))

    if expected_steps:
        generated_solution_steps = expected_steps + [f"Réponse attendue : {req.expected_answer}"]
    else:
        generated_solution_steps = [
            "1) Réécris l’équation clairement.",
            "2) Isole la variable étape par étape.",
            "3) Simplifie en faisant attention aux signes.",
            "4) Vérifie le résultat en remplaçant.",
            f"Réponse attendue : {req.expected_answer}"
        ]

    return StepEvaluationResponse(
        global_score=round(global_score, 2),
        steps_feedback=steps_feedback,
        generated_solution_steps=generated_solution_steps,
        correct_answer=req.expected_answer
    )
