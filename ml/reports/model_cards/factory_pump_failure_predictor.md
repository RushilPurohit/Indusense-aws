# Model Card: Factory Pump Predictor Suite

## 1. Overview
- **Model ID**: `factory_pump_failure_predictor`
- **Version**: `2.0.0`
- **Machine Domain**: `pump`
- **Training Dataset**: `Factory Sensors with Failure Labels`
- **Dataset Nature**: `Synthetic`
- **Trained At**: `2026-10-31T12:09:02.210523+00:00`
- **Artifact Path**: `ml/checkpoints/factory_sensors/factory_pump_pipeline.joblib`
- **Status**: `Trained`

## 2. Prediction Objective
- Domain-specific condition monitoring and anomaly diagnostics for pump equipment.
- Predicts machine failure state, component degradation level, or fault mode.

## 3. Probability Calibration
- **Status**: `Validated (Sigmoid / Platt scaling)`
- **Method**: Sigmoid / Platt scaling on cross-validated holdout splits.
- Calibrated confidence metric ($P_c$) represents true posterior probability rather than raw neural softmax.

## 4. Evaluation Metrics on Held-out Unseen Test Set
```json
{
  "failure_next_24h": {
    "accuracy": 0.976,
    "precision": 0.0,
    "recall": 0.0,
    "f1_score": 0.0,
    "roc_auc": 0.8867,
    "brier_score": 0.022,
    "ece": 0.005,
    "calibration_status": "Calibrated (Sigmoid / Platt scaling on chronological validation fold)"
  },
  "degradation_stage": {
    "accuracy": 0.9107,
    "macro_f1": 0.8517,
    "classes": [
      "NORMAL",
      "EARLY",
      "MODERATE",
      "SEVERE",
      "CRITICAL"
    ]
  },
  "rul_regression": {
    "mae_hours": 214.98,
    "rmse_hours": 289.02,
    "r2_score": -0.2243
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
