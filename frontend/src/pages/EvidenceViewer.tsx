import React from 'react';
import EvidenceViewerComp from '../components/evidence/EvidenceViewer';

const EvidenceViewerPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Evidence Viewer</h1>
          <p className="text-slate-500 text-sm">Visually verify AI-generated answers against the source material.</p>
        </div>
      </div>
      <EvidenceViewerComp />
    </div>
  );
};

export default EvidenceViewerPage;
