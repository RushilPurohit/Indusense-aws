# Model Card: Hydraulic Component Condition Suite

## 1. Overview
- **Model ID**: `hydraulic_component_condition_predictor`
- **Version**: `2.0.0`
- **Machine Domain**: `hydraulic`
- **Training Dataset**: `UCI Condition Monitoring of Hydraulic Systems`
- **Dataset Nature**: `Experimental Physical Sensor Data`
- **Trained At**: `2026-10-31T12:09:23.959704+00:00`
- **Artifact Path**: `ml/checkpoints/hydraulic/hydraulic_components_pipeline.joblib`
- **Status**: `Trained`

## 2. Prediction Objective
- Domain-specific condition monitoring and anomaly diagnostics for hydraulic equipment.
- Predicts machine failure state, component degradation level, or fault mode.

## 3. Probability Calibration
- **Status**: `Validated (Multi-Class HGB)`
- **Method**: Sigmoid / Platt scaling on cross-validated holdout splits.
- Calibrated confidence metric ($P_c$) represents true posterior probability rather than raw neural softmax.

## 4. Evaluation Metrics on Held-out Unseen Test Set
```json
{
  "cooler": {
    "accuracy": 1.0,
    "macro_f1": 1.0,
    "classes": [
      "Full Efficiency (100%)",
      "Reduced Efficiency (20%)",
      "Close to Failure (3%)"
    ],
    "confusion_matrix": [
      [
        331
      ]
    ]
  },
  "valve": {
    "accuracy": 0.3505,
    "macro_f1": 0.1298,
    "classes": [
      "Optimal Switching (100%)",
      "Small Lag (90%)",
      "Severe Lag (80%)",
      "Close to Failure (73%)"
    ],
    "confusion_matrix": [
      [
        116,
        0,
        0,
        0
      ],
      [
        75,
        0,
        0,
        0
      ],
      [
        70,
        0,
        0,
        0
      ],
      [
        70,
        0,
        0,
        0
      ]
    ]
  },
  "pump": {
    "accuracy": 0.7885,
    "macro_f1": 0.7118,
    "classes": [
      "No Leakage (0)",
      "Weak Leakage (1)",
      "Severe Leakage (2)"
    ],
    "confusion_matrix": [
      [
        152,
        0,
        0
      ],
      [
        7,
        27,
        63
      ],
      [
        0,
        0,
        82
      ]
    ]
  },
  "accumulator": {
    "accuracy": 0.429,
    "macro_f1": 0.2001,
    "classes": [
      "Optimal Pressure (130 bar)",
      "Slightly Reduced (115 bar)",
      "Severely Reduced (100 bar)",
      "Close to Failure (90 bar)"
    ],
    "confusion_matrix": [
      [
        0,
        0,
        56
      ],
      [
        0,
        0,
        133
      ],
      [
        0,
        0,
        142
      ]
    ]
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
