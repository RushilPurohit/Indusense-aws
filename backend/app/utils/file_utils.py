import os
from pathlib import Path

def validate_file_extension(filename: str, allowed: list) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in allowed

def get_temp_path(filename: str) -> Path:
    return Path("/tmp") / filename
