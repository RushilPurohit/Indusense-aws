# Model Card: AI4I Milling Calibrated Classifier

## 1. Overview
- **Model ID**: `ai4i_milling_failure_classifier`
- **Version**: `2.0.0`
- **Machine Domain**: `milling`
- **Training Dataset**: `AI4I 2020 Predictive Maintenance`
- **Dataset Nature**: `Synthetic`
- **Trained At**: `2026-10-31T12:08:41.167419+00:00`
- **Artifact Path**: `ml/checkpoints/ai4i/ai4i_pipeline.joblib`
- **Status**: `Trained`

## 2. Prediction Objective
- Domain-specific condition monitoring and anomaly diagnostics for milling equipment.
- Predicts machine failure state, component degradation level, or fault mode.

## 3. Probability Calibration
- **Status**: `Validated (Sigmoid / Platt scaling)`
- **Method**: Sigmoid / Platt scaling on cross-validated holdout splits.
- Calibrated confidence metric ($P_c$) represents true posterior probability rather than raw neural softmax.

## 4. Evaluation Metrics on Held-out Unseen Test Set
```json
{
  "accuracy": 0.9933,
  "precision": 0.9556,
  "recall": 0.8431,
  "f1_score": 0.8958,
  "roc_auc": 0.9876,
  "brier_score": 0.0055,
  "ece": 0.007,
  "calibration_status": "Calibrated (Sigmoid / Platt scaling on validation fold)",
  "confusion_matrix": [
    [
      1447,
      2
    ],
    [
      8,
      43
    ]
  ],
  "failure_mode_f1s": {
    "TWF": 0.0,
    "HDF": 1.0,
    "PWF": 0.8182,
    "OSF": 0.9677,
    "RNF": 0.0
  }
}
```

## 5. Domain Knowledge Alignment
- Outputs are piped into the InduSense RAG retrieval engine.
- Retrieved evidence from OEM manuals (e.g. SKF 2025 Handbook) and historical logs are validated via Condition-Evidence Alignment (CEA).
- If evidence is absent or conflicts with prediction, autonomous action is suspended and escalated to engineering review.

## 6. Known Limitations
- Model is domain-specific and should **never** be evaluated on cross-domain assets.
- If telemetry values fall outside calibrated operational sensor ranges, uncertainty bounds widen.
