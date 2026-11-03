"""
Automated Test Suite for InduSense ML Pipelines & Backend Integration
Covers Part 10 requirements:
1. Paderborn Bearing Dataset Loader & Grouped Physical Split
2. Factory Sensors Relational Ingestion & Chronological Split
3. Hydraulic 17-Sensor Cycle Statistics & 4 Component Models
4. AI4I Milling Input/Target Isolation & Calibrated Failure Classifier
5. PredictorService Genuine Inference, Pc Calibration, & Model Registry
"""

import sys
import os
from pathlib import Path
import pytest
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from ml.datasets.config import PADERBORN_DIR, FACTORY_DIR, HYDRAULIC_DIR, AI4I_DIR
from ml.datasets.ai4i_loader import load_ai4i_raw
from ml.preprocessing.ai4i_preprocessing import prepare_ai4i_splits, FEATURE_COLS, FAILURE_MODES
from ml.datasets.factory_loader import load_factory_tables
from ml.preprocessing.factory_preprocessing import prepare_factory_splits
from ml.datasets.hydraulic_loader import load_hydraulic_profile, SENSOR_NAMES
from ml.preprocessing.hydraulic_preprocessing import prepare_hydraulic_splits
from ml.datasets.paderborn_loader import (
    list_available_bearing_archives,
    BEARING_LABELS,
    CLASS_NAMES
)
from ml.preprocessing.paderborn_preprocessing import (
    TRAIN_BEARINGS,
    VAL_BEARINGS,
    TEST_BEARINGS,
    MIXED_BEARINGS
)
from ml.registry.model_registry import ModelRegistry
from server.services.predictor_service import PredictorService
from server.services.knowledge_index import knowledge_index
from server.services.alignment_service import AlignmentService

# ==============================================================================
# 1. PADERBORN BEARING TESTS
# ==============================================================================

def test_paderborn_bearing_archives_and_grouped_split():
    archives = list_available_bearing_archives(PADERBORN_DIR)
    assert len(archives) >= 20, f"Expected at least 20 bearing archives, found {len(archives)}"
    
    # Verify label mappings
    assert BEARING_LABELS['K001'] == 0 # Healthy
    assert BEARING_LABELS['KA01'] == 1 # Outer race
    assert BEARING_LABELS['KI01'] == 2 # Inner race
    assert BEARING_LABELS['KB23'] == 3 # Mixed/Complex

    # Verify zero leakage in bearing grouping
    train_set = set(TRAIN_BEARINGS)
    val_set = set(VAL_BEARINGS)
    test_set = set(TEST_BEARINGS)
    mixed_set = set(MIXED_BEARINGS)

    assert len(train_set.intersection(test_set)) == 0, "Data leakage: Train and Test share physical bearings!"
    assert len(train_set.intersection(val_set)) == 0, "Data leakage: Train and Val share physical bearings!"
    assert len(val_set.intersection(test_set)) == 0, "Data leakage: Val and Test share physical bearings!"
    assert len(test_set.intersection(mixed_set)) == 0, "Mixed bearings must not be in primary test set!"

# ==============================================================================
# 2. FACTORY SENSORS TESTS
# ==============================================================================

def test_factory_sensors_relational_and_chronological():
    tables = load_factory_tables(FACTORY_DIR)
    assert 'assets' in tables
    assert 'failure_events' in tables
    assert 'sensor_readings' in tables
    assert 'work_orders' in tables

    df_readings = tables['sensor_readings']
    assert len(df_readings) >= 50000, f"Expected ~52,560 readings, got {len(df_readings)}"

    # Chronological split test
    splits = prepare_factory_splits(tables, train_frac=0.70, val_frac=0.15)
    df_train = splits['df_train']
    df_test = splits['df_test']

    max_train_time = df_train['recorded_at'].max()
    min_test_time = df_test['recorded_at'].min()
    assert max_train_time < min_test_time, "Data leakage: Train set contains future timestamps relative to Test!"

# ==============================================================================
# 3. UCI HYDRAULIC TESTS
# ==============================================================================

def test_hydraulic_17_sensors_and_component_targets():
    profile = load_hydraulic_profile(HYDRAULIC_DIR)
    assert len(profile) == 2205, f"Expected 2205 cycles, got {len(profile)}"
    assert set(profile.columns) == {'cooler_condition', 'valve_condition', 'pump_leakage', 'accumulator_pressure', 'stable_flag'}

    splits = prepare_hydraulic_splits(HYDRAULIC_DIR, train_frac=0.70, val_frac=0.15)
    targets = splits['targets']
    assert 'cooler' in targets
    assert 'valve' in targets
    assert 'pump' in targets
    assert 'accumulator' in targets
    assert splits['X_train'].shape[1] == 17 * 5, "Expected 85 cycle statistics features"

# ==============================================================================
# 4. AI4I 2020 TESTS
# ==============================================================================

def test_ai4i_schema_leakage_and_targets():
    df = load_ai4i_raw(AI4I_DIR)
    assert len(df) == 10000
    assert 'UDI' in df.columns
    assert 'Product ID' in df.columns

    splits = prepare_ai4i_splits(df)
    feature_names = splits['feature_names']
    assert 'UDI' not in feature_names, "UDI leaked into input features!"
    assert 'Product ID' not in feature_names, "Product ID leaked into input features!"
    for m in FAILURE_MODES:
        assert m not in feature_names, f"Target {m} leaked into predictive features!"

    assert splits['X_train'].shape[1] == len(FEATURE_COLS)
    assert len(splits['y_test']) == 1500

# ==============================================================================
# 5. PREDICTOR SERVICE & MODEL REGISTRY TESTS
# ==============================================================================

def test_model_registry_entries():
    reg = ModelRegistry.get_registry()
    active = reg.get('active_models', {})
    assert 'milling' in active
    assert 'pump' in active
    assert 'hydraulic' in active
    assert 'bearing' in active

    models = reg.get('models', {})
    for dom in ['milling', 'pump', 'hydraulic', 'bearing']:
        m_id = active[dom]
        assert m_id in models, f"Model {m_id} not registered"
        assert models[m_id]['status'] == 'Trained'
        assert models[m_id]['calibration'] is not None

def test_predictor_service_genuine_inference():
    # 1. AI4I Inference
    milling_res = PredictorService.predict_domain('milling', {
        'air_temp': 300.0,
        'process_temp': 312.0,
        'rpm': 1200,
        'torque': 68.0,
        'tool_wear': 220
    })
    assert milling_res['execution_mode'] == 'Trained Model'
    assert milling_res['calibrated'] is True
    assert 0.0 <= milling_res['Pc'] <= 1.0
    assert len(milling_res['top_sensors']) > 0

    # 2. Factory Pump Inference
    pump_res = PredictorService.predict_domain('pump', {
        'vibration_mm_s': 7.5,
        'bearing_temp_c': 89.0,
        'motor_current_a': 34.0,
        'discharge_pressure_bar': 4.2,
        'rotor_speed_rpm': 1750
    })
    assert pump_res['execution_mode'] == 'Trained Model'
    assert pump_res['domain'] == 'pump'
    assert pump_res['rul'] is not None

    # 3. Hydraulic Inference
    hyd_res = PredictorService.predict_domain('hydraulic', {
        'PS1': 165.0,
        'TS1': 38.0,
        'FS1': 9.2,
        'VS1': 0.62
    })
    assert hyd_res['execution_mode'] == 'Trained Model'
    assert hyd_res['domain'] == 'hydraulic'

    # 4. Paderborn Bearing Inference
    brg_res = PredictorService.predict_domain('bearing', {
        'kurtosis': 6.2,
        'crest_factor': 4.2,
        'rms': 0.42,
        'fft_peak_freq': 135.0
    })
    assert brg_res['execution_mode'] == 'Trained Model'
    assert brg_res['domain'] == 'bearing'

def test_different_telemetry_changes_predictions():
    # Nominal telemetry
    nom = PredictorService.predict_domain('milling', {
        'air_temp': 298.0,
        'process_temp': 308.0,
        'rpm': 1500,
        'torque': 35.0,
        'tool_wear': 10
    })
    # Overstrain telemetry
    fail = PredictorService.predict_domain('milling', {
        'air_temp': 300.0,
        'process_temp': 312.0,
        'rpm': 1180,
        'torque': 75.0,
        'tool_wear': 230
    })
    assert nom['fault_label'] != fail['fault_label'], "Predictions must dynamically change based on input telemetry!"

