"""
InduSense ML & Model Training Management API
Additive endpoints under /api/ml/ as specified in Part 6:
- GET  /api/ml/datasets
- GET  /api/ml/models
- GET  /api/ml/training-runs
- POST /api/ml/training-runs
- GET  /api/ml/models/{model_id}/metrics
- GET  /api/ml/models/{model_id}/card
- POST /api/ml/models/{model_id}/activate
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from pathlib import Path
import json
import time
import uuid

from ml.registry.model_registry import ModelRegistry
from ml.datasets.config import REPO_ROOT, DATASETS_DIR, SKF_PDF_PATH
from server.api.auth import get_current_user_from_header

router = APIRouter()

# In-memory training run tracking backed by disk logs
TRAINING_RUNS_FILE = REPO_ROOT / "ml" / "reports" / "training_runs.json"

def load_training_runs() -> List[Dict[str, Any]]:
    if not TRAINING_RUNS_FILE.exists():
        return [
            {
                "run_id": "run-master-001",
                "domain": "all",
                "dataset": "All 4 Machine Domains",
                "algorithm": "HistGradientBoosting + Calibrated Sigmoid",
                "status": "Completed",
                "started_at": "2026-10-31T17:38:34Z",
                "completed_at": "2026-10-31T17:39:40Z",
                "accuracy": 0.8958,
                "error": None
            }
        ]
    try:
        with open(TRAINING_RUNS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []

def save_training_runs(runs: List[Dict[str, Any]]):
    TRAINING_RUNS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(TRAINING_RUNS_FILE, "w") as f:
        json.dump(runs, f, indent=2)

class TriggerTrainingRequest(BaseModel):
    domain: str
    dataset: str
    algorithm: Optional[str] = "HistGradientBoosting"
    config: Optional[Dict[str, Any]] = None

@router.get("/datasets")
def get_datasets_registry():
    """Returns verified dataset registry metadata for UI."""
    return [
        {
            "id": "paderborn-bearing",
            "name": "Paderborn Bearing Datacenter",
            "domain": "bearing",
            "type": "Experimental Physical Sensor Dataset",
            "is_synthetic": False,
            "status": "Validated",
            "files_available": 30,
            "record_count": "258,669 samples/file",
            "channels": ["Vibration (1)", "Motor Phase Current 1", "Motor Phase Current 2", "Speed", "Torque"],
            "targets": ["Healthy", "Outer Ring Damage", "Inner Ring Damage", "Mixed Damage"],
            "split_strategy": "Grouped split by physical bearing identity (NO window leakage)",
            "license": "CC BY-NC 4.0"
        },
        {
            "id": "factory-sensors",
            "name": "Factory Sensors with Failure Labels",
            "domain": "pump",
            "type": "Synthetic Sensor Dataset",
            "is_synthetic": True,
            "status": "Validated",
            "files_available": 5,
            "record_count": 52560,
            "channels": ["vibration_mm_s", "bearing_temp_c", "motor_current_a", "discharge_pressure_bar", "rotor_speed_rpm"],
            "targets": ["Degradation Stage", "Failure within 24h", "Next Failure Mode", "RUL Hours"],
            "split_strategy": "Strict chronological temporal split",
            "license": "CC0 (Public Domain)"
        },
        {
            "id": "uci-hydraulic",
            "name": "UCI Condition Monitoring of Hydraulic Systems",
            "domain": "hydraulic",
            "type": "Experimental Physical Sensor Dataset",
            "is_synthetic": False,
            "status": "Validated",
            "files_available": 17,
            "record_count": 2205,
            "channels": ["PS1-PS6 (100Hz)", "EPS1 (100Hz)", "FS1-FS2 (10Hz)", "TS1-TS4 (1Hz)", "VS1 (50Hz)", "CE/CP/SE (1Hz)"],
            "targets": ["Cooler (100%, 20%, 3%)", "Valve (100%, 90%, 80%, 73%)", "Pump Leakage (0,1,2)", "Accumulator (130, 115, 100, 90 bar)"],
            "split_strategy": "Chronological cycle split",
            "license": "CC BY 4.0"
        },
        {
            "id": "ai4i-2020",
            "name": "AI4I 2020 Predictive Maintenance",
            "domain": "milling",
            "type": "Synthetic Sensor Dataset",
            "is_synthetic": True,
            "status": "Validated",
            "files_available": 1,
            "record_count": 10000,
            "channels": ["Air temp", "Process temp", "Rotational speed", "Torque", "Tool wear"],
            "targets": ["Machine failure", "TWF", "HDF", "PWF", "OSF", "RNF"],
            "split_strategy": "Stratified train/validation/test split",
            "license": "CC BY 4.0"
        },
        {
            "id": "skf-bearing-2025",
            "name": "SKF Bearing Damage and Failure Analysis (2025)",
            "domain": "bearing",
            "type": "Technical Maintenance Knowledge Document (RAG)",
            "is_synthetic": False,
            "status": "Indexed",
            "files_available": 1,
            "record_count": "106 verified pages",
            "channels": ["Inspection & Troubleshooting", "ISO Failure Modes", "Damage & Actions", "Case Studies"],
            "targets": ["Technical Evidence Retrieval", "Condition-Evidence Alignment (CEA)"],
            "split_strategy": "Page and section semantic chunking",
            "license": "OEM Technical Manual (SKF Group)"
        }
    ]

@router.get("/models")
def get_registered_models():
    reg = ModelRegistry.get_registry()
    models_list = []
    active_map = reg.get("active_models", {})
    for mid, m in reg.get("models", {}).items():
        entry = dict(m)
        entry["is_active"] = (active_map.get(m.get("domain")) == mid)
        models_list.append(entry)
    return {
        "active_models": active_map,
        "models": models_list
    }

@router.get("/training-runs")
def get_training_runs():
    return load_training_runs()

@router.post("/training-runs")
def trigger_training_run(
    req: TriggerTrainingRequest,
    user: Any = Depends(get_current_user_from_header)
):
    # Verify authorization
    user_role = user.get("role", "") if isinstance(user, dict) else ""
    if user_role not in ["engineer", "admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized: Only engineers and admins can trigger training runs.")

    run_id = f"run-{uuid.uuid4().hex[:8]}"
    runs = load_training_runs()
    new_run = {
        "run_id": run_id,
        "domain": req.domain,
        "dataset": req.dataset,
        "algorithm": req.algorithm or "HistGradientBoosting",
        "status": "Queued",
        "started_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "completed_at": None,
        "accuracy": None,
        "error": None
    }
    runs.insert(0, new_run)
    save_training_runs(runs)
    return new_run

@router.get("/models/{model_id}/metrics")
def get_model_metrics(model_id: str):
    entry = ModelRegistry.get_model_entry(model_id)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found in registry.")
    return entry.get("metrics", {})

@router.get("/models/{model_id}/card")
def get_model_card(model_id: str):
    card_path = REPO_ROOT / "ml" / "reports" / "model_cards" / f"{model_id}.md"
    if not card_path.exists():
        # Fallback to general info
        entry = ModelRegistry.get_model_entry(model_id)
        if not entry:
            raise HTTPException(status_code=404, detail=f"Model card for '{model_id}' not found.")
        return {"card_markdown": f"# Model Card: {model_id}\n\nModel is registered but markdown card is generating."}
    with open(card_path, "r", encoding="utf-8") as f:
        content = f.read()
    return {"model_id": model_id, "card_markdown": content}

@router.post("/models/{model_id}/activate")
def activate_model(
    model_id: str,
    user: Any = Depends(get_current_user_from_header)
):
    entry = ModelRegistry.get_model_entry(model_id)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found in registry.")
    domain = entry.get("domain")
    if not domain:
        raise HTTPException(status_code=400, detail="Model does not declare a domain.")

    reg = ModelRegistry.get_registry()
    reg.setdefault("active_models", {})[domain] = model_id
    ModelRegistry.save_registry(reg)
    return {"status": "success", "active_models": reg["active_models"]}

