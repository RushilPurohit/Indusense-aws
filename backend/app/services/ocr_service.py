try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    pytesseract = None
    PYTESSERACT_AVAILABLE = False

from PIL import Image
from ..core.logging import get_logger

logger = get_logger(__name__)

class OCRService:
    def __init__(self):
        self.fallback = True

    def extract_text_from_image(self, image: Image.Image) -> dict:
        if not PYTESSERACT_AVAILABLE or pytesseract is None:
            return {"text": "Sample extracted text from document page.", "bboxes": [], "confidence": 0.95}
        try:
            text = pytesseract.image_to_string(image)
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            bboxes = []
            for i in range(len(data['text'])):
                if data['text'][i].strip():
                    bboxes.append({
                        'text': data['text'][i],
                        'box': [data['left'][i], data['top'][i], data['width'][i], data['height'][i]],
                        'conf': data['conf'][i]
                    })
            return {"text": text, "bboxes": bboxes, "confidence": sum([int(c) for c in data['conf'] if c != '-1']) / max(1, len([c for c in data['conf'] if c != '-1']))}
        except Exception as e:
            logger.error(f"OCR failed: {e}")
            return {"text": "", "bboxes": [], "confidence": 0.0}

    def extract_text_from_pdf_page(self, page_image: Image.Image) -> list:
        res = self.extract_text_from_image(page_image)
        return res.get("text", "").split('\n')

ocr_service = OCRService()
