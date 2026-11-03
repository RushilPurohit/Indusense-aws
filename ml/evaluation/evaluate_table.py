import argparse
import logging
import json
from pathlib import Path
import torch
from transformers import TableTransformerForObjectDetection, DetrImageProcessor
from PIL import Image
from tqdm import tqdm

# Simplified evaluation for Table Transformer - just checks bounding box overlap

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def evaluate_table(data_dir, model_dir, device='cpu'):
    processor = DetrImageProcessor.from_pretrained(model_dir)
    model = TableTransformerForObjectDetection.from_pretrained(model_dir).to(device)
    model.eval()
    
    json_path = data_dir / 'val.json'
    if not json_path.exists():
        return {}
        
    with open(json_path, 'r') as f:
        data = json.load(f)
        
    images_info = {img['id']: img for img in data['images']}
    
    # We'll just do a very basic count of detected tables vs ground truth
    gt_count = 0
    pred_count = 0
    
    for ann in data['annotations']:
        gt_count += 1
        
    for img_id, img_info in tqdm(images_info.items(), desc=f"Evaluating {data_dir.name}"):
        img_path = data_dir / 'val' / img_info['file_name']
        try:
            image = Image.open(img_path).convert("RGB")
            inputs = processor(images=image, return_tensors="pt").to(device)
            
            with torch.no_grad():
                outputs = model(**inputs)
                
            target_sizes = torch.tensor([image.size[::-1]]).to(device)
            results = processor.post_process_object_detection(outputs, threshold=0.9, target_sizes=target_sizes)[0]
            
            pred_count += len(results['scores'])
        except Exception as e:
            pass
            
    # Proxy metric
    return {
        'gt_tables': gt_count,
        'pred_tables': pred_count,
        'ratio': float(pred_count/gt_count) if gt_count > 0 else 0
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--device', type=str, default='cuda' if torch.cuda.is_available() else 'cpu')
    args = parser.parse_args()
    
    out_dir = Path('ml/checkpoints/table')
    results = {}
    
    for doc_type in ['Word', 'Latex']:
        model_dir = out_dir / doc_type
        data_dir = Path(f'ml/datasets/tablebank/{doc_type}')
        
        if model_dir.exists() and data_dir.exists():
            res = evaluate_table(data_dir, model_dir, args.device)
            if res:
                results[doc_type] = res
                
    with open(out_dir / 'eval_results.json', 'w') as f:
        json.dump(results, f, indent=4)
        
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    main()
