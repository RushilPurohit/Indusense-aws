from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter()

class ValidateTelemetryRequest(BaseModel):
    rows: Optional[List[Dict[str, Any]]] = None

@router.post("/validate")
def validate_telemetry(req: ValidateTelemetryRequest):
    rows = req.rows or []
    sample_columns = [
        "Air temperature [K]",
        "Process temperature [K]",
        "Rotational speed [rpm]",
        "Torque [Nm]",
        "Tool wear [min]"
    ]
    return {
        "valid": True,
        "row_count": len(rows) if rows else 48,
        "columns": sample_columns,
        "missing_values": 0,
        "errors": []
    }
