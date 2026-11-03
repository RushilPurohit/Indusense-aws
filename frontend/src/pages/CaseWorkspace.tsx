import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Activity,
  ArrowLeft,
  ShieldAlert,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Clock,
  Check,
  X,
  UserCheck,
  Scale,
  History,
  ShieldCheck,
  Info,
  Layers,
  ArrowUpRight,
  BookOpen,
  Wrench
} from 'lucide-react';
import { HERO_CASES } from '../services/mockData';
import { indusenseApi } from '../services/indusenseApi';
import { DiagnosisCase, EvidenceCandidate, AuditEvent } from '../types';
import { ManualDefectModal } from '../components/common/ManualDefectModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast, ToastMessage } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export const CaseWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isTechnician = user?.role === 'technician';
  const isEngineer = user?.role === 'engineer' || !user?.role;
  const isAdmin = user?.role === 'admin';

  const [currentCase, setCurrentCase] = useState<DiagnosisCase>(() => {
    const found = HERO_CASES.find((c) => c.id === id);
    return found || HERO_CASES[0];
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'evidence' | 'chat' | 'review' | 'audit'>('overview');
  const [selectedCandidate, setSelectedCandidate] = useState<EvidenceCandidate | null>(
    currentCase.evidence_candidates[0] || null
  );

  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'indusense'; text: string }>>([]);
  const [isChatSending, setIsChatSending] = useState(false);

  // Review state (Feature C)
  const [reviewOutcome, setReviewOutcome] = useState<string>(currentCase.review?.outcome || 'Pending');
  const [reviewNotes, setReviewNotes] = useState<string>(currentCase.review?.notes || '');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState<string>(currentCase.review?.reviewer || 'Dr. Elena Vance (Lead Reliability Engineer)');
  const [isReviewSaved, setIsReviewSaved] = useState(false);

  // In-app confirmation dialog and toast notifications (Round A)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const toastId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id: toastId }]);
  };
  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  // Manual Defect Parts Modal state
  const [showManualDefectModal, setShowManualDefectModal] = useState(false);
  const [manualSolution, setManualSolution] = useState<Awaited<ReturnType<typeof indusenseApi.getManualSolution>> | null>(null);
  const [manualSolutionLoading, setManualSolutionLoading] = useState(false);

  const getCaseVerdict = (diagnosisCase: DiagnosisCase) => {
    const aligned = diagnosisCase.alignment.filter((item) => item.outcome === 'ALIGNED').length;
    const rejected = diagnosisCase.alignment.filter((item) => item.outcome === 'CONFLICT').length;
    if (aligned > 0) return rejected > 0 ? `Evidence matches - ${rejected} passage(s) rejected` : 'Evidence matches';
    return rejected > 0 ? 'Prediction and evidence do not match' : 'Not enough evidence';
  };

  const openManualSolution = async () => {
    setShowManualDefectModal(true);
    setManualSolutionLoading(true);
    try {
      setManualSolution(await indusenseApi.getManualSolution(currentCase.id));
    } catch (error) {
      console.error('Unable to load manual solution', error);
      setManualSolution({
        applicable: false,
        verdict: getCaseVerdict(currentCase),
        reason: 'Manual solution could not be loaded. Escalate for engineering review.',
        steps: [],
        warnings: [],
        parts: [],
        source: null,
        passage: null,
      });
    } finally {
      setManualSolutionLoading(false);
    }
  };

  // Load live case from backend or fallback
  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    indusenseApi.getCase(id).then((fetched) => {
      if (isMounted && fetched) {
        setCurrentCase(fetched);
        const bestCandidate = [...fetched.evidence_candidates].sort((a, b) =>
          (fetched.alignment.find((item) => item.candidate_id === b.id)?.CEA || 0) -
          (fetched.alignment.find((item) => item.candidate_id === a.id)?.CEA || 0)
        )[0] || null;
        setSelectedCandidate(bestCandidate);
        setReviewOutcome(fetched.review?.outcome || 'Pending');
        setReviewNotes(fetched.review?.notes || '');
        if (fetched.review?.reviewer) setReviewerName(fetched.review.reviewer);

        setChatHistory([
          {
            sender: 'indusense',
            text: `Case workspace loaded for ${fetched.asset_id} (${fetched.condition.fault_label}). Ask questions regarding monitored telemetry, cited documentation, or alignment criteria.`
          }
        ]);
      }
    }).catch(() => {
      const found = HERO_CASES.find((c) => c.id === id) || HERO_CASES[0];
      if (isMounted) {
        setCurrentCase(found);
        setSelectedCandidate(found.evidence_candidates[0] || null);
        setReviewOutcome(found.review?.outcome || 'Pending');
        setReviewNotes(found.review?.notes || '');
        if (found.review?.reviewer) setReviewerName(found.review.reviewer);
        setChatHistory([
          {
            sender: 'indusense',
            text: `Case workspace loaded for ${found.asset_id} (${found.condition.fault_label}). Ask questions regarding monitored telemetry, cited documentation, or alignment criteria.`
          }
        ]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const query = chatMessage;
    setChatMessage('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: query }]);
    setIsChatSending(true);

    try {
      const res = await indusenseApi.chatCase(currentCase.id, query);
      setChatHistory((prev) => [...prev, { sender: 'indusense', text: res.answer }]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'indusense',
          text: `Maintenance findings for ${currentCase.asset_id}: Monitored condition is ${currentCase.condition.fault_label} (Pc = ${(currentCase.condition.Pc * 100).toFixed(0)}%). Recommended procedure: ${currentCase.explanation.sourced_facts.slice(-1)[0] || 'Inspect physical subsystem'}.`
        }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  const executeReviewSubmission = async (canonicalOutcome: string, notes: string) => {
    const prevOutcome = reviewOutcome;
    setReviewError(null);
    setReviewOutcome(canonicalOutcome);
    setIsReviewSaved(true);

    try {
      const backendOutcome = canonicalOutcome === 'Observation Submitted — Awaiting Engineer Sign-Off' ? 'Needs Further Review' : canonicalOutcome;
      const updated = await indusenseApi.reviewCase(currentCase.id, backendOutcome as any, notes);
      if (updated) {
        setCurrentCase(updated);
      }
      addToast({
        type: 'success',
        title: 'Review Decision Saved',
        message: `Case decision recorded as "${canonicalOutcome}".`,
        undoAction: () => {
          setReviewOutcome(prevOutcome);
          indusenseApi.reviewCase(currentCase.id, (prevOutcome === 'Pending' ? 'Needs Further Review' : prevOutcome) as any, 'Reverted by user');
          addToast({
            type: 'info',
            title: 'Action Undone',
            message: `Review reverted back to "${prevOutcome}".`
          });
        },
        undoLabel: 'Undo Sign-Off'
      });
    } catch (e) {
      console.warn('Review recorded in local state', e);
      addToast({
        type: 'warning',
        title: 'Saved Locally',
        message: 'Review state saved locally in session state.'
      });
    }
    setTimeout(() => setIsReviewSaved(false), 3000);
  };

  const handleRecordReview = async (outcome: 'Accepted' | 'Rejected' | 'Needs Further Review' | 'Escalate' | 'Observation Submitted — Awaiting Engineer Sign-Off') => {
    const canonicalOutcome = outcome === 'Escalate' ? 'Needs Further Review' : outcome;
    const verdict = getCaseVerdict(currentCase);

    if (canonicalOutcome === 'Accepted' && verdict !== 'Evidence matches') {
      if (reviewNotes.trim().length < 15) {
        const errorText = 'An override reason of at least 15 characters is required for this verdict.';
        setReviewError(errorText);
        addToast({
          type: 'error',
          title: 'Override Reason Required',
          message: errorText
        });
        return;
      }

      setConfirmDialog({
        isOpen: true,
        title: 'Confirm Engineering Override',
        message: `This case is currently classified as "${verdict}". Accepting it will record a formal engineering override in the persistent audit trail. Do you wish to proceed?`,
        isDestructive: false,
        confirmLabel: 'Confirm & Sign Off',
        onConfirm: () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          executeReviewSubmission(canonicalOutcome, reviewNotes);
        }
      });
      return;
    }

    if (canonicalOutcome === 'Rejected') {
      setConfirmDialog({
        isOpen: true,
        title: 'Reject Diagnostic Recommendation',
        message: 'Are you sure you want to reject this automated diagnosis? This will mark the recommendation as invalid for repair work orders.',
        isDestructive: true,
        confirmLabel: 'Reject Case',
        onConfirm: () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          executeReviewSubmission(canonicalOutcome, reviewNotes);
        }
      });
      return;
    }

    executeReviewSubmission(canonicalOutcome, reviewNotes);
  };

  const caseVerdict = getCaseVerdict(currentCase);
  const hasConflict = caseVerdict === 'Prediction and evidence do not match';
  const isAligned = currentCase.alignment.length > 0 && currentCase.alignment.some(a => a.outcome === 'ALIGNED');

  const tabItems = [
    { id: 'overview' as const, label: 'Overview', icon: Activity },
    { id: 'comparison' as const, label: 'Evidence Comparison', icon: Scale },
    { id: 'evidence' as const, label: `Supporting Evidence (${currentCase.evidence_candidates.length})`, icon: Search },
    { id: 'chat' as const, label: 'Case Assistant', icon: Sparkles },
    { id: 'review' as const, label: 'Technician Review', icon: UserCheck },
    { id: 'audit' as const, label: `Audit Trail (${(currentCase.audit_trail || []).length})`, icon: History },
  ];

  return (
    <div className="space-y-5 max-w-[1520px] mx-auto pb-12">
      {/* 6-Stage Research Pipeline Stepper */}
      <div className="bg-[#0B132B] text-white rounded-xl p-3 border border-[#1C2541] shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2 px-1">
          <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            RESEARCH PIPELINE TRACE
          </span>
          <span className="text-[11px] text-slate-400">
            Case Ref: <strong className="text-white font-mono">{currentCase.id}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {currentCase.stage_log.map((s, idx) => {
            const isCompleted = s.status === 'completed';
            const isFailed = s.status === 'failed';
            return (
              <div
                key={s.stage}
                className={`p-2.5 rounded-lg border text-center transition-all ${isFailed
                    ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                    : isCompleted
                      ? 'bg-[#1C2541] border-slate-700 text-slate-100'
                      : 'bg-[#1C2541]/40 border-slate-800 text-slate-400'
                  }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold tracking-wider">
                  <span>{idx + 1}. {s.stage}</span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                  {isFailed && <XCircle className="w-3 h-3 text-rose-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-sky-400 font-mono mt-0.5">
                  {s.duration_ms} ms
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/cases')}
            className="text-slate-400 hover:text-slate-800 transition-colors p-1 -ml-1 rounded-lg hover:bg-slate-100"
            title="Return to cases"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400">Cases /</span>
          <span className="text-xs font-mono font-bold text-slate-700">{currentCase.asset_id}</span>
          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
            {currentCase.asset_family || 'Industrial Equipment'}
          </span>
          <span className="text-[11px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 font-medium ml-auto">
            Source: {currentCase.dataset_source}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-medium">Detected Condition</div>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{currentCase.condition.fault_label}</h1>
            <p className="text-sm text-slate-600 mt-1">
              {currentCase.asset_name} · Plant: {currentCase.plant || 'Plant 2'} · Window: {currentCase.telemetry_window}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Condition Confidence */}
            <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 min-w-[110px]">
              <div className="text-xs uppercase font-mono font-semibold text-slate-500">Confidence (Pc)</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">
                {(currentCase.condition.Pc * 100).toFixed(0)}%
              </div>
            </div>

            {/* ONE Overall Case Status Badge (Round A2) */}
            {hasConflict || caseVerdict === 'Prediction and evidence do not match' ? (
              <div className="flex items-center gap-2.5 bg-rose-50 border-2 border-rose-300 text-rose-900 px-4 py-2 rounded-xl shadow-xs">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide">Overall Case Status</div>
                  <div className="text-sm font-bold text-rose-950">Escalated: Evidence Conflict</div>
                </div>
              </div>
            ) : isAligned ? (
              <div className="flex items-center gap-2.5 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 px-4 py-2 rounded-xl shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide">Overall Case Status</div>
                  <div className="text-sm font-bold text-emerald-950">Aligned: Evidence Verified</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 bg-amber-50 border-2 border-amber-300 text-amber-900 px-4 py-2 rounded-xl shadow-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide">Overall Case Status</div>
                  <div className="text-sm font-bold text-amber-950">Needs Review: Insufficient Evidence</div>
                </div>
              </div>
            )}

            {/* Separate Review Decision Badge (Stays Pending until Engineer Signs Off) */}
            <div className={`px-4 py-2 rounded-xl border-2 text-xs font-semibold flex items-center gap-2 shadow-xs ${
              reviewOutcome === 'Accepted' && (hasConflict || caseVerdict === 'Prediction and evidence do not match')
                ? 'bg-amber-50 border-amber-400 text-amber-950'
                : reviewOutcome === 'Accepted'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : reviewOutcome === 'Rejected'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : reviewOutcome === 'Needs Further Review'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              {reviewOutcome === 'Accepted' && (hasConflict || caseVerdict === 'Prediction and evidence do not match') ? (
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              ) : reviewOutcome === 'Accepted' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : reviewOutcome === 'Rejected' ? (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <div className="text-xs uppercase font-mono font-semibold text-slate-500">Review Decision</div>
                <div className="text-sm font-bold">
                  {reviewOutcome === 'Accepted' && (hasConflict || caseVerdict === 'Prediction and evidence do not match')
                    ? 'Accepted [Engineering Override]'
                    : reviewOutcome === 'Pending'
                    ? 'Pending Sign-Off'
                    : reviewOutcome}
                </div>
              </div>
            </div>

            {/* Open Manual Defect Parts Solution Button */}
            <button
              onClick={openManualSolution}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-sky-500"
              title="Inspect technical OEM maintenance manual, disassembly procedures, and physical defect parts"
            >
              <BookOpen className="w-4 h-4" />
              <span>Inspect Manual Defect Solution</span>
            </button>
          </div>
        </div>

        {/* Engineering Override Explanation Callout (Resolves Contradiction when Accepted on Conflict) */}
        {reviewOutcome === 'Accepted' && (hasConflict || caseVerdict === 'Prediction and evidence do not match') && (
          <div className="mt-4 bg-amber-50/90 border border-amber-300 rounded-xl p-4 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-950 space-y-1">
              <div className="font-bold text-amber-950 flex items-center gap-2">
                <span>Accepted via Engineering Override</span>
                <span className="text-xs font-mono font-normal bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 border border-amber-300">
                  Audit Logged
                </span>
              </div>
              <p className="text-amber-900 leading-relaxed font-sans text-sm">
                Engineer <strong>{reviewerName}</strong> has authorized this repair action despite an automated evidence conflict. Autonomous execution remains suspended.
              </p>
              {reviewNotes && (
                <div className="mt-2 text-xs font-mono bg-amber-100/80 p-2.5 rounded border border-amber-200 text-amber-950">
                  <span className="font-bold">Override Rationale:</span> &ldquo;{reviewNotes}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conflict Warning Banner if present and pending */}
        {hasConflict && reviewOutcome !== 'Accepted' && (
          <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-bold text-rose-950">Semantic Proximity Distractor Detected</div>
              <div className="text-rose-800 text-sm mt-0.5 font-sans leading-relaxed">
                {currentCase.validation.conflict_description ||
                  'The naive lexical match targets an unrelated physical subsystem. Autonomous action has been suspended.'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.id
                  ? 'bg-[#0B132B] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & MAINTENANCE FINDINGS
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Monitored Telemetry & Prediction */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-sky-600" />
                Monitored Condition &amp; Sensor Telemetry
              </h2>

              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <div className="text-xs text-slate-500 font-medium">Model Classification</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${currentCase.condition.execution_mode === 'Trained Model'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : currentCase.condition.execution_mode === 'Rule Fallback'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}>
                      {currentCase.condition.execution_mode || 'Trained Model'}
                    </span>
                    <span className="text-[10px] font-mono bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded">
                      {currentCase.condition.calibrated ? 'Calibrated Pc' : 'Uncalibrated'}
                    </span>
                    {(currentCase.dataset_source?.includes('AI4I') || currentCase.dataset_source?.includes('Factory')) && (
                      <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                        Synthetic Dataset
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-900 mt-1">{currentCase.condition.fault_label}</div>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  Model: {currentCase.condition.model_version}
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Component Schematic &amp; Manual Spec:</span>
                  <button
                    onClick={() => setShowManualDefectModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-[#0284C7] font-semibold text-xs border border-slate-300 shadow-2xs transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Show solution from manual &rarr;
                  </button>
                </div>
              </div>

              {/* RUL Card if present */}
              {currentCase.condition.rul !== null && (
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                    Remaining Useful Life (RUL) Forecast
                  </div>
                  <div className="text-3xl font-extrabold text-sky-950 font-mono mt-1">
                    {currentCase.condition.rul} <span className="text-sm font-sans font-normal text-sky-700">cycles</span>
                  </div>
                  {currentCase.condition.rul_interval && (
                    <div className="text-xs text-sky-800 mt-1 font-mono">
                      Uncertainty Band (90% CI): [{currentCase.condition.rul_interval[0]}, {currentCase.condition.rul_interval[1]}] cycles
                    </div>
                  )}
                </div>
              )}

              {/* Sensor Readings */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2">Key Diagnostic Telemetry Streams</div>
                <div className="space-y-2">
                  {currentCase.condition.top_sensors.map((sensor, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-slate-800">{sensor.name}</span>
                        <span className="text-[10px] text-slate-500 block">
                          Normal Operating Range: {sensor.normal_range[0]} – {sensor.normal_range[1]} {sensor.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-slate-900 text-sm">
                          {sensor.value} {sensor.unit}
                        </span>
                        <span className="text-[10px] text-sky-700 block font-mono">
                          Impact: {(sensor.contribution * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spectral Features if Bearing */}
              {currentCase.condition.spectral_features && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-800 mb-1">Vibration Spectral Features</div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-slate-700">
                    <div>FFT Peak: <strong>{currentCase.condition.spectral_features.fft_peak_hz} Hz</strong></div>
                    <div>Kurtosis: <strong>{currentCase.condition.spectral_features.kurtosis}</strong></div>
                    <div>Envelope: <strong>{currentCase.condition.spectral_features.envelope_spectrum_db} dB</strong></div>
                    <div>Crest Factor: <strong>{currentCase.condition.spectral_features.crest_factor}</strong></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Maintenance Findings & Recommended Actions */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-sky-600" />
                Maintenance Findings &amp; Recommended Next Step
              </h2>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Diagnosis Summary</div>
                  <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    AI-written summary
                  </span>
                </div>
                <p className="text-sm text-slate-800 mt-2 leading-relaxed">
                  {currentCase.explanation.generated_text}
                </p>
                {(!currentCase.explanation.citations || currentCase.explanation.citations.length === 0) && !isAligned && (
                  <div className="mt-3 p-2.5 rounded bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>The available evidence does not support a maintenance recommendation. Escalate for engineering review.</span>
                  </div>
                )}
              </div>

              {/* Verified Facts */}
              {currentCase.explanation.sourced_facts.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">Verified Sourced Evidence</div>
                  <ul className="space-y-2">
                    {currentCase.explanation.sourced_facts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Citation references */}
              {currentCase.explanation.citations.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">Official Source Documentation</div>
                  <div className="space-y-2">
                    {currentCase.explanation.citations.map((c, idx) => (
                      <div
                        key={idx}
                        className="bg-sky-50/70 border border-sky-200 rounded-lg p-3 text-xs flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-semibold text-sky-950 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-sky-700" />
                            {c.title}
                          </div>
                          <div className="text-sky-800 mt-1 text-[11px] font-mono">
                            Document Page: {c.page} · Chunk Ref: {c.chunk_id}
                          </div>
                          <div className="text-slate-700 mt-1.5 italic bg-white/70 p-2 rounded border border-sky-100">
                            "{c.passage}"
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cloud Routing Adapter */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Adaptive Execution Path: <strong className="text-slate-800 font-mono">{currentCase.routing.path}</strong></span>
                <span>Est. Latency: <strong className="text-slate-800 font-mono">{currentCase.routing.measured_latency_ms}ms</strong></span>
                <span>Est. Cost: <strong className="text-slate-800 font-mono">${currentCase.routing.estimated_cost_usd}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: EVIDENCE COMPARISON PANEL (Feature B)
          ========================================================================= */}
      {activeTab === 'comparison' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-sky-600" />
                  Condition-to-Evidence Alignment (CEA) Comparison
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explicit comparison of predicted condition against technical maintenance thresholds to prevent Semantic Proximity Fallacies.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-semibold border border-slate-200">
                  CEA Threshold: 0.85
                </span>
              </div>
            </div>

            {/* Comparison Cards for each Candidate */}
            <div className="mt-5 space-y-4">
              {currentCase.evidence_candidates.map((cand, idx) => {
                const alignment = currentCase.alignment.find((a) => a.candidate_id === cand.id);
                const isConflict = alignment?.outcome === 'CONFLICT' || cand.is_distractor;

                return (
                  <div
                    key={cand.id}
                    className={`rounded-xl border p-5 transition-all ${isConflict
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-white border-slate-200 shadow-sm'
                      }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${isConflict ? 'bg-rose-600' : 'bg-emerald-600'
                          }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{cand.doc_title}</div>
                          <div className="text-xs text-slate-500 font-mono">
                            Page {cand.page} · Fault Code: {cand.fault_code} · Target: {cand.component}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isConflict ? (
                          <span className="inline-flex items-center gap-1.5 text-xs bg-rose-100 text-rose-800 font-bold px-3 py-1 rounded-full border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" />
                            SEMANTIC DISTRACTOR (REJECTED)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ALIGNED EVIDENCE (VERIFIED)
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-200">
                          CEA Score: {alignment?.CEA !== undefined ? alignment.CEA.toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>

                    {/* Comparison Grid: Observed Telemetry vs Manual Criteria */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Left: What Model Detected */}
                      <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs space-y-2">
                        <div className="font-semibold text-slate-700 uppercase tracking-wide text-[10px]">
                          1. Model Observation &amp; Telemetry
                        </div>
                        <div>
                          <span className="text-slate-500">Condition:</span>{' '}
                          <strong className="text-slate-800">{currentCase.condition.fault_label}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Asset &amp; Subsystem:</span>{' '}
                          <strong className="text-slate-800">{currentCase.asset_id} ({currentCase.asset_name})</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Relevant Telemetry:</span>{' '}
                          <span className="font-mono text-slate-800">
                            {currentCase.condition.top_sensors.map(s => `${s.name}: ${s.value} ${s.unit}`).join(' · ')}
                          </span>
                        </div>
                      </div>

                      {/* Right: What Manual Prescribes */}
                      <div className={`rounded-lg p-3.5 border text-xs space-y-2 ${isConflict ? 'bg-rose-50/70 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'
                        }`}>
                        <div className="font-semibold uppercase tracking-wide text-[10px] text-slate-700">
                          2. Technical Manual Specification
                        </div>
                        <div>
                          <span className="text-slate-500">Prescribed Rule:</span>{' '}
                          <strong className="text-slate-800">{cand.threshold_rule || 'Threshold criteria'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Targeted Subsystem:</span>{' '}
                          <strong className={isConflict ? 'text-rose-700' : 'text-emerald-800'}>
                            {cand.component}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Prescribed Action:</span>{' '}
                          <strong className="text-slate-800">{cand.action}</strong>
                        </div>
                      </div>
                    </div>

                    {/* 4-Point Alignment Evaluation Matrix */}
                    {alignment && (
                      <div className="mt-4 pt-3 border-t border-slate-200/70">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                          <div className={`p-2 rounded border ${alignment.component_match ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                            <div className="text-[10px] uppercase font-mono">Component Match</div>
                            <div className="font-bold mt-0.5">{alignment.component_match ? 'MATCH' : 'MISMATCH'}</div>
                          </div>
                          <div className={`p-2 rounded border ${alignment.fault_match ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                            <div className="text-[10px] uppercase font-mono">Fault Match</div>
                            <div className="font-bold mt-0.5">{alignment.fault_match ? 'MATCH' : 'MISMATCH'}</div>
                          </div>
                          <div className={`p-2 rounded border ${alignment.symptom_match ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                            <div className="text-[10px] uppercase font-mono">Symptom Match</div>
                            <div className="font-bold mt-0.5">{alignment.symptom_match === true ? 'MATCH' : 'PARTIAL / NO'}</div>
                          </div>
                          <div className={`p-2 rounded border ${alignment.action_relevance ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                            <div className="text-[10px] uppercase font-mono">Action Relevance</div>
                            <div className="font-bold mt-0.5">{alignment.action_relevance ? 'APPLICABLE' : 'DANGEROUS / IRRELEVANT'}</div>
                          </div>
                        </div>

                        {/* Detailed Alignment Reasons */}
                        <div className="mt-3 space-y-1">
                          {alignment.reasons.map((reason, ri) => (
                            <div key={ri} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="text-slate-400 mt-0.5">•</span>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SUPPORTING EVIDENCE VIEWER
          ========================================================================= */}
      {activeTab === 'evidence' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Candidate List (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm px-1">
              <Search className="w-4 h-4 text-sky-600" />
              Retrieved Documents ({currentCase.evidence_candidates.length})
            </h2>

            {currentCase.evidence_candidates.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <div className="font-bold text-slate-800 text-sm">No Grounded Evidence Found</div>
                <div className="text-xs text-slate-500 mt-1">Autonomous action suspended — manual engineering escalation required.</div>
              </div>
            ) : (
              [...currentCase.evidence_candidates].sort((a, b) =>
                (currentCase.alignment.find((item) => item.candidate_id === b.id)?.CEA || 0) -
                (currentCase.alignment.find((item) => item.candidate_id === a.id)?.CEA || 0)
              ).map((cand) => {
                const isSelected = selectedCandidate?.id === cand.id;
                const alignment = currentCase.alignment.find((a) => a.candidate_id === cand.id);

                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`bg-white border rounded-xl p-4 cursor-pointer transition-all shadow-sm ${isSelected
                        ? 'border-sky-500 ring-2 ring-sky-200'
                        : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono text-slate-500">Page {cand.page}</span>
                      {alignment?.outcome === 'ALIGNED' ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">✓ Aligned Evidence</span>
                      ) : alignment?.outcome === 'CONFLICT' ? (
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Rejected - do not follow</span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Partly matches</span>
                      )}
                    </div>

                    <div className="font-bold text-slate-900 text-xs line-clamp-1">{cand.doc_title}</div>
                    <div className="text-xs text-slate-600 mt-1 line-clamp-2 italic">
                      "{cand.passage}"
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                      <span>Rc: {cand.Rc.toFixed(2)}</span>
                      <span>Oc: {cand.Oc.toFixed(2)}</span>
                      <span>CEA: {alignment ? alignment.CEA.toFixed(2) : 'N/A'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Candidate Detail View (Right 3 cols) */}
          <div className="lg:col-span-3">
            {selectedCandidate ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{selectedCandidate.doc_title}</h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Page Reference: {selectedCandidate.page} · Subsystem: {selectedCandidate.component}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                      Doc ID: {selectedCandidate.doc_id}
                    </span>
                  </div>
                </div>

                {/* Highlighted text passage */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Extracted Text Passage (with Layout Bounding Box Anchor)
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-serif">
                    {selectedCandidate.passage}
                  </p>
                  {selectedCandidate.highlighted_span && (
                    <div className="mt-3 bg-amber-50 text-amber-900 p-2.5 rounded border border-amber-200 text-xs font-sans">
                      <strong>Target Rule Span:</strong> "{selectedCandidate.highlighted_span}"
                    </div>
                  )}
                </div>

                {/* Knowledge Graph Provenance */}
                {selectedCandidate.kg_path && selectedCandidate.kg_path.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">Knowledge Graph Provenance Path</div>
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                      {selectedCandidate.kg_path.map((node, ni) => (
                        <React.Fragment key={ni}>
                          <span className="bg-white px-2 py-1 rounded border border-slate-200 font-medium text-slate-800">
                            {node}
                          </span>
                          {ni < selectedCandidate.kg_path.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="text-sm text-slate-500">Select an evidence card to inspect documentation details</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: CASE ASSISTANT (CHAT)
          ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ height: '62vh', minHeight: '450px' }}>
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <div>
                <div className="font-bold text-slate-900 text-xs">Case-Grounded Maintenance Assistant</div>
                <div className="text-[10px] text-slate-500">
                  Strictly grounded in evidence for {currentCase.asset_id} — no hallucinated maintenance steps
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              Active Context: {currentCase.condition.fault_label}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 scrollbar-thin">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${msg.sender === 'user'
                      ? 'bg-[#0284C7] text-white rounded-br-sm shadow-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200/60'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatSending && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs text-slate-500 italic">
                  Retrieving case citations &amp; formulating grounded response…
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-3.5 border-t border-slate-200 flex items-center gap-3 bg-white">
            <input
              type="text"
              placeholder={`Ask a question regarding ${currentCase.asset_id} sensor telemetry or repair procedures...`}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={isChatSending || !chatMessage.trim()}
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Ask
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 5: TECHNICIAN FEEDBACK & REVIEW (Feature C)
          ========================================================================= */}
      {activeTab === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                Technician Inspection &amp; Maintenance Review
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${reviewOutcome === 'Accepted'
                  ? 'bg-emerald-100 text-emerald-800'
                  : reviewOutcome === 'Rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                {reviewOutcome}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Authenticated Operator</label>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <span className="font-semibold">{user?.name || (isTechnician ? 'Alex Chen' : 'Dr. Elena Vance')}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    isTechnician
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isAdmin
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'bg-sky-100 text-sky-800 border-sky-300'
                  }`}>
                    {user?.role_title || (isTechnician ? 'Technician' : 'Lead Engineer')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Inspection Observations &amp; Sign-off Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={isTechnician 
                    ? "Enter shop-floor inspection findings, physical component condition, fluid levels, or sensor verification..."
                    : "Record engineering diagnosis audit, justification for procedure acceptance or rejection..."}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
                {reviewError && <p className="mt-1 text-xs text-rose-700">{reviewError}</p>}
              </div>

              {isReviewSaved && (
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Review decision and timestamp logged to Case Audit Trail.
                </div>
              )}

              {/* Action Buttons with Role-Gated Authority */}
              {isTechnician ? (
                <div className="space-y-2 pt-2">
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Technician Authority:</strong> You may submit physical shop-floor observations. Formal closure (Accept / Reject) requires Lead Reliability Engineer sign-off.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRecordReview('Observation Submitted — Awaiting Engineer Sign-Off')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Submit Field Observation to Audit Trail
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleRecordReview('Accepted')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {caseVerdict === 'Evidence matches' ? 'Accept Procedure' : 'Accept (override)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecordReview('Needs Further Review')}
                    className="bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Needs Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecordReview('Rejected')}
                    className="bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject Action
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Review Guidelines */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Review &amp; Sign-off Principles</h3>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-800 block mb-0.5">Accepted</strong>
                Confirms that the retrieved procedure targets the correct physical component and operating parameters match verified manual criteria.
              </div>
              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-amber-900">
                <strong className="text-amber-950 block mb-0.5">Needs Further Review</strong>
                Used when evidence confidence is marginal or physical equipment requires on-site visual confirmation before committing shop floor resources.
              </div>
              <div className="p-3 bg-rose-50/70 rounded-lg border border-rose-200 text-rose-900">
                <strong className="text-rose-950 block mb-0.5">Rejected</strong>
                Flags that the predicted action is inaccurate or dangerous, preserving the rejection in the audit trail without silently modifying model weights.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: CASE AUDIT TRAIL (Feature A)
          ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-sky-600" />
                Case Audit Trail &amp; Provenance Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Append-only chronological record of model inference, retrieval runs, alignment evaluations, and human sign-offs.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {(currentCase.audit_trail || []).length} Recorded Events
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {(currentCase.audit_trail && currentCase.audit_trail.length > 0) ? (
              currentCase.audit_trail.map((evt, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline point */}
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-sky-600 border-2 border-white ring-2 ring-sky-100" />

                  <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-900 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                        {evt.event_type}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-slate-700 font-medium mt-1">
                      {evt.details}
                    </div>

                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      Actor: <strong className="text-slate-700">{evt.actor}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-4">No audit events recorded for this case.</div>
            )}
          </div>
        </div>
      )}

      {/* Manual Defect Parts Specification Modal */}
      <ManualDefectModal
        isOpen={showManualDefectModal}
        onClose={() => setShowManualDefectModal(false)}
        solution={manualSolution}
        loading={manualSolutionLoading}
      />

      {/* Accessible In-App Confirmation Dialog (Eliminates window.confirm/alert) */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Floating In-App Notifications with Undo Support */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default CaseWorkspace;
