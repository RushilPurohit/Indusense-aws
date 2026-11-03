"""
UCI Hydraulic Systems Training Pipeline
Domain: Hydraulic System
Trains independent condition classifiers for:
1. Cooler Condition (100%, 20%, 3%)
2. Valve Condition (100%, 90%, 80%, 73%)
3. Internal Pump Leakage (None, Weak, Severe)
4. Hydraulic Accumulator (130 bar, 115 bar, 100 bar, 90 bar)
"""

import json
import logging
import sys
from pathlib import Path
from datetime import datetime, timezone
import numpy as np
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix

from ml.preprocessing.hydraulic_preprocessing import prepare_hydraulic_splits
from ml.datasets.config import REPO_ROOT

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def train_hydraulic(output_dir: Path = None):
    if output_dir is None:
        output_dir = REPO_ROOT / "ml" / "checkpoints" / "hydraulic"
    output_dir.mkdir(parents=True, exist_ok=True)

    logging.info("Step 1: Extracting cycle-level features from 17 hydraulic sensor channels...")
    splits = prepare_hydraulic_splits(train_frac=0.70, val_frac=0.15)

    X_train, X_val, X_test = splits['X_train'], splits['X_val'], splits['X_test']
    scaler = splits['scaler']
    feature_names = splits['feature_names']
    targets = splits['targets']

    trained_models = {}
    component_metrics = {}

    for comp_name, comp_data in targets.items():
        y_train = comp_data['train']
        y_val = comp_data['val']
        y_test = comp_data['test']
        class_names = comp_data['class_names']

        logging.info(f"Training component model for {comp_name.upper()}...")
        clf = HistGradientBoostingClassifier(max_iter=120, random_state=42)
        clf.fit(X_train, y_train)

        # Test evaluation
        test_preds = clf.predict(X_test)
        test_acc = float(accuracy_score(y_test, test_preds))
        test_macro_f1 = float(f1_score(y_test, test_preds, average='macro', zero_division=0))
        cm = confusion_matrix(y_test, test_preds).tolist()

        trained_models[comp_name] = clf
        component_metrics[comp_name] = {
            "accuracy": round(test_acc, 4),
            "macro_f1": round(test_macro_f1, 4),
            "classes": class_names,
            "confusion_matrix": cm
        }
        logging.info(f"{comp_name.upper()}: Test Accuracy = {test_acc:.4f}, Macro F1 = {test_macro_f1:.4f}")

    timestamp = datetime.now(timezone.utc).isoformat()
    metrics = {
        "model_id": "hydraulic_component_condition_predictor",
        "domain": "hydraulic",
        "dataset_name": "UCI Condition Monitoring of Hydraulic Systems",
        "is_synthetic": False,
        "algorithm": "HistGradientBoosting Component-Condition Classifiers",
        "version": "2.0.0",
        "trained_at": timestamp,
        "sample_counts": {
            "train": len(X_train),
            "val": len(X_val),
            "test": len(X_test)
        },
        "test_metrics": component_metrics,
        "features": feature_names
    }

    pipeline_artifact = {
        "scaler": scaler,
        "models": trained_models,
        "feature_names": feature_names,
        "targets_metadata": targets,
        "metrics": metrics
    }

    artifact_path = output_dir / "hydraulic_components_pipeline.joblib"
    metrics_path = output_dir / "hydraulic_metrics.json"

    joblib.dump(pipeline_artifact, artifact_path)
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    logging.info(f"Hydraulic training complete. Artifact saved to {artifact_path}")
    return metrics

if __name__ == "__main__":
    train_hydraulic()
