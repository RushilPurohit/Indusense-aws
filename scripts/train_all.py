import subprocess
import logging
import argparse
import sys

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def run_script(script_path, fast=False):
    logging.info(f"Running {script_path} (Fast: {fast})...")
    cmd = [sys.executable, script_path]
    if fast:
        cmd.append('--fast')
        
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        logging.error(f"Error in {script_path}:\n{result.stderr}")
    else:
        logging.info(f"Successfully finished {script_path}:\n{result.stdout}")
        
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--fast', action='store_true', help="Run fast training for demo")
    args = parser.parse_args()
    
    scripts = [
        'ml/training/train_maintenance.py',
        'ml/training/train_ocr.py',
        'ml/training/train_layout.py',
        'ml/training/train_table.py'
    ]
    
    for script in scripts:
        run_script(script, args.fast)
        
    logging.info("All training tasks completed.")

if __name__ == '__main__':
    main()
