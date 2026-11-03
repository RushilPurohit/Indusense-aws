import React from 'react';
import { AlertTriangle, BookOpen, CheckCircle2, Copy, FileText, X } from 'lucide-react';

interface ManualSolution {
  applicable: boolean;
  verdict: string;
  reason: string;
  steps: string[];
  warnings: string[];
  parts: string[];
  source: { document: string; section: string; page: number; doc_id: string } | null;
  passage: string | null;
}

interface ManualDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution?: ManualSolution | null;
  loading?: boolean;
}

export const ManualDefectModal: React.FC<ManualDefectModalProps> = ({
  isOpen,
  onClose,
  solution,
  loading = false,
}) => {
  if (!isOpen) return null;

  const copyPassage = async () => {
    if (solution?.passage) await navigator.clipboard.writeText(solution.passage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col text-slate-900">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-sm">Show solution from manual</h3>
              <p className="text-xs text-slate-300">Rule-based extraction from the aligned passage only</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {loading && <div className="py-10 text-center text-slate-500">Loading the verified manual passage…</div>}
          {!loading && solution && (
            <>
              <div className={`p-3 rounded-lg border ${solution.applicable
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                <div className="flex items-center gap-2 font-bold">
                  {solution.applicable
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <AlertTriangle className="w-4 h-4" />}
                  {solution.applicable ? solution.verdict : 'No manual solution is available for this condition'}
                </div>
                <div className="mt-1">{solution.reason}</div>
              </div>

              {solution.applicable && solution.source && (
                <>
                  {solution.warnings.length > 0 && (
                    <div className="p-3 rounded-lg border-2 border-amber-400 bg-amber-50 text-amber-950">
                      <div className="font-bold uppercase tracking-wide mb-1">Safety first</div>
                      {solution.warnings.map((warning) => <p key={warning}>{warning}</p>)}
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-700">Source</div>
                    <div className="mt-1">{solution.source.document} · {solution.source.section} · Page {solution.source.page}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 mb-2">Steps from the manual</div>
                    <ol className="space-y-2">
                      {solution.steps.map((step) => (
                        <li key={step} className="p-2.5 rounded border border-slate-200 bg-white">
                          {step} <span className="block text-[10px] text-slate-500 mt-1">Extracted from the manual text</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  {solution.parts.filter(Boolean).length > 0 && (
                    <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
                      <strong>Parts / tools / limits:</strong> {solution.parts.filter(Boolean).join(' · ')}
                    </div>
                  )}
                  <details className="rounded-lg border border-slate-200 p-3">
                    <summary className="font-bold cursor-pointer flex items-center gap-2"><FileText className="w-4 h-4" /> Full original passage</summary>
                    <p className="mt-2 text-slate-700 leading-relaxed">{solution.passage}</p>
                  </details>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={copyPassage} className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 font-semibold flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                    <button onClick={() => window.print()} className="px-3 py-2 rounded bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                      Print work instruction
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
