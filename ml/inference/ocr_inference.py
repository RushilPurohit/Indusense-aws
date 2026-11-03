import logging
from pathlib import Path
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image

class OCRInference:
    def __init__(self, model_dir='ml/checkpoints/ocr/funsd', device='cpu'):
        self.device = device
        self.model_dir = Path(model_dir)
        self.processor = None
        self.model = None
        self.load_model()
        
    def load_model(self):
        if self.model_dir.exists():
            try:
                self.processor = TrOCRProcessor.from_pretrained(self.model_dir)
                self.model = VisionEncoderDecoderModel.from_pretrained(self.model_dir).to(self.device)
                self.model.eval()
                logging.info(f"Loaded OCR model from {self.model_dir}")
            except Exception as e:
                logging.error(f"Failed to load OCR model: {e}")
        else:
            logging.warning(f"OCR model not found at {self.model_dir}")
            
    def extract_text(self, image: Image.Image) -> dict:
        if self.model is None:
            return {"error": "Model not loaded"}
            
        try:
            # We would normally use tesseract for bboxes, then trocr on crops.
            # For this simple inference block, we run TrOCR on the whole image 
            # (assuming it's already cropped to a line).
            pixel_values = self.processor(image.convert("RGB"), return_tensors="pt").pixel_values.to(self.device)
            
            with torch.no_grad():
                generated_ids = self.model.generate(pixel_values)
                
            text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            return {
                "text": text,
                "confidence": 0.95, # Mock confidence as TrOCR doesn't output it natively without logits
                "bboxes": []
            }
        except Exception as e:
            return {"error": str(e)}
            
    def extract_from_pdf_page(self, page_image: Image.Image) -> list:
        # Mock implementation of whole page OCR - would require layout analysis first
        return [{"text": self.extract_text(page_image).get("text", "")}]
