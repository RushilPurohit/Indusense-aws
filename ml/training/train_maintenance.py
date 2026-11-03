import argparse
import logging
import json
import yaml
from pathlib import Path
import numpy as np
try:
    from xgboost import XGBClassifier
except ImportError:
    from sklearn.ensemble import RandomForestClassifier as XGBClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def train_ai4i(data_dir, out_dir, fast=False):
    logging.info("Training Predictive Maintenance Model on AI4I 2020 dataset")
    try:
        X_train = np.load(data_dir / 'X_train.npy')
        y_train = np.load(data_dir / 'y_train.npy')
        X_val = np.load(data_dir / 'X_val.npy')
        y_val = np.load(data_dir / 'y_val.npy')
    except Exception as e:
        logging.error(f"Failed to load AI4I data: {e}")
        return {}
        
    if fast:
        idx = np.random.choice(len(X_train), size=int(0.2 * len(X_train)), replace=False)
        X_train, y_train = X_train[idx], y_train[idx]
        
    model = XGBClassifier(n_estimators=100 if not fast else 10, random_state=42)
    try:
        model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
    except TypeError:
        model.fit(X_train, y_train)
    
    val_preds = model.predict(X_val)
    acc = accuracy_score(y_val, val_preds)
    precision, recall, f1, _ = precision_recall_fscore_support(y_val, val_preds, average='macro')
    logging.info(f"AI4I 2020 Validation Accuracy: {acc:.4f}, F1: {f1:.4f}")
    
    out_dir.mkdir(parents=True, exist_ok=True)
    if hasattr(model, 'save_model'):
        model.save_model(out_dir / 'xgboost_ai4i.json')
    else:
        import joblib
        joblib.dump(model, out_dir / 'xgboost_ai4i.joblib')
    
    metrics = {
        'ai4i_val_accuracy': float(acc),
        'ai4i_val_precision': float(precision),
        'ai4i_val_recall': float(recall),
        'ai4i_val_f1': float(f1)
    }
    return metrics

def main():
    parser = argparse.ArgumentParser(description="Train AI4I 2020 Predictive Maintenance Model")
    parser.add_argument('--config', type=str, default='ml/configs/maintenance_config.yaml')
    parser.add_argument('--fast', action='store_true')
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
        
    out_dir = Path(config['output']['checkpoint_dir'])
    out_dir.mkdir(parents=True, exist_ok=True)
    
    metrics = train_ai4i(Path('ml/datasets/ai4i'), out_dir, args.fast)
            
    with open(out_dir / 'metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)

if __name__ == '__main__':
    main()
