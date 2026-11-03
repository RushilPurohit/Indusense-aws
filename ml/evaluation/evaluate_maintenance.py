import argparse
import logging
import json
from pathlib import Path
import numpy as np
import torch
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score, confusion_matrix, mean_squared_error, mean_absolute_error, r2_score
try:
    import xgboost as xgb
except ImportError:
    xgb = None
import joblib
import sys

# Import model from training script
sys.path.append(str(Path(__file__).resolve().parent.parent))
from training.train_maintenance import CNNLSTM

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def calculate_cmapss_score(y_true, y_pred):
    score = 0
    d = y_pred - y_true
    for i in range(len(d)):
        if d[i] < 0:
            score += np.exp(-d[i]/13.0) - 1
        else:
            score += np.exp(d[i]/10.0) - 1
    return score

def evaluate_ai4i(data_dir, model_dir):
    X_test = np.load(data_dir / 'X_test.npy')
    y_test = np.load(data_dir / 'y_test.npy')
    
    json_path = model_dir / 'xgboost_ai4i.json'
    joblib_path = model_dir / 'xgboost_ai4i.joblib'
    
    if json_path.exists() and xgb is not None:
        model = xgb.XGBClassifier()
        model.load_model(json_path)
    elif joblib_path.exists():
        model = joblib.load(joblib_path)
    else:
        logging.error("No valid AI4I model checkpoint found.")
        return {}
    
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if len(np.unique(y_test)) == 2 else model.predict_proba(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='macro')
    auc = roc_auc_score(y_test, y_prob, multi_class='ovr') if len(np.unique(y_test)) > 2 else roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    return {
        'accuracy': float(acc),
        'precision': float(precision),
        'recall': float(recall),
        'f1': float(f1),
        'roc_auc': float(auc),
        'confusion_matrix': cm
    }

def evaluate_cmapss(data_dir, model_path, device='cpu'):
    X_test = np.load(data_dir / 'X_test.npy')
    y_test = np.load(data_dir / 'y_test.npy')
    
    input_size = X_test.shape[2]
    # Default configs from train
    model = CNNLSTM(input_size=input_size, hidden_size=128, num_layers=2)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()
    
    X_tensor = torch.tensor(X_test, dtype=torch.float32).to(device)
    with torch.no_grad():
        y_pred = model(X_tensor).cpu().numpy().flatten()
        
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    nasa_score = calculate_cmapss_score(y_test, y_pred)
    
    return {
        'rmse': float(rmse),
        'mae': float(mae),
        'r2': float(r2),
        'score': float(nasa_score)
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--device', type=str, default='cuda' if torch.cuda.is_available() else 'cpu')
    args = parser.parse_args()
    
    out_dir = Path('ml/checkpoints/maintenance')
    results = {}
    
    if (out_dir / 'xgboost_ai4i.json').exists() or (out_dir / 'xgboost_ai4i.joblib').exists():
        logging.info("Evaluating AI4I model")
        results['ai4i'] = evaluate_ai4i(Path('ml/datasets/ai4i'), out_dir)
        
    cmapss_model = out_dir / 'cnnlstm_cmapss.pth'
    if cmapss_model.exists():
        logging.info("Evaluating C-MAPSS model")
        results['cmapss'] = evaluate_cmapss(Path('ml/datasets/cmapss'), cmapss_model, args.device)
        
    with open(out_dir / 'eval_results.json', 'w') as f:
        json.dump(results, f, indent=4)
        
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    main()
