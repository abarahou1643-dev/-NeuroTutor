from fastapi import APIRouter
from src.models.advanced_schemas import AdvancedProblemRequest, AdvancedProblemResponse

router = APIRouter()


@router.post("/solve", response_model=AdvancedProblemResponse)
def solve_advanced(req: AdvancedProblemRequest):
    """
    MVP : suites géométriques avec relation du type u2+u3=2u1
    On retourne q (2 solutions possibles), formule Sn, et application numérique.
    """

    warnings = []
    steps = []

    if req.topic != "geometric_sequence":
        return AdvancedProblemResponse(
            success=False,
            topic=req.topic,
            results={},
            explanation_steps=[],
            warnings=["Topic non supporté pour le moment. Utilise: geometric_sequence"]
        )

    u1 = req.u1
    n = req.n
    relation = req.relation.replace(" ", "")

    # --- support uniquement: u2+u3=2u1 (pour commencer)
    if relation != "u2+u3=2u1":
        return AdvancedProblemResponse(
            success=False,
            topic=req.topic,
            results={},
            explanation_steps=[],
            warnings=["Relation non supportée. Exemple supporté: u2+u3=2u1"]
        )

    if u1 == 0:
        return AdvancedProblemResponse(
            success=False,
            topic=req.topic,
            results={},
            explanation_steps=[],
            warnings=["u1 doit être différent de 0"]
        )

    steps.append("Suite géométrique : u2 = u1*q et u3 = u1*q^2")
    steps.append("Condition : u2 + u3 = 2u1")
    steps.append("Donc : u1*q + u1*q^2 = 2u1")
    steps.append("u1 ≠ 0 ⇒ q + q^2 = 2")
    steps.append("q^2 + q - 2 = 0 ⇒ (q-1)(q+2)=0")
    steps.append("Solutions : q = 1 ou q = -2")

    # Calcul Sn pour q=1 et q=-2
    results = {}

    # q=1
    q1 = 1
    Sn_q1 = n * u1
    results["q=1"] = {
        "q": q1,
        "Sn_formula": "Sn = n*u1",
        "Sn_value": Sn_q1
    }

    # q=-2
    q2 = -2
    # Sn = u1 * (1 - q^n)/(1 - q)
    Sn_q2 = u1 * (1 - (q2 ** n)) / (1 - q2)
    results["q=-2"] = {
        "q": q2,
        "Sn_formula": "Sn = u1*(1-q^n)/(1-q)",
        "Sn_value": Sn_q2
    }

    steps.append(f"Application: u1={u1}, n={n}")
    steps.append(f"Si q=1 ⇒ S{n}={Sn_q1}")
    steps.append(f"Si q=-2 ⇒ S{n}={Sn_q2}")

    return AdvancedProblemResponse(
        success=True,
        topic=req.topic,
        results=results,
        explanation_steps=steps,
        warnings=warnings
    )
