import argparse
import logging
from pathlib import Path
import json
import shutil
from tqdm import tqdm
import yaml

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def process_tablebank(data_dir, out_dir):
    logging.info(f"Processing TableBank from {data_dir}")
    data_dir = Path(data_dir)
    out_dir = Path(out_dir)
    
    # TableBank annotations are usually in Word/Latex folders with a combined json
    # For this script, we parse COCO-like format
    
    for doc_type in ['Word', 'Latex']:
        json_path = data_dir / doc_type / f"{doc_type}.json"
        img_src_dir = data_dir / doc_type / 'images'
        
        if not json_path.exists():
            continue
            
        with open(json_path, 'r') as f:
            data = json.load(f)
            
        images = {img['id']: img for img in data['images']}
        
        # HuggingFace Table Transformer expects COCO format directly
        # We will split it into train/val and copy images
        
        train_out = out_dir / doc_type / 'train'
        val_out = out_dir / doc_type / 'val'
        train_out.mkdir(parents=True, exist_ok=True)
        val_out.mkdir(parents=True, exist_ok=True)
        
        # Simple split based on image id
        img_ids = list(images.keys())
        split_idx = int(len(img_ids) * 0.8)
        train_ids = set(img_ids[:split_idx])
        val_ids = set(img_ids[split_idx:])
        
        train_data = {'images': [], 'annotations': [], 'categories': data['categories']}
        val_data = {'images': [], 'annotations': [], 'categories': data['categories']}
        
        for ann in tqdm(data['annotations'], desc=f"Splitting {doc_type} annotations"):
            img_id = ann['image_id']
            if img_id in train_ids:
                train_data['annotations'].append(ann)
            elif img_id in val_ids:
                val_data['annotations'].append(ann)
                
        for img_id, img_info in images.items():
            src_img = img_src_dir / img_info['file_name']
            if not src_img.exists():
                continue
            if img_id in train_ids:
                train_data['images'].append(img_info)
                shutil.copy2(src_img, train_out / img_info['file_name'])
            else:
                val_data['images'].append(img_info)
                shutil.copy2(src_img, val_out / img_info['file_name'])
                
        with open(out_dir / doc_type / 'train.json', 'w') as f:
            json.dump(train_data, f)
        with open(out_dir / doc_type / 'val.json', 'w') as f:
            json.dump(val_data, f)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', type=str, default='ml/configs/table_config.yaml')
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
        
    out_dir = Path('ml/datasets/tablebank')
    tb_path = config['dataset_paths'].get('tablebank')
    
    if tb_path:
        process_tablebank(tb_path, out_dir)

if __name__ == '__main__':
    main()
