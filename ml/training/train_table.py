import argparse
import logging
from pathlib import Path
import json
import yaml
import torch
from PIL import Image
from transformers import TableTransformerForObjectDetection, DetrImageProcessor
from transformers import TrainingArguments, Trainer
from torch.utils.data import Dataset

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class TableDataset(Dataset):
    def __init__(self, data_dir, processor):
        self.data_dir = Path(data_dir)
        self.processor = processor
        
        self.annotations = []
        self.images_info = {}
        
        json_path = self.data_dir / 'train.json'
        if json_path.exists():
            with open(json_path, 'r') as f:
                data = json.load(f)
                self.images_info = {img['id']: img for img in data['images']}
                self.annotations = data['annotations']
                
    def __len__(self):
        return len(self.annotations)
        
    def __getitem__(self, idx):
        ann = self.annotations[idx]
        img_info = self.images_info[ann['image_id']]
        img_path = self.data_dir / 'train' / img_info['file_name'] # assuming flat dir from preprocessing
        
        image = Image.open(img_path).convert("RGB")
        
        # Format for DETR
        target = {
            "image_id": torch.tensor([ann['image_id']]),
            "annotations": [ann]
        }
        
        encoding = self.processor(images=image, annotations=target, return_tensors="pt")
        pixel_values = encoding["pixel_values"].squeeze()
        target = encoding["labels"][0]
        
        return {"pixel_values": pixel_values, "labels": target}

def collate_fn(batch):
    pixel_values = [item["pixel_values"] for item in batch]
    labels = [item["labels"] for item in batch]
    batch = {}
    batch["pixel_values"] = torch.stack(pixel_values)
    batch["labels"] = labels
    return batch

def train_table(data_dir, config, out_dir, fast=False):
    logging.info(f"Training Table Transformer on {data_dir}")
    processor = DetrImageProcessor.from_pretrained(config['model']['name'])
    model = TableTransformerForObjectDetection.from_pretrained(config['model']['name'], ignore_mismatched_sizes=True)
    
    dataset = TableDataset(data_dir, processor)
    if len(dataset) == 0:
        logging.warning("Empty dataset.")
        return
        
    if fast:
        dataset = torch.utils.data.Subset(dataset, range(min(50, len(dataset))))
        
    training_args = TrainingArguments(
        output_dir=out_dir,
        per_device_train_batch_size=config['hyperparameters'].get('batch_size', 4),
        num_train_epochs=config['hyperparameters'].get('epochs', 10) if not fast else 1,
        fp16=torch.cuda.is_available(),
        logging_steps=10,
        save_steps=1000,
        remove_unused_columns=False,
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        data_collator=collate_fn,
    )
    
    trainer.train()
    model.save_pretrained(out_dir)
    processor.save_pretrained(out_dir)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', type=str, default='ml/configs/table_config.yaml')
    parser.add_argument('--fast', action='store_true')
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
        
    out_dir = Path(config['output']['checkpoint_dir'])
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Process Word and Latex splits
    for doc_type in ['Word', 'Latex']:
        ds_path = Path(f'ml/datasets/tablebank/{doc_type}')
        if ds_path.exists():
            train_table(ds_path, config, out_dir / doc_type, args.fast)

if __name__ == '__main__':
    main()
