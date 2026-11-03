import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FileSpreadsheet,
  X,
  Play,
  ShieldAlert,
} from 'lucide-react';
import { HERO_CASES, MOCK_ASSETS } from '../services/mockData';
import { indusenseApi } from '../services/indusenseApi';
import { DiagnosisCase } from '../types';

export const Cases: React.FC = () => {
  const navigate = useNavigate();
  const [casesList, setCasesList] = useState<DiagnosisCase[]>(HERO_CASES);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [backendOffline, setBackendOffline] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    indusenseApi.checkHealth().then((h) => {
      if (isMounted) {
        if (h.status === 'mock_fallback') {
          setBackendOffline(true);
        }
      }
    }).catch(() => {
      if (isMounted) setBackendOffline(true);
    });

    indusenseApi.getCases().then((cases) => {
      if (isMounted && cases && cases.length > 0) {
        setCasesList(cases);
      }
    }).catch(() => {
      if (isMounted) setBackendOffline(true);
    });
    return () => { isMounted = false; };
  }, []);

  // New Case Wizard
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [selectedAssetId, setSelectedAssetId] = useState('CNC-M102');
  const [selectedHead, setSelectedHead] = useState('ai4i_fault');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<{ columns: string[]; rows: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCases = casesList.filter((c) => {
    const outcome = c.alignment.length > 0 ? c.alignment[0].outcome : 'INSUFFICIENT EVIDENCE';
    if (statusFilter === 'CONFLICT' && outcome !== 'CONFLICT') return false;
    if (statusFilter === 'ALIGNED' && outcome !== 'ALIGNED') return false;
    if (statusFilter === 'INSUFFICIENT' && outcome !== 'INSUFFICIENT EVIDENCE') return false;
    if (
      searchQuery &&
      !c.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.asset_id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.condition.fault_label.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setCsvPreview({
        columns: ['Air temperature [K]', 'Process temperature [K]', 'Rotational speed [rpm]', 'Torque [Nm]', 'Tool wear [min]'],
        rows: 48
      });
    }
  };

  const handleStartRun = async () => {
    setIsSubmitting(true);
    try {
      const newCase = await indusenseApi.createCase({
        asset_id: selectedAssetId,
        dataset_source: selectedHead === 'ai4i_fault' ? 'UCI AI4I 2020' : selectedHead === 'cmapss_rul' ? 'C-MAPSS Turbofan (Pretrained Benchmark)' : 'FEMTO Bearing',
        head: selectedHead
      });
      setShowWizard(false);
      navigate(`/cases/${newCase.id}`);
    } catch (err) {
      console.error(err);
      setShowWizard(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Diagnosis Cases</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} • Click a card to open the full workspace
          </p>
        </div>
        <button
          onClick={() => { setWizardStep(1); setShowWizard(true); }}
          className="flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {/* Backend Offline Warning Banner */}
      {backendOffline && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 flex items-start gap-3 shadow-sm text-xs text-rose-900">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-rose-950">Backend API Offline (No Silent Fallback)</div>
            <div className="text-rose-800 mt-0.5">
              The FastAPI backend on <code>http://localhost:8000/api</code> is currently unreachable. Live model predictions and telemetry pipelines require an active server connection. To start backend: <code>uvicorn server.main:app --port 8000</code>.
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="All">All Statuses</option>
          <option value="ALIGNED">Evidence Aligned</option>
          <option value="CONFLICT">Conflict Detected</option>
          <option value="INSUFFICIENT">Insufficient Evidence</option>
        </select>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by asset or fault..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((c) => {
          const outcome = c.alignment.length > 0 ? c.alignment[0].outcome : 'INSUFFICIENT EVIDENCE';
          const isConflict = outcome === 'CONFLICT';
          const isInsufficient = outcome === 'INSUFFICIENT EVIDENCE';

          return (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className={`bg-white border rounded-xl shadow-sm p-5 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between ${
                isConflict
                  ? 'border-l-4 border-l-rose-400 border-slate-200'
                  : isInsufficient
                  ? 'border-l-4 border-l-amber-400 border-slate-200'
                  : 'border-l-4 border-l-emerald-400 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-500">{c.asset_id}</div>
                    <h3 className="font-semibold text-slate-900 leading-snug mt-0.5">{c.asset_name}</h3>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                      c.routing.path === 'LIGHT'
                        ? 'bg-sky-100 text-sky-700'
                        : c.routing.path === 'STANDARD'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {c.routing.path === 'LIGHT' ? 'Low Priority' : c.routing.path === 'STANDARD' ? 'Medium' : 'High Priority'}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium mb-1">Detected Fault</div>
                  <div className="font-semibold text-slate-900 text-sm">{c.condition.fault_label}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${c.condition.Pc * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-600 shrink-0">{(c.condition.Pc * 100).toFixed(0)}% confidence</span>
                  </div>
                </div>

                <div className="mt-3">
                  {isConflict ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                      <ShieldAlert className="w-3 h-3" /> Evidence Conflict
                    </span>
                  ) : isInsufficient ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Insufficient Evidence
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Evidence Aligned
                    </span>
                  )}
                </div>

                {c.explanation.generated_text && (
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {c.explanation.generated_text}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex items-center gap-1 text-sm text-sky-600 font-medium group">
                  <span>Open Case</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Case Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">New Diagnosis Run</h3>
                <p className="text-xs text-slate-500 mt-0.5">Step {wizardStep} of 2</p>
              </div>
              <button onClick={() => setShowWizard(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Asset</label>
                    <select
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {MOCK_ASSETS.map((a) => (
                        <option key={a.id} value={a.id}>{a.id} — {a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-sky-500 mb-2" />
                    <div className="font-medium text-slate-700 text-sm">Upload Telemetry CSV</div>
                    <div className="text-xs text-slate-400 mt-1">Supports AI4I 2020 or C-MAPSS format</div>
                  </div>

                  {csvPreview && (
                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{csvPreview.rows} telemetry samples loaded</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Analysis Model</label>
                    <div className="space-y-2">
                      {[
                        { id: 'ai4i_fault', name: 'Machine Fault Classifier', desc: 'Detects heat, wear, power, and overstrain failures (AI4I 2020)' },
                        { id: 'cmapss_rul', name: 'Remaining Life Predictor', desc: 'LSTM-based time-to-failure estimation (C-MAPSS FD001 Pretrained Benchmark)' },
                        { id: 'femto_bearing', name: 'Bearing Health Monitor', desc: 'Spectral analysis for spalling and kurtosis detection (FEMTO)' },
                      ].map((head) => (
                        <div
                          key={head.id}
                          onClick={() => setSelectedHead(head.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                            selectedHead === head.id
                              ? 'border-sky-400 bg-sky-50'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-semibold text-slate-900 text-sm">{head.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{head.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-1">
                    <button onClick={() => setWizardStep(1)} className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                      ← Back
                    </button>
                    <button
                      onClick={handleStartRun}
                      disabled={isSubmitting}
                      className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {isSubmitting ? 'Running...' : 'Run Analysis'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cases;
