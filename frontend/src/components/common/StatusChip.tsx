import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  UserCheck,
  XCircle,
  HelpCircle,
  FileQuestion,
  Activity,
} from 'lucide-react';

export type StatusChipVariant =
  | 'confirmed'
  | 'aligned'
  | 'needs_review'
  | 'insufficient'
  | 'mismatch'
  | 'conflict'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'escalate'
  | 'not_available'
  | 'processing'
  | 'demo';

interface StatusChipProps {
  status: StatusChipVariant | string;
  label?: string;
  techCode?: string; // Optional research abbreviation e.g. "CEA", "Pc", "Rc"
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  techCode,
  size = 'md',
  className = '',
}) => {
  const norm = (status || '').toLowerCase().trim();

  let text = label;
  let bg = 'bg-slate-100';
  let textCol = 'text-slate-700';
  let border = 'border-slate-300';
  let Icon = HelpCircle;

  switch (norm) {
    case 'confirmed':
    case 'aligned':
    case 'healthy':
    case 'ready':
      text = text || 'Evidence Aligned';
      bg = 'bg-emerald-50';
      textCol = 'text-emerald-800';
      border = 'border-emerald-300';
      Icon = CheckCircle2;
      break;

    case 'needs_review':
    case 'needs further review':
    case 'warning':
    case 'insufficient':
    case 'insufficient evidence':
      text = text || 'Needs Further Review';
      bg = 'bg-amber-50';
      textCol = 'text-amber-800';
      border = 'border-amber-300';
      Icon = AlertTriangle;
      break;

    case 'mismatch':
    case 'conflict':
    case 'critical':
    case 'fault':
    case 'prediction and evidence do not match':
      text = text || 'Evidence Mismatch';
      bg = 'bg-rose-50';
      textCol = 'text-rose-800';
      border = 'border-rose-300';
      Icon = ShieldAlert;
      break;

    case 'pending':
    case 'awaiting review':
      text = text || 'Awaiting Review';
      bg = 'bg-slate-100';
      textCol = 'text-slate-800';
      border = 'border-slate-300';
      Icon = Clock;
      break;

    case 'accepted':
    case 'approved':
      text = text || 'Accepted';
      bg = 'bg-emerald-50';
      textCol = 'text-emerald-800';
      border = 'border-emerald-300';
      Icon = UserCheck;
      break;

    case 'rejected':
      text = text || 'Rejected';
      bg = 'bg-rose-50';
      textCol = 'text-rose-800';
      border = 'border-rose-300';
      Icon = XCircle;
      break;

    case 'escalate':
      text = text || 'Escalated';
      bg = 'bg-amber-50';
      textCol = 'text-amber-800';
      border = 'border-amber-300';
      Icon = AlertTriangle;
      break;

    case 'processing':
      text = text || 'Processing';
      bg = 'bg-sky-50';
      textCol = 'text-sky-800';
      border = 'border-sky-300';
      Icon = Activity;
      break;

    case 'demo':
      text = text || 'Demo Data';
      bg = 'bg-slate-100';
      textCol = 'text-slate-700';
      border = 'border-slate-300';
      Icon = HelpCircle;
      break;

    case 'not_available':
    default:
      text = text || (norm ? norm.charAt(0).toUpperCase() + norm.slice(1) : 'Not available');
      bg = 'bg-slate-100';
      textCol = 'text-slate-600';
      border = 'border-slate-300';
      Icon = FileQuestion;
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${bg} ${textCol} ${border} ${padding} ${className}`}
      role="status"
    >
      <Icon className={`${iconSize} shrink-0`} aria-hidden="true" />
      <span>{text}</span>
      {techCode && (
        <span
          className="ml-0.5 px-1 py-0.2 bg-white/70 rounded text-[10px] font-mono border border-slate-200/80 text-slate-600"
          title={`Research metric: ${techCode}`}
        >
          {techCode}
        </span>
      )}
    </span>
  );
};

export default StatusChip;
