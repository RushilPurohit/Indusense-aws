export interface User {
  id: string;
  name: string;
  email: string;
  role: 'technician' | 'engineer' | 'admin' | string;
}

export interface Document {
  id: string;
  doc_id?: string;
  filename: string;
  title?: string;
  file_type?: string;
  size: number;
  uploaded_at?: string;
  uploadDate?: string;
  status: 'processing' | 'ready' | 'failed' | 'Processing' | 'Ready' | 'Error' | 'Review Required' | 'Failed';
  current_step?: string;
  progress?: number;
  page_count?: number;
  chunk_count?: number;
  table_count?: number;
  figure_count?: number;
  error?: string;
  type?: string;
  machine?: string;
  category?: string;
  Oc?: number;
  is_synthetic?: boolean;
  quality_status?: 'Ready for retrieval' | 'Processed with warnings' | 'Extraction failed' | 'Requires review' | string;
  quality_checks?: {
    empty_content: boolean;
    ocr_confidence: number;
    missing_page_refs: boolean;
    duplicate_detected: boolean;
    unreadable_regions: number;
    status_message: string;
  };
  sample_passages?: Array<{
    title: string;
    text: string;
    is_table?: boolean;
    is_warning?: boolean;
  }>;
}

export interface AuditEvent {
  timestamp: string;
  event_type: 'CASE_INITIALIZED' | 'PREDICTION_EXECUTED' | 'EVIDENCE_RETRIEVED' | 'ALIGNMENT_EVALUATED' | 'VALIDATION_COMPLETED' | 'ROUTING_ASSIGNED' | 'EXPLANATION_SYNTHESIZED' | 'TECHNICIAN_REVIEW' | string;
  actor: string;
  details: string;
}

export interface Page {
  pageNumber: number;
  content: string;
  imageUrl?: string;
  tables?: Array<{ headers: string[]; rows: string[][] }>;
}

export interface Chunk {
  id: string;
  doc_id: string;
  doc_title?: string;
  text: string;
  pageNumber: number;
  page?: number;
  bbox?: [number, number, number, number];
  Oc?: number;
  ingestion_metadata?: {
    layout_model?: string;
    ocr_confidence?: number;
    extracted_tables?: number;
  };
}

export interface Citation {
  id?: string;
  chunk_id?: string;
  document_id?: string;
  documentId?: string;
  filename?: string;
  title?: string;
  page_num?: number;
  pageNumber?: number;
  page?: number;
  section?: string;
  confidence: number;
  text_snippet?: string;
  text?: string;
  passage?: string;
  bbox?: number[];
}

export interface Evidence {
  id: string;
  citation: Citation;
  explanation: string;
}

export interface QueryResponse {
  id?: string;
  answer: string;
  summary: string;
  likely_causes?: string[];
  likelyCauses?: string[];
  recommended_checks?: string[];
  recommendedChecks?: string[];
  step_by_step_action?: string[];
  machine_insight?: string;
  confidence: number;
  citations: Citation[];
}

export interface MachineHealth {
  machineId: string;
  healthScore: number;
  status: 'Healthy' | 'Warning' | 'Fault';
  lastUpdated: string;
}

export interface SensorData {
  timestamp: string;
  temperature: number;
  process_temp?: number;
  pressure: number;
  rpm: number;
  torque: number;
  toolWear: number;
}

export interface PredictionResult {
  status: 'Healthy' | 'Warning' | 'Fault';
  healthScore: number;
  predictedFault: string;
  confidence: number;
  recommendedInspection: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'Component' | 'Fault' | 'Symptom' | 'Action' | 'Document' | 'Machine' | 'Procedure';
  origin_tag?: 'extracted' | 'configured' | 'simulated';
  source_doc?: string;
  page?: number;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  provenance?: { doc_id: string; page: number };
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ModelMetrics {
  name: string;
  cer?: number;
  wer?: number;
  map?: number;
  accuracy?: number;
  f1?: number;
  rocAuc?: number;
  status: 'Model trained' | 'Training pending' | 'SIMULATED';
  lossHistory: { epoch: number; trainLoss: number; valLoss: number }[];
}

export interface ProcessingStatus {
  doc_id?: string;
  documentId?: string;
  step?: string;
  currentStep?: string;
  progress: number;
  status?: string;
  page_count?: number;
  chunk_count?: number;
  table_count?: number;
  figure_count?: number;
  error?: string;
}

// ----------------------------------------------------------------------
// Unified InduSense Architecture: Diagnosis Case Data Model
// ----------------------------------------------------------------------

export type PipelineStageName = 'PREDICT' | 'RETRIEVE' | 'ALIGN' | 'VALIDATE' | 'ADAPT' | 'EXPLAIN';

export interface StageLogItem {
  stage: PipelineStageName;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration_ms: number;
  error?: string;
}

export interface EvidenceCandidate {
  id: string;
  doc_id: string;
  doc_title: string;
  page: number;
  bbox?: [number, number, number, number]; // [x0, y0, x1, y1] normalized
  passage: string;
  highlighted_span?: string;
  component: string;
  fault_code: string;
  action: string;
  threshold_rule?: string;
  Rc: number; // Retrieval confidence [0-1]
  Oc: number; // OCR/doc confidence [0-1]
  kg_path: string[];
  is_distractor?: boolean;
}

export interface AlignmentVerdict {
  candidate_id: string;
  component_match: boolean | 'partial';
  fault_match: boolean | 'partial';
  symptom_match: boolean | 'partial';
  action_relevance: boolean | 'partial';
  CEA: number; // Condition-Evidence Alignment score [0-1]
  outcome: 'ALIGNED' | 'CONFLICT' | 'INSUFFICIENT EVIDENCE';
  reasons: string[];
}

export interface DiagnosisCase {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_family?: 'CNC Machining' | 'Bearing Assembly' | 'Turbofan Fleet' | string;
  plant?: string;
  telemetry_window?: string;
  dataset_source: 'UCI AI4I 2020' | 'NASA C-MAPSS' | 'FEMTO Bearing' | 'SYNTHETIC Maintenance Corpus' | string;
  condition: {
    fault_label: string;
    rul: number | null;
    rul_interval?: [number, number] | null;
    Pc: number; // Condition probability [0-1]
    calibrated: boolean;
    top_sensors: Array<{
      name: string;
      value: number;
      unit: string;
      contribution: number;
      normal_range: [number, number];
    }>;
    spectral_features?: {
      fft_peak_hz: number;
      envelope_spectrum_db: number;
      kurtosis: number;
      crest_factor: number;
    };
    model_version: string;
    execution_mode: 'Trained Model' | 'Rule Fallback' | 'Demonstration Model' | 'Deterministic Demo Adapter' | 'SIMULATED';
  };
  evidence_candidates: EvidenceCandidate[];
  alignment: AlignmentVerdict[];
  validation: {
    Pc: number;
    Rc: number;
    Oc: number;
    CEA: number;
    aggregate: number; // Pluggable aggregate score
    aggregate_label: string; // "Hypothetical, not validated"
    conflict_flag: boolean;
    review_required: boolean;
    conflict_description?: string;
  };
  routing: {
    path: 'LIGHT' | 'STANDARD' | 'HEAVY';
    reason: string;
    measured_latency_ms: number;
    estimated_cost_usd: number;
  };
  explanation: {
    sourced_facts: string[];
    generated_text: string;
    citations: Array<{
      doc_id: string;
      title: string;
      page: number;
      passage: string;
      chunk_id: string;
    }>;
  };
  review: {
    outcome?: 'Accepted' | 'Rejected' | 'Needs Further Review' | 'Escalate' | 'Pending';
    reviewer?: string;
    timestamp?: string;
    notes?: string;
  };
  stage_log: StageLogItem[];
  audit_trail?: AuditEvent[];
  created_at: string;
}

export interface CloudServiceStatus {
  service: string;
  role: string;
  mode: 'configured' | 'mock' | 'not_configured';
  details: string;
}

export interface RouterSimulationResult {
  path: 'LIGHT' | 'STANDARD' | 'HEAVY';
  reason: string;
  estimated_latency_ms: number;
  estimated_cost_usd: number;
  breakdown: {
    Pc: number;
    Oc: number;
    Rc: number;
    CEA: number;
    conflict: boolean;
  };
}

export interface MlDataset {
  id: string;
  name: string;
  domain: string;
  type: string;
  is_synthetic: boolean;
  status: 'Validated' | 'Available' | 'Indexed' | 'Processing' | 'Validation failed';
  files_available: number;
  record_count: number | string;
  channels: string[];
  targets: string[];
  split_strategy: string;
  license: string;
}

export interface MlModel {
  model_id: string;
  name: string;
  domain: string;
  dataset: string;
  version: string;
  status: string;
  is_synthetic: boolean;
  is_active?: boolean;
  artifact_path: string;
  metrics: any;
  trained_at: string;
  calibration: string;
  accuracy?: number;
}

export interface TrainingRun {
  run_id: string;
  domain: string;
  dataset: string;
  algorithm: string;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed';
  started_at: string;
  completed_at: string | null;
  accuracy: number | null;
  error?: string | null;
}

