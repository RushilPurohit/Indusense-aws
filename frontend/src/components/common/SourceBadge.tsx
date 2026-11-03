import React from 'react';
import { Activity, BookOpen, Sparkles, HelpCircle, FlaskConical, Calculator } from 'lucide-react';

export type SourceType =
  | 'measured'
  | 'sourced'
  | 'ai_written'
  | 'demo_data'
  | 'hypothesis'
  | 'estimated';

interface SourceBadgeProps {
  type: SourceType;
  label?: string;
  sourceDoc?: string;
  page?: number | string;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  type,
  label,
  sourceDoc,
  page,
  className = '',
}) => {
  switch (type) {
    case 'measured':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
          title="Direct measurement from physical sensors, telemetry stream, or validated ML model"
        >
          <Activity className="w-3 h-3 text-slate-500" />
          <span>{label || 'Measured'}</span>
        </span>
      );

    case 'sourced':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-800 border border-sky-200 ${className}`}
          title={sourceDoc ? `Quoted from ${sourceDoc}${page ? ` (p. ${page})` : ''}` : 'Quoted directly from indexed maintenance documentation'}
        >
          <BookOpen className="w-3 h-3 text-sky-600" />
          <span>{label || (sourceDoc ? `${sourceDoc}${page ? ` : p.${page}` : ''}` : 'Sourced from manual')}</span>
        </span>
      );

    case 'ai_written':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200/90 ${className}`}
          title="Generated explanation synthesized by AI model. Always verify with cited manual excerpts."
        >
          <Sparkles className="w-3 h-3 text-indigo-600" />
          <span>{label || 'AI-written summary'}</span>
        </span>
      );

    case 'demo_data':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-300 font-mono ${className}`}
          title="Demonstration / seed record. Not a live production feed."
        >
          <HelpCircle className="w-3 h-3 text-slate-500" />
          <span>{label || 'Demo data'}</span>
        </span>
      );

    case 'hypothesis':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300 font-mono ${className}`}
          title="Research formulation under evaluation — not yet validated in field trials"
        >
          <FlaskConical className="w-3 h-3 text-amber-600" />
          <span>{label || 'Research hypothesis - not validated'}</span>
        </span>
      );

    case 'estimated':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200 italic ${className}`}
          title="Estimated approximation, not an empirical measurement"
        >
          <Calculator className="w-3 h-3 text-slate-400" />
          <span>{label || 'Estimated'}</span>
        </span>
      );

    default:
      return null;
  }
};

export default SourceBadge;
