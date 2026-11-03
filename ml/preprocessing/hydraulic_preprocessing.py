"""
Hydraulic Systems Preprocessing Pipeline
Extracts cycle-level time-series statistical features across 17 sensor channels.
Labels four independent components:
1. Cooler condition: 100% (full), 20% (reduced), 3% (close to failure)
2. Valve condition: 100% (optimal), 90% (small lag), 80% (severe lag), 73% (close to failure)
3. Internal pump leakage: 0 (none), 1 (weak), 2 (severe)
4. Accumulator pressure: 130 bar (optimal), 115 bar (slightly reduced), 100 bar (severely reduced), 90 bar (close to failure)
"""

from pathlib import Path
from typing import Dict, Any, List
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.preprocessing import StandardScaler
from ml.datasets.config import HYDRAULIC_DIR
from ml.datasets.hydraulic_loader import SENSOR_NAMES, load_hydraulic_profile, load_sensor_file

COOLER_MAP = {100: 0, 20: 1, 3: 2} # 0: Full, 1: Reduced, 2: Near Failure
VALVE_MAP = {100: 0, 90: 1, 80: 2, 73: 3} # 0: Optimal, 1: Small lag, 2: Severe lag, 3: Failure
PUMP_MAP = {0: 0, 1: 1, 2: 2} # 0: None, 1: Weak, 2: Severe
ACCUMULATOR_MAP = {130: 0, 115: 1, 100: 2, 90: 3} # 0: Optimal, 1: Minor drop, 2: Major drop, 3: Near failure

def extract_hydraulic_features(data_dir: Path = HYDRAULIC_DIR) -> pd.DataFrame:
    features_dict = {}
    
    for s_name in SENSOR_NAMES:
        mat = load_sensor_file(s_name, data_dir) # Shape (2205, N_samples)
        # Compute row-wise statistics
        mean_val = np.mean(mat, axis=1)
        std_val = np.std(mat, axis=1)
        min_val = np.min(mat, axis=1)
        max_val = np.max(mat, axis=1)
        energy_val = np.sqrt(np.mean(mat ** 2, axis=1)) # RMS
        
        features_dict[f'{s_name}_mean'] = mean_val
        features_dict[f'{s_name}_std'] = std_val
        features_dict[f'{s_name}_min'] = min_val
        features_dict[f'{s_name}_max'] = max_val
        features_dict[f'{s_name}_rms'] = energy_val

    df_feats = pd.DataFrame(features_dict)
    return df_feats

def prepare_hydraulic_splits(
    data_dir: Path = HYDRAULIC_DIR,
    train_frac: float = 0.70,
    val_frac: float = 0.15
) -> Dict[str, Any]:
    df_X = extract_hydraulic_features(data_dir)
    df_y = load_hydraulic_profile(data_dir)

    n_cycles = len(df_X)
    n_train = int(n_cycles * train_frac)
    n_val = int(n_cycles * (train_frac + val_frac))

    X = df_X.values
    feature_names = list(df_X.columns)

    X_train_raw = X[:n_train]
    X_val_raw = X[n_train:n_val]
    X_test_raw = X[n_val:]

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train_raw)
    X_val = scaler.transform(X_val_raw)
    X_test = scaler.transform(X_test_raw)

    y_cooler = df_y['cooler_condition'].map(COOLER_MAP).values
    y_valve = df_y['valve_condition'].map(VALVE_MAP).values
    y_pump = df_y['pump_leakage'].map(PUMP_MAP).values
    y_accum = df_y['accumulator_pressure'].map(ACCUMULATOR_MAP).values

    return {
        'scaler': scaler,
        'feature_names': feature_names,
        'X_train': X_train,
        'X_val': X_val,
        'X_test': X_test,
        'targets': {
            'cooler': {
                'train': y_cooler[:n_train],
                'val': y_cooler[n_train:n_val],
                'test': y_cooler[n_val:],
                'class_names': ['Full Efficiency (100%)', 'Reduced Efficiency (20%)', 'Close to Failure (3%)']
            },
            'valve': {
                'train': y_valve[:n_train],
                'val': y_valve[n_train:n_val],
                'test': y_valve[n_val:],
                'class_names': ['Optimal Switching (100%)', 'Small Lag (90%)', 'Severe Lag (80%)', 'Close to Failure (73%)']
            },
            'pump': {
                'train': y_pump[:n_train],
                'val': y_pump[n_train:n_val],
                'test': y_pump[n_val:],
                'class_names': ['No Leakage (0)', 'Weak Leakage (1)', 'Severe Leakage (2)']
            },
            'accumulator': {
                'train': y_accum[:n_train],
                'val': y_accum[n_train:n_val],
                'test': y_accum[n_val:],
                'class_names': ['Optimal Pressure (130 bar)', 'Slightly Reduced (115 bar)', 'Severely Reduced (100 bar)', 'Close to Failure (90 bar)']
            }
        }
    }
