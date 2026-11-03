import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Network,
  Sliders,
  Play,
  Zap,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Server,
  Cloud,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { indusenseApi } from '../services/indusenseApi';
import { CLOUD_SERVICES_STATUS } from '../services/mockData';
import { RouterSimulationResult } from '../types';
import { useAuth } from '../context/AuthContext';

export const CloudRouter: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'technician') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <ShieldCheck className="w-7 h-7 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted &mdash; Technician Panel</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-mono">
          Cloud processing paths, dispatch thresholds, and multi-tier latency simulations are restricted to <strong>Lead Reliability Engineers</strong> and <strong>System Administrators</strong>.
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
  // Sandbox Sliders
  const [pc, setPc] = useState<number>(0.92);
  const [oc, setOc] = useState<number>(0.95);
  const [rc, setRc] = useState<number>(0.88);
  const [cea, setCea] = useState<number>(0.91);
  const [conflict, setConflict] = useState<boolean>(false);

  const [simResult, setSimResult] = useState<RouterSimulationResult>({
    path: 'LIGHT',
    reason: 'High condition & evidence confidence; minimal risk. Deterministic local dispatch.',
    estimated_latency_ms: 240,
    estimated_cost_usd: 0.0018,
    breakdown: { Pc: 0.92, Oc: 0.95, Rc: 0.88, CEA: 0.91, conflict: false }
  });

  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = async (p = pc, o = oc, r = rc, c = cea, conf = conflict) => {
    setIsSimulating(true);
    try {
      const res = await indusenseApi.simulateRouter({
        Pc: p,
        Oc: o,
        Rc: r,
        CEA: c,
        conflict: conf
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Presets
  const applyPreset = (preset: 'nominal' | 'balanced' | 'conflict') => {
    if (preset === 'nominal') {
      setPc(0.95);
      setOc(0.96);
      setRc(0.92);
      setCea(0.94);
      setConflict(false);
      runSimulation(0.95, 0.96, 0.92, 0.94, false);
    } else if (preset === 'balanced') {
      setPc(0.78);
      setOc(0.88);
      setRc(0.84);
      setCea(0.82);
      setConflict(false);
      runSimulation(0.78, 0.88, 0.84, 0.82, false);
    } else {
      setPc(0.89);
      setOc(0.91);
      setRc(0.88);
      setCea(0.24);
      setConflict(true);
      runSimulation(0.89, 0.91, 0.88, 0.24, true);
    }
  };

  return (
    <div className="space-y-4 max-w-[1720px] mx-auto text-slate-900">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-card p-4 shadow-card">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Confidence-Aware Cloud Router</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dynamic cloud dispatch based on multi-confidence uncertainty (Pc, Oc, Rc, CEA). Minimizes cloud compute cost while escalating ambiguous or conflicting failure modes.
        </p>
      </div>

      {/* 3 Path Cards: Light / Standard / Heavy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Light Path */}
        <div className="bg-white border border-slate-200 rounded-card p-4.5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 border border-sky-300 px-2 py-0.5 rounded">
                LIGHT PATH
              </span>
              <span className="text-[10px] font-mono text-slate-500">Today: 24 dispatches</span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase text-slate-500 block">Trigger Thresholds</span>
                <span className="text-slate-800 font-medium">Pc &ge; 0.88, CEA &ge; 0.85, No Conflict</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-slate-500 block">Pipeline Execution</span>
                <span className="text-slate-600">Local CPU template synthesizer / fast vector search</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Measured Latency</span>
              <span className="font-bold text-slate-900">~240ms</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
              <span className="font-bold text-emerald-700">$0.0018 / call</span>
            </div>
          </div>
        </div>

        {/* Standard Path */}
        <div className="bg-white border border-slate-200 rounded-card p-4.5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                STANDARD PATH
              </span>
              <span className="text-[10px] font-mono text-slate-500">Today: 8 dispatches</span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase text-slate-500 block">Trigger Thresholds</span>
                <span className="text-slate-800 font-medium">0.70 &le; Pc &lt; 0.88 or 0.60 &le; CEA &lt; 0.85</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-slate-500 block">Pipeline Execution</span>
                <span className="text-slate-600">Dual-pass retrieval + cross-encoder reranking</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Measured Latency</span>
              <span className="font-bold text-slate-900">~390ms</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
              <span className="font-bold text-amber-700">$0.0048 / call</span>
            </div>
          </div>
        </div>

        {/* Heavy Path */}
        <div className="bg-white border border-slate-200 rounded-card p-4.5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-mono text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded">
                HEAVY PATH
              </span>
              <span className="text-[10px] font-mono text-slate-500">Today: 3 dispatches</span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase text-slate-500 block">Trigger Thresholds</span>
                <span className="text-slate-800 font-medium">Conflict Flag = TRUE or Pc &lt; 0.70 or CEA &lt; 0.60</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-slate-500 block">Pipeline Execution</span>
                <span className="text-slate-600">Full Bedrock reasoning + mandatory human engineering escalation</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Measured Latency</span>
              <span className="font-bold text-slate-900">~650ms</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
              <span className="font-bold text-rose-700">$0.0145 / call</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Sandbox Simulator + AWS Integration Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Routing Parameter Sandbox */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-card p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-sky-600" />
                Routing Parameter Sandbox
              </h3>
              <p className="text-[11px] text-slate-500">Simulate cloud dispatch path with arbitrary confidences</p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-500">Presets:</span>
            <button
              onClick={() => applyPreset('nominal')}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-mono font-medium text-slate-800"
            >
              Nominal
            </button>
            <button
              onClick={() => applyPreset('balanced')}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-mono font-medium text-slate-800"
            >
              Balanced
            </button>
            <button
              onClick={() => applyPreset('conflict')}
              className="px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-xs font-mono font-medium text-rose-900 border border-rose-300"
            >
              Conflict / Distractor
            </button>
          </div>

          {/* Sliders */}
          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between">
                <span className="text-slate-600">Condition Confidence (Pc):</span>
                <span className="font-bold">{(pc * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={pc}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPc(val);
                  runSimulation(val, oc, rc, cea, conflict);
                }}
                className="w-full accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <span className="text-slate-600">Document / OCR Quality (Oc):</span>
                <span className="font-bold">{(oc * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={oc}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setOc(val);
                  runSimulation(pc, val, rc, cea, conflict);
                }}
                className="w-full accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <span className="text-slate-600">Retrieval Confidence (Rc):</span>
                <span className="font-bold">{(rc * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={rc}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setRc(val);
                  runSimulation(pc, oc, val, cea, conflict);
                }}
                className="w-full accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <span className="text-slate-600">Condition-Evidence Alignment (CEA):</span>
                <span className="font-bold">{(cea * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={cea}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCea(val);
                  runSimulation(pc, oc, rc, val, conflict);
                }}
                className="w-full accent-sky-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="confCheck"
                checked={conflict}
                onChange={(e) => {
                  const val = e.target.checked;
                  setConflict(val);
                  runSimulation(pc, oc, rc, cea, val);
                }}
                className="rounded accent-rose-600 w-4 h-4"
              />
              <label htmlFor="confCheck" className="text-xs text-rose-900 font-semibold cursor-pointer">
                Simulate CEA Semantic Distractor Conflict
              </label>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="mt-4 p-3.5 rounded bg-slate-50 border border-slate-300 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase">Simulated Path Output</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  simResult.path === 'LIGHT'
                    ? 'bg-sky-100 text-sky-800'
                    : simResult.path === 'STANDARD'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {simResult.path} PATH
              </span>
            </div>
            <div className="text-slate-700 mt-2 font-sans text-xs leading-relaxed">
              {simResult.reason}
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
              <span>Latency: {simResult.estimated_latency_ms}ms</span>
              <span>Cost: ${simResult.estimated_cost_usd}</span>
            </div>
          </div>
        </div>

        {/* AWS Integration Matrix */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-card p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-sky-600" />
                AWS Integration Matrix &amp; Adapter Status
              </h3>
              <p className="text-[11px] text-slate-500">
                Honesty specification: Unconfigured cloud services are rendered in neutral grey. Zero AWS credentials required in local mode.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Service / Adapter</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Adapter Mode</th>
                  <th className="py-2.5 px-3">Active Implementation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {CLOUD_SERVICES_STATUS.map((svc) => (
                  <tr key={svc.service} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{svc.service}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">{svc.role}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 border border-slate-300">
                        {svc.mode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 font-sans">{svc.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudRouter;
