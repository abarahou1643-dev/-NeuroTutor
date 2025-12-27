import re
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from typing import List, Dict, Any, Set, Tuple
import logging

# Download NLTK data if not present
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

logger = logging.getLogger(__name__)

class NLPProcessor:
    """
    Natural Language Processing for text answers
    """

    def __init__(self):
        try:
            self.stop_words_fr = set(stopwords.words('french'))
        except:
            self.stop_words_fr = set(['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'où', 'que', 'qui', 'quoi'])

        self.math_keywords = {
            'calculer', 'résoudre', 'trouver', 'déterminer', 'montrer',
            'prouver', 'démontrer', 'vérifier', 'simplifier', 'factoriser',
            'développer', 'dériver', 'intégrer', 'limite', 'somme',
            'produit', 'équation', 'inéquation', 'système', 'vecteur',
            'matrice', 'probabilité', 'statistique', 'géométrie',
            'théorème', 'formule', 'variable', 'constante', 'fonction'
        }

        self.reasoning_indicators = {
            'car', 'donc', 'alors', 'puisque', 'ainsi', 'parce', 'si',
            'alors', 'ensuite', 'finalement', 'conclusion', 'hypothèse'
        }

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze mathematical text for quality assessment
        """
        if not text or not text.strip():
            return {
                "word_count": 0,
                "sentence_count": 0,
                "keyword_count": 0,
                "has_math_keywords": False,
                "has_reasoning": False,
                "complexity_score": 0.0,
                "keywords": []
            }

        try:
            # Preprocess
            cleaned = self._preprocess(text)

            # Tokenize
            sentences = sent_tokenize(text, language='french')
            words = word_tokenize(cleaned, language='french')

            # Extract keywords
            keywords = self._extract_keywords(words)

            # Check for mathematical content
            has_math = any(kw in self.math_keywords for kw in keywords)

            # Check for reasoning
            has_reasoning = any(ind in text.lower() for ind in self.reasoning_indicators)

            # Calculate complexity
            complexity = self._calculate_complexity(text, words, sentences)

            return {
                "word_count": len(words),
                "sentence_count": len(sentences),
                "keyword_count": len(keywords),
                "has_math_keywords": has_math,
                "has_reasoning": has_reasoning,
                "complexity_score": round(complexity, 2),
                "keywords": list(keywords)[:15]
            }

        except Exception as e:
            logger.error(f"Error in NLP analysis: {e}")
            return {
                "word_count": 0,
                "sentence_count": 0,
                "keyword_count": 0,
                "has_math_keywords": False,
                "has_reasoning": False,
                "complexity_score": 0.0,
                "keywords": [],
                "error": str(e)
            }

    def _preprocess(self, text: str) -> str:
        """Clean and normalize text"""
        # Convert to lowercase
        text = text.lower().strip()

        # Remove special characters but keep French accents and math symbols
        text = re.sub(r'[^\w\sàâäéèêëîïôöùûüç\+\-\*/=()\[\]{}<>^√π∞≈≠≤≥.,:;!?]', ' ', text)

        # Normalize whitespace
        text = ' '.join(text.split())

        return text

    def _extract_keywords(self, tokens: List[str]) -> Set[str]:
        """Extract meaningful keywords from tokens"""
        keywords = set()

        for token in tokens:
            # Remove stopwords and short tokens
            if (token not in self.stop_words_fr and
                len(token) > 2 and
                token.isalpha()):
                keywords.add(token)

        return keywords

    def _calculate_complexity(self, text: str, words: List[str], sentences: List[str]) -> float:
        """Calculate text complexity score (0-1)"""
        if not words or not sentences:
            return 0.0

        # Word complexity
        avg_word_len = sum(len(word) for word in words) / len(words)
        word_complexity = min(1.0, avg_word_len / 10)

        # Sentence complexity
        avg_sent_len = len(words) / len(sentences)
        sent_complexity = min(1.0, avg_sent_len / 25)

        # Vocabulary diversity
        unique_words = len(set(words))
        vocab_diversity = min(1.0, unique_words / len(words))

        # Mathematical content bonus
        math_bonus = 0.2 if any(kw in self.math_keywords for kw in words) else 0.0

        # Reasoning bonus
        reasoning_bonus = 0.1 if any(ind in text.lower() for ind in self.reasoning_indicators) else 0.0

        # Calculate final score
        complexity = (
            word_complexity * 0.3 +
            sent_complexity * 0.3 +
            vocab_diversity * 0.2 +
            math_bonus +
            reasoning_bonus
        )

        return min(1.0, complexity)

    def generate_feedback(self, student_answer: str, expected_answer: str = None) -> str:
        """
        Generate personalized feedback based on text analysis
        """
        analysis = self.analyze_text(student_answer)

        # Base feedback
        feedback_parts = []

        # Word count feedback
        if analysis["word_count"] < 10:
            feedback_parts.append("Ta réponse est très courte.")
        elif analysis["word_count"] < 30:
            feedback_parts.append("Ta réponse est concise.")
        else:
            feedback_parts.append("Ta réponse est bien développée.")

        # Mathematical content feedback
        if analysis["has_math_keywords"]:
            feedback_parts.append("Tu utilises bien le vocabulaire mathématique.")
        else:
            feedback_parts.append("Essaie d'utiliser plus de termes mathématiques précis.")

        # Reasoning feedback
        if analysis["has_reasoning"]:
            feedback_parts.append("Ton raisonnement est clair et structuré.")
        else:
            feedback_parts.append("Ajoute des connecteurs logiques pour structurer ton raisonnement.")

        # Complexity feedback
        if analysis["complexity_score"] > 0.7:
            feedback_parts.append("Niveau de détail excellent !")
        elif analysis["complexity_score"] > 0.4:
            feedback_parts.append("Bon niveau de détail.")
        else:
            feedback_parts.append("Tu pourrais développer davantage ta réponse.")

        # Join feedback
        feedback = " ".join(feedback_parts)

        # Add specific suggestions
        if analysis["keyword_count"] < 5:
            feedback += " Utilise plus de mots-clés spécifiques au sujet."

        return feedback

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate semantic similarity between two texts (Jaccard index)
        """
        try:
            # Preprocess both texts
            cleaned1 = self._preprocess(text1)
            cleaned2 = self._preprocess(text2)

            # Tokenize
            tokens1 = set(word_tokenize(cleaned1, language='french'))
            tokens2 = set(word_tokenize(cleaned2, language='french'))

            # Remove stopwords
            tokens1 = {t for t in tokens1 if t not in self.stop_words_fr and len(t) > 2}
            tokens2 = {t for t in tokens2 if t not in self.stop_words_fr and len(t) > 2}

            # Calculate Jaccard similarity
            if not tokens1 and not tokens2:
                return 0.0

            intersection = tokens1.intersection(tokens2)
            union = tokens1.union(tokens2)

            return len(intersection) / len(union) if union else 0.0

        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            return 0.0

# Singleton instance
nlp_processor = NLPProcessor()

# Test function
def test_nlp_processor():
    """Test the NLP processor"""
    processor = NLPProcessor()

    test_texts = [
        "Pour résoudre cette équation, je dois d'abord factoriser le polynôme.",
        "La réponse est 42.",
        "Dans un triangle rectangle, le carré de l'hypothénuse est égal à la somme des carrés des deux autres côtés selon le théorème de Pythagore.",
        "Je ne sais pas.",
    ]

    for text in test_texts:
        print(f"\nAnalyzing: {text[:50]}...")
        result = processor.analyze_text(text)
        for key, value in result.items():
            if key != "keywords":
                print(f"  {key}: {value}")

        feedback = processor.generate_feedback(text)
        print(f"  Feedback: {feedback}")

if __name__ == "__main__":
    test_nlp_processor()