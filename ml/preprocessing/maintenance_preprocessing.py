import argparse
import logging
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import yaml

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_config(config_path):
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

def preprocess_ai4i(data_path, out_dir):
    logging.info(f"Preprocessing AI4I 2020 Predictive Maintenance dataset from {data_path}")
    df = pd.read_csv(data_path)
    
    # Drop UDI and Product ID
    if 'UDI' in df.columns:
        df = df.drop(['UDI', 'Product ID'], axis=1)
    
    # Encode Type (L, M, H)
    df['Type'] = df['Type'].map({'L': 0, 'M': 1, 'H': 2})
    
    # Target variables are failure types
    target_cols = ['Machine failure', 'TWF', 'HDF', 'PWF', 'OSF', 'RNF']
    feature_cols = [c for c in df.columns if c not in target_cols]
    
    X = df[feature_cols].values
    y = df['Machine failure'].values
    
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
    
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_val = scaler.transform(X_val)
    X_test = scaler.transform(X_test)
    
    out_dir.mkdir(parents=True, exist_ok=True)
    np.save(out_dir / 'X_train.npy', X_train)
    np.save(out_dir / 'X_val.npy', X_val)
    np.save(out_dir / 'X_test.npy', X_test)
    np.save(out_dir / 'y_train.npy', y_train)
    np.save(out_dir / 'y_val.npy', y_val)
    np.save(out_dir / 'y_test.npy', y_test)
    
    logging.info(f"AI4I 2020 preprocessing complete. Saved to {out_dir}")

def main():
    parser = argparse.ArgumentParser(description="Preprocess AI4I 2020 Predictive Maintenance dataset")
    parser.add_argument('--config', type=str, default='ml/configs/maintenance_config.yaml')
    args = parser.parse_args()
    
    config = load_config(args.config)
    ai4i_path = config['dataset_paths']['ai4i']
    out_dir = Path('ml/datasets/ai4i')
    
    if Path(ai4i_path).exists():
        preprocess_ai4i(ai4i_path, out_dir)
    else:
        logging.error(f"AI4I data not found at {ai4i_path}")

if __name__ == '__main__':
    main()
