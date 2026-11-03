import React, { useState } from 'react';
import ChatInterface from '../components/assistant/ChatInterface';
import { useDocuments } from '../hooks/useDocuments';
import {
  FileText, Check, FileSpreadsheet, Image, BookOpen,
  Database, ShieldCheck, ChevronDown, ChevronRight, Search,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

const TYPE_ICON: Record<string, React.FC<any>> = {
  PDF:   FileText,
  CSV:   FileSpreadsheet,
  Image: Image,
};

const CATEGORY_ICONS: Record<string, React.FC<any>> = {
  Manual:    BookOpen,
  Telemetry: Database,
  Diagram:   Image,
  Standard:  ShieldCheck,
};

const CATEGORY_ORDER = ['Manual', 'Telemetry', 'Diagram', 'Standard'];

function formatBytes(b: number) {
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)} MB`;
  return `${(b / 1_000).toFixed(0)} KB`;
}

const Assistant: React.FC = () => {
  const { documents, loading } = useDocuments();
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [searchQ, setSearchQ] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = documents.filter(d =>
    d.filename.toLowerCase().includes(searchQ.toLowerCase()) ||
    (d.machine || '').toLowerCase().includes(searchQ.toLowerCase())
  );

  const grouped = CATEGORY_ORDER.reduce<Record<string, typeof documents>>((acc, cat) => {
    const items = filtered.filter(d => d.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const toggleCat = (cat: string) =>
    setCollapsed(p => ({ ...p, [cat]: !p[cat] }));

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-5">
      {/* Knowledge Base Sidebar */}
      <div className="w-72 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden hidden lg:flex">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Knowledge Base</h3>
          <p className="text-xs text-slate-400 mt-0.5">{documents.length} documents indexed</p>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* All Documents option */}
        <div className="px-3 pt-2">
          <button
            onClick={() => setSelectedDocId(undefined)}
            className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors flex items-center justify-between ${
              !selectedDocId
                ? 'bg-primary/5 border-primary/30 text-primary font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              All Documents
            </span>
            {!selectedDocId && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Grouped document list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
          {loading && (
            <p className="text-xs text-slate-400 text-center py-4">Loading…</p>
          )}

          {Object.entries(grouped).map(([cat, docs]) => {
            const CatIcon = CATEGORY_ICONS[cat] || FileText;
            const isCollapsed = collapsed[cat];
            return (
              <div key={cat}>
                {/* Category header */}
                <button
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <CatIcon className="w-3 h-3" />
                    {cat} <span className="ml-1 text-slate-300 font-normal normal-case">({docs.length})</span>
                  </span>
                  {isCollapsed
                    ? <ChevronRight className="w-3 h-3" />
                    : <ChevronDown className="w-3 h-3" />
                  }
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5 mb-1">
                    {docs.map(doc => {
                      const isActive = selectedDocId === doc.id;
                      const Icon = TYPE_ICON[doc.type || 'PDF'] || FileText;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDocId(doc.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all group ${
                            isActive
                              ? 'bg-primary/5 border-primary/30'
                              : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate leading-snug ${isActive ? 'text-primary' : 'text-slate-700'}`}>
                                {doc.filename}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {doc.machine && (
                                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                                    {doc.machine}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">
                                  {formatBytes(doc.size)}
                                </span>
                                {doc.status === 'Processing' && (
                                  <Badge type="Processing" className="text-[9px] px-1.5 py-0" />
                                )}
                              </div>
                              {doc.page_count && doc.page_count > 1 && (
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {doc.page_count}p · {doc.chunk_count} chunks
                                  {doc.table_count ? ` · ${doc.table_count} tables` : ''}
                                </p>
                              )}
                            </div>
                            {isActive && <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <p className="text-xs text-slate-400 text-center py-6">No documents match your search.</p>
          )}
        </div>

        {/* Selected doc info footer */}
        {selectedDoc && (
          <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Context Restricted To</p>
            <p className="text-xs font-medium text-slate-800 truncate">{selectedDoc.filename}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {selectedDoc.page_count} pages · {selectedDoc.chunk_count} chunks indexed
            </p>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="flex-1 min-w-0">
        <ChatInterface selectedDocId={selectedDocId} />
      </div>
    </div>
  );
};

export default Assistant;
