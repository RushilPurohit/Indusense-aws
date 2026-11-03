import pandas as pd
from ..services.maintenance_service import maintenance_service

class MaintenancePipeline:
    def process_sensor_csv(self, file_path: str) -> pd.DataFrame:
        return pd.read_csv(file_path)

    def run_prediction(self, df: pd.DataFrame) -> dict:
        return maintenance_service.predict_failure(df.to_dict(orient="records")[0]).model_dump()

    def generate_report(self, predictions: dict):
        return maintenance_service.analyze_health(pd.DataFrame([predictions]))

maintenance_pipeline = MaintenancePipeline()
