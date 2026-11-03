from ..schemas.machine import PredictionResponse, MachineHealthReport, SensorAnalysis
import pandas as pd

class MaintenanceService:
    def predict_failure(self, sensor_data: dict) -> PredictionResponse:
        # Mock ML inference
        return PredictionResponse(
            failure_probability=0.15,
            rul_cycles=120,
            confidence=0.88,
            critical_sensors=["vibration_1"]
        )

    def predict_rul(self, sequence: list) -> dict:
        return {"rul_cycles": 120, "confidence": 0.85}

    def analyze_health(self, dataframe: pd.DataFrame) -> MachineHealthReport:
        return MachineHealthReport(
            overall_health=0.85,
            status="Healthy",
            sensor_analysis=[
                SensorAnalysis(sensor_name="temp_1", status="normal", deviation=0.01)
            ],
            recommendations=["Routine maintenance in 30 days."]
        )

maintenance_service = MaintenanceService()
