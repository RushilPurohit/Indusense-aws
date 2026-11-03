import React from 'react';

interface ConfidenceMeterProps {
  value?: number | null;
  label?: string;
  techCode?: string; // e.g., "Pc", "Rc", "Oc", "CEA"
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  value,
  label,
  techCode,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  if (value === null || value === undefined || isNaN(value)) {
    return (
      <div className={`space-y-1 ${className}`}>
        {showLabel && (
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{label || 'Confidence'}</span>
            {techCode && <span className="font-mono text-[10px] text-slate-400">({techCode})</span>}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full border border-slate-200 overflow-hidden" />
          <span className="font-mono text-xs text-slate-400">Not available</span>
        </div>
      </div>
    );
  }

  const clamped = Math.max(0, Math.min(1, value));
  const percent = Math.round(clamped * 100);

  let qualitative = 'Low';
  let barColor = 'bg-rose-500';
  let textColor = 'text-rose-700';

  if (clamped >= 0.85) {
    qualitative = 'High';
    barColor = 'bg-emerald-500';
    textColor = 'text-emerald-700';
  } else if (clamped >= 0.70) {
    qualitative = 'Moderate';
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={`space-y-1 ${className}`} aria-label={`${label || 'Confidence'}: ${percent}% (${qualitative})`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span>{label || 'Confidence'}</span>
            {techCode && (
              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                {techCode}
              </span>
            )}
          </span>
          <span className={`text-[11px] font-semibold ${textColor}`}>
            {qualitative}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <div
          className={`flex-1 ${heightClass} bg-slate-100 rounded-full border border-slate-200 overflow-hidden`}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`${heightClass} ${barColor} rounded-full transition-all duration-300`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="font-mono font-bold text-xs text-slate-800 tabular-nums shrink-0 w-9 text-right">
          {percent}%
        </span>
      </div>
    </div>
  );
};

export default ConfidenceMeter;
