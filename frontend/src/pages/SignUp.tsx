import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  User, 
  AlertCircle, 
  ShieldCheck, 
  Wrench, 
  Settings,
  Building,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignUp: React.FC = () => {
  const { signup, error, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plant, setPlant] = useState('Plant 2 — Reliability Cell');
  const [loading, setLoading] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalErr(null);
    clearError();

    try {
      const success = await signup(name, email, password);
      if (success) {
        setSubmitted(true);
      }
    } catch (err: any) {
      setLocalErr(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const displayError = localErr || error;

  if (submitted) {
    return (
      <div className="w-full text-slate-900 space-y-4">
        <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50">
          <h2 className="text-xl font-bold text-emerald-900">Request received</h2>
          <p className="text-xs text-emerald-800 mt-2">Your Technician account is pending Admin approval. You will be able to sign in once access is approved.</p>
        </div>
        <Link to="/login" className="block text-center text-sky-700 text-xs font-semibold hover:underline">Return to sign in</Link>
      </div>
    );
  }

  return (
    <div className="w-full text-slate-900 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
            Industrial Access Management
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create InduSense Operator Account</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Register with your designated plant authority role to access diagnostic pipelines.
        </p>
      </div>

      {displayError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{displayError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name &amp; Title
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Elena Vance"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Plant Work Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@indusense.ai"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white font-mono"
            />
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          New accounts are created as <strong>Technician</strong> and remain pending until an Admin approves access.
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Facility / Production Line
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Secure Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white font-mono"
            />
          </div>
          <div className="mt-1 h-1.5 rounded bg-slate-200 overflow-hidden">
            <div className={`h-full transition-all ${password.length >= 12 ? 'w-full bg-emerald-500' : password.length >= 8 ? 'w-2/3 bg-amber-500' : password.length >= 4 ? 'w-1/3 bg-rose-500' : 'w-0'}`} />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Use at least 8 characters; 12+ is recommended.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded text-xs font-semibold transition-colors shadow-sm disabled:opacity-70 mt-2"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Register &amp; Access Industrial Workspace <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
        <span>Already have an authorized ID?</span>
        <Link to="/login" className="text-[#0284C7] font-semibold hover:underline">
          Sign In &rarr;
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
