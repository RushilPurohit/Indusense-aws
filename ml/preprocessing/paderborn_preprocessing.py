"""
Paderborn Bearing Preprocessing Pipeline
Grouped physical-bearing evaluation:
- Strict split by physical bearing identity (NO random window mixing between train and test).
- Feature extraction on both vibration and motor phase currents.
- Signal windowing with RMS, Kurtosis, Crest Factor, Skewness, FFT spectral peak & power.
"""

from pathlib import Path
from typing import Dict, List, Tuple, Any
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.preprocessing import StandardScaler

from ml.datasets.config import PADERBORN_DIR
from ml.datasets.paderborn_loader import (
    BEARING_LABELS,
    CLASS_NAMES,
    list_available_bearing_archives,
    extract_mat_from_archive,
    parse_paderborn_mat
)

# Strict Physical Bearing Group Assignments
TRAIN_BEARINGS = ['K001', 'K002', 'K003', 'K004', 'KA01', 'KA03', 'KA05', 'KA06', 'KA07', 'KA08', 'KA09', 'KI01', 'KI03', 'KI04', 'KI05', 'KI07', 'KI08']
VAL_BEARINGS = ['K005', 'KA15', 'KA16', 'KI14', 'KI18']
TEST_BEARINGS = ['K006', 'KA04', 'KA22', 'KA30', 'KI21']
MIXED_BEARINGS = ['KB23', 'KB24', 'KB27']

def compute_signal_features(sig: np.ndarray, fs: float = 64000.0) -> Dict[str, float]:
    """Computes time-domain and frequency-domain statistics on a 1D signal window."""
    if len(sig) == 0:
        return {}
    
    rms = float(np.sqrt(np.mean(sig ** 2)))
    peak = float(np.max(np.abs(sig)))
    p2p = float(np.ptp(sig))
    kurt = float(stats.kurtosis(sig, fisher=False))
    skew = float(stats.skew(sig))
    crest = float(peak / (rms + 1e-9))
    shape = float(rms / (np.mean(np.abs(sig)) + 1e-9))

    # FFT spectral features
    fft_vals = np.abs(np.fft.rfft(sig))
    fft_freqs = np.fft.rfftfreq(len(sig), d=1.0/fs)
    fft_peak_freq = float(fft_freqs[np.argmax(fft_vals[1:]) + 1]) if len(fft_vals) > 1 else 0.0
    spectral_energy = float(np.sum(fft_vals ** 2) / (len(sig) + 1e-9))

    return {
        'rms': rms,
        'peak': peak,
        'p2p': p2p,
        'kurtosis': kurt,
        'skewness': skew,
        'crest_factor': crest,
        'shape_factor': shape,
        'fft_peak_freq': fft_peak_freq,
        'spectral_energy': spectral_energy
    }

def process_bearing_dataset(
    data_dir: Path = PADERBORN_DIR,
    window_size: int = 8192,
    windows_per_mat: int = 15,
    mats_per_archive: int = 2
) -> Dict[str, Any]:
    archives = list_available_bearing_archives(data_dir)
    extracted_root = data_dir / "cache_mats"
    extracted_root.mkdir(parents=True, exist_ok=True)

    rows = []

    for bearing_id, rar_path in archives.items():
        if bearing_id in MIXED_BEARINGS:
            # Documented separate evaluation
            continue
            
        label = BEARING_LABELS[bearing_id]
        
        # Determine split
        if bearing_id in TRAIN_BEARINGS:
            split_group = 'train'
        elif bearing_id in VAL_BEARINGS:
            split_group = 'val'
        elif bearing_id in TEST_BEARINGS:
            split_group = 'test'
        else:
            split_group = 'train'

        mat_files = extract_mat_from_archive(rar_path, max_files=mats_per_archive, target_dir=extracted_root / bearing_id)
        
        for mat_path in mat_files:
            try:
                sig_dict = parse_paderborn_mat(mat_path)
            except Exception as e:
                continue

            vib = sig_dict.get('vibration_1')
            cur1 = sig_dict.get('phase_current_1')
            cur2 = sig_dict.get('phase_current_2')

            if vib is None:
                continue

            n_samples = len(vib)
            step = max(1, (n_samples - window_size) // windows_per_mat)

            for w_idx in range(windows_per_mat):
                start = w_idx * step
                end = start + window_size
                if end > n_samples:
                    break

                row = {
                    'bearing_id': bearing_id,
                    'label': label,
                    'split': split_group,
                    'condition_file': mat_path.stem
                }

                # Vibration features
                vib_w = vib[start:end]
                v_feats = compute_signal_features(vib_w, fs=64000.0)
                for k, val in v_feats.items():
                    row[f'vib_{k}'] = val

                # Motor current 1 features
                if cur1 is not None and len(cur1) >= end:
                    c1_w = cur1[start:end]
                    c1_feats = compute_signal_features(c1_w, fs=64000.0)
                    for k, val in c1_feats.items():
                        row[f'cur1_{k}'] = val

                # Motor current 2 features
                if cur2 is not None and len(cur2) >= end:
                    c2_w = cur2[start:end]
                    c2_feats = compute_signal_features(c2_w, fs=64000.0)
                    for k, val in c2_feats.items():
                        row[f'cur2_{k}'] = val

                rows.append(row)

    df_all = pd.DataFrame(rows)
    feature_cols = [c for c in df_all.columns if c.startswith(('vib_', 'cur1_', 'cur2_'))]

    train_df = df_all[df_all['split'] == 'train'].reset_index(drop=True)
    val_df = df_all[df_all['split'] == 'val'].reset_index(drop=True)
    test_df = df_all[df_all['split'] == 'test'].reset_index(drop=True)

    scaler = StandardScaler()
    X_train = scaler.fit_transform(train_df[feature_cols].values)
    X_val = scaler.transform(val_df[feature_cols].values)
    X_test = scaler.transform(test_df[feature_cols].values)

    return {
        'scaler': scaler,
        'feature_names': feature_cols,
        'class_names': ['Healthy', 'Outer Ring Damage', 'Inner Ring Damage'],
        'X_train': X_train,
        'y_train': train_df['label'].values,
        'train_bearings': train_df['bearing_id'].unique().tolist(),
        'X_val': X_val,
        'y_val': val_df['label'].values,
        'val_bearings': val_df['bearing_id'].unique().tolist(),
        'X_test': X_test,
        'y_test': test_df['label'].values,
        'test_bearings': test_df['bearing_id'].unique().tolist(),
        'full_df': df_all
    }
