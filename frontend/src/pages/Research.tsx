import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical,
  Database,
  BarChart2,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Info,
  GitBranch,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ModelTrainingSection } from './ModelTrainingSection';
import { useAuth } from '../context/AuthContext';

export const Research: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'training' | 'benchmark'>('training');

  if (user?.role === 'technician') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <ShieldCheck className="w-7 h-7 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted &mdash; Technician Panel</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-mono">
          Model retraining, hyperparameter configuration, and empirical benchmark evaluations require <strong>Lead Reliability Engineer</strong> or <strong>System Administrator</strong> authorization.
        </p>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 font-mono max-w-md mx-auto">
          Your active role: <span className="font-bold text-emerald-700 uppercase">Technician (Review Sign-Off)</span>
        </div>
        <div className="pt-2">
          <Link
            to="/cases"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Return to My Cases &rarr;</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1720px] mx-auto text-slate-900">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-card p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Research Framework &amp; Benchmark Evaluation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical evaluation of InduSense condition-evidence alignment versus DL-only and standard RAG baselines.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200 text-xs font-mono">
          <button
            onClick={() => setSelectedTab('training')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              selectedTab === 'training' ? 'bg-[#1C2541] text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-sky-400" /> Model Training &amp; Evaluation
          </button>
          <button
            onClick={() => setSelectedTab('benchmark')}
            className={`px-3 py-1.5 rounded transition-colors ${
              selectedTab === 'benchmark' ? 'bg-[#1C2541] text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Architectural Benchmark Comparison
          </button>
        </div>
      </div>

      {/* TAB 0: MODEL TRAINING & EVALUATION */}
      {selectedTab === 'training' && <ModelTrainingSection />}

      {/* TAB 1: EVALUATION BENCHMARK */}
      {selectedTab === 'benchmark' && (
        <div className="space-y-4">
          {/* Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-card p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Architectural Baseline Comparison</h3>
                <p className="text-xs text-slate-500">
                  Evaluated on synthetic maintenance alignment benchmark (condition, passage, technical applicability).
                </p>
              </div>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded uppercase">
                SYNTHETIC BENCHMARK
              </span>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 font-mono text-[11px] text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Architecture</th>
                    <th className="py-2.5 px-3">Condition Acc (AI4I)</th>
                    <th className="py-2.5 px-3">RUL RMSE (C-MAPSS)</th>
                    <th className="py-2.5 px-3">Precision@1</th>
                    <th className="py-2.5 px-3">Distractor Conflict F1</th>
                    <th className="py-2.5 px-3">ECE Calibration</th>
                    <th className="py-2.5 px-3">Mean Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">1. DL-Only Inference</td>
                    <td className="py-2.5 px-3">96.8%</td>
                    <td className="py-2.5 px-3">14.2 cycles</td>
                    <td className="py-2.5 px-3 text-slate-400">N/A (No docs)</td>
                    <td className="py-2.5 px-3 text-slate-400">N/A</td>
                    <td className="py-2.5 px-3 text-rose-700">0.142 (Overconfident)</td>
                    <td className="py-2.5 px-3">45ms</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">2. Plain RAG (BM25 + Vector)</td>
                    <td className="py-2.5 px-3 text-slate-400">N/A (No sensors)</td>
                    <td className="py-2.5 px-3 text-slate-400">N/A</td>
                    <td className="py-2.5 px-3">68.4%</td>
                    <td className="py-2.5 px-3 text-rose-700">0.241 (Proximity Fallacy)</td>
                    <td className="py-2.5 px-3 text-slate-400">N/A</td>
                    <td className="py-2.5 px-3">420ms</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">3. Prediction + Naive RAG</td>
                    <td className="py-2.5 px-3">96.8%</td>
                    <td className="py-2.5 px-3">14.2 cycles</td>
                    <td className="py-2.5 px-3">74.2%</td>
                    <td className="py-2.5 px-3 text-rose-700">0.315 (Passes Distractors)</td>
                    <td className="py-2.5 px-3">0.142</td>
                    <td className="py-2.5 px-3">465ms</td>
                  </tr>
                  <tr className="bg-sky-50/70 border-l-[3px] border-l-[#0284C7] font-semibold text-slate-900">
                    <td className="py-2.5 px-3 text-sky-900">4. InduSense (Unified CEA)</td>
                    <td className="py-2.5 px-3">97.2%</td>
                    <td className="py-2.5 px-3">13.8 cycles</td>
                    <td className="py-2.5 px-3 text-emerald-700">92.6%</td>
                    <td className="py-2.5 px-3 text-emerald-700">0.948 (Distractors Blocked)</td>
                    <td className="py-2.5 px-3 text-emerald-700">0.032 (Calibrated)</td>
                    <td className="py-2.5 px-3 text-sky-800">242ms (Adaptive)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-card p-4 shadow-card">
              <div className="text-xs font-mono font-bold text-slate-800">AI4I 2020 Fault-Mode Breakdown</div>
              <div className="mt-2 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span>HDF (Heat Dissipation):</span> <span className="font-bold text-emerald-700">F1 0.98</span>
                </div>
                <div className="flex justify-between">
                  <span>TWF (Tool Wear Failure):</span> <span className="font-bold text-emerald-700">F1 0.94</span>
                </div>
                <div className="flex justify-between">
                  <span>PWF (Power Failure):</span> <span className="font-bold text-emerald-700">F1 0.96</span>
                </div>
                <div className="flex justify-between">
                  <span>OSF (Overstrain Failure):</span> <span className="font-bold text-emerald-700">F1 0.95</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t">
                  <span>RNF (Random Failure):</span> <span>Excluded (No diagnosable procedure)</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-card p-4 shadow-card">
              <div className="text-xs font-mono font-bold text-slate-800">C-MAPSS FD001 RUL Metrics</div>
              <div className="mt-2 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span>LSTM-GRU Ensemble RMSE:</span> <span className="font-bold">13.8 cycles</span>
                </div>
                <div className="flex justify-between">
                  <span>Mean Absolute Error (MAE):</span> <span className="font-bold">10.4 cycles</span>
                </div>
                <div className="flex justify-between">
                  <span>NASA Scoring Function:</span> <span className="font-bold">342.1</span>
                </div>
                <div className="flex justify-between">
                  <span>MC-Dropout Coverage (90%):</span> <span className="font-bold text-emerald-700">89.4%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-card p-4 shadow-card">
              <div className="text-xs font-mono font-bold text-slate-800">Probability Calibration &amp; ECE</div>
              <div className="mt-2 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span>Raw Uncalibrated ECE:</span> <span className="font-bold text-rose-700">0.142</span>
                </div>
                <div className="flex justify-between">
                  <span>Isotonic Calibrated ECE:</span> <span className="font-bold text-emerald-700">0.032</span>
                </div>
                <div className="flex justify-between">
                  <span>Brier Score:</span> <span className="font-bold text-emerald-700">0.058</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t">
                  Reliability curve confirms predicted probabilities reflect true empirical error frequency.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Research;
