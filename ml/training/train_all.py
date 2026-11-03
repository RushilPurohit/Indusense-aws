"""
InduSense Master Model Training Orchestrator
Executes training across all 4 machine domains:
1. AI4I Milling Machine (Milling)
2. Factory Sensors (Pump)
3. UCI Hydraulic Systems (Hydraulic)
4. Paderborn Bearings (Bearing)
Registers all trained artifacts in ModelRegistry and generates Model Cards.
"""

import sys
import os
import json
import logging
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from ml.training.train_ai4i import train_ai4i
from ml.training.train_factory import train_factory
from ml.training.train_hydraulic import train_hydraulic
from ml.training.train_paderborn import train_paderborn
from ml.registry.model_registry import ModelRegistry

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def run_master_training():
    results = {}
    print("=" * 80)
    print("INDUSENSE PRODUCTION MODEL TRAINING PIPELINE")
    print("=" * 80)

    # 1. AI4I Milling
    try:
        print("\n--- Training Domain 1: Industrial Milling Machine (AI4I 2020) ---")
        ai4i_metrics = train_ai4i()
        ModelRegistry.register_model({
            "model_id": ai4i_metrics["model_id"],
            "name": "AI4I Milling Calibrated Classifier",
            "domain": "milling",
            "dataset": "AI4I 2020 Predictive Maintenance",
            "version": ai4i_metrics["version"],
            "status": "Trained",
            "is_synthetic": True,
            "artifact_path": "ml/checkpoints/ai4i/ai4i_pipeline.joblib",
            "metrics": ai4i_metrics["test_metrics"],
            "trained_at": ai4i_metrics["trained_at"],
            "calibration": "Validated (Sigmoid / Platt scaling)",
            "accuracy": ai4i_metrics["test_metrics"]["accuracy"]
        })
        results["milling"] = ai4i_metrics
    except Exception as e:
        logging.error(f"Failed to train AI4I model: {e}", exc_info=True)
        results["milling"] = {"error": str(e)}

    # 2. Factory Sensors Pump
    try:
        print("\n--- Training Domain 2: Industrial Pump (Factory Sensors) ---")
        factory_metrics = train_factory()
        ModelRegistry.register_model({
            "model_id": factory_metrics["model_id"],
            "name": "Factory Pump Predictor Suite",
            "domain": "pump",
            "dataset": "Factory Sensors with Failure Labels",
            "version": factory_metrics["version"],
            "status": "Trained",
            "is_synthetic": True,
            "artifact_path": "ml/checkpoints/factory_sensors/factory_pump_pipeline.joblib",
            "metrics": factory_metrics["test_metrics"],
            "trained_at": factory_metrics["trained_at"],
            "calibration": "Validated (Sigmoid / Platt scaling)",
            "accuracy": factory_metrics["test_metrics"]["failure_next_24h"]["accuracy"]
        })
        results["pump"] = factory_metrics
    except Exception as e:
        logging.error(f"Failed to train Factory Sensors model: {e}", exc_info=True)
        results["pump"] = {"error": str(e)}

    # 3. UCI Hydraulic
    try:
        print("\n--- Training Domain 3: Hydraulic System (UCI Condition Monitoring) ---")
        hydraulic_metrics = train_hydraulic()
        cooler_acc = hydraulic_metrics["test_metrics"]["cooler"]["accuracy"]
        ModelRegistry.register_model({
            "model_id": hydraulic_metrics["model_id"],
            "name": "Hydraulic Component Condition Suite",
            "domain": "hydraulic",
            "dataset": "UCI Condition Monitoring of Hydraulic Systems",
            "version": hydraulic_metrics["version"],
            "status": "Trained",
            "is_synthetic": False,
            "artifact_path": "ml/checkpoints/hydraulic/hydraulic_components_pipeline.joblib",
            "metrics": hydraulic_metrics["test_metrics"],
            "trained_at": hydraulic_metrics["trained_at"],
            "calibration": "Validated (Multi-Class HGB)",
            "accuracy": cooler_acc
        })
        results["hydraulic"] = hydraulic_metrics
    except Exception as e:
        logging.error(f"Failed to train Hydraulic model: {e}", exc_info=True)
        results["hydraulic"] = {"error": str(e)}

    # 4. Paderborn Bearing
    try:
        print("\n--- Training Domain 4: Rolling Element Bearing (Paderborn Datacenter) ---")
        paderborn_metrics = train_paderborn()
        ModelRegistry.register_model({
            "model_id": paderborn_metrics["model_id"],
            "name": "Paderborn Bearing Damage Classifier",
            "domain": "bearing",
            "dataset": "Paderborn Bearing Datacenter",
            "version": paderborn_metrics["version"],
            "status": "Trained",
            "is_synthetic": False,
            "artifact_path": "ml/checkpoints/paderborn/paderborn_bearing_pipeline.joblib",
            "metrics": paderborn_metrics["test_metrics"],
            "trained_at": paderborn_metrics["trained_at"],
            "calibration": "Validated (Sigmoid / Platt scaling on validation bearing fold)",
            "accuracy": paderborn_metrics["test_metrics"]["accuracy"]
        })
        results["bearing"] = paderborn_metrics
    except Exception as e:
        logging.error(f"Failed to train Paderborn model: {e}", exc_info=True)
        results["bearing"] = {"error": str(e)}

    print("\n" + "=" * 80)
    print("MASTER TRAINING SUMMARY:")
    for dom, res in results.items():
        if "error" in res:
            print(f"  {dom.upper()}: FAILED - {res['error']}")
        else:
            print(f"  {dom.upper()}: SUCCESS - Model {res['model_id']} registered.")
    print("=" * 80)
    return results

if __name__ == "__main__":
    run_master_training()

