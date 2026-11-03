import React from 'react';
import { Server, AlertTriangle, FileText, MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useDocuments } from '../../hooks/useDocuments';

const Sparkline: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 64, h = 24;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

interface KPICardProps {
  title: string;
  value: string | number;
  sub: string;
  trend: 'up' | 'down' | 'neutral';
  trendLabel: string;
  icon: React.FC<any>;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  spark: number[];
  sparkColor: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title, value, sub, trend, trendLabel, icon: Icon,
  iconBg, iconColor, accentColor, spark, sparkColor,
}) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden border-l-4 ${accentColor}`}>
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </div>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs">
        {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
        {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
        {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
        <span className={trend === 'up' ? 'text-emerald-600 font-semibold' : trend === 'down' ? 'text-red-600 font-semibold' : 'text-slate-500'}>
          {trendLabel}
        </span>
      </div>
      <Sparkline values={spark} color={sparkColor} />
    </div>
  </div>
);

const MetricsRow: React.FC = () => {
  const { documents } = useDocuments();
  const docCount = documents.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        title="Machines Online"
        value="4 / 5"
        sub="1 machine in fault state"
        trend="neutral"
        trendLabel="1 critical alert"
        icon={Server}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        accentColor="border-l-blue-500"
        spark={[5,5,5,4,4,4,4]}
        sparkColor="#3B82F6"
      />
      <KPICard
        title="Critical Alerts"
        value="1"
        sub="Pump-Sys-B · Vibration fault"
        trend="down"
        trendLabel="Down from 3 yesterday"
        icon={AlertTriangle}
        iconBg="bg-red-50"
        iconColor="text-red-600"
        accentColor="border-l-red-500"
        spark={[3,3,2,2,2,1,1]}
        sparkColor="#EF4444"
      />
      <KPICard
        title="Docs Indexed"
        value={docCount || 0}
        sub="Active in vector DB"
        trend="up"
        trendLabel={docCount > 0 ? `+${docCount} uploaded` : 'Upload to begin'}
        icon={FileText}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        accentColor="border-l-emerald-500"
        spark={[0,0,1,1,2,2,docCount]}
        sparkColor="#10B981"
      />
      <KPICard
        title="AI Queries Today"
        value="12"
        sub="Avg. confidence: 94%"
        trend="up"
        trendLabel="+4 since yesterday"
        icon={MessageSquare}
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        accentColor="border-l-violet-500"
        spark={[4,5,6,7,8,10,12]}
        sparkColor="#7C3AED"
      />
    </div>
  );
};

export default MetricsRow;
