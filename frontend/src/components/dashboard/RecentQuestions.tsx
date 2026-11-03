import React from 'react';
import { MessageSquare, ArrowRight, Bot } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Query {
  id: number;
  text: string;
  machine: string;
  time: string;
  confidence: number;
  category: string;
}

const questions: Query[] = [
  { id: 1, text: 'What is the torque limit for IRB-6700 axis 2?',       machine: 'IRB-6700',   time: '10 min ago',  confidence: 96, category: 'Spec Lookup'     },
  { id: 2, text: 'How do I reset fault code E404 on the drive?',         machine: 'Controller', time: '1 hour ago',  confidence: 91, category: 'Fault Recovery'  },
  { id: 3, text: 'Expected lifecycle of bearing part #892-A',            machine: 'Motor-X90',  time: '3 hours ago', confidence: 88, category: 'Lifecycle'        },
  { id: 4, text: 'Steps to clean the cooling fan shroud safely?',        machine: 'Pump-Sys-B', time: '5 hours ago', confidence: 94, category: 'Maintenance'     },
];

const CATEGORY_COLOR: Record<string, string> = {
  'Spec Lookup':    'bg-blue-50 text-blue-700 border-blue-200',
  'Fault Recovery': 'bg-red-50 text-red-700 border-red-200',
  'Lifecycle':      'bg-violet-50 text-violet-700 border-violet-200',
  'Maintenance':    'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const ConfidencePill: React.FC<{ value: number }> = ({ value }) => {
  const color = value >= 90 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : value >= 75 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-700 bg-red-50 border-red-200';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {value}% conf.
    </span>
  );
};

const RecentQuestions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-50 border border-violet-200 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Recent Assistant Queries</h3>
            <p className="text-xs text-slate-400">Click any query to reopen in the assistant</p>
          </div>
        </div>
        <Link to="/assistant" className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1">
          Open Assistant <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Query list */}
      <div className="divide-y divide-slate-100">
        {questions.map(q => (
          <button
            key={q.id}
            onClick={() => navigate(`/assistant?query=${encodeURIComponent(q.text)}`)}
            className="w-full text-left px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors group"
          >
            {/* Icon */}
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-slate-200 transition-colors">
              <MessageSquare className="w-4 h-4 text-slate-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-900 leading-snug">"{q.text}"</p>
                <ConfidencePill value={q.confidence} />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${CATEGORY_COLOR[q.category]}`}>
                  {q.category}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {q.machine}
                </span>
                <span className="text-[10px] text-slate-400">{q.time}</span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentQuestions;
