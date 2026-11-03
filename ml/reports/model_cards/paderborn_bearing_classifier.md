# Model Card: Paderborn Bearing Damage Classifier

## 1. Overview
- **Model ID**: `paderborn_bearing_classifier`
- **Version**: `2.0.0`
- **Machine Domain**: `bearing`
- **Training Dataset**: `Paderborn Bearing Datacenter`
- **Dataset Nature**: `Experimental Physical Sensor Data`
- **Trained At**: `2026-10-31T12:09:37.866587+00:00`
- **Artifact Path**: `ml/checkpoints/paderborn/paderborn_bearing_pipeline.joblib`
- **Status**: `Trained`

## 2. Prediction Objective
- Domain-specific condition monitoring and anomaly diagnostics for bearing equipment.
- Predicts machine failure state, component degradation level, or fault mode.

## 3. Probability Calibration
- **Status**: `Validated (Sigmoid / Platt scaling on validation bearing fold)`
- **Method**: Sigmoid / Platt scaling on cross-validated holdout splits.
- Calibrated confidence metric ($P_c$) represents true posterior probability rather than raw neural softmax.

## 4. Evaluation Metrics on Held-out Unseen Test Set
```json
{
  "accuracy": 0.56,
  "macro_f1": 0.4968,
  "multiclass_brier": 0.5899,
  "classes": [
    "Healthy",
    "Outer Ring Damage",
    "Inner Ring Damage"
  ],
  "confusion_matrix": [
    [
      20,
      0,
      0
    ],
    [
      6,
      36,
      18
    ],
    [
      0,
      20,
      0
    ]
  ],
  "calibration_status": "Calibrated (Sigmoid / Platt scaling on validation bearing fold)"
}
```

## 5. Domain Knowledge Alignment
- Outputs are piped into the InduSense RAG retrieval engine.
- Retrieved evidence from OEM manuals (e.g. SKF 2025 Handbook) and historical logs are validated via Condition-Evidence Alignment (CEA).
- If evidence is absent or conflicts with prediction, autonomous action is suspended and escalated to engineering review.

## 6. Known Limitations
- Model is domain-specific and should **never** be evaluated on cross-domain assets.
- If telemetry values fall outside calibrated operational sensor ranges, uncertainty bounds widen.
