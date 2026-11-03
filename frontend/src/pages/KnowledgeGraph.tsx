import React, { useState, useEffect } from 'react';
import KnowledgeGraphViewer from '../components/graph/KnowledgeGraphViewer';
import { getGraph } from '../api/graph';
import { KnowledgeGraph as IGraph } from '../types';

const KnowledgeGraphPage: React.FC = () => {
  const [graphData, setGraphData] = useState<IGraph | null>(null);

  useEffect(() => {
    // Mock data since api is just a wrapper
    const mockData: IGraph = {
      nodes: [
        { id: 'm1', label: 'IRB 6700', type: 'Machine', properties: { location: 'Line A' } },
        { id: 'c1', label: 'Axis 2 Motor', type: 'Component', properties: { partNo: '3HAC04123' } },
        { id: 'c2', label: 'Main Controller', type: 'Component' },
        { id: 'f1', label: 'Overheating (Err:402)', type: 'Fault', properties: { severity: 'High' } },
        { id: 'f2', label: 'Comm Loss (Err:404)', type: 'Fault' },
        { id: 'p1', label: 'Check Cooling Fan', type: 'Procedure', properties: { page: 45 } },
        { id: 'p2', label: 'Inspect Wiring Harness', type: 'Procedure' },
      ],
      edges: [
        { source: 'm1', target: 'c1', type: 'has_component' },
        { source: 'm1', target: 'c2', type: 'has_component' },
        { source: 'c1', target: 'f1', type: 'has_fault' },
        { source: 'c2', target: 'f2', type: 'has_fault' },
        { source: 'f1', target: 'p1', type: 'resolved_by' },
        { source: 'f2', target: 'p2', type: 'resolved_by' },
      ]
    };
    setGraphData(mockData);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Knowledge Graph</h1>
        <p className="text-slate-500 text-sm">Explore relationships between machines, faults, and maintenance procedures.</p>
      </div>
      
      {graphData ? (
        <KnowledgeGraphViewer graphData={graphData} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphPage;
