import React, { useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { KnowledgeGraph, GraphNode } from '../../types';
import { Info, X } from 'lucide-react';

interface Props {
  graphData: KnowledgeGraph;
}

const KnowledgeGraphViewer: React.FC<Props> = ({ graphData }) => {
  const fgRef = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(2, 2000);
    }
  }, []);

  const getNodeColor = (type: string) => {
    switch(type) {
      case 'Machine': return '#EF4444'; // Red
      case 'Fault': return '#F59E0B'; // Orange
      case 'Component': return '#3B82F6'; // Blue
      case 'Procedure': return '#10B981'; // Green
      default: return '#94A3B8'; // Slate
    }
  };

  const formattedData = {
    nodes: graphData?.nodes || [],
    links: graphData?.edges || []
  };

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
      <ForceGraph2D
        ref={fgRef}
        graphData={formattedData as any}
        nodeLabel="label"
        nodeColor={n => getNodeColor((n as any).type)}
        nodeRelSize={6}
        linkColor={() => '#CBD5E1'}
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={handleNodeClick}
        d3VelocityDecay={0.3}
      />

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-md shadow-sm border border-slate-200 text-xs font-medium space-y-2 pointer-events-none">
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Machine</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>Fault</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Component</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Procedure</div>
      </div>

      {/* Details Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-80 bg-white p-4 rounded-md shadow-lg border border-slate-200 z-10 transition-all">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-slate-800 text-lg pr-4">{selectedNode.label}</h3>
            <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold mb-4 border border-slate-200">{selectedNode.type}</span>
          
          {selectedNode.properties && (
            <div className="space-y-2 mt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center"><Info className="w-3 h-3 mr-1"/> Properties</h4>
              {Object.entries(selectedNode.properties).map(([key, value]) => (
                <div key={key} className="text-sm border-b border-slate-100 pb-1">
                  <span className="font-medium text-slate-600 mr-2">{key}:</span>
                  <span className="text-slate-800">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphViewer;
