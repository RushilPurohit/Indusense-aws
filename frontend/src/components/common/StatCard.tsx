import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  change?: string;
  accentColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon, trend, trendValue, change, accentColor = 'border-l-slate-400',
}) => {
  const displayChange = change || trendValue;

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 ${accentColor}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <div className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}

      {trend && displayChange && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          {trend === 'up'      && <TrendingUp  className="w-3.5 h-3.5 text-emerald-500" />}
          {trend === 'down'    && <TrendingDown className="w-3.5 h-3.5 text-red-500"     />}
          {trend === 'neutral' && <Minus        className="w-3.5 h-3.5 text-slate-400"   />}
          <span className={
            trend === 'up'   ? 'text-emerald-600 font-semibold' :
            trend === 'down' ? 'text-red-600 font-semibold'     : 'text-slate-500'
          }>
            {displayChange}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
