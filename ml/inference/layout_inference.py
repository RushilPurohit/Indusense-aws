import logging
from pathlib import Path
from ultralytics import YOLO
from PIL import Image

CLASS_MAPPING = {
    0: "text", 1: "title", 2: "header", 3: "paragraph", 
    4: "table", 5: "figure", 6: "caption", 7: "list", 8: "section"
}

class LayoutInference:
    def __init__(self, model_path='ml/checkpoints/layout/publaynet/weights/best.pt'):
        self.model_path = Path(model_path)
        self.model = None
        self.load_model()
        
    def load_model(self):
        if self.model_path.exists():
            self.model = YOLO(self.model_path)
            logging.info(f"Loaded Layout model from {self.model_path}")
        else:
            logging.warning(f"Layout model not found at {self.model_path}")
            
    def detect_layout(self, image: Image.Image) -> list:
        if self.model is None:
            return []
            
        try:
            results = self.model(image)[0]
            detections = []
            
            for box in results.boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                xyxy = box.xyxy[0].tolist()
                
                detections.append({
                    "class": CLASS_MAPPING.get(cls_id, "unknown"),
                    "bbox": xyxy,
                    "confidence": conf
                })
                
            return detections
        except Exception as e:
            logging.error(f"Layout detection error: {e}")
            return []
            
    def classify_regions(self, detections: list) -> dict:
        structured = {
            "sections": [],
            "tables": [],
            "figures": [],
            "paragraphs": []
        }
        
        for det in detections:
            cls = det["class"]
            if cls in ["title", "header", "section"]:
                structured["sections"].append(det)
            elif cls == "table":
                structured["tables"].append(det)
            elif cls == "figure":
                structured["figures"].append(det)
            elif cls in ["text", "paragraph", "list"]:
                structured["paragraphs"].append(det)
                
        return structured
