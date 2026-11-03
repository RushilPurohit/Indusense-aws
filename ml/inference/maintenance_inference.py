import json
import logging
from pathlib import Path
import numpy as np
import pandas as pd
import torch
try:
    import xgboost as xgb
except ImportError:
    xgb = None
import joblib
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))
from training.train_maintenance import CNNLSTM

class MaintenanceInference:
    def __init__(self, checkpoints_dir='ml/checkpoints/maintenance', device='cpu'):
        self.device = device
        self.checkpoints_dir = Path(checkpoints_dir)
        self.ai4i_model = None
        self.cmapss_model = None
        self.load_models()
        
    def load_models(self):
        json_path = self.checkpoints_dir / 'xgboost_ai4i.json'
        joblib_path = self.checkpoints_dir / 'xgboost_ai4i.joblib'
        if json_path.exists() and xgb is not None:
            self.ai4i_model = xgb.XGBClassifier()
            self.ai4i_model.load_model(json_path)
        elif joblib_path.exists():
            self.ai4i_model = joblib.load(joblib_path)
        else:
            logging.warning(f"AI4I model not found at {json_path} or {joblib_path}")
            
        cmapss_path = self.checkpoints_dir / 'cnnlstm_cmapss.pth'
        if cmapss_path.exists():
            # Input size depends on preprocessing, usually 14 features after dropping
            self.cmapss_model = CNNLSTM(input_size=14, hidden_size=128, num_layers=2)
            self.cmapss_model.load_state_dict(torch.load(cmapss_path, map_location=self.device))
            self.cmapss_model.to(self.device)
            self.cmapss_model.eval()
        else:
            logging.warning(f"C-MAPSS model not found at {cmapss_path}")
            
    def predict_ai4i(self, sensor_data: dict) -> dict:
        if self.ai4i_model is None:
            return {"error": "Model not loaded"}
            
        # Expected features based on preprocessing
        features = ['Type', 'Air temperature [K]', 'Process temperature [K]', 'Rotational speed [rpm]', 'Torque [Nm]', 'Tool wear [min]']
        
        try:
            arr = np.array([[sensor_data.get(f, 0) for f in features]])
            prob = self.ai4i_model.predict_proba(arr)[0]
            pred = self.ai4i_model.predict(arr)[0]
            
            # Simulated feature importances for UI
            importances = dict(zip(features, self.ai4i_model.feature_importances_.tolist()))
            
            return {
                "predicted_failure": bool(pred),
                "confidence": float(prob[1] if len(prob) > 1 else prob[0]),
                "feature_importances": importances
            }
        except Exception as e:
            return {"error": str(e)}
            
    def predict_cmapss(self, sequence: np.ndarray) -> dict:
        if self.cmapss_model is None:
            return {"error": "Model not loaded"}
            
        try:
            if len(sequence.shape) == 2:
                sequence = np.expand_dims(sequence, axis=0) # Add batch dim
                
            tensor = torch.tensor(sequence, dtype=torch.float32).to(self.device)
            with torch.no_grad():
                pred = self.cmapss_model(tensor).cpu().numpy().flatten()[0]
                
            # Simulate confidence interval
            return {
                "predicted_rul": float(pred),
                "confidence_interval": [float(pred * 0.9), float(pred * 1.1)]
            }
        except Exception as e:
            return {"error": str(e)}
            
    def analyze_sensors(self, data: pd.DataFrame) -> dict:
        # Simple rule-based health score for fallback/supplement
        health_score = 100.0
        alerts = []
        recommendations = []
        
        if 'Air temperature [K]' in data.columns and 'Process temperature [K]' in data.columns:
            diff = data['Process temperature [K]'].mean() - data['Air temperature [K]'].mean()
            if diff < 8.6: # Arbitrary threshold
                health_score -= 10
                alerts.append("Low temperature difference detected")
                recommendations.append("Check cooling system")
                
        if 'Tool wear [min]' in data.columns:
            wear = data['Tool wear [min]'].max()
            if wear > 200:
                health_score -= 20
                alerts.append(f"High tool wear ({wear} min)")
                recommendations.append("Schedule tool replacement")
                
        return {
            "health_score": float(max(0, health_score)),
            "alerts": alerts,
            "recommendations": recommendations
        }
