"""
AI4I 2020 Dataset Loader
Validates and loads raw AI4I dataset from disk.
"""

from pathlib import Path
import pandas as pd
from .config import AI4I_DIR

def load_ai4i_raw(data_dir: Path = AI4I_DIR) -> pd.DataFrame:
    csv_path = data_dir / "ai4i2020.csv"
    if not csv_path.exists():
        # Fallback search
        candidates = list(data_dir.glob("*.csv"))
        if candidates:
            csv_path = candidates[0]
        else:
            raise FileNotFoundError(f"AI4I dataset csv not found in {data_dir}")

    df = pd.read_csv(csv_path)
    expected_cols = {'UDI', 'Product ID', 'Type', 'Air temperature [K]',
                     'Process temperature [K]', 'Rotational speed [rpm]',
                     'Torque [Nm]', 'Tool wear [min]', 'Machine failure'}
    missing = expected_cols - set(df.columns)
    if missing:
        raise ValueError(f"AI4I dataset missing expected columns: {missing}")

    return df

