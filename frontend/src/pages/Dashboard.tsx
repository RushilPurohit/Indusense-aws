import React from 'react';
import MetricsRow from '../components/dashboard/MetricsRow';
import RecentActivity from '../components/dashboard/RecentActivity';
import MachineHealthOverview from '../components/dashboard/MachineHealthOverview';
import RecentQuestions from '../components/dashboard/RecentQuestions';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, Technician.</h1>
          <p className="text-slate-500 text-sm mt-0.5">{today} · Shift A active</p>
        </div>
        <Link
          to="/assistant"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          Ask AI Assistant <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Critical alert banner */}
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5">
        <div className="w-8 h-8 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800">Critical Alert — Pump-Sys-B</p>
          <p className="text-xs text-red-600 mt-0.5">Vibration fault detected · Bearing replacement recommended · 1 day ago</p>
        </div>
        <Link to="/machine-health" className="shrink-0 text-xs font-semibold text-red-700 hover:text-red-900 flex items-center gap-1">
          Diagnose <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI metrics */}
      <MetricsRow />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="lg:col-span-3">
          <MachineHealthOverview />
        </div>
      </div>

      {/* Recent queries */}
      <RecentQuestions />
    </div>
  );
};

export default Dashboard;
