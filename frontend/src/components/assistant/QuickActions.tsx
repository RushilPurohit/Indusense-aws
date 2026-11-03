import React from 'react';
import { BookOpen, AlertCircle, FileSearch, Activity, FileStack, Thermometer, Wrench, Zap } from 'lucide-react';

interface Props {
  onSelect: (action: string) => void;
}

const actions = [
  {
    label: 'Analyze Manual',
    desc: 'Summarize key procedures',
    icon: BookOpen,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    query: 'Summarize the key maintenance procedures in this manual.',
  },
  {
    label: 'Diagnose Fault',
    desc: 'Find root cause of fault codes',
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    query: 'What are the likely causes for fault code E404 and how do I resolve it?',
  },
  {
    label: 'Sensor Analysis',
    desc: 'Detect anomalies in telemetry',
    icon: Activity,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    query: 'Are there any anomalies or failure risks in the recent machine sensor data?',
  },
  {
    label: 'Overheating Issue',
    desc: 'Thermal fault troubleshooting',
    icon: Thermometer,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    query: 'What are the causes of motor overheating and how do I fix it?',
  },
  {
    label: 'Bearing Check',
    desc: 'Vibration & bearing procedures',
    icon: Zap,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    query: 'How do I diagnose and replace a failing bearing on the motor assembly?',
  },
  {
    label: 'Repair Steps',
    desc: 'Step-by-step technician guide',
    icon: Wrench,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    query: 'Give me step-by-step repair instructions for the cutting tool assembly.',
  },
];

const QuickActions: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-2xl">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 text-center">
        Suggested queries
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => onSelect(action.query)}
              className="group flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary/50 hover:shadow-md transition-all text-left"
            >
              <div className={`w-8 h-8 ${action.bg} rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 group-hover:text-primary transition-colors">{action.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{action.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
