import { useState, useEffect } from 'react';
import { Document } from '../types';
import * as api from '../api/documents';

// Rich mock knowledge base — 10 documents across 4 categories
const MOCK_DOCUMENTS: Document[] = [
  // Manuals
  {
    id: 'doc-irb6700',
    filename: 'Robot_Arm_Manual_IRB6700.pdf',
    size: 4_520_000,
    uploaded_at: '2026-09-10T08:00:00Z',
    status: 'Ready',
    type: 'PDF',
    page_count: 312,
    chunk_count: 284,
    table_count: 47,
    figure_count: 89,
    machine: 'IRB-6700',
    category: 'Manual',
  },
  {
    id: 'doc-motor-m102',
    filename: 'ABB_Industrial_Motor_M102_Manual.pdf',
    size: 3_100_000,
    uploaded_at: '2026-09-10T09:30:00Z',
    status: 'Ready',
    type: 'PDF',
    page_count: 48,
    chunk_count: 62,
    table_count: 12,
    figure_count: 18,
    machine: 'Motor-M102',
    category: 'Manual',
  },
  {
    id: 'doc-conveyor',
    filename: 'ConveyorBelt_A_ServiceGuide.pdf',
    size: 2_870_000,
    uploaded_at: '2026-09-10T10:00:00Z',
    status: 'Ready',
    type: 'PDF',
    page_count: 94,
    chunk_count: 110,
    table_count: 22,
    figure_count: 31,
    machine: 'Conv-A',
    category: 'Manual',
  },
  {
    id: 'doc-pump-b',
    filename: 'PumpSystem_B_Maintenance_Manual.pdf',
    size: 5_200_000,
    uploaded_at: '2026-09-11T07:00:00Z',
    status: 'Ready',
    type: 'PDF',
    page_count: 128,
    chunk_count: 156,
    table_count: 38,
    figure_count: 44,
    machine: 'Pump-B',
    category: 'Manual',
  },
  // Logs & Data
  {
    id: 'doc-cmapss-zip',
    filename: 'CMAPSSData_Turbofan_Dataset.zip',
    size: 12_420_000,
    uploaded_at: '2026-09-12T09:00:00Z',
    status: 'Ready',
    type: 'ZIP',
    page_count: 24,
    chunk_count: 180,
    table_count: 12,
    figure_count: 8,
    machine: 'CMAPSS Engine Fleet',
    category: 'Telemetry',
  },
  {
    id: 'doc-motor-log',
    filename: 'Motor_Maintenance_Log_2026.csv',
    size: 124_000,
    uploaded_at: '2026-09-11T08:30:00Z',
    status: 'Ready',
    type: 'CSV',
    page_count: 1,
    chunk_count: 48,
    table_count: 1,
    figure_count: 0,
    machine: 'Motor-M102',
    category: 'Telemetry',
  },
  {
    id: 'doc-sensor-irb',
    filename: 'IRB6700_SensorTelemetry_Sep2026.csv',
    size: 380_000,
    uploaded_at: '2026-09-12T06:00:00Z',
    status: 'Ready',
    type: 'CSV',
    page_count: 1,
    chunk_count: 92,
    table_count: 1,
    figure_count: 0,
    machine: 'IRB-6700',
    category: 'Telemetry',
  },
  // Diagrams
  {
    id: 'doc-circuit',
    filename: 'Circuit_Diagram_ControlPanel_V2.png',
    size: 2_340_000,
    uploaded_at: '2026-09-09T14:00:00Z',
    status: 'Ready',
    type: 'Image',
    page_count: 1,
    chunk_count: 8,
    table_count: 0,
    figure_count: 1,
    machine: 'IRB-6700',
    category: 'Diagram',
  },
  {
    id: 'doc-wiring',
    filename: 'PumpB_WiringSchematic_Rev3.pdf',
    size: 1_890_000,
    uploaded_at: '2026-09-09T15:00:00Z',
    status: 'Ready',
    type: 'PDF',
    page_count: 14,
    chunk_count: 19,
    table_count: 3,
    figure_count: 9,
    machine: 'Pump-B',
    category: 'Diagram',
  },
  // Standards
  {
    id: 'doc-iso-std',
    filename: 'ISO_13849_Safety_Standard_Summary.pdf',
    size: 980_000,
    uploaded_at: '2026-09-08T11:00:00Z',
    status: 'Ready',
    type: 'PDF',
    page_count: 34,
    chunk_count: 41,
    table_count: 6,
    figure_count: 4,
    machine: 'General',
    category: 'Standard',
  },
];

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const apiData = await api.getDocuments().catch(() => []);
      const sessionData = JSON.parse(sessionStorage.getItem('custom_uploaded_docs') || '[]');

      const merged = [...sessionData, ...apiData];
      if (merged.length > 0) {
        setDocuments(merged);
      } else {
        setDocuments(MOCK_DOCUMENTS);
      }
      setError(null);
    } catch {
      const sessionData = JSON.parse(sessionStorage.getItem('custom_uploaded_docs') || '[]');
      setDocuments([...sessionData, ...MOCK_DOCUMENTS]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  return { documents, loading, error, refresh: fetchDocuments };
};
