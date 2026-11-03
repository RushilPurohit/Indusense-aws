"""
Factory Sensors Preprocessing Pipeline
Leakage-safe time-series processing:
- Strict chronological train/validation/test split.
- Rolling window statistical features computed strictly on past data.
- Exclusion of future failure-event and work-order data from input features.
- Handling of stopped machine states.
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

RAW_SENSOR_COLS = [
    'vibration_mm_s',
    'bearing_temp_c',
    'motor_current_a',
    'discharge_pressure_bar',
    'rotor_speed_rpm'
]

def engineer_factory_features(df_readings: pd.DataFrame) -> pd.DataFrame:
    df = df_readings.sort_values(by=['asset_id', 'recorded_at']).copy()

    # Filter out offline machine readings if rotor speed is 0 or stopped
    df['is_operating'] = (df['rotor_speed_rpm'] > 10.0).astype(int)

    # Compute rolling lag features per asset
    feature_dfs = []
    for asset_id, group in df.groupby('asset_id'):
        g = group.copy()
        for col in RAW_SENSOR_COLS:
            g[f'{col}_roll_mean_6h'] = g[col].rolling(window=6, min_periods=1).mean()
            g[f'{col}_roll_std_6h'] = g[col].rolling(window=6, min_periods=1).std().fillna(0.0)
            g[f'{col}_roll_max_6h'] = g[col].rolling(window=6, min_periods=1).max()
        feature_dfs.append(g)

    df_full = pd.concat(feature_dfs, ignore_index=True)
    df_full = df_full.sort_values(by=['recorded_at', 'asset_id']).reset_index(drop=True)
    return df_full

def prepare_factory_splits(
    tables: Dict[str, pd.DataFrame],
    train_frac: float = 0.70,
    val_frac: float = 0.15
) -> Dict[str, Any]:
    df_engineered = engineer_factory_features(tables['sensor_readings'])

    # Operating filter for training tasks
    df_active = df_engineered[df_engineered['is_operating'] == 1].copy().reset_index(drop=True)

    feature_cols = RAW_SENSOR_COLS + [
        f'{col}_roll_mean_6h' for col in RAW_SENSOR_COLS
    ] + [
        f'{col}_roll_std_6h' for col in RAW_SENSOR_COLS
    ] + [
        f'{col}_roll_max_6h' for col in RAW_SENSOR_COLS
    ]

    # Chronological cutoff points
    timestamps = df_active['recorded_at'].sort_values().unique()
    n_ts = len(timestamps)
    t_train_end = timestamps[int(n_ts * train_frac)]
    t_val_end = timestamps[int(n_ts * (train_frac + val_frac))]

    train_mask = df_active['recorded_at'] <= t_train_end
    val_mask = (df_active['recorded_at'] > t_train_end) & (df_active['recorded_at'] <= t_val_end)
    test_mask = df_active['recorded_at'] > t_val_end

    df_train = df_active[train_mask]
    df_val = df_active[val_mask]
    df_test = df_active[test_mask]

    # Targets
    # 1. Degradation stage (Categorical)
    stage_mapping = {'NORMAL': 0, 'EARLY': 1, 'MODERATE': 2, 'SEVERE': 3, 'CRITICAL': 4}
    # Standardize string representations
    def map_stage(s):
        if pd.isna(s):
            return 0
        s_clean = str(s).upper().strip()
        return stage_mapping.get(s_clean, 0)

    # 2. Failure next 24h (Binary)
    # 3. Next failure mode
    mode_mapping = {'NONE': 0, 'BEARING': 1, 'SEAL': 2, 'IMPELLER': 3, 'MOTOR': 4, 'OVERHEAT': 5}
    def map_mode(m):
        if pd.isna(m) or str(m).upper().strip() in ['NONE', 'NAN']:
            return 0
        return mode_mapping.get(str(m).upper().strip(), 0)

    # 4. RUL hours (Regression, filter out NaN or negative)
    X_train = df_train[feature_cols].values
    X_val = df_val[feature_cols].values
    X_test = df_test[feature_cols].values

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    return {
        'scaler': scaler,
        'feature_names': feature_cols,
        'stage_mapping': stage_mapping,
        'mode_mapping': mode_mapping,
        'X_train': X_train_scaled,
        'X_val': X_val_scaled,
        'X_test': X_test_scaled,
        'y_train_stage': df_train['degradation_stage'].apply(map_stage).values,
        'y_val_stage': df_val['degradation_stage'].apply(map_stage).values,
        'y_test_stage': df_test['degradation_stage'].apply(map_stage).values,
        'y_train_fail24': df_train['failure_next_24h'].fillna(0).astype(int).values,
        'y_val_fail24': df_val['failure_next_24h'].fillna(0).astype(int).values,
        'y_test_fail24': df_test['failure_next_24h'].fillna(0).astype(int).values,
        'y_train_rul': df_train['rul_hours'].fillna(720.0).values,
        'y_val_rul': df_val['rul_hours'].fillna(720.0).values,
        'y_test_rul': df_test['rul_hours'].fillna(720.0).values,
        'df_train': df_train,
        'df_test': df_test
    }

