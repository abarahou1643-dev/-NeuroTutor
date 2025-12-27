import sympy as sp
import re
import numpy as np
from typing import Tuple, Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class MathEvaluator:
    """
    Service for evaluating mathematical answers
    """

    def __init__(self):
        self.symbols = {}

    def evaluate(self, student_answer: str, expected_answer: str) -> Dict[str, Any]:
        """
        Évalue une réponse mathématique
        """
        try:
            # Simplifier les expressions
            student_expr = self._parse_expression(student_answer)
            expected_expr = self._parse_expression(expected_answer)

            if student_expr is None or expected_expr is None:
                return {
                    "is_correct": False,
                    "score": 0.0,
                    "feedback": "Expression mathématique invalide",
                    "hints": ["Vérifie la syntaxe de ta réponse"],
                    "correct_answer": expected_answer
                }

            # Comparer les expressions
            if self._expressions_equal(student_expr, expected_expr):
                return {
                    "is_correct": True,
                    "score": 1.0,
                    "feedback": "✅ Parfait ! La réponse est correcte.",
                    "hints": [],
                    "correct_answer": str(expected_expr)
                }
            else:
                # Calculer un score partiel
                score = self._calculate_similarity_score(student_expr, expected_expr)

                feedback = self._generate_feedback(student_expr, expected_expr, score)
                hints = self._generate_hints(student_expr, expected_expr)

                return {
                    "is_correct": False,
                    "score": round(score, 2),
                    "feedback": feedback,
                    "hints": hints,
                    "correct_answer": str(expected_expr)
                }

        except Exception as e:
            logger.error(f"Erreur d'évaluation: {e}")
            return {
                "is_correct": False,
                "score": 0.0,
                "feedback": f"❌ Erreur d'évaluation: {str(e)}",
                "hints": ["Vérifie le format de ta réponse"],
                "correct_answer": expected_answer
            }

    def _parse_expression(self, expr: str):
        """Parse une expression mathématique avec SymPy"""
        try:
            # Nettoyer l'expression
            expr = expr.strip()

            # Remplacer les symboles français
            replacements = {
                '÷': '/',
                '×': '*',
                '²': '**2',
                '³': '**3',
                '√': 'sqrt',
                'π': 'pi',
                '∞': 'oo',
                '≠': '!=',
                '≤': '<=',
                '≥': '>=',
                '≈': '~='
            }

            for old, new in replacements.items():
                expr = expr.replace(old, new)

            # Parser avec SymPy
            return sp.sympify(expr, evaluate=False)
        except Exception as e:
            logger.debug(f"Failed to parse expression: {expr}, error: {e}")
            return None

    def _expressions_equal(self, expr1, expr2, tolerance=0.001):
        """Compare deux expressions mathématiques"""
        try:
            # Calculer la différence
            diff = sp.simplify(expr1 - expr2)

            # Vérifier si la différence est nulle ou proche de zéro
            if diff.is_constant():
                return abs(float(diff.evalf())) < tolerance

            # Vérifier l'égalité symbolique
            return expr1.equals(expr2)
        except:
            return False

    def _calculate_similarity_score(self, student_expr, expected_expr):
        """Calcule un score de similarité entre 0 et 1"""
        try:
            # Similarité symbolique
            if self._expressions_equal(student_expr, expected_expr, tolerance=0.01):
                return 0.95

            # Vérifier les erreurs communes
            common_errors = self._detect_common_errors(student_expr, expected_expr)
            if common_errors:
                if "sign_error" in common_errors:
                    return 0.7
                elif "coefficient_error" in common_errors:
                    return 0.6
                elif "parentheses_error" in common_errors:
                    return 0.8

            # Similarité numérique pour les constantes
            if student_expr.is_constant() and expected_expr.is_constant():
                val1 = float(student_expr.evalf())
                val2 = float(expected_expr.evalf())
                if val2 != 0:
                    return max(0, 1 - abs(val1 - val2) / abs(val2))

            # Similarité structurelle basique
            student_str = str(student_expr)
            expected_str = str(expected_expr)

            if student_str == expected_str:
                return 0.9

            # Calculer la similarité des tokens
            student_tokens = set(re.findall(r'[a-zA-Z]+|\d+|[+\-*/()^]', student_str))
            expected_tokens = set(re.findall(r'[a-zA-Z]+|\d+|[+\-*/()^]', expected_str))

            if student_tokens and expected_tokens:
                intersection = student_tokens.intersection(expected_tokens)
                union = student_tokens.union(expected_tokens)
                return len(intersection) / len(union)

            return 0.3

        except Exception as e:
            logger.debug(f"Error calculating similarity: {e}")
            return 0.2

    def _detect_common_errors(self, student_expr, expected_expr):
        """Détecte les erreurs mathématiques courantes"""
        errors = []

        try:
            # Erreur de signe
            if self._expressions_equal(student_expr, -expected_expr):
                errors.append("sign_error")

            # Erreur de coefficient constant
            if self._is_constant_multiple(student_expr, expected_expr):
                errors.append("coefficient_error")

            # Oubli de parenthèses
            student_str = str(student_expr).replace('(', '').replace(')', '')
            expected_str = str(expected_expr).replace('(', '').replace(')', '')
            if student_str == expected_str and '(' in str(expected_expr):
                errors.append("parentheses_error")

            # Erreur d'exposant
            if self._is_power_error(student_expr, expected_expr):
                errors.append("exponent_error")

        except Exception as e:
            logger.debug(f"Error in common error detection: {e}")

        return errors

    def _is_constant_multiple(self, expr1, expr2):
        """Vérifie si expr1 = k * expr2 pour une constante k"""
        try:
            ratio = sp.simplify(expr1 / expr2)
            return ratio.is_constant() and not ratio.equals(1) and not ratio.equals(-1)
        except:
            return False

    def _is_power_error(self, expr1, expr2):
        """Vérifie les erreurs d'exposant"""
        try:
            # Vérifier si c'est une erreur de carré/cube
            if expr2.is_Pow:
                if expr1.equals(expr2.base):
                    return True
            return False
        except:
            return False

    def _generate_feedback(self, student_expr, expected_expr, score):
        """Génère un feedback personnalisé"""
        if score > 0.9:
            return "✅ Excellent ! La réponse est presque parfaite."
        elif score > 0.7:
            return "👍 Bon travail ! Tu es très proche de la solution."
        elif score > 0.5:
            return "⚠️ Presque ! Il reste une petite erreur à corriger."
        elif score > 0.3:
            return "📝 Attention, il y a une erreur dans ton calcul."
        else:
            return "❌ Il y a une incompréhension du concept. Revois la leçon."

    def _generate_hints(self, student_expr, expected_expr):
        """Génère des indices pour aider l'étudiant"""
        hints = []

        # Détecter le type d'erreur
        errors = self._detect_common_errors(student_expr, expected_expr)

        if "sign_error" in errors:
            hints.append("Vérifie le signe (+/-) devant ton expression")

        if "coefficient_error" in errors:
            hints.append("Attention au coefficient multiplicatif")

        if "parentheses_error" in errors:
            hints.append("N'oublie pas les parenthèses pour les opérations prioritaires")

        if "exponent_error" in errors:
            hints.append("Vérifie la puissance (exposant) de ton expression")

        if not hints:
            # Indices généraux
            hints.append("Revérifie chaque étape de ton calcul")
            hints.append("Essaie de simplifier ton expression étape par étape")
            hints.append("Vérifie les règles de priorité des opérations")

        return hints[:3]  # Maximum 3 indices

# Singleton instance
math_evaluator = MathEvaluator()

# Test function
def test_math_evaluator():
    """Test the math evaluator"""
    evaluator = MathEvaluator()

    test_cases = [
        ("2+2", "4", True),
        ("x^2 + 2x + 1", "(x+1)^2", True),
        ("3*4", "12", True),
        ("2+2", "5", False),
        ("x+1", "x-1", False),
    ]

    for student, expected, should_be_correct in test_cases:
        result = evaluator.evaluate(student, expected)
        print(f"Student: {student}, Expected: {expected}")
        print(f"Result: {result}")
        print(f"Correct: {result['is_correct'] == should_be_correct}")
        print("-" * 50)

if __name__ == "__main__":
    test_math_evaluator()