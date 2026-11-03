import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Engineer', email: 'engineer@indusense.ai', password: 'engineer123' },
  { label: 'Technician', email: 'technician@indusense.ai', password: 'technician123' },
  { label: 'Admin', email: 'admin@indusense.ai', password: 'admin123' },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();
  const demoMode = import.meta.env.VITE_INDUSENSE_MODE === 'demo';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    setLoading(true);
    try {
      if (await login(email, password)) navigate('/operations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-slate-900 space-y-5">
      <div>
        <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
          ABB Industrial Gateway
        </span>
        <h2 className="text-2xl font-bold mt-2">Sign in to InduSense</h2>
        <p className="text-xs text-slate-500 mt-1">Research prototype - not for live maintenance decisions.</p>
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded text-xs flex gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

      <form onSubmit={submit} className="space-y-3">
        <label className="block text-xs font-semibold">Account email
          <div className="relative mt-1"><Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs" placeholder="operator@indusense.ai" />
          </div>
        </label>
        <label className="block text-xs font-semibold">Password
          <div className="relative mt-1"><Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded text-xs" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-2.5 text-slate-400" aria-label="Toggle password visibility">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </label>
        <button disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold disabled:opacity-70">
          {loading ? 'Signing in…' : <>Sign in <ArrowRight className="w-3.5 h-3.5" /></>}
        </button>
      </form>

      {demoMode && (
        <details open={showDemo} onToggle={(event) => setShowDemo(event.currentTarget.open)} className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-xs">
          <summary className="cursor-pointer font-semibold text-amber-900">Demo accounts <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px]">Demo</span></summary>
          <div className="mt-2 space-y-1.5">
            {DEMO_ACCOUNTS.map((account) => <button key={account.email} type="button" onClick={() => { setEmail(account.email); setPassword(account.password); }} className="block text-left text-amber-900 hover:underline">{account.label}: {account.email}</button>)}
          </div>
        </details>
      )}

      <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
        Need access? <Link to="/signup" className="text-sky-700 font-semibold hover:underline">Request an operator account</Link>
      </div>
    </div>
  );
};

export default Login;
