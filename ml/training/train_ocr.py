import argparse
import logging
from pathlib import Path
import json
import yaml
import torch
from torch.utils.data import Dataset
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel, Seq2SeqTrainer, Seq2SeqTrainingArguments
from datasets import load_metric

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class OCRDataset(Dataset):
    def __init__(self, data_dir, processor, max_target_length=128):
        self.data_dir = Path(data_dir)
        self.processor = processor
        self.max_target_length = max_target_length
        self.labels = []
        self.images_dir = self.data_dir / 'images'
        
        for split in ['train', 'test', 'training_data', 'testing_data']:
            label_file = self.data_dir / f'{split}_labels.txt'
            if label_file.exists():
                with open(label_file, 'r', encoding='utf-8') as f:
                    for line in f:
                        parts = line.strip().split('\t')
                        if len(parts) >= 2:
                            self.labels.append((parts[0], parts[1]))
                            
    def __len__(self):
        return len(self.labels)
        
    def __getitem__(self, idx):
        img_name, text = self.labels[idx]
        img_path = self.images_dir / img_name
        
        try:
            image = Image.open(img_path).convert("RGB")
        except Exception as e:
            image = Image.new('RGB', (128, 32), color='white')
            text = ""
            
        pixel_values = self.processor(image, return_tensors="pt").pixel_values.squeeze()
        labels = self.processor.tokenizer(text, padding="max_length", max_length=self.max_target_length).input_ids
        labels = [label if label != self.processor.tokenizer.pad_token_id else -100 for label in labels]
        
        return {"pixel_values": pixel_values, "labels": torch.tensor(labels)}

def compute_metrics(pred, processor):
    labels_ids = pred.label_ids
    pred_ids = pred.predictions

    pred_str = processor.batch_decode(pred_ids, skip_special_tokens=True)
    labels_ids[labels_ids == -100] = processor.tokenizer.pad_token_id
    label_str = processor.batch_decode(labels_ids, skip_special_tokens=True)

    cer_metric = load_metric("cer")
    cer = cer_metric.compute(predictions=pred_str, references=label_str)

    return {"cer": cer}

def train_trocr(data_dir, config, out_dir, fast=False):
    logging.info(f"Training TrOCR on {data_dir}")
    processor = TrOCRProcessor.from_pretrained(config['model']['name'])
    model = VisionEncoderDecoderModel.from_pretrained(config['model']['name'])
    
    # Configure model for sequence generation
    model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
    model.config.pad_token_id = processor.tokenizer.pad_token_id
    model.config.vocab_size = model.config.decoder.vocab_size
    
    dataset = OCRDataset(data_dir, processor)
    if len(dataset) == 0:
        logging.warning("Empty dataset.")
        return
        
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    if fast:
        train_dataset = torch.utils.data.Subset(train_dataset, range(min(100, len(train_dataset))))
        val_dataset = torch.utils.data.Subset(val_dataset, range(min(20, len(val_dataset))))
        
    training_args = Seq2SeqTrainingArguments(
        predict_with_generate=True,
        evaluation_strategy="steps",
        per_device_train_batch_size=config['hyperparameters'].get('batch_size', 8),
        per_device_eval_batch_size=config['hyperparameters'].get('batch_size', 8),
        fp16=torch.cuda.is_available(), 
        output_dir=out_dir,
        logging_steps=10,
        save_steps=1000,
        eval_steps=1000,
        num_train_epochs=config['hyperparameters'].get('epochs', 5) if not fast else 1,
    )
    
    trainer = Seq2SeqTrainer(
        model=model,
        tokenizer=processor.image_processor,
        args=training_args,
        compute_metrics=lambda pred: compute_metrics(pred, processor),
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        data_collator=None,
    )
    
    trainer.train()
    trainer.save_model(out_dir)
    processor.save_pretrained(out_dir)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', type=str, default='ml/configs/ocr_config.yaml')
    parser.add_argument('--dataset', type=str, choices=['iiit5k', 'funsd', 'sroie', 'all'], default='all')
    parser.add_argument('--fast', action='store_true')
    parser.add_argument('--epochs', type=int)
    parser.add_argument('--batch-size', type=int)
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
        
    if args.epochs:
        config['hyperparameters']['epochs'] = args.epochs
    if args.batch_size:
        config['hyperparameters']['batch_size'] = args.batch_size
        
    out_dir = Path(config['output']['checkpoint_dir'])
    out_dir.mkdir(parents=True, exist_ok=True)
    
    base_data = Path('ml/datasets')
    datasets = [args.dataset] if args.dataset != 'all' else ['iiit5k', 'funsd', 'sroie']
    
    for ds in datasets:
        ds_path = base_data / ds
        if ds_path.exists():
            ds_out = out_dir / ds
            train_trocr(ds_path, config, ds_out, args.fast)

if __name__ == '__main__':
    main()
