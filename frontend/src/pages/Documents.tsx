import React, { useState } from 'react';
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentList from '../components/documents/DocumentList';
import ProcessingStatus from '../components/documents/ProcessingStatus';
import DocumentPreview from '../components/documents/DocumentPreview';
import { useDocuments } from '../hooks/useDocuments';
import * as api from '../api/documents';

const Documents: React.FC = () => {
  const { documents, loading, refresh } = useDocuments();
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleUploadComplete = (docId: string) => {
    setActiveDocId(docId);
    refresh();
  };

  const handleProcessingFinished = () => {
    refresh();
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDocument(id);
      refresh();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Document Intelligence & Processing</h1>
        <p className="text-slate-500">Upload manuals, diagrams, SOPs, or scanned documents for OCR, layout detection, table extraction, and RAG indexing.</p>
      </div>

      {/* Upload Zone */}
      <DocumentUpload onUploadComplete={handleUploadComplete} />
      
      {/* Live Pipeline Stepper */}
      {activeDocId && (
        <ProcessingStatus 
          documentId={activeDocId} 
          onComplete={handleProcessingFinished} 
        />
      )}

      {/* Persistent Document Library List */}
      {loading ? (
        <div className="bg-white rounded-lg border p-12 text-center text-slate-500 font-medium">
          Loading document repository...
        </div>
      ) : (
        <DocumentList 
          documents={documents} 
          onDelete={handleDelete} 
          onView={setPreviewId} 
        />
      )}

      {/* Document Preview Modal */}
      {previewId && (
        <DocumentPreview 
          documentId={previewId} 
          onClose={() => setPreviewId(null)} 
        />
      )}
    </div>
  );
};

export default Documents;
