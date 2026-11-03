import argparse
import logging
import json
from pathlib import Path
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from datasets import load_metric
from PIL import Image
from tqdm import tqdm

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def evaluate_trocr(data_dir, model_dir, device='cpu'):
    processor = TrOCRProcessor.from_pretrained(model_dir)
    model = VisionEncoderDecoderModel.from_pretrained(model_dir).to(device)
    model.eval()
    
    cer_metric = load_metric("cer")
    wer_metric = load_metric("wer")
    
    preds = []
    refs = []
    exact_matches = 0
    total = 0
    
    labels_file = data_dir / 'test_labels.txt'
    if not labels_file.exists():
        labels_file = data_dir / 'testing_data_labels.txt'
    if not labels_file.exists():
        return {}
        
    images_dir = data_dir / 'images'
    
    with open(labels_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for line in tqdm(lines, desc=f"Evaluating {data_dir.name}"):
        parts = line.strip().split('\t')
        if len(parts) < 2:
            continue
        img_name, text = parts[0], parts[1]
        
        img_path = images_dir / img_name
        try:
            image = Image.open(img_path).convert("RGB")
            pixel_values = processor(image, return_tensors="pt").pixel_values.to(device)
            
            with torch.no_grad():
                generated_ids = model.generate(pixel_values)
                
            generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            preds.append(generated_text)
            refs.append(text)
            
            if generated_text.strip().lower() == text.strip().lower():
                exact_matches += 1
            total += 1
        except Exception as e:
            pass
            
    if total == 0:
        return {}
        
    cer = cer_metric.compute(predictions=preds, references=refs)
    wer = wer_metric.compute(predictions=preds, references=refs)
    accuracy = exact_matches / total
    
    return {
        'cer': float(cer),
        'wer': float(wer),
        'accuracy': float(accuracy)
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--device', type=str, default='cuda' if torch.cuda.is_available() else 'cpu')
    args = parser.parse_args()
    
    out_dir = Path('ml/checkpoints/ocr')
    results = {}
    
    for ds in ['iiit5k', 'funsd', 'sroie']:
        model_dir = out_dir / ds
        data_dir = Path('ml/datasets') / ds
        if model_dir.exists() and data_dir.exists():
            res = evaluate_trocr(data_dir, model_dir, args.device)
            if res:
                results[ds] = res
                
    with open(out_dir / 'eval_results.json', 'w') as f:
        json.dump(results, f, indent=4)
        
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    main()
