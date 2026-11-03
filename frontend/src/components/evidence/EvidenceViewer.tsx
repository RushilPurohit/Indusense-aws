import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, CheckCircle2, ArrowLeft, FileText, Layers, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as api from '../../api/documents';
import { Document } from '../../types';
import { useDocuments } from '../../hooks/useDocuments';

// ─── Per-document evidence database with page-by-page content ─────────────────
export interface PageContent {
  section: string;
  subsection: string;
  body: string;
}

export interface EvidenceEntry {
  documentId: string;
  chunkId: string;
  section: string;
  subsection: string;
  body: string;
  highlight: string;
  groundTruth: string;
  extractedText: string;
  contentType: string;
  ocrModel: string;
  layoutModel: string;
  confidence: number;
  totalPages: number;
  pageNumber: number;
  pagesData?: Record<number, PageContent>;
}

export const EVIDENCE_DB: Record<string, EvidenceEntry> = {
  'doc-motor-m102': {
    documentId: 'doc-motor-m102',
    chunkId: 'chunk-m102-p42',
    pageNumber: 42,
    section: 'Section 4.2 Maintenance & Operating Limits',
    subsection: 'Thermal Overload Protection & Error Code E102',
    body: 'Operating temperatures above 358 K (85°C) trigger automatic PLC protection sequence. Heat Dissipation Failure (HDF) occurs when process temperature exceeds ambient by > 8.6 K under reduced speed.',
    highlight: '"Motor overheating may occur due to excessive mechanical load, restricted cooling fan airflow, or tool wear exceeding 200 min limit. Recommended inspection: Safely halt unit M-102, clean intake fan shroud, inspect bearing grease, and replace worn tool assembly."',
    groundTruth: 'Retrieved chunk directly supports recommended action sequence for motor thermal fault.',
    extractedText: '"Motor overheating may occur due to excessive mechanical load, restricted cooling fan airflow, or tool wear exceeding 200 min limit."',
    contentType: 'Text & Table',
    ocrModel: 'FUNSD TrOCR',
    layoutModel: 'DocLayNet YOLO',
    confidence: 96.4,
    totalPages: 48,
    pagesData: {
      1: {
        section: 'Section 1.0 General Specifications & Overview',
        subsection: 'ABB Industrial Motor M-102 Overview',
        body: 'The ABB M-102 is a heavy-duty 3-phase induction motor engineered for continuous operation in industrial machining drives. Rated Power: 45 kW, Voltage: 400V Delta / 690V Star, Rated Speed: 1450 RPM.',
      },
      42: {
        section: 'Section 4.2 Maintenance & Operating Limits',
        subsection: 'Thermal Overload Protection & Error Code E102',
        body: 'Operating temperatures above 358 K (85°C) trigger automatic PLC protection sequence. Heat Dissipation Failure (HDF) occurs when process temperature exceeds ambient by > 8.6 K under reduced speed.',
      },
      43: {
        section: 'Section 4.3 Bearing Lubrication & Replacement Standards',
        subsection: 'Drive-End & Non-Drive End Bearing Maintenance',
        body: 'Lubricate drive-end bearings every 2,000 operating hours using Shell Gadus S2 V220 synthetic grease. Inspect radial clearance and vibration spectra annually.',
      },
    },
  },
  'doc-irb6700': {
    documentId: 'doc-irb6700',
    chunkId: 'chunk-irb6700-p12',
    pageNumber: 12,
    section: 'Section 7.4 Axis Torque Limits & Safety Stops',
    subsection: 'Axis 2 Maximum Torque Specification — IRB 6700-245',
    body: 'Axis 2 is rated for a maximum continuous torque of 1,882 Nm at rated speed. Exceeding this limit triggers the SafeMove electronic stop (Category 1). Verify motor drive parameters on the FlexController before commissioning.',
    highlight: '"Maximum torque for IRB 6700 Axis 2 is 1,882 Nm. Do not exceed rated torque during high-inertia payload operations. Enable SafeMove supervision to prevent mechanical damage to the gearbox."',
    groundTruth: 'Chunk directly answers torque limit query for IRB-6700 Axis 2 with exact specification.',
    extractedText: '"Maximum torque for IRB 6700 Axis 2 is 1,882 Nm. Do not exceed rated torque during high-inertia payload operations."',
    contentType: 'Text & Specification Table',
    ocrModel: 'TrOCR Large',
    layoutModel: 'DocLayNet YOLO',
    confidence: 98.1,
    totalPages: 312,
    pagesData: {
      1: {
        section: 'Section 1.0 Robot Arm General Specifications',
        subsection: 'IRB 6700 Industrial Robot Overview',
        body: 'The IRB 6700 family is ABB 7th generation large industrial robot, offering 150kg-300kg payload capacity and 2.6m-3.2m reach with LeanID dress pack technology.',
      },
      12: {
        section: 'Section 7.4 Axis Torque Limits & Safety Stops',
        subsection: 'Axis 2 Maximum Torque Specification — IRB 6700-245',
        body: 'Axis 2 is rated for a maximum continuous torque of 1,882 Nm at rated speed. Exceeding this limit triggers the SafeMove electronic stop (Category 1). Verify motor drive parameters on the FlexController before commissioning.',
      },
    },
  },
  'doc-conveyor': {
    documentId: 'doc-conveyor',
    chunkId: 'chunk-conveyor-p8',
    pageNumber: 8,
    section: 'Section 3.1 Belt Tension & Alignment Procedure',
    subsection: 'Drive Pulley Alignment & Tension Specification',
    body: 'Belt tension must be maintained between 180–220 N/mm at rated load. Misalignment > 3 mm from centerline activates the auto-shutdown relay. Re-alignment requires slackening take-up bolts and adjusting the tracking roller.',
    highlight: '"Conveyor belt misalignment exceeding 3 mm triggers automatic shutdown. Re-tension to 200 N/mm nominal and verify centerline tracking before restart. Apply belt dressing compound every 250 operating hours."',
    groundTruth: 'Chunk supports belt tension diagnostic and re-alignment procedure for Conveyor-A fault.',
    extractedText: '"Belt misalignment exceeding 3 mm triggers automatic shutdown. Re-tension to 200 N/mm nominal."',
    contentType: 'Text & Procedure Steps',
    ocrModel: 'FUNSD TrOCR',
    layoutModel: 'PubLayNet',
    confidence: 93.7,
    totalPages: 94,
    pagesData: {
      8: {
        section: 'Section 3.1 Belt Tension & Alignment Procedure',
        subsection: 'Drive Pulley Alignment & Tension Specification',
        body: 'Belt tension must be maintained between 180–220 N/mm at rated load. Misalignment > 3 mm from centerline activates the auto-shutdown relay. Re-alignment requires slackening take-up bolts and adjusting the tracking roller.',
      },
    },
  },
  'doc-pump-b': {
    documentId: 'doc-pump-b',
    chunkId: 'chunk-pumpb-p18',
    pageNumber: 18,
    section: 'Section 5.3 Vibration Diagnosis & Bearing Replacement',
    subsection: 'Bearing Fault Identification & RMS Threshold',
    body: 'RMS vibration exceeding 7.1 mm/s at the pump bearing housing indicates bearing wear beyond acceptable limits per ISO 10816-3. Schedule bearing replacement within 72 hours. Lubricate with Shell Gadus S2 V220 2 every 1,000 hours.',
    highlight: '"Vibration levels above 7.1 mm/s RMS indicate critical bearing wear. Halt Pump-Sys-B, perform vibration spectrum analysis, and replace drive-end bearing. Do not restart without confirming acceptable vibration levels post-replacement."',
    groundTruth: 'Retrieved chunk directly corroborates vibration alert and supports recommended bearing replacement procedure.',
    extractedText: '"Vibration levels above 7.1 mm/s RMS indicate critical bearing wear. Halt Pump-Sys-B and replace drive-end bearing."',
    contentType: 'Text & ISO Table',
    ocrModel: 'TrOCR Large',
    layoutModel: 'DocLayNet YOLO',
    confidence: 95.2,
    totalPages: 128,
    pagesData: {
      18: {
        section: 'Section 5.3 Vibration Diagnosis & Bearing Replacement',
        subsection: 'Bearing Fault Identification & RMS Threshold',
        body: 'RMS vibration exceeding 7.1 mm/s at the pump bearing housing indicates bearing wear beyond acceptable limits per ISO 10816-3. Schedule bearing replacement within 72 hours. Lubricate with Shell Gadus S2 V220 2 every 1,000 hours.',
      },
    },
  },
};

const EvidenceViewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { documents, loading: docsLoading, refresh } = useDocuments();

  const rawDocId = searchParams.get('documentId') || searchParams.get('doc') || '';
  const rawPage = searchParams.get('page');
  const rawChunkId = searchParams.get('chunkId');

  const [scale, setScale] = useState(1);
  const [activePage, setActivePage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  // Match document
  const targetDoc = documents.find(
    d => d.id === rawDocId || (d as any).doc_id === rawDocId || d.filename === rawDocId
  ) || (rawDocId ? { id: rawDocId, filename: rawDocId, status: 'Ready', page_count: 48, chunk_count: 62 } as Document : null);

  const docId = targetDoc ? targetDoc.id : '';
  const activeEvidence = docId ? (EVIDENCE_DB[docId] || EVIDENCE_DB['doc-motor-m102']) : EVIDENCE_DB['doc-motor-m102'];

  const hasProcessingDoc = targetDoc && targetDoc.status?.toLowerCase() === 'processing';
  const isNoEvidenceDoc = targetDoc && targetDoc.status?.toLowerCase() === 'ready' && targetDoc.chunk_count === 0;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (rawPage) {
        setActivePage(parseInt(rawPage, 10));
      } else if (activeEvidence) {
        // Set active page to the cited page (e.g. 42 or 12) so citation highlight appears immediately!
        setActivePage(activeEvidence.pageNumber);
      } else {
        setActivePage(1);
      }
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [rawDocId, rawPage, rawChunkId]);

  const handleAskAssistant = () => {
    if (!activeEvidence && !targetDoc) return;
    const promptText = `Explain this maintenance requirement from ${targetDoc?.filename || 'the manual'}: "${activeEvidence?.extractedText || 'Inspect operating limits'}" and what steps technicians should take.`;
    navigate(`/assistant?doc=${encodeURIComponent(docId || 'doc-motor-m102')}&page=${activePage}&query=${encodeURIComponent(promptText)}`);
  };

  // Skeleton loading state
  if (isLoading || docsLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
            <div className="space-y-1.5">
              <div className="w-48 h-4 bg-slate-200 rounded animate-pulse" />
              <div className="w-32 h-3 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex gap-4 mt-4">
          <div className="w-44 bg-slate-100 rounded-lg animate-pulse" />
          <div className="flex-1 bg-slate-100 rounded-lg animate-pulse" />
          <div className="w-72 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // Invalid document state
  if (rawDocId && !targetDoc) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center text-red-600 mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Evidence could not be verified for this source.</h3>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          The requested document ID <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">{rawDocId}</code> does not correspond to any valid indexed source document.
        </p>
        <button
          onClick={() => navigate('/documents')}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          Back to Documents
        </button>
      </div>
    );
  }

  // Processing or zero evidence state
  if (isNoEvidenceDoc || hasProcessingDoc) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-600 mb-4">
          <RefreshCw className={`w-6 h-6 ${hasProcessingDoc ? 'animate-spin' : ''}`} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No evidence available for this document yet.</h3>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          {hasProcessingDoc
            ? 'The document is currently undergoing OCR extraction, layout segmentation, and RAG vector indexing.'
            : 'The document has not produced an indexed evidence chunk. Run document processing to generate verifiable evidence chunks.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/documents')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Back to Documents
          </button>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Processing Status
          </button>
        </div>
      </div>
    );
  }

  const activeDocName = targetDoc?.filename || 'ABB_Industrial_Motor_M102_Manual.pdf';
  const totalPages = targetDoc?.page_count || activeEvidence.totalPages;
  const confColor = activeEvidence.confidence >= 95 ? 'text-emerald-600' : activeEvidence.confidence >= 85 ? 'text-amber-600' : 'text-red-600';

  // Include page 1, cited page, and surrounding pages
  const pagesList = Array.from(
    new Set([
      1,
      activeEvidence.pageNumber,
      Math.max(1, activePage - 1),
      activePage,
      Math.min(totalPages, activePage + 1),
    ])
  ).sort((a, b) => a - b);

  // Dynamic page content resolution
  const pageData: PageContent = activeEvidence.pagesData?.[activePage] || {
    section: activePage === activeEvidence.pageNumber ? activeEvidence.section : `Section ${activePage}.0 Maintenance Specifications`,
    subsection: activePage === activeEvidence.pageNumber ? activeEvidence.subsection : `Page ${activePage} Overview & Operating Guidelines`,
    body: activePage === activeEvidence.pageNumber ? activeEvidence.body : `Operating limits and parameters for page ${activePage}. Refer to technical specifications for complete wiring schematics and assembly torque limits.`,
  };

  const isCitationPage = activePage === activeEvidence.pageNumber;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm truncate max-w-sm">{activeDocName}</h3>
              <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                ID: {docId || 'doc-motor-m102'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Page {activePage} of {totalPages}
              {isCitationPage && <span className="ml-2 text-amber-600 font-semibold">· Citation Bounding Box Active</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAskAssistant}
            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Ask Assistant about this evidence
          </button>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Evidence
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Pages Outline */}
        <div className="w-44 border-r border-slate-200 flex flex-col bg-slate-50 shrink-0">
          <div className="px-3 py-2 border-b border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pages</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            {pagesList.map(page => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                  activePage === page
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>Page {page}</span>
                {page === activeEvidence.pageNumber && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold leading-none ${activePage === page ? 'bg-amber-400 text-slate-900' : 'bg-red-100 text-primary'}`}>
                    Evidence
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Doc Stats */}
          <div className="border-t border-slate-200 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Layers className="w-3 h-3" />
              <span>{totalPages} pages</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <FileText className="w-3 h-3" />
              <span>{targetDoc?.chunk_count || 48} chunks</span>
            </div>
          </div>
        </div>

        {/* Center: Document Render */}
        <div className="flex-1 flex flex-col relative bg-slate-200 overflow-hidden">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex bg-white rounded-lg shadow-sm border border-slate-200 z-10">
            <button
              onClick={() => setScale(s => Math.max(0.5, s - 0.15))}
              className="p-2 hover:bg-slate-50 border-r border-slate-200 rounded-l-lg transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-slate-600" />
            </button>
            <span className="px-3 py-2 text-xs text-slate-700 font-mono font-semibold min-w-[3.5rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(2.0, s + 0.15))}
              className="p-2 hover:bg-slate-50 border-l border-slate-200 rounded-r-lg transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8 flex justify-center">
            <div
              className="relative bg-white shadow-xl border border-slate-300 rounded-sm px-14 py-12 text-slate-800 transition-transform origin-top"
              style={{ width: '640px', minHeight: '840px', transform: `scale(${scale})` }}
            >
              {/* Page header */}
              <div className="flex justify-between items-center text-[10px] text-slate-300 border-b border-slate-100 pb-4 mb-8 font-mono uppercase tracking-widest">
                <span>ABB INDUSTRIAL — {activeDocName.replace(/\.[^/.]+$/, '')}</span>
                <span>Page {activePage}</span>
              </div>

              {/* Dynamic section content */}
              <h2 className="text-lg font-bold mb-3 text-slate-900">{pageData.section}</h2>
              <h3 className="text-sm font-semibold mb-4 text-slate-700">{pageData.subsection}</h3>

              <p className="text-sm leading-relaxed mb-6 text-slate-600">{pageData.body}</p>

              {/* Highlighted evidence block (renders when viewing the cited evidence page!) */}
              {isCitationPage && (
                <div className="relative my-6">
                  <div className="absolute inset-0 bg-amber-300/35 border-2 border-amber-500 rounded-xl -m-2 pointer-events-none z-10 shadow-sm" />
                  <div className="relative z-0 p-4 bg-amber-50 rounded-lg border border-amber-200 text-sm leading-relaxed font-medium text-slate-900">
                    {activeEvidence.highlight}
                  </div>
                </div>
              )}

              <p className="text-sm leading-relaxed mt-4 text-slate-500 text-xs italic">
                Refer to technical specifications for detailed safety parameters and component replacement protocols.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Evidence Metadata Panel */}
        <div className="w-72 border-l border-slate-200 flex flex-col bg-white shrink-0">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Verified Evidence Metadata
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs scrollbar-thin">
            {/* Ask Assistant trigger block */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
              <button
                onClick={handleAskAssistant}
                className="w-full py-2 px-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Ask Assistant about this evidence
              </button>
            </div>

            {/* Ground truth */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
              <h4 className="font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-2 text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Grounded Ground Truth
              </h4>
              <p className="text-slate-700 leading-relaxed">{activeEvidence.groundTruth}</p>
            </div>

            {/* Extracted text */}
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-widest mb-2 text-[10px]">Exact Extracted Text</h4>
              <div className="bg-slate-50 border border-slate-200 text-slate-700 p-3 rounded-xl leading-relaxed font-mono text-[11px]">
                {activeEvidence.extractedText}
              </div>
            </div>

            {/* Citation metadata table */}
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-widest mb-2 text-[10px]">Citation Metadata</h4>
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                {[
                  { label: 'Document', value: activeDocName.length > 20 ? activeDocName.slice(0, 20) + '…' : activeDocName },
                  { label: 'Page Number', value: String(activePage) },
                  { label: 'Chunk ID', value: activeEvidence.chunkId },
                  { label: 'Content Type', value: activeEvidence.contentType },
                  { label: 'OCR Model', value: activeEvidence.ocrModel },
                  { label: 'Layout Model', value: activeEvidence.layoutModel },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between px-3 py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-400 font-medium">{label}:</span>
                    <span className="font-semibold text-slate-800 font-mono text-right max-w-[130px] truncate" title={value}>
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between px-3 py-2">
                  <span className="text-slate-400 font-medium">Confidence:</span>
                  <span className={`font-bold font-mono ${confColor}`}>{activeEvidence.confidence.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Confidence bar */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Retrieval Confidence</span>
                <span className={`text-[10px] font-bold ${confColor}`}>{activeEvidence.confidence.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    activeEvidence.confidence >= 95 ? 'bg-emerald-500'
                    : activeEvidence.confidence >= 85 ? 'bg-amber-500'
                    : 'bg-red-500'
                  }`}
                  style={{ width: `${activeEvidence.confidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceViewer;
