# InduSense — Intelligent Industrial Maintenance
### Confidence-Aware & Evidence-Grounded Predictive Maintenance Platform

---

## 1. Executive Summary

**InduSense** is a unified industrial maintenance intelligence platform that overcomes the primary vulnerability of standard industrial RAG: the **Semantic Proximity Fallacy**. 

In conventional RAG systems, textual queries retrieve passages based purely on word overlap (e.g. ambient air delta, shaft speed, or pressure ratings), often citing manuals for completely unrelated machine subsystems (e.g., applying a pneumatic chuck clamp procedure to a spindle cooling thermal dissipation failure). 

InduSense prevents this by integrating predictive sensor telemetry with technical documentation into **one connected 6-stage pipeline**:

$$\mathbf{PREDICT} \longrightarrow \mathbf{RETRIEVE} \longrightarrow \mathbf{ALIGN} \longrightarrow \mathbf{VALIDATE} \longrightarrow \mathbf{ADAPT} \longrightarrow \mathbf{EXPLAIN}$$

Every screen across the platform is a view onto **one shared object**: the **Diagnosis Case**.

---

## 2. Connected Pipeline Architecture

```
                     ┌─────────────────────────────────────────┐
                     │          DIAGNOSIS CASE WORKSPACE        │
                     └────────────────────┬────────────────────┘
                                          │
       ┌──────────────────────────────────┴──────────────────────────────────┐
       ▼                                                                     ▼
[ SENSOR TELEMETRY ]                                              [ TECHNICAL MANUALS & KG ]
(AI4I, C-MAPSS, FEMTO)                                             (Synthetic Manuals Corpus)
       │                                                                     │
       ▼                                                                     ▼
┌──────────────┐               ┌──────────────┐               ┌──────────────┐
│  1. PREDICT  │ ────────────> │ 2. RETRIEVE  │ ────────────> │   3. ALIGN   │
│ Condition Pc │               │ Dense Vector │               │ CEA Matrix & │
│ Calibrated   │               │ + KG Triples │               │ KG Reasoning │
└──────────────┘               └──────────────┘               └──────┬───────┘
                                                                     │
       ┌─────────────────────────────────────────────────────────────┘
       ▼
┌──────────────┐               ┌──────────────┐               ┌──────────────┐
│ 4. VALIDATE  │ ────────────> │   5. ADAPT   │ ────────────> │  6. EXPLAIN  │
│ Pc, Rc, Oc,  │               │ Cloud Router │               │ Citations &  │
│ CEA Fusion   │               │ L / S / H    │               │ Human Signoff│
└──────────────┘               └──────────────┘               └──────────────┘
```

---

## 3. Quick Start (Single Command)

InduSense runs out-of-the-box with **zero AWS credentials** and zero mandatory external database dependencies (using built-in SQLite & in-memory fallbacks):

```bash
# 1. Navigate to the project root
cd abb-maintenance-intelligence

# 2. Run the unified launcher
python run_indusense.py
```

This single command:
1. Runs `seed.py` to seed Hero Cases, Fleet Assets, and Synthetic Manuals
2. Starts the **FastAPI Backend** on `http://localhost:8000` (Swagger docs at `/docs`)
3. Starts the **Vite Frontend Dev Server** on `http://localhost:5173`

---

## 4. Manual Execution

### Backend
```bash
python seed.py
python -m uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload
```
Health check: `http://localhost:8000/health`

### Frontend
```bash
cd frontend
npm install        # On Windows: npm.cmd install
npm run dev        # On Windows: npm.cmd run dev
```
Open `http://localhost:5173` in your browser.

### Run Unit Tests
```bash
pytest tests/test_indusense_pipeline.py -v
```

---

## 5. Information Architecture (6 Core Screens)

1. **Operations (`/operations`)**: Fleet overview, multi-sensor telemetry trace on a dark well (`#1E293B`), measured stage throughput list, and the "Predictions & Evidence Alignment" table with red left borders on critical rows.
2. **Cases (`/cases` & `/cases/:id`)**: Diagnosis queue with CEA verdict and router path filters, plus the **Case Workspace**:
   - **Left Pane (PREDICT)**: Calibrated condition probability $P_c$, RUL interval, top contributing sensors, bearing spectral indicators (FFT envelope peak at 108.4 Hz, kurtosis).
   - **Center Pane (RETRIEVE)**: Ranked evidence candidates, $R_c$ and $O_c$, inline BBox viewer, and explicit **Semantic Proximity Fallacy warnings**.
   - **Right Pane (ALIGN + VALIDATE)**: CEA Checklist Matrix (Component, Fault, Symptom, Action), Knowledge Graph path, and Reliability panel ($P_c, R_c, O_c, \text{CEA}$).
   - **Docked Panel (ADAPT + EXPLAIN)**: Distinct sourced facts vs. generated text, citation chips, scoped case Q&A assistant, and human review sign-off buttons (**Accept**, **Escalate**, **Reject**).
   - **Footer**: Traceable verification timeline with measured durations.
3. **Knowledge Base (`/knowledge`)**: Tabs for Documents (drag-and-drop upload with real progress and 6-stage ingestion), Knowledge Graph (interactive component graph with origin filters), and Ingestion Quality benchmarks.
4. **Cloud Router (`/router`)**: 3 path cards (`LIGHT`, `STANDARD`, `HEAVY`), interactive sandbox sliders for $P_c, O_c, R_c, \text{CEA}$, and AWS Integration Matrix.
5. **Research (`/research`)**: Architectural comparison matrix (DL-only vs. Plain RAG vs. Prediction+RAG vs. InduSense), dataset rationale, and Research Gaps 1–5.
6. **Settings (`/settings`)**: User profile and illustrative fusion weight hypotheses.

---

## 6. Hero Demo Cases (Seed Data)

- **Case A: CNC-M102 (UCI AI4I 2020)**:
  - *Predicted Condition*: Heat Dissipation Failure (HDF) with $P_c = 0.94$ (Calibrated).
  - *Candidate 1 (Distractor)*: Pneumatic chuck clamp manual ($R_c = 0.88$) matches words like "ambient air delta", but targets the wrong subsystem $\rightarrow \text{CEA} = 0.21$ (**CONFLICT**, Rejected).
  - *Candidate 2 (True Manual)*: Spindle cooling manual $\rightarrow \text{CEA} = 0.95$ (**ALIGNED**).
  - *Routing*: **LIGHT PATH**.
- **Case B: BRG-301 (FEMTO Bearing)**:
  - *Predicted Condition*: Outer-race spalling (kurtosis 5.82, 108.4 Hz BPFO envelope peak) $\rightarrow \text{CEA} = 0.91$ (**ALIGNED**).
  - *Routing*: **STANDARD PATH**.
- **Case C: TURBO-TF004 (NASA C-MAPSS FD001)**:
  - *Predicted Condition*: HPC Degradation (RUL 42 cycles, $[35, 49]$ interval), but no technical manual exists in the corpus $\rightarrow$ **INSUFFICIENT EVIDENCE**.
  - *Routing*: **HEAVY PATH** + Mandatory engineering escalation.

---

## 7. Status of Integrations & External Services

| Service | Adapter Mode | Description / Local Implementation |
|---|---|---|
| **Storage (S3)** | `mock` | Local filesystem storage (`/uploads` and `/data`). S3 credentials unconfigured. |
| **OCR Engine (Textract)** | `mock` | Local PyPDF and layout parser active. AWS Textract adapter mocked. |
| **Inference (SageMaker)** | `mock` | Local Scikit-Learn/XGBoost CPU predictor active. SageMaker unconfigured. |
| **Vector Index (OpenSearch)** | `mock` | In-memory cosine similarity and hybrid graph index active. OpenSearch unconfigured. |
| **LLM Reasoning (Bedrock)** | `mock` | Local deterministic template synthesizer active. Bedrock Claude 3 adapter mocked. |
| **Routing Dispatch (Lambda)** | `mock` | In-process Python rule engine active. AWS Lambda adapter mocked. |
| **Telemetry (CloudWatch)** | `mock` | Local structured logging active. CloudWatch adapter mocked. |

---

## 8. Frontend Offline Fallback Adapter

If the FastAPI backend server is stopped or unreachable, the frontend automatically falls back to an internal **Mock Adapter**, displaying a cyan `"MOCK ADAPTER ACTIVE"` badge in the global top bar. The full interactive experience, including Hero Cases, case creation, and routing simulation, remains 100% functional for presentations and demonstrations.
