"""
AI4I 2020 Preprocessing Pipeline
Strict leakage prevention:
- Excludes UDI and Product ID.
- Keeps input feature schema separate from failure-mode targets.
- Fits StandardScaler on training split only.
"""

import math
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

TYPE_MAPPING = {'L': 0, 'M': 1, 'H': 2}
FEATURE_COLS = [
    'Type',
    'Air temperature [K]',
    'Process temperature [K]',
    'Rotational speed [rpm]',
    'Torque [Nm]',
    'Tool wear [min]',
    'temp_diff',
    'power_w',
    'wear_torque'
]
FAILURE_MODES = ['TWF', 'HDF', 'PWF', 'OSF', 'RNF']

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df_feat = df.copy()
    if 'Type' in df_feat.columns:
        if df_feat['Type'].dtype == object or df_feat['Type'].dtype == 'string':
            df_feat['Type'] = df_feat['Type'].map(TYPE_MAPPING).fillna(0).astype(float)
    
    air = df_feat['Air temperature [K]']
    proc = df_feat['Process temperature [K]']
    rpm = df_feat['Rotational speed [rpm]']
    torque = df_feat['Torque [Nm]']
    wear = df_feat['Tool wear [min]']

    df_feat['temp_diff'] = proc - air
    df_feat['power_w'] = (rpm * torque * 2 * math.pi) / 60.0
    df_feat['wear_torque'] = wear * torque
    return df_feat

def prepare_ai4i_splits(
    df: pd.DataFrame,
    test_size: float = 0.15,
    val_size: float = 0.15,
    random_state: int = 42
) -> Dict[str, Any]:
    df_engineered = engineer_features(df)
    
    X = df_engineered[FEATURE_COLS].copy()
    y_failure = df_engineered['Machine failure'].copy()
    y_modes = df_engineered[FAILURE_MODES].copy()

    # Stratified split on Machine failure
    X_train_val, X_test, y_train_val, y_test, modes_train_val, modes_test = train_test_split(
        X, y_failure, y_modes, test_size=test_size, stratify=y_failure, random_state=random_state
    )

    val_relative_size = val_size / (1.0 - test_size)
    X_train, X_val, y_train, y_val, modes_train, modes_val = train_test_split(
        X_train_val, y_train_val, modes_train_val,
        test_size=val_relative_size,
        stratify=y_train_val,
        random_state=random_state
    )

    # Fit scaler on training set ONLY
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    return {
        'scaler': scaler,
        'feature_names': FEATURE_COLS,
        'failure_modes': FAILURE_MODES,
        'X_train': X_train_scaled,
        'y_train': y_train.to_numpy(),
        'modes_train': modes_train.to_numpy(),
        'X_val': X_val_scaled,
        'y_val': y_val.to_numpy(),
        'modes_val': modes_val.to_numpy(),
        'X_test': X_test_scaled,
        'y_test': y_test.to_numpy(),
        'modes_test': modes_test.to_numpy(),
        'train_df_raw': df.iloc[X_train.index]
    }

