import React, { useState } from 'react';
import {
  SlidersHorizontal,
  User,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Cloud,
  Info,
  Lock,
  Users,
  Key,
  ShieldCheck,
  Wrench,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'engineer';
  const isAdmin = role === 'admin';
  const isEngineer = role === 'engineer';
  const isTechnician = role === 'technician';

  // Illustrative Defaults / Hypotheses State
  const [wPc, setWPc] = useState(0.35);
  const [wRc, setWRc] = useState(0.25);
  const [wOc, setWOc] = useState(0.15);
  const [wCea, setWCea] = useState(0.25);

  const [tLight, setTLight] = useState(0.85);
  const [tStandard, setTStandard] = useState(0.70);

  const [isSaved, setIsSaved] = useState(false);

  // Admin user management state
  const [userList, setUserList] = useState([
    {
      id: 'usr-eng-01',
      name: 'Dr. Elena Vance',
      email: 'engineer@indusense.ai',
      role: 'engineer',
      role_title: 'Lead Reliability Engineer (Audit Authority)',
      plant: 'Plant 2 — Reliability Cell',
      status: 'Active'
    },
    {
      id: 'usr-tech-01',
      name: 'Alex Chen',
      email: 'technician@indusense.ai',
      role: 'technician',
      role_title: 'Technician (Review Sign-Off)',
      plant: 'Plant 2 — Field Operations',
      status: 'Active'
    },
    {
      id: 'usr-admin-01',
      name: 'Marcus Sterling',
      email: 'admin@indusense.ai',
      role: 'admin',
      role_title: 'System Administrator',
      plant: 'Global Production Cluster',
      status: 'Active'
    }
  ]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePromoteRole = (userId: string, newRole: 'engineer' | 'technician') => {
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role: newRole,
          role_title: newRole === 'engineer' 
            ? 'Lead Reliability Engineer (Audit Authority)' 
            : 'Technician (Review Sign-Off)'
        };
      }
      return u;
    }));
    setActionNotice(`User role updated to ${newRole === 'engineer' ? 'Lead Reliability Engineer' : 'Technician'}.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleResetPassword = (name: string) => {
    setActionNotice(`One-time temporary password generated for ${name}: InduSense${Math.floor(1000 + Math.random() * 9000)}!`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto text-slate-900 pb-10">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings &amp; Role Governance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-gated operator configuration, assigned plant scope, and model reliability hypotheses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
            isTechnician
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : isAdmin
              ? 'bg-purple-50 text-purple-800 border-purple-300'
              : 'bg-sky-50 text-sky-800 border-sky-300'
          }`}>
            {user?.role_title || (isTechnician ? 'Technician' : 'Lead Engineer')}
          </span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* User Profile Card (All Roles) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-sm text-slate-800">Operator Profile &amp; Plant Scope</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Operator Full Name</label>
              <input
                type="text"
                readOnly
                value={user?.name || (isTechnician ? 'Alex Chen' : 'Dr. Elena Vance')}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Plant Work Email</label>
              <input
                type="email"
                readOnly
                value={user?.email || (isTechnician ? 'technician@indusense.ai' : 'engineer@indusense.ai')}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Designated Authority Role</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-bold truncate">{user?.role_title || 'Lead Reliability Engineer'}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">
                Role is cryptographically verified from session token. Modifiable only by System Administrator.
              </p>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Assigned Plant / Facility Scope</label>
              <input
                type="text"
                readOnly={!isAdmin}
                defaultValue={isAdmin ? 'All Plant Facilities (Global Scope)' : 'Plant 2 — Reliability Cell'}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-sans">
                {isAdmin ? 'System Administrator has multi-plant access.' : 'Restricted to Plant 2 telemetry and work orders.'}
              </p>
            </div>
          </div>
        </div>

        {/* ADMIN ONLY: USER MANAGEMENT & ROLE GOVERNANCE */}
        {isAdmin && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-800">User Management &amp; Role Authorization</h3>
              </div>
              <span className="text-[10px] font-mono bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded font-bold uppercase">
                Admin Authority Only
              </span>
            </div>

            <p className="text-xs text-slate-500 font-sans">
              Grant and revoke operational authority between Shop-Floor Technicians and Lead Reliability Engineers.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-left">
                    <th className="pb-2">Operator</th>
                    <th className="pb-2">Assigned Role</th>
                    <th className="pb-2">Plant Scope</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          u.role === 'technician'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : u.role === 'admin'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : 'bg-sky-50 text-sky-800 border-sky-300'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600 text-[11px]">{u.plant}</td>
                      <td className="py-2.5">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right space-x-2">
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handlePromoteRole(u.id, u.role === 'technician' ? 'engineer' : 'technician')}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold border border-slate-300"
                          >
                            Switch to {u.role === 'technician' ? 'Engineer' : 'Technician'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleResetPassword(u.name)}
                          className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300"
                        >
                          Reset Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FUSION WEIGHTS & ROUTER CUTOFFS (Engineer Read-Only / Admin Configurable / Technician Hidden) */}
        {!isTechnician ? (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-800">Multi-Confidence Fusion Weights (Research Hypotheses)</h3>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                isAdmin
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}>
                {isAdmin ? 'Configurable (Admin)' : 'Read-Only (Engineer)'}
              </span>
            </div>

            {!isAdmin && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Engineers view baseline research hypotheses. Weights are modified by System Administrator.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>w_Pc (Condition Confidence Weight):</span>
                  <span className="font-bold">{wPc}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  disabled={!isAdmin}
                  value={wPc}
                  onChange={(e) => setWPc(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 disabled:opacity-50"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>w_Rc (Retrieval Match Weight):</span>
                  <span className="font-bold">{wRc}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  disabled={!isAdmin}
                  value={wRc}
                  onChange={(e) => setWRc(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 disabled:opacity-50"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>w_Oc (Document Quality Weight):</span>
                  <span className="font-bold">{wOc}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  disabled={!isAdmin}
                  value={wOc}
                  onChange={(e) => setWOc(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 disabled:opacity-50"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>w_CEA (Alignment Weight):</span>
                  <span className="font-bold">{wCea}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  disabled={!isAdmin}
                  value={wCea}
                  onChange={(e) => setWCea(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-mono uppercase font-bold text-slate-700 mb-2">
                Cloud Router Dispatch Cutoffs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-600 mb-1">Light Path Trigger Cutoff (&ge;)</label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isAdmin}
                    value={tLight}
                    onChange={(e) => setTLight(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Standard Path Minimum Cutoff (&ge;)</label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isAdmin}
                    value={tStandard}
                    onChange={(e) => setTStandard(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Technician notice for hidden system settings */
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Plant 2 Shop-Floor Technician Authorization</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              As an authorized Shop-Floor Technician, you have full access to inspect real-time sensor telemetry, open OEM defect manuals, and submit physical inspection observations. Advanced cloud router dispatch thresholds and research fusion weights are governed by Lead Reliability Engineers.
            </p>
          </div>
        )}

        {/* Action Save Button (Only if Admin or Engineer with Profile changes) */}
        {isAdmin && (
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs font-mono text-emerald-700">
              {isSaved && <span>&check; Administrative configuration saved successfully</span>}
            </div>
            <button
              type="submit"
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-2.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Configuration</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Settings;
