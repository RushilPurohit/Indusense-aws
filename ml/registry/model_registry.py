"""
InduSense Model Registry
Central registry tracking genuine trained models, metrics, calibration status, and active models.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

REGISTRY_FILE = Path(__file__).resolve().parent / "model_registry.json"

DEFAULT_REGISTRY = {
    "version": "2.0.0",
    "updated_at": datetime.now(timezone.utc).isoformat(),
    "active_models": {
        "milling": "ai4i_milling_failure_classifier",
        "pump": "factory_pump_failure_predictor",
        "hydraulic": "hydraulic_component_condition_predictor",
        "bearing": "paderborn_bearing_classifier"
    },
    "models": {}
}

class ModelRegistry:
    @staticmethod
    def get_registry() -> Dict[str, Any]:
        if not REGISTRY_FILE.exists():
            ModelRegistry.save_registry(DEFAULT_REGISTRY)
            return DEFAULT_REGISTRY
        try:
            with open(REGISTRY_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_REGISTRY

    @staticmethod
    def save_registry(data: Dict[str, Any]):
        REGISTRY_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(REGISTRY_FILE, "w") as f:
            json.dump(data, f, indent=2)

    @staticmethod
    def register_model(model_meta: Dict[str, Any]):
        reg = ModelRegistry.get_registry()
        model_id = model_meta["model_id"]
        reg["models"][model_id] = model_meta
        domain = model_meta.get("domain")
        if domain:
            reg["active_models"][domain] = model_id
        reg["updated_at"] = datetime.now(timezone.utc).isoformat()
        ModelRegistry.save_registry(reg)

    @staticmethod
    def get_model_entry(model_id: str) -> Optional[Dict[str, Any]]:
        reg = ModelRegistry.get_registry()
        return reg["models"].get(model_id)

    @staticmethod
    def get_active_model_for_domain(domain: str) -> Optional[Dict[str, Any]]:
        reg = ModelRegistry.get_registry()
        active_id = reg.get("active_models", {}).get(domain)
        if active_id and active_id in reg["models"]:
            return reg["models"][active_id]
        return None

