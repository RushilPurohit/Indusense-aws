import argparse
import logging
from pathlib import Path
import json
import base64
from PIL import Image
import io
import pandas as pd
from tqdm import tqdm

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def process_iiit5k(data_dir, out_dir):
    logging.info(f"Processing IIIT5K from {data_dir}")
    data_dir = Path(data_dir)
    out_dir = Path(out_dir)
    img_dir = out_dir / 'images'
    img_dir.mkdir(parents=True, exist_ok=True)
    
    def process_csv(csv_name, split):
        csv_path = data_dir / csv_name
        if not csv_path.exists():
            logging.warning(f"{csv_path} not found.")
            return
            
        df = pd.read_csv(csv_path)
        labels = []
        for idx, row in tqdm(df.iterrows(), total=len(df), desc=f"IIIT5K {split}"):
            # Assuming row has image content or path. If base64 encoded as per requirements:
            # But the dataset usually has paths. The prompt says it contains base64 encoded images.
            # I will handle both cases defensively.
            try:
                img_data = row.get('image_data', '')
                if img_data:
                    img_bytes = base64.b64decode(img_data)
                    img = Image.open(io.BytesIO(img_bytes))
                else:
                    img_path = data_dir / row.get('filename', '')
                    if img_path.exists():
                        img = Image.open(img_path)
                    else:
                        continue
                
                img_name = f"{split}_{idx}.jpg"
                img = img.resize((128, 32))
                img.save(img_dir / img_name)
                labels.append(f"{img_name}\t{row.get('label', '')}")
            except Exception as e:
                pass
                
        with open(out_dir / f'{split}_labels.txt', 'w') as f:
            f.write("\n".join(labels))

    process_csv('traindata.csv', 'train')
    process_csv('testdata.csv', 'test')

def process_funsd(data_dir, out_dir):
    logging.info(f"Processing FUNSD from {data_dir}")
    data_dir = Path(data_dir)
    out_dir = Path(out_dir)
    img_dir = out_dir / 'images'
    img_dir.mkdir(parents=True, exist_ok=True)
    
    for split in ['training_data', 'testing_data']:
        split_dir = data_dir / split
        if not split_dir.exists():
            continue
            
        annot_dir = split_dir / 'annotations'
        images_dir = split_dir / 'images'
        
        labels = []
        for annot_file in tqdm(list(annot_dir.glob('*.json')), desc=f"FUNSD {split}"):
            try:
                with open(annot_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                img_path = images_dir / f"{annot_file.stem}.png"
                if not img_path.exists():
                    continue
                    
                img = Image.open(img_path)
                for i, form in enumerate(data.get('form', [])):
                    box = form.get('box')
                    text = form.get('text', '').strip()
                    if not text or not box:
                        continue
                    # box: [left, top, right, bottom]
                    crop_img = img.crop((box[0], box[1], box[2], box[3]))
                    crop_name = f"{split}_{annot_file.stem}_{i}.jpg"
                    crop_img.save(img_dir / crop_name)
                    labels.append(f"{crop_name}\t{text}")
            except Exception as e:
                pass
                
        with open(out_dir / f'{split}_labels.txt', 'w', encoding='utf-8') as f:
            f.write("\n".join(labels))

def process_sroie(data_dir, out_dir):
    logging.info(f"Processing SROIE from {data_dir}")
    data_dir = Path(data_dir)
    out_dir = Path(out_dir)
    img_dir = out_dir / 'images'
    img_dir.mkdir(parents=True, exist_ok=True)
    
    for split in ['train', 'test']:
        split_dir = data_dir / split
        if not split_dir.exists():
            continue
            
        labels = []
        # SROIE format: images and txt files
        for img_path in tqdm(list(split_dir.glob('*.jpg')), desc=f"SROIE {split}"):
            txt_path = img_path.with_suffix('.txt')
            if not txt_path.exists():
                continue
                
            try:
                img = Image.open(img_path)
                with open(txt_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    
                for i, line in enumerate(lines):
                    parts = line.strip().split(',')
                    if len(parts) >= 9:
                        # x1,y1,x2,y2,x3,y3,x4,y4,text
                        # For simplicity, taking bounding box of min/max
                        x_coords = [int(parts[0]), int(parts[2]), int(parts[4]), int(parts[6])]
                        y_coords = [int(parts[1]), int(parts[3]), int(parts[5]), int(parts[7])]
                        left, right = min(x_coords), max(x_coords)
                        top, bottom = min(y_coords), max(y_coords)
                        text = ','.join(parts[8:]).strip()
                        
                        if right <= left or bottom <= top or not text:
                            continue
                            
                        crop_img = img.crop((left, top, right, bottom))
                        crop_name = f"{split}_{img_path.stem}_{i}.jpg"
                        crop_img.save(img_dir / crop_name)
                        labels.append(f"{crop_name}\t{text}")
            except Exception as e:
                pass
                
        with open(out_dir / f'{split}_labels.txt', 'w', encoding='utf-8') as f:
            f.write("\n".join(labels))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', type=str, default='ml/configs/ocr_config.yaml')
    args = parser.parse_args()
    
    import yaml
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
        
    out_base = Path('ml/datasets')
    
    iiit5k_path = config['dataset_paths'].get('iiit5k')
    if iiit5k_path:
        process_iiit5k(iiit5k_path, out_base / 'iiit5k')
        
    funsd_path = config['dataset_paths'].get('funsd')
    if funsd_path:
        process_funsd(funsd_path, out_base / 'funsd')
        
    sroie_path = config['dataset_paths'].get('sroie')
    if sroie_path:
        process_sroie(sroie_path, out_base / 'sroie')

if __name__ == '__main__':
    main()
