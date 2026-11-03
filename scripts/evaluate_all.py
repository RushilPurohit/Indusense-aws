import subprocess
import logging
import sys
import json
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def run_script(script_path):
    logging.info(f"Running {script_path}...")
    result = subprocess.run([sys.executable, script_path], capture_output=True, text=True)
    if result.returncode != 0:
        logging.error(f"Error in {script_path}:\n{result.stderr}")
    else:
        logging.info(f"Successfully finished {script_path}:\n{result.stdout}")
        
def collect_results():
    combined = {}
    base_dir = Path('ml/checkpoints')
    for task in ['maintenance', 'ocr', 'layout', 'table']:
        res_file = base_dir / task / 'eval_results.json'
        if res_file.exists():
            with open(res_file, 'r') as f:
                combined[task] = json.load(f)
                
    out_file = base_dir / 'combined_eval_results.json'
    with open(out_file, 'w') as f:
        json.dump(combined, f, indent=4)
    logging.info(f"Combined results saved to {out_file}")

def main():
    scripts = [
        'ml/evaluation/evaluate_maintenance.py',
        'ml/evaluation/evaluate_ocr.py',
        'ml/evaluation/evaluate_layout.py',
        'ml/evaluation/evaluate_table.py'
    ]
    
    for script in scripts:
        run_script(script)
        
    collect_results()
    logging.info("All evaluation tasks completed.")

if __name__ == '__main__':
    main()
