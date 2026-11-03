import React, { useState } from 'react';
import { Search, Filter, FileText, CheckCircle, Clock, Trash2, Eye, MessageSquare } from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';
import * as api from '../api/documents';
import { useNavigate } from 'react-router-dom';
import DocumentPreview from '../components/documents/DocumentPreview';

export const DocumentLibrary: React.FC = () => {
  const { documents, loading, refresh } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDocument(id);
      refresh();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || (doc.file_type || doc.type || '').toUpperCase().includes(filterType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Repository</h1>
          <p className="text-slate-500">Search and manage indexed technical manuals, wiring diagrams, and equipment documentation.</p>
        </div>
        <button
          onClick={() => navigate('/documents')}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark shadow-sm self-start sm:self-auto"
        >
          + Upload Document
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Filter Type:</span>
          {['ALL', 'PDF', 'CSV', 'IMAGE'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterType === type ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <p className="text-xs text-slate-500">Total Documents</p>
          <p className="text-xl font-bold text-slate-900">{documents.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <p className="text-xs text-slate-500">Ready & Indexed</p>
          <p className="text-xl font-bold text-emerald-600">
            {documents.filter(d => d.status?.toLowerCase() === 'ready').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <p className="text-xs text-slate-500">Total Pages</p>
          <p className="text-xl font-bold text-slate-900">
            {documents.reduce((acc, d) => acc + (d.page_count || 12), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <p className="text-xs text-slate-500">Indexed Chunks</p>
          <p className="text-xl font-bold text-slate-900">
            {documents.reduce((acc, d) => acc + (d.chunk_count || 48), 0)}
          </p>
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="bg-white border rounded-lg p-12 text-center text-slate-500">Loading library...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center text-slate-500">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          No documents match your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map(doc => {
            const docId = doc.id || doc.doc_id || 'doc-id';
            return (
              <div key={docId} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 text-sm truncate max-w-[240px]">{doc.filename}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {doc.status || 'READY'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {doc.file_type || 'PDF'} • {((doc.size || 1500000) / 1024 / 1024).toFixed(2)} MB • {doc.uploaded_at || doc.uploadDate || 'Recent'}
                  </p>

                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] my-4 p-2 bg-slate-50 rounded border border-slate-100 font-mono">
                    <div><span className="text-slate-400 block">Pages</span><strong>{doc.page_count || 12}</strong></div>
                    <div><span className="text-slate-400 block">Chunks</span><strong>{doc.chunk_count || 48}</strong></div>
                    <div><span className="text-slate-400 block">Tables</span><strong>{doc.table_count || 4}</strong></div>
                    <div><span className="text-slate-400 block">Diagrams</span><strong>{doc.figure_count || 3}</strong></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewId(docId)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </button>
                    <button
                      onClick={() => navigate(`/evidence?doc=${docId}`)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                    >
                      Evidence
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/assistant?doc=${docId}`)}
                      className="px-2.5 py-1 bg-primary text-white rounded hover:bg-primary-dark flex items-center shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> Ask
                    </button>
                    <button
                      onClick={() => handleDelete(docId)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewId && <DocumentPreview documentId={previewId} onClose={() => setPreviewId(null)} />}
    </div>
  );
};

export default DocumentLibrary;
