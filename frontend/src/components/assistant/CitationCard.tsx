import React, { useState } from 'react';
import { Citation } from '../../types';
import { FileText, ExternalLink, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import DocumentPreview from '../documents/DocumentPreview';

interface Props {
  citation: Citation;
  index: number;
}

const CitationCard: React.FC<Props> = ({ citation, index }) => {
  const [showPreview, setShowPreview] = useState(false);

  const docId = citation.document_id || citation.documentId || 'doc-motor-m102';
  const pageNum = citation.page_num || citation.pageNumber || 42;
  const chunkId = citation.chunk_id || `chunk-${docId}-p${pageNum}`;
  const snippet = citation.text_snippet || citation.text || 'Inspect cooling fan and check tool wear thresholds.';
  const conf = Math.round((citation.confidence || 0.95) * 100);
  const fileName = citation.filename || (docId.includes('irb') ? 'Robot_Arm_Manual_IRB6700.pdf' : 'ABB_Industrial_Motor_M102_Manual.pdf');

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-primary/50 transition-all max-w-sm flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="bg-red-50 text-primary text-xs font-bold px-2 py-0.5 rounded border border-red-100">
                [{index}]
              </span>
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]" title={fileName}>
                {fileName}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${conf >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {conf}% Match
            </span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mb-2 italic bg-slate-50 p-2 rounded border border-slate-100">
            "{snippet}"
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
            <span>Page {pageNum}</span>
            <span>ID: {chunkId}</span>
          </div>
        </div>

        {/* Dual Actions: View Document + View Evidence */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded flex items-center justify-center transition-colors"
          >
            <Eye className="w-3 h-3 mr-1 text-slate-500" /> View Doc
          </button>

          <Link
            to={`/evidence?doc=${encodeURIComponent(docId)}&page=${pageNum}&chunkId=${encodeURIComponent(chunkId)}`}
            className="flex-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-primary text-xs font-semibold rounded flex items-center justify-center transition-colors"
          >
            View Evidence <ExternalLink className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>

      {/* Document Preview Modal */}
      {showPreview && (
        <DocumentPreview documentId={docId} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
};

export default CitationCard;
