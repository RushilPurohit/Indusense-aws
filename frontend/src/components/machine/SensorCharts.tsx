import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';

interface Props {
  data: any[];
}

// Map raw CSV column names to short display keys
const mapRow = (row: any, index: number) => ({
  index: index + 1,
  airTemp: row['Air temperature [K]'] ?? row['temperature'] ?? null,
  processTemp: row['Process temperature [K]'] ?? null,
  rpm: row['Rotational speed [rpm]'] ?? row['rpm'] ?? null,
  torque: row['Torque [Nm]'] ?? row['torque'] ?? null,
  toolWear: row['Tool wear [min]'] ?? row['tool_wear'] ?? null,
});

const TOOL_WEAR_LIMIT = 200;

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
    <h4 className="text-sm font-semibold text-slate-700 mb-4">{title}</h4>
    <div className="h-52">{children}</div>
  </div>
);

const tooltipStyle = {
  contentStyle: { fontSize: '11px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
};

const SensorCharts: React.FC<Props> = ({ data }) => {
  const chartData = data.map(mapRow);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 text-sm">Sensor Time-Series Readings</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temperature Chart */}
        <ChartCard title="🌡 Temperature (K)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 12, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="index" label={{ value: 'Sample', position: 'insideBottomRight', offset: -4, fontSize: 10 }} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="airTemp" stroke="#EF4444" strokeWidth={2} dot={false} name="Air Temp (K)" />
              <Line type="monotone" dataKey="processTemp" stroke="#F97316" strokeWidth={2} dot={false} name="Process Temp (K)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* RPM & Torque Chart */}
        <ChartCard title="⚙ Rotational Speed & Torque">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 12, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="index" label={{ value: 'Sample', position: 'insideBottomRight', offset: -4, fontSize: 10 }} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94A3B8' }} domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line yAxisId="left" type="monotone" dataKey="rpm" stroke="#3B82F6" strokeWidth={2} dot={false} name="RPM" />
              <Line yAxisId="right" type="monotone" dataKey="torque" stroke="#F59E0B" strokeWidth={2} dot={false} name="Torque (Nm)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Tool Wear Chart — full width */}
        <div className="lg:col-span-2">
          <ChartCard title="🔧 Tool Wear (min) — Limit: 200 min">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 12, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="index" label={{ value: 'Sample', position: 'insideBottomRight', offset: -4, fontSize: 10 }} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} domain={[0, 'auto']} />
                <Tooltip {...tooltipStyle} />
                <ReferenceLine y={TOOL_WEAR_LIMIT} stroke="#EF4444" strokeDasharray="6 3" label={{ value: 'Limit', fill: '#EF4444', fontSize: 10, position: 'right' }} />
                <Line type="monotone" dataKey="toolWear" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4, fill: '#8B5CF6' }} name="Tool Wear (min)" activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default SensorCharts;
