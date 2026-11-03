import subprocess
import logging
import sys

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def run_script(script_path):
    logging.info(f"Running {script_path}...")
    result = subprocess.run([sys.executable, script_path], capture_output=True, text=True)
    if result.returncode != 0:
        logging.error(f"Error in {script_path}:\n{result.stderr}")
    else:
        logging.info(f"Successfully finished {script_path}:\n{result.stdout}")
        
def main():
    scripts = [
        'ml/preprocessing/maintenance_preprocessing.py',
        'ml/preprocessing/ocr_preprocessing.py',
        'ml/preprocessing/layout_preprocessing.py',
        'ml/preprocessing/table_preprocessing.py'
    ]
    
    for script in scripts:
        run_script(script)
        
    logging.info("All preprocessing tasks completed.")

if __name__ == '__main__':
    main()
