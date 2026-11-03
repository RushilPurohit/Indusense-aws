from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from ..adapters.registry import CloudAdaptersRegistry

router = APIRouter()

class RouterSimulateRequest(BaseModel):
    Pc: float
    Oc: float
    Rc: float
    CEA: float
    conflict: Optional[bool] = False

@router.post("/simulate")
def simulate_router_dispatch(req: RouterSimulateRequest):
    if req.conflict or req.CEA < 0.60 or req.Pc < 0.70:
        path = "HEAVY"
        reason = (
            "Evidence conflict detected (CEA mismatch) or low certainty (<0.70). "
            "Escalated to Heavy tier + mandatory human engineering review."
            if req.conflict
            else "Low condition or evidence certainty (<0.70). Escalated to Heavy tier."
        )
        lat = 650
        cost = 0.0145
    elif req.Pc < 0.88 or req.CEA < 0.85 or req.Oc < 0.85:
        path = "STANDARD"
        reason = "Marginal confidence threshold met. Standard dual-pass verification selected."
        lat = 390
        cost = 0.0048
    else:
        path = "LIGHT"
        reason = "High condition and evidence confidence (Pc >= 0.88, CEA >= 0.85); minimal risk. Deterministic local dispatch."
        lat = 240
        cost = 0.0018

    return {
        "path": path,
        "reason": reason,
        "estimated_latency_ms": lat,
        "estimated_cost_usd": cost,
        "breakdown": {
            "Pc": req.Pc,
            "Oc": req.Oc,
            "Rc": req.Rc,
            "CEA": req.CEA,
            "conflict": req.conflict
        }
    }

@router.get("/services")
def list_cloud_services():
    return CloudAdaptersRegistry.get_services_status()
