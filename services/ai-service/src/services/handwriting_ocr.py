import base64
import io
import re
from typing import Dict, Any, Optional, Tuple
import logging
from PIL import Image

logger = logging.getLogger(__name__)

class HandwritingOCR:
    """
    OCR service for processing handwritten text
    Note: Full OCR requires Tesseract installation
    """

    def __init__(self):
        self.math_patterns = [
            r'\d+[\+\-\*/]\d+',  # Basic operations: 2+2, 3*4
            r'[=<>≤≥≠≈]',         # Comparisons
            r'[\(\)\[\]\{\}]',    # Parentheses and brackets
            r'\^',                # Exponents
            r'sqrt|√|sin|cos|tan|log|ln|exp|pi|π|inf|∞',  # Functions and constants
            r'[a-zA-Z][a-zA-Z0-9]*\s*=',  # Variable assignment: x=2
            r'\d+\.\d+',          # Decimal numbers
            r'[a-zA-Z]\^?\d*',    # Variables with exponents: x^2
        ]

        # Common OCR corrections
        self.ocr_corrections = {
            'O': '0',
            'o': '0',
            'l': '1',
            'I': '1',
            'i': '1',
            'Z': '2',
            'z': '2',
            'S': '5',
            's': '5',
            'B': '8',
            'b': '6',
            'g': '9',
            'q': '9',
        }

    def process_image_base64(self, image_base64: str) -> Dict[str, Any]:
        """
        Process base64 encoded image (placeholder - requires Tesseract)
        """
        try:
            # Decode base64
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))

            # For now, return placeholder data
            # In production, you would use:
            # import pytesseract
            # text = pytesseract.image_to_string(image, config='--psm 6')

            return {
                "success": True,
                "text": "[OCR functionality requires Tesseract installation]",
                "is_math": False,
                "confidence": 0.0,
                "width": image.width,
                "height": image.height,
                "format": image.format
            }

        except Exception as e:
            logger.error(f"Error processing image: {e}")
            return {
                "success": False,
                "text": "",
                "is_math": False,
                "confidence": 0.0,
                "error": str(e)
            }

    def process_text(self, text: str) -> Dict[str, Any]:
        """
        Process text input (clean and analyze)
        """
        try:
            if not text or not text.strip():
                return {
                    "success": True,
                    "text": "",
                    "is_math": False,
                    "confidence": 0.0
                }

            # Clean the text
            cleaned_text = self._clean_text(text)

            # Check if it's mathematical
            is_math = self._is_mathematical(cleaned_text)

            # Convert to LaTeX if mathematical
            latex = self._convert_to_latex(cleaned_text) if is_math else None

            # Calculate confidence (simplified)
            confidence = self._calculate_confidence(cleaned_text, is_math)

            return {
                "success": True,
                "text": cleaned_text,
                "latex": latex,
                "is_math": is_math,
                "confidence": confidence,
                "original_length": len(text),
                "cleaned_length": len(cleaned_text)
            }

        except Exception as e:
            logger.error(f"Error processing text: {e}")
            return {
                "success": False,
                "text": text,
                "is_math": False,
                "confidence": 0.0,
                "error": str(e)
            }

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = ' '.join(text.split())

        # Apply OCR corrections
        for wrong, correct in self.ocr_corrections.items():
            text = text.replace(wrong, correct)

        # Fix common math notation issues
        corrections = {
            'x times': 'x*',
            'divided by': '/',
            'plus': '+',
            'minus': '-',
            'equals': '=',
            'squared': '^2',
            'cubed': '^3',
            'square root': 'sqrt',
            'pi': 'π',
            'infinity': '∞',
        }

        for phrase, symbol in corrections.items():
            text = text.replace(phrase, symbol)

        return text.strip()

    def _is_mathematical(self, text: str) -> bool:
        """Check if text contains mathematical expressions"""
        text_lower = text.lower()

        # Check for math patterns
        for pattern in self.math_patterns:
            if re.search(pattern, text_lower):
                return True

        # Check for common math notation
        math_indicators = ['=', '+', '-', '*', '/', '^', 'sqrt', 'π', '∞']
        if any(indicator in text for indicator in math_indicators):
            return True

        # Check for variable assignments
        if re.search(r'[a-zA-Z]\s*=\s*[\d\.]+', text):
            return True

        return False

    def _convert_to_latex(self, text: str) -> str:
        """Convert mathematical text to LaTeX notation"""
        latex = text

        # Basic conversions
        conversions = [
            (r'(\d+)\^(\d+)', r'\1^{\2}'),  # Exponents: 2^3 -> 2^{3}
            (r'sqrt\(([^)]+)\)', r'\\sqrt{\1}'),  # sqrt(x) -> \sqrt{x}
            (r'√\(([^)]+)\)', r'\\sqrt{\1}'),  # √(x) -> \sqrt{x}
            (r'(\d+)/(\d+)', r'\\frac{\1}{\2}'),  # Fractions: 1/2 -> \frac{1}{2}
            (r'π', r'\\pi'),  # pi -> \pi
            (r'∞', r'\\infty'),  # infinity -> \infty
            (r'(\w+)\(([^)]+)\)', r'\\operatorname{\1}{\2}'),  # sin(x) -> \operatorname{sin}{x}
            (r'(\d+)\.(\d+)', r'\1.\2'),  # Keep decimals
            (r'([a-zA-Z])\^2', r'\1^{2}'),  # x^2 -> x^{2}
            (r'([a-zA-Z])\^3', r'\1^{3}'),  # x^3 -> x^{3}
        ]

        for pattern, replacement in conversions:
            latex = re.sub(pattern, replacement, latex)

        # Add $ $ for inline math
        if latex and not latex.startswith('$'):
            latex = f'${latex}$'

        return latex

    def _calculate_confidence(self, text: str, is_math: bool) -> float:
        """Calculate confidence score for OCR result"""
        confidence = 0.5  # Base confidence

        # Length factor
        if len(text) > 5:
            confidence += min(0.2, len(text) / 100)

        # Mathematical content factor
        if is_math:
            confidence += 0.1

        # Pattern matching factor
        math_pattern_count = 0
        for pattern in self.math_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                math_pattern_count += 1

        if math_pattern_count > 0:
            confidence += min(0.2, math_pattern_count / 10)

        # Return normalized confidence
        return min(1.0, confidence)

# Singleton instance
ocr_processor = HandwritingOCR()

# Test function
def test_ocr_processor():
    """Test the OCR processor"""
    processor = HandwritingOCR()

    test_texts = [
        "2 + 2 = 4",
        "x^2 + 3x + 2 = 0",
        "sqrt(16) = 4",
        "Ceci n'est pas une expression mathématique",
        "1/2 + 1/3 = 5/6",
        "π ≈ 3.14159",
    ]

    for text in test_texts:
        print(f"\nProcessing: {text}")
        result = processor.process_text(text)
        for key, value in result.items():
            if key not in ['success', 'original_length', 'cleaned_length', 'error']:
                print(f"  {key}: {value}")

if __name__ == "__main__":
    test_ocr_processor()