"""
Factory Sensors Dataset Loader
Loads the 5 relational tables: assets, failure_events, sensor_readings, work_orders, sites.
"""

from pathlib import Path
from typing import Dict
import pandas as pd
from .config import FACTORY_DIR

def load_factory_tables(data_dir: Path = FACTORY_DIR) -> Dict[str, pd.DataFrame]:
    if not data_dir.exists():
        raise FileNotFoundError(f"Factory sensors directory not found: {data_dir}")

    tables = {}
    for name in ['assets', 'failure_events', 'sensor_readings', 'work_orders', 'sites']:
        csv_file = data_dir / f"{name}.csv"
        if not csv_file.exists():
            raise FileNotFoundError(f"Required table {name}.csv not found in {data_dir}")
        df = pd.read_csv(csv_file)
        tables[name] = df

    # Parse timestamps
    tables['sensor_readings']['recorded_at'] = pd.to_datetime(tables['sensor_readings']['recorded_at'])
    tables['failure_events']['failed_at'] = pd.to_datetime(tables['failure_events']['failed_at'])
    if 'restored_at' in tables['failure_events'].columns:
        tables['failure_events']['restored_at'] = pd.to_datetime(tables['failure_events']['restored_at'])
    tables['work_orders']['opened_at'] = pd.to_datetime(tables['work_orders']['opened_at'])
    if 'closed_at' in tables['work_orders'].columns:
        tables['work_orders']['closed_at'] = pd.to_datetime(tables['work_orders']['closed_at'])

    return tables

