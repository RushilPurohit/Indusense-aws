import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';

export type CalloutType = 'danger' | 'warning' | 'info' | 'success' | 'neutral';

interface CalloutProps {
  type?: CalloutType;
  title: string;
  message: React.ReactNode;
  technicalDetails?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const Callout: React.FC<CalloutProps> = ({
  type = 'warning',
  title,
  message,
  technicalDetails,
  action,
  className = '',
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  let bg = 'bg-amber-50';
  let border = 'border-amber-300';
  let textTitle = 'text-amber-900';
  let textBody = 'text-amber-800';
  let Icon = AlertTriangle;
  let iconCol = 'text-amber-600';

  if (type === 'danger') {
    bg = 'bg-rose-50';
    border = 'border-rose-300';
    textTitle = 'text-rose-900';
    textBody = 'text-rose-800';
    Icon = ShieldAlert;
    iconCol = 'text-rose-600';
  } else if (type === 'info') {
    bg = 'bg-sky-50';
    border = 'border-sky-300';
    textTitle = 'text-sky-900';
    textBody = 'text-sky-800';
    Icon = Info;
    iconCol = 'text-sky-600';
  } else if (type === 'success') {
    bg = 'bg-emerald-50';
    border = 'border-emerald-300';
    textTitle = 'text-emerald-900';
    textBody = 'text-emerald-800';
    Icon = CheckCircle2;
    iconCol = 'text-emerald-600';
  } else if (type === 'neutral') {
    bg = 'bg-slate-50';
    border = 'border-slate-300';
    textTitle = 'text-slate-900';
    textBody = 'text-slate-700';
    Icon = Info;
    iconCol = 'text-slate-500';
  }

  return (
    <div
      className={`rounded-lg border p-4 ${bg} ${border} ${className}`}
      role={type === 'danger' ? 'alert' : 'region'}
      aria-live={type === 'danger' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconCol}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-bold ${textTitle}`}>{title}</h4>
          <div className={`text-xs mt-1 leading-relaxed ${textBody}`}>{message}</div>

          {technicalDetails && (
            <div className="mt-2.5 pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded py-0.5"
                aria-expanded={detailsOpen}
              >
                {detailsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span>Technical details &amp; research formulation</span>
              </button>

              {detailsOpen && (
                <div className="mt-2 p-2.5 bg-white/80 rounded border border-slate-200 text-xs font-mono text-slate-800 leading-normal">
                  {technicalDetails}
                </div>
              )}
            </div>
          )}

          {action && (
            <div className="mt-3">
              <button
                type="button"
                onClick={action.onClick}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 hover:bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Callout;
