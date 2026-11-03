import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck, BarChart3, Brain, Activity, Route, Lock, Cpu, CheckCircle2 } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      {/* Left panel - Modern Industrial Intelligence Chrome */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0B132B]">
        {/* Subtle industrial grid and ambient glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415510_1px,transparent_1px),linear-gradient(to_bottom,#33415510_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-10 group">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-[#0284C7] rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-md shadow-sky-900/40 group-hover:scale-105 transition-transform">
              IS
            </div>
            <div>
              <p className="text-white font-bold text-base tracking-tight leading-none group-hover:text-sky-300 transition-colors">
                InduSense
              </p>
              <p className="text-slate-400 text-[10px] font-mono uppercase tracking-wider mt-1">
                Intelligent Industrial Maintenance
              </p>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-mono font-semibold border border-sky-500/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            ABB HACKATHON 2026 // PRODUCTION CLUSTER
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight tracking-tight">
            Confidence-Aware &amp;<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              Evidence-Grounded Maintenance
            </span>
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Unifies predictive sensor inference with technical manual evidence verification. Prevents hallucinations and semantic proximity errors in industrial repair workflows.
          </p>

          <div className="mt-8 space-y-3.5 max-w-lg">
            {[
              {
                icon: Activity,
                title: 'Calibrated Telemetry Inference',
                desc: 'HistGradientBoosting & XGBoost with Isotonic/Platt calibration to prevent overconfident false alarms.',
                accent: 'border-sky-500/30 bg-sky-500/5 text-sky-400'
              },
              {
                icon: ShieldCheck,
                title: 'Condition-Evidence Alignment (CEA)',
                desc: 'Validates that retrieved manual passages strictly match the detected failure mode before repair recommendation.',
                accent: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
              },
              {
                icon: Route,
                title: 'Confidence-Aware Cloud Router',
                desc: 'Dynamic dispatch across deterministic LIGHT, standard hybrid, and multi-agent HEAVY tiers.',
                accent: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400'
              }
            ].map(({ icon: Icon, title, desc, accent }) => (
              <div
                key={title}
                className="flex items-start gap-3.5 bg-slate-900/60 backdrop-blur-xs border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Technical Tag — Clean enterprise security and compliance */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" /> Enterprise Role-Based Access Control
          </span>
          <span className="text-slate-400 font-medium">ABB Industrial Intelligence</span>
        </div>
      </div>

      {/* Right panel — Crisp Modern Analytical Form Container */}
      <div className="flex-1 flex items-center justify-center bg-slate-100 p-6 sm:p-10">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 text-slate-900">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
