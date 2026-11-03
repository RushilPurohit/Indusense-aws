import React from 'react';
import { AlertTriangle, FileText, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

interface ActivityItem {
  id: number;
  machine: string;
  event: string;
  time: string;
  status: 'Warning' | 'Ready' | 'Healthy' | 'Fault';
  type: 'alert' | 'doc' | 'check' | 'fault';
}

const activities: ActivityItem[] = [
  { id: 1, machine: 'IRB-6700-01',     event: 'Anomaly Detected: High Temp',      time: '10m ago',  status: 'Warning', type: 'alert' },
  { id: 2, machine: 'Motor-X90',        event: 'Maintenance Manual Updated',       time: '2h ago',   status: 'Ready',   type: 'doc'   },
  { id: 3, machine: 'Conveyor-Belt-A',  event: 'Routine Check Completed',          time: '5h ago',   status: 'Healthy', type: 'check' },
  { id: 4, machine: 'Pump-Sys-B',       event: 'Critical: Vibration Alert',        time: '1d ago',   status: 'Fault',   type: 'fault' },
  { id: 5, machine: 'Robot-Arm-2',      event: 'Bearing lubrication completed',    time: '2d ago',   status: 'Healthy', type: 'check' },
];

const TYPE_CONFIG = {
  alert: { Icon: AlertTriangle,  dot: 'bg-amber-500',  ring: 'ring-amber-200',  iconColor: 'text-amber-500'  },
  doc:   { Icon: FileText,       dot: 'bg-blue-500',   ring: 'ring-blue-200',   iconColor: 'text-blue-500'   },
  check: { Icon: CheckCircle2,   dot: 'bg-emerald-500',ring: 'ring-emerald-200',iconColor: 'text-emerald-500'},
  fault: { Icon: Zap,            dot: 'bg-red-500',    ring: 'ring-red-200',    iconColor: 'text-red-500'    },
};

const STATUS_BADGE: Record<string, string> = {
  Warning: 'bg-amber-100 text-amber-700 border-amber-200',
  Ready:   'bg-blue-100 text-blue-700 border-blue-200',
  Healthy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Fault:   'bg-red-100 text-red-700 border-red-200',
};

const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Recent Activity</h3>
          <p className="text-xs text-slate-400 mt-0.5">Live event feed from all machines</p>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </span>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative px-5 py-3">
          {/* Vertical line */}
          <div className="absolute left-[30px] top-0 bottom-0 w-px bg-slate-100" />

          <div className="space-y-5">
            {activities.map((item) => {
              const cfg = TYPE_CONFIG[item.type];
              const Icon = cfg.Icon;
              return (
                <div key={item.id} className="flex gap-4 items-start group">
                  {/* Icon bubble */}
                  <div className={`relative z-10 w-8 h-8 rounded-full bg-white border-2 border-slate-200 ring-4 ${cfg.ring} flex items-center justify-center shrink-0 group-hover:border-slate-300 transition-colors`}>
                    <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.machine}</p>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGE[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.event}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100">
        <button className="w-full text-xs text-slate-400 hover:text-primary font-medium flex items-center justify-center gap-1 transition-colors">
          View all events <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
