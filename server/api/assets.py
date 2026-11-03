from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

FLEET_ASSETS = [
    {"id": "CNC-M102", "name": "5-Axis Spindle CNC Mill M102", "family": "CNC Machining", "plant": "Plant 2", "healthScore": 42, "status": "Fault", "fault": "Heat Dissipation Failure", "pc": 0.94, "rul": None, "path": "LIGHT"},
    {"id": "BRG-301", "name": "PRONOSTIA Roller Bearing 301", "family": "Bearing Assembly", "plant": "Plant 1", "healthScore": 68, "status": "Warning", "fault": "Outer-Race Bearing Degradation", "pc": 0.78, "rul": None, "path": "STANDARD"},
    {"id": "TURBO-TF004", "name": "Turbofan Propulsion Unit 004", "family": "Turbofan Fleet", "plant": "Plant 4", "healthScore": 35, "status": "Fault", "fault": "HPC Degradation", "pc": 0.64, "rul": 42, "path": "HEAVY"},
    {"id": "CNC-M205", "name": "High-Precision Lathe M205", "family": "CNC Machining", "plant": "Plant 2", "healthScore": 94, "status": "Healthy", "fault": "None (Nominal)", "pc": 0.98, "rul": None, "path": "LIGHT"},
    {"id": "BRG-102", "name": "Dyno Bench Bearing 102", "family": "Bearing Assembly", "plant": "Plant 1", "healthScore": 91, "status": "Healthy", "fault": "None (Nominal)", "pc": 0.95, "rul": None, "path": "LIGHT"},
    {"id": "TURBO-TF009", "name": "Turbofan Propulsion Unit 009", "family": "Turbofan Fleet", "plant": "Plant 4", "healthScore": 82, "status": "Healthy", "fault": "None (Nominal)", "pc": 0.92, "rul": 118, "path": "LIGHT"}
]

@router.get("")
def list_assets():
    return FLEET_ASSETS

@router.get("/{asset_id}/telemetry")
def get_asset_telemetry(asset_id: str):
    return {
        "asset_id": asset_id,
        "sample_rate_hz": 1,
        "features": {
            "air_temp_k": 300.6,
            "process_temp_k": 308.7,
            "rpm": 1320,
            "torque_nm": 52.4,
            "tool_wear_min": 110
        }
    }
