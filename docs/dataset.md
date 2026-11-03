# ABB Hackathon — Dataset Mapping & Architecture

This document defines the dataset mapping for the 4 core datasets used in the **ABB Multimodal Maintenance Intelligence Agent**.

---

## Selected Datasets & Roles

| # | Dataset | Model Component | Preprocessing | Output / Artifact | Role in Final System |
|---|---|---|---|---|---|
| **1** | **AI4I 2020 Predictive Maintenance** | Model 4: Industrial Fault Prediction | Sensor normalization, failure type encoding, train/val/test split | Predictive Maintenance Model (`xgboost_ai4i`) | Evaluates machine telemetry (temperature, RPM, torque, tool wear) and predicts machine failure type & risk |
| **2** | **DocLayNet** | Model 2: Document Layout Model | COCO JSON parsing, region bounding box normalization | Layout Understanding Model (`yolo_doclaynet`) | Identifies document structural regions (title, header, paragraph, table, figure, caption) in technical manuals |
| **3** | **TableBank** | Model 3: Table Detection & Extraction | Image crop & COCO table bbox extraction | Table Transformer Model (`table_transformer`) | Detects error-code tables, specification grids, and troubleshooting tables in manuals |
| **4** | **FUNSD** | Model 1: OCR & Noisy Scanned Doc Model | Form image cropping, JSON text bounding box alignment | OCR Model (`trocr_funsd`) | Performs OCR and layout text extraction from scanned, noisy, or low-quality maintenance forms |

---

## Complete Pipeline Integration

```
Uploaded Manual (PDF / Scan) + Telemetry (CSV)
  │
  ├──► FUNSD OCR Model ──────────────► Text & Bounding Boxes
  ├──► DocLayNet Layout Model ───────► Document Structure & Sections
  ├──► TableBank Table Model ────────► Structured Error-Code Tables
  └──► AI4I Predictive Model ────────► Machine Health & Failure Risk
  │
  ▼
Multimodal RAG Engine (Vector DB + Knowledge Graph + Gemini API)
  │
  ▼
Grounded Citation-Backed Troubleshooting Answer & Evidence Viewer
```
