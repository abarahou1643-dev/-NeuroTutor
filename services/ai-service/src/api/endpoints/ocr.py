from fastapi import APIRouter
from src.models.schemas import OCRRequest, OCRResponse
from src.services.handwriting_ocr import ocr_processor
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/ocr/process", response_model=OCRResponse)
async def process_ocr(request: OCRRequest):
    """
    Traite du texte ou une image avec OCR
    """
    try:
        if request.image_base64:
            # Traitement d'image (OCR complet)
            logger.info("Traitement OCR d'image base64")
            result = ocr_processor.process_image_base64(request.image_base64)
        else:
            # Traitement de texte simple
            logger.info(f"Traitement OCR de texte: {request.text[:50]}...")
            result = ocr_processor.process_text(request.text)

        return OCRResponse(**result)

    except Exception as e:
        logger.error(f"Erreur OCR: {e}", exc_info=True)
        return OCRResponse(
            text=request.text if request.text else "",
            is_math=False,
            confidence=0.0,
            success=False
        )

@router.post("/ocr/analyze")
async def analyze_ocr(request: OCRRequest):
    """
    Analyse approfondie du texte OCR
    """
    try:
        # Utiliser le texte fourni ou traiter l'image
        text_to_analyze = request.text
        if not text_to_analyze and request.image_base64:
            ocr_result = ocr_processor.process_image_base64(request.image_base64)
            text_to_analyze = ocr_result.get("text", "")

        if not text_to_analyze:
            return {
                "success": False,
                "error": "Aucun texte à analyser",
                "analysis": {}
            }

        # Analyser le texte
        result = ocr_processor.process_text(text_to_analyze)

        # Analyse supplémentaire
        from src.services.math_evaluator import math_evaluator

        # Vérifier si c'est une expression mathématique valide
        is_valid_math = False
        try:
            expr = math_evaluator._parse_expression(text_to_analyze)
            is_valid_math = expr is not None
        except:
            is_valid_math = False

        # Compter les symboles mathématiques
        math_symbols = ['+', '-', '*', '/', '=', '^', '√', 'π', '∞']
        symbol_count = sum(text_to_analyze.count(sym) for sym in math_symbols)

        # Identifier le type de contenu
        content_type = "unknown"
        if result["is_math"]:
            if '=' in text_to_analyze:
                content_type = "equation"
            elif any(op in text_to_analyze for op in ['+', '-', '*', '/']):
                content_type = "expression"
            elif '^' in text_to_analyze or 'sqrt' in text_to_analyze:
                content_type = "function"
            else:
                content_type = "math_text"
        else:
            # Analyser avec NLP
            from src.services.nlp_processor import nlp_processor
            nlp_analysis = nlp_processor.analyze_text(text_to_analyze)
            if nlp_analysis.get("has_math_keywords", False):
                content_type = "math_explanation"
            else:
                content_type = "plain_text"

        return {
            "success": True,
            "original_text": text_to_analyze,
            "processed_text": result["text"],
            "latex": result.get("latex"),
            "content_type": content_type,
            "is_mathematical": result["is_math"],
            "is_valid_math_expression": is_valid_math,
            "confidence": result["confidence"],
            "symbol_count": symbol_count,
            "length": len(text_to_analyze),
            "word_count": len(text_to_analyze.split()),
            "analysis": {
                "ocr_confidence": result["confidence"],
                "math_detection_confidence": 0.8 if result["is_math"] else 0.2,
                "complexity": min(1.0, symbol_count / 10 + len(text_to_analyze) / 100)
            }
        }

    except Exception as e:
        logger.error(f"Erreur d'analyse OCR: {e}")
        return {
            "success": False,
            "error": str(e),
            "analysis": {}
        }

@router.get("/ocr/capabilities")
async def get_ocr_capabilities():
    """
    Retourne les capacités du service OCR
    """
    return {
        "service": "neurotutor-ocr",
        "version": "1.0.0",
        "capabilities": {
            "text_processing": True,
            "image_processing": True,  # Avec Tesseract installé
            "math_detection": True,
            "latex_conversion": True,
            "handwriting_support": "partial",  # Dépend de Tesseract
            "language_support": ["fr", "en"],
            "confidence_scoring": True
        },
        "dependencies": {
            "tesseract": "required_for_full_ocr",
            "pil": "required",
            "sympy": "required_for_math_analysis"
        },
        "status": "operational"
    }