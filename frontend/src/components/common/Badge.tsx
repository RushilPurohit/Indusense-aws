import React from 'react';

type StatusType = 'Healthy' | 'Warning' | 'Fault' | 'Critical' | 'Processing' | 'Ready' | 'Error' | 'Online' | 'Offline';

const CONFIG: Record<StatusType, { dot: string; text: string; bg: string; border: string }> = {
  Healthy:    { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  Online:     { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  Ready:      { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  Warning:    { dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200'   },
  Processing: { dot: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200'    },
  Fault:      { dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200'     },
  Critical:   { dot: 'bg-red-600',     text: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-300'     },
  Error:      { dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200'     },
  Offline:    { dot: 'bg-slate-400',   text: 'text-slate-600',   bg: 'bg-slate-100',   border: 'border-slate-200'   },
};

export const Badge: React.FC<{ type: StatusType; className?: string; pulse?: boolean }> = ({
  type,
  className = '',
  pulse = false,
}) => {
  const c = CONFIG[type] || CONFIG.Offline;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot} ${pulse ? 'animate-pulse' : ''}`} />
      {type}
    </span>
  );
};
