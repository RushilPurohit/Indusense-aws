import React, { useState } from 'react';
import { FileText, Eye, MessageSquare, Trash2, ExternalLink, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import { Document } from '../../types';
import { useNavigate } from 'react-router-dom';
import DocumentPreview from './DocumentPreview';

interface Props {
  documents: Document[];
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
}

const DocumentList: React.FC<Props> = ({ documents, onDelete, onView }) => {
  const navigate = useNavigate();
  const [previewId, setPreviewId] = useState<string | null>(null);

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-slate-700">No documents uploaded yet</h4>
        <p className="text-xs text-slate-500 mt-1">Upload an industrial manual or PDF above to build your maintenance knowledge base.</p>
      </div>
    );
  }

  const getFileIcon = (fileType?: string, filename?: string) => {
    const ext = (fileType || filename || '').toLowerCase();
    if (ext.includes('csv') || ext.includes('xls')) return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
    if (ext.includes('png') || ext.includes('jpg') || ext.includes('image')) return <ImageIcon className="w-6 h-6 text-blue-600" />;
    return <FileText className="w-6 h-6 text-red-600" />;
  };

  const handleOpenPreview = (id: string) => {
    if (onView) {
      onView(id);
    } else {
      setPreviewId(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Document Knowledge Base ({documents.length})</h3>
        <span className="text-xs text-slate-500">Persistent across sessions</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc) => {
          const docId = doc.id || (doc as any).doc_id || 'doc-motor-m102';
          const isReady = doc.status?.toLowerCase() === 'ready';
          const isProcessing = doc.status?.toLowerCase() === 'processing';

          return (
            <div key={docId} className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Document Metadata */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  {getFileIcon(doc.file_type || doc.type, doc.filename)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-slate-900 text-sm">{doc.filename}</h4>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      isReady ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      isProcessing ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {doc.status || 'READY'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    {doc.file_type || doc.type || 'PDF'} • {((doc.size || 1500000) / 1024 / 1024).toFixed(2)} MB • Uploaded {doc.uploaded_at || doc.uploadDate || 'Recent'}
                  </p>

                  {/* Extracted Stats */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100 font-mono">
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      Pages: <strong>{doc.page_count || 12}</strong>
                    </span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      Chunks: <strong>{doc.chunk_count || 48}</strong>
                    </span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      Tables: <strong>{doc.table_count || 4}</strong>
                    </span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      Diagrams: <strong>{doc.figure_count || 3}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions: View Document, View Evidence, Ask Assistant, Delete */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => handleOpenPreview(docId)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-600" /> View Document
                </button>

                <button
                  onClick={() => navigate(`/evidence?doc=${encodeURIComponent(docId)}`)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium flex items-center transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1 text-blue-600" /> View Evidence
                </button>

                <button
                  onClick={() => navigate(`/assistant?doc=${encodeURIComponent(docId)}`)}
                  className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded text-xs font-medium flex items-center transition-colors shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Ask Assistant
                </button>

                <button
                  onClick={() => onDelete(docId)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {previewId && <DocumentPreview documentId={previewId} onClose={() => setPreviewId(null)} />}
    </div>
  );
};

export default DocumentList;
