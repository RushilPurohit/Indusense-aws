import argparse
import logging
from pathlib import Path
import json
import zipfile
import shutil
from tqdm import tqdm
import yaml

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

CLASS_MAPPING = {
    "text": 0, "title": 1, "header": 2, "paragraph": 3, 
    "table": 4, "figure": 5, "caption": 6, "list": 7, "section": 8
}

def convert_coco_to_yolo(coco_json, out_labels_dir, img_dir, class_map):
    with open(coco_json, 'r') as f:
        data = json.load(f)
        
    images = {img['id']: img for img in data['images']}
    categories = {cat['id']: cat['name'].lower() for cat in data['categories']}
    
    # Check mapping
    cat_to_yolo = {}
    for cat_id, cat_name in categories.items():
        if cat_name in class_map:
            cat_to_yolo[cat_id] = class_map[cat_name]
        else:
            # Try fuzzy matching
            for k, v in class_map.items():
                if k in cat_name:
                    cat_to_yolo[cat_id] = v
                    break
                    
    out_labels_dir.mkdir(parents=True, exist_ok=True)
    
    img_has_annot = set()
    for ann in tqdm(data['annotations'], desc="Converting COCO to YOLO"):
        img_id = ann['image_id']
        if img_id not in images:
            continue
            
        cat_id = ann['category_id']
        if cat_id not in cat_to_yolo:
            continue
            
        yolo_class = cat_to_yolo[cat_id]
        img_info = images[img_id]
        w, h = img_info['width'], img_info['height']
        
        # COCO bbox: [x_min, y_min, width, height]
        bbox = ann['bbox']
        x_center = (bbox[0] + bbox[2] / 2) / w
        y_center = (bbox[1] + bbox[3] / 2) / h
        bw = bbox[2] / w
        bh = bbox[3] / h
        
        # Clip values to 0-1
        x_center = max(0, min(1, x_center))
        y_center = max(0, min(1, y_center))
        bw = max(0, min(1, bw))
        bh = max(0, min(1, bh))
        
        label_file = out_labels_dir / f"{Path(img_info['file_name']).stem}.txt"
        with open(label_file, 'a') as f:
            f.write(f"{yolo_class} {x_center} {y_center} {bw} {bh}\n")
        img_has_annot.add(img_info['file_name'])
        
    return img_has_annot

def process_publaynet(data_dir, out_dir):
    logging.info(f"Processing PubLayNet from {data_dir}")
    data_dir = Path(data_dir)
    out_dir = Path(out_dir)
    
    for split in ['train', 'val']:
        json_path = data_dir / f"{split}.json"
        img_src_dir = data_dir / split
        if not json_path.exists() or not img_src_dir.exists():
            continue
            
        labels_dir = out_dir / 'labels' / split
        img_dest_dir = out_dir / 'images' / split
        img_dest_dir.mkdir(parents=True, exist_ok=True)
        
        annotated_images = convert_coco_to_yolo(json_path, labels_dir, img_src_dir, CLASS_MAPPING)
        
        for img_name in tqdm(annotated_images, desc=f"Copying {split} images"):
            src = img_src_dir / img_name
            if src.exists():
                shutil.copy2(src, img_dest_dir / img_name)

def process_doclaynet(data_dir, out_dir):
    logging.info(f"Processing DocLayNet from {data_dir}")
    data_dir = Path(data_dir)
    out_dir = Path(out_dir)
    
    temp_dir = out_dir / 'temp'
    if data_dir.is_file() and data_dir.suffix == '.zip':
        logging.info("Extracting DocLayNet zip...")
        with zipfile.ZipFile(data_dir, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        src_base = temp_dir / 'DocLayNet' # Assume structure
    else:
        src_base = data_dir
        
    if not src_base.exists():
        src_base = temp_dir
        
    for split in ['train', 'val']:
        json_path = src_base / 'COCO' / f"{split}.json"
        img_src_dir = src_base / 'PNG' # Often PNG
        if not json_path.exists():
            continue
            
        labels_dir = out_dir / 'labels' / split
        img_dest_dir = out_dir / 'images' / split
        img_dest_dir.mkdir(parents=True, exist_ok=True)
        
        annotated_images = convert_coco_to_yolo(json_path, labels_dir, img_src_dir, CLASS_MAPPING)
        
        for img_name in tqdm(annotated_images, desc=f"Copying {split} images"):
            src = img_src_dir / img_name
            if src.exists():
                shutil.copy2(src, img_dest_dir / img_name)
                
    if temp_dir.exists():
        shutil.rmtree(temp_dir)

def create_yaml(out_dir):
    yaml_content = {
        'path': str(out_dir.absolute()),
        'train': 'images/train',
        'val': 'images/val',
        'names': {v: k for k, v in CLASS_MAPPING.items()}
    }
    with open(out_dir / 'data.yaml', 'w') as f:
        yaml.dump(yaml_content, f)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', type=str, default='ml/configs/layout_config.yaml')
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
        
    out_base = Path('ml/datasets')
    
    pub_path = config['dataset_paths'].get('publaynet')
    if pub_path:
        out_pub = out_base / 'publaynet'
        process_publaynet(pub_path, out_pub)
        create_yaml(out_pub)
        
    doc_path = config['dataset_paths'].get('doclaynet')
    if doc_path:
        out_doc = out_base / 'doclaynet'
        process_doclaynet(doc_path, out_doc)
        create_yaml(out_doc)

if __name__ == '__main__':
    main()
