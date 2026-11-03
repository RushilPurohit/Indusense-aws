import argparse
import logging
import json
from pathlib import Path
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def evaluate_yolo(data_yaml, model_path):
    model = YOLO(model_path)
    metrics = model.val(data=str(data_yaml))
    
    res = {
        'map50': float(metrics.box.map50),
        'map': float(metrics.box.map),
    }
    # Per class metrics can be extracted if needed
    return res

def main():
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    
    out_dir = Path('ml/checkpoints/layout')
    results = {}
    
    for ds in ['publaynet', 'doclaynet']:
        model_path = out_dir / ds / 'weights' / 'best.pt'
        data_yaml = Path('ml/datasets') / ds / 'data.yaml'
        
        if model_path.exists() and data_yaml.exists():
            logging.info(f"Evaluating {ds}")
            results[ds] = evaluate_yolo(data_yaml, model_path)
            
    with open(out_dir / 'eval_results.json', 'w') as f:
        json.dump(results, f, indent=4)
        
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    main()
