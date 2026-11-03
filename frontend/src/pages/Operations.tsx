import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Cpu,
} from 'lucide-react';
import { MOCK_ASSETS, HERO_CASES } from '../services/mockData';
import { indusenseApi } from '../services/indusenseApi';
import { MlModel, TrainingRun } from '../types';

export const Operations: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlant, setSelectedPlant] = useState('All Plants');
  const [selectedFamily, setSelectedFamily] = useState('All Families');
  const [mlModels, setMlModels] = useState<MlModel[]>([]);
  const [activeModels, setActiveModels] = useState<Record<string, string>>({});
  const [trainingRuns, setTrainingRuns] = useState<TrainingRun[]>([]);

  useEffect(() => {
    indusenseApi.getMlModels().then((data) => {
      setMlModels(data.models || []);
      setActiveModels(data.active_models || {});
    }).catch(() => {});
    indusenseApi.getTrainingRuns().then((runs) => {
      setTrainingRuns(runs || []);
    }).catch(() => {});
  }, []);

  const latestRun = trainingRuns[0];
  const latestRunTime = latestRun ? new Date(latestRun.started_at).toLocaleTimeString() : 'Recent';

  // Filter assets
  const filteredAssets = MOCK_ASSETS.filter((asset) => {
    if (selectedPlant !== 'All Plants' && asset.plant !== selectedPlant) return false;
    if (selectedFamily !== 'All Families' && asset.family !== selectedFamily) return false;
    return true;
  });

  const totalAssets = filteredAssets.length;
  const healthyCount = filteredAssets.filter((a) => a.status === 'Healthy').length;
  const warningCount = filteredAssets.filter((a) => a.status === 'Warning').length;
  const faultCount = filteredAssets.filter((a) => a.status === 'Fault').length;
  const alertCount = 1;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fleet Operations</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time machine health and diagnosis overview</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          >
            <option>All Plants</option>
            <option>Plant 1</option>
            <option>Plant 2</option>
            <option>Plant 4</option>
          </select>
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          >
            <option>All Families</option>
            <option>CNC Machining</option>
            <option>Bearing Assembly</option>
            <option>Turbofan Fleet</option>
          </select>
        </div>
      </div>

      {/* Model Health Section — Exactly Once */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Model Health &amp; Governance</h2>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-200 font-semibold">
            {mlModels.length} Models Operational
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 uppercase">Registered Models</div>
            <div className="text-base font-bold text-slate-900 mt-1">{mlModels.length} Models</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 uppercase">Active for Inference</div>
            <div className="text-base font-bold text-emerald-600 mt-1">{Object.keys(activeModels).length} Active</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 uppercase">Failed Model Jobs</div>
            <div className="text-base font-bold text-slate-900 mt-1">0 Failed</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 uppercase">Dataset Ingestion</div>
            <div className="text-base font-bold text-emerald-600 mt-1">0 Errors</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 uppercase">Latest Training</div>
            <div className="text-xs font-bold text-slate-900 mt-1">{latestRunTime}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 uppercase">Requires Review</div>
            <div className="text-base font-bold text-sky-600 mt-1">0 Models</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Assets</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{totalAssets}</div>
          <div className="text-xs text-slate-400 mt-1">Monitored units</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Healthy
          </div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">{healthyCount}</div>
          <div className="text-xs text-slate-400 mt-1">Normal operation</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Warning
          </div>
          <div className="text-3xl font-bold text-amber-600 mt-2">{warningCount}</div>
          <div className="text-xs text-slate-400 mt-1">Needs attention</div>
        </div>

        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold uppercase tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5" />
            Active Alerts
          </div>
          <div className="text-3xl font-bold text-rose-600 mt-2">{alertCount}</div>
          <div className="text-xs text-rose-600 mt-1 font-medium">Requires review</div>
        </div>
      </div>

      {/* Telemetry & Pipeline Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Telemetry Chart */}
        <div className="lg:col-span-2 bg-[#1E293B] border border-[#334155] rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-sm">Live Telemetry — CNC-M102</span>
            </div>
            <span className="text-xs text-rose-400 font-medium">⚠ Threshold exceeded</span>
          </div>

          {/* Chart */}
          <div className="mt-4 h-44 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 160" preserveAspectRatio="none">
              <line x1="0" y1="40" x2="700" y2="40" stroke="#334155" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="700" y2="80" stroke="#334155" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="700" y2="120" stroke="#334155" strokeDasharray="3 3" />
              {/* Alert threshold */}
              <line x1="0" y1="95" x2="700" y2="95" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="580" y="90" fill="#DC2626" fontSize="10" fontFamily="monospace">Alert Limit</text>
              {/* Temp trace */}
              <polyline
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="2.5"
                points="0,70 80,72 160,68 240,76 320,84 400,92 480,105 560,112 640,118 700,120"
              />
              {/* Speed trace */}
              <polyline
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.5"
                points="0,45 80,42 160,48 240,56 320,66 400,80 480,92 560,100 640,104 700,106"
              />
            </svg>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>−60 min</span>
              <span>−30 min</span>
              <span className="text-sky-400">Now</span>
            </div>
          </div>

          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-[#334155] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#0EA5E9] inline-block"></span>
              <span className="text-slate-300">Temperature Delta: 8.1 K</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#F59E0B] inline-block"></span>
              <span className="text-slate-300">Spindle Speed: 1320 rpm</span>
            </div>
          </div>
        </div>

        {/* Pipeline Latency */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="font-semibold text-sm text-slate-800">Pipeline Stages</span>
            <span className="text-xs text-slate-500 font-mono">242ms total</span>
          </div>
          <div className="mt-3 space-y-2">
            {[
              { stage: 'Predict', lat: '45ms' },
              { stage: 'Retrieve', lat: '82ms' },
              { stage: 'Align', lat: '54ms' },
              { stage: 'Validate', lat: '18ms' },
              { stage: 'Route', lat: '12ms' },
              { stage: 'Explain', lat: '31ms' },
            ].map((st, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-slate-700">{st.stage}</span>
                <span className="font-mono text-xs text-sky-700 font-semibold">{st.lat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Diagnosis Cases</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click a row to open the full case workspace</p>
          </div>
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-medium uppercase tracking-wide">
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Fault Detected</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Evidence Status</th>
                <th className="py-3 px-4">Recommended Action</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HERO_CASES.map((c) => {
                const isConflict = c.id === 'case-cnc-m102';
                const isInsufficient = c.id === 'case-turbofan-tf004';
                const alignment = c.alignment?.[0];
                const outcome = alignment?.outcome ?? 'INSUFFICIENT EVIDENCE';

                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className={`cursor-pointer transition-colors ${
                      isConflict
                        ? 'bg-rose-50 border-l-4 border-l-rose-400 hover:bg-rose-100/70'
                        : isInsufficient
                        ? 'bg-amber-50 border-l-4 border-l-amber-400 hover:bg-amber-100/70'
                        : 'border-l-4 border-l-emerald-400 hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{c.asset_id}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[180px]">{c.asset_name}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{c.condition.fault_label}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full"
                            style={{ width: `${c.condition.Pc * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-700">{(c.condition.Pc * 100).toFixed(0)}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isConflict ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">
                          <ShieldAlert className="w-3 h-3" /> Conflict Detected
                        </span>
                      ) : isInsufficient ? (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                          Insufficient Evidence
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Evidence Aligned
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-700 text-sm truncate">
                        {c.explanation.sourced_facts[0] || 'Inspect subsystem'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          c.routing.path === 'LIGHT'
                            ? 'bg-sky-100 text-sky-700'
                            : c.routing.path === 'STANDARD'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {c.routing.path === 'LIGHT' ? 'Low' : c.routing.path === 'STANDARD' ? 'Medium' : 'High'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/cases/${c.id}`); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                        title="Open Case"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Operations;
