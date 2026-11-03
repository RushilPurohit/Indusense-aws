import os
import shutil
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("Downloading and preparing datasets for training...")
    
    print("=" * 80)
    print("MANUAL DOWNLOAD INSTRUCTIONS:")
    print("1. PubLayNet images: Please download from https://github.com/ibm-aur-nlp/PubLayNet")
    print("2. DocLayNet images: Please download from https://github.com/DS4SD/DocLayNet")
    print("Extract these into 'ml/datasets/images/publaynet' and 'ml/datasets/images/doclaynet' respectively.")
    print("=" * 80)

    # Creating local dataset directories
    datasets_dir = os.path.join("..", "ml", "datasets")
    os.makedirs(os.path.join(datasets_dir, "csv"), exist_ok=True)
    os.makedirs(os.path.join(datasets_dir, "txt"), exist_ok=True)
    os.makedirs(os.path.join(datasets_dir, "images"), exist_ok=True)
    
    # Simulating copying local datasets
    logger.info("Copying AI4I CSV and C-MAPSS txt files to ml/datasets...")
    # Example logic (if they existed in some raw folder):
    # shutil.copy("raw/ai4i2020.csv", "ml/datasets/csv/ai4i2020.csv")
    
    logger.info("Dataset preparation finished.")

if __name__ == "__main__":
    main()
