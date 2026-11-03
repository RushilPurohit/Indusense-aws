import React from 'react';

interface DataLabelProps {
  label: string;
  value?: string | number | null;
  unit?: string;
  normalRange?: string;
  deviation?: {
    type: 'normal' | 'high' | 'low' | 'unknown';
    text: string;
  };
  isMono?: boolean;
  className?: string;
}

export const DataLabel: React.FC<DataLabelProps> = ({
  label,
  value,
  unit,
  normalRange,
  deviation,
  isMono = true,
  className = '',
}) => {
  const isAvailable = value !== undefined && value !== null && value !== '' && !Number.isNaN(value);

  return (
    <div className={`space-y-0.5 ${className}`}>
      <div className="text-xs text-slate-500 font-medium">{label}</div>

      <div className="flex items-baseline gap-1.5 flex-wrap">
        {isAvailable ? (
          <>
            <span
              className={`text-sm font-semibold text-slate-900 ${
                isMono ? 'font-mono tabular-nums' : ''
              }`}
            >
              {typeof value === 'number' && Number.isFinite(value)
                ? Number.isInteger(value)
                  ? value.toString()
                  : value.toFixed(2)
                : value}
            </span>
            {unit && <span className="text-xs text-slate-500 font-mono">{unit}</span>}
          </>
        ) : (
          <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            Not available
          </span>
        )}

        {normalRange && (
          <span className="text-[11px] text-slate-400 font-mono ml-1">
            (Normal: {normalRange})
          </span>
        )}
      </div>

      {deviation && isAvailable && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium pt-0.5">
          {deviation.type === 'normal' && (
            <span className="text-emerald-700 flex items-center gap-1">
              <span aria-hidden="true">●</span>
              <span>{deviation.text || 'Within normal range'}</span>
            </span>
          )}
          {deviation.type === 'high' && (
            <span className="text-rose-700 flex items-center gap-1">
              <span aria-hidden="true">▲</span>
              <span>{deviation.text}</span>
            </span>
          )}
          {deviation.type === 'low' && (
            <span className="text-amber-700 flex items-center gap-1">
              <span aria-hidden="true">▼</span>
              <span>{deviation.text}</span>
            </span>
          )}
          {deviation.type === 'unknown' && (
            <span className="text-slate-500 flex items-center gap-1">
              <span aria-hidden="true">○</span>
              <span>{deviation.text}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DataLabel;
