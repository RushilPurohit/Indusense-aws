import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const machines = [
  { name: 'IRB-6700', score: 85, status: 'Warning' },
  { name: 'Motor-X90', score: 98, status: 'Healthy' },
  { name: 'Conv-A',   score: 95, status: 'Healthy' },
  { name: 'Pump-B',   score: 28, status: 'Fault'   },
  { name: 'Robot-Arm2', score: 92, status: 'Healthy' },
];

const COLOR: Record<string, string> = {
  Healthy: '#10B981',
  Warning: '#F59E0B',
  Fault:   '#EF4444',
};
const BG: Record<string, string> = {
  Healthy: 'bg-emerald-500',
  Warning: 'bg-amber-500',
  Fault:   'bg-red-500',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-slate-900 mb-1">{d.name}</p>
      <p className="text-slate-500">Health Score: <span className="font-semibold text-slate-800">{d.score}%</span></p>
      <p className="text-slate-500">Status: <span className="font-semibold" style={{ color: COLOR[d.status] }}>{d.status}</span></p>
    </div>
  );
};

const MachineHealthOverview: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Fleet Health Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Health scores across connected machines</p>
        </div>
        <Link to="/machine-health" className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1">
          Run Analysis <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Bar Chart */}
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={machines} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#CBD5E1' }}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC', radius: 6 }} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {machines.map(m => (
                <Cell key={m.name} fill={COLOR[m.status]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-slate-100">
        {Object.entries(COLOR).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${BG[label]}`} />
            <span className="text-xs text-slate-500 font-medium">{label}</span>
          </div>
        ))}
        <div className="ml-auto text-xs text-slate-400">{machines.length} machines tracked</div>
      </div>
    </div>
  );
};

export default MachineHealthOverview;
