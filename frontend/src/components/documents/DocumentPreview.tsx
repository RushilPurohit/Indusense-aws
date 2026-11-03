import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, X, FileText, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { useDocuments } from '../../hooks/useDocuments';
import { useNavigate } from 'react-router-dom';

interface Props {
  documentId: string;
  onClose: () => void;
}

const MANUAL_PAGES: Record<string, Record<number, { title: string; subtitle: string; text: string; table?: string[][] }>> = {
  'doc-motor-m102': {
    1: {
      title: 'ABB Industrial Motor M-102 Maintenance Guide',
      subtitle: 'Section 1.0 General Specifications & Overview',
      text: 'The ABB M-102 is a heavy-duty 3-phase induction motor engineered for continuous operation in industrial machining drives.\n\nKey Parameters:\n- Rated Power: 45 kW\n- Voltage: 400V Delta / 690V Star\n- Rated Speed: 1450 RPM\n- Protection Class: IP55 / Insulation Class H',
      table: [
        ['Parameter', 'Nominal Value', 'Unit'],
        ['Ambient Air Temp', '295 - 303', 'K'],
        ['Process Temp Limit', '312', 'K'],
        ['Winding Warning Temp', '358 (85°C)', 'K'],
      ],
    },
    42: {
      title: 'Section 4.2 Maintenance & Operating Limits',
      subtitle: 'Thermal Overload Protection & Error Code E102',
      text: 'Operating temperatures above 358 K (85°C) trigger automatic PLC protection sequence. Heat Dissipation Failure (HDF) occurs when process temperature exceeds ambient by > 8.6 K under reduced speed.\n\nMotor overheating may occur due to excessive mechanical load, restricted cooling fan airflow, or tool wear exceeding 200 min limit. Recommended inspection: Safely halt unit M-102, clean intake fan shroud, inspect bearing grease, and replace worn tool assembly.',
    },
    43: {
      title: 'Section 4.3 Bearing Lubrication & Replacement',
      subtitle: 'Drive-End & Non-Drive End Bearing Standards',
      text: 'Lubricate drive-end bearings every 2,000 operating hours using Shell Gadus S2 V220 synthetic grease. Inspect radial clearance and vibration spectra annually.',
    },
  },
  'doc-irb6700': {
    1: {
      title: 'ABB IRB 6700 Industrial Robot Manual',
      subtitle: 'Section 1.0 Specifications & Safety Overview',
      text: 'The IRB 6700 family is ABB 7th generation large industrial robot, offering 150kg-300kg payload capacity and 2.6m-3.2m reach with LeanID dress pack technology.',
    },
    12: {
      title: 'Section 7.4 Axis Torque Limits & Safety Stops',
      subtitle: 'Axis 2 Maximum Torque Specification — IRB 6700-245',
      text: 'Axis 2 is rated for a maximum continuous torque of 1,882 Nm at rated speed. Exceeding this limit triggers the SafeMove electronic stop (Category 1). Verify motor drive parameters on the FlexController before commissioning.',
    },
  },
};

const DEFAULT_PAGE_CONTENT: { title: string; subtitle: string; text: string; table?: string[][] } = {
  title: 'ABB Maintenance Manual & Technical Specification',
  subtitle: 'Section 2.0 Operating Parameters & Troubleshooting Guide',
  text: 'Refer to the detailed operating parameters, wiring schematics, and component assembly limits in this document.\n\nSafety Note: Always apply LOTO procedures and verify zero voltage state before beginning physical inspection.',
};

const DocumentPreview: React.FC<Props> = ({ documentId, onClose }) => {
  const navigate = useNavigate();
  const { documents } = useDocuments();

  const doc = documents.find(d => d.id === documentId || (d as any).doc_id === documentId)
    || { id: documentId, filename: 'ABB_Industrial_Motor_M102_Manual.pdf', page_count: 48 };

  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);

  const docKey = doc.id || 'doc-motor-m102';
  const pageContent = MANUAL_PAGES[docKey]?.[page] || MANUAL_PAGES['doc-motor-m102']?.[page] || DEFAULT_PAGE_CONTENT;
  const totalPages = doc.page_count || 48;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold text-slate-900 text-sm truncate max-w-md">{doc.filename}</h3>
              <p className="text-xs text-slate-500">Page {page} of {totalPages} • Official ABB Technical Document</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                navigate(`/assistant?doc=${encodeURIComponent(docKey)}`);
              }}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Ask AI Assistant
            </button>

            <button
              onClick={() => {
                onClose();
                navigate(`/evidence?doc=${encodeURIComponent(docKey)}&page=${page}`);
              }}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Evidence
            </button>

            <div className="w-px h-4 bg-slate-300 mx-1" />

            <button onClick={() => setScale(s => Math.max(0.6, s - 0.15))} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs font-mono font-semibold text-slate-600 w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(1.8, s + 0.15))} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Render Area */}
        <div className="flex-1 overflow-auto bg-slate-200 p-8 flex justify-center">
          <div 
            className="bg-white shadow-xl border border-slate-300 rounded-sm px-12 py-10 text-slate-800 transition-transform origin-top flex flex-col justify-between"
            style={{ width: '640px', minHeight: '820px', transform: `scale(${scale})` }}
          >
            <div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-200 pb-3 mb-6 font-mono uppercase tracking-widest">
                <span>ABB TECHNICAL PUBLICATION</span>
                <span>PAGE {page} OF {totalPages}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-2">{pageContent.title}</h2>
              <h3 className="text-sm font-semibold text-slate-700 mb-4">{pageContent.subtitle}</h3>

              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap mb-6">{pageContent.text}</p>

              {pageContent.table && (
                <div className="my-4 border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        {pageContent.table[0].map((h, i) => (
                          <th key={i} className="p-2 font-bold text-slate-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageContent.table.slice(1).map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 text-slate-600 font-mono">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>DOCUMENT ID: {docKey.toUpperCase()}</span>
              <span>CONFIDENTIAL — ABB LTD</span>
            </div>
          </div>
        </div>

        {/* Footer Page Navigation */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Viewing page <span className="font-bold text-slate-900">{page}</span> of {totalPages}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Page
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1 transition-colors"
            >
              Next Page <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
