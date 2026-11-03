"""
Factory Sensors Training & Calibration Pipeline
Domain: Industrial Pump
Trains:
1. Failure within 24 hours classifier (Calibrated for Pc)
2. Degradation Stage classifier (Multi-class)
3. Remaining Useful Life (RUL) regressor
Chronological validation split to guarantee zero data leakage.
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

from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, brier_score_loss, confusion_matrix,
    mean_squared_error, mean_absolute_error, r2_score
)

from ml.datasets.factory_loader import load_factory_tables
from ml.preprocessing.factory_preprocessing import prepare_factory_splits
from ml.datasets.config import REPO_ROOT

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def compute_ece(probs: np.ndarray, y_true: np.ndarray, n_bins: int = 10) -> float:
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    n = len(y_true)
    for i in range(n_bins):
        bin_mask = (probs > bin_boundaries[i]) & (probs <= bin_boundaries[i + 1])
        bin_size = np.sum(bin_mask)
        if bin_size > 0:
            bin_acc = np.mean(y_true[bin_mask])
            bin_conf = np.mean(probs[bin_mask])
            ece += (bin_size / n) * np.abs(bin_acc - bin_conf)
    return float(ece)

def train_factory(output_dir: Path = None):
    if output_dir is None:
        output_dir = REPO_ROOT / "ml" / "checkpoints" / "factory_sensors"
    output_dir.mkdir(parents=True, exist_ok=True)

    logging.info("Step 1: Loading Factory Sensors relational tables...")
    tables = load_factory_tables()
    logging.info(f"Loaded {len(tables['sensor_readings'])} sensor readings, {len(tables['failure_events'])} failures.")

    logging.info("Step 2: Preparing chronological splits...")
    splits = prepare_factory_splits(tables, train_frac=0.70, val_frac=0.15)

    X_train, X_val, X_test = splits['X_train'], splits['X_val'], splits['X_test']
    y_train_fail, y_val_fail, y_test_fail = splits['y_train_fail24'], splits['y_val_fail24'], splits['y_test_fail24']
    y_train_stage, y_val_stage, y_test_stage = splits['y_train_stage'], splits['y_val_stage'], splits['y_test_stage']
    y_train_rul, y_val_rul, y_test_rul = splits['y_train_rul'], splits['y_val_rul'], splits['y_test_rul']
    scaler = splits['scaler']
    feature_names = splits['feature_names']

    logging.info("Step 3: Training Failure-within-24h Classifier...")
    base_fail = HistGradientBoostingClassifier(max_iter=150, class_weight='balanced', random_state=42)
    base_fail.fit(X_train, y_train_fail)

    logging.info("Calibrating Failure-within-24h model (cv=3)...")
    calibrated_fail = CalibratedClassifierCV(estimator=base_fail, method='sigmoid', cv=3)
    calibrated_fail.fit(X_train, y_train_fail)

    logging.info("Step 4: Training Degradation Stage Classifier...")
    stage_clf = HistGradientBoostingClassifier(max_iter=120, random_state=42)
    stage_clf.fit(X_train, y_train_stage)

    logging.info("Step 5: Training Remaining Useful Life (RUL) Regressor...")
    rul_reg = HistGradientBoostingRegressor(max_iter=150, random_state=42)
    rul_reg.fit(X_train, y_train_rul)

    logging.info("Step 6: Evaluating on chronological unseen TEST set...")
    # 1. Failure 24h metrics
    fail_probs = calibrated_fail.predict_proba(X_test)[:, 1]
    fail_preds = (fail_probs >= 0.50).astype(int)

    fail_acc = float(accuracy_score(y_test_fail, fail_preds))
    fail_prec = float(precision_score(y_test_fail, fail_preds, zero_division=0))
    fail_rec = float(recall_score(y_test_fail, fail_preds, zero_division=0))
    fail_f1 = float(f1_score(y_test_fail, fail_preds, zero_division=0))
    fail_auc = float(roc_auc_score(y_test_fail, fail_probs)) if len(np.unique(y_test_fail)) > 1 else 0.0
    fail_brier = float(brier_score_loss(y_test_fail, fail_probs))
    fail_ece = compute_ece(fail_probs, y_test_fail)

    # 2. Stage metrics
    stage_preds = stage_clf.predict(X_test)
    stage_acc = float(accuracy_score(y_test_stage, stage_preds))
    stage_f1 = float(f1_score(y_test_stage, stage_preds, average='macro', zero_division=0))

    # 3. RUL metrics
    rul_preds = rul_reg.predict(X_test)
    rul_mae = float(mean_absolute_error(y_test_rul, rul_preds))
    rul_rmse = float(np.sqrt(mean_squared_error(y_test_rul, rul_preds)))
    rul_r2 = float(r2_score(y_test_rul, rul_preds))

    timestamp = datetime.now(timezone.utc).isoformat()
    metrics = {
        "model_id": "factory_pump_failure_predictor",
        "domain": "pump",
        "dataset_name": "Factory Sensors with Failure Labels",
        "is_synthetic": True,
        "algorithm": "HistGradientBoosting Classifier + Regressor Suite",
        "version": "2.0.0",
        "trained_at": timestamp,
        "sample_counts": {
            "train": len(X_train),
            "val": len(X_val),
            "test": len(X_test)
        },
        "test_metrics": {
            "failure_next_24h": {
                "accuracy": round(fail_acc, 4),
                "precision": round(fail_prec, 4),
                "recall": round(fail_rec, 4),
                "f1_score": round(fail_f1, 4),
                "roc_auc": round(fail_auc, 4),
                "brier_score": round(fail_brier, 4),
                "ece": round(fail_ece, 4),
                "calibration_status": "Calibrated (Sigmoid / Platt scaling on chronological validation fold)"
            },
            "degradation_stage": {
                "accuracy": round(stage_acc, 4),
                "macro_f1": round(stage_f1, 4),
                "classes": ["NORMAL", "EARLY", "MODERATE", "SEVERE", "CRITICAL"]
            },
            "rul_regression": {
                "mae_hours": round(rul_mae, 2),
                "rmse_hours": round(rul_rmse, 2),
                "r2_score": round(rul_r2, 4)
            }
        },
        "features": feature_names
    }

    pipeline_artifact = {
        "scaler": scaler,
        "fail_model": calibrated_fail,
        "base_fail_model": base_fail,
        "stage_model": stage_clf,
        "rul_model": rul_reg,
        "feature_names": feature_names,
        "stage_mapping": splits['stage_mapping'],
        "metrics": metrics
    }

    artifact_path = output_dir / "factory_pump_pipeline.joblib"
    metrics_path = output_dir / "factory_pump_metrics.json"

    joblib.dump(pipeline_artifact, artifact_path)
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    logging.info(f"Factory Pump training complete. Fail F1={fail_f1:.4f}, Stage Acc={stage_acc:.4f}, RUL MAE={rul_mae:.2f}h")
    logging.info(f"Artifact saved to {artifact_path}")
    return metrics

if __name__ == "__main__":
    train_factory()
