import logging
from pathlib import Path
import torch
from transformers import TableTransformerForObjectDetection, DetrImageProcessor
from PIL import Image

class TableInference:
    def __init__(self, model_dir='ml/checkpoints/table/Word', device='cpu'):
        self.device = device
        self.model_dir = Path(model_dir)
        self.processor = None
        self.model = None
        self.load_model()
        
    def load_model(self):
        if self.model_dir.exists():
            try:
                self.processor = DetrImageProcessor.from_pretrained(self.model_dir)
                self.model = TableTransformerForObjectDetection.from_pretrained(self.model_dir).to(self.device)
                self.model.eval()
                logging.info(f"Loaded Table model from {self.model_dir}")
            except Exception as e:
                logging.error(f"Failed to load Table model: {e}")
        else:
            logging.warning(f"Table model not found at {self.model_dir}")
            
    def detect_tables(self, image: Image.Image) -> list:
        if self.model is None:
            return []
            
        try:
            inputs = self.processor(images=image, return_tensors="pt").to(self.device)
            with torch.no_grad():
                outputs = self.model(**inputs)
                
            target_sizes = torch.tensor([image.size[::-1]]).to(self.device)
            results = self.processor.post_process_object_detection(outputs, threshold=0.9, target_sizes=target_sizes)[0]
            
            tables = []
            for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
                tables.append({
                    "bbox": box.tolist(),
                    "confidence": score.item(),
                    "label": self.model.config.id2label[label.item()]
                })
            return tables
        except Exception as e:
            logging.error(f"Table detection error: {e}")
            return []
            
    def extract_table_structure(self, table_image: Image.Image) -> dict:
        # Mocking structure extraction
        return {
            "rows": 5,
            "columns": 4,
            "cells": []
        }
        
    def table_to_markdown(self, structure: dict) -> str:
        # Mock markdown generation
        rows = structure.get("rows", 2)
        cols = structure.get("columns", 2)
        
        md = "|" + "|".join([f" Col {i} " for i in range(cols)]) + "|\n"
        md += "|" + "|".join(["---" for _ in range(cols)]) + "|\n"
        for r in range(rows - 1):
            md += "|" + "|".join([f" Data {r},{c} " for c in range(cols)]) + "|\n"
        return md
        
    def table_to_json(self, structure: dict) -> dict:
        return {
            "source_page": 1,
            "structure": structure
        }
