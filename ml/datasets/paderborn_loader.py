"""
Paderborn Bearing Datacenter Loader
Extracts MATLAB .mat measurements and metadata from bearing archives.
Preserves true physical bearing identities:
- Healthy: K001 - K006
- Outer race damage: KA01 - KA30
- Inner race damage: KI01 - KI21
- Mixed / complex damage: KB23 - KB27
"""

import os
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Tuple, Any
import numpy as np
import scipy.io

from .config import PADERBORN_DIR

BEARING_LABELS = {
    # 0: Healthy
    'K001': 0, 'K002': 0, 'K003': 0, 'K004': 0, 'K005': 0, 'K006': 0,
    # 1: Outer race damage
    'KA01': 1, 'KA03': 1, 'KA04': 1, 'KA05': 1, 'KA06': 1, 'KA07': 1,
    'KA08': 1, 'KA09': 1, 'KA15': 1, 'KA16': 1, 'KA22': 1, 'KA30': 1,
    # 2: Inner race damage
    'KI01': 2, 'KI03': 2, 'KI04': 2, 'KI05': 2, 'KI07': 2, 'KI08': 2,
    'KI14': 2, 'KI18': 2, 'KI21': 2,
    # 3: Mixed / complex damage (held out / evaluated)
    'KB23': 3, 'KB24': 3, 'KB27': 3
}

CLASS_NAMES = ['Healthy', 'Outer Ring Damage', 'Inner Ring Damage', 'Mixed Damage']

def list_available_bearing_archives(data_dir: Path = PADERBORN_DIR) -> Dict[str, Path]:
    archives = {}
    for rar_path in data_dir.glob("*.rar"):
        bearing_id = rar_path.stem.upper()
        if bearing_id in BEARING_LABELS:
            archives[bearing_id] = rar_path
    return archives

def extract_mat_from_archive(rar_path: Path, max_files: int = 4, target_dir: Path = None) -> List[Path]:
    """Extracts a subset of .mat files from a bearing rar archive."""
    if target_dir is None:
        target_dir = rar_path.parent / "extracted" / rar_path.stem
    target_dir.mkdir(parents=True, exist_ok=True)

    # Check if already extracted
    existing = list(target_dir.glob("*.mat"))
    if len(existing) >= max_files:
        return existing[:max_files]

    # List archive contents using system tar
    list_cmd = ['tar', '-tf', str(rar_path)]
    res = subprocess.run(list_cmd, capture_output=True, text=True)
    all_files = [line.strip() for line in res.stdout.splitlines() if line.strip().endswith('.mat')]

    # Pick representative files across different operating conditions
    selected_files = all_files[:max_files]
    extracted_paths = []

    for rel_path in selected_files:
        extract_cmd = ['tar', '-xf', str(rar_path), '-C', str(target_dir), rel_path]
        subprocess.run(extract_cmd, capture_output=True)
        # Check where it extracted
        cand = target_dir / rel_path
        if cand.exists():
            extracted_paths.append(cand)
        else:
            # Flatten search
            flat = target_dir / Path(rel_path).name
            if flat.exists():
                extracted_paths.append(flat)

    return extracted_paths

def parse_paderborn_mat(mat_file: Path) -> Dict[str, Any]:
    """Parses single Paderborn MATLAB file and extracts vibration and phase currents."""
    mat = scipy.io.loadmat(str(mat_file))
    root_keys = [k for k in mat.keys() if not k.startswith('__')]
    if not root_keys:
        raise ValueError(f"No data struct found in {mat_file}")

    main_struct = mat[root_keys[0]]
    y = main_struct['Y'][0, 0]

    signals = {}
    for i in range(y.shape[1]):
        item = y[0, i]
        name = item['Name'][0] if len(item['Name']) > 0 else f'ch_{i}'
        data_cell = item['Data']
        if data_cell.size > 0:
            arr = data_cell[0]
            signals[name] = arr.flatten().astype(np.float32)

    return signals

