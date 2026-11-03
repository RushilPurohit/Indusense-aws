# Model Cards — 4 Core AI/ML Models

This document details the 4 core AI/ML models integrated into the **ABB Multimodal Maintenance Intelligence Agent**.

---

## Model 1: OCR & Noisy Scanned Document Model
- **Purpose**: Extract text and bounding boxes from scanned, noisy, or poor-quality technical forms and manuals.
- **Dataset**: **FUNSD** (Form Understanding in Noisy Scanned Documents)
- **Architecture**: TrOCR (`microsoft/trocr-base-printed`) fine-tuned on FUNSD text regions
- **Input**: Scanned PDF or document image
- **Output**: Extracted text, bounding box coordinates, confidence score
- **Primary Metrics**: Character Error Rate (CER), Word Error Rate (WER)

---

## Model 2: Document Layout Understanding Model
- **Purpose**: Understand structural regions of industrial documentation.
- **Dataset**: **DocLayNet**
- **Architecture**: YOLOv8 Document Layout Detector
- **Classes**: Text, Title, Section-header, Table, Picture, Caption, List-item, Formula, Page-header, Page-footer
- **Input**: Document page image
- **Output**: Bounding boxes + Class labels + Confidence scores
- **Primary Metrics**: mean Average Precision (mAP@0.5, mAP@0.5:0.95), F1-Score

---

## Model 3: Table Understanding & Extraction Model
- **Purpose**: Detect, parse, and extract structured tables (troubleshooting matrices, error code tables) from manuals.
- **Dataset**: **TableBank**
- **Architecture**: Table Transformer (`microsoft/table-transformer-detection`)
- **Input**: Document page image
- **Output**: Table bounding box, row/column structure, JSON/Markdown table format
- **Primary Metrics**: Table Detection mAP, Precision, Recall

---

## Model 4: Industrial Predictive Maintenance Model
- **Purpose**: Predict machine health, failure probability, and fault category from sensor telemetry.
- **Dataset**: **AI4I 2020 Predictive Maintenance Dataset**
- **Architecture**: XGBoost Classifier / Random Forest Classifier
- **Input**: Sensor telemetry (Air Temp, Process Temp, Rotational Speed, Torque, Tool Wear)
- **Output**: Machine Failure Probability, Fault Type (TWF, HDF, PWF, OSF, RNF)
- **Primary Metrics**: Accuracy (**97.13%**), Precision (**73.76%**), Recall (**56.77%**), ROC-AUC (**0.888**)
