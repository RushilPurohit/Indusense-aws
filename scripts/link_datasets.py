import argparse
import logging
from pathlib import Path
import shutil
import yaml

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def link_or_copy(src, dst):
    if not src.exists():
        logging.warning(f"Source not found: {src}")
        return
        
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        logging.info(f"Destination already exists: {dst}")
        return
        
    try:
        if src.is_file():
            shutil.copy2(src, dst)
            logging.info(f"Copied {src.name} to {dst}")
        else:
            # We won't copy entire image dirs to avoid duplication,
            # but for AI4I and CMAPSS the user requested to copy.
            logging.info(f"Please use config paths directly for directory {src}")
    except Exception as e:
        logging.error(f"Failed to copy {src}: {e}")

def main():
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    
    config_path = Path('ml/configs/maintenance_config.yaml')
    if not config_path.exists():
        logging.error("Maintenance config not found.")
        return
        
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
        
    ai4i_src = Path(config['dataset_paths']['ai4i'])
    cmapss_src = Path(config['dataset_paths']['cmapss'])
    
    out_dir = Path('ml/datasets')
    
    # Copy AI4I
    link_or_copy(ai4i_src, out_dir / 'ai4i' / ai4i_src.name)
    
    # Copy CMAPSS txt files
    if cmapss_src.exists() and cmapss_src.is_dir():
        cmapss_out = out_dir / 'cmapss'
        cmapss_out.mkdir(parents=True, exist_ok=True)
        for i in range(1, 5):
            for prefix in ['train_', 'test_', 'RUL_']:
                filename = f"{prefix}FD00{i}.txt"
                src = cmapss_src / filename
                if src.exists():
                    link_or_copy(src, cmapss_out / filename)
                    
    logging.info("Dataset linking/copying complete.")

if __name__ == '__main__':
    main()
