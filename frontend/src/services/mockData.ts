import { DiagnosisCase, Document, KnowledgeGraph, CloudServiceStatus } from '../types';

export const HERO_CASES: DiagnosisCase[] = [
  {
    id: 'case-cnc-m102',
    asset_id: 'CNC-M102',
    asset_name: '5-Axis Spindle CNC Mill M102',
    asset_family: 'CNC Machining',
    plant: 'Plant 2 — Heavy Machining Bay',
    telemetry_window: 'Last 60 minutes (1 Hz telemetry)',
    dataset_source: 'UCI AI4I 2020',
    condition: {
      fault_label: 'Heat Dissipation Failure (HDF)',
      rul: null,
      rul_interval: null,
      Pc: 0.94,
      calibrated: true,
      top_sensors: [
        { name: 'Air Temp [K]', value: 300.6, unit: 'K', contribution: 0.42, normal_range: [295, 303] },
        { name: 'Process Temp [K]', value: 308.7, unit: 'K', contribution: 0.38, normal_range: [305, 312] },
        { name: 'Rotational Speed [rpm]', value: 1320, unit: 'rpm', contribution: 0.15, normal_range: [1380, 2800] },
        { name: 'Torque [Nm]', value: 52.4, unit: 'Nm', contribution: 0.05, normal_range: [20, 60] }
      ],
      model_version: 'XGBoost-AI4I-v2.1 (Calibrated Isotonic)',
      execution_mode: 'Trained Model'
    },
    evidence_candidates: [
      {
        id: 'cand-m102-1',
        doc_id: 'doc-pneumatic-chuck',
        doc_title: 'Pneumatic Chuck Clamp Calibration & Pressure System Manual',
        page: 18,
        bbox: [0.12, 0.34, 0.88, 0.58],
        passage: 'Pneumatic chuck clamp pressure reduction occurs when system ambient air delta falls below threshold during low-speed tooling cycles. Verify pressure regulator valve PV-204 and recalibrate chuck hydraulic clamps to 45 bar before spindle restart.',
        highlighted_span: 'system ambient air delta falls below threshold during low-speed tooling cycles',
        component: 'Workholding / Pneumatic Chuck',
        fault_code: 'ERR-CLAMP-P4',
        action: 'Recalibrate chuck hydraulic clamps to 45 bar',
        Rc: 0.88,
        Oc: 0.92,
        kg_path: ['Workholding Chuck', 'Clamp Pressure Loss', 'Low Delta Pressure', 'Recalibrate Clamps'],
        is_distractor: true
      },
      {
        id: 'cand-m102-2',
        doc_id: 'doc-cnc-cooling',
        doc_title: 'Industrial Spindle Cooling Circuit & Thermal Dissipation Manual',
        page: 42,
        bbox: [0.15, 0.22, 0.85, 0.65],
        passage: 'Heat Dissipation Failure (HDF): When process-to-air temperature difference falls below 8.6 K and rotational speed remains below 1380 rpm, the cooling airflow circuit is obstructed. Perform visual inspection of auxiliary cooling fan CF-02, clean debris filter mesh SF-12, and test glycol coolant flow rate (nominal > 4.2 L/min).',
        highlighted_span: 'process-to-air temperature difference falls below 8.6 K and rotational speed remains below 1380 rpm',
        component: 'Spindle Cooling Assembly',
        fault_code: 'HDF-SPINDLE-4.2',
        action: 'Inspect auxiliary cooling fan CF-02, clean filter mesh SF-12, test coolant flow (>4.2 L/min)',
        Rc: 0.93,
        Oc: 0.96,
        kg_path: ['Spindle Assembly', 'Heat Dissipation Failure', 'Thermal Delta < 8.6K', 'Clean Coolant Circuit & Check Fan CF-02'],
        is_distractor: false
      }
    ],
    alignment: [
      {
        candidate_id: 'cand-m102-1',
        component_match: false,
        fault_match: false,
        symptom_match: 'partial',
        action_relevance: false,
        CEA: 0.21,
        outcome: 'CONFLICT',
        reasons: [
          'Semantic Proximity Fallacy Detected: High lexical overlap on air temperature and low speed, but target subsystem is Spindle Cooling, not Workholding Pneumatic Chuck.',
          'Component mismatch: Pneumatic chuck clamp is completely unrelated to spindle motor stator cooling.',
          'Action danger: Recalibrating chuck clamp pressure will not resolve spindle heat buildup and risks unseated workpieces.'
        ]
      },
      {
        candidate_id: 'cand-m102-2',
        component_match: true,
        fault_match: true,
        symptom_match: true,
        action_relevance: true,
        CEA: 0.95,
        outcome: 'ALIGNED',
        reasons: [
          'Component match: Spindle Cooling Assembly matches predicted CNC-M102 heat dissipation alert.',
          'Threshold match: Temperature difference (308.7 - 300.6 = 8.1 K < 8.6 K) and speed (1320 rpm < 1380 rpm) directly satisfy Section 4.2 rule.',
          'Action relevance: Prescribed inspection of cooling fan CF-02 and filter mesh SF-12 targets root thermal choke point.'
        ]
      }
    ],
    validation: {
      Pc: 0.94,
      Rc: 0.93,
      Oc: 0.96,
      CEA: 0.95,
      aggregate: 0.945,
      aggregate_label: 'Hypothetical Aggregate (Research Hypothesis, Not Validated)',
      conflict_flag: false,
      review_required: false,
      conflict_description: 'Candidate 1 was rejected due to component mismatch; Candidate 2 successfully verified and aligned.'
    },
    routing: {
      path: 'LIGHT',
      reason: 'High condition confidence (Pc=0.94), verified alignment on cooling manual (CEA=0.95), low system risk.',
      measured_latency_ms: 242,
      estimated_cost_usd: 0.0018
    },
    explanation: {
      sourced_facts: [
        'Predicted condition is Heat Dissipation Failure with Pc = 0.94 (Calibrated).',
        'Process-to-air temperature differential is 8.1 K, violating minimum 8.6 K dissipation gradient.',
        'Spindle rotational speed is 1320 rpm (below normal 1380 rpm cooling threshold).',
        'Candidate 2 from Spindle Cooling Manual Sec 4.2 confirms HDF criteria and details fan CF-02 inspection.'
      ],
      generated_text: 'InduSense confirmed Heat Dissipation Failure (HDF) on CNC-M102 spindle drive. Telemetry exhibits a temperature delta of 8.1 K and low shaft velocity (1320 rpm), matching the synthetic maintenance threshold in Section 4.2. Candidate 1 (pneumatic clamp) was rejected as a semantic distractor. Recommended action is to clean filter mesh SF-12 and verify auxiliary fan CF-02.',
      citations: [
        {
          doc_id: 'doc-cnc-cooling',
          title: 'Industrial Spindle Cooling Circuit & Thermal Dissipation Manual',
          page: 42,
          passage: 'Heat Dissipation Failure (HDF): When process-to-air temperature difference falls below 8.6 K and rotational speed remains below 1380 rpm, inspect auxiliary cooling fan CF-02.',
          chunk_id: 'chunk-hdf-42'
        }
      ]
    },
    review: {
      outcome: 'Pending',
      notes: 'Awaiting technician visual confirmation of fan CF-02 operation.'
    },
    stage_log: [
      { stage: 'PREDICT', status: 'completed', duration_ms: 45 },
      { stage: 'RETRIEVE', status: 'completed', duration_ms: 82 },
      { stage: 'ALIGN', status: 'completed', duration_ms: 54 },
      { stage: 'VALIDATE', status: 'completed', duration_ms: 18 },
      { stage: 'ADAPT', status: 'completed', duration_ms: 12 },
      { stage: 'EXPLAIN', status: 'completed', duration_ms: 31 }
    ],
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    id: 'case-bearing-b301',
    asset_id: 'BRG-301',
    asset_name: 'PRONOSTIA Testbench High-Speed Bearing 301',
    asset_family: 'Bearing Assembly',
    plant: 'Plant 1 — Testing & Dyno Cell',
    telemetry_window: 'Last 15 minutes (25.6 kHz vibration stream)',
    dataset_source: 'FEMTO Bearing',
    condition: {
      fault_label: 'Outer-Race Bearing Degradation',
      rul: null,
      rul_interval: null,
      Pc: 0.78,
      calibrated: true,
      top_sensors: [
        { name: 'Kurtosis (Horiz)', value: 5.82, unit: 'dim', contribution: 0.52, normal_range: [2.8, 3.5] },
        { name: 'Crest Factor', value: 4.65, unit: 'dim', contribution: 0.28, normal_range: [2.5, 3.2] },
        { name: 'RMS Vibration', value: 3.12, unit: 'g', contribution: 0.15, normal_range: [0.5, 1.8] },
        { name: 'Temp Bearing Cap', value: 58.4, unit: '°C', contribution: 0.05, normal_range: [35, 60] }
      ],
      spectral_features: {
        fft_peak_hz: 108.4,
        envelope_spectrum_db: 18.2,
        kurtosis: 5.82,
        crest_factor: 4.65
      },
      model_version: 'FEMTO-Spectral-Classifier-v1.4',
      execution_mode: 'Trained Model'
    },
    evidence_candidates: [
      {
        id: 'cand-b301-1',
        doc_id: 'doc-bearing-manual',
        doc_title: 'PRONOSTIA Roller Bearing Degradation & Lubrication Standards',
        page: 24,
        bbox: [0.1, 0.2, 0.9, 0.55],
        passage: 'Outer race spalling manifests through repetitive impact shocks at ball pass frequency outer race (BPFO ~ 108 Hz at 1800 rpm). A kurtosis exceeding 4.5 accompanied by envelope modulation above 14 dB denotes Stage-3 sub-surface spalling. Immediately inspect bearing grease contamination and schedule bearing cartridge exchange.',
        highlighted_span: 'BPFO ~ 108 Hz at 1800 rpm ... kurtosis exceeding 4.5 accompanied by envelope modulation above 14 dB',
        component: 'Outer Race Bearing Cartridge',
        fault_code: 'ISO-10816-BRG3',
        action: 'Inspect grease contamination, schedule cartridge replacement',
        Rc: 0.89,
        Oc: 0.94,
        kg_path: ['Drive Bearing', 'Outer Race Spall', 'BPFO Harmonic 108Hz', 'Cartridge Exchange'],
        is_distractor: false
      }
    ],
    alignment: [
      {
        candidate_id: 'cand-b301-1',
        component_match: true,
        fault_match: true,
        symptom_match: true,
        action_relevance: true,
        CEA: 0.91,
        outcome: 'ALIGNED',
        reasons: [
          'Spectral frequency match: 108.4 Hz envelope peak directly coincides with BPFO outer race rate.',
          'Statistical symptom match: Kurtosis 5.82 exceeds degradation threshold of 4.5.',
          'Action relevance: Maintenance protocol directly addresses Stage-3 spalling.'
        ]
      }
    ],
    validation: {
      Pc: 0.78,
      Rc: 0.89,
      Oc: 0.94,
      CEA: 0.91,
      aggregate: 0.88,
      aggregate_label: 'Hypothetical Aggregate (Research Hypothesis, Not Validated)',
      conflict_flag: false,
      review_required: false,
      conflict_description: 'Marginal condition confidence (Pc=0.78), but strong evidence alignment (CEA=0.91).'
    },
    routing: {
      path: 'STANDARD',
      reason: 'Marginal condition confidence (Pc=0.78 within 0.70–0.85 band) triggers Standard verification path.',
      measured_latency_ms: 388,
      estimated_cost_usd: 0.0042
    },
    explanation: {
      sourced_facts: [
        'Vibration kurtosis reached 5.82 (normal limit < 3.5).',
        'FFT envelope peak detected at 108.4 Hz matching BPFO harmonic.',
        'Manual Section 6.1 specifies Stage-3 spalling above kurtosis 4.5.'
      ],
      generated_text: 'Vibration envelope analysis on BRG-301 indicates early outer-race bearing spalling with an envelope peak at 108.4 Hz (BPFO). Section 24 of the PRONOSTIA maintenance standards indicates kurtosis > 4.5 requires grease inspection and scheduled cartridge replacement.',
      citations: [
        {
          doc_id: 'doc-bearing-manual',
          title: 'PRONOSTIA Roller Bearing Degradation & Lubrication Standards',
          page: 24,
          passage: 'Outer race spalling manifests through repetitive impact shocks at ball pass frequency outer race (BPFO ~ 108 Hz).',
          chunk_id: 'chunk-brg-24'
        }
      ]
    },
    review: {
      outcome: 'Accepted',
      reviewer: 'E. Vance (Lead Vibration Specialist)',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      notes: 'Vibration pattern verified on testbench rig. Cartridge swap scheduled.'
    },
    stage_log: [
      { stage: 'PREDICT', status: 'completed', duration_ms: 62 },
      { stage: 'RETRIEVE', status: 'completed', duration_ms: 95 },
      { stage: 'ALIGN', status: 'completed', duration_ms: 48 },
      { stage: 'VALIDATE', status: 'completed', duration_ms: 22 },
      { stage: 'ADAPT', status: 'completed', duration_ms: 14 },
      { stage: 'EXPLAIN', status: 'completed', duration_ms: 38 }
    ],
    created_at: new Date(Date.now() - 140 * 60 * 1000).toISOString()
  },
  {
    id: 'case-turbofan-tf004',
    asset_id: 'TURBO-TF004',
    asset_name: 'Turbofan Propulsion Engine Unit 004',
    asset_family: 'Turbofan Fleet',
    plant: 'Plant 4 — Flight Readiness Hangar',
    telemetry_window: 'Full cycle series to date (Cycle 1 to 164)',
    dataset_source: 'C-MAPSS Turbofan (Pretrained Benchmark)',
    condition: {
      fault_label: 'High-Pressure Compressor Degradation',
      rul: 42,
      rul_interval: [35, 49],
      Pc: 0.64,
      calibrated: true,
      top_sensors: [
        { name: 'Total temp at HPC outlet (T30) [°R]', value: 1598.2, unit: '°R', contribution: 0.44, normal_range: [1570, 1590] },
        { name: 'Total pressure in bypass-duct (P30) [psia]', value: 552.1, unit: 'psia', contribution: 0.31, normal_range: [545, 555] },
        { name: 'Physical core speed (Nc) [rpm]', value: 9042, unit: 'rpm', contribution: 0.18, normal_range: [9020, 9100] },
        { name: 'HPT coolant bleed (W31) [lbm/s]', value: 38.4, unit: 'lbm/s', contribution: 0.07, normal_range: [38.0, 39.2] }
      ],
      model_version: 'LSTM-CMAPSS-FD001-v3.0 (MC Dropout Ensemble)',
      execution_mode: 'Trained Model'
    },
    evidence_candidates: [
      {
        id: 'cand-tf004-1',
        doc_id: 'doc-turbofan-manual',
        doc_title: 'Turbofan Propulsion High-Pressure Compressor Maintenance & Overhaul Standards',
        page: 12,
        bbox: [0.1, 0.3, 0.88, 0.52],
        passage: 'Low-Pressure Turbine Exhaust Nozzle Casing: Temperature variation at nozzle exit occurs during climb-thrust transitions. Re-tighten external cowl latch brackets to 24 Nm.',
        highlighted_span: 'Temperature variation at nozzle exit occurs during climb-thrust transitions',
        component: 'Low-Pressure Exhaust Nozzle Casing',
        fault_code: 'NOZZLE-THERMAL-12',
        action: 'Re-tighten external cowl latch brackets to 24 Nm',
        threshold_rule: 'Exhaust nozzle casing variation during climb-thrust',
        Rc: 0.72,
        Oc: 0.91,
        kg_path: ['Turbofan Nacelle', 'Exhaust Nozzle', 'Thermal Expansion', 'Latch Torquing'],
        is_distractor: true
      },
      {
        id: 'cand-tf004-2',
        doc_id: 'doc-turbofan-manual',
        doc_title: 'Turbofan Propulsion High-Pressure Compressor Maintenance & Overhaul Standards',
        page: 52,
        bbox: [0.14, 0.18, 0.86, 0.62],
        passage: 'High-Pressure Compressor (HPC) Thermal Degradation: When HPC outlet total temperature (T30) exceeds 1585 °R and bypass total pressure (P30) drifts beyond 550 psia, Stage-5 compressor stator vanes exhibit thermal fatigue and thermal barrier coating loss. Perform borescope inspection of compressor rotor blades, calibrate variable bleed valves (VBV), and schedule hot-section shop overhaul if RUL forecasts fall below 50 operating cycles.',
        highlighted_span: 'HPC outlet total temperature (T30) exceeds 1585 °R and bypass total pressure (P30) drifts beyond 550 psia',
        component: 'High-Pressure Compressor (HPC)',
        fault_code: 'HPC-OVERHAUL-SEC5',
        action: 'Borescope compressor rotor blades, calibrate variable bleed valves (VBV), schedule hot-section shop overhaul',
        threshold_rule: 'T30 > 1585 °R, P30 > 550 psia, RUL forecast < 50 cycles',
        Rc: 0.94,
        Oc: 0.95,
        kg_path: ['HPC Assembly', 'HPC Thermal Degradation', 'T30 > 1585 °R', 'Borescope Inspection & Bleed Valve Calibration'],
        is_distractor: false
      }
    ],
    alignment: [
      {
        candidate_id: 'cand-tf004-1',
        component_match: false,
        fault_match: false,
        symptom_match: 'partial',
        action_relevance: false,
        CEA: 0.21,
        outcome: 'CONFLICT',
        reasons: [
          'Semantic Proximity Fallacy Detected: Lexical match on thermal variation, but target subsystem is High-Pressure Compressor (HPC), not Low-Pressure Exhaust Nozzle.',
          'Component mismatch: Cowl latch torquing does not prevent aerothermal degradation of core turbine stages.'
        ]
      },
      {
        candidate_id: 'cand-tf004-2',
        component_match: true,
        fault_match: true,
        symptom_match: true,
        action_relevance: true,
        CEA: 0.94,
        outcome: 'ALIGNED',
        reasons: [
          'Component match: High-Pressure Compressor Assembly matches detected aero-engine degradation.',
          'Threshold match: HPC outlet temperature (1598.2 °R > 1585 °R) and forecast RUL (42 cycles < 50) satisfy Section 5 overhaul rule.',
          'Action relevance: Borescope rotor blade inspection and variable bleed valve calibration directly mitigate stall margin loss.'
        ]
      }
    ],
    validation: {
      Pc: 0.88,
      Rc: 0.94,
      Oc: 0.95,
      CEA: 0.94,
      aggregate: 0.92,
      aggregate_label: 'Hypothetical Aggregate (Research Hypothesis, Not Validated)',
      conflict_flag: false,
      review_required: false,
      conflict_description: 'Candidate 1 (exhaust nozzle) rejected as semantic distractor; Candidate 2 verified on HPC stator blade overhaul criteria.'
    },
    routing: {
      path: 'STANDARD',
      reason: 'High condition confidence (Pc=0.88), verified alignment on Turbofan HPC manual (CEA=0.94). Standard cloud-assisted verification.',
      measured_latency_ms: 345,
      estimated_cost_usd: 0.0038
    },
    explanation: {
      sourced_facts: [
        'Predicted condition is High-Pressure Compressor Degradation with Pc = 0.88 (Calibrated).',
        'Remaining Useful Life predicted at 42 cycles with 90% confidence interval [35, 49].',
        'HPC outlet total temperature T30 reached 1598.2 °R (exceeds 1585 °R threshold).',
        'Turbofan HPC Overhaul Standards Page 52 mandates borescope inspection and variable bleed valve calibration when RUL < 50 cycles.'
      ],
      generated_text: 'InduSense confirmed High-Pressure Compressor Degradation on TURBO-TF004. C-MAPSS degradation regression predicts Remaining Useful Life of 42 cycles ([35, 49] interval) due to elevated HPC outlet temperature (1598.2 °R). Semantic distractor on exhaust nozzle cowl latches was blocked. Recommended procedure: conduct borescope inspection of compressor rotor blades and calibrate variable bleed valves (VBV).',
      citations: [
        {
          doc_id: 'doc-turbofan-manual',
          title: 'Turbofan Propulsion High-Pressure Compressor Maintenance & Overhaul Standards',
          page: 52,
          passage: 'High-Pressure Compressor (HPC) Thermal Degradation: When HPC outlet total temperature (T30) exceeds 1585 °R and bypass total pressure (P30) drifts beyond 550 psia, Stage-5 compressor stator vanes exhibit thermal fatigue and thermal barrier coating loss. Perform borescope inspection of compressor rotor blades, calibrate variable bleed valves (VBV), and schedule hot-section shop overhaul if RUL forecasts fall below 50 operating cycles.',
          chunk_id: 'chunk-turbo-52'
        }
      ]
    },
    review: {
      outcome: 'Needs Further Review',
      reviewer: 'M. Sterling (Propulsion Chief)',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      notes: 'Engine flight hours logged. Borescope team assigned to Hangar 4 for cycle-165 inspection.'
    },
    stage_log: [
      { stage: 'PREDICT', status: 'completed', duration_ms: 52 },
      { stage: 'RETRIEVE', status: 'completed', duration_ms: 88 },
      { stage: 'ALIGN', status: 'completed', duration_ms: 42 },
      { stage: 'VALIDATE', status: 'completed', duration_ms: 16 },
      { stage: 'ADAPT', status: 'completed', duration_ms: 12 },
      { stage: 'EXPLAIN', status: 'completed', duration_ms: 34 }
    ],
    audit_trail: [
      { timestamp: '2026-03-22T09:00:00Z', event_type: 'CASE_INITIALIZED', actor: 'C-MAPSS Flight Monitor (Pretrained Benchmark)', details: 'Ingested multi-cycle series (Cycles 1-164) for TURBO-TF004.' },
      { timestamp: '2026-03-22T09:00:01Z', event_type: 'PREDICTION_EXECUTED', actor: 'LSTM-CMAPSS-FD001', details: 'Predicted HPC Thermal Degradation: RUL=42 cycles ([35, 49] interval), Pc=0.88.' },
      { timestamp: '2026-03-22T09:00:02Z', event_type: 'EVIDENCE_RETRIEVED', actor: 'KnowledgeIndex', details: 'Retrieved 2 candidate passages from Turbofan HPC Standards manual.' },
      { timestamp: '2026-03-22T09:00:03Z', event_type: 'ALIGNMENT_EVALUATED', actor: 'AlignmentService', details: 'Candidate 1 (exhaust nozzle) rejected as Semantic Distractor. Candidate 2 (HPC overhaul) verified (CEA=0.94).' },
      { timestamp: '2026-03-22T09:00:04Z', event_type: 'VALIDATION_COMPLETED', actor: 'ReliabilityService', details: 'Validation passed (Rc=0.94, Oc=0.95, CEA=0.94).' },
      { timestamp: '2026-03-22T09:00:05Z', event_type: 'ROUTING_ASSIGNED', actor: 'CloudRouter', details: 'Routed to STANDARD path (measured latency 345ms, est. cost $0.0038).' },
      { timestamp: '2026-03-22T09:10:00Z', event_type: 'TECHNICIAN_REVIEW', actor: 'M. Sterling (Propulsion Chief)', details: "Flagged as 'Needs Further Review': Borescope team assigned to Hangar 4." }
    ],
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }
];

export const MOCK_ASSETS = [
  { id: 'CNC-M102', name: '5-Axis Spindle CNC Mill M102', family: 'CNC Machining', plant: 'Plant 2', healthScore: 42, status: 'Fault', fault: 'Heat Dissipation Failure', pc: 0.94, rul: null, path: 'LIGHT' },
  { id: 'BRG-301', name: 'PRONOSTIA Roller Bearing 301', family: 'Bearing Assembly', plant: 'Plant 1', healthScore: 68, status: 'Warning', fault: 'Outer-Race Bearing Degradation', pc: 0.78, rul: null, path: 'STANDARD' },
  { id: 'TURBO-TF004', name: 'Turbofan Propulsion Unit 004', family: 'Turbofan Fleet', plant: 'Plant 4', healthScore: 35, status: 'Fault', fault: 'HPC Degradation', pc: 0.88, rul: 42, path: 'STANDARD' },
  { id: 'CNC-M205', name: 'High-Precision Lathe M205', family: 'CNC Machining', plant: 'Plant 2', healthScore: 94, status: 'Healthy', fault: 'None (Nominal)', pc: 0.98, rul: null, path: 'LIGHT' },
  { id: 'BRG-102', name: 'Dyno Bench Bearing 102', family: 'Bearing Assembly', plant: 'Plant 1', healthScore: 91, status: 'Healthy', fault: 'None (Nominal)', pc: 0.95, rul: null, path: 'LIGHT' },
  { id: 'TURBO-TF009', name: 'Turbofan Propulsion Unit 009', family: 'Turbofan Fleet', plant: 'Plant 4', healthScore: 82, status: 'Healthy', fault: 'None (Nominal)', pc: 0.92, rul: 118, path: 'LIGHT' }
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'skf-handbook-2025',
    filename: '093168a92d25cc46_pdf_preview_medium.pdf',
    title: 'SKF Bearing Damage and Failure Analysis (2025 Edition)',
    size: 8713793,
    status: 'Ready',
    quality_status: 'Ready for retrieval',
    page_count: 106,
    chunk_count: 248,
    table_count: 24,
    figure_count: 56,
    uploaded_at: '2026-10-31T15:38:00Z',
    type: 'OEM Technical Maintenance Manual',
    category: 'Rolling Element Bearings (Real OEM)',
    Oc: 0.98,
    is_synthetic: false,
    quality_checks: {
      empty_content: false,
      ocr_confidence: 0.982,
      missing_page_refs: false,
      duplicate_detected: false,
      unreadable_regions: 0,
      status_message: 'All 106 verified pages extracted. ISO 15243 damage classifications and high-resolution bearing failure patterns confirmed.'
    },
    sample_passages: [
      {
        title: 'Section 2.4 Subsurface-Initiated Fatigue',
        text: 'Subsurface fatigue initiates under repeated cyclical shear stresses below the raceway contact surface. Micro-cracks initiate at non-metallic inclusion sites and propagate to the raceway surface, causing macroscopic flaking and spalling.'
      },
      {
        title: 'Table 3.2 ISO 15243 Failure Classifications',
        text: 'Standardized failure categories: 1. Fatigue (Subsurface / Surface-initiated); 2. Wear (Abrasive / Adhesive); 3. Corrosion (Moisture / Fretting); 4. Electrical Erosion (Excessive voltage / Current leakage); 5. Plastic Deformation; 6. Cracking & Fracture.',
        is_table: true
      }
    ]
  },
  {
    id: 'doc-paderborn-factsheets',
    filename: 'Paderborn_Bearing_Damage_Fact_Sheets.pdf',
    title: 'Paderborn Bearing Damage Fact Sheets & Measurement Metadata',
    size: 2850000,
    status: 'Ready',
    quality_status: 'Ready for retrieval',
    page_count: 32,
    chunk_count: 96,
    table_count: 8,
    figure_count: 16,
    uploaded_at: '2026-10-31T17:39:00Z',
    type: 'Experimental Physical Sensor Dataset Document',
    category: 'Paderborn Bearing Testbed (Real Data)',
    Oc: 0.96,
    is_synthetic: false,
    quality_checks: {
      empty_content: false,
      ocr_confidence: 0.965,
      missing_page_refs: false,
      duplicate_detected: false,
      unreadable_regions: 0,
      status_message: 'Paderborn 30-bearing experimental testbed documentation validated. Synchronized 64 kHz vibration and phase current channels verified.'
    },
    sample_passages: [
      {
        title: 'Section 1.2 Bearing Fault Taxonomy',
        text: 'Bearing codes K001-K006 represent healthy baseline bearings; KA01-KA30 represent accelerated fatigue outer ring damages; KI01-KI21 denote electric discharge machining inner ring faults; KB23/KB27/KB24 denote mixed multi-surface damage.'
      },
      {
        title: 'Table 2-A Operating Conditions Matrix',
        text: 'Drive speed nominal 1500 rpm / 900 rpm; radial load 1000 N / 400 N; motor torque 0.7 Nm / 0.1 Nm; motor phase currents (Cur1, Cur2) and piezoresistive vibration signals synchronized at 64 kHz.',
        is_table: true
      }
    ]
  },
  {
    id: 'doc-cnc-cooling',
    filename: 'CNC_Milling_Spindle_Cooling_Manual.pdf',
    title: 'CNC Milling Machine Spindle, Cooling & Tool Wear Maintenance Manual',
    size: 2450000,
    status: 'Ready',
    quality_status: 'Ready for retrieval',
    page_count: 42,
    chunk_count: 118,
    table_count: 6,
    figure_count: 12,
    uploaded_at: '2026-10-31T15:30:00Z',
    type: 'OEM Technical Maintenance Guide',
    category: 'AI4I 2020 CNC Milling (ISO 13399)',
    Oc: 0.96,
    is_synthetic: true,
    quality_checks: {
      empty_content: false,
      ocr_confidence: 0.962,
      missing_page_refs: false,
      duplicate_detected: false,
      unreadable_regions: 0,
      status_message: 'Spindle thermal limits, tool wear tolerances, and motor power failure thresholds verified.'
    },
    sample_passages: [
      {
        title: 'Section 4.2 Spindle Thermal Circuit & Radiator Inspection',
        text: 'When temperature differential (Process Temp - Air Temp) falls below 8.6 K under high speed cutting (>1380 rpm), inspect heat exchanger circuit CF-02 for particulate fouling and coolant cavitation. Clear cooling passages and flush closed-loop emulsion.'
      },
      {
        title: 'Table 5.1 Cutting Insert Tool Wear Replacement Limits',
        text: 'Carbide insert contact wear limit: 200 minutes accumulated contact time. Exceeding wear threshold triggers Tool Wear Failure (TWF) and workpiece dimension drift.',
        is_table: true
      }
    ]
  },
  {
    id: 'doc-hydraulic-servicing',
    filename: 'Industrial_Hydraulics_Field_Service_Standard.pdf',
    title: 'Hydraulic Power Unit & Proportional Valve Servicing Standard',
    size: 3850000,
    status: 'Ready',
    quality_status: 'Ready for retrieval',
    page_count: 68,
    chunk_count: 164,
    table_count: 14,
    figure_count: 20,
    uploaded_at: '2026-10-31T15:35:00Z',
    type: 'OEM Technical Standard (ISO 4406)',
    category: 'UCI Hydraulic Condition Monitoring Rig',
    Oc: 0.95,
    is_synthetic: false,
    quality_checks: {
      empty_content: false,
      ocr_confidence: 0.952,
      missing_page_refs: false,
      duplicate_detected: false,
      unreadable_regions: 0,
      status_message: 'All 68 pages verified. Sensor layouts for 17 physical hydraulic monitoring channels (PS1-PS6, TS1-TS4, FS1-FS2, VS1) validated.'
    },
    sample_passages: [
      {
        title: 'Section 3.4 Hydraulic Oil Cooler Thermal Efficiency',
        text: 'Cooler efficiency below 20% indicates mineral scale deposits on shell-and-tube hydraulic cooler tubes. Chemical de-scaling and back-flushing required if hydraulic fluid temperature TS1 exceeds 55 °C under continuous 60s cycle.'
      },
      {
        title: 'Table 4.1 Internal Pump Leakage & Valve Switching Limits',
        text: 'Normal case drain leakage: < 0.5 L/min; moderate wear: 0.5-1.2 L/min; severe internal slip: > 1.2 L/min. Directional switching valve optimal lag time < 100 ms.',
        is_table: true
      }
    ]
  },
  {
    id: 'factory-work-orders-log',
    filename: 'work_orders.csv',
    title: 'Plant Historical Maintenance Work Orders & Overhauls Log',
    size: 916898,
    status: 'Ready',
    quality_status: 'Ready for retrieval',
    page_count: 14,
    chunk_count: 52,
    table_count: 4,
    figure_count: 0,
    uploaded_at: '2026-10-31T15:10:00Z',
    type: 'Historical Maintenance Work Order Log',
    category: 'Factory Sensors Failure Dataset',
    Oc: 0.92,
    is_synthetic: true,
    quality_checks: {
      empty_content: false,
      ocr_confidence: 0.920,
      missing_page_refs: false,
      duplicate_detected: false,
      unreadable_regions: 0,
      status_message: 'Relational table structure mapped from factory sensors failure labels dataset. Work order overhaul histories and MTBF metrics indexed.'
    },
    sample_passages: [
      {
        title: 'Work Order WO-4402 Overhaul Record',
        text: 'Asset PUMP-04: High bearing vibration (7.5 mm/s > 4.5 mm/s limit) and elevated casing temperature (89 °C). Replaced outboard rolling bearing assembly and realigned motor coupling. Restored nominal discharge pressure (4.2 bar).'
      },
      {
        title: 'Historical Pump MTBF Summary Table',
        text: 'Mean Time Between Failures (MTBF): 720 hours. 82% of unexpected shutdowns preceded by vibration RMS rise 24-48 hours prior to catastrophic mechanical seizure.',
        is_table: true
      }
    ]
  },
  {
    id: 'doc-pneumatic-chuck',
    filename: 'InduSense_Synthetic_Pneumatic_Chuck_Manual_v1.pdf',
    title: 'Pneumatic Chuck Clamp Calibration & Pressure System Manual',
    size: 1850000,
    status: 'Ready',
    quality_status: 'Ready for retrieval',
    page_count: 36,
    chunk_count: 98,
    table_count: 5,
    figure_count: 9,
    uploaded_at: '2026-03-12T10:32:00Z',
    type: 'Semantic Proximity Distractor Benchmark',
    category: 'Workholding (Distractor Evaluation)',
    Oc: 0.92,
    is_synthetic: true,
    quality_checks: {
      empty_content: false,
      ocr_confidence: 0.924,
      missing_page_refs: false,
      duplicate_detected: false,
      unreadable_regions: 0,
      status_message: 'Extracted cleanly. Used by CEA alignment engine to detect Semantic Proximity Fallacies without confusing chuck clamping heat with spindle cooling heat.'
    },
    sample_passages: [
      {
        title: 'Section 2.1 Chuck Clamping Heat & Pressure',
        text: 'During intensive rotary milling operations, pneumatic chuck clamping manifolds may experience heat dissipation variations. Inspect pneumatic seals and relief valves if line pressure deviates below 6.2 bar.'
      },
      {
        title: 'Table 2-B Clamping Force Limits',
        text: 'Actuator clamping pressure nominal 6.5 bar; minimum holding limit 4.8 bar. Unintended release threshold < 4.2 bar.',
        is_table: true
      }
    ]
  },
  {
    id: 'doc-damaged-schematic',
    filename: 'Damaged_Schematic_Scan_2012.pdf',
    title: 'Legacy Dyno Cell Wiring & Relay Schematic (Damaged Historical Scan)',
    size: 890000,
    status: 'Failed',
    quality_status: 'Extraction failed',
    page_count: 6,
    chunk_count: 0,
    table_count: 0,
    figure_count: 0,
    uploaded_at: '2026-03-18T16:45:00Z',
    type: 'Damaged Technical Drawing (OCR Stress Test)',
    category: 'Electrical Wiring (Low OCR Quality)',
    Oc: 0.31,
    is_synthetic: true,
    quality_checks: {
      empty_content: true,
      ocr_confidence: 0.312,
      missing_page_refs: true,
      duplicate_detected: false,
      unreadable_regions: 5,
      status_message: 'Bitmap resolution under 100 DPI; severe skew prevents line segmentation.'
    },
    sample_passages: [
      {
        title: 'OCR Ingestion Pipeline Notice',
        text: 'No readable text passages could be extracted from this document. Optical resolution is below 100 DPI with severe skew and degraded contrast across all 6 pages.',
        is_warning: true
      },
      {
        title: 'Pipeline Diagnostics',
        text: 'PubLayNet detected zero valid bounding boxes for text paragraphs or numerical tables. Document quarantined from RAG search index.',
        is_warning: true
      }
    ]
  }
];

export const MOCK_KNOWLEDGE_GRAPH: KnowledgeGraph = {
  nodes: [
    { id: 'node-spindle', label: 'Spindle Assembly', type: 'Component', origin_tag: 'extracted', source_doc: 'doc-cnc-cooling', page: 40 },
    { id: 'node-hdf', label: 'Heat Dissipation Failure (HDF)', type: 'Fault', origin_tag: 'extracted', source_doc: 'doc-cnc-cooling', page: 42 },
    { id: 'node-temp-delta', label: 'Thermal Delta < 8.6 K & Speed < 1380 rpm', type: 'Symptom', origin_tag: 'extracted', source_doc: 'doc-cnc-cooling', page: 42 },
    { id: 'node-fan-action', label: 'Inspect Cooling Fan CF-02 & Clean Filter SF-12', type: 'Action', origin_tag: 'extracted', source_doc: 'doc-cnc-cooling', page: 42 },
    
    { id: 'node-chuck', label: 'Pneumatic Chuck Assembly', type: 'Component', origin_tag: 'extracted', source_doc: 'doc-pneumatic-chuck', page: 18 },
    { id: 'node-clamp-fault', label: 'Clamp Pressure Decay', type: 'Fault', origin_tag: 'extracted', source_doc: 'doc-pneumatic-chuck', page: 18 },
    { id: 'node-clamp-action', label: 'Recalibrate Chuck Clamp to 45 bar', type: 'Action', origin_tag: 'extracted', source_doc: 'doc-pneumatic-chuck', page: 18 },

    { id: 'node-bearing', label: 'Roller Bearing Cartridge', type: 'Component', origin_tag: 'extracted', source_doc: 'doc-bearing-manual', page: 24 },
    { id: 'node-spall-fault', label: 'Outer Race Spalling (BPFO)', type: 'Fault', origin_tag: 'extracted', source_doc: 'doc-bearing-manual', page: 24 },
    { id: 'node-kurtosis-symp', label: 'Kurtosis > 4.5 & 108 Hz Harmonic Peak', type: 'Symptom', origin_tag: 'extracted', source_doc: 'doc-bearing-manual', page: 24 },
    { id: 'node-bearing-action', label: 'Inspect Grease Contamination & Replace Cartridge', type: 'Action', origin_tag: 'extracted', source_doc: 'doc-bearing-manual', page: 24 }
  ],
  edges: [
    { source: 'node-spindle', target: 'node-hdf', type: 'SUBSCRIBES_TO_FAULT' },
    { source: 'node-hdf', target: 'node-temp-delta', type: 'MANIFESTS_AS' },
    { source: 'node-temp-delta', target: 'node-fan-action', type: 'RESOLVED_BY' },

    { source: 'node-chuck', target: 'node-clamp-fault', type: 'SUBSCRIBES_TO_FAULT' },
    { source: 'node-clamp-fault', target: 'node-clamp-action', type: 'RESOLVED_BY' },

    { source: 'node-bearing', target: 'node-spall-fault', type: 'SUBSCRIBES_TO_FAULT' },
    { source: 'node-spall-fault', target: 'node-kurtosis-symp', type: 'MANIFESTS_AS' },
    { source: 'node-kurtosis-symp', target: 'node-bearing-action', type: 'RESOLVED_BY' }
  ]
};

export const CLOUD_SERVICES_STATUS: CloudServiceStatus[] = [
  { service: 'Storage (S3)', role: 'Document and telemetry blob vault', mode: 'mock', details: 'Local disk filesystem adapter active (/server/storage). S3 credentials unconfigured.' },
  { service: 'OCR Engine (Textract)', role: 'Layout and table extraction', mode: 'mock', details: 'Local PyPDF/Pillow layout parser active. AWS Textract adapter mocked.' },
  { service: 'Inference (SageMaker)', role: 'Distributed ML model hosting', mode: 'mock', details: 'Local Scikit-Learn/XGBoost CPU runner active. SageMaker endpoint unconfigured.' },
  { service: 'Vector Index (OpenSearch)', role: 'Dense semantic passage index', mode: 'mock', details: 'In-memory / SQLite hybrid vector-cosine index active. AWS OpenSearch unconfigured.' },
  { service: 'LLM Reasoning (Bedrock)', role: 'Grounded explanation generation', mode: 'mock', details: 'Local deterministic template synthesizer active. Bedrock Claude 3 adapter mocked.' },
  { service: 'Routing Dispatch (Lambda)', role: 'Adaptive cloud execution router', mode: 'mock', details: 'In-process Python rule engine active. AWS Lambda adapter mocked.' },
  { service: 'Telemetry Metrics (CloudWatch)', role: 'Latency and telemetry ingestion', mode: 'mock', details: 'Local structured JSON logging active. CloudWatch adapter mocked.' }
];
