import base64
import io
import re
import os
import logging
from typing import Dict, Any
from PIL import Image
import pytesseract

logger = logging.getLogger(__name__)

# ✅ Lier explicitement Tesseract (important sous Windows)
TESSERACT_CMD = os.getenv("TESSERACT_CMD")
if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
    logger.info(f"Tesseract CMD utilisé : {TESSERACT_CMD}")
else:
    logger.warning("TESSERACT_CMD non défini, OCR peut échouer")


class HandwritingOCR:
    """
    OCR service for processing handwritten or printed math answers
    """

    def __init__(self):
        self.math_patterns = [
            r'\d+[\+\-\*/]\d+',
            r'[=<>≤≥≠≈]',
            r'\^',
            r'sqrt|√',
            r'[a-zA-Z]\s*=\s*\d+',
            r'\d+\.\d+'
        ]

    # =====================================================
    # IMAGE OCR (BASE64)
    # =====================================================
    def process_image_base64(self, image_base64: str) -> Dict[str, Any]:
        try:
            # Decode base64 → image
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))

            # ✅ PRÉTRAITEMENT OCR (TRÈS IMPORTANT)
            gray = image.convert("L")  # niveaux de gris
            bw = gray.point(lambda x: 0 if x < 160 else 255, "1")  # noir/blanc

            # ✅ CONFIG OCR OPTIMISÉ POUR CHIFFRES
            config = "--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789+-=*/."

            raw_text = pytesseract.image_to_string(
                bw,
                lang="eng",
                config=config
            )

            logger.info(f"OCR brut : [{raw_text}]")

            cleaned_text = self._clean_text(raw_text)
            is_math = self._is_mathematical(cleaned_text)

            return {
                "success": True,
                "text": cleaned_text,
                "latex": None,
                "is_math": is_math,
                "confidence": self._calculate_confidence(cleaned_text, is_math)
            }

        except Exception as e:
            logger.error(f"Erreur OCR image : {e}", exc_info=True)
            return {
                "success": False,
                "text": "",
                "latex": None,
                "is_math": False,
                "confidence": 0.0
            }

    # =====================================================
    # TEXTE SIMPLE
    # =====================================================
    def process_text(self, text: str) -> Dict[str, Any]:
        try:
            cleaned_text = self._clean_text(text)
            is_math = self._is_mathematical(cleaned_text)

            return {
                "success": True,
                "text": cleaned_text,
                "latex": None,
                "is_math": is_math,
                "confidence": self._calculate_confidence(cleaned_text, is_math)
            }

        except Exception as e:
            logger.error(f"Erreur OCR texte : {e}", exc_info=True)
            return {
                "success": False,
                "text": text,
                "latex": None,
                "is_math": False,
                "confidence": 0.0
            }

    # =====================================================
    # UTILITAIRES
    # =====================================================
    def _clean_text(self, text: str) -> str:
        if not text:
            return ""

        text = text.strip()
        text = text.replace("O", "0").replace("o", "0")
        text = text.replace("I", "1").replace("l", "1")
        text = re.sub(r"\s+", "", text)

        return text

    def _is_mathematical(self, text: str) -> bool:
        for pattern in self.math_patterns:
            if re.search(pattern, text):
                return True
        return False

    def _calculate_confidence(self, text: str, is_math: bool) -> float:
        if not text:
            return 0.0

        confidence = 0.6
        if is_math:
            confidence += 0.2
        if len(text) >= 2:
            confidence += 0.1

        return min(1.0, confidence)


# ✅ INSTANCE UNIQUE
ocr_processor = HandwritingOCR()
