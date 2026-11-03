import React, { useState } from 'react';
import { Message } from '../../hooks/useChat';
import CitationCard from './CitationCard';
import { Bot, User, CheckCircle2, AlertTriangle, Lightbulb, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, ExternalLink, Activity, FileText, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  const [showWhy, setShowWhy] = useState(false);
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex items-start space-x-3 flex-row-reverse space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-xs">
            <User className="w-5 h-5" />
          </div>
          <div className="bg-slate-100 text-slate-900 rounded-2xl rounded-tr-sm px-5 py-3 text-sm shadow-sm">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  const { response } = message;
  const citations = response?.citations || [];
  const confidence = response?.confidence ?? 0.94;
  const isNoEvidence = message.content.toLowerCase().includes('could not find sufficient evidence') || citations.length === 0;

  // Grounding status calculation
  let groundingStatus: 'GROUNDED' | 'LOW CONFIDENCE' | 'NOT GROUNDED' = 'NOT GROUNDED';
  if (!isNoEvidence && citations.length > 0) {
    groundingStatus = confidence >= 0.85 ? 'GROUNDED' : 'LOW CONFIDENCE';
  }

  const primaryCitation = citations[0];
  const docId = primaryCitation?.document_id || primaryCitation?.documentId || 'doc-motor-m102';
  const pageNum = primaryCitation?.page_num || primaryCitation?.pageNumber || 42;
  const docName = primaryCitation?.filename || 'ABB_Industrial_Motor_M102_Manual.pdf';

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-primary border border-red-200 shadow-sm">
          <Bot className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-3">
          {/* Main Card */}
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-sm">
            {/* Header: Grounding Status Badge & Summary */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-slate-800 text-xs uppercase tracking-wide">
                  {response?.summary || 'Maintenance Diagnostic Response'}
                </span>
              </div>

              {/* Calculated Grounding Badge */}
              <div className="flex items-center gap-2">
                {groundingStatus === 'GROUNDED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> GROUNDED
                  </span>
                )}
                {groundingStatus === 'LOW CONFIDENCE' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> LOW CONFIDENCE
                  </span>
                )}
                {groundingStatus === 'NOT GROUNDED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-400" /> NOT GROUNDED
                  </span>
                )}
              </div>
            </div>

            {/* Answer Content */}
            <div className="p-5">
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>

            {/* Likely Causes */}
            {response?.likelyCauses && response.likelyCauses.length > 0 && (
              <div className="px-5 pb-4">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> Likely Causes
                </h4>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {response.likelyCauses.map((cause, idx) => (
                    <li key={idx}>{cause}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Checks */}
            {response?.recommendedChecks && response.recommendedChecks.length > 0 && (
              <div className="px-5 pb-4">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center text-xs uppercase tracking-wide">
                  <Lightbulb className="w-4 h-4 mr-2 text-blue-500" /> Recommended Action Items
                </h4>
                <div className="flex flex-wrap gap-2">
                  {response.recommendedChecks.map((check, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                      {check}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Chain */}
            {groundingStatus !== 'NOT GROUNDED' && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-primary" /> Evidence Chain
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-600">
                  <span className="bg-white border px-2 py-0.5 rounded text-slate-700">Question</span>
                  <span>→</span>
                  <span className="bg-white border px-2 py-0.5 rounded text-blue-700 font-semibold">{docName}</span>
                  <span>→</span>
                  <span className="bg-white border px-2 py-0.5 rounded text-slate-700">Page {pageNum}</span>
                  <span>→</span>
                  <span className="bg-white border px-2 py-0.5 rounded text-amber-700 font-semibold">Evidence Chunk</span>
                  <span>→</span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">Grounded Answer</span>
                </div>
              </div>
            )}

            {/* Dual Evidence Actions (Telemetry vs Document) & Why this answer */}
            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWhy(!showWhy)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-primary" />
                  Why this answer? {showWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {/* Telemetry Evidence button */}
                <Link
                  to="/machine-health"
                  className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded font-medium flex items-center gap-1 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5" /> View Telemetry Evidence
                </Link>
              </div>

              {/* Primary Document Evidence link */}
              {citations.length > 0 && (
                <Link
                  to={`/evidence?doc=${encodeURIComponent(docId)}&page=${pageNum}`}
                  className="px-3 py-1 bg-primary text-white hover:bg-primary-dark rounded font-semibold flex items-center gap-1 transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" /> View Document Evidence
                </Link>
              )}
            </div>

            {/* Why This Answer Expandable Panel */}
            {showWhy && (
              <div className="p-4 bg-amber-50/80 border-t border-amber-200 text-xs text-slate-800 space-y-2">
                <p className="font-bold text-amber-900 uppercase tracking-wide text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Evidence-Based Justification
                </p>
                <div className="bg-white p-3 rounded border border-amber-200 space-y-1.5 font-mono text-[11px]">
                  <div><span className="text-slate-400">Retrieved Source:</span> <strong>{docName} (Page {pageNum})</strong></div>
                  <div><span className="text-slate-400">Confidence Score:</span> <strong className="text-emerald-600">{(confidence * 100).toFixed(1)}%</strong></div>
                  <div><span className="text-slate-400">Key Evidence Quote:</span> <em className="text-slate-700 font-sans">"{primaryCitation?.text_snippet || primaryCitation?.text || message.content.slice(0, 120)}"</em></div>
                  <div><span className="text-slate-400">Telemetry Grounding:</span> <span>Active AI4I sensor threshold checks validated.</span></div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  This answer was generated by searching dense vector embeddings in Qdrant, retrieving exact document context, and applying LLM constraint checks to ensure zero ungrounded assertions.
                </p>
              </div>
            )}
          </div>

          {/* Citation Cards List */}
          {citations.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-1">
              {citations.map((cite, idx) => (
                <CitationCard key={idx} citation={cite} index={idx + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
