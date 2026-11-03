from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SensorData(BaseModel):
    timestamp: str
    features: Dict[str, float]

class PredictionRequest(BaseModel):
    sensor_data: List[SensorData]

class PredictionResponse(BaseModel):
    failure_probability: float
    rul_cycles: Optional[int]
    confidence: float
    critical_sensors: List[str]

class SensorAnalysis(BaseModel):
    sensor_name: str
    status: str
    deviation: float

class MachineHealthReport(BaseModel):
    overall_health: float
    status: str
    sensor_analysis: List[SensorAnalysis]
    recommendations: List[str]
