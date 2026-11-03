"""
InduSense Dataset Paths & Configuration Helper
Resolves dataset locations across standard repository paths.
"""

import os
from pathlib import Path

# Resolve base paths
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATASETS_DIR = REPO_ROOT.parent / "Datasets"
if not DATASETS_DIR.exists():
    DATASETS_DIR = REPO_ROOT / "data"

AI4I_DIR = DATASETS_DIR / "ai4i+2020+predictive+maintenance+dataset"
PADERBORN_DIR = DATASETS_DIR / "Bearing"
HYDRAULIC_DIR = DATASETS_DIR / "condition+monitoring+of+hydraulic+systems"
FACTORY_DIR = DATASETS_DIR / "factory-sensors-failure-labels (1)"
if not FACTORY_DIR.exists():
    FACTORY_DIR = DATASETS_DIR / "factory-sensors-failure-labels"

SKF_PDF_PATH = REPO_ROOT.parent.parent / "093168a92d25cc46_pdf_preview_medium.pdf"
if not SKF_PDF_PATH.exists():
    SKF_PDF_PATH = DATASETS_DIR / "093168a92d25cc46_pdf_preview_medium (1).pdf"
if not SKF_PDF_PATH.exists():
    SKF_PDF_PATH = REPO_ROOT / "data" / "SKF_Bearing_Damage_Handbook_2025.pdf"

CHECKPOINTS_DIR = REPO_ROOT / "ml" / "checkpoints"
REGISTRY_DIR = REPO_ROOT / "ml" / "registry"
REPORTS_DIR = REPO_ROOT / "ml" / "reports"

