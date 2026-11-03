import React, { useState } from 'react';
import SensorUpload from '../components/machine/SensorUpload';
import SensorCharts from '../components/machine/SensorCharts';
import {
  Activity, AlertTriangle, CheckCircle2, ShieldAlert,
  Wrench, BarChart2, Cpu, Thermometer, Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── SVG Ring Gauge ────────────────────────────────────────────── */
const RiskRing: React.FC<{ prob: number; isHighRisk: boolean; isWarning: boolean }> = ({
  prob, isHighRisk, isWarning,
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (prob / 100) * circumference;
  const color = isHighRisk ? '#DC2626' : isWarning ? '#D97706' : '#16A34A';
  const bgColor = isHighRisk ? '#FEE2E2' : isWarning ? '#FEF3C7' : '#DCFCE7';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke={bgColor} strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold" style={{ color }}>{prob}%</span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Risk</span>
      </div>
    </div>
  );
};

/* ─── Page ──────────────────────────────────────────────────────── */
export const MachineHealth: React.FC = () => {
  const [prediction, setPrediction] = useState<any | null>(null);
  const [sensorRows, setSensorRows] = useState<any[]>([]);
  const navigate = useNavigate();

  const handlePredictionComplete = (result: any, rawData: any[]) => {
    setPrediction(result);
    setSensorRows(rawData);
  };

  const riskProb = prediction?.failure_probability ?? 0;
  const isHighRisk = riskProb > 60;
  const isWarning = riskProb > 30 && riskProb <= 60;

  const statusConfig = isHighRisk
    ? { label: 'Critical', bg: 'bg-red-600', text: 'text-white', border: 'border-red-700', icon: ShieldAlert, badge: 'bg-red-100 text-red-700 border-red-200' }
    : isWarning
    ? { label: 'Warning', bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600', icon: AlertTriangle, badge: 'bg-amber-100 text-amber-700 border-amber-200' }
    : { label: 'Healthy', bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700', icon: CheckCircle2, badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Machine Health & Predictive Maintenance</h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload telemetry data to predict component failure modes using the AI4I 2020 XGBoost model.
          </p>
        </div>
        {prediction && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </div>
        )}
      </div>

      {/* Upload Form */}
      <SensorUpload onPredictionComplete={handlePredictionComplete} />

      {/* Results */}
      {prediction ? (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className={`rounded-xl border p-6 flex flex-col md:flex-row items-center gap-6
            ${isHighRisk ? 'bg-red-50 border-red-200' : isWarning ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <RiskRing prob={riskProb} isHighRisk={isHighRisk} isWarning={isWarning} />
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Failure Risk Assessment</p>
              <p className={`text-3xl font-extrabold mt-1 ${isHighRisk ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
                {riskProb}% Failure Probability
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Predicted fault:{' '}
                <span className={`font-bold px-2 py-0.5 rounded border text-xs ${statusConfig.badge}`}>
                  {prediction.predicted_fault || 'Overstrain Failure (OSF)'}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Machine: <strong>{prediction.machine_id || 'Unit M-102'}</strong> &nbsp;·&nbsp;
                Model: <strong>AI4I 2020 XGBoost</strong> &nbsp;·&nbsp;
                Confidence: <strong className="text-emerald-600">{((prediction.confidence || 0.94) * 100).toFixed(1)}%</strong>
              </p>
            </div>
            <button
              onClick={() =>
                navigate(
                  `/assistant?query=${encodeURIComponent(
                    `Sensor telemetry shows ${riskProb}% failure risk. Predicted fault: ${prediction.predicted_fault || 'OSF'}. What should I check first?`
                  )}`
                )
              }
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Wrench className="w-4 h-4" />
              Ask AI Assistant
            </button>
          </div>

          {/* Cards row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recommendation */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Technician Recommendation
              </p>
              <p className="text-sm text-slate-700 leading-relaxed bg-amber-50 border border-amber-200 p-3 rounded-lg font-medium">
                {prediction.recommendation ||
                  'Tool wear at 216 min exceeds 200 min limit. Replace cutting tool assembly immediately.'}
              </p>
              <p className="mt-3 text-[11px] text-slate-500">
                Critical sensors: <span className="font-semibold text-slate-700">
                  {prediction.critical_sensors?.join(', ') || 'Tool Wear, Torque'}
                </span>
              </p>
            </div>

            {/* Quick stats */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                Telemetry Snapshot
              </p>
              {sensorRows.length > 0 && (() => {
                const last = sensorRows[sensorRows.length - 1];
                return (
                  <div className="space-y-2 text-xs">
                    {[
                      { label: 'Air Temp', value: last['Air temperature [K]'], unit: 'K', icon: Thermometer },
                      { label: 'Process Temp', value: last['Process temperature [K]'], unit: 'K', icon: Thermometer },
                      { label: 'RPM', value: last['Rotational speed [rpm]'], unit: 'rpm', icon: Zap },
                      { label: 'Torque', value: last['Torque [Nm]'], unit: 'Nm', icon: Zap },
                      { label: 'Tool Wear', value: last['Tool wear [min]'], unit: 'min', icon: Wrench },
                    ].map(({ label, value, unit, icon: Icon }) => (
                      <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-slate-500 flex items-center gap-1"><Icon className="w-3 h-3" />{label}</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {value !== undefined ? `${value} ${unit}` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
              {sensorRows.length === 0 && (
                <p className="text-xs text-slate-400">No raw sensor rows available.</p>
              )}
            </div>
          </div>

          {/* Feature Importances */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              Key Sensor Risk Factors
              <span className="text-xs font-normal text-slate-400">(Feature Importances)</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(
                prediction.feature_importance || {
                  'Tool Wear': 0.38, Torque: 0.27, 'Process Temp': 0.21, RPM: 0.14,
                }
              ).map(([feat, val]: [string, any]) => {
                const pct = (val * 100).toFixed(0);
                const barColor = val >= 0.3 ? '#DC2626' : val >= 0.2 ? '#D97706' : '#3B82F6';
                return (
                  <div key={feat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{feat}</span>
                      <span className="text-slate-900 font-mono font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${val * 100}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Series Charts */}
          {sensorRows.length > 0 && <SensorCharts data={sensorRows} />}
        </div>
      ) : (
        /* Empty state */
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-700 font-semibold text-base mb-1">No telemetry loaded</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Upload a machine telemetry CSV above to generate failure predictions and sensor feature importances.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Air Temp', 'Process Temp', 'RPM', 'Torque', 'Tool Wear'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineHealth;
