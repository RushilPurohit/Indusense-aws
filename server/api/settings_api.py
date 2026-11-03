from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

CURRENT_SETTINGS = {
    "hypotheses_weights": {
        "w_Pc": 0.35,
        "w_Rc": 0.25,
        "w_Oc": 0.15,
        "w_CEA": 0.25
    },
    "router_cutoffs": {
        "light_path_min": 0.85,
        "standard_path_min": 0.70
    },
    "disclaimer": "Fusion weights and thresholds are research hypotheses under empirical evaluation (illustrative defaults)."
}

class UpdateSettingsRequest(BaseModel):
    hypotheses_weights: Dict[str, float]
    router_cutoffs: Dict[str, float]

@router.get("")
def get_settings():
    return CURRENT_SETTINGS

@router.put("")
def update_settings(req: UpdateSettingsRequest):
    global CURRENT_SETTINGS
    CURRENT_SETTINGS["hypotheses_weights"] = req.hypotheses_weights
    CURRENT_SETTINGS["router_cutoffs"] = req.router_cutoffs
    return CURRENT_SETTINGS
