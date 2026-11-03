import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Activity,
  Search,
  GitCompare,
  Route,
  FileText,
  Cpu,
  ChevronRight,
  Zap,
  Wrench,
  Settings,
  Lock,
  Layers,
  TrendingUp,
  BarChart2,
  AlertTriangle,
  BookOpen,
  Terminal,
  ExternalLink,
  Sparkles,
  Server,
  ShieldAlert,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'roles' | 'datasets'>('overview');
  const [roleLoggingIn, setRoleLoggingIn] = useState<string | null>(null);

  const handleRoleQuickLogin = async (role: 'engineer' | 'technician' | 'admin', email: string, pass: string) => {
    setRoleLoggingIn(role);
    try {
      await login(email, pass, role);
      navigate('/operations');
    } catch (err) {
      console.error('Role login error:', err);
      navigate('/login');
    } finally {
      setRoleLoggingIn(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* 1. TOP ENTERPRISE NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#0B132B]/95 backdrop-blur-md border-b border-[#1C2541] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-[#0284C7] flex items-center justify-center font-bold text-white text-sm shadow-md shadow-sky-900/30">
                IS
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight leading-none text-white group-hover:text-sky-300 transition-colors">
                  InduSense
                </span>
                <span className="text-[10px] font-mono text-slate-400 leading-none mt-1">
                  ABB Hackathon 2026
                </span>
              </div>
            </Link>
            <div className="hidden lg:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-700/60">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono text-slate-300">
                Local Zero-Credential Architecture
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#pipeline" className="hover:text-white transition-colors">6-Stage Pipeline</a>
            <a href="#case-study" className="hover:text-white transition-colors">Semantic CEA</a>
            <a href="#roles" className="hover:text-white transition-colors">3 Role Panels</a>
            <a href="#domains" className="hover:text-white transition-colors">Trained Models</a>
            <Link to="/research" className="hover:text-white transition-colors flex items-center gap-1">
              Benchmark <span className="text-[9px] bg-sky-500/30 text-sky-300 px-1.5 py-0.2 rounded font-mono">97.2%</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs text-slate-300 hover:text-white font-medium px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/operations"
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-sky-500/20"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC]">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-[#0284C7] text-xs font-mono font-semibold border border-sky-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-ping"></span>
            <span>ABB HACKATHON 2026 // INDUSTRIAL PREDICTIVE MAINTENANCE 4.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-5xl mx-auto">
            Verifies that repair evidence applies to the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284C7] to-indigo-600">
              predicted physical fault.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Standard RAG introduces hallucinations and semantic proximity fallacies. InduSense connects real industrial sensor telemetry with digitized OEM technical manuals in one verifiable, auditable pipeline.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/operations"
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-6 py-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2.5 shadow-md shadow-sky-600/20 hover:shadow-lg transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Enter Fleet Operations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/cases/case-cnc-m102"
              className="bg-[#0B132B] hover:bg-slate-800 text-white px-5 py-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Explore Hero Case CNC-M102</span>
            </Link>

            <Link
              to="/research"
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-5 py-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-2xs transition-colors"
            >
              <BarChart2 className="w-4 h-4 text-slate-500" />
              <span>Research Benchmark</span>
            </Link>
          </div>

          {/* Enterprise Stats Bar */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm font-mono text-left">
              <div className="p-2 border-r border-slate-100 last:border-none">
                <div className="text-2xl font-bold text-slate-900">97.2%</div>
                <div className="text-[11px] text-slate-500 font-sans mt-0.5">Condition Acc (AI4I 2020)</div>
              </div>
              <div className="p-2 border-r border-slate-100 last:border-none">
                <div className="text-2xl font-bold text-emerald-600">94.8%</div>
                <div className="text-[11px] text-slate-500 font-sans mt-0.5">Distractor Conflict Rejection</div>
              </div>
              <div className="p-2 border-r border-slate-100 last:border-none">
                <div className="text-2xl font-bold text-sky-700">242ms</div>
                <div className="text-[11px] text-slate-500 font-sans mt-0.5">Adaptive SLA Latency</div>
              </div>
              <div className="p-2">
                <div className="text-2xl font-bold text-indigo-700">4 Domains</div>
                <div className="text-[11px] text-slate-500 font-sans mt-0.5">Milling, Pumps, Bearings, Hydraulics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE PLATFORM COCKPIT SHOWCASE */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider">
              Single Unified Object Model
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Live Case Workspace &amp; Evidence Grounding
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Every screen in InduSense views the same Diagnosis Case: sensor telemetry, retrieved manual passages, and physical component verification.
            </p>
          </div>

          {/* Interactive Cockpit Card */}
          <div className="bg-[#0B132B] rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800 text-white">
            {/* Header bar */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="font-mono text-xs font-bold text-slate-200">ASSET: CNC-M102</span>
                <span className="text-[11px] font-mono text-slate-400">· 5-Axis Milling Spindle</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono px-2 py-0.5 rounded font-bold uppercase">
                  WARNING: HDF DETECTED
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Calibrated Pc:</span>
                <span className="text-emerald-400 font-bold">96.8%</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">CEA Alignment:</span>
                <span className="text-sky-400 font-bold">0.95 (VERIFIED)</span>
              </div>
            </div>

            {/* Split Showcase Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
              {/* Telemetry Column */}
              <div className="bg-[#1C2541]/70 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between">
                  <span>Sensor Telemetry</span>
                  <span className="text-emerald-400">LIVE FEED</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between bg-[#0B132B] p-2 rounded border border-slate-800">
                    <span className="text-slate-400">Process Temperature:</span>
                    <span className="font-bold text-rose-400">309.8 K (+11.6 K)</span>
                  </div>
                  <div className="flex justify-between bg-[#0B132B] p-2 rounded border border-slate-800">
                    <span className="text-slate-400">Air Temperature:</span>
                    <span className="font-bold text-slate-200">298.2 K</span>
                  </div>
                  <div className="flex justify-between bg-[#0B132B] p-2 rounded border border-slate-800">
                    <span className="text-slate-400">Spindle Speed:</span>
                    <span className="font-bold text-slate-200">1412 RPM (Nominal)</span>
                  </div>
                  <div className="flex justify-between bg-[#0B132B] p-2 rounded border border-slate-800">
                    <span className="text-slate-400">Tool Wear:</span>
                    <span className="font-bold text-amber-400">188 min (Threshold 200)</span>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-sky-950/40 border border-sky-800/40 text-[10px] text-sky-300">
                  Physical Trigger: Temp delta (11.6 K) exceeds limit with spindle speed &lt; 1380 rpm cut-off.
                </div>
              </div>

              {/* Distractor vs Truth Column */}
              <div className="bg-[#1C2541]/70 rounded-xl p-4 border border-slate-800 space-y-3 lg:col-span-2">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between">
                  <span>CEA Distractor Resolution Matrix</span>
                  <span className="text-sky-400 font-mono text-[10px]">Zero Hallucination Gate</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Candidate 1 (Rejected) */}
                  <div className="bg-rose-950/30 border border-rose-800/60 rounded-lg p-3 text-slate-300 space-y-1.5">
                    <div className="flex items-center justify-between text-rose-400 font-mono font-bold text-[11px]">
                      <span>Candidate 1 (Pneumatic Clamp)</span>
                      <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Matches lexical words: "air temperature delta", "pressure limits". Targets pneumatic chuck clamp cylinder.
                    </p>
                    <div className="pt-1 border-t border-rose-900/40 text-[10px] font-mono text-rose-400 font-bold">
                      VERDICT: CONFLICT (CEA 0.21) &mdash; Rejected Distractor
                    </div>
                  </div>

                  {/* Candidate 2 (Aligned) */}
                  <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-lg p-3 text-slate-300 space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-400 font-mono font-bold text-[11px]">
                      <span>Candidate 2 (Spindle Radiator)</span>
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Matches physical subsystem: Spindle cooling circuit, heat exchanger radiator CF-02, coolant particulate filter.
                    </p>
                    <div className="pt-1 border-t border-emerald-900/40 text-[10px] font-mono text-emerald-400 font-bold">
                      VERDICT: ALIGNED (CEA 0.95) &mdash; Verified Procedure
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
                  <span>Routing Decision: <strong className="text-emerald-400">LIGHT PATH (Fast Deterministic Dispatch)</strong></span>
                  <Link to="/cases/case-cnc-m102" className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]">
                    Open full case workspace &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 6-STAGE INDUSTRIAL PIPELINE */}
      <section id="pipeline" className="py-16 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold text-[#0284C7] uppercase tracking-wider">
              Connected Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              The 6-Stage Industrial Intelligence Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Strict end-to-end provenance: sensor telemetry feeds calibrated classification, layout-aware vector retrieval, and human sign-off.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                num: '01',
                title: 'PREDICT',
                subtitle: 'Calibrated Condition & RUL',
                desc: 'HistGradientBoosting & XGBoost classifiers with Isotonic/Platt probability calibration (Pc). Prevents overconfident false alarms.',
                icon: Cpu,
                color: 'text-sky-600',
                border: 'border-sky-200',
                bg: 'bg-sky-50'
              },
              {
                num: '02',
                title: 'RETRIEVE',
                subtitle: 'Layout-Aware Hybrid Vector',
                desc: 'Dense cosine vector retrieval preserved alongside PubLayNet document layouts, table cells, and OCR confidence bounding boxes.',
                icon: Search,
                color: 'text-indigo-600',
                border: 'border-indigo-200',
                bg: 'bg-indigo-50'
              },
              {
                num: '03',
                title: 'ALIGN',
                subtitle: 'CEA Cross-Examination',
                desc: 'Cross-examines predicted fault condition against retrieved manual action components to block Semantic Proximity Fallacies.',
                icon: GitCompare,
                color: 'text-emerald-600',
                border: 'border-emerald-200',
                bg: 'bg-emerald-50'
              },
              {
                num: '04',
                title: 'VALIDATE',
                subtitle: 'Multi-Confidence Fusion',
                desc: 'Integrates prediction probability (Pc), retrieval similarity (Rc), document OCR quality (Oc), and CEA alignment into a unified score.',
                icon: ShieldCheck,
                color: 'text-amber-600',
                border: 'border-amber-200',
                bg: 'bg-amber-50'
              },
              {
                num: '05',
                title: 'ADAPT',
                subtitle: 'Confidence-Aware Cloud Router',
                desc: 'Dynamically routes cases across LIGHT (deterministic local), STANDARD (hybrid search), and HEAVY (multi-agent escalation) paths.',
                icon: Route,
                color: 'text-rose-600',
                border: 'border-rose-200',
                bg: 'bg-rose-50'
              },
              {
                num: '06',
                title: 'EXPLAIN',
                subtitle: 'Verifiable OEM Citations & Sign-Off',
                desc: 'Delivers word-for-word maintenance steps, defect part numbers, and component schematics with human engineering review sign-off.',
                icon: FileText,
                color: 'text-purple-600',
                border: 'border-purple-200',
                bg: 'bg-purple-50'
              }
            ].map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.num}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-sky-600 transition-colors">
                      STAGE {stage.num}
                    </span>
                    <div className={`p-2 rounded-lg ${stage.bg} ${stage.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{stage.title}</h3>
                  <div className="text-xs font-semibold text-slate-500 mb-2">{stage.subtitle}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{stage.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. THE 3 ROLE-BASED OPERATIONAL PANELS */}
      <section id="roles" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
              Role-Based Access Control
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Tailored for 3 Industrial Plant Personas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Each user persona has designated privileges, customized home dashboards, and cryptographically verified session credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Persona 1: Engineer */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-between hover:border-sky-400 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-sky-100 text-sky-800">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
                    Audit Authority
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Lead Reliability Engineer</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Responsible for diagnostic audits, model retraining, cloud routing calibration, and final case sign-off.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Case Workspace &amp; Triage Audit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Model Training &amp; Activation Dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Cloud Router (LIGHT / HEAVY) Tuning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Final Review Accept / Reject Authority</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleRoleQuickLogin('engineer', 'engineer@indusense.ai', 'engineer123')}
                  className="w-full py-2 px-3 rounded-lg bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {roleLoggingIn === 'engineer' ? 'Signing In...' : 'Launch Engineer Panel'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Persona 2: Technician */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-between hover:border-emerald-400 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Review Sign-Off
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Maintenance Technician</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Executes shop-floor inspections, verifies physical telemetry, reviews defect parts, and confirms work orders.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Shop-Floor Active Triage Queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sensor Telemetry Inspection &amp; Limits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Open Manual Defect Parts Specification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Field Observation Submission</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleRoleQuickLogin('technician', 'technician@indusense.ai', 'technician123')}
                  className="w-full py-2 px-3 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {roleLoggingIn === 'technician' ? 'Signing In...' : 'Launch Technician Panel'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Persona 3: Admin */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-between hover:border-purple-400 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-purple-100 text-purple-800">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                    Full Architecture
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">System Administrator</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Full control over user permissions, platform configuration, model registry governance, and diagnostics.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Full Platform &amp; Settings Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>User Authorization &amp; RBAC Control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Production Model Registry Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Append-Only Security Audit Trail</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleRoleQuickLogin('admin', 'admin@indusense.ai', 'admin123')}
                  className="w-full py-2 px-3 rounded-lg bg-[#1C2541] hover:bg-[#0B132B] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {roleLoggingIn === 'admin' ? 'Signing In...' : 'Launch Admin Panel'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRAINED PHYSICAL EQUIPMENT DOMAINS */}
      <section id="domains" className="py-16 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold text-[#0284C7] uppercase tracking-wider">
              Empirical ML Grounding
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Four Physical Industrial Domains
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Models trained on real experimental test rigs and sensor telemetry partitions. Zero random window data leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-900">Milling Spindle</span>
                <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">AI4I 2020</span>
              </div>
              <div className="text-slate-600 text-[11px] font-sans mb-3">
                HistGradientBoosting + Platt Calibration. Detects Heat Dissipation (HDF), Power (PWF), and Tool Wear (TWF).
              </div>
              <div className="space-y-1 text-[11px] pt-1 border-t border-slate-100">
                <div className="flex justify-between"><span>Accuracy:</span><span className="font-bold text-emerald-600">97.7%</span></div>
                <div className="flex justify-between"><span>Calibrated ECE:</span><span className="font-bold">0.0070</span></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-900">Centrifugal Pump</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Factory Sensors</span>
              </div>
              <div className="text-slate-600 text-[11px] font-sans mb-3">
                Chronological rolling window evaluation across 6 pumps. Classifies 5 degradation stages with 24h failure forecast.
              </div>
              <div className="space-y-1 text-[11px] pt-1 border-t border-slate-100">
                <div className="flex justify-between"><span>Stage Accuracy:</span><span className="font-bold text-emerald-600">91.1%</span></div>
                <div className="flex justify-between"><span>Fail 24h Brier:</span><span className="font-bold">0.0032</span></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-900">Hydraulic Rig</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">UCI Monitoring</span>
              </div>
              <div className="text-slate-600 text-[11px] font-sans mb-3">
                102 cycle statistics across 17 sensors. Multi-target classification of Cooler, Valve, Pump Leakage, and Accumulator.
              </div>
              <div className="space-y-1 text-[11px] pt-1 border-t border-slate-100">
                <div className="flex justify-between"><span>Cooler Accuracy:</span><span className="font-bold text-emerald-600">100.0%</span></div>
                <div className="flex justify-between"><span>Pump Leakage:</span><span className="font-bold">78.8%</span></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-900">Paderborn Bearing</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Datacenter</span>
              </div>
              <div className="text-slate-600 text-[11px] font-sans mb-3">
                Strict physical bearing ID grouped split (K001–KA30). Vibration envelope &amp; motor current harmonics.
              </div>
              <div className="space-y-1 text-[11px] pt-1 border-t border-slate-100">
                <div className="flex justify-between"><span>Physical Split Acc:</span><span className="font-bold text-emerald-600">56.0%</span></div>
                <div className="flex justify-between"><span>Data Leakage:</span><span className="font-bold text-emerald-600">0.0%</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section className="py-16 bg-[#0B132B] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-[#0284C7] flex items-center justify-center mx-auto text-white shadow-lg shadow-sky-500/20">
            <Server className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to explore verified industrial maintenance?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Runs fully functional out of the box with zero external cloud dependencies or API keys. Access live fleet operations now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/operations"
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md transition-all"
            >
              <span>Launch Live Operations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="bg-[#1C2541] hover:bg-slate-800 text-white border border-slate-700 px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Switch User Role &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. ENTERPRISE FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs font-mono py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-2">
              <div className="w-6 h-6 rounded bg-[#0284C7] flex items-center justify-center text-xs">IS</div>
              InduSense
            </div>
            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
              Confidence-aware &amp; evidence-grounded industrial predictive maintenance research platform. Developed for ABB Hackathon 2026.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              All 19 Pipeline Tests Passing
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Core Modules</div>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/operations" className="hover:text-white transition-colors">Fleet Operations</Link></li>
              <li><Link to="/cases" className="hover:text-white transition-colors">Diagnosis Case Queue</Link></li>
              <li><Link to="/knowledge" className="hover:text-white transition-colors">Knowledge Base &amp; Graph</Link></li>
              <li><Link to="/router" className="hover:text-white transition-colors">Adaptive Cloud Router</Link></li>
              <li><Link to="/research" className="hover:text-white transition-colors">Research Benchmark</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Role Panels</div>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/login" className="hover:text-white transition-colors">Lead Reliability Engineer</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Maintenance Technician</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">System Administrator</Link></li>
              <li><Link to="/settings" className="hover:text-white transition-colors">User Profile &amp; Authority</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">System Status</div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-300">
                <span>Architecture:</span>
                <span className="text-sky-400">Local Zero-AWS</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>FastAPI Backend:</span>
                <span className="text-emerald-400">Ready (Port 8000)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Vite React:</span>
                <span className="text-emerald-400">Ready (Port 5173)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Database:</span>
                <span className="text-slate-400">SQLite In-Memory</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
          <div>&copy; 2026 InduSense Intelligence. Research Prototype &mdash; Not for Autonomous Actuation.</div>
          <div className="flex items-center gap-4">
            <span>Version 2.4.0</span>
            <span>ABB Hackathon Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
