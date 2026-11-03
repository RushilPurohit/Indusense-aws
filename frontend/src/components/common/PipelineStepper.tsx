import React from 'react';
import { StageLogItem, PipelineStageName } from '../../types';
import { Activity, Search, GitCompare, ShieldCheck, Route, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface PipelineStepperProps {
  stageLog?: StageLogItem[];
  activeStage?: PipelineStageName;
  onStageClick?: (stage: PipelineStageName) => void;
  caseId?: string;
  assetName?: string;
}

const STAGES: Array<{ id: PipelineStageName; label: string; sub: string; icon: any }> = [
  { id: 'PREDICT', label: '1. Predict', sub: 'Condition / RUL / Pc', icon: Activity },
  { id: 'RETRIEVE', label: '2. Retrieve', sub: 'Corpus & Graph Search', icon: Search },
  { id: 'ALIGN', label: '3. Align', sub: 'CEA Matrix & Graph Path', icon: GitCompare },
  { id: 'VALIDATE', label: '4. Validate', sub: 'Pc, Rc, Oc, CEA Fusion', icon: ShieldCheck },
  { id: 'ADAPT', label: '5. Adapt', sub: 'Confidence-Aware Router', icon: Route },
  { id: 'EXPLAIN', label: '6. Explain', sub: 'Citations & Sign-off', icon: FileText }
];

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  stageLog = [],
  activeStage = 'PREDICT',
  onStageClick,
  caseId,
  assetName
}) => {
  const getStageStatus = (stageId: PipelineStageName) => {
    const item = stageLog.find((s) => s.stage === stageId);
    return item ? item.status : 'completed';
  };

  const getStageDuration = (stageId: PipelineStageName) => {
    const item = stageLog.find((s) => s.stage === stageId);
    return item ? `${item.duration_ms}ms` : undefined;
  };

  return (
    <div className="w-full bg-[#1C2541] border-b border-[#334155] text-white px-4 py-2">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Case identifier context */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 font-mono shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400">ACTIVE PIPELINE:</span>
          <span className="text-sky-300 font-semibold">{caseId ? caseId.toUpperCase() : 'CASE-CNC-M102'}</span>
          {assetName && <span className="text-slate-400">({assetName})</span>}
        </div>

        {/* 6-Stage Stepper: Engineered to never clip at 1280px+ */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 w-full lg:w-auto lg:flex items-center">
          {STAGES.map((st, idx) => {
            const status = getStageStatus(st.id);
            const duration = getStageDuration(st.id);
            const isActive = activeStage === st.id;
            const Icon = st.icon;

            return (
              <button
                key={st.id}
                onClick={() => onStageClick && onStageClick(st.id)}
                type="button"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all text-left text-xs ${
                  isActive
                    ? 'bg-[#0284C7] text-white font-medium ring-1 ring-sky-300'
                    : 'bg-[#0B132B]/60 text-slate-300 hover:bg-[#0B132B] hover:text-white'
                }`}
                title={`${st.label} - ${st.sub}`}
              >
                <div className="shrink-0 flex items-center justify-center">
                  {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                  {status === 'running' && <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                  {status === 'pending' && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                </div>

                <div className="min-w-0">
                  <div className="truncate font-semibold tracking-tight text-xs text-white leading-tight">
                    {st.label}
                  </div>
                  <div className="hidden xl:block text-[11px] text-slate-300 font-medium truncate leading-none mt-0.5">
                    {st.sub}
                  </div>
                </div>

                {duration && (
                  <span className="hidden lg:inline-block ml-auto text-xs font-mono font-bold text-sky-200 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700/60 shadow-xs">
                    {duration}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status Badge */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">Stage SLA:</span>
          <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-950/90 border border-emerald-600 px-2 py-0.5 rounded shadow-xs">
            TOTAL: 242ms
          </span>
        </div>
      </div>
    </div>
  );
};

export default PipelineStepper;
