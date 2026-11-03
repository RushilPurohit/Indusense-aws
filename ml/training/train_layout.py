import argparse
import logging
from pathlib import Path
import yaml
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def train_yolo(data_yaml, config, out_dir, fast=False):
    logging.info(f"Training YOLO layout model on {data_yaml}")
    model_name = config['model']['name']
    model = YOLO(model_name)
    
    epochs = config['hyperparameters'].get('epochs', 30)
    if fast:
        epochs = 2
        
    results = model.train(
        data=str(data_yaml),
        epochs=epochs,
        imgsz=config['hyperparameters'].get('img_size', 640),
        batch=config['hyperparameters'].get('batch_size', 16),
        project=str(out_dir.parent),
        name=out_dir.name,
        exist_ok=True
    )
    
    logging.info(f"Training complete. Model saved in {out_dir}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', type=str, default='ml/configs/layout_config.yaml')
    parser.add_argument('--fast', action='store_true')
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
        
    out_dir = Path(config['output']['checkpoint_dir'])
    
    base_data = Path('ml/datasets')
    for ds in ['publaynet', 'doclaynet']:
        yaml_path = base_data / ds / 'data.yaml'
        if yaml_path.exists():
            train_yolo(yaml_path, config, out_dir / ds, args.fast)

if __name__ == '__main__':
    main()
