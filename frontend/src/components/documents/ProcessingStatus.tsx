import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import * as api from '../../api/documents';
import { Document } from '../../types';

interface Props {
  documentId: string;
  onComplete: () => void;
}

const pipelineSteps = [
  "File uploaded",
  "OCR & Text Extraction (FUNSD)",
  "Layout Analysis (DocLayNet)",
  "Table Analysis (TableBank)",
  "Text chunking & Metadata Generation",
  "Embeddings generated & Index updated",
  "Completed"
];

const ProcessingStatus: React.FC<Props> = ({ documentId, onComplete }) => {
  const [docStatus, setDocStatus] = useState<Document | null>(null);

  useEffect(() => {
    let isMounted = true;
    const pollStatus = async () => {
      try {
        const data = await api.getDocumentStatus(documentId);
        if (isMounted) {
          setDocStatus(data);
          if (data.status === 'ready' || data.status === 'failed') {
            onComplete();
          }
        }
      } catch (err) {
        console.error("Failed to poll document status:", err);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [documentId, onComplete]);

  const currentStep = docStatus?.current_step || "Uploading";
  const progress = docStatus?.progress ?? 15;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Processing Pipeline — {docStatus?.filename || documentId}</h3>
          <p className="text-xs text-slate-500">Live background document ingestion & vector indexing</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 flex items-center">
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> {docStatus?.status?.toUpperCase() || 'PROCESSING'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
        <div 
          className="bg-primary h-full transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* Pipeline Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {pipelineSteps.map((step, idx) => {
          const isDone = progress >= ((idx + 1) / pipelineSteps.length) * 100 || docStatus?.status === 'ready';
          const isCurrent = docStatus?.current_step?.toLowerCase().includes(step.toLowerCase().slice(0, 5));

          return (
            <div key={idx} className={`p-3 rounded-lg border flex items-center space-x-3 text-xs ${
              isDone ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
              isCurrent ? 'bg-blue-50 border-blue-200 text-blue-800 font-medium' :
              'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
              )}
              <span className="truncate">{step}</span>
            </div>
          );
        })}
      </div>

      {docStatus?.status === 'ready' && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
          <div>
            <span className="font-semibold">Processed Successfully!</span> Pages: {docStatus.page_count} | Chunks: {docStatus.chunk_count} | Tables: {docStatus.table_count} | Diagrams: {docStatus.figure_count}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;
