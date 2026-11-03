"""
UCI Condition Monitoring of Hydraulic Systems Loader
Loads raw profile.txt and sensor files efficiently.
"""

from pathlib import Path
from typing import Dict, List
import numpy as np
import pandas as pd
from .config import HYDRAULIC_DIR

SENSOR_NAMES = [
    'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PS6',
    'EPS1',
    'FS1', 'FS2',
    'TS1', 'TS2', 'TS3', 'TS4',
    'VS1',
    'CE', 'CP', 'SE'
]

def load_hydraulic_profile(data_dir: Path = HYDRAULIC_DIR) -> pd.DataFrame:
    profile_path = data_dir / "profile.txt"
    if not profile_path.exists():
        raise FileNotFoundError(f"profile.txt not found in {data_dir}")
    # profile has tab or whitespace separated 5 columns
    df_prof = pd.read_csv(profile_path, sep=r'\s+', header=None)
    df_prof.columns = ['cooler_condition', 'valve_condition', 'pump_leakage', 'accumulator_pressure', 'stable_flag']
    return df_prof

def load_sensor_file(sensor_name: str, data_dir: Path = HYDRAULIC_DIR) -> np.ndarray:
    sensor_path = data_dir / f"{sensor_name}.txt"
    if not sensor_path.exists():
        raise FileNotFoundError(f"Sensor file {sensor_name}.txt not found in {data_dir}")
    # Read matrix: 2205 rows x (sample_rate * 60) cols
    return np.loadtxt(sensor_path)

